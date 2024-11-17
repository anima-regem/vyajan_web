<script lang="ts">
    import { onMount } from "svelte";
    import { onAuthStateChanged } from "firebase/auth";
    import { auth } from "$lib/firebase";
    import BookmarkList from "$lib/components/BookmarkList.svelte";
    import { bookmarkStore } from "$lib/stores/bookmarkStore";

    let selectedBookmark: any = null;
    let showModal = false;
    const DUMMY_IMAGE = "https://placehold.co/600x400/1e1e1e/ffffff?text=No+Image";

    $: ({ bookmarks, loading } = $bookmarkStore);

    onMount(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                bookmarkStore.loadArchived();
            }
        });

        return () => unsubscribe();
    });

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
</script>

<div class="space-y-6">
    <h1 class="text-2xl font-bold">Archived Bookmarks</h1>
    
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
                                on:click={() => {
                                    // TODO: Add unarchive functionality
                                }}
                            >
                                Unarchive
                            </button>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}
