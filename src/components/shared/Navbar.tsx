import { useAuth } from "@/hooks/useAuth";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { PremiumButton } from "./PremiumButton";

export function Navbar() {
    const { user, profile, logout } = useAuth();

    return (
        <nav className="border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
                            E
                        </div>
                        <span className="text-xl font-bold text-gray-900">Expensy</span>
                    </Link>

                    {user && (
                        <div className="hidden gap-6 text-sm font-medium text-gray-500 sm:flex">
                            <Link href="/" className="hover:text-gray-900">Dashboard</Link>
                            <Link href="/reminders" className="hover:text-gray-900">Bills</Link>
                            <Link href="/insights" className="hover:text-gray-900">Insights</Link>
                            <Link href="/settings" className="hover:text-gray-900">Settings</Link>
                        </div>
                    )}
                </div>

                {user && (
                    <div className="flex items-center gap-4">
                        <PremiumButton />
                        <div className="hidden items-center gap-2 sm:flex">
                            {profile?.photoURL ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profile.photoURL}
                                    alt={profile.displayName || "User"}
                                    className="h-8 w-8 rounded-full border border-gray-200"
                                />
                            ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 pb-1 text-gray-500">
                                    <UserIcon size={16} />
                                </div>
                            )}
                            <span className="text-sm font-medium text-gray-700">
                                {profile?.displayName?.split(" ")[0] || "User"}
                            </span>
                        </div>

                        <button
                            onClick={() => logout()}
                            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
