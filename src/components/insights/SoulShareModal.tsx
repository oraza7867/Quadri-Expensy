"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Download, Ghost } from "lucide-react";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";

interface SoulShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    trustScore: number;
    state: string;
    ghost: string | null;
}

export function SoulShareModal({ isOpen, onClose, trustScore, state, ghost }: SoulShareModalProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [sharing, setSharing] = useState(false);

    const handleShare = async () => {
        if (!cardRef.current) return;
        setSharing(true);

        try {
            // Generate Image
            const canvas = await html2canvas(cardRef.current, {
                scale: 2, // High resolution
                backgroundColor: "#111827", // Dark theme background
                useCORS: true,
            });

            const blob = await new Promise<Blob | null>((resolve) => 
                canvas.toBlob(resolve, "image/png", 1.0)
            );

            if (!blob) throw new Error("Failed to generate image");

            const file = new File([blob], "expensy-soul.png", { type: "image/png" });
            
            // Web Share API
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: "My Financial Soul",
                    text: `My Trust Score is ${trustScore}. My Soul is ${state}. Can you beat me? #Expensy`,
                    files: [file],
                });
            } else {
                // Fallback: Download
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "expensy-soul.png";
                link.click();
            }
        } catch (err) {
            console.error("Share failed", err);
        } finally {
            setSharing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm rounded-[32px] bg-zinc-900 p-6 shadow-2xl overflow-hidden"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="mb-6 text-center text-xl font-bold text-white">Share Your Vibe</h2>

                        {/* The Shareable Card */}
                        <div 
                            ref={cardRef}
                            className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 flex flex-col items-center justify-between shadow-lg"
                        >
                            {/* Watermark / Logo */}
                            <div className="absolute top-6 left-6 flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-white text-indigo-700 font-bold flex items-center justify-center text-xs">E</div>
                                <span className="font-bold text-white/80 text-sm tracking-widest">EXPENSY</span>
                            </div>

                            {/* Center Content */}
                            <div className="flex flex-col items-center gap-4 mt-8">
                                <div className={cn(
                                    "h-24 w-24 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)]",
                                    state === "disappointed" ? "bg-rose-500" :
                                    state === "observing" ? "bg-amber-400" : "bg-teal-400"
                                )}>
                                    <span className="text-4xl font-black text-white">{trustScore}</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-white/60 text-sm uppercase tracking-wider font-medium">Current Status</p>
                                    <h3 className="text-3xl font-bold text-white capitalize">{state}</h3>
                                </div>
                            </div>

                            {/* Badge */}
                            {ghost && (
                                <div className="mt-4 flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 backdrop-blur-md border border-white/10">
                                    <Ghost size={16} className="text-purple-300" />
                                    <span className="text-sm font-medium text-white">{ghost}</span>
                                </div>
                            )}

                             {/* Bottom Tagline */}
                             <div className="mt-auto w-full text-center border-t border-white/20 pt-4">
                                <p className="text-xs font-medium text-white/70">"My wallet has a conscience."</p>
                             </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-center">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleShare}
                                disabled={sharing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 font-bold text-black shadow-lg hover:bg-gray-100 disabled:opacity-50"
                            >
                                {sharing ? (
                                    <span>Generating...</span>
                                ) : (
                                    <>
                                        <Share2 size={20} />
                                        <span>Share to Story</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
