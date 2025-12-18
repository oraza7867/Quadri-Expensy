"use client";

import { useReminders } from "@/hooks/useReminders";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Bell, Calendar, Trash2 } from "lucide-react";

export function ReminderList() {
    const { reminders, loading, deleteReminder } = useReminders();

    if (loading) return <div className="h-20 animate-pulse rounded-lg bg-gray-100" />;

    if (reminders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell size={24} className="mb-2 text-gray-300" />
                <p className="text-sm">No active reminders.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {reminders.map((reminder) => {
                const dueDate = reminder.nextDueDate?.toDate();
                const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 3 && daysLeft >= 0;

                return (
                    <div
                        key={reminder.id}
                        className={`flex items-center justify-between rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md ${isUrgent ? "border-orange-200 bg-orange-50" : "border-gray-100 bg-white"
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 h-3 w-3 rounded-full ${reminder.type === 'subscription' ? 'bg-purple-500' : 'bg-indigo-500'
                                }`} />
                            <div>
                                <h3 className="font-medium text-gray-900">{reminder.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar size={12} />
                                    <span>Due {format(dueDate, "MMM d")}</span>
                                    {daysLeft > 0 && <span className={isUrgent ? "font-bold text-orange-600" : ""}>({daysLeft} days left)</span>}
                                    {daysLeft < 0 && <span className="font-bold text-red-600">(Overdue)</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-900">
                                {formatCurrency(reminder.amount)}
                            </span>
                            <button
                                onClick={() => deleteReminder(reminder.id)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
