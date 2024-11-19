<!-- BookmarkList.svelte -->
<script lang="ts">
    import RefreshMetadata from './RefreshMetadata.svelte';
    import { createEventDispatcher } from 'svelte';

    export let bookmarks: any[] = [];
    export let loading: boolean = false;
    export let openModal: (bookmark: any) => void;
    export let DUMMY_IMAGE: string;
    export let formatDate: (timestamp: any) => string;

    const dispatch = createEventDispatcher();

    function handleMetadataSuccess(message: string) {
        dispatch('success', { message });
    }

    function handleMetadataError(message: string) {
        dispatch('error', { message });
    }
</script>

{#if loading}
    <div class="text-center text-text-secondary">Loading bookmarks...</div>
{:else if bookmarks.length === 0}
    <div class="text-center text-text-secondary">No bookmarks found</div>
{:else}
    <div class="grid grid-cols-1 gap-6">
        {#each bookmarks as bookmark}
            <div class="bg-background-surface rounded-lg border border-border-color overflow-hidden flex h-32">
                <div 
                    class="flex-1 flex cursor-pointer transform transition-transform hover:scale-[1.02]"
                    on:click={() => openModal(bookmark)}
                    on:keypress={() => openModal(bookmark)}
                    role="button"
                    tabindex="0"
                >
                    <div class="w-48 h-full flex-shrink-0 overflow-hidden">
                        <img
                            src={bookmark.metadata?.metadataImage || DUMMY_IMAGE}
                            alt={"Bookmark"}
                            class="w-full h-full object-cover"
                        />
                    </div>
                    <div class="p-4 flex-1 min-w-0 flex flex-col justify-between">
                        <div class="space-y-1 overflow-hidden">
                            <h3 class="text-lg font-semibold text-text-primary truncate">
                                {bookmark.metadata?.metadataTitle || bookmark.title || 'Untitled'}
                            </h3>
                            <p class="text-sm text-text-secondary line-clamp-2">
                                {bookmark.metadata?.metadataDescription || 'No description available'}
                            </p>
                        </div>
                        <div class="flex items-center justify-between text-xs text-text-secondary">
                            <span>{formatDate(bookmark.createdAt)}</span>
                            {#if bookmark.isPermanent}
                                <span class="inline-flex items-center px-2 py-1 rounded-full bg-primary-dark text-text-primary">
                                    Important
                                </span>
                            {/if}
                        </div>
                    </div>
                </div>
                <div class="flex items-start p-2">
                    <RefreshMetadata
                        linkId={bookmark.id}
                        url={bookmark.url}
                        on:success={({ detail }) => handleMetadataSuccess(detail.message)}
                        on:error={({ detail }) => handleMetadataError(detail.message)}
                    />
                </div>
            </div>
        {/each}
    </div>
{/if}
