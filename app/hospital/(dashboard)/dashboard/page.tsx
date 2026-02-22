"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaUserInjured, FaCalendarCheck, FaFileMedicalAlt, FaArrowUp, FaStethoscope } from 'react-icons/fa';

interface Appointment {
    id: string;
    individual: {
        firstName: string;
        lastName: string;
    }
    date: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalPatients: 0,
        appointmentsToday: 0,
        revenue: 0,
        pendingReports: 0
    });
    const [loading, setLoading] = useState(true);

    const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            
            try {
                // In a real app, this would be a single optimized dashboard stats endpoint
                const res = await fetch(`/api/appointments?userId=${user.id}&role=${user.role}`);
                if (res.ok) {
                    const appointments: Appointment[] = await res.json();
                    
                    // Stats
                    const uniquePatients = new Set(appointments.map(a => a.individual.firstName + a.individual.lastName)).size;
                    const today = new Date().toISOString().split('T')[0];
                    const todayAppointments = appointments.filter(a => a.date.toString().startsWith(today)).length;
                    const revenueCount = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CONFIRMED').length;
                    
                    setStats({
                        totalPatients: uniquePatients,
                        appointmentsToday: todayAppointments,
                        revenue: revenueCount * 50, // Mock revenue logic
                        pendingReports: 3 // Mock pending reports
                    });

                    // Recent Appointments (Last 5)
                    setRecentAppointments(appointments.slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/appointments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                // Refresh local state
                setRecentAppointments(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
                // Update stats would require refetching or complex local logic, skipping for brevity
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hospital Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview of hospital performance and activities.</p>
                </div>
                <div className="flex items-center gap-3">
                     <span className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                     </span>
                     <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-teal-200 transition-all duration-300 transform hover:-translate-y-0.5">
                        + New Appointment
                     </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Patients" 
                    value={stats.totalPatients.toString()} 
                    icon={<FaUserInjured className="w-6 h-6 text-white" />}
                    trend="+12% this month"
                    color="bg-gradient-to-br from-teal-500 to-teal-400"
                    shadow="shadow-teal-200"
                />
                <StatCard 
                    title="Appointments Today" 
                    value={stats.appointmentsToday.toString()} 
                    icon={<FaCalendarCheck className="w-6 h-6 text-white" />}
                    trend={`${stats.appointmentsToday > 0 ? 'Busy day ahead' : 'No appointments yet'}`}
                    color="bg-gradient-to-br from-blue-500 to-blue-400"
                    shadow="shadow-blue-200"
                />
                <StatCard 
                    title="Pending Reports" 
                    value={stats.pendingReports.toString()} 
                    icon={<FaFileMedicalAlt className="w-6 h-6 text-white" />}
                    trend="Requires attention"
                    color="bg-gradient-to-br from-orange-500 to-orange-400"
                    shadow="shadow-orange-200"
                />
                <StatCard 
                    title="Revenue (Est.)" 
                    value={`$${stats.revenue}`} 
                    icon={<FaStethoscope className="w-6 h-6 text-white" />}
                    trend="+5% from last week"
                    color="bg-gradient-to-br from-emerald-500 to-emerald-400"
                    shadow="shadow-emerald-200"
                />
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Chart/Activity) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Chart Placeholder */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Weekly Activity</h3>
                            <button className="text-sm text-teal-600 font-semibold hover:underline">View Report</button>
                        </div>
                        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 group-hover:border-teal-200 transition-colors">
                            <span className="text-gray-400 text-sm font-medium">Chart Visualization Loading...</span>
                        </div>
                    </div>

                    {/* Recent Appointments Table */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Recent Appointments</h3>
                             <button className="text-sm text-teal-600 font-semibold hover:underline">See All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Patient</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 rounded-r-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentAppointments.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                                No recent appointments found.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentAppointments.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                                                        {app.individual.firstName[0]}{app.individual.lastName[0]}
                                                    </div>
                                                    {app.individual.firstName} {app.individual.lastName}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(app.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                    ${app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                                                      app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                                                      app.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 flex gap-2">
                                                {app.status === 'PENDING' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(app.id, 'CONFIRMED')}
                                                            className="text-green-600 hover:text-green-800 font-medium text-xs px-2 py-1 bg-green-50 rounded border border-green-200"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}
                                                            className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 bg-red-50 rounded border border-red-200"
                                                        >
                                                            Decline
                                                        </button>
                                                    </>
                                                )}
                                                {app.status !== 'PENDING' && (
                                                     <button className="text-gray-500 hover:text-teal-600 font-medium text-xs">View Details</button>
                                                )}
                                            </td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column (Notifications/Quick Stats) */}
                <div className="space-y-8">
                     {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -m-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-bold mb-4 relative z-10">Quick Actions</h3>
                        <div className="space-y-3 relative z-10">
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/5 group">
                                <div className="p-2 bg-teal-500 rounded-lg group-hover:scale-110 transition-transform">
                                    <FaCalendarCheck className="w-4 h-4" />
                                </div>
                                <span className="font-medium">Schedule Visit</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/5 group">
                                <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                                    <FaUserInjured className="w-4 h-4" />
                                </div>
                                <span className="font-medium">Register Patient</span>
                            </button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Notifications</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-red-400 shrink-0"></div>
                                    <div>
                                        <p className="text-sm text-gray-800 font-medium">New lab results available</p>
                                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, color, shadow }: any) {
    return (
        <div className={`bg-white rounded-2xl p-6 shadow-lg ${shadow} border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150 group-hover:scale-125 duration-500">
                {icon}
            </div>
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-md`}>
                    {icon}
                </div>
            </div>
            <div>
                <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                    <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
                </div>
                <div className="mt-3 flex items-center text-xs font-medium text-green-600">
                    <FaArrowUp className="w-3 h-3 mr-1" />
                    <span>{trend}</span>
                </div>
            </div>
        </div>
    );
}