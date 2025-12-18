import { AlertTriangle } from "lucide-react";
import { vibrate } from "@/lib/haptics";
import { useEffect } from "react";

interface ConscienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    score: number;
    amount: number;
}

export function ConscienceModal({ isOpen, onClose, onConfirm, score, amount }: ConscienceModalProps) {

    // Haptic Impact on Open
    useEffect(() => {
        if (isOpen) {
            vibrate("warning");
        }
    }, [isOpen]);

    const handleClose = () => {
        vibrate("success"); // Reward for saving
        onClose();
    };

    const handleConfirm = () => {
        vibrate("error"); // Pain for spending
        onConfirm();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl scale-100 p-6">

                {/* Header */}
                <div className="flex items-center gap-3 mb-4 text-amber-600">
                    <AlertTriangle className="h-6 w-6" />
                    <h3 className="text-lg font-bold">Conscience Check</h3>
                </div>

                {/* Body */}
                <div className="space-y-4">
                    <p className="text-gray-600 text-[15px] leading-relaxed">
                        Your Trust Score is low (<span className="font-bold text-gray-900">{score}</span>).
                        Spending <span className="font-bold text-gray-900">₹{amount}</span> right now is risky.
                    </p>

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-sm text-amber-800 font-medium">
                            "This purchase will lower your Trust Score by another 5 points. Proceed?"
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex gap-3">
                    <button
                        onClick={handleClose} // Cancel = Good Choice
                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        I'll Save It
                    </button>
                    <button
                        onClick={handleConfirm} // Confirm = Penalty
                        className="flex-1 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Buy Anyway
                    </button>
                </div>
            </div>
        </div>
    );
}
