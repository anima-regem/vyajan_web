<script lang="ts">
    import { auth } from "$lib/firebase";
    import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';

    async function signInWithGoogle() {
        if (!browser) {console.log('Not in browser'); return;}
        
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            if (user) {
                console.log('User signed in:', user);
                goto('/');
            }
        } catch (error) {
            console.error('Authentication error:', error);
        }
    }
</script>

<svelte:head>
    <title>Auth</title>
</svelte:head>

<main class="container mx-auto h-screen flex flex-col justify-center items-center">
    <h1 class="text-3xl font-bold underline">വ്യാജൻ</h1>
    <button class="btn btn-primary m-10 p-4 flex items-center flex-row justify-center my-button rounded-full" on:click={signInWithGoogle}>
        <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81" />
        </svg>
        Continue with Google
    </button>
</main>

<style>
  .my-button {
    background-color: var(--primary-dark);
    color: var(--text-primary);
  }
  
  .my-button:hover {
    background-color: var(--primary-light);
  }
</style>