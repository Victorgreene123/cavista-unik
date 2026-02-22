import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";

const apiBaseUrl = process.env.OPEN_RPPG_API_URL || "https://cavista-unik-pfdf.onrender.com";
const endpoint = `${apiBaseUrl}/api/vitallens/analyze-video`;

const cliArgs = process.argv.slice(2);
const videoPathArg = cliArgs[0] || "resource/video.MOV";
const processSignalsArg = cliArgs[1] ?? "true";
const modelArg = cliArgs[2];
const fpsArg = cliArgs[3];

function parseBoolean(value) {
  return String(value).toLowerCase() === "true";
}

function printSection(title, entries) {
  console.log(`\n${title}`);
  for (const [label, value] of entries) {
    console.log(`- ${label}: ${value}`);
  }
}

function extractMetric(metric) {
  if (!metric || typeof metric !== "object") {
    return "n/a";
  }

  const value = metric.value;
  const unit = metric.unit || "";
  const confidence = metric.confidence;

  if (value === null || Number.isNaN(value)) {
    return `null (${unit || "no unit"})`;
  }

  const valueText = unit ? `${value} ${unit}` : String(value);
  if (
    confidence === null ||
    confidence === undefined ||
    Number.isNaN(confidence)
  ) {
    return valueText;
  }

  return `${valueText} (confidence: ${confidence})`;
}

async function run() {
  const resolvedVideoPath = path.resolve(videoPathArg);
  await fs.access(resolvedVideoPath);

  const videoBuffer = await fs.readFile(resolvedVideoPath);
  const formData = new FormData();
  formData.append(
    "video",
    new Blob([videoBuffer], { type: "video/mp4" }),
    path.basename(resolvedVideoPath),
  );

  const processSignals = parseBoolean(processSignalsArg);
  formData.append("process_signals", String(processSignals));

  if (modelArg) {
    formData.append("model", modelArg);
  }

  if (fpsArg !== undefined) {
    formData.append("fps", fpsArg);
  }

  console.log(`Calling ${endpoint} with video: ${resolvedVideoPath}`);

  const headers = {};
  if (process.env.VITALLENS_API_KEY) {
    headers["x-api-key"] = process.env.VITALLENS_API_KEY;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: formData,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: "Server returned non-JSON response." };
  }

  if (!response.ok) {
    console.error(`\nRequest failed (${response.status})`);
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const vitalSigns = data.vital_signs || {};
  const processingStatus = data.processing_status || {};
  const preprocessing = data.preprocessing || {};

  printSection("Analysis Summary", [
    ["Model used", data.model_used || "n/a"],
    ["Message", data.message || "n/a"],
  ]);

  printSection("Vitals", [
    ["Heart rate", extractMetric(vitalSigns.heart_rate)],
    ["Respiratory rate", extractMetric(vitalSigns.respiratory_rate)],
    ["HRV SDNN", extractMetric(vitalSigns.hrv_sdnn)],
    ["HRV RMSSD", extractMetric(vitalSigns.hrv_rmssd)],
    ["HRV LF/HF", extractMetric(vitalSigns.hrv_lfhf)],
  ]);

  printSection("Processing Status", [
    ["Face detected", processingStatus.face_detected ?? "n/a"],
    ["Signal quality", processingStatus.signal_quality || "n/a"],
    ["Avg face confidence", processingStatus.avg_face_confidence ?? "n/a"],
    [
      "Issues",
      Array.isArray(processingStatus.issues)
        ? processingStatus.issues.join(", ") || "none"
        : "n/a",
    ],
  ]);

  printSection("Preprocessing", [
    ["Input frames", preprocessing.input_frames ?? "n/a"],
    ["FPS used", preprocessing.fps_used ?? "n/a"],
    ["Resolution", preprocessing.resolution || "n/a"],
    ["Pixel format", preprocessing.pixel_format || "n/a"],
  ]);

  const hasState =
    data.state &&
    typeof data.state.data === "string" &&
    data.state.data.length > 0;
  console.log(`\nState returned: ${hasState ? "yes" : "no"}`);
}

run().catch((error) => {
  console.error("\nUnable to analyze video.");
  console.error(error?.message || error);
  process.exit(1);
});
