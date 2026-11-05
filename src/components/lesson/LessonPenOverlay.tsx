"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, X } from "lucide-react";
import { useRealtimeConnection } from "@/providers/realtime-provider";

type Stroke = { id: string; color: string; width: number; points: number[] };
type SnapshotStroke = {
  id: string;
  color: string;
  width: number;
  points: number[];
};
type Snapshot = { strokes: SnapshotStroke[] };
type StrokeStart = {
  id: string;
  color: string;
  width: number;
  x: number;
  y: number;
};
type StrokeAppend = { id: string; points: number[] };

type Drawing = {
  id: string;
  x: number;
  y: number;
  lastSent: number;
  pending: number[];
};

const INK_COLORS = ["#ff5252", "#ffd166", "#6ee7b7", "#60a5fa"];
const INK_WIDTH = 0.004;
// One batch per frame-ish keeps a fast scribble from flooding the socket.
const APPEND_INTERVAL_MS = 60;

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));
const roundPoints = (points: number[]) =>
  points.map((value) => Math.round(value * 10_000) / 10_000);

const newStrokeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * A synced ink layer above the Jitsi view. Normalized points are replayed on
 * every participant's own viewport, so marks track the share only as closely
 * as the two layouts match — letterboxing and portrait phones can drift.
 */
export function LessonPenOverlay({
  lessonId,
  active,
  canDraw,
  onDone,
}: {
  lessonId: string;
  active: boolean;
  canDraw: boolean;
  onDone: () => void;
}) {
  const { connection, revision } = useRealtimeConnection();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Map<string, Stroke>>(new Map());
  const drawingRef = useRef<Drawing | null>(null);
  const frameRef = useRef<number | null>(null);
  const [color, setColor] = useState(INK_COLORS[0]);
  const [ready, setReady] = useState(false);

  const requestDraw = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      const { width, height } = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const pixelWidth = Math.max(1, Math.round(width * ratio));
      const pixelHeight = Math.max(1, Math.round(height * ratio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.scale(ratio, ratio);
      context.lineCap = "round";
      context.lineJoin = "round";

      for (const stroke of strokesRef.current.values()) {
        const points = stroke.points;
        if (points.length < 2) continue;
        context.strokeStyle = stroke.color;
        context.lineWidth = Math.max(1, stroke.width * height);
        context.beginPath();
        context.moveTo(points[0] * width, points[1] * height);
        for (let index = 2; index + 1 < points.length; index += 2) {
          context.lineTo(points[index] * width, points[index + 1] * height);
        }
        context.stroke();
      }
    });
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== null)
        window.cancelAnimationFrame(frameRef.current);
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => requestDraw());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [requestDraw]);

  // Join the lesson's ink group and keep it across reconnects. The snapshot
  // replaces the local board so a reconnect cannot double-draw a stroke.
  useEffect(() => {
    if (!connection || !lessonId) return;
    let disposed = false;
    setReady(false);
    // A reconnect starts a new board; the old in-progress stroke is gone.
    drawingRef.current = null;

    const onStarted = (stroke: StrokeStart) => {
      if (!stroke?.id) return;
      strokesRef.current.set(stroke.id, {
        id: stroke.id,
        color: stroke.color,
        width: stroke.width,
        points: [stroke.x, stroke.y],
      });
      requestDraw();
    };

    const onAppended = (stroke: StrokeAppend) => {
      const target = strokesRef.current.get(stroke?.id);
      if (!target || !Array.isArray(stroke.points)) return;
      target.points.push(...stroke.points);
      requestDraw();
    };

    const onCleared = () => {
      strokesRef.current.clear();
      requestDraw();
    };

    const join = async () => {
      try {
        const snapshot = await connection.invoke<Snapshot>(
          "JoinLessonPen",
          lessonId
        );
        if (disposed) return;
        const next = new Map<string, Stroke>();
        for (const stroke of snapshot?.strokes ?? []) {
          next.set(stroke.id, {
            id: stroke.id,
            color: stroke.color,
            width: stroke.width,
            points: [...stroke.points],
          });
        }
        strokesRef.current = next;
        setReady(true);
        requestDraw();
      } catch {
        // Marking is a bonus layer; a failed join must never block the call.
      }
    };

    connection.on("PenStrokeStarted", onStarted);
    connection.on("PenStrokeAppended", onAppended);
    connection.on("PenCleared", onCleared);
    void join();

    return () => {
      disposed = true;
      setReady(false);
      connection.off("PenStrokeStarted", onStarted);
      connection.off("PenStrokeAppended", onAppended);
      connection.off("PenCleared", onCleared);
      void connection.invoke("LeaveLessonPen", lessonId).catch(() => {});
    };
  }, [connection, lessonId, revision, requestDraw]);

  const send = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!active || !canDraw || !ready || !connection) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = clampUnit((event.clientX - rect.left) / rect.width);
    const y = clampUnit((event.clientY - rect.top) / rect.height);
    const id = newStrokeId();

    strokesRef.current.set(id, {
      id,
      color,
      width: INK_WIDTH,
      points: [x, y],
    });
    drawingRef.current = {
      id,
      x,
      y,
      lastSent: performance.now(),
      pending: [],
    };
    requestDraw();
    void connection
      .invoke("StartPenStroke", lessonId, id, color, INK_WIDTH, x, y)
      .catch(() => {});
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const current = drawingRef.current;
    const canvas = canvasRef.current;
    if (!current || !canvas || !connection) return;

    const rect = canvas.getBoundingClientRect();
    const x = clampUnit((event.clientX - rect.left) / rect.width);
    const y = clampUnit((event.clientY - rect.top) / rect.height);
    if (Math.abs(x - current.x) + Math.abs(y - current.y) < 0.0015) return;

    current.x = x;
    current.y = y;
    strokesRef.current.get(current.id)?.points.push(x, y);
    current.pending.push(x, y);
    requestDraw();

    const now = performance.now();
    if (now - current.lastSent < APPEND_INTERVAL_MS) return;
    current.lastSent = now;
    const batch = current.pending.splice(0, current.pending.length);
    void connection
      .invoke("AppendPenStroke", lessonId, current.id, roundPoints(batch))
      .catch(() => {});
  };

  const end = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const current = drawingRef.current;
    if (!current) return;
    drawingRef.current = null;
    try {
      canvasRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // The pointer may already be released or the canvas unmounted.
    }
    if (!connection) return;
    if (current.pending.length > 0) {
      void connection
        .invoke(
          "AppendPenStroke",
          lessonId,
          current.id,
          roundPoints(current.pending)
        )
        .catch(() => {});
    }
    void connection
      .invoke("EndPenStroke", lessonId, current.id)
      .catch(() => {});
  };

  const clear = () => {
    strokesRef.current.clear();
    requestDraw();
    void connection?.invoke("ClearLessonPen", lessonId).catch(() => {});
  };

  const drawing = active && canDraw;
  const markable = drawing && ready;

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`h-full w-full ${
          markable
            ? "pointer-events-auto cursor-crosshair touch-none"
            : "pointer-events-none"
        }`}
        onPointerDown={send}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      />

      {drawing && (
        <div className="pointer-events-auto absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/80 px-3 py-2 text-white shadow-xl backdrop-blur">
          {INK_COLORS.map((ink) => (
            <button
              key={ink}
              type="button"
              aria-label="Pen color"
              aria-pressed={color === ink}
              onClick={() => setColor(ink)}
              className={`h-6 w-6 rounded-full border-2 transition ${
                color === ink ? "border-white" : "border-transparent opacity-70"
              }`}
              style={{ backgroundColor: ink }}
            />
          ))}
          <span className="mx-1 h-5 w-px bg-white/20" />
          <button
            type="button"
            aria-label="Clear all marks"
            title="Clear all marks"
            onClick={clear}
            className="rounded-lg p-1.5 transition hover:bg-white/15"
          >
            <Eraser size={16} />
          </button>
          <button
            type="button"
            aria-label="Stop marking"
            title="Stop marking"
            onClick={onDone}
            className="rounded-lg bg-white/15 p-1.5 transition hover:bg-white/25"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
