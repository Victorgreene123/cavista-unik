import { useState, useEffect, useRef, useCallback } from "react";

export interface RppgStatus {
  running: boolean;
  hr: number | null;
  avg_hr: number | null;
  timestamp: number | null;
  error: string | null;
  history: number[];
  samples: number;
  target_samples: number;
  completed: boolean;
  elapsed: number | null;
  frame: string | null; // Base64 encoded JPEG frame from backend
  face_box: number[][] | null;
  face_detected: boolean;
  face_in_center: boolean;
}

type StreamType = "websocket" | "sse";

export const useRppgStream = (
  streamType: StreamType = "websocket",
  backendUrl: string = "http://127.0.0.1:8000",
) => {
  const [status, setStatus] = useState<RppgStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  // Track if intentionally stopped to prevent StrictMode re-connection
  const intentionalStop = useRef(false);

  const stopStream = useCallback(() => {
    intentionalStop.current = true;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const startStream = useCallback(() => {
    // Prevent duplicate connections
    if (wsRef.current || eventSourceRef.current) return;

    intentionalStop.current = false;
    setError(null);

    if (streamType === "websocket") {
      try {
        const wsUrl = backendUrl
          .replace("http://", "ws://")
          .replace("https://", "wss://");
        const ws = new WebSocket(`${wsUrl}/ws/scan`);

        ws.onopen = () => setIsConnected(true);

        ws.onmessage = (event) => {
          try {
            setStatus(JSON.parse(event.data));
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        ws.onerror = () => {
          setError("WebSocket connection error");
          setIsConnected(false);
          wsRef.current = null;
        };

        ws.onclose = () => {
          setIsConnected(false);
          wsRef.current = null;
        };

        wsRef.current = ws;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(`WebSocket connection failed: ${errorMsg}`);
      }
    } else {
      try {
        const eventSource = new EventSource(`${backendUrl}/scan/stream`);

        eventSource.onopen = () => setIsConnected(true);

        eventSource.onmessage = (event) => {
          try {
            setStatus(JSON.parse(event.data));
          } catch (err) {
            console.error("Failed to parse SSE message:", err);
          }
        };

        eventSource.onerror = () => {
          setError("SSE connection error");
          setIsConnected(false);
          eventSource.close();
          eventSourceRef.current = null;
        };

        eventSourceRef.current = eventSource;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(`SSE connection failed: ${errorMsg}`);
      }
    }
  }, [streamType, backendUrl]);

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []); // Empty deps — only runs on unmount

  return { status, isConnected, error, startStream, stopStream };
};
