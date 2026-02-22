"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaHeartbeat, FaTint, FaLungs, FaBrain, FaSearchLocation, FaArrowRight, FaCalendarCheck, FaFileMedical } from 'react-icons/fa';
import { MdHealthAndSafety, MdBloodtype } from "react-icons/md";
import { IoScanCircleOutline } from "react-icons/io5";
import { GoGraph } from "react-icons/go";
import HomeSkeleton from '@/app/components/skeletons/HomeSkeleton';
import { useAuth } from '@/app/contexts/AuthContext';

const HomePage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        // Load appointments
        const loadAppointments = async () => {
            try {
                if (user?.id) {
                    const response = await fetch(`/api/appointments?userId=${user.id}&role=INDIVIDUAL`);
                    if (response.ok) {
                        const data = await response.json();
                        setAppointments(data);
                    }
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to load appointments:', error);
                setIsLoading(false);
            }
        };

        loadAppointments();
    }, [user, isAuthenticated, router]);

    // Get user name from profile
    const userName = user?.individualProfile?.firstName || "User";
    
    // Get time of day for greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    // Mock data for health metrics
    const healthMetrics = [
        {
            id: 1,
            label: "Heart Rate",
            value: "72",
            unit: "bpm",
            status: "Normal",
            description: "Within optimal range (60-100 bpm)",
            icon: <FaHeartbeat className="text-rose-500 text-2xl" />,
            bgColor: "bg-rose-50",
            textColor: "text-rose-600"
        },
        {
            id: 2,
            label: "Oxygen Saturation",
            value: "98",
            unit: "%",
            status: "Excellent",
            description: "Optimal oxygen levels detected",
            icon: <MdBloodtype className="text-blue-500 text-2xl" />,
            bgColor: "bg-blue-50",
            textColor: "text-blue-600"
        },
        {
            id: 3,
            label: "Respiration Rate",
            value: "16",
            unit: "rpm",
            status: "Normal",
            description: "Breathing pattern is steady",
            icon: <FaLungs className="text-emerald-500 text-2xl" />,
            bgColor: "bg-emerald-50",
            textColor: "text-emerald-600"
        },
        {
            id: 4,
            label: "Stress Level",
            value: "Low",
            unit: "",
            status: "Good",
            description: "Mental state appears calm",
            icon: <FaBrain className="text-purple-500 text-2xl" />,
            bgColor: "bg-purple-50",
            textColor: "text-purple-600"
        }
    ];

    const dailyTip = {
        title: "Stay Hydrated!",
        content: "Drinking water before meals can help you feel fuller and aid in digestion. Aim for at least 8 glasses today."
    };

    if (isLoading) {
        return <HomeSkeleton />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header / Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{greeting}, {userName}</h1>
                    <p className="text-gray-500 mt-1">Here's your daily health overview.</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Last scan: Yesterday, 4:20 PM
                   </div>
                </div>
            </div>

            {/* Main Action - Scan Module */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-200 text-white transform hover:scale-[1.01] transition-all duration-300">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-6 text-center md:text-left max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium border border-white/10 w-fit mx-auto md:mx-0 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            AI-Powered Analysis
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">
                                Ready for your checkup?
                            </h2>
                            <p className="text-indigo-100 text-lg leading-relaxed font-light">
                                Perform a comprehensive scan to measure your vitals and receive instant, personalized health insights.
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <Link href="/individual/analyse" className="group relative inline-flex items-center gap-3 bg-white text-indigo-600 pl-6 pr-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-900/20 hover:shadow-2xl hover:bg-indigo-50 transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-white/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-indigo-50 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <IoScanCircleOutline className="text-3xl" />
                            </div>
                            <div className="relative flex flex-col items-start leading-tight">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</span>
                                <span className="text-lg text-indigo-900">Start New Scan</span>
                            </div>
                            <FaArrowRight className="relative ml-2 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Metrics */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                             <GoGraph className="text-gray-500"/> Recent Metrics
                        </h3>
                        {/* <button className="text-indigo-600 text-sm font-medium hover:underline">View History</button> */}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {healthMetrics.map((metric) => (
                            <div key={metric.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                                        {metric.icon}
                                    </div>
                                    <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${metric.textColor} ${metric.bgColor}`}>
                                        {metric.status}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium mb-1">{metric.label}</p>
                                    <div className="flex items-end gap-1 mb-2">
                                        <h4 className="text-2xl font-bold text-gray-900">{metric.value}</h4>
                                        <span className="text-gray-400 text-xs font-medium mb-1.5 uppercase">{metric.unit}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{metric.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Advice & Actions */}
                <div className="space-y-6">
                    {/* Find Care Box */}
                    <Link href="/individual/search" className="block group">
                        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                                        <FaSearchLocation className="text-2xl text-white" />
                                    </div>
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">NEW</span>
                                </div>
                                
                                <h3 className="text-xl font-bold mb-2">Find Nearby Care</h3>
                                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                    Locate hospitals, clinics, and specialists based on your current health status.
                                </p>
                                
                                <div className="flex items-center gap-2 text-sm font-bold bg-white text-indigo-600 w-fit px-5 py-2.5 rounded-xl shadow-lg transition-transform group-hover:translate-x-1">
                                    Search Now <FaArrowRight />
                                </div>
                            </div>
                        </div>
                    </Link>

                

                    {/* Daily Insight */}
                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-100 rounded-full opacity-50"></div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-semibold text-amber-800 flex items-center gap-2 mb-3">
                                <MdHealthAndSafety className="text-amber-600"/> Daily Insight
                            </h3>
                            <h4 className="font-bold text-amber-900 mb-2">{dailyTip.title}</h4>
                            <p className="text-amber-800 text-sm leading-relaxed">
                                {dailyTip.content}
                            </p>
                        </div>
                    </div>

                    {/* Secondary Actions */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-indigo-50 p-2 rounded-xl text-lg">⚡</span>
                            <h4 className="font-bold text-gray-900">Quick Actions</h4>
                        </div>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={() => router.push('/individual/appointments/book')}
                                className="w-full group bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg hover:shadow-indigo-50/50 p-4 rounded-2xl flex items-center justify-between transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2.5 rounded-xl text-indigo-600 shadow-sm border border-gray-100 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                        <FaCalendarCheck />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">Schedule Visit</span>
                                        <span className="text-xs text-gray-400 font-medium">Book a doctor appointment</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shadow-sm border border-gray-50">
                                    <FaArrowRight className="text-xs" />
                                </div>
                            </button>

                            <button className="w-full group bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg hover:shadow-blue-50/50 p-4 rounded-2xl flex items-center justify-between transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-sm border border-gray-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        <FaFileMedical />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-gray-800 group-hover:text-blue-700 transition-colors">Health Report</span>
                                        <span className="text-xs text-gray-400 font-medium">Download your latest history</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shadow-sm border border-gray-50">
                                    <FaArrowRight className="text-xs" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Upcoming Appointments Section - New */}
                <div className="lg:col-span-3 mt-8">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                             <FaCalendarCheck className="text-indigo-500"/> My Appointments
                        </h3>
                        <Link href="/individual/appointments/book" className="text-indigo-600 text-sm font-bold hover:underline bg-indigo-50 px-4 py-2 rounded-lg">
                            + Book New
                        </Link>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaCalendarCheck className="text-gray-300 text-2xl" />
                            </div>
                            <h4 className="text-gray-900 font-bold mb-1">No upcoming appointments</h4>
                            <p className="text-gray-500 text-sm mb-6">Your schedule is clear. Need to see a doctor?</p>
                            <Link href="/individual/appointments/book" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                Book an Appointment
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {appointments.map((app: any) => (
                                <div key={app.id} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                     <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-20 transition-colors ${
                                        app.status === 'CONFIRMED' ? 'bg-green-500' : 
                                        app.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}></div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            app.status === 'CONFIRMED' ? 'bg-green-50 text-green-600' : 
                                            app.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {app.status}
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{app.hospital?.name || 'Unknown Hospital'}</h4>
                                    <p className="text-gray-500 text-xs mb-4 line-clamp-1">{app.hospital?.address || 'No address provided'}</p>

                                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                        <div className="flex items-center gap-3 text-sm text-gray-700 font-medium mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <span className="font-bold">{new Date(app.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-400 uppercase">Date & Time</span>
                                                {new Date(app.date).toLocaleDateString()} at {new Date(app.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="text-xs font-semibold text-gray-400">Dr. {app.doctor?.firstName || 'Assigned soon'}</span>
                                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors">
                                            <FaArrowRight className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;