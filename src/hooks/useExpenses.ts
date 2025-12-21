"use client";

import { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { getExpensyDb } from "@/lib/firebase";
import { useAuth } from "./useAuth";

export interface Expense {
    id: string;
    uid: string;
    amount: number;
    category: string;
    note: string;
    date: any; // Firestore Timestamp
    type: "expense" | "income";
}

export function useExpenses() {
    const db = getExpensyDb();
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setExpenses([]);
            setLoading(false);
            return;
        }

        // Base query: My expenses, ordered by date desc
        const q = query(
            collection(db, "expenses"),
            where("uid", "==", user.uid),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const docs = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Expense[];

                setExpenses(docs);
                setError(null);
                setLoading(false);
            },
            (err) => {
                console.error("Fetch Expenses Error:", err);
                // Even with client-sort, if permissions fail, we catch it here.
                setError("Failed to load expenses. (Check Rules)");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const addExpense = async (data: {
        amount: number;
        category: string;
        note?: string;
        date: Date;
    }) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "expenses"), {
                uid: user.uid,
                amount: Number(data.amount),
                category: data.category,
                note: data.note || "",
                date: Timestamp.fromDate(data.date),
                type: "expense",
                createdAt: serverTimestamp(),
            });
        } catch (err) {
            console.error("Add Expense Error:", err);
            throw err;
        }
    };

    const deleteExpense = async (id: string) => {
        try {
            await deleteDoc(doc(db, "expenses", id));
        } catch (err) {
            console.error("Delete Expense Error:", err);
            throw err;
        }
    };

    return { expenses, loading, error, addExpense, deleteExpense };
}
