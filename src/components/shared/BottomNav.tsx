"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home", icon: Home },
        { href: "/reminders", label: "Bills", icon: Receipt },
        { href: "/insights", label: "Insight", icon: BarChart3 },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-200 bg-white px-4 pb-safe sm:hidden">
            {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1",
                            isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
