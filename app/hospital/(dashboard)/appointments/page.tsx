import React from "react";
import AppointmentsCard from "./components/AppointmentsCard";

function randomDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
  return d.toISOString();
}

const sample = [
  {
    id: "a1",
    name: "Ada Lovelace",
    phone: "+1 555-0101",
    address: "12 Tech Lane",
    date: randomDate(0),
    status: "unsettled",
    report: "Fever and cough",
  },
  {
    id: "a2",
    name: "Grace Hopper",
    phone: "+1 555-0102",
    address: "34 Code Ave",
    date: randomDate(1),
    status: "settled",
    report: "Post-op check",
  },
  {
    id: "a3",
    name: "Alan Turing",
    phone: "+1 555-0103",
    address: "56 Logic St",
    date: randomDate(2),
    status: "settled",
    report: "Headache and nausea",
  },
  {
    id: "a4",
    name: "Linus Torvalds",
    phone: "+1 555-0104",
    address: "78 Kernel Rd",
    date: randomDate(3),
    status: "unsettled",
    report: "Wound inspection",
  },
  {
    id: "a5",
    name: "Margaret Hamilton",
    phone: "+1 555-0105",
    address: "90 Moon Blvd",
    date: randomDate(4),
    status: "cancelled",
    report: "Scheduling conflict",
  },
];

export default function Page() {
  // show only unsettled patients
  const unsettled = sample.filter((s) => s.status === "unsettled");

  return (
    <div>
      <AppointmentsCard
        appointments={unsettled.map((s) => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          date: s.date,
          status: s.status as any,
          report: s.report,
          address: s.address,
        }))}
      />
    </div>
  );
}
