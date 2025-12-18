"use client";

import { Navbar } from "@/components/shared/Navbar";
import { BottomNav } from "@/components/shared/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SoulTutorial } from "@/components/onboarding/SoulTutorial";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SoulTutorial />
            <Navbar />
            <main className="mx-auto max-w-5xl p-4 sm:px-6 lg:px-8 pb-24 sm:pb-8">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
