import { DevTools } from "@/components/shared/DevTools";
import { Navbar } from "@/components/shared/Navbar";
import { MorningBriefing } from "@/components/shared/MorningBriefing";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Top Navigation Layout
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navbar */}
            <div className="sticky top-0 z-50">
                <Navbar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
                <MorningBriefing />
                {children}
                <DevTools />
            </main>
        </div>
    );
}
