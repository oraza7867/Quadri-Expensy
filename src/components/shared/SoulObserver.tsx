"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialSoul } from "@/hooks/useFinancialSoul";
import { shouldAddScar, shouldHealScar } from "@/lib/soulLogic";
import { Scar } from "@/lib/types";
import { getExpensyDb } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { vibrate } from "@/lib/haptics";

export function SoulObserver() {
    const db = getExpensyDb();
    const { user, profile } = useAuth();
    // We pass 0 budget/spent because for Observer we only care about Base Persisted Score
    // But useFinancialSoul requires them.
    // Actually, we should just use `profile.trustScore` directly as per logic plan.
    // Lockouts use `baseScore`. Scars should too.
    const { isCoach } = useFinancialSoul([], 0, 0);

    // State
    const [scars, setScars] = useState<Scar[]>([]);
    const [loadingScars, setLoadingScars] = useState(true);
    const processingRef = useRef(false);

    // 1. Subscribe to Scars
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "users", user.uid, "scars"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedScars = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Scar[];
            setScars(loadedScars);
            setLoadingScars(false);
        });

        return () => unsubscribe();
    }, [user]);

    // 2. Evaluate Logic
    useEffect(() => {
        if (!user || !profile || loadingScars || processingRef.current) return;

        // A. Check for New Scar
        // We use profile.trustScore (Base Memory) for permanent scars
        if (shouldAddScar(profile.trustScore, scars, isCoach)) {
            handleCreateScar();
        }

        // B. Check for Healing & Maintenance
        // We iterate through active scars to maintain their streaks
        const today = new Date().toISOString().split('T')[0];

        scars.forEach(scar => {
            if (scar.status !== 'active') return;

            // 1. Check if we can increment streak (Trust >= 40)
            // Logic: If Trust is healthy, we grant a "day of healing".
            // We need to ensure we only do this once per day.
            const lastUpdate = scar.lastStreakUpdate ? new Date(scar.lastStreakUpdate).toISOString().split('T')[0] : "";

            if (profile.trustScore >= 40 && lastUpdate !== today) {
                // Determine if we should increment logic
                // We increment for ANY actve scar if trust is high.
                handleIncrementStreak(scar);
            }

            // 2. Check Finish Line
            if (shouldHealScar(scar, profile.trustScore)) {
                handleHealScar(scar);
            }
        });

    }, [profile, scars, isCoach, loadingScars, user]);

    const handleIncrementStreak = async (scar: Scar) => {
        if (!user) return;
        // Don't set processingRef here on minor background updates to avoid blocking crucial UI

        try {
            const scarRef = doc(db, "users", user.uid, "scars", scar.id);
            await updateDoc(scarRef, {
                streakCount: (scar.streakCount || 0) + 1,
                lastStreakUpdate: new Date().toISOString()
            });
            console.log(`💪 Streak incremented for scar ${scar.id}`);
        } catch (err) {
            console.error("Failed to increment streak", err);
        }
    };

    const handleCreateScar = async () => {
        if (!user || !profile) return;
        processingRef.current = true;

        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const newScar: Omit<Scar, "id"> = {
                date: currentMonth,
                cause: `Trust Crash: Score dropped to ${profile.trustScore}`,
                trustSnapshot: profile.trustScore,
                status: 'active',
                streakCount: 0
            };

            await addDoc(collection(db, "users", user.uid, "scars"), {
                ...newScar,
                createdAt: serverTimestamp()
            });

            // Vibrate and maybe show toast/modal (handled by Firestore listener updates elsewhere if needed)
            vibrate("error");
            console.log("⚠️ SCAR ADDED");

        } catch (err) {
            console.error("Failed to add scar", err);
        } finally {
            processingRef.current = false;
        }
    };

    const handleHealScar = async (scar: Scar) => {
        if (!user) return;
        processingRef.current = true;

        try {
            const scarRef = doc(db, "users", user.uid, "scars", scar.id);
            await updateDoc(scarRef, {
                status: 'healed',
                healedAt: new Date().toISOString()
            });
            vibrate("success");
            console.log("✨ SCAR HEALED");
        } catch (err) {
            console.error("Failed to heal scar", err);
        } finally {
            processingRef.current = false;
        }
    };

    return null; // Headless component
}
