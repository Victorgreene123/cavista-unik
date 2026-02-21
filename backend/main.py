import json
import asyncio
import threading
import time
from typing import Any

import rppg
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse


class RppgScanner:
	def __init__(self) -> None:
		self._lock = threading.Lock()
		self._thread: threading.Thread | None = None
		self._stop_event = threading.Event()
		self._running = False
		self._last_hr: float | None = None
		self._last_ts: float | None = None
		self._last_error: str | None = None

	def start(self) -> None:
		with self._lock:
			if self._running:
				return
			self._stop_event.clear()
			self._last_error = None
			self._thread = threading.Thread(target=self._scan_loop, daemon=True)
			self._thread.start()
			self._running = True

	def stop(self) -> None:
		thread: threading.Thread | None
		with self._lock:
			if not self._running:
				return
			self._stop_event.set()
			thread = self._thread
			self._thread = None
			self._running = False

		if thread is not None:
			thread.join(timeout=3)

	def status(self) -> dict[str, Any]:
		with self._lock:
			return {
				"running": self._running,
				"hr": self._last_hr,
				"timestamp": self._last_ts,
				"error": self._last_error,
			}

	def _scan_loop(self) -> None:
		try:
			model = rppg.Model()
			last_process_time = 0.0

			with model.video_capture(0):
				for _, _box in model.preview:
					if self._stop_event.is_set():
						break

					now = time.time()
					if now - last_process_time <= 1.0:
						continue

					result = model.hr(start=-10)
					hr_value = result.get("hr") if result else None
					if hr_value is not None:
						with self._lock:
							self._last_hr = float(hr_value)
							self._last_ts = now
							self._last_error = None

					last_process_time = now
		except Exception as exc:
			with self._lock:
				self._last_error = str(exc)
		finally:
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


@app.get("/scan/stream")
async def scan_stream(request: Request) -> StreamingResponse:
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
			scanner.stop()

	return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.on_event("shutdown")
def shutdown() -> None:
	scanner.stop()
