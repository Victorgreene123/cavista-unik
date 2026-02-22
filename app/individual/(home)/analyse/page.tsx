"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaVideo,
  FaUpload,
  FaPlay,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const AnalysePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"record" | "upload">("record");
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start camera when switching to record tab
  React.useEffect(() => {
    if (activeTab === "record") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, stopCamera]);

  const RECORDING_DURATION = 30;

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp8",
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      // VitalLens API expects a standard video extension like .webm or .mp4
      const recordedFile = new File([blob], "recording.webm", {
        type: "video/webm",
      });
      setFile(recordedFile);
      stopCamera();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    setFile(null);
    setError(null);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= RECORDING_DURATION - 1) {
          stopRecording();
          return RECORDING_DURATION;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!file) {
      setError("Please record or upload a video first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("process_signals", "true");
      formData.append("fps", "30");

      const response = await fetch(
        "https://cavista-unik-pfdf.onrender.com/api/vitallens/analyze-video",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errData = await response.json();
          if (errData.message) errorMsg = errData.message;
        } catch (e) {}
        throw new Error(`Analysis failed: ${errorMsg}`);
      }

      const data = await response.json();

      // Helper: extract scalar metric fields only (value, unit, confidence)
      const pick = (m: any) => {
        if (!m || typeof m !== "object") return undefined;
        const o: any = {};
        if (m.value !== undefined) o.value = m.value;
        if (m.unit !== undefined) o.unit = m.unit;
        if (m.confidence !== undefined) o.confidence = m.confidence;
        return o;
      };

      const vs = data.vital_signs || {};
      const ps = data.processing_status || {};
      const pp = data.preprocessing || {};

      const resultPayload = {
        vital_signs: {
          heart_rate: pick(vs.heart_rate),
          respiratory_rate: pick(vs.respiratory_rate),
          hrv_sdnn: pick(vs.hrv_sdnn),
          hrv_rmssd: pick(vs.hrv_rmssd),
          hrv_lfhf: pick(vs.hrv_lfhf),
        },
        processing_status: {
          face_detected: ps.face_detected,
          signal_quality: ps.signal_quality,
          avg_face_confidence: ps.avg_face_confidence,
          issues: ps.issues,
        },
        preprocessing: {
          input_frames: pp.input_frames,
          fps_used: pp.fps_used,
          resolution: pp.resolution,
          pixel_format: pp.pixel_format,
        },
        model_used: data.model_used,
        message: data.message,
      };

      const encodedData = encodeURIComponent(JSON.stringify(resultPayload));
      router.push(`/individual/analyse/result?data=${encodedData}`);
    } catch (err: any) {
      console.error("Scan error:", err);
      setError(err.message || "An error occurred during analysis.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-10">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Vital Signs Analysis
              </h1>
              <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-500">
                Record a 30-second video of your face or upload an existing one
                to analyze your vital signs.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-6 sm:mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("record")}
                className={`px-4 sm:px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === "record"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaVideo /> Record Video
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-4 sm:px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === "upload"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaUpload /> Upload Video
              </button>
            </div>

            {/* Content */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center">
              {activeTab === "record" ? (
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl aspect-video bg-black rounded-lg overflow-hidden mb-6 shadow-inner">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${
                        file && !isRecording ? "hidden" : "block"
                      }`}
                    />
                    {file && !isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white flex-col">
                        <FaCheckCircle className="text-4xl text-green-500 mb-2" />
                        <p>
                          Recording saved (
                          {file.size > 1024 * 1024
                            ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
                            : Math.round(file.size / 1024) + " KB"}
                          )
                        </p>
                        <button
                          onClick={() => {
                            setFile(null);
                            startCamera();
                          }}
                          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 underline"
                        >
                          Record again
                        </button>
                      </div>
                    )}
                    {isRecording && (
                      <>
                        {/* Countdown timer badge */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full" />
                          00:
                          {(RECORDING_DURATION - recordingTime)
                            .toString()
                            .padStart(2, "0")}
                        </div>
                        {/* Progress bar at bottom */}
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-800">
                          <div
                            className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                            style={{
                              width: `${(recordingTime / RECORDING_DURATION) * 100}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {isRecording && (
                    <p className="text-sm text-gray-500 text-center">
                      Recording for {RECORDING_DURATION} seconds. Please hold
                      still and look at the camera.
                    </p>
                  )}
                  {!file && !isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base rounded-full font-bold text-white transition-all shadow-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPlay /> Start Recording ({RECORDING_DURATION}s)
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full max-w-full sm:max-w-lg md:max-w-xl mb-4 flex items-start gap-2 text-amber-700 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200 text-sm">
                    <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                    <p>
                      For best results, upload a{" "}
                      <strong>30-second video</strong> of your face with good
                      lighting. Shorter or longer videos may produce less
                      accurate results.
                    </p>
                  </div>
                  <div className="w-full max-w-full sm:max-w-lg md:max-w-xl border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center hover:border-indigo-500 transition-colors bg-white">
                    <FaUpload className="mx-auto text-3xl sm:text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                      Drag and drop a video file here, or click to select
                    </p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Select Video
                    </label>
                  </div>
                  {file && (
                    <div className="mt-6 flex items-center gap-3 text-green-600 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                      <FaCheckCircle />
                      <span className="font-medium truncate max-w-[250px]">
                        {file.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 flex items-center gap-3 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                <FaExclamationTriangle className="flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                onClick={handleScan}
                disabled={!file || isAnalyzing || isRecording}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-8 py-3 sm:px-12 sm:py-4 rounded-xl font-bold text-base sm:text-lg text-white transition-all shadow-xl ${
                  !file || isAnalyzing || isRecording
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <FaSpinner className="animate-spin text-xl" />
                    Analyzing Video...
                  </>
                ) : (
                  "Scan & Analyze"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysePage;
