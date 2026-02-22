# Real-time rPPG Integration - Setup & Testing Guide

## Backend Setup

The backend is fully configured with WebSocket and SSE (Server-Sent Events) support for real-time heart rate scanning.

### Quick Start Backend

```bash
cd backend
# Install/upgrade dependencies (if needed)
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend Endpoints:**

- `POST /scan/start` - Start the rPPG scanner
- `POST /scan/stop` - Stop the rPPG scanner
- `GET /scan/status` - Get current scanner status
- `WS /ws/scan` - WebSocket connection for real-time HR data (recommended)
- `GET /scan/stream` - SSE stream for real-time HR data (alternative)

**Response Format:**

```json
{
  "running": true,
  "hr": 72.5,
  "avg_hr": 71.2,
  "timestamp": 1708502400.123,
  "error": null,
  "history": [70.1, 71.3, 72.5]
}
```

## Frontend Integration

The frontend now includes:

### 1. Custom Hook: `useRppgStream`

Located in `app/utils/useRppgStream.ts`

Usage:

```typescript
const { status, isConnected, error, startStream, stopStream } = useRppgStream(
  "websocket",
  "http://localhost:8000",
);
```

### 2. Analyse Page Updates (`app/individual/(home)/analyse/page.tsx`)

- Integrated WebSocket connection via `useRppgStream` hook
- Starts rPPG backend when camera access is granted
- Displays **live heart rate** in real-time during scanning
- Passes HR data to result page via URL query parameters
- Auto-stops scanner when scan completes or is cancelled

### 3. Live HR Display

Real-time heart rate shows on the analyse page when scanning:

- Displays current BPM with pulsing heart icon
- Updates every ~1 second from backend
- Positioned in top-right corner during scan

## Testing the Integration

### 1. Start Backend

```bash
cd backend
uvicorn main:app --reload
```

### 2. Start Frontend

```bash
cd cavista-unik
npm run dev
```

### 3. Navigate to Analyse Page

1. Go to `/individual/analyse`
2. Click "Begin Scan"
3. Allow camera access
4. After 3 seconds, the scanning begins
5. Watch for **live HR display** in top-right corner showing real-time heart rate
6. After 30 seconds, scan completes and navigates to result page

### 4. Result Page

The result page receives HR data via query parameter:

- `current_hr`: Latest measured heart rate
- `avg_hr`: Average heart rate over the scan period
- `history`: Array of all HR readings during scan

## Auto-Stop Behavior

The scanner automatically stops when:

1. ✅ WebSocket client disconnects
2. ✅ SSE client disconnects
3. ✅ Backend server shuts down (via `@app.on_event("shutdown")`)
4. ✅ User cancels the scan
5. ✅ User navigates away

## Features

### Backend (`main.py`)

- **Thread-safe rPPG scanning** with locking mechanism
- **Real-time HR calculation** every 1 second from webcam
- **HR history tracking** (last 60 samples)
- **Error handling** with graceful fallbacks
- **Auto-disconnect cleanup** for both WebSocket and SSE
- **Shutdown lifecycle hook** for clean shutdown

### Frontend

- **WebSocket consumption** of real-time HR data
- **Live display** of current HR during scan
- **Data passing** to result page for persistence
- **Automatic cleanup** on component unmount
- **Error states** for connection failures

## Notes

- **Backend URL**: Currently hardcoded to `http://localhost:8000`. Update in `app/components/(components)/analyse/page.tsx` if running on different host/port
- **Update interval**: 1 second (can be adjusted in backend `_scan_loop`)
- **History limit**: 60 samples (configurable in `RppgScanner.__init__`)
- **Timeout for socket operations**: 3 seconds for thread join on stop

## Troubleshooting

**"WebSocket connection error"**

- Ensure backend is running on `http://localhost:8000`
- Check CORS middleware is enabled in backend (it is)

**"Calling setState synchronously within an effect"**

- React 18 strict mode warning; non-critical, app works fine
- Use optional chaining `rppgStatus?.hr` in display rather than state

**No live HR updates**

- Check that backend is receiving frames from camera
- Ensure camera permissions are granted
- Verify rPPG model has face detection (check for face in frame)
