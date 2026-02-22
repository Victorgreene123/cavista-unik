"use client";

import React, { useState } from "react";

type Appointment = {
  id: string;
  name: string;
  
  phone: string;
  date: string; // ISO or human readable
  status: string | "unsettled" | "settled" | "cancelled";
  report?: string;
};

export default function AppointmentsCard({
  appointments: initialAppointments,
}: {
  appointments?: Appointment[];
}) {
  const sampleReports = [
    "Fever, cough and sore throat for 3 days",
    "Recurring headaches, nausea",
    "Shortness of breath on exertion",
    "Mild chest pain after exercise",
    "Follow-up after surgery, wound check",
    "Allergic reaction to medication",
    "Routine check-up, no major complaints",
    "High blood pressure readings",
    "Diabetic foot pain and swelling",
    "Abdominal pain and cramps",
  ];

  const sample: Appointment[] = [
    ...Array.from({ length: 10 }).map((_, i) => ({
      id: `u-${i}`,
      name: `Patient ${i + 1}`,
      phone: `+1 (555) 010-${String(1000 + i).slice(-4)}`,
      date: new Date(Date.now() + i * 86400000).toISOString(),
      status: i < 8 ? "unsettled" : i === 8 ? "settled" : "cancelled",
      report: sampleReports[i % sampleReports.length],
    })),
  ];

  const [items, setItems] = useState<Appointment[]>(
    initialAppointments ?? sample,
  );
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const initialCancelled =
    (initialAppointments ?? sample).filter((s) => s.status === "cancelled")
      .length || 1;
  const [staticCancelled] = useState<number>(initialCancelled);

  // Start with a mock settled count (from provided data if any)
  const initialSettled =
    (initialAppointments ?? sample).filter((s) => s.status === "settled")
      .length || 5;
  const [settledCount, setSettledCount] = useState<number>(initialSettled);
  const [unsettledCount, setUnsettledCount] = useState<number>(
    (initialAppointments ?? sample).filter((s) => s.status === "unsettled")
      .length,
  );
  const [openReportId, setOpenReportId] = useState<string | null>(null);

  const totalCount = unsettledCount + settledCount + staticCancelled;
  const counts = {
    total: totalCount,
    unsettled: unsettledCount,
    settled: settledCount,
    cancelled: staticCancelled,
  };

  function updateReport(id: string, report: string) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, report } : p)));
  }

  function updateStatus(id: string, status: Appointment["status"]) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  return (
    <section className="space-y-4">
      {/* Card header / stats */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-sky-700">Appointments</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 rounded-full">
              <span className="text-sm font-medium text-sky-700">Total</span>
              <span className="text-sm font-semibold text-sky-900">
                {counts.total}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span className="text-sm text-gray-700">
                {counts.unsettled} unsettled
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-sm text-gray-700">
                {counts.settled} settled
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              <span className="text-sm text-gray-700">
                {counts.cancelled} cancelled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments list */}
      <div className="space-y-3">
        {items.map((a) => (
          <div
            key={a.id}
            className={
              "rounded-md p-4 transition-transform duration-500 " +
              (a.status === "unsettled"
                ? "bg-sky-50"
                : a.status === "settled"
                  ? "bg-emerald-50"
                  : "bg-red-50") +
              (removingId === a.id ? " transform translate-x-40 opacity-0" : "")
            }
            style={{ minHeight: 120 }}
          >
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold">
                    {a.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-sky-800">
                      {a.name}
                    </div>
                    <div className="text-xs text-gray-500">{a.phone}</div>
                    <div className="text-xs text-gray-500">
                      {(a as any).address ?? ""}
                    </div>
                  </div>
                </div>
              </div>

              <div className= "md:ml-6 md:w-48 text-sm text-gray-600">
                {new Date(a.date).toLocaleString()}
              </div>

              <div className="flex items-center gap-3">
                {a.status === "unsettled" ? (
                  <button
                    onClick={() => setConfirmingId(a.id)}
                    title="Accept"
                    className="w-9 h-9 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="#059669"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : (
                  <div className="text-sm text-gray-600 capitalize">
                    {a.status}
                  </div>
                )}

                <button
                  onClick={() =>
                    setOpenReportId(openReportId === a.id ? null : a.id)
                  }
                  className={
                    "w-9 h-9 rounded-full bg-white/50 flex items-center justify-center transition-transform " +
                    (openReportId === a.id ? "rotate-180" : "")
                  }
                  aria-label="Toggle report"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="#334155"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div
              className={
                "w-full mt-3 overflow-hidden transition-all duration-300 " +
                (openReportId === a.id ? "max-h-60" : "max-h-0")
              }
            >
              <div className="mt-2 p-3 bg-white/70 rounded-md text-sm text-gray-700">
                {a.report ?? "No report provided."}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Confirmation modal */}
      {confirmingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmingId(null)}
          />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h4 className="text-lg font-semibold">Confirm settlement</h4>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to mark this appointment as settled?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-3 py-1 rounded bg-gray-100"
                onClick={() => setConfirmingId(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-emerald-600 text-white"
                onClick={() => {
                  if (!confirmingId) return;
                  // start slide animation
                  setRemovingId(confirmingId);
                  setTimeout(() => {
                    // increment settled, decrement unsettled, remove from list
                    setSettledCount((s) => s + 1);
                    setUnsettledCount((u) => Math.max(0, u - 1));
                    setItems((prev) =>
                      prev.filter((p) => p.id !== confirmingId),
                    );
                    setRemovingId(null);
                    setConfirmingId(null);
                  }, 420);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
