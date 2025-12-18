import { Expense } from "@/hooks/useExpenses";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Tag, Trash2 } from "lucide-react";

interface ExpenseCardProps {
    expense: Expense;
    onDelete: (id: string) => void;
}

export function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Tag size={20} />
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">{expense.category}</h3>
                    <p className="text-sm text-gray-500">
                        {expense.note || "No description"}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        {format(expense.date.toDate(), "MMM d, yyyy")}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                </span>
                <button
                    onClick={() => onDelete(expense.id)}
                    className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Delete Expense"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
