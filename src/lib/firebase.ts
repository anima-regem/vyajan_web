import { initializeApp } from "firebase/app";
import { browser } from '$app/environment';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './env';

const app = initializeApp(firebaseConfig);
export const analytics = browser ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
