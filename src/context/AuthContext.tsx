"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isPremium: boolean;
    currency: string;
    monthlyBudget?: number;
    trustScore: number; // 0-100 (Base Memory)
    honestyLevel: 'gentle' | 'balanced' | 'roast';
    strikes: {
        count: number;
        lastReset: string; // ISO Date String
    };
    budgetResetDay?: number; // 1-31, default 1
    createdAt: any;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // Fetch Profile
                const docRef = doc(db, "users", firebaseUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    let userData = docSnap.data() as UserProfile;

                    // Weekly Forgiveness Check
                    if (userData.strikes) {
                        const lastReset = new Date(userData.strikes.lastReset);
                        const today = new Date();
                        const diffTime = Math.abs(today.getTime() - lastReset.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays >= 7) {
                            console.log("Applying Weekly Forgiveness...");
                            const hadNoStrikes = userData.strikes.count === 0;

                            // Reset Strikes
                            userData.strikes = {
                                count: 0,
                                lastReset: today.toISOString()
                            };

                            // Reward functionality (Mercy)
                            if (hadNoStrikes) {
                                userData.trustScore = Math.min(100, userData.trustScore + 5);
                            }

                            // Persist updates
                            const docRef = doc(db, "users", firebaseUser.uid);
                            await setDoc(docRef, {
                                strikes: userData.strikes,
                                trustScore: userData.trustScore
                            }, { merge: true });
                        }
                    }
                    setProfile(userData);
                } else {
                    console.log("No profile found in Firestore for this user.");
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user doc exists, if not create it
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                const newProfile: UserProfile = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    isPremium: false,
                    currency: "INR",
                    monthlyBudget: 0,
                    trustScore: 80, // Start with high trust (Zen)
                    honestyLevel: 'balanced',
                    strikes: {
                        count: 0,
                        lastReset: new Date().toISOString()
                    },
                    budgetResetDay: 1,
                    createdAt: serverTimestamp(),
                };
                await setDoc(docRef, newProfile);
                setProfile(newProfile);
            }
        } catch (error) {
            console.error("Login Failed", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Logout Failed", error);
        }
    };

    const deleteAccount = async () => {
        if (!auth.currentUser) return;
        try {
            await setDoc(doc(db, "users", auth.currentUser.uid), {
                deleted: true,
                deletedAt: serverTimestamp()
            }, { merge: true });

            await auth.currentUser.delete();
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error("Delete Account Failed", error);
            throw error;
        }
    };

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user) {
            console.error("Cannot update profile: User is missing");
            return;
        }
        try {
            console.log("Updating Firestore profile for:", user.uid, data);
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, data, { merge: true });

            console.log("Firestore updated. Updating local state...");

            setProfile(prev => {
                if (prev) return { ...prev, ...data };

                // If profile was missing, reconstruct basic profile from Auth User + New Data
                return {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    isPremium: false,
                    currency: "INR",
                    monthlyBudget: 0,
                    trustScore: 80,
                    honestyLevel: 'balanced',
                    strikes: { count: 0, lastReset: new Date().toISOString() },
                    budgetResetDay: 1,
                    createdAt: new Date(), // approximations for UI safety
                    ...data
                } as UserProfile;
            });
        } catch (error) {
            console.error("Update Profile Failed in Context", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout, deleteAccount, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}
