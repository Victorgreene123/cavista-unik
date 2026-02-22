import "dotenv/config";
import express from "express";
import multer from "multer";
import os from "os";
import path from "path";
import { promises as fs } from "fs";
import { spawn } from "child_process";
import cors from "cors";

const app = express();
app.use(cors());
const PORT = Number(process.env.PORT || 3000);
const VITALLENS_BASE_URL = "https://api.rouast.com";
const VITALLENS_FILE_ENDPOINT = `${VITALLENS_BASE_URL}/vitallens-v3/file`;

const upload = multer({
  dest: path.join(os.tmpdir(), "open-rppg-uploads"),
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
});

app.use(express.json({ limit: "200mb" }));

function getApiKey(req) {
  const requestApiKey = req?.get("x-api-key")?.trim();
  if (requestApiKey) {
    return requestApiKey;
  }

  const apiKey = process.env.VITALLENS_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error(
      "Missing API key. Set VITALLENS_API_KEY in .env or pass x-api-key header.",
    );
    error.status = 500;
    throw error;
  }
  return apiKey;
}

function validateDirectPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    errors.push("Body must be a JSON object.");
    return errors;
  }

  if (typeof payload.video !== "string" || payload.video.length === 0) {
    errors.push(
      'Field "video" is required and must be a non-empty base64 string.',
    );
  }

  if (
    payload.process_signals === true &&
    (typeof payload.fps !== "number" ||
      Number.isNaN(payload.fps) ||
      payload.fps <= 0)
  ) {
    errors.push(
      'Field "fps" must be a positive number when process_signals is true.',
    );
  }

  if (
    payload.fps !== undefined &&
    (typeof payload.fps !== "number" ||
      Number.isNaN(payload.fps) ||
      payload.fps <= 0)
  ) {
    errors.push('Field "fps" must be a positive number when provided.');
  }

  if (payload.state !== undefined && typeof payload.state !== "string") {
    errors.push('Field "state" must be a base64 string when provided.');
  }

  if (payload.model !== undefined && typeof payload.model !== "string") {
    errors.push('Field "model" must be a string when provided.');
  }

  return errors;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });

    const stdoutChunks = [];
    const stderrChunks = [];

    child.stdout.on("data", (chunk) => stdoutChunks.push(chunk));
    child.stderr.on("data", (chunk) => stderrChunks.push(chunk));

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      const stdout = Buffer.concat(stdoutChunks);
      const stderr = Buffer.concat(stderrChunks).toString("utf-8");

      if (code !== 0) {
        const error = new Error(
          `${command} exited with code ${code}. ${stderr}`.trim(),
        );
        error.status = 500;
        reject(error);
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

async function getVideoFps(videoPath) {
  const args = [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=avg_frame_rate,r_frame_rate",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    videoPath,
  ];

  const { stdout } = await runCommand("ffprobe", args);
  const text = stdout.toString("utf-8").trim();
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.includes("/")) {
      const [numeratorText, denominatorText] = line.split("/");
      const numerator = Number(numeratorText);
      const denominator = Number(denominatorText);
      if (
        Number.isFinite(numerator) &&
        Number.isFinite(denominator) &&
        denominator !== 0
      ) {
        const fps = numerator / denominator;
        if (Number.isFinite(fps) && fps > 0) {
          return fps;
        }
      }
    }
  }

  const fallback = Number(lines[0]);
  if (Number.isFinite(fallback) && fallback > 0) {
    return fallback;
  }

  const error = new Error("Could not determine FPS from input video.");
  error.status = 400;
  throw error;
}

async function toRgb24Base64(videoPath) {
  const args = [
    "-i",
    videoPath,
    "-t",
    "30",
    "-vf",
    "fps=30,scale=40:40:flags=bicubic",
    "-pix_fmt",
    "rgb24",
    "-f",
    "rawvideo",
    "pipe:1",
  ];

  const { stdout } = await runCommand("ffmpeg", args);

  if (!stdout || stdout.length === 0) {
    const error = new Error(
      "Preprocessing failed: ffmpeg returned empty raw video output.",
    );
    error.status = 422;
    throw error;
  }

  return stdout;
}

function enforceFrameConstraints(rawVideoBuffer, hasState) {
  const bytesPerFrame = 40 * 40 * 3;
  if (rawVideoBuffer.length % bytesPerFrame !== 0) {
    const error = new Error(
      "Preprocessed video size is invalid. Expected raw RGB24 bytes with shape (frames,40,40,3).",
    );
    error.status = 422;
    throw error;
  }

  const frameCount = rawVideoBuffer.length / bytesPerFrame;
  const minimum = hasState ? 5 : 16;
  if (frameCount < minimum) {
    const error = new Error(
      `Video chunk too short. Minimum ${minimum} frames required ${hasState ? "when state is provided" : "for stateless requests"}.`,
    );
    error.status = 400;
    throw error;
  }

  return frameCount;
}

async function callVitalLensFileApi(body, req) {
  const apiKey = getApiKey(req);

  const response = await fetch(VITALLENS_FILE_ENDPOINT, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = { message: "Upstream returned non-JSON response." };
  }

  return {
    status: response.status,
    data,
  };
}

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.post("/api/vitallens/file", async (req, res, next) => {
  try {
    const validationErrors = validateDirectPayload(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Invalid request body.",
        errors: validationErrors,
      });
    }

    const result = await callVitalLensFileApi(req.body, req);
    return res.status(result.status).json(result.data);
  } catch (error) {
    return next(error);
  }
});

app.post(
  "/api/vitallens/analyze-video",
  upload.single("video"),
  async (req, res, next) => {
    const uploadedFile = req.file;
    try {
      if (!uploadedFile) {
        return res.status(400).json({
          message:
            'Missing video file. Send multipart/form-data with field name "video".',
        });
      }

      const processSignals =
        req.body.process_signals === "true" ||
        req.body.process_signals === true;
      const model = req.body.model;
      const state = req.body.state;

      const rawVideoBuffer = await toRgb24Base64(uploadedFile.path);
      const frameCount = enforceFrameConstraints(
        rawVideoBuffer,
        Boolean(state),
      );
      // The ffmpeg filter forces output to exactly 30 fps, so always use 30.
      // Client-provided fps is honoured only if explicitly sent.
      const FORCED_FPS = 30;
      const fps =
        req.body.fps !== undefined ? Number(req.body.fps) : FORCED_FPS;

      if (processSignals && (!Number.isFinite(fps) || fps <= 0)) {
        return res.status(400).json({
          message:
            'Could not determine fps. Provide a valid "fps" value when process_signals=true.',
        });
      }

      const body = {
        video: rawVideoBuffer.toString("base64"),
        process_signals: processSignals,
      };

      if (Number.isFinite(fps) && fps > 0) {
        body.fps = fps;
      }

      if (typeof state === "string" && state.length > 0) {
        body.state = state;
      }

      if (typeof model === "string" && model.length > 0) {
        body.model = model;
      }

      const result = await callVitalLensFileApi(body, req);
      return res.status(result.status).json({
        ...result.data,
        preprocessing: {
          input_frames: frameCount,
          fps_used: body.fps ?? null,
          resolution: "40x40",
          pixel_format: "rgb24",
        },
      });
    } catch (error) {
      return next(error);
    } finally {
      if (uploadedFile?.path) {
        fs.unlink(uploadedFile.path).catch(() => {});
      }
    }
  },
);

app.use((error, _req, res, _next) => {
  const status = Number.isInteger(error?.status) ? error.status : 500;
  const message = error?.message || "Unexpected server error.";
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log(`Open-RPPG API listening on http://localhost:${PORT}`);
});
