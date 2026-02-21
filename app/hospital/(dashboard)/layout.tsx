import React from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full flex-col md:flex-row bg-gray-50">
            {/* Sidebar Area - Placeholder */}
            

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mx-auto max-w-7xl">
                        {children}
                </div>
            </main>
        </div>
    );
}