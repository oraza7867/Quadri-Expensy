"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { getExpensyDb } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { Scar } from "@/lib/types";

export function useScars() {
    const db = getExpensyDb();
    const { user } = useAuth();
    const [scars, setScars] = useState<Scar[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setScars([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "users", user.uid, "scars"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const docs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Scar[];
                setScars(docs);
                setLoading(false);
            },
            (error) => {
                console.error("Failed to fetch scars", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    return { scars, loading };
}
