"use client";

import { useAuth } from "@/hooks/useAuth";
import { Crown } from "lucide-react";
import { useState } from "react";
import { PremiumModal } from "./PremiumModal";

export function PremiumButton() {
    const { profile } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        // TODO: Call Razorpay
        setTimeout(() => {
            setLoading(false);
            alert("Razorpay Integration Next Step");
        }, 1000);
    };

    // If user is already premium, show simplified badge
    if (profile?.isPremium) {
        return (
            <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                <Crown size={14} />
                <span>PREMIUM</span>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95"
            >
                Upgrade to Premium
            </button>

            <PremiumModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onUpgrade={handleUpgrade}
                loading={loading}
            />
        </>
    );
}
