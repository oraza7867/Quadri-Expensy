"use client";

/**
 * Haptics Engine for Expensy
 * Provides physical feedback for financial actions.
 * 
 * Rules:
 * - Success: Light, crisp (Action confirmed)
 * - Warning: Heavy buzz (Pay attention)
 * - Error: Double thud (Stop/Pain)
 */

type HapticType = "success" | "warning" | "error" | "light";

export function vibrate(type: HapticType) {
    if (typeof navigator === "undefined" || !navigator.vibrate) return;

    try {
        console.log(`📳 Haptic Trigger: ${type}`); // Visual fallback for desktop
        switch (type) {
            case "success":
                // Crisp tick
                navigator.vibrate(10);
                break;
            case "light":
                // Very subtle tick (for UI interactions)
                navigator.vibrate(5);
                break;
            case "warning":
                // Heavy buzz
                navigator.vibrate(50);
                break;
            case "error":
                // Double thud (Heartbeat of doom)
                navigator.vibrate([50, 100, 50]);
                break;
        }
    } catch (e) {
        // Ignore haptic errors on unsupported devices
    }
}
