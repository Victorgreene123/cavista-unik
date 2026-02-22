"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/app/components/layout/sidebar";
import NavbarHospital from "@/app/components/layout/Navbars/navbar_hospital";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (user?.role !== 'HOSPITAL_ADMIN') {
        router.push("/individual"); 
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'HOSPITAL_ADMIN') {
      return null; 
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="flex">
        {/* Sidebar - left */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Right column: navbar on top, main content below */}
        <div className="flex-1 flex flex-col min-h-screen">
          <NavbarHospital hospitalName={user?.hospitalProfile?.name} />

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
