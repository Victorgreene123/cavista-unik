"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaCamera, FaCheckCircle, FaExclamationTriangle, FaHeartbeat } from "react-icons/fa";
import { MdOutlineHealthAndSafety } from "react-icons/md";

const AnalysePage = () => {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [ScanningState, setScanningState] = useState<'idle' | 'camera-access' | 'detecting' | 'scanning' | 'complete'>('idle');
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("Ready to start.");
    const [isFaceAligned, setIsFaceAligned] = useState(false);
    
    // Constants
    const SCAN_DURATION = 30000; // 30 seconds in ms
    const DETECTION_TIME = 3000; // 3 seconds to "find face"

    const startCamera = async () => {
        setScanningState('camera-access');
        setMessage("Accessing camera...");
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user" } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setScanningState('detecting');
            setMessage("Please position your face in the frame.");
        } catch (err) {
            console.error("Error accessing camera:", err);
            setMessage("Camera access denied.");
            setScanningState('idle');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stream]);

    // Simulate Face Detection and Scanning Process
    useEffect(() => {
        let detectionTimeout: NodeJS.Timeout;
        let scanInterval: NodeJS.Timeout;

        if (ScanningState === 'detecting') {
            // Simulate waiting for face alignment
            detectionTimeout = setTimeout(() => {
                setIsFaceAligned(true);
                setScanningState('scanning');
                setMessage("Scanning... Please hold still.");
            }, DETECTION_TIME);
        } else if (ScanningState === 'scanning') {
            const startTime = Date.now();
            scanInterval = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                const newProgress = Math.min((elapsedTime / SCAN_DURATION) * 100, 100);
                
                setProgress(newProgress);

                if (newProgress >= 100) {
                    clearInterval(scanInterval);
                    setScanningState('complete');
                    setMessage("Scan complete.");
                    stopCamera();
                    // Navigate to results
                    setTimeout(() => {
                        router.push('/individual/analyse/result'); 
                    }, 1500);
                }
            }, 50);
        }

        return () => {
            clearTimeout(detectionTimeout);
            clearInterval(scanInterval);
        };
    }, [ScanningState, router]);

    // Dynamic styles
    const frameBorderColor = isFaceAligned && ScanningState === 'scanning' 
        ? "border-indigo-600" 
        : "border-gray-300";

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 md:p-8">
            
            <div className="w-full max-w-3xl flex flex-col gap-8">
                
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Health Scan
                    </h1>
                    <p className="text-gray-500 text-lg">
                        {message}
                    </p>
                </div>

                {/* Main Viewport */}
                <div className="relative w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xl aspect-video isolate">
                    
                    {/* Content Container */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        {ScanningState === 'idle' && (
                            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
                                <div className="bg-indigo-50 p-4 rounded-full inline-block mb-4 text-indigo-600">
                                    <MdOutlineHealthAndSafety className="text-4xl" />
                                </div>
                                <h3 className="text-gray-900 text-xl font-semibold mb-2">Start Assessment</h3>
                                <p className="text-gray-500 mb-6 leading-relaxed">
                                    We'll analyze your vital signs using your camera. Please ensure you're in a well-lit area.
                                </p>
                                <button 
                                    onClick={startCamera}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors shadow-lg hover:shadow-xl shadow-indigo-200"
                                >
                                    Begin Scan
                                </button>
                            </div>
                        )}

                        {ScanningState !== 'idle' && ScanningState !== 'complete' && (
                            <>
                                <video 
                                    ref={videoRef}
                                    autoPlay 
                                    playsInline 
                                    muted
                                    className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                                />
                                
                                {/* Face Frame */}
                                <div className={`relative w-64 h-80 rounded-[3rem] border-4 transition-colors duration-500 ${frameBorderColor} shadow-2xl`}>
                                    {/* Scanning Indicator */}
                                    {ScanningState === 'scanning' && (
                                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,1)] animate-scan-simple"></div>
                                    )}
                                </div>
                            </>
                        )}

                        {ScanningState === 'complete' && (
                            <div className="text-center animate-fade-in bg-white/90 p-8 rounded-2xl backdrop-blur-md shadow-lg border border-green-100">
                                <div className="inline-block mb-4 text-green-500 bg-green-50 p-3 rounded-full">
                                     <FaCheckCircle className="text-5xl" />
                                </div>
                                <h3 className="text-gray-900 text-2xl font-bold mb-2">Scan Successful</h3>
                                <p className="text-gray-500">Processing your results...</p>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar Bottom */}
                    {ScanningState !== 'idle' && (
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-100 z-30">
                            <div 
                                className="h-full bg-indigo-600 transition-all duration-200 ease-linear"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    )}
                </div>

                {/* Footer Controls / Status */}
                 {(ScanningState === 'detecting' || ScanningState === 'scanning') && (
                    <div className="flex justify-center">
                        <button 
                            onClick={() => {
                                setScanningState('idle');
                                stopCamera();
                                setProgress(0);
                                setIsFaceAligned(false);
                                setMessage("Scan cancelled.");
                            }}
                            className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            Cancel Assessment
                        </button>
                    </div>
                 )}
            </div>
            
            <style jsx global>{`
                @keyframes scan-simple {
                   0% { top: 0%; opacity: 0; }
                   10% { opacity: 1; }
                   90% { opacity: 1; }
                   100% { top: 100%; opacity: 0; }
                }
                .animate-scan-simple {
                    animation: scan-simple 2s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AnalysePage;
