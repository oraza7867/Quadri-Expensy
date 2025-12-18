import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Edit2, Check, X, Target } from "lucide-react";

interface MonthlyGoalWidgetProps {
    totalSpent: number;
    cycleLabel?: string;
}

export function MonthlyGoalWidget({ totalSpent, cycleLabel }: MonthlyGoalWidgetProps) {
    const { profile, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [newBudget, setNewBudget] = useState("");

    const monthlyBudget = profile?.monthlyBudget || 0;

    // Sync local state when profile loads
    useEffect(() => {
        if (profile) {
            setNewBudget(profile.monthlyBudget?.toString() || "");
        }
    }, [profile]);

    const progress = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0;

    // Determine color based on progress
    let color = "bg-green-500";
    let textColor = "text-green-600";
    if (progress > 100) {
        color = "bg-red-500";
        textColor = "text-red-600";
    } else if (progress > 85) {
        color = "bg-yellow-500";
        textColor = "text-yellow-600";
    }

    const handleSave = async () => {
        const amount = Number(newBudget);

        if (!isNaN(amount) && amount >= 0) {
            setIsSaving(true);
            try {
                await updateProfile({ monthlyBudget: amount });
                setIsEditing(false);
            } catch (error: any) {
                console.error("Failed to save budget", error);
                alert("Error: " + error.message);
            } finally {
                setIsSaving(false);
            }
        } else {
            alert("Invalid amount entered");
        }
    };

    if (monthlyBudget === 0 && !isEditing) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                <Target className="h-8 w-8 text-gray-400 mb-2" />
                <h3 className="text-gray-900 font-medium">Set a Monthly Budget</h3>
                <p className="text-sm text-gray-500 mb-4">Track your spending against a global limit.</p>
                <button
                    onClick={() => {
                        setNewBudget("");
                        setIsEditing(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                >
                    Set Budget
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Target className="h-5 w-5 text-indigo-600" />
                        Monthly Goal
                    </h2>
                    {cycleLabel && (
                        <p className="text-xs font-medium text-indigo-600 mt-1 pl-7 sm:pl-0">
                            {cycleLabel}
                        </p>
                    )}
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => {
                            setNewBudget(monthlyBudget.toString());
                            setIsEditing(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                        >
                            <Check size={18} />
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="mb-2">
                    <label className="text-xs text-gray-500 font-medium">Monthly Limit (₹)</label>
                    <input
                        type="number"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g 20000"
                        autoFocus
                    />
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Spent so far</p>
                            <p className={`text-2xl font-bold ${progress > 100 ? "text-red-600" : "text-gray-900"}`}>
                                ₹{totalSpent.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Goal</p>
                            <p className="text-lg font-semibold text-gray-900">₹{monthlyBudget.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${color} transition-all duration-1000 ease-out`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <p className={`text-xs font-medium ${textColor}`}>
                        {progress > 100
                            ? `You've exceeded your budget by ₹${(totalSpent - monthlyBudget).toLocaleString()}`
                            : `${(100 - progress).toFixed(0)}% remaining (₹${(monthlyBudget - totalSpent).toLocaleString()})`
                        }
                    </p>
                </div>
            )}
        </div>
    );
}
