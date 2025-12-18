"use client";

import { useAuth } from "@/hooks/useAuth";
import { AddReminderForm } from "@/components/reminders/AddReminderForm";
import { ReminderList } from "@/components/reminders/ReminderList";
import { useState } from "react";
import { X } from "lucide-react";

export default function RemindersPage() {
    const { profile } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900">Bill Reminders</h1>
                    <p className="text-sm text-gray-500">
                        Never miss a payment again. We'll notify you before due dates.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    + Add Reminder
                </button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Upcoming Bills</h2>
                <ReminderList />
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Add Bill Reminder</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <AddReminderForm onSuccess={() => setShowAddModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
