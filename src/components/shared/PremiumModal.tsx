"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Crown } from "lucide-react";

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    loading: boolean;
}

const benefits = [
    "Unlimited Budgets & Categories",
    "AI Financial Roast Mode",
    "Debt Snowball Smart Plans",
    "Ad-Free Experience",
    "Priority Support"
];

export function PremiumModal({ isOpen, onClose, onUpgrade, loading }: PremiumModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-md overflow-hidden rounded-[40px] bg-gradient-to-b from-gray-900 to-black p-1 shadow-2xl ring-1 ring-white/10"
                    >
                        {/* Decorative Background Glows */}
                        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-[60px]" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/20 blur-[60px]" />

                        <div className="relative rounded-[36px] bg-gray-900/50 p-8 backdrop-blur-md">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="flex flex-col items-center text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25"
                                >
                                    <Crown size={32} className="text-white" />
                                </motion.div>
                                <h2 className="text-3xl font-bold text-white">Expensy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Premium</span></h2>
                                <p className="mt-2 text-gray-400">Unlock the full power of your Financial Soul.</p>
                            </div>

                            {/* Pricing */}
                            <div className="my-8 text-center">
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-white">₹99</span>
                                    <span className="text-lg text-gray-500">/mo</span>
                                </div>
                                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                                    <Sparkles size={12} />
                                    <span>Launch Offer: 50% OFF</span>
                                </div>
                            </div>

                            {/* Benefits List */}
                            <div className="space-y-4">
                                {benefits.map((benefit, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-300">{benefit}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Action Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onUpgrade}
                                disabled={loading}
                                className="group relative mt-8 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 font-bold text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? "Processing..." : "Upgrade Now"}
                                    {!loading && <Sparkles size={18} className="transition-transform group-hover:rotate-12" />}
                                </span>
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                            </motion.button>

                            <p className="mt-4 text-center text-xs text-gray-500">
                                Secure payment via Razorpay. Cancel anytime.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
