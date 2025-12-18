"use client";

import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Chrome } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
    const { user, loginWithGoogle, loading } = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user) {
            router.push("/");
        }
    }, [user, loading, router]);

    const handleGoogleLogin = async () => {
        try {
            setError(null);
            await loginWithGoogle();
        } catch (err: any) {
            console.error(err);
            // Show the actual error message to the user for debugging
            setError(err.code ? `Error: ${err.code} - ${err.message}` : "Failed to login with Google.");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Expensy</h1>
                    <p className="mt-2 text-sm text-gray-600">Track expenses, bills, and budget.</p>
                </div>

                {error && (
                    <div className="mb-4 flex items-center rounded-md bg-red-50 p-3 text-sm text-red-600">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {/* Simple G icon or Lucide Chrome as placeholder */}
                    <Chrome className="mr-2 h-5 w-5 text-blue-600" />
                    Continue with Google
                </button>

                <p className="mt-6 text-center text-xs text-gray-400">
                    By continuing, you agree to Quadri's Terms & Privacy Policy.
                </p>
            </div>
        </div>
    );
}
