"use client";

import React, { useState } from "react";

type Bed = { id: string; label: string; available: boolean };
type Ward = { id: string; name: string; beds: Bed[] };
type WardGroup = { id: string; name: string; wards: Ward[] };

export default function WardDetails({
  group,
  onChange,
}: {
  group: WardGroup;
  onChange?: (groupId: string, available: number, occupied: number) => void;
}) {
  // local state to allow toggling bed availability
  const [wards, setWards] = useState<Ward[]>(group.wards);

  function toggleBed(wardId: string, bedId: string) {
    setWards((prev) => {
      const next = prev.map((w) =>
        w.id === wardId
          ? {
              ...w,
              beds: w.beds.map((b) =>
                b.id === bedId ? { ...b, available: !b.available } : b,
              ),
            }
          : w,
      );

      if (onChange) {
        // compute totals for this group and notify parent
        const available = next.reduce(
          (sum, w) => sum + w.beds.filter((b) => b.available).length,
          0,
        );
        const occupied = next.reduce(
          (sum, w) => sum + w.beds.filter((b) => !b.available).length,
          0,
        );
        onChange(group.id, available, occupied);
      }

      return next;
    });
  }

  // notify parent of initial counts on mount
  React.useEffect(() => {
    if (onChange) {
      const available = wards.reduce(
        (sum, w) => sum + w.beds.filter((b) => b.available).length,
        0,
      );
      const occupied = wards.reduce(
        (sum, w) => sum + w.beds.filter((b) => !b.available).length,
        0,
      );
      onChange(group.id, available, occupied);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-sky-700">{group.name}</h3>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {wards.map((ward) => (
          <div key={ward.id} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sky-800">{ward.name}</h4>
              <div className="text-xs text-gray-500">
                {ward.beds.length} beds
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {ward.beds.map((b) => (
                <div
                  key={b.id}
                  className={
                    "relative text-xs font-medium rounded-md h-12 flex items-center justify-between px-3 " +
                    (b.available
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800")
                  }
                  aria-label={`Bed ${b.label} ${b.available ? "available" : "occupied"}`}
                >
                  <span>{b.label}</span>

                  <button
                    onClick={() => toggleBed(ward.id, b.id)}
                    className={
                      "ml-2 w-7 h-7 rounded-full flex items-center justify-center border-2 " +
                      (b.available
                        ? "border-white bg-white/10 text-white"
                        : "bg-white text-emerald-600 border-white")
                    }
                    aria-pressed={!b.available}
                    aria-label={
                      b.available ? "Mark occupied" : "Mark available"
                    }
                    title={b.available ? "Mark occupied" : "Mark available"}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
