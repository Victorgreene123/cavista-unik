"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FaHeartbeat,
  FaLungs,
  FaBrain,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { MdBloodtype, MdOutlineHealthAndSafety } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";

/* ------------------------------------------------------------------ */
/*  Types matching the URL payload built in analyse/page.tsx           */
/* ------------------------------------------------------------------ */
interface Metric {
  value?: number | null;
  unit?: string;
  confidence?: number | null;
}

interface AnalysisData {
  vital_signs?: {
    heart_rate?: Metric;
    respiratory_rate?: Metric;
    hrv_sdnn?: Metric;
    hrv_rmssd?: Metric;
    hrv_lfhf?: Metric;
  };
  processing_status?: {
    face_detected?: boolean;
    signal_quality?: string;
    avg_face_confidence?: number;
    issues?: string[];
  };
  preprocessing?: {
    input_frames?: number;
    fps_used?: number | null;
    resolution?: string;
    pixel_format?: string;
  };
  model_used?: string;
  message?: string;
}

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */
function getHRStatus(hr: number) {
  if (hr < 60)
    return {
      status: "Low",
      color: "text-amber-600",
      bg: "bg-amber-50",
      desc: "Below normal resting rate (bradycardia)",
    };
  if (hr <= 100)
    return {
      status: "Normal",
      color: "text-green-600",
      bg: "bg-green-50",
      desc: "Within optimal resting range (60-100 bpm)",
    };
  if (hr <= 120)
    return {
      status: "Elevated",
      color: "text-amber-600",
      bg: "bg-amber-50",
      desc: "Above normal, may indicate activity or stress",
    };
  return {
    status: "High",
    color: "text-red-600",
    bg: "bg-red-50",
    desc: "Significantly elevated (tachycardia)",
  };
}

function getRRStatus(rr: number) {
  if (rr < 12)
    return {
      status: "Low",
      color: "text-amber-600",
      bg: "bg-amber-50",
      desc: "Below normal resting rate",
    };
  if (rr <= 20)
    return {
      status: "Normal",
      color: "text-green-600",
      bg: "bg-green-50",
      desc: "Within optimal resting range (12-20 breaths/min)",
    };
  return {
    status: "High",
    color: "text-red-600",
    bg: "bg-red-50",
    desc: "Above normal resting rate",
  };
}

function getHRVStatus(hrv: number) {
  if (hrv < 20)
    return {
      status: "Low",
      color: "text-amber-600",
      bg: "bg-amber-50",
      desc: "Low variability - may indicate stress or fatigue",
    };
  if (hrv <= 50)
    return {
      status: "Moderate",
      color: "text-green-600",
      bg: "bg-green-50",
      desc: "Moderate variability - good autonomic function",
    };
  return {
    status: "High",
    color: "text-blue-600",
    bg: "bg-blue-50",
    desc: "High variability - excellent recovery capacity",
  };
}

function getStressLevel(hr: number, rr: number) {
  // Calculate stress based on Heart Rate and Respiratory Rate
  // High HR + High RR = High Stress
  // Normal HR + Normal RR = Low Stress
  let stressScore = 0;

  if (hr > 100) stressScore += 2;
  else if (hr > 85) stressScore += 1;
  else if (hr < 60) stressScore += 1; // Bradycardia can also be a stressor

  if (rr > 20) stressScore += 2;
  else if (rr > 16) stressScore += 1;
  else if (rr < 12) stressScore += 1;

  if (stressScore <= 1)
    return {
      level: "Low",
      color: "text-green-600",
      bg: "bg-green-50",
      desc: "Relaxed state - good autonomic balance",
    };
  if (stressScore <= 2)
    return {
      level: "Moderate",
      color: "text-amber-600",
      bg: "bg-amber-50",
      desc: "Some stress indicators present",
    };
  return {
    level: "High",
    color: "text-red-600",
    bg: "bg-red-50",
    desc: "Elevated stress - consider relaxation",
  };
}

function calculateOverallScore(hr: number, rr: number): number {
  let score = 100;
  if (hr < 60) score -= (60 - hr) * 1.5;
  else if (hr > 100) score -= (hr - 100) * 2;
  else if (hr > 80) score -= (hr - 80) * 0.5;

  if (rr < 12) score -= (12 - rr) * 2;
  else if (rr > 20) score -= (rr - 20) * 2;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function fmt(v: number | undefined | null, fallback = "n/a"): string {
  if (v === null || v === undefined || Number.isNaN(v)) return fallback;
  return String(Math.round(v * 100) / 100);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const ResultPage = () => {
  const searchParams = useSearchParams();

  const data = useMemo<AnalysisData | null>(() => {
    const param = searchParams.get("data");
    if (!param) return null;
    try {
      return JSON.parse(decodeURIComponent(param)) as AnalysisData;
    } catch {
      return null;
    }
  }, [searchParams]);

  const analytics = useMemo(() => {
    if (!data?.vital_signs) return null;
    const vs = data.vital_signs;
    const hr = vs.heart_rate?.value ?? 0;
    const rr = vs.respiratory_rate?.value ?? 0;

    return {
      hr: Math.round(hr * 10) / 10,
      rr: Math.round(rr * 10) / 10,
      hrStatus: getHRStatus(hr),
      rrStatus: getRRStatus(rr),
      stress: getStressLevel(hr, rr),
      overallScore: calculateOverallScore(hr, rr),
      hrConfidence: vs.heart_rate?.confidence,
      rrConfidence: vs.respiratory_rate?.confidence,
    };
  }, [data]);

  /* No data at all */
  if (!data || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            No scan data found
          </h2>
          <Link
            href="/individual/analyse"
            className="px-6 py-2 bg-indigo-600 text-white rounded-full"
          >
            Start New Scan
          </Link>
        </div>
      </div>
    );
  }

  const ps = data.processing_status;
  const pp = data.preprocessing;
  const overallScore = analytics.overallScore;

  /* Vitals cards data */
  const biometricData = [
    {
      id: "heart-rate",
      label: "Heart Rate",
      value: analytics.hr,
      unit: "bpm",
      confidence: analytics.hrConfidence,
      status: analytics.hrStatus.status,
      icon: <FaHeartbeat className="text-rose-500" />,
      color: analytics.hrStatus.color,
      bg: analytics.hrStatus.bg,
      desc: analytics.hrStatus.desc,
    },
    {
      id: "respiratory-rate",
      label: "Respiratory Rate",
      value: analytics.rr,
      unit: "breaths/min",
      confidence: analytics.rrConfidence,
      status: analytics.rrStatus.status,
      icon: <FaLungs className="text-cyan-500" />,
      color: analytics.rrStatus.color,
      bg: analytics.rrStatus.bg,
      desc: analytics.rrStatus.desc,
    },
    {
      id: "stress",
      label: "Stress Level",
      value: analytics.stress.level,
      unit: "",
      status:
        analytics.stress.level === "Low"
          ? "Good"
          : analytics.stress.level === "Moderate"
            ? "Fair"
            : "Attention",
      icon: <FaBrain className="text-purple-500" />,
      color: analytics.stress.color,
      bg: analytics.stress.bg,
      desc: analytics.stress.desc,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/individual"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
          >
            <IoArrowBack size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Scan Results</h1>
        </div>

        {/* Analysis Summary Banner */}
        {(data.model_used || data.message) && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            {data.model_used && (
              <span>
                <strong className="text-gray-800">Model:</strong>{" "}
                {data.model_used}
              </span>
            )}
            {data.message && (
              <span>
                <strong className="text-gray-800">Message:</strong>{" "}
                {data.message}
              </span>
            )}
          </div>
        )}

        {/* Main Score Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-lg">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                overallScore >= 80
                  ? "bg-green-100 text-green-700"
                  : overallScore >= 60
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  overallScore >= 80
                    ? "bg-green-500"
                    : overallScore >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
              ></span>
              Analysis Verified
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {overallScore >= 85
                ? "Your vitals look great!"
                : overallScore >= 70
                  ? "Your vitals are looking good."
                  : overallScore >= 50
                    ? "Some areas need attention."
                    : "Please consult a healthcare professional."}
            </h2>
            <p className="text-gray-500 leading-relaxed">
              {overallScore >= 85
                ? "Based on the optical scan, your physiological markers are well within the healthy range. Keep up the good work maintaining your wellness routine."
                : overallScore >= 70
                  ? "Your scan shows mostly healthy readings with minor variations. Consider monitoring your vitals regularly."
                  : overallScore >= 50
                    ? "Some readings are outside the optimal range. Consider lifestyle adjustments and regular monitoring."
                    : "Your readings indicate potential concerns. We recommend consulting with a healthcare provider for a thorough evaluation."}
            </p>
          </div>

          {/* Score Circle */}
          <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="12"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * overallScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-indigo-900">
                {overallScore}
              </span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Score
              </span>
            </div>
          </div>
        </div>

        {/* Vitals Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {biometricData.map((metric) => (
              <div
                key={metric.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2.5 rounded-lg ${metric.bg} text-xl`}>
                    {metric.icon}
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${metric.bg} ${metric.color}`}
                  >
                    {metric.status}
                  </span>
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {metric.value}
                  </span>
                  {metric.unit && (
                    <span className="text-sm text-gray-500 ml-1">
                      {metric.unit}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  {metric.label}
                </h4>
                <p className="text-xs text-gray-400">{metric.desc}</p>
                {"confidence" in metric &&
                  metric.confidence !== undefined &&
                  metric.confidence !== null && (
                    <p className="text-xs text-indigo-500 mt-2">
                      Confidence: {Math.round(metric.confidence * 100)}%
                    </p>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Processing Status */}
        {ps && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Processing Status
            </h3>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                {ps.face_detected ? (
                  <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
                ) : (
                  <FaTimesCircle className="text-red-500 text-lg flex-shrink-0" />
                )}
                <div>
                  <p className="text-xs text-gray-400">Face Detected</p>
                  <p className="font-semibold text-gray-800">
                    {ps.face_detected ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaInfoCircle className="text-indigo-400 text-lg flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Signal Quality</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {ps.signal_quality || "n/a"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaInfoCircle className="text-indigo-400 text-lg flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Avg Face Confidence</p>
                  <p className="font-semibold text-gray-800">
                    {ps.avg_face_confidence !== undefined &&
                    ps.avg_face_confidence !== null
                      ? `${Math.round(ps.avg_face_confidence * 100)}%`
                      : "n/a"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaInfoCircle className="text-indigo-400 text-lg flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Issues</p>
                  <p className="font-semibold text-gray-800">
                    {Array.isArray(ps.issues) && ps.issues.length > 0
                      ? ps.issues.join(", ")
                      : "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preprocessing Info */}
        {pp && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Preprocessing
            </h3>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-400">Input Frames</p>
                <p className="font-semibold text-gray-800">
                  {fmt(pp.input_frames)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">FPS Used</p>
                <p className="font-semibold text-gray-800">
                  {fmt(pp.fps_used)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Resolution</p>
                <p className="font-semibold text-gray-800">
                  {pp.resolution || "n/a"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Pixel Format</p>
                <p className="font-semibold text-gray-800">
                  {pp.pixel_format || "n/a"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations / Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`md:col-span-2 rounded-2xl p-6 text-white shadow-lg ${
              analytics.stress.level === "High"
                ? "bg-amber-600 shadow-amber-200"
                : overallScore >= 70
                  ? "bg-indigo-600 shadow-indigo-200"
                  : "bg-rose-600 shadow-rose-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <MdOutlineHealthAndSafety className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">AI Health Tip</h3>
                <p className="text-white/90 text-sm leading-relaxed mb-4">
                  {analytics.stress.level === "High"
                    ? "Your readings suggest elevated stress levels. Consider taking a break, practicing deep breathing exercises, or engaging in light activities like walking or stretching."
                    : analytics.hrStatus.status === "Elevated" ||
                        analytics.hrStatus.status === "High"
                      ? "Your heart rate is elevated. If you haven't been exercising, consider resting and monitoring. Stay hydrated and avoid caffeine."
                      : overallScore >= 85
                        ? "Your vitals indicate excellent recovery status. You're in great shape for a moderate to high intensity workout today."
                        : "Your vitals suggest a balanced state. Consider light to moderate exercise and maintaining your current wellness routine."}
                </p>
                <Link
                  href="/individual/appointments/book"
                  className="inline-block text-xs font-bold uppercase tracking-wider bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {analytics.stress.level === "High" || overallScore < 60
                    ? "Book Consultation"
                    : "View Wellness Tips"}
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center space-y-3">
            <Link
              href="/individual/analyse"
              className="flex items-center justify-between text-gray-600 hover:text-indigo-600 group transition-colors p-2 rounded-lg hover:bg-gray-50"
            >
              <span className="font-medium text-sm">New Scan</span>
              <FaChevronRight className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
            </Link>
            <div className="h-px bg-gray-100"></div>
            <Link
              href="/individual/appointments/book"
              className="flex items-center justify-between text-gray-600 hover:text-indigo-600 group transition-colors p-2 rounded-lg hover:bg-gray-50"
            >
              <span className="font-medium text-sm">Consult a Doctor</span>
              <FaChevronRight className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
            </Link>
            <div className="h-px bg-gray-100"></div>
            <Link
              href="/individual"
              className="flex items-center justify-between text-gray-600 hover:text-indigo-600 group transition-colors p-2 rounded-lg hover:bg-gray-50"
            >
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
