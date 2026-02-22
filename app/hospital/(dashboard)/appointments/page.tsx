"use client";

import React, { useEffect, useState } from "react";
import AppointmentsCard from "./components/AppointmentsCard";
import { useAuth } from "@/app/contexts/AuthContext";

type APIAppointment = {
  id: string;
  individual: {
    firstName: string;
    lastName: string;
  };
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  notes?: string;
};

type CardAppointment = {
  id: string;
  name: string;
  phone: string;
  date: string;
  status: "unsettled" | "settled" | "cancelled";
  report?: string;
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appData, setAppData] = useState<CardAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      
      try {
        const res = await fetch(`/api/appointments?userId=${user.id}&role=${user.role}`);
        if (res.ok) {
          const data: APIAppointment[] = await res.json();
          
          const mapped: CardAppointment[] = data.map((app) => {
            let status: "unsettled" | "settled" | "cancelled" = "unsettled";
            if (app.status === 'CONFIRMED' || app.status === 'COMPLETED') status = "settled";
            if (app.status === 'CANCELLED') status = "cancelled";

            return {
                id: app.id,
                name: `${app.individual?.firstName || 'Unknown'} ${app.individual?.lastName || ''}`,
                phone: 'N/A', 
                date: app.date,
                status: status,
                report: app.reason || 'No details'
            };
          });
          
          setAppData(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchAppointments();
    }
  }, [user]);

  if (loading) {
     return <div className="p-8">Loading appointments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
      </div>

      <AppointmentsCard appointments={appData} />
    </div>
  );
}
