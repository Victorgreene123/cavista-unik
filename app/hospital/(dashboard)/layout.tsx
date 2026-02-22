import Sidebar from "@/app/components/layout/sidebar";
import NavbarHospital from "@/app/components/layout/Navbars/navbar_hospital";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="flex">
        {/* Sidebar - left */}
        <Sidebar />

        {/* Right column: navbar on top, main content below */}
        <div className="flex-1 flex flex-col min-h-screen">
          <NavbarHospital />

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
