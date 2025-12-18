
import { adminDb, adminMessaging } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // 1. Verify Authentication (CRON_SECRET)
    const authHeader = request.headers.get("authorization");
    if (
        process.env.NODE_ENV === "production" &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const now = new Date();
        // Start of today (00:00:00)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // Start of tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Future dates
        const in3Days = new Date(today);
        in3Days.setDate(in3Days.getDate() + 3);
        const in1Day = new Date(today);
        in1Day.setDate(in1Day.getDate() + 1);

        // Fetch active reminders (simplification: fetch all active, filter in memory for MVP)
        // In production, use composite indexes for `isActive == true` AND `nextDueDate <= in3Days`.
        const snapshot = await adminDb
            .collection("reminders")
            .where("isActive", "==", true)
            .get();

        // Define Interface for Type Safety
        interface ReminderDoc {
            id: string;
            uid: string;
            isActive: boolean;
            name: string;
            amount: number;
            nextDueDate?: Timestamp;
            notificationsSent?: {
                day_0?: boolean;
                days_1?: boolean;
                days_3?: boolean;
            };
        }

        const reminders: ReminderDoc[] = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...(doc.data() as Omit<ReminderDoc, "id">),
        }));

        const notificationsToSend: any[] = [];
        const updates: any[] = [];

        for (const reminder of reminders) {
            if (!reminder.nextDueDate) continue;

            const dueTimestamp: Timestamp = reminder.nextDueDate;
            const dueDate = dueTimestamp.toDate();
            // Normalize to midnight for comparison
            const dueMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

            const isDueToday = dueMidnight.getTime() === today.getTime();
            const isDueIn1Day = dueMidnight.getTime() === in1Day.getTime();
            const isDueIn3Days = dueMidnight.getTime() === in3Days.getTime();

            const sentFlags = reminder.notificationsSent || {};
            let title = "";
            let body = "";
            let flagToUpdate = "";

            if (isDueToday && !sentFlags.day_0) {
                title = `Bill Due Today: ${reminder.name}`;
                body = `Pay ₹${reminder.amount} now to avoid late fees using Expensy.`;
                flagToUpdate = "day_0";
            } else if (isDueIn1Day && !sentFlags.days_1) {
                title = `Bill Due Tomorrow: ${reminder.name}`;
                body = `Don't forget to pay ₹${reminder.amount}.`;
                flagToUpdate = "days_1";
            } else if (isDueIn3Days && !sentFlags.days_3) {
                title = `Upcoming Bill: ${reminder.name}`;
                body = `${reminder.name} is due in 3 days (₹${reminder.amount}).`;
                flagToUpdate = "days_3";
            }

            if (title) {
                // Fetch User FCM Token
                const userDoc = await adminDb.collection("users").doc(reminder.uid).get();
                const tokens = userDoc.data()?.fcmTokens || [];

                if (tokens.length > 0) {
                    notificationsToSend.push(
                        adminMessaging.sendEachForMulticast({
                            tokens,
                            notification: { title, body },
                            data: { url: "/reminders" }
                        })
                    );

                    updates.push(
                        adminDb.collection("reminders").doc(reminder.id).update({
                            [`notificationsSent.${flagToUpdate}`]: true
                        })
                    );
                }
            }
        }

        await Promise.all([...notificationsToSend, ...updates]);

        return NextResponse.json({
            success: true,
            processed: reminders.length,
            sent: notificationsToSend.length
        });

    } catch (error) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
