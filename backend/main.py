import base64
import io
import json
import asyncio
import logging
import math
import threading
import time
import warnings
from typing import Any

import cv2
import numpy as np
import rppg
from PIL import Image
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rppg")
logging.getLogger("open-rppg").setLevel(logging.ERROR)

# Silence numerical warnings from rppg's internal normalization when signal is weak.
warnings.filterwarnings("ignore", message="invalid value encountered in divide", category=RuntimeWarning)


class RppgScanner:
	def __init__(self) -> None:
		self._lock = threading.Lock()
		self._thread: threading.Thread | None = None
		self._stop_event = threading.Event()
		self._running = False
		self._last_hr: float | None = None
		self._last_ts: float | None = None
		self._last_error: str | None = None
		self._hr_history: list[float] = []
		self._max_history = 60  # Keep last 60 samples
		self._target_samples = 30  # 30 samples ~= 30 seconds at 1 Hz
		self._start_time: float | None = None
		self._last_frame: str | None = None  # Base64 encoded JPEG frame
		self._face_box: list | None = None
		self._face_detected: bool = False
		self._face_in_center: bool = False

	def start(self) -> None:
		with self._lock:
			if self._running:
				return
			logger.info("Starting rPPG scanner thread...")
			self._stop_event.clear()
			self._last_error = None
			self._last_hr = None
			self._last_ts = None
			self._hr_history = []
			self._start_time = time.time()
			self._last_frame = None
			self._face_box = None
			self._face_detected = False
			self._face_in_center = False
			self._thread = threading.Thread(target=self._scan_loop, daemon=True)
			self._thread.start()
			self._running = True

	def stop(self) -> None:
		thread: threading.Thread | None
		with self._lock:
			if not self._running:
				return
			logger.info("Stopping rPPG scanner thread...")
			self._stop_event.set()
			thread = self._thread
			self._thread = None
			self._running = False

		if thread is not None:
			thread.join(timeout=3)

	def get_history(self) -> list[float]:
		with self._lock:
			return self._hr_history.copy()

	def status(self) -> dict[str, Any]:
		with self._lock:
			avg_hr = None
			if self._hr_history:
				avg_hr = sum(self._hr_history) / len(self._hr_history)
			elapsed = None
			if self._start_time is not None:
				elapsed = time.time() - self._start_time
			completed = len(self._hr_history) >= self._target_samples
			
			return {
				"running": self._running,
				"hr": self._last_hr,
				"avg_hr": avg_hr,
				"timestamp": self._last_ts,
				"error": self._last_error,
				"history": self._hr_history.copy(),
				"samples": len(self._hr_history),
				"target_samples": self._target_samples,
				"completed": completed,
				"elapsed": elapsed,
				"frame": self._last_frame,
				"face_box": self._face_box,
				"face_detected": self._face_detected,
				"face_in_center": self._face_in_center,
			}

	def _encode_frame(self, frame: np.ndarray) -> str:
		"""Encode frame as base64 JPEG for sending to frontend."""
		try:
			# Convert RGB to BGR for cv2, then to JPEG
			if frame is not None and frame.size > 0:
				# Resize for bandwidth efficiency
				h, w = frame.shape[:2]
				scale = 320 / max(h, w)
				if scale < 1:
					frame = cv2.resize(frame, None, fx=scale, fy=scale)
				# Flip horizontally for mirror effect
				frame = cv2.flip(frame, 1)
				_, buffer = cv2.imencode('.jpg', cv2.cvtColor(frame, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 70])
				return base64.b64encode(buffer).decode('utf-8')
		except Exception as e:
			logger.warning("Frame encode error: %s", e)
		return None

	def _is_face_centered(self, box, frame_shape: tuple) -> bool:
		"""Check if face bounding box is reasonably centered in frame."""
		if box is None:
			return False
		
		# Handle different box formats from rppg library
		try:
			# box could be numpy array, list, or nested structure
			if hasattr(box, 'shape'):
				# numpy array
				if box.size == 0:
					return False
				if len(box.shape) == 1 and box.shape[0] >= 4:
					x1, y1, x2, y2 = box[:4]
				elif len(box.shape) == 2 and box.shape[0] >= 1 and box.shape[1] >= 4:
					x1, y1, x2, y2 = box[0][:4]
				else:
					return False
			elif isinstance(box, (list, tuple)):
				if len(box) >= 4:
					x1, y1, x2, y2 = box[:4]
				elif len(box) >= 1 and isinstance(box[0], (list, tuple, np.ndarray)) and len(box[0]) >= 4:
					x1, y1, x2, y2 = box[0][:4]
				else:
					return False
			else:
				return False
			
			h, w = frame_shape[:2]
			face_center_x = (x1 + x2) / 2
			face_center_y = (y1 + y2) / 2
			frame_center_x = w / 2
			frame_center_y = h / 2
			
			# Allow 40% margin from center (more lenient)
			margin_x = w * 0.4
			margin_y = h * 0.4
			
			centered_x = abs(face_center_x - frame_center_x) < margin_x
			centered_y = abs(face_center_y - frame_center_y) < margin_y
			
			# Also check face size - should be at least 10% of frame (more lenient)
			face_w = abs(x2 - x1)
			face_h = abs(y2 - y1)
			adequate_size = (face_w / w) > 0.10 and (face_h / h) > 0.10
			
			return centered_x and centered_y and adequate_size
		except (IndexError, TypeError, ValueError) as e:
			logger.debug("Face center check error: %s", e)
			return False
	
	def _check_face_detected(self, box) -> bool:
		"""Check if face is detected from box data."""
		if box is None:
			return False
		try:
			if hasattr(box, 'shape'):
				# numpy array
				if box.size == 0:
					return False
				if len(box.shape) == 1:
					return box.shape[0] >= 4
				elif len(box.shape) == 2:
					return box.shape[0] >= 1 and box.shape[1] >= 4
			elif isinstance(box, (list, tuple)):
				if len(box) >= 4:
					return True
				if len(box) >= 1 and isinstance(box[0], (list, tuple, np.ndarray)):
					return len(box[0]) >= 4
			return False
		except:
			return False

	def _scan_loop(self) -> None:
		logger.info("Scan loop starting...")
		try:
			logger.info("Creating rPPG model...")
			model = rppg.Model()
			logger.info("rPPG model created successfully")
			last_process_time = 0.0
			frame_count = 0
			consecutive_no_face = 0
			box_logged = False

			logger.info("Opening video capture...")
			with model.video_capture(0):
				logger.info("Video capture opened, starting frame loop...")
				for frame, box in model.preview:
					if self._stop_event.is_set():
						logger.info("Stop event received, exiting loop")
						break

					frame_count += 1
					now = time.time()
					
					# Log box format once to understand what rppg returns
					if not box_logged and frame_count == 10:
						box_logged = True
						logger.info("Box type: %s, value: %s", type(box).__name__, box)
						if hasattr(box, 'shape'):
							logger.info("Box shape: %s", box.shape)
					
					# Check face detection status using robust method
					face_detected = self._check_face_detected(box)
					face_centered = self._is_face_centered(box, frame.shape) if face_detected and frame is not None else False

					# Always update frame for live preview (every 3 frames for smoother video)
					if frame_count % 3 == 0 and frame is not None:
						encoded = self._encode_frame(frame)
						if encoded:
							with self._lock:
								self._last_frame = encoded
								self._face_box = box.tolist() if box is not None else None
								self._face_detected = face_detected
								self._face_in_center = face_centered

					# Track consecutive frames without face for logging
					if not face_detected:
						consecutive_no_face += 1
						if consecutive_no_face == 30:  # Log every 30 frames (~1 second)
							logger.debug("No face detected for ~1 second")
						elif consecutive_no_face % 90 == 0:  # Log every 3 seconds after
							logger.info("Still waiting for face... (%d frames)", consecutive_no_face)
					else:
						if consecutive_no_face > 30:
							logger.info("Face detected again after %d frames", consecutive_no_face)
						consecutive_no_face = 0

					# Process HR every 1 second
					# Let rppg library handle face detection internally - it returns None if no face
					if now - last_process_time <= 1.0:
						continue

					last_process_time = now

					result = model.hr(start=-10)
					hr_value = result.get("hr") if result else None
					
					logger.debug("HR result: %s (frame %d)", result, frame_count)
					
					# Use HR success as the primary face detection indicator
					if hr_value is not None and math.isfinite(hr_value):
						logger.info("Valid HR: %.1f BPM (sample %d)", hr_value, len(self._hr_history) + 1)
						with self._lock:
							self._last_hr = float(hr_value)
							self._last_ts = now
							self._last_error = None
							# HR success means face is properly detected
							self._face_detected = True
							self._face_in_center = True
							self._hr_history.append(float(hr_value))
							if len(self._hr_history) > self._max_history:
								self._hr_history.pop(0)
							if len(self._hr_history) >= self._target_samples:
								logger.info("Target samples reached, completing scan")
								self._stop_event.set()
								break
					else:
						# No valid HR could mean no face or processing issue
						with self._lock:
							# Only mark as no face if we haven't had recent success
							if self._last_ts is None or (now - self._last_ts) > 3.0:
								self._face_detected = False
								self._face_in_center = False
						if hr_value is not None:
							logger.debug("Ignoring non-finite HR value: %s", hr_value)
				
				logger.info("Frame loop ended after %d frames", frame_count)
		except Exception as exc:
			logger.error("Scan loop error: %s", exc, exc_info=True)
			with self._lock:
				self._last_error = str(exc)
		finally:
			logger.info("Scan loop cleanup")
			with self._lock:
				self._running = False


app = FastAPI(title="Cavista rPPG Backend")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=False,
	allow_methods=["*"],
	allow_headers=["*"],
)

scanner = RppgScanner()


@app.get("/")
def root() -> JSONResponse:
	return JSONResponse({"message": "rPPG backend is running"})


@app.get("/health")
def health() -> JSONResponse:
	return JSONResponse({"ok": True})


@app.post("/scan/start")
def start_scan() -> JSONResponse:
	scanner.start()
	return JSONResponse({"status": "started"})


@app.post("/scan/stop")
def stop_scan() -> JSONResponse:
	scanner.stop()
	return JSONResponse({"status": "stopped"})


@app.get("/scan/status")
def scan_status() -> JSONResponse:
	return JSONResponse(scanner.status())


@app.websocket("/ws/scan")
async def websocket_scan(websocket: WebSocket) -> None:
	await websocket.accept()
	client = websocket.client
	logger.info("WebSocket connected: %s", client)
	scanner.start()
	
	try:
		while True:
			# Receive commands from client (optional, for future use)
			try:
				data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
				command = json.loads(data)
				if command.get("action") == "stop":
					break
			except asyncio.TimeoutError:
				pass
			
			# Send current status to client
			payload = scanner.status()
			await websocket.send_json(payload)
			await asyncio.sleep(1)
	except WebSocketDisconnect:
		logger.info("WebSocket disconnected: %s", client)
		scanner.stop()
	finally:
		scanner.stop()


@app.get("/scan/stream")
async def scan_stream(request: Request) -> StreamingResponse:
	logger.info("SSE stream connected: %s", request.client)
	scanner.start()

	async def event_generator():
		try:
			while True:
				if await request.is_disconnected():
					break

				payload = scanner.status()
				yield f"data: {json.dumps(payload)}\n\n"
				await asyncio.sleep(1)
		finally:
			logger.info("SSE stream disconnected: %s", request.client)
			scanner.stop()

	return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.on_event("shutdown")
def shutdown() -> None:
	logger.info("Application shutdown")
	scanner.stop()


@app.on_event("startup")
def startup() -> None:
	logger.info("Application startup")
