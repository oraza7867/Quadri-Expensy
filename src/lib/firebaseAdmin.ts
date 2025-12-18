
import "server-only";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// Parse service account from env variable
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

let app;
let adminDb: any;
let adminMessaging: any;

if (serviceAccount) {
    const firebaseAdminConfig = {
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };

    app = !getApps().length
        ? initializeApp(firebaseAdminConfig, "admin")
        : getApp("admin");

    adminDb = getFirestore(app);
    adminMessaging = getMessaging(app);
} else {
    // Mock for Build/Dev without secrets
    adminDb = {
        collection: () => ({
            where: () => ({
                get: () => Promise.resolve({ docs: [] }),
            }),
            doc: () => ({
                get: () => Promise.resolve({ data: () => ({}) }),
                update: () => Promise.resolve(),
            }),
        }),
    };
    adminMessaging = {
        sendEachForMulticast: () => Promise.resolve(),
    };
}

export { adminDb, adminMessaging };
