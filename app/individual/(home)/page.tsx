"use client";

import React from 'react';
import Link from 'next/link';
import { FaHeartbeat, FaTint, FaLungs, FaBrain } from 'react-icons/fa';
import { MdHealthAndSafety, MdBloodtype } from "react-icons/md";
import { IoScanCircleOutline } from "react-icons/io5";
import { GoGraph } from "react-icons/go";

const HomePage = () => {
    // Mock user name - in a real app, fetch from auth context
    const userName = "Alex";
    
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
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-10 shadow-xl text-white transform hover:scale-[1.01] transition-transform duration-300">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-4 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold">Ready for your health check?</h2>
                        <p className="text-indigo-100 max-w-lg">
                            Perform a quick scan to measure your vitals and get instant AI-powered health insights.
                        </p>
                    </div>
                    <div>
                        <Link href="/individual/analyse" className="group relative inline-flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all duration-300">
                            <IoScanCircleOutline className="text-3xl group-hover:scale-110 transition-transform" />
                            <span>Start New Scan</span>
                            
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
                            <div key={metric.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                                        {metric.icon}
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${metric.bgColor} ${metric.textColor}`}>
                                        {metric.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">{metric.label}</p>
                                    <div className="flex items-end gap-1">
                                        <h4 className="text-2xl font-bold text-gray-800">{metric.value}</h4>
                                        <span className="text-gray-400 text-sm mb-1">{metric.unit}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{metric.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Advice & Actions */}
                <div className="space-y-6">
                     <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                         <MdHealthAndSafety className="text-gray-500"/> Daily Insight
                    </h3>
                    
                    {/* Advice Card */}
                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-100 rounded-full opacity-50"></div>
                        <h4 className="font-bold text-amber-800 mb-2 relative z-10">{dailyTip.title}</h4>
                        <p className="text-amber-700 text-sm leading-relaxed relative z-10">
                            {dailyTip.content}
                        </p>
                    </div>

                    {/* Secondary Actions */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <h4 className="font-medium text-gray-800 mb-4">Quick Actions</h4>
                        <div className="space-y-2">
                             <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-medium flex items-center justify-between transition-colors">
                                <span>Schedule Appointment</span>
                                <span className="text-gray-400">→</span>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-medium flex items-center justify-between transition-colors">
                                <span>Download Health Report</span>
                                <span className="text-gray-400">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;