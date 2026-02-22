"use client";

import React, { useState, useEffect } from 'react';
import SearchSkeleton from '@/app/components/skeletons/SearchSkeleton';
import Link from 'next/link';
import { 
    FaSearch, FaPhoneAlt, FaUserMd, FaChevronDown
} from 'react-icons/fa';
import { MdLocalHospital } from 'react-icons/md';

// --- Types ---
interface Hospital {
    id: string;
    name: string;
    address: string;
    doctors?: Array<{ id: string; firstName: string; lastName: string; specialization: string }>;
}

const SPECIALTIES = ["All", "Cardiology", "Pediatrics", "Neurology", "Orthopedics"];

const SearchPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Load hospitals on mount
    useEffect(() => {
        const loadHospitals = async () => {
            try {
                setIsLoading(true);
                const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
                const response = await fetch(`/api/hospitals${query}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch hospitals');
                }
                
                const data = await response.json();
                setHospitals(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load hospitals');
                console.error('Error loading hospitals:', err);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            loadHospitals();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (isLoading) {
        return <SearchSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 pb-20 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Hospitals</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 pb-20">
            <div className="w-full max-w-7xl mx-auto space-y-6">
                
                {/* Search Header */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                    
                    <div className="relative z-10">
                        <Link href="/individual" className="inline-flex items-center text-sm text-gray-400 hover:text-indigo-600 mb-4 transition-colors">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Medical Care</h1>
                        <p className="text-gray-500 mb-6 max-w-xl">
                            Search for nearby hospitals, clinics, and specialists.
                        </p>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search hospitals or specialities..." 
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="px-6 py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 whitespace-nowrap">
                                Search
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
                            {SPECIALTIES.map((cat) => (
                                <button 
                                    key={cat}
                                    className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Results Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-bold text-gray-800">
                                {hospitals.length} Facilities Found
                            </h2>
                        </div>

                        {hospitals.length === 0 ? (
                             <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                                 <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                     <FaSearch size={24} />
                                 </div>
                                 <h3 className="text-gray-900 font-bold mb-1">No hospitals found</h3>
                                 <p className="text-gray-500 text-sm">Try adjusting your search term.</p>
                             </div>
                        ) : (
                            hospitals.map((hospital) => (
                                <div key={hospital.id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${expandedId === hospital.id ? 'border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
                                    {/* Card Header (Clickable) */}
                                    <div className="p-5 cursor-pointer" onClick={() => toggleExpand(hospital.id)}>
                                        <div className="flex flex-col sm:flex-row gap-5">
                                            {/* Image/Icon Placeholder */}
                                            <div className="w-full sm:w-24 h-24 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                                <MdLocalHospital className="text-4xl text-indigo-500" />
                                            </div>
                                            
                                            {/* Header Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-bold text-gray-900 truncate">{hospital.name}</h3>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{hospital.address}</p>
                                                    </div>
                                                    <FaChevronDown className={`text-gray-400 shrink-0 ml-4 transition-transform ${expandedId === hospital.id ? 'rotate-180' : ''}`} />
                                                </div>
                                                
                                                {/* Doctor Info */}
                                                {hospital.doctors && hospital.doctors.length > 0 && (
                                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                        {hospital.doctors.slice(0, 2).map((doc, idx) => (
                                                            <div key={idx} className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                                                                <FaUserMd className="text-xs" />
                                                                <span>{doc.firstName}</span>
                                                            </div>
                                                        ))}
                                                        {hospital.doctors.length > 2 && (
                                                            <span className="text-xs text-gray-500">+{hospital.doctors.length - 2} more</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedId === hospital.id && (
                                        <div className="px-5 pb-5 border-t border-gray-100 space-y-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-2">Doctors</h4>
                                                <div className="space-y-2">
                                                    {hospital.doctors && hospital.doctors.length > 0 ? (
                                                        hospital.doctors.map((doc, idx) => (
                                                            <div key={idx} className="flex items-center justify-between text-sm p-2 bg-white rounded border border-gray-100">
                                                                <div className="flex items-center gap-2">
                                                                    <FaUserMd className="text-indigo-400" />
                                                                    <span className="font-medium text-gray-800">{doc.firstName} {doc.lastName}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-gray-500">{doc.specialization}</span>
                                                                    <Link 
                                                                        href={`/individual/appointments/book?doctorId=${doc.id}`}
                                                                        className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition-colors"
                                                                    >
                                                                        Book
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No doctors available</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block space-y-6">
                        {/* Emergency Card */}
                        <div className="bg-indigo-900 text-white p-6 rounded-3xl relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
                            
                            <h3 className="text-lg font-bold mb-2 relative z-10 flex items-center gap-2">
                                <FaPhoneAlt className="text-red-400"/> Emergency?
                            </h3>
                            <p className="text-indigo-200 text-sm mb-6 relative z-10">
                                If experiencing severe symptoms, call emergency services immediately.
                            </p>
                            <a href="tel:911" className="block w-full text-center py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg relative z-10">
                                Call 911
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SearchPage