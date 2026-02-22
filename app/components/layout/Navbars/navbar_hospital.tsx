"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { MdLogout } from "react-icons/md";

type Props = {
  hospitalName?: string;
  logoSrc?: string;
};

export default function NavbarHospital({
  hospitalName = "Your Hospital",
  logoSrc,
}: Props) {
  const { user, logout } = useAuth();
  const displayName = user?.type === 'hospital' ? user.name : hospitalName;

  const pathname = usePathname() || "/";

  const title = getPageTitle(pathname);

  const initials = getInitials(displayName);

  return (
    <header
      className="w-full h-16 flex items-center justify-between px-6 text-gray-800"
      aria-label="Hospital navbar"
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        {/* Left container: page title (glass panel) */}
        <div className="bg-white/6 px-4 py-2 rounded-xl">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>

        {/* Right container: hospital profile (glass button) */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right mr-2">
            <span className="text-sm font-medium text-gray-900">
              {displayName}
            </span>
            <span className="text-xs text-gray-600">Hospital profile</span>
          </div>

          <button
            className="flex items-center gap-3 bg-white/6 hover:bg-white/10 px-3 py-1 rounded-xl ring-1 ring-white/10"
            aria-label="Open hospital profile"
          >
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt="logo"
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
                <div className="w-9 h-9 flex items-center justify-center bg-teal-100 text-teal-700 rounded-full font-bold">
                    {initials}
                </div>
            )}
          </button>
          
          <button 
            onClick={logout}
            className="ml-2 p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <MdLogout className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function getPageTitle(pathname: string) {
  if (pathname === "/" || pathname === "") return "Dashboard";
  if (pathname.includes("facilities")) return "Facilities";
  if (pathname.includes("wards")) return "Wards";
  if (pathname.includes("appointments")) return "Appointments";
  if (pathname.includes("analyse")) return "Analyse";
  return prettifyLastSegment(pathname);
}

function prettifyLastSegment(path: string) {
  const seg = path.split("/").filter(Boolean).pop() || "Dashboard";
  return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getInitials(name = ""): string {
  const [first, second] = name.split(" ");
  return (first?.[0] || "") + (second?.[0] || "");
}

