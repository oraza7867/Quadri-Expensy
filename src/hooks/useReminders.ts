"use client";

import { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";

export interface Reminder {
    id: string;
    uid: string;
    name: string;
    category: string;
    amount: number;
    dueDate: string; // YYYY-MM-DD for simple sorting/display
    frequency: "monthly" | "quarterly" | "yearly";
    type: "bill" | "subscription";
    isActive: boolean;
    nextDueDate: any; // Timestamp
}

export function useReminders() {
    const { user } = useAuth();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setReminders([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "reminders"),
            where("uid", "==", user.uid),
            // orderBy("nextDueDate", "asc") // Index required
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Reminder[];

            // Sort in memory to avoid needing immediate index creation for MVP
            docs.sort((a, b) => {
                const dateA = a.nextDueDate?.seconds || 0;
                const dateB = b.nextDueDate?.seconds || 0;
                return dateA - dateB;
            });

            setReminders(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addReminder = async (data: {
        name: string;
        amount: number;
        category: string;
        dueDate: string; // YYYY-MM-DD
        frequency: "monthly" | "quarterly" | "yearly";
        type: "bill" | "subscription";
    }) => {
        if (!user) return;

        // Calculate initial nextDueDate based on the date string
        const targetDate = new Date(data.dueDate);

        await addDoc(collection(db, "reminders"), {
            uid: user.uid,
            ...data,
            isActive: true,
            nextDueDate: Timestamp.fromDate(targetDate),
            notificationsSent: {
                days_3: false,
                days_1: false,
                day_0: false,
            },
            createdAt: serverTimestamp(),
        });
    };

    const deleteReminder = async (id: string) => {
        await deleteDoc(doc(db, "reminders", id));
    };

    return { reminders, loading, addReminder, deleteReminder };
}
