"use client";

import React from 'react';
import Link from 'next/link';
import { FaHeartbeat, FaLungs, FaBrain, FaWalking, FaChevronRight } from 'react-icons/fa';
import { MdBloodtype, MdOutlineHealthAndSafety } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";

const ResultPage = () => {
    // Mock Data for Results
    const biometricData = [
        {
            id: 'heart-rate',
            label: 'Heart Rate',
            value: 74,
            unit: 'bpm',
            status: 'Normal',
            icon: <FaHeartbeat className="text-rose-500" />,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            desc: 'Within optimal range (60-100 bpm)',
            recommendation: 'Your heart rate is healthy. Maintain it with consistent cardio (walking, swimming) 3-4 times a week.'
        },
        {
            id: 'oxygen',
            label: 'Oxygen Saturation',
            value: 98,
            unit: '%',
            status: 'Excellent',
            icon: <MdBloodtype className="text-blue-500" />,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            desc: 'Optimal oxygen levels detected',
            recommendation: 'Perfect oxygenation. Continue deep breathing exercises to maximize lung capacity.'
        },
        {
            id: 'respiration',
            label: 'Respiration Rate',
            value: 16,
            unit: 'rpm',
            status: 'Normal',
            icon: <FaLungs className="text-cyan-500" />,
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            desc: 'Breathing pattern is steady',
            recommendation: 'Respiratory rate is normal. Ensure good indoor air quality and stay hydrated.'
        },
        {
            id: 'stress',
            label: 'Stress Level',
            value: 'Low',
            unit: '', 
            status: 'Good',
            icon: <FaBrain className="text-purple-500" />,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            desc: 'Mental state appears calm',
            recommendation: 'Excellent stress management. Keep up mindfulness practices or hobbies that relax you.'
        }
    ];

    const overallScore = 92;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Navigation Header */}
                <div className="flex items-center gap-4">
                    <Link href="/individual" className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600">
                        <IoArrowBack size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Scan Results</h1>
                </div>

                {/* Main Score Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Analysis Verified
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Your vitals look great!</h2>
                        <p className="text-gray-500 leading-relaxed">
                            Based on the optical scan, your physiological markers are well within the healthy range. Keep up the good work maintaining your wellness routine.
                        </p>
                    </div>
                    
                    {/* Score Circle */}
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        {/* Background Circle */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="#f3f4f6"
                                strokeWidth="12"
                            />
                            {/* Progress Circle - assuming 92% */}
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="#4f46e5" // indigo-600
                                strokeWidth="12"
                                strokeDasharray="440"
                                strokeDashoffset={440 - (440 * overallScore) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-indigo-900">{overallScore}</span>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Score</span>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {biometricData.map((metric) => (
                        <div key={metric.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${metric.bg} text-xl`}>
                                    {metric.icon}
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${metric.bg} ${metric.color}`}>
                                    {metric.status}
                                </span>
                            </div>
                            <div className="mb-2">
                                <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                                <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                            </div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">{metric.label}</h3>
                            <p className="text-xs text-gray-400">{metric.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Recommendations / Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Insight */}
                    <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                         <div className="flex items-center gap-2 mb-6">
                            <MdOutlineHealthAndSafety className="text-2xl text-emerald-600" />
                            <h2 className="text-xl font-bold text-gray-900">Health Insights & Recommendations</h2>
                        </div>
                        
                        <div className="grid gap-4">
                            {biometricData.map((metric) => (
                                <div key={metric.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 items-start">
                                    <div className="mt-1 shrink-0">
                                        <div className={`p-2 rounded-lg ${metric.bg} ${metric.color}`}>
                                            {metric.icon}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-1">{metric.label} Analysis</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {metric.recommendation}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Actions */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center space-y-3">
                        <Link href="/individual/history" className="flex items-center justify-between text-gray-600 hover:text-indigo-600 group transition-colors p-2 rounded-lg hover:bg-gray-50">
                            <span className="font-medium text-sm">View Scan History</span>
                            <FaChevronRight className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                        </Link>
                         <div className="h-px bg-gray-100"></div>
                        <Link href="/individual/doctors" className="flex items-center justify-between text-gray-600 hover:text-indigo-600 group transition-colors p-2 rounded-lg hover:bg-gray-50">
                            <span className="font-medium text-sm">Consult a Doctor</span>
                            <FaChevronRight className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                        </Link>
                         <div className="h-px bg-gray-100"></div>
                        <Link href="/individual" className="flex items-center justify-between text-gray-600 hover:text-indigo-600 group transition-colors p-2 rounded-lg hover:bg-gray-50">
                            <span className="font-medium text-sm">Back to Dashboard</span>
                            <FaChevronRight className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResultPage;
