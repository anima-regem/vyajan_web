import { writable, get } from 'svelte/store';
import { db, auth } from '$lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { fetchMetadata } from '$lib/services/metadata';

interface Bookmark {
    id: string;
    url: string;
    userId: string;
    createdAt: Timestamp;
    isArchived: boolean;
    isPermanent: boolean;
    metadataTitle?: string;
    metadataDescription?: string;
    metadataImage?: string;
    title?: string;
}

interface BookmarkStore {
    bookmarks: Bookmark[];
    loading: boolean;
}

function createBookmarkStore() {
    const { subscribe, set, update } = writable<BookmarkStore>({
        bookmarks: [],
        loading: false
    });

    return {
        subscribe,
        loadAll: async () => {
            const user = auth.currentUser;
            if (!user) return;

            update(state => ({ ...state, loading: true }));

            try {
                const q = query(
                    collection(db, "links"),
                    where("userId", "==", user.uid),
                    where("isArchived", "==", false)
                );

                const querySnapshot = await getDocs(q);
                const bookmarks = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Bookmark[];

                set({ bookmarks, loading: false });
            } catch (error) {
                console.error("Error loading bookmarks:", error);
                set({ bookmarks: [], loading: false });
            }
        },
        loadArchived: async () => {
            const user = auth.currentUser;
            if (!user) return;

            update(state => ({ ...state, loading: true }));

            try {
                const q = query(
                    collection(db, "links"),
                    where("userId", "==", user.uid),
                    where("isArchived", "==", true)
                );

                const querySnapshot = await getDocs(q);
                const bookmarks = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Bookmark[];

                set({ bookmarks, loading: false });
            } catch (error) {
                console.error("Error loading archived bookmarks:", error);
                set({ bookmarks: [], loading: false });
            }
        },
        loadImportant: async () => {
            const user = auth.currentUser;
            if (!user) return;

            update(state => ({ ...state, loading: true }));

            try {
                const q = query(
                    collection(db, "links"),
                    where("userId", "==", user.uid),
                    where("isPermanent", "==", true)
                );

                const querySnapshot = await getDocs(q);
                const bookmarks = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Bookmark[];

                set({ bookmarks, loading: false });
            } catch (error) {
                console.error("Error loading important bookmarks:", error);
                set({ bookmarks: [], loading: false });
            }
        },
        addBookmark: async (url: string) => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                // Fetch metadata first
                const metadata = await fetchMetadata(url);

                // Create the bookmark with metadata
                const bookmark = {
                    url,
                    userId: user.uid,
                    createdAt: Timestamp.now(),
                    isArchived: false,
                    isPermanent: false,
                    metadataTitle: metadata.title,
                    metadataDescription: metadata.description,
                    metadataImage: metadata.image
                };

                const docRef = await addDoc(collection(db, "links"), bookmark);
                
                // Update the store
                update(state => ({
                    ...state,
                    bookmarks: [{
                        id: docRef.id,
                        ...bookmark
                    }, ...state.bookmarks]
                }));

                return docRef.id;
            } catch (error) {
                console.error("Error adding bookmark:", error);
                throw error;
            }
        },
        toggleArchived: async (bookmarkId: string) => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const bookmarkRef = doc(db, "links", bookmarkId);
                const currentStore = get({ subscribe });
                const bookmark = currentStore.bookmarks.find(b => b.id === bookmarkId);
                
                if (!bookmark) return;

                await updateDoc(bookmarkRef, {
                    isArchived: !bookmark.isArchived
                });

                // Refresh the current view
                update(state => ({
                    ...state,
                    bookmarks: state.bookmarks.filter(b => b.id !== bookmarkId)
                }));
            } catch (error) {
                console.error("Error toggling archive status:", error);
            }
        },
        toggleImportant: async (bookmarkId: string) => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const bookmarkRef = doc(db, "links", bookmarkId);
                const currentStore = get({ subscribe });
                const bookmark = currentStore.bookmarks.find(b => b.id === bookmarkId);
                
                if (!bookmark) return;

                await updateDoc(bookmarkRef, {
                    isPermanent: !bookmark.isPermanent
                });

                // If we're in the important view, remove the bookmark
                if (bookmark.isPermanent) {
                    update(state => ({
                        ...state,
                        bookmarks: state.bookmarks.filter(b => b.id !== bookmarkId)
                    }));
                }
            } catch (error) {
                console.error("Error toggling important status:", error);
            }
        },
        updateMetadata: async (bookmarkId: string) => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const currentStore = get({ subscribe });
                const bookmark = currentStore.bookmarks.find(b => b.id === bookmarkId);
                
                if (!bookmark) return;

                // Fetch new metadata
                const metadata = await fetchMetadata(bookmark.url);
                
                // Update in Firebase
                const bookmarkRef = doc(db, "links", bookmarkId);
                await updateDoc(bookmarkRef, {
                    metadataTitle: metadata.title,
                    metadataDescription: metadata.description,
                    metadataImage: metadata.image
                });

                // Update the store
                update(state => ({
                    ...state,
                    bookmarks: state.bookmarks.map(b => 
                        b.id === bookmarkId 
                            ? { ...b, ...metadata }
                            : b
                    )
                }));
            } catch (error) {
                console.error("Error updating metadata:", error);
            }
        }
    };
}

export const bookmarkStore = createBookmarkStore();
