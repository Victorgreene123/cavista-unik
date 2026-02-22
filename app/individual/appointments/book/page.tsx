
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function BookAppointmentPage() {
    const { user } = useAuth();
    const router = useRouter();
    
    // Form States
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [selectedHospital, setSelectedHospital] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch Available Hospitals
        const fetchHospitals = async () => {
            try {
                const res = await fetch('/api/hospitals');
                if (res.ok) {
                    const data = await res.json();
                    setHospitals(data);
                }
            } catch (err) {
                console.error("Failed to load hospitals");
            }
        };
        fetchHospitals();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        if (!selectedHospital || !date || !time || !reason) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            // Combine date and time
            const dateTime = new Date(`${date}T${time}:00`);

            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    hospitalId: selectedHospital,
                    date: dateTime.toISOString(),
                    reason: reason,
                    // doctorId: optional
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/individual'), 2000);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to book appointment');
            }

        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
             <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Book Appointment</h1>
                <p className="text-gray-500 mb-6 text-sm">Schedule a visit with your preferred hospital.</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
                {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">Appointment successfully booked! Redirecting...</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Select Hospital */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Hospital</label>
                        <select 
                            value={selectedHospital}
                            onChange={(e) => setSelectedHospital(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        >
                            <option value="">-- Choose a Facility --</option>
                            {hospitals.map(h => (
                                <option key={h.id} value={h.id}>{h.name} ({h.address})</option>
                            ))}
                        </select>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input 
                                type="time" 
                                value={time} 
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                        <textarea 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            rows={3}
                            placeholder="e.g. Persistent headache, Annual checkup..."
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50"
                    >
                        {loading ? 'Confirming...' : 'Confirm Appointment'}
                    </button>
                    
                     <button 
                        type="button" 
                        onClick={() => router.back()}
                        className="w-full py-2 text-gray-500 hover:text-gray-700 font-medium text-sm"
                    >
                        Cancel
                    </button>
                </form>
             </div>
        </div>
    );
}
