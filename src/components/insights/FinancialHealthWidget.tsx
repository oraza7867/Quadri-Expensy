import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface FinancialHealthWidgetProps {
    score: number;
}

export function FinancialHealthWidget({ score }: FinancialHealthWidgetProps) {
    let color = "text-green-600";
    let bgColor = "bg-green-100";
    let barColor = "bg-green-500";
    let label = "Excellent";
    let message = "You're mastering your money!";

    if (score < 50) {
        color = "text-red-600";
        bgColor = "bg-red-100";
        barColor = "bg-red-500";
        label = "Needs Attention";
        message = "Budgets are broken. Time to review.";
    } else if (score < 80) {
        color = "text-yellow-600";
        bgColor = "bg-yellow-100";
        barColor = "bg-yellow-500";
        label = "Fair";
        message = "You're doing okay, but watch out.";
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    Financial Health
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${bgColor} ${color}`}>
                    {label}
                </span>
            </div>

            <div className="flex items-end gap-2 mb-2">
                <span className={`text-4xl font-bold ${color}`}>{score}</span>
                <span className="text-gray-400 text-sm mb-1">/ 100</span>
            </div>

            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                    className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                    style={{ width: `${score}%` }}
                />
            </div>

            <p className="text-sm text-gray-600">{message}</p>
        </div>
    );
}
