"use client";

import { useAuth } from "@/hooks/useAuth";
import { isAnalyticsLocked, isCoachMode } from "@/lib/soulLogic";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApologyModal } from "@/components/modals/ApologyModal";

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function TrustGate({ children, fallback }: Props) {
    const { profile, loading } = useAuth();

    if (loading) return <div className="p-4 text-center text-sm text-gray-500">Verifying Soul Status...</div>;
    if (!profile) return null;

    const isCoach = isCoachMode(profile.createdAt);
    // We check specifically for Analytics Lock (Trust < 30) for this gate.
    // Ideally we could pass a strictness level, but for v2 MVP this is primarily for the Data tab.
    const isLocked = isAnalyticsLocked(profile.trustScore, isCoach, profile.mode || 'standard');

    const [showApology, setShowApology] = useState(false);

    if (isLocked) {
        return fallback || (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-900 shadow-sm animate-in fade-in zoom-in duration-300">
                <div className="rounded-full bg-rose-100 p-4">
                    <Lock className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="mt-4 text-xl font-bold">Analytics Locked</h3>
                <p className="mt-2 text-sm text-rose-700 max-w-xs leading-relaxed">
                    Your Trust Score is below 30. Expensy has paused your charts until you stabilize your spending.
                </p>
                <div className="mt-6 flex flex-col gap-3 w-full max-w-xs">
                    <Link href="/" className="w-full text-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700">
                        Return Home
                    </Link>
                    <button
                        onClick={() => setShowApology(true)}
                        className="text-xs text-rose-600 font-medium underline hover:text-rose-800"
                    >
                        Request Emergency Override
                    </button>
                </div>
                <ApologyModal isOpen={showApology} onClose={() => setShowApology(false)} />
            </div>
        );
    }

    return <>{children}</>;
}
