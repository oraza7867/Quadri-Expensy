"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Ghost, ShieldCheck, Heart } from "lucide-react";
import { vibrate } from "@/lib/haptics";

const TUTORIAL_KEY = "expensy_soul_tutorial_seen_v2";

// 1. Logic Wrapper (Auto-shows for new users)
export function SoulTutorial() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem(TUTORIAL_KEY);
        if (!seen) {
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleComplete = () => {
        vibrate("success");
        localStorage.setItem(TUTORIAL_KEY, "true");
        setIsOpen(false);
    };

    return <SoulTutorialModal isOpen={isOpen} onClose={handleComplete} />;
}

// 2. Reusable UI Modal
export function SoulTutorialModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [step, setStep] = useState(0);

    // Reset step when opened
    useEffect(() => {
        if (isOpen) setStep(0);
    }, [isOpen]);

    const slides = [
        {
            icon: <Ghost className="h-16 w-16 text-indigo-400" />,
            title: "I am your Financial Soul.",
            text: "I’m not just a tracker. I’m the conscience of your wallet. I live inside this dashboard.",
            color: "bg-indigo-500"
        },
        {
            icon: <ShieldCheck className="h-16 w-16 text-teal-400" />,
            title: "I mirror your habits.",
            text: "Spend wisely, and I stay Zen. reckless spending helps no one—I will get Disappointed.",
            color: "bg-teal-500"
        },
        {
            icon: <Heart className="h-16 w-16 text-rose-400" />,
            title: "I cannot lie.",
            text: "I don't judge, but I will show you the truth. Ready to meet your money?",
            color: "bg-rose-500"
        }
    ];

    const handleNext = () => {
        vibrate("light");
        setStep(s => s + 1);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-gray-900 border border-white/10 shadow-2xl"
                    >
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 h-1 w-full bg-gray-800">
                            <motion.div
                                className={`h-full ${slides[step].color} transition-colors duration-500`}
                                initial={{ width: "0%" }}
                                animate={{ width: `${((step + 1) / slides.length) * 100}%` }}
                            />
                        </div>

                        <div className="p-8 flex flex-col items-center text-center min-h-[400px]">
                            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                                <motion.div
                                    key={step}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="relative"
                                >
                                    <div className={`absolute -inset-4 rounded-full opacity-20 blur-xl ${slides[step].color}`} />
                                    {slides[step].icon}
                                </motion.div>

                                <motion.div
                                    key={`text-${step}`}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="space-y-4"
                                >
                                    <h2 className="text-2xl font-bold text-white">
                                        {slides[step].title}
                                    </h2>
                                    <p className="text-gray-400 text-lg leading-relaxed">
                                        {slides[step].text}
                                    </p>
                                </motion.div>
                            </div>

                            <button
                                onClick={step === slides.length - 1 ? onClose : handleNext}
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 font-bold text-black shadow-lg hover:bg-gray-100 active:scale-95 transition-all"
                            >
                                {step === slides.length - 1 ? "Let's Begin" : "Next"}
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
