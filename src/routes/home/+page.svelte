<script lang="ts">
    import { db, auth } from "$lib/firebase";
    import { addDoc, collection, Timestamp } from "firebase/firestore";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { onAuthStateChanged } from "firebase/auth";
    import BookmarkList from "$lib/components/BookmarkList.svelte";
    import { bookmarkStore } from "$lib/stores/bookmarkStore";

    let url = "";
    let selectedBookmark: any = null;
    let showModal = false;
    let currentUser = null;

    const DUMMY_IMAGE = "https://placehold.co/600x400/1e1e1e/ffffff?text=No+Image";

    $: ({ bookmarks, loading } = $bookmarkStore);

    onMount(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                bookmarkStore.loadAll();
            }
        });

        return () => unsubscribe();
    });

    // Function to handle URL paste
    function handleFocus(event: { target: { select: () => void; }; }) {
        if (browser) {
            navigator.clipboard.readText().then(text => {
                if (text.startsWith('http')) {
                    url = text;
                    event.target.select();
                }
            }).catch(err => {
                console.error('Failed to read clipboard:', err);
            });
        }
    }

    // Function to add new bookmark
    async function addBookmark() {
        if (!url || !currentUser) return;

        try {
            await addDoc(collection(db, "links"), {
                url,
                userId: currentUser.uid,
                createdAt: Timestamp.now(),
                isArchived: false,
                isPermanent: false,
                metadataTitle: "",
                metadataDescription: "",
                metadataImage: "",
                title: ""
            });
            
            url = "";
            await bookmarkStore.loadAll();
        } catch (error) {
            console.error("Error adding bookmark:", error);
        }
    }

    function formatDate(timestamp: { toDate: () => any; }) {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });
    }

    function openModal(bookmark: any) {
        selectedBookmark = bookmark;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        selectedBookmark = null;
    }

    async function handleArchive(bookmarkId: string) {
        await bookmarkStore.toggleArchived(bookmarkId);
        closeModal();
    }

    async function handleImportant(bookmarkId: string) {
        await bookmarkStore.toggleImportant(bookmarkId);
        closeModal();
    }
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && closeModal()}/>

<div class="space-y-6">
    <div class="bg-background-surface rounded-lg p-6 border border-border-color">
        <h1 class="text-2xl font-bold mb-6">Add New Bookmark</h1>
        <div class="flex gap-4">
            <input
                type="url"
                bind:value={url}
                placeholder="Paste your URL here"
                class="flex-1 p-3 border rounded-lg bg-background-primary text-text-primary border-border-color focus:outline-none focus:border-primary-dark"
                on:focus={handleFocus}
            />
            <button
                on:click={addBookmark}
                class="px-6 py-3 bg-primary-dark hover:bg-primary-light text-text-primary rounded-lg transition-colors flex items-center space-x-2"
                disabled={!url}
            >
                <span class="text-xl">➕</span>
                <span>Add</span>
            </button>
        </div>
    </div>

    <BookmarkList 
        {bookmarks}
        {loading}
        {openModal}
        {DUMMY_IMAGE}
        {formatDate}
    />
</div>

<!-- Modal -->
{#if showModal}
    <div 
        class="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
        on:click={closeModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
    >
        <div 
            class="bg-background-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            on:click|stopPropagation={() => {}}
        >
            <div class="p-6">
                {#if selectedBookmark}
                    <div class="relative">
                        <button
                            class="absolute -top-2 -right-2 p-2 text-text-secondary hover:text-text-primary bg-background-surface rounded-full border border-border-color"
                            on:click={closeModal}
                            aria-label="Close modal"
                        >
                            ✕
                        </button>
                        <img
                            src={selectedBookmark.metadataImage || DUMMY_IMAGE}
                            alt={"Bookmark preview"}
                            class="w-full h-64 object-cover rounded-lg mb-4"
                        />
                        <h2 id="modal-title" class="text-xl font-bold text-text-primary mb-4">
                            {selectedBookmark.metadataTitle || selectedBookmark.title || "Untitled"}
                        </h2>
                        {#if selectedBookmark.metadataDescription}
                            <p class="text-text-secondary mb-4">
                                {selectedBookmark.metadataDescription}
                            </p>
                        {/if}
                        <div class="flex gap-2 mb-4">
                            {#if selectedBookmark.isArchived}
                                <span class="px-3 py-1 bg-overlay-hover rounded-full text-sm">Archived</span>
                            {/if}
                            {#if selectedBookmark.isPermanent}
                                <span class="px-3 py-1 bg-overlay-hover rounded-full text-sm">Important</span>
                            {/if}
                        </div>
                        <div class="text-sm text-text-secondary mb-4">
                            {formatDate(selectedBookmark.createdAt)}
                        </div>
                        <div class="flex space-x-4">
                            <a
                                href={selectedBookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex-1 px-4 py-2 bg-primary-dark hover:bg-primary-light text-text-primary rounded-lg transition-colors text-center"
                            >
                                Open Link
                            </a>
                            <button
                                class="px-4 py-2 bg-background-hover hover:bg-background-surface text-text-primary rounded-lg transition-colors border border-border-color"
                                on:click={() => handleArchive(selectedBookmark.id)}
                            >
                                {selectedBookmark.isArchived ? 'Unarchive' : 'Archive'}
                            </button>
                            <button
                                class="px-4 py-2 bg-background-hover hover:bg-background-surface text-text-primary rounded-lg transition-colors border border-border-color"
                                on:click={() => handleImportant(selectedBookmark.id)}
                            >
                                {selectedBookmark.isPermanent ? 'Remove from Important' : 'Mark as Important'}
                            </button>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>