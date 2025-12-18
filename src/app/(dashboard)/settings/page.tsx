"use client";

import { useAuth } from "@/hooks/useAuth";
import { Trash2, Shield, Download, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { getCycleRange, formatCycleRange } from "@/lib/dateUtils";

export default function SettingsPage() {
    const { user, profile, deleteAccount, updateProfile, loading } = useAuth();
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Calculate preview of the cycle range
    const [cyclePreview, setCyclePreview] = useState("");

    useEffect(() => {
        if (!profile) return;
        const range = getCycleRange(new Date(), profile.budgetResetDay || 1);
        setCyclePreview(formatCycleRange(range));
    }, [profile?.budgetResetDay]);

    const handleCycleChange = async (day: number) => {
        const safeDay = Math.min(Math.max(1, day), 31);
        await updateProfile({ budgetResetDay: safeDay });
    };

    const handleExport = async () => {
        if (!user) return;
        setExporting(true);
        try {
            // Standard imports
            const { collection, query, where, getDocs, orderBy } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");

            const q = query(
                collection(db, "expenses"),
                where("uid", "==", user.uid),
                orderBy("date", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => {
                const e = d.data();
                return {
                    Date: new Date(e.date.seconds * 1000).toLocaleDateString(),
                    Category: e.category,
                    Amount: e.amount,
                    Note: e.note || ""
                };
            });

            if (data.length === 0) {
                alert("No data to export!");
                setExporting(false);
                return;
            }

            // Generate CSV
            const headers = Object.keys(data[0]).join(",");
            const rows = data.map(row => Object.values(row).join(","));
            const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "expensy_data.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error(error);
            alert("Export Failed");
        } finally {
            setExporting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure? This will delete your account and you cannot recover it.")) return;

        const doubleCheck = prompt("Type 'DELETE' to confirm deletion:");
        if (doubleCheck !== "DELETE") return;

        setDeleting(true);
        try {
            await deleteAccount();
        } catch (error: any) {
            alert("Failed to delete account. You may need to re-login first. Error: " + error.message);
        } finally {
            setDeleting(false);
        }
    };

    // ... existing export/delete logic ...

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
    if (!user) return <div>Access Denied</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings & Trust</h1>
                <p className="text-gray-500">Manage your data and privacy.</p>
            </div>

            {/* Privacy Note */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-100 p-2">
                        <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Data Privacy Promise</h3>
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                            Your data is stored securely on Google Cloud (Firebase).
                            We do not share your financial data with any third parties or banks.
                            You are the only owner of your data.
                        </p>
                    </div>
                </div>
            </div>

            {/* Budget Cycle Alignment */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="rounded-full bg-indigo-100 p-2">
                        <Calendar className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">Budget Cycle Alignment</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Align your monthly budget with your Payday or Billing Cycle.
                        </p>

                        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <div className="relative">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Day</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={profile?.budgetResetDay || 1}
                                    onChange={(e) => handleCycleChange(parseInt(e.target.value) || 1)}
                                    className="mt-1 block w-20 rounded-lg border-gray-300 bg-gray-50 py-2 pl-3 pr-2 font-mono text-lg font-bold shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex-1 rounded-lg bg-indigo-50 p-3">
                                <p className="text-xs font-bold text-indigo-800 uppercase">Current Cycle</p>
                                <p className="font-medium text-indigo-900">{cyclePreview}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data & Premium Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Free / Data Ownership */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 rounded-full bg-blue-100 p-2 w-fit">
                        <Download className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Your Data</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        You own your data. Export it anytime for free.
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {exporting ? "Exporting..." : "Download CSV"}
                    </button>
                </div>

                {/* Premium Teaser */}
                <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
                    <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                        COMING SOON
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">Expensy Premium</h3>
                    <p className="mt-1 text-xs font-medium text-amber-700">Unlock the full power of your money.</p>

                    <ul className="mt-4 space-y-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span> Unlimited Bill Reminders
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span> Deep Spending Trends
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span> Priority Support
                        </li>
                    </ul>

                    <button disabled className="mt-6 w-full cursor-not-allowed rounded-lg border border-amber-200 bg-white/50 px-4 py-2 text-sm font-semibold text-amber-700 opacity-75">
                        Join Waitlist (Soon)
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h3 className="text-lg font-bold text-red-800">Danger Zone</h3>
                <p className="mt-1 text-sm text-red-600">Once you submit this action, it cannot be undone.</p>

                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                    <Trash2 size={16} />
                    {deleting ? "Deleting..." : "Delete My Account"}
                </button>
            </div>
        </div>
    );
}
