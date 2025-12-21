"use client";

import { useEffect, useState } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { messaging, getExpensyDb } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function useFcmToken() {
    const { user } = useAuth();
    const db = getExpensyDb();
    const [token, setToken] = useState<string | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!user) return;

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                const currentToken = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY // Optional if set in manifest, but good to have
                });

                if (currentToken) {
                    setToken(currentToken);
                    // Save token to Firestore
                    await saveTokenToFirestore(currentToken);
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            }
        } catch (error) {
            console.error('An error occurred while retrieving token. ', error);
        }
    };

    const saveTokenToFirestore = async (token: string) => {
        if (!user) return;

        // CRITICAL FIX: The Cron Job expects 'fcmTokens' as an ARRAY field on the user document.
        // It does NOT look at subcollections.

        try {
            const { arrayUnion, updateDoc } = await import("firebase/firestore");
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                fcmTokens: arrayUnion(token),
                lastTokenUpdate: serverTimestamp()
            });
        } catch (err) {
            console.error("Failed to save token", err);
        }
    };

    return { token, notificationPermission, requestPermission };
}
