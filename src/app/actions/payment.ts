"use server";

import Razorpay from "razorpay";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// Initialize Razorpay
// Note: In dev without keys, we might need a mock mode, but assuming keys exist or fail gracefully.
const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

export async function createSubscriptionOrder() {
    try {
        const options = {
            amount: 9900, // ₹99.00 in paise
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7),
        };

        const order = await razorpay.orders.create(options);
        return { success: true, orderId: order.id, amount: order.amount };
    } catch (error) {
        console.error("Razorpay Create Order Error:", error);
        // For MVP Demo purposes if keys are missing
        if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === "rzp_test_mock") {
            return { success: true, orderId: "order_mock_" + Date.now(), amount: 9900 };
        }
        return { success: false, error: "Failed to create order" };
    }
}

export async function verifyPayment(
    data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    },
    uid: string
) {
    try {
        const body = data.razorpay_order_id + "|" + data.razorpay_payment_id;

        // If using mock mode
        if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === "rzp_test_mock") {
            await adminDb.collection("users").doc(uid).update({
                isPremium: true,
                premiumSince: FieldValue.serverTimestamp(),
                subscriptionStatus: "active_mock",
            });
            return { success: true };
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === data.razorpay_signature) {
            // Update User to Premium
            await adminDb.collection("users").doc(uid).update({
                isPremium: true,
                premiumSince: FieldValue.serverTimestamp(),
                subscriptionStatus: "active",
            });
            return { success: true };
        } else {
            return { success: false, error: "Invalid Signature" };
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return { success: false, error: "Verification Failed" };
    }
}
