"use client";

import React, { useState } from "react";
import WardDetails from "./components/WardDetails";

function makeBeds(count: number, start = 1) {
  return Array.from({ length: count }).map((_, i) => ({
    id: `b-${start + i}`,
    label: `Bed ${start + i}`,
    available: Math.random() > 0.3,
  }));
}

const groups = [
  {
    id: "g1",
    name: "General wards",
    wards: [
      { id: "w1", name: "General Ward A", beds: makeBeds(8, 1) },
      { id: "w2", name: "General Ward B", beds: makeBeds(12, 9) },
    ],
  },
  {
    id: "g2",
    name: "Maternity and neonatal wards",
    wards: [
      { id: "w3", name: "Maternity Ward", beds: makeBeds(6, 21) },
      { id: "w4", name: "Neonatal Unit", beds: makeBeds(4, 27) },
    ],
  },
  {
    id: "g3",
    name: "Critical and emergency units",
    wards: [
      { id: "w5", name: "Emergency Unit", beds: makeBeds(6, 31) },
      { id: "w6", name: "ICU", beds: makeBeds(6, 37) },
    ],
  },
  {
    id: "g4",
    name: "Specialty wards",
    wards: [
      { id: "w7", name: "Cardiology", beds: makeBeds(5, 43) },
      { id: "w8", name: "Oncology", beds: makeBeds(5, 48) },
    ],
  },
];

export default function Page() {
  const [groupCounts, setGroupCounts] = useState<
    Record<string, { available: number; occupied: number }>
  >(() => {
    const map: Record<string, { available: number; occupied: number }> = {};
    groups.forEach((g) => {
      const available = g.wards.reduce(
        (sum, w) => sum + w.beds.filter((b) => b.available).length,
        0,
      );
      const occupied = g.wards.reduce(
        (sum, w) => sum + w.beds.filter((b) => !b.available).length,
        0,
      );
      map[g.id] = { available, occupied };
    });
    return map;
  });

  function handleGroupChange(
    groupId: string,
    available: number,
    occupied: number,
  ) {
    setGroupCounts((prev) => ({ ...prev, [groupId]: { available, occupied } }));
  }

  const totals = Object.values(groupCounts).reduce(
    (acc, g) => ({
      available: acc.available + g.available,
      occupied: acc.occupied + g.occupied,
    }),
    { available: 0, occupied: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-sky-800">Wards</h2>
          <p className="text-sm text-gray-600">
            Select a ward to view bed availability.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-3 py-2 rounded-md bg-emerald-50 text-emerald-800 font-semibold">
            Available: {totals.available}
          </div>
          <div className="px-3 py-2 rounded-md bg-red-50 text-red-800 font-semibold">
            Occupied: {totals.occupied}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {groups.map((g) => (
          <WardDetails key={g.id} group={g} onChange={handleGroupChange} />
        ))}
      </div>
    </div>
  );
}
