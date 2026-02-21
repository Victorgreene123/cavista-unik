"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
    FaArrowLeft, FaHospital, FaUserMd, FaCalendarAlt, FaClock, 
    FaMicrophone, FaStop, FaFileMedical, FaCheckCircle, 
    FaSpinner, FaTimesCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock Data (Should match search page IDs ideally, but simplified for demo) ---
const DOCTORS = {
    "dr-emily-chen": { name: "Dr. Emily Chen", role: "Cardiologist", hospital: "City General Hospital", image: "bg-blue-100" },
    "dr-james-wilson": { name: "Dr. James Wilson", role: "Neurologist", hospital: "City General Hospital", image: "bg-blue-100" },
    "dr-sarah-johnson": { name: "Dr. Sarah Johnson", role: "Pediatrician", hospital: "Lakeside Medical Center", image: "bg-green-100" },
    "dr-robert-brown": { name: "Dr. Robert Brown", role: "Orthopedic Surgeon", hospital: "Saint Mary's Urgent Care", image: "bg-red-50" },
};

// Simulate API call to check availability
const checkAvailability = async (date: Date, doctorId: string) => {
    return new Promise<{ available: boolean, slots: string[] }>((resolve) => {
        setTimeout(() => {
            // Mock logic: Weekends are unavailable, some random weekdays are full
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            if (isWeekend) {
                resolve({ available: false, slots: [] });
                return;
            }
            
            // Generate some random slots
            const slots = ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM", "04:15 PM"];
            resolve({ available: true, slots });
        }, 800);
    });
};

// Simulate AI Report Generation from Audio
const generateAIReport = async (audioBlob: Blob | null) => {
    return new Promise<string>((resolve) => {
        setTimeout(() => {
            resolve(`**AI Pre-Consult Report**\n\n- **Patient Complaint**: Reported persistent dull ache in chest area, worsening with activity.\n- **Duration**: Symptoms present for approx 3 days.\n- **Severity**: Moderate (4/10 pain scale).\n- **Associated Symptoms**: Mild shortness of breath reported.\n- **Likelihood of Emergency**: Low to Moderate. Recommended EKG screening.`);
        }, 2000);
    });
};

const BookAppointmentPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const doctorId = searchParams.get('doctor') || 'dr-emily-chen'; // Default fallback
    const doctor = DOCTORS[doctorId as keyof typeof DOCTORS] || DOCTORS['dr-emily-chen'];

    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    
    // Voice Note State
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Step 2: Date Selection Effect
    useEffect(() => {
        if (step === 1) {
            setIsLoadingSlots(true);
            setSelectedSlot(null);
            checkAvailability(selectedDate, doctorId).then((result) => {
                setAvailableSlots(result.slots);
                setIsLoadingSlots(false);
            });
        }
    }, [selectedDate, doctorId, step]);

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            // Reset previous recording/report state when starting a new recording
            setAudioBlob(null);
            setAudioUrl(null);
            setAiReport(null);
            setTranscript(null);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please ensure permissions are granted.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const discardRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setAiReport(null);
        setTranscript(null);
        setRecordingTime(0);
    };

    const handleGenerateReport = async () => {
        if (!audioBlob) return;
        setIsGeneratingReport(true);
        setAiReport(null);
        
        try {
            const formData = new FormData();
            // Append file with specific name for Whisper API (needs 'file' key and extension)
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('model', 'whisper-1');

            const response = await fetch('/api/generate-report', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate report');
            }

            const data = await response.json();
            setTranscript(data.transcript);
            setAiReport(data.report);

        } catch (error) {
            console.error("Report Generation Error:", error);
            alert("Failed to analyze voice note. Please try again.");
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleSubmitBooking = () => {
        // Here you would send the booking data + AI report to your backend
        const bookingDetails = {
            id: Math.random().toString(36).substr(2, 9),
            doctor: doctor.name,
            role: doctor.role,
            hospital: doctor.hospital,
            date: selectedDate.toDateString(),
            slot: selectedSlot,
            transcript: transcript,
            report: aiReport
        };
        
        // Save to local storage to simulate backend persistence for dashboard
        const existing = JSON.parse(localStorage.getItem('my_appointments') || '[]');
        localStorage.setItem('my_appointments', JSON.stringify([bookingDetails, ...existing]));

        // Show Success UI
        setStep(3);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                {step !== 3 && (
                    <div className="mb-8">
                        <Link href="/individual/search" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
                            <FaArrowLeft className="mr-2" /> Back to Search
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
                        <p className="text-gray-500">Schedule a visit with your preferred specialist.</p>
                    </div>
                )}

                {/* Main Card */}
                {step === 3 ? (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-8 rounded-3xl shadow-xl text-center space-y-6 border border-green-100"
                    >
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6">
                            <FaCheckCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Appointment Confirmed!</h2>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Your appointment with <span className="font-bold text-gray-900">{doctor.name}</span> has been scheduled.
                        </p>
                        
                        <div className="bg-gray-50 p-6 rounded-2xl text-left max-w-sm mx-auto space-y-3 border border-gray-100">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium">{selectedDate.toDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Time</span>
                                <span className="font-medium">{selectedSlot}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Pre-Consult</span>
                                <span className="text-green-600 font-medium flex items-center gap-1"><FaCheckCircle size={12}/> AI Report Attached</span>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center gap-4">
                            <Link href="/individual" className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-black transition-all">
                                Go to Dashboard
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* Progress Bar */}
                    <div className="flex border-b border-gray-100">
                        <button 
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${step === 1 ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-400'}`}
                            onClick={() => step > 1 && setStep(1)}
                        >
                            1. Select Time
                        </button>
                        <button 
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${step === 2 ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-400'}`}
                        >
                            2. AI Pre-Consult
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        {step === 3 && null}
                        {/* Doctor Summary (Always Visible in Step 1 & 2) */}
                        {step !== 3 && (
                            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className={`w-12 h-12 ${doctor.image} rounded-full flex items-center justify-center shrink-0`}>
                                    <FaUserMd className="text-indigo-500 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{doctor.role}</span>
                                        <span>at {doctor.hospital}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* STEP 1: DATE & TIME */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FaCalendarAlt className="text-indigo-500"/> Select Date
                                        </h3>
                                        <div className="calendar-container">
                                            <Calendar 
                                                onChange={(val) => setSelectedDate(val as Date)} 
                                                value={selectedDate}
                                                minDate={new Date()}
                                                className="border-0 shadow-sm rounded-xl !w-full !font-sans"
                                                tileClassName="rounded-lg hover:bg-indigo-50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FaClock className="text-indigo-500"/> Available Slots
                                        </h3>
                                        {isLoadingSlots ? (
                                            <div className="flex items-center justify-center h-48 text-indigo-500">
                                                <FaSpinner className="animate-spin text-2xl" />
                                            </div>
                                        ) : availableSlots.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                {availableSlots.map(slot => (
                                                    <button
                                                        key={slot}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                                                            selectedSlot === slot 
                                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                                                            : "bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                                                        }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                                <FaTimesCircle className="mx-auto text-gray-300 text-3xl mb-2" />
                                                <p className="text-gray-500">No slots available for this date.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button 
                                        disabled={!selectedSlot}
                                        onClick={() => setStep(2)}
                                        className="px-8 py-3 bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 disabled:shadow-none transition-all hover:bg-indigo-700 disabled:cursor-not-allowed"
                                    >
                                        Continue to Pre-Consult
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: VOICE NOTE & AI REPORT */}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <FaMicrophone className="text-indigo-600"/> AI Pre-Consultation
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Please describe your symptoms, how long you've had them, and any pain level. 
                                        Our AI will generate a summary report for the doctor.
                                    </p>

                                    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-dashed border-gray-300 relative overflow-hidden">
                                        {isRecording && (
                                            <div className="absolute inset-0 bg-red-50 flex items-center justify-center opacity-50 animate-pulse pointer-events-none"></div>
                                        )}
                                        
                                        <div className="text-4xl font-mono text-gray-800 mb-6 z-10 font-bold">
                                            {formatTime(recordingTime)}
                                        </div>

                                        {!isRecording ? (
                                            <button 
                                                onClick={startRecording}
                                                className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 z-10"
                                            >
                                                <FaMicrophone size={24} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={stopRecording}
                                                className="w-16 h-16 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 z-10"
                                            >
                                                <FaStop size={24} />
                                            </button>
                                        )}
                                        <p className="mt-4 text-sm text-gray-500 font-medium z-10">
                                            {isRecording ? "Listening... Tap to stop" : audioBlob ? "Recording Saved" : "Tap to Start Recording"}
                                        </p>
                                    </div>

                                    {audioBlob && (
                                        <div className="flex flex-col items-center gap-4 animate-fade-in">
                                            <audio controls src={audioUrl!} className="w-full max-w-sm" />
                                            
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={discardRecording}
                                                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                                >
                                                    Discard & Record Again
                                                </button>
                                                {!aiReport && (
                                                    <button 
                                                        onClick={handleGenerateReport}
                                                        disabled={isGeneratingReport}
                                                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-lg shadow-indigo-200"
                                                    >
                                                        {isGeneratingReport ? <FaSpinner className="animate-spin"/> : <FaFileMedical />} 
                                                        {isGeneratingReport ? "Analyzing..." : "Generate AI Report"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* PREVIEW AI REPORT */}
                                <AnimatePresence>
                                    {aiReport && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                    <FaFileMedical className="text-green-600" /> Consult Report Preview
                                                </h4>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Ready to Submit</span>
                                            </div>
                                            <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-xl">
                                                {aiReport}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex justify-between pt-4">
                                     <button 
                                        onClick={() => setStep(1)}
                                        className="text-gray-500 hover:text-gray-800 font-medium px-4"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        disabled={!aiReport}
                                        onClick={handleSubmitBooking}
                                        className="px-8 py-3 bg-black text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        Confirm Appointment <FaCheckCircle />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
            </div>

            <style jsx global>{`
                .react-calendar {
                    border: none !important;
                    font-family: inherit !important;
                }
                .react-calendar__tile--active {
                    background: #4f46e5 !important;
                    border-radius: 8px;
                }
                .react-calendar__tile--now {
                    background: #eef2ff !important;
                    border-radius: 8px;
                    color: #4f46e5 !important;
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                    background-color: #f3f4f6 !important;
                    border-radius: 8px;
                }
            `}</style>
        </div>
    );
};

export default BookAppointmentPage;
