<script lang="ts">
    import '../app.css';
    import { goto } from '$app/navigation';
    import { auth } from '$lib/firebase';
    import { browser } from '$app/environment';
    import { page } from "$app/stores";
    import { bookmarkStore } from '$lib/stores/bookmarkStore';
    import { onMount } from 'svelte';

    let { children } = $props();

    const navItems = [
        { href: '/home', label: 'All Bookmarks', icon: '📚' },
        { href: '/archived', label: 'Archived', icon: '🗄️' },
        { href: '/important', label: 'Important', icon: '⭐' }
    ];

    onMount(() => {
        if (!browser) return;

        return auth.onAuthStateChanged((user) => {
            if (!user && !$page.url.pathname.startsWith('/auth')) {
                goto('/auth');
            } else if (user && $page.url.pathname === '/') {
                goto('/home');
            }
        });
    });
</script>

<div class="min-h-screen bg-background-primary text-text-primary">
    <nav class="bg-background-surface border-b border-border-color sticky top-0 z-40">
        <div class="container mx-auto px-4">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center space-x-8">
                    <a href="/home" class="text-xl font-bold flex items-center space-x-2">
                        <span class="text-2xl">📑</span>
                        <span>Vyajan</span>
                    </a>
                    <div class="flex space-x-4">
                        {#each navItems as item}
                            <a 
                                href={item.href}
                                class="px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors
                                    {$page.url.pathname === item.href ? 
                                        'bg-primary-dark text-text-primary' : 
                                        'text-text-secondary hover:text-text-primary hover:bg-background-hover'}"
                            >
                                <span class="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </a>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <main class="container mx-auto py-6 px-4">
        {@render children()}
    </main>
</div>

<style>
    :global(body) {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    }
</style>
