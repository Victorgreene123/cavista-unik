"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { 
    FaHistory, FaCalendarCheck, FaFileMedical, FaUserMd, 
    FaHeartbeat, FaChevronRight, FaHospital 
} from 'react-icons/fa';
import { MdHealthAndSafety, MdOutlineMonitorHeart } from "react-icons/md";
import { format } from 'date-fns';

type TabType = 'appointments' | 'scans' | 'reports';

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    reason: string;
    hospital: { name: string };
    doctor: { firstName: string; lastName: string; specialization: string };
}

interface Scan {
    id: string;
    createdAt: string;
    overallScore: number;
    heartRate: number;
    oxygenSaturation: number;
    stressLevel: string;
    aiAnalysis: string;
}

interface Report {
    id: string;
    createdAt: string;
    title: string;
    summary: string;
    doctor: { firstName: string; lastName: string };
}

const HistoryPage = () => {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('appointments');
    const [isLoading, setIsLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [scans, setScans] = useState<Scan[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        
        const loadData = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Determine what to fetch based on active tab to optimize or fetch all?
                // For simplicity and smoother UX, fetching independently but all on mount could work too.
                // Let's fetch based entirely on the active tab to save bandwidth if lists grow.
                
                if (activeTab === 'appointments') {
                    const res = await fetch(`/api/appointments?userId=${user?.id}&role=INDIVIDUAL`);
                    if (!res.ok) throw new Error('Failed to load appointments');
                    const data = await res.json();
                    setAppointments(data);
                } 
                else if (activeTab === 'scans') {
                     const res = await fetch(`/api/health-scans?userId=${user?.id}`);
                     if (!res.ok) throw new Error('Failed to load health scans');
                     const data = await res.json();
                     setScans(data);
                } 
                else if (activeTab === 'reports') {
                    const res = await fetch(`/api/reports?userId=${user?.id}`);
                    if (!res.ok) throw new Error('Failed to load medical reports');
                    const data = await res.json();
                    setReports(data);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to load history data');
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.id) {
            loadData();
        }
    }, [user, isAuthenticated, router, activeTab]);

    const renderTabButton = (id: TabType, label: string, icon: React.ReactNode) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse">
                            <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-12 bg-white rounded-3xl border border-red-100">
                    <p className="text-red-500 mb-2">Unavailable</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 text-indigo-600 font-medium text-sm hover:underline"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        if (activeTab === 'appointments') {
            if (appointments.length === 0) return <EmptyState label="No appointments found" />;
            
            return (
                <div className="space-y-4">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                        <FaCalendarCheck className="text-indigo-500 text-lg" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900">
                                                {apt.doctor?.firstName ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` : 'General Consultation'}
                                            </h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                                                apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                            <FaHospital className="text-indigo-300" />
                                            <span>{apt.hospital?.name || 'Unknown Hospital'}</span>
                                        </div>
                                        {/* Optional details */}
                                        <p className="text-sm text-gray-600 line-clamp-1">{apt.reason || 'Routine Checkup'}</p>
                                    </div>
                                </div>
                                
                                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center pl-16 md:pl-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-50">
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">{format(new Date(apt.date), 'MMM d, yyyy')}</div>
                                        <div className="text-sm text-gray-500">{apt.time}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (activeTab === 'scans') {
            if (scans.length === 0) return <EmptyState label="No health scans recorded" />;
            
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scans.map((scan) => (
                        <div key={scan.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                                        <MdOutlineMonitorHeart className="text-rose-500 text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Health Scan</h3>
                                        <p className="text-xs text-gray-500">{format(new Date(scan.createdAt), 'MMM d, yyyy • h:mm a')}</p>
                                    </div>
                                </div>
                                <div className={`text-lg font-bold ${
                                    (scan.overallScore || 0) > 80 ? 'text-green-600' : 
                                    (scan.overallScore || 0) > 50 ? 'text-yellow-600' : 'text-red-500'
                                }`}>
                                    {scan.overallScore}%
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <MetricBox label="Heart" value={`${scan.heartRate || '--'} bpm`} />
                                <MetricBox label="Oxygen" value={`${scan.oxygenSaturation || '--'}%`} />
                                <MetricBox label="Stress" value={scan.stressLevel || '--'} />
                            </div>

                            {scan.aiAnalysis && (
                                <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 line-clamp-2 mb-2">
                                    {scan.aiAnalysis}
                                </div>
                            )}
                            
                            <Link href={`/individual/analyse/result?id=${scan.id}`} className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-1">
                                View Full Report <FaChevronRight className="ml-1 text-[10px]" />
                            </Link>
                        </div>
                    ))}
                </div>
            );
        }

        if (activeTab === 'reports') {
            if (reports.length === 0) return <EmptyState label="No medical reports found" />;
            
            return (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                    <FaFileMedical className="text-blue-500 text-xl" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">{report.title || 'Medical Report'}</h3>
                                            <p className="text-xs text-gray-500 mb-2">
                                                Generated on {format(new Date(report.createdAt), 'MMMM d, yyyy')}
                                            </p>
                                        </div>
                                        <button className="text-xs font-medium px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                            Download
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg line-clamp-2">
                                        {report.summary}
                                    </p>
                                    {report.doctor && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                            <FaUserMd className="text-gray-400" />
                                            <span>Dr. {report.doctor.firstName} {report.doctor.lastName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 pb-24">
            <div className="w-full max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My History</h1>
                        <p className="text-gray-500">Track your appointments, scans, and medical records.</p>
                    </div>
                    
                    <div className="flex bg-white p-1 rounded-full border border-gray-100 shadow-sm overflow-x-auto max-w-full">
                        {renderTabButton('appointments', 'Appointments', <FaCalendarCheck />)}
                        {renderTabButton('scans', 'Health Scans', <MdHealthAndSafety />)}
                        {renderTabButton('reports', 'Reports', <FaFileMedical />)}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {renderContent()}
                </div>

            </div>
        </div>
    );
};

// Helper Components
const EmptyState = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FaHistory className="text-gray-300 text-2xl" />
        </div>
        <h3 className="text-gray-900 font-medium mb-1">{label}</h3>
        <p className="text-gray-400 text-sm">No records found for this category.</p>
    </div>
);

const MetricBox = ({ label, value }: { label: string; value: string | number }) => (
    <div className="text-center p-2 bg-gray-50 rounded-lg">
        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="font-bold text-gray-900 text-sm">{value}</p>
    </div>
);

export default HistoryPage;
