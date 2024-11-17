<!-- BookmarkList.svelte -->
<script lang="ts">
    export let bookmarks: any[] = [];
    export let loading: boolean = false;
    export let openModal: (bookmark: any) => void;
    export let DUMMY_IMAGE: string;
    export let formatDate: (timestamp: any) => string;
</script>

{#if loading}
    <div class="text-center text-text-secondary">Loading bookmarks...</div>
{:else if bookmarks.length === 0}
    <div class="text-center text-text-secondary">No bookmarks found</div>
{:else}
    <div class="grid grid-cols-1 gap-6">
        {#each bookmarks as bookmark}
            <div 
                class="bg-background-surface rounded-lg border border-border-color overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02] flex h-32"
                on:click={() => openModal(bookmark)}
                on:keypress={() => openModal(bookmark)}
                role="button"
                tabindex="0"
            >
                <div class="w-48 h-full flex-shrink-0 overflow-hidden">
                    <img
                        src={bookmark.metadataImage || DUMMY_IMAGE}
                        alt={"Bookmark"}
                        class="w-full h-full object-cover"
                    />
                </div>
                <div class="p-4 flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-text-primary truncate">
                            {bookmark.metadataTitle || bookmark.title || "Untitled"}
                        </h3>
                        {#if bookmark.metadataDescription}
                            <p class="text-text-secondary text-sm mt-1 line-clamp-2">
                                {bookmark.metadataDescription}
                            </p>
                        {/if}
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <div class="text-xs text-text-secondary truncate">
                            {formatDate(bookmark.createdAt)}
                        </div>
                        <div class="flex gap-2">
                            {#if bookmark.isArchived}
                                <span class="px-2 py-0.5 bg-overlay-hover rounded-full text-xs">Archived</span>
                            {/if}
                            {#if bookmark.isPermanent}
                                <span class="px-2 py-0.5 bg-overlay-hover rounded-full text-xs">Important</span>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if}
