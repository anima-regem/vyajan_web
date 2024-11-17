import { writable, get } from 'svelte/store';
import { db, auth } from '$lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

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
        }
    };
}

export const bookmarkStore = createBookmarkStore();
