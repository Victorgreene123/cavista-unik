"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname() || "/";

  const items = [
    
    { href: "/hospital/wards", label: "Wards", icon: wardsIcon },
    {
      href: "/hospital/appointments",
      label: "Appointments",
      icon: appointmentsIcon,
    },
  ];

  return (
    <aside
      className="w-72 min-h-screen p-6 text-white relative overflow-hidden"
      aria-label="Hospital sidebar"
    >
      {/* glossy gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 opacity-95 shadow-lg rounded-r-2xl"
        aria-hidden
      />
      {/* subtle glossy overlay */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl mix-blend-overlay pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10">
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 12h18"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 7h12v10H6z"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold">VitalScan</span>
            </div>
          </div>
        </div>

        <header className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center ring-1 ring-white/30">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 12h18"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M6 7h12v10H6z"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Hospital</h2>
            <p className="text-sm text-white/85">
              Manage facilities & appointments
            </p>
          </div>
        </header>

        <nav aria-label="Hospital navigation">
          <ul className="space-y-2">
            {items.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={
                      "group flex items-center gap-3 w-full text-sm rounded-lg px-3 py-2 transition-shadow duration-150 " +
                      (active
                        ? "bg-white/12 shadow-inner ring-1 ring-white/20 font-semibold"
                        : "hover:bg-white/6")
                    }
                  >
                    <span
                      className={
                        "flex-none w-9 h-9 rounded-md flex items-center justify-center text-teal-50 " +
                        (active
                          ? "bg-white/20"
                          : "bg-white/10 group-hover:bg-white/20")
                      }
                      aria-hidden
                    >
                      <item.icon />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    <span className="text-xs text-white/80">›</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-6 text-xs text-white/75">
          <p>Quick actions</p>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm">
              New Ward
            </button>
            <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm">
              Schedule
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function facilitiesIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="text-white/95"
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M7 7v-2h2v2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function wardsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="text-white/95"
    >
      <path d="M3 7h18v10H3z" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 11v4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M12 11v4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M16 11v4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function appointmentsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="text-white/95"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M16 3v4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M8 11h6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M8 15h6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
