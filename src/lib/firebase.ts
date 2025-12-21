
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging"; // Client SDK
// Import for side-effects to ensure registration
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (Server-Side safe)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Lazy Getters for Safe Initialization (Prevents "Component not registered" error)
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;

export const getExpensyAuth = () => {
    // If Server, return mock to prevent crash
    if (typeof window === "undefined") {
        return {} as any;
    }
    // If Client, initialized on demand
    if (!authInstance) {
        authInstance = getAuth(app);
    }
    return authInstance;
};

export const getExpensyDb = () => {
    if (typeof window === "undefined") {
        return {} as any;
    }
    if (!dbInstance) {
        dbInstance = getFirestore(app);
    }
    return dbInstance;
};

// Messaging (Client-Side Only)
let messaging: any = null;
if (typeof window !== "undefined") {
    try {
        messaging = getMessaging(app);
    } catch (e) {
        // Safe to ignore in dev/build
    }
}

export { app, messaging };
// Note: verify imports in other files!
