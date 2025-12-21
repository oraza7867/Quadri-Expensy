import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: "Missing ID Token" }, { status: 401 });
        }

        // 1. Verify User Identity (Security Check)
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        if (!uid) {
            return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
        }

        console.log(`🗑️ Starting Zombie Data Wipeout for User: ${uid}`);

        // 2. Define standard subcollections to wipe
        // Note: Firestore admin doesn't support "listCollections" easily in all environments,
        // so we explicitly target known collections for safety and performance.
        const collectionsToWipe = ["expenses", "reminders", "scars"];

        let deletedCount = 0;

        for (const colName of collectionsToWipe) {
            // Expenses/Reminders are usually top-level with 'uid' field OR subcollections.
            // In Expensy, 'expenses' are stored at: collection(db, 'users', uid, 'expenses')?
            // Let's double check standard path.
            // In ExpenseList.tsx: collection(db, "users", user.uid, "expenses") -> YES, Subcollection.

            const subColRef = adminDb.collection("users").doc(uid).collection(colName);
            const snapshot = await subColRef.get();

            if (snapshot.empty) continue;

            const batch = adminDb.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
                deletedCount++;
            });

            await batch.commit();
            console.log(`✅ Defaulted ${snapshot.size} docs from ${colName}`);
        }

        // 3. Delete Top Level User Doc (Profile)
        await adminDb.collection("users").doc(uid).delete();
        console.log(`💀 User Profile deleted.`);

        return NextResponse.json({ success: true, deletedCount });

    } catch (error: any) {
        console.error("Wipeout Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
