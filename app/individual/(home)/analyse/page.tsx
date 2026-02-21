"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaCheckCircle,
  FaHeartbeat,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import { useRppgStream } from "@/app/utils/useRppgStream";

const AnalysePage = () => {
  const router = useRouter();
  const [ScanningState, setScanningState] = useState<
    "idle" | "camera-access" | "detecting" | "scanning" | "complete"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Ready to start.");

  // rPPG WebSocket stream - backend captures camera and sends frames
  const {
    status: rppgStatus,
    isConnected,
    startStream,
    stopStream,
  } = useRppgStream("websocket", "http://127.0.0.1:8000");

  const startScanning = () => {
    setScanningState("camera-access");
    setMessage("Connecting to scanner...");
    // Start WebSocket connection - backend will capture camera
    startStream();
  };

  const stopScanning = useCallback(() => {
    stopStream();
  }, [stopStream]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  // Derive face status from backend - but be lenient during initial scan
  const faceDetected = rppgStatus?.face_detected ?? false;
  const faceCentered = rppgStatus?.face_in_center ?? false;
  const hasSamples = (rppgStatus?.samples ?? 0) > 0;
  // Only show "paused" warning after we've started getting samples but then lost face
  const isPaused = ScanningState === "scanning" && hasSamples && !faceDetected;

  // Handle connection state
  useEffect(() => {
    if (ScanningState === "camera-access" && isConnected) {
      setScanningState("detecting");
      setMessage("Please position your face in the frame.");
    }
  }, [ScanningState, isConnected]);

  // Drive scan flow from backend status
  useEffect(() => {
    // Transition to scanning once backend is running (don't wait for face detection)
    if (ScanningState === "detecting" && rppgStatus?.running) {
      setScanningState("scanning");
      setMessage("Scanning... Please hold still.");
    }

    if (ScanningState === "scanning") {
      const target = rppgStatus?.target_samples ?? 0;
      const samples = rppgStatus?.samples ?? 0;

      if (target > 0) {
        const newProgress = Math.min((samples / target) * 100, 100);
        setProgress(newProgress);

        // Update message based on progress and face status
        if (samples === 0) {
          // Still waiting for first HR reading
          setMessage("Analyzing... Please hold still and look at the camera");
        } else if (!faceDetected && samples > 0) {
          // Had samples but lost face detection
          setMessage("Face not detected - please look at the camera");
        } else {
          setMessage(
            `Scanning... ${samples}/${target} samples (${Math.round(newProgress)}%)`,
          );
        }
      }

      if (rppgStatus?.completed) {
        const finalHr = rppgStatus.hr ?? rppgStatus.avg_hr;
        if (finalHr === null || finalHr === undefined) {
          setMessage("Scan finished, finalizing results...");
          return;
        }
        setScanningState("complete");
        setMessage("Scan complete.");
        stopScanning();
        setTimeout(() => {
          const hrData = {
            current_hr: finalHr,
            avg_hr: rppgStatus?.avg_hr,
            history: rppgStatus?.history || [],
          };
          router.push(
            `/individual/analyse/result?data=${encodeURIComponent(JSON.stringify(hrData))}`,
          );
        }, 1500);
      }
    }
  }, [ScanningState, rppgStatus, router, stopScanning, faceDetected]);

  // Dynamic styles based on scan state and face detection
  const isScanning = ScanningState === "scanning";
  const hasStartedScanning = (rppgStatus?.samples ?? 0) > 0;
  const frameBorderColor =
    isScanning && hasStartedScanning && faceDetected
      ? "border-indigo-600" // Actively scanning with face detected
      : isScanning && hasStartedScanning && !faceDetected
        ? "border-red-400" // Lost face during scan
        : isScanning && !hasStartedScanning
          ? "border-amber-400" // Waiting for first sample
          : "border-gray-300"; // Idle or detecting

  const rppgProgress = rppgStatus?.target_samples
    ? Math.min((rppgStatus.samples / rppgStatus.target_samples) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-2">
          <div className="relative">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 tracking-tight">
              VitalScan AI
            </h1>
            {(ScanningState === "scanning" ||
              ScanningState === "detecting") && (
              <div className="absolute -top-3 -right-8 flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                  LIVE
                </span>
              </div>
            )}
          </div>

          <div
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              ScanningState === "scanning"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                : ScanningState === "complete"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            {message}
          </div>
        </div>

        {/* Main Viewport */}
        <div className="relative w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xl aspect-video isolate">
          {/* Content Container */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {ScanningState === "idle" && (
              <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
                <div className="bg-indigo-50 p-4 rounded-full inline-block mb-4 text-indigo-600">
                  <MdOutlineHealthAndSafety className="text-4xl" />
                </div>
                <h3 className="text-gray-900 text-xl font-semibold mb-2">
                  Start Assessment
                </h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  We&apos;ll analyze your vital signs using your camera. Please
                  ensure you&apos;re in a well-lit area.
                </p>
                <button
                  onClick={startScanning}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors shadow-lg hover:shadow-xl shadow-indigo-200"
                >
                  Begin Scan
                </button>
              </div>
            )}

            {ScanningState !== "idle" && ScanningState !== "complete" && (
              <>
                {/* Video frame from backend */}
                {rppgStatus?.frame ? (
                  <img
                    src={`data:image/jpeg;base64,${rppgStatus.frame}`}
                    alt="Camera feed"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-sm opacity-75">Starting camera...</p>
                    </div>
                  </div>
                )}

                {/* Face Frame */}
                <div
                  className={`relative w-64 h-80 rounded-[3rem] border-4 transition-colors duration-500 ${frameBorderColor} shadow-2xl`}
                >
                  {/* Scanning Indicator - only animate when face is properly detected */}
                  {ScanningState === "scanning" && faceCentered && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,1)] animate-scan-simple"></div>
                  )}
                </div>

                {/* Face Detection Warning */}
                {(ScanningState === "detecting" ||
                  ScanningState === "scanning") &&
                  !faceDetected && (
                    <div className="absolute top-8 left-8 bg-red-500/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl">
                      <div className="flex items-center gap-2 text-white">
                        <FaExclamationTriangle className="text-xl" />
                        <div>
                          <p className="text-sm font-medium">
                            No face detected
                          </p>
                          <p className="text-xs opacity-80">
                            Look at the camera
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Face Not Centered Warning */}
                {(ScanningState === "detecting" ||
                  ScanningState === "scanning") &&
                  faceDetected &&
                  !faceCentered && (
                    <div className="absolute top-8 left-8 bg-amber-500/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl">
                      <div className="flex items-center gap-2 text-white">
                        <FaExclamationTriangle className="text-xl" />
                        <div>
                          <p className="text-sm font-medium">
                            Center your face
                          </p>
                          <p className="text-xs opacity-80">
                            Move into the frame
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Paused Indicator */}
                {isPaused && (
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-xl">
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      Paused - waiting for face
                    </p>
                  </div>
                )}

                {/* Live HR Display */}
                {rppgStatus?.hr !== null &&
                  rppgStatus?.hr !== undefined &&
                  ScanningState === "scanning" &&
                  faceCentered && (
                    <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border border-rose-100">
                      <div className="flex items-center gap-3">
                        <FaHeartbeat className="text-rose-500 text-2xl animate-pulse" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Live Heart Rate
                          </p>
                          <p className="text-3xl font-bold text-rose-600">
                            {(rppgStatus.hr as number).toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-400">BPM</p>
                        </div>
                      </div>
                    </div>
                  )}
              </>
            )}

            {ScanningState === "complete" && (
              <div className="text-center animate-fade-in bg-white/90 p-8 rounded-2xl backdrop-blur-md shadow-lg border border-green-100">
                <div className="inline-block mb-4 text-green-500 bg-green-50 p-3 rounded-full">
                  <FaCheckCircle className="text-5xl" />
                </div>
                <h3 className="text-gray-900 text-2xl font-bold mb-2">
                  Scan Successful
                </h3>
                <p className="text-gray-500">Processing your results...</p>
              </div>
            )}
          </div>

          {/* Progress Bar Bottom */}
          {ScanningState !== "idle" && (
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-100 z-30">
              <div
                className="h-full bg-indigo-600 transition-all duration-200 ease-linear"
                style={{
                  width: `${ScanningState === "scanning" ? progress : rppgProgress}%`,
                }}
              ></div>
            </div>
          )}
        </div>

        {/* Footer Controls / Status */}
        {(ScanningState === "detecting" || ScanningState === "scanning") && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                setScanningState("idle");
                stopScanning();
                setProgress(0);
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
          0% {
            top: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .animate-scan-simple {
          animation: scan-simple 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AnalysePage;
