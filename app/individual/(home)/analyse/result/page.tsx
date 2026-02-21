"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FaHeartbeat,
  FaLungs,
  FaBrain,
  FaChevronRight,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import {
  MdBloodtype,
  MdOutlineHealthAndSafety,
  MdTrendingUp,
  MdTrendingDown,
  MdTrendingFlat,
} from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";

interface HRData {
  current_hr: number;
  avg_hr: number;
  history: number[];
}

// Analytics helper functions
function calculateHRV(history: number[]): number {
  // RMSSD (Root Mean Square of Successive Differences) - standard HRV metric
  if (history.length < 2) return 0;
  let sumSquaredDiff = 0;
  for (let i = 1; i < history.length; i++) {
    const diff = history[i] - history[i - 1];
    sumSquaredDiff += diff * diff;
  }
  return Math.sqrt(sumSquaredDiff / (history.length - 1));
}

function getHRStatus(hr: number): {
  status: string;
  color: string;
  bg: string;
  desc: string;
} {
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

function getHRVStatus(hrv: number): {
  status: string;
  color: string;
  bg: string;
  desc: string;
} {
  // HRV interpretation based on RMSSD values
  if (hrv < 10)
    return {
      status: "Low",
      color: "text-amber-600",
      bg: "bg-amber-50",
      desc: "Low variability - may indicate stress or fatigue",
    };
  if (hrv <= 25)
    return {
      status: "Moderate",
      color: "text-green-600",
      bg: "bg-green-50",
      desc: "Moderate variability - good autonomic function",
    };
  if (hrv <= 50)
    return {
      status: "Good",
      color: "text-green-600",
      bg: "bg-green-50",
      desc: "Good variability - healthy heart rate dynamics",
    };
  return {
    status: "High",
    color: "text-blue-600",
    bg: "bg-blue-50",
    desc: "High variability - excellent recovery capacity",
  };
}

function getStressLevel(
  hrv: number,
  hrVariance: number,
): { level: string; color: string; bg: string; desc: string } {
  // Lower HRV and higher HR variance typically indicate stress
  const stressScore = (50 - Math.min(hrv, 50)) / 50 + hrVariance / 30;
  if (stressScore < 0.4)
    return {
      level: "Low",
      color: "text-green-600",
      bg: "bg-green-50",
      desc: "Relaxed state - good autonomic balance",
    };
  if (stressScore < 0.7)
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

function getTrend(history: number[]): "up" | "down" | "stable" {
  if (history.length < 5) return "stable";
  const firstHalf = history.slice(0, Math.floor(history.length / 2));
  const secondHalf = history.slice(Math.floor(history.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const diff = secondAvg - firstAvg;
  if (Math.abs(diff) < 3) return "stable";
  return diff > 0 ? "up" : "down";
}

function calculateOverallScore(
  hr: number,
  hrv: number,
  stressLevel: string,
): number {
  let score = 100;

  // Heart rate score (ideal: 60-80 bpm)
  if (hr < 60) score -= (60 - hr) * 1.5;
  else if (hr > 100) score -= (hr - 100) * 2;
  else if (hr > 80) score -= (hr - 80) * 0.5;

  // HRV score (higher is better, up to a point)
  if (hrv < 10) score -= 15;
  else if (hrv < 20) score -= 5;
  else if (hrv > 30) score += 5;

  // Stress penalty
  if (stressLevel === "High") score -= 15;
  else if (stressLevel === "Moderate") score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

const ResultPage = () => {
  const searchParams = useSearchParams();

  // Parse HR data from URL
  const hrData = useMemo<HRData | null>(() => {
    const dataParam = searchParams.get("data");
    if (!dataParam) return null;
    try {
      return JSON.parse(decodeURIComponent(dataParam)) as HRData;
    } catch {
      return null;
    }
  }, [searchParams]);

  // Calculate all analytics
  const analytics = useMemo(() => {
    if (!hrData) return null;

    const { current_hr, avg_hr, history } = hrData;
    const hrv = calculateHRV(history);
    const minHR = Math.min(...history);
    const maxHR = Math.max(...history);
    const variance = maxHR - minHR;
    const hrStatus = getHRStatus(avg_hr);
    const hrvStatus = getHRVStatus(hrv);
    const stress = getStressLevel(hrv, variance);
    const trend = getTrend(history);
    const overallScore = calculateOverallScore(avg_hr, hrv, stress.level);

    return {
      current_hr: Math.round(current_hr * 10) / 10,
      avg_hr: Math.round(avg_hr * 10) / 10,
      hrv: Math.round(hrv * 10) / 10,
      minHR: Math.round(minHR * 10) / 10,
      maxHR: Math.round(maxHR * 10) / 10,
      variance: Math.round(variance * 10) / 10,
      hrStatus,
      hrvStatus,
      stress,
      trend,
      overallScore,
      samples: history.length,
    };
  }, [hrData]);

  // Fallback if no data
  if (!hrData || !analytics) {
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

  const biometricData = [
    {
      id: "heart-rate",
      label: "Heart Rate",
      value: analytics.avg_hr,
      unit: "bpm",
      status: analytics.hrStatus.status,
      icon: <FaHeartbeat className="text-rose-500" />,
      color: analytics.hrStatus.color,
      bg: analytics.hrStatus.bg,
      desc: analytics.hrStatus.desc,
      extra: `Range: ${analytics.minHR} - ${analytics.maxHR} bpm`,
    },
    {
      id: "hrv",
      label: "Heart Rate Variability",
      value: analytics.hrv,
      unit: "ms",
      status: analytics.hrvStatus.status,
      icon: <MdBloodtype className="text-blue-500" />,
      color: analytics.hrvStatus.color,
      bg: analytics.hrvStatus.bg,
      desc: analytics.hrvStatus.desc,
      extra: `Based on ${analytics.samples} samples`,
    },
    {
      id: "trend",
      label: "HR Trend",
      value:
        analytics.trend === "stable"
          ? "Stable"
          : analytics.trend === "up"
            ? "Rising"
            : "Falling",
      unit: "",
      status:
        analytics.trend === "stable"
          ? "Steady"
          : analytics.trend === "up"
            ? "Increasing"
            : "Decreasing",
      icon:
        analytics.trend === "stable" ? (
          <MdTrendingFlat className="text-cyan-500" />
        ) : analytics.trend === "up" ? (
          <MdTrendingUp className="text-amber-500" />
        ) : (
          <MdTrendingDown className="text-green-500" />
        ),
      color:
        analytics.trend === "stable"
          ? "text-cyan-600"
          : analytics.trend === "up"
            ? "text-amber-600"
            : "text-green-600",
      bg:
        analytics.trend === "stable"
          ? "bg-cyan-50"
          : analytics.trend === "up"
            ? "bg-amber-50"
            : "bg-green-50",
      desc: `Variance: ${analytics.variance} bpm over scan period`,
      extra: null,
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
      extra: null,
    },
  ];

  const overallScore = analytics.overallScore;

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
              <span className="text-4xl font-bold text-indigo-900">
                {overallScore}
              </span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Score
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {biometricData.map((metric) => (
            <div
              key={metric.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${metric.bg} text-xl`}>
                  {metric.icon}
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${metric.bg} ${metric.color}`}
                >
                  {metric.status}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {metric.value}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {metric.unit}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                {metric.label}
              </h3>
              <p className="text-xs text-gray-400">{metric.desc}</p>
              {metric.extra && (
                <p className="text-xs text-gray-300 mt-1">{metric.extra}</p>
              )}
            </div>
          ))}
        </div>

        {/* Recommendations / Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Insight */}
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
                    : analytics.hrvStatus.status === "Low"
                      ? "Your heart rate variability is lower than optimal, which may indicate fatigue or stress. Prioritize rest, hydration, and quality sleep tonight."
                      : analytics.hrStatus.status === "Elevated" ||
                          analytics.hrStatus.status === "High"
                        ? "Your heart rate is elevated. If you haven't been exercising, consider resting and monitoring. Stay hydrated and avoid caffeine."
                        : overallScore >= 85
                          ? "Your heart rate variability indicates excellent recovery status. You're in great shape for a moderate to high intensity workout today."
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

          {/* Secondary Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center space-y-3">
            <Link
              href="/individual/history"
              className="flex items-center justify-between text-gray-600 hover:text-indigo-600 group transition-colors p-2 rounded-lg hover:bg-gray-50"
            >
              <span className="font-medium text-sm">View Scan History</span>
              <FaChevronRight className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
            </Link>
            <div className="h-px bg-gray-100"></div>
            <Link
              href="/individual/doctors"
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
