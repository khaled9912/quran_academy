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
type Snapshot = { strokes: SnapshotStroke[]; frame: number };
type StrokeStart = {
  id: string;
  color: string;
  width: number;
  x: number;
  y: number;
};
type StrokeAppend = { id: string; points: number[] };
type FrameChanged = { frame: number };

type Drawing = {
  id: string;
  x: number;
  y: number;
  lastSent: number;
  pending: number[];
};

const INK_COLORS = ["#ff5252", "#ffd166", "#6ee7b7", "#60a5fa"];
const INK_WIDTH = 0.004;
const DEFAULT_ASPECT = 16 / 9;
// One batch per frame-ish keeps a fast scribble from flooding the socket.
const APPEND_INTERVAL_MS = 60;
// The frame is only a ratio, so the same limits the server enforces are enough.
const MIN_ASPECT = 0.3;
const MAX_ASPECT = 4;
// The grip is dragged continuously; the room only needs the settled ratio.
const FRAME_INTERVAL_MS = 90;

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));
const clampAspect = (value: number) =>
  Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, value));
const roundPoints = (points: number[]) =>
  points.map((value) => Math.round(value * 10_000) / 10_000);

/** The biggest centered box of the shared picture's ratio inside the stage. */
type Box = { x: number; y: number; width: number; height: number };
const frameBox = (width: number, height: number, aspect: number): Box => {
  const boxWidth = Math.min(width, height * aspect);
  const boxHeight = boxWidth / aspect;
  return {
    x: (width - boxWidth) / 2,
    y: (height - boxHeight) / 2,
    width: boxWidth,
    height: boxHeight,
  };
};

const newStrokeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * A synced ink layer above the Jitsi view. Marks are normalized inside a
 * centered box fitted to the shared picture's ratio, so both screens write on
 * the same part of the page instead of on their own viewport. That box tracks
 * Jitsi's own letterboxing only approximately, because the filmstrip and
 * toolbars shift the picture differently on every screen: the corner grip is
 * how whoever marks corrects it, and only the ratio travels to the others.
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
  // The draw loop must not be rebuilt whenever the ratio changes, so it reads
  // the live ratio through a ref.
  const aspectRef = useRef(DEFAULT_ASPECT);
  const lastFrameSent = useRef(0);
  const frameDirty = useRef(false);
  const [color, setColor] = useState(INK_COLORS[0]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [aspect, setAspect] = useState(DEFAULT_ASPECT);
  const [joined, setJoined] = useState(false);
  const [fitting, setFitting] = useState(false);

  const box = frameBox(size.width, size.height, aspect);
  const drawing = active && canDraw;
  const markable = drawing && joined && box.width > 1 && box.height > 1;

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

      const marks = frameBox(width, height, aspectRef.current);
      for (const stroke of strokesRef.current.values()) {
        const points = stroke.points;
        if (points.length < 2) continue;
        context.strokeStyle = stroke.color;
        context.lineWidth = Math.max(1, stroke.width * marks.height);
        context.beginPath();
        context.moveTo(
          marks.x + points[0] * marks.width,
          marks.y + points[1] * marks.height
        );
        for (let index = 2; index + 1 < points.length; index += 2) {
          context.lineTo(
            marks.x + points[index] * marks.width,
            marks.y + points[index + 1] * marks.height
          );
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
    aspectRef.current = aspect;
    requestDraw();
  }, [aspect, requestDraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const measure = () => {
      const { width, height } = canvas.getBoundingClientRect();
      setSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height }
      );
      requestDraw();
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [requestDraw]);

  // Join the lesson's ink group and keep it across reconnects. The snapshot
  // replaces the local board so a reconnect cannot double-draw a stroke.
  useEffect(() => {
    if (!connection || !lessonId) return;
    let disposed = false;
    setJoined(false);
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

    const onFrame = (state: FrameChanged) => {
      const next = Number(state?.frame);
      if (Number.isFinite(next)) setAspect(clampAspect(next));
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
        const frame = Number(snapshot?.frame);
        setAspect(Number.isFinite(frame) ? clampAspect(frame) : DEFAULT_ASPECT);
        setJoined(true);
        requestDraw();
      } catch {
        // Marking is a bonus layer; a failed join must never block the call.
      }
    };

    connection.on("PenStrokeStarted", onStarted);
    connection.on("PenStrokeAppended", onAppended);
    connection.on("PenCleared", onCleared);
    connection.on("PenFrameChanged", onFrame);
    void join();

    return () => {
      disposed = true;
      setJoined(false);
      connection.off("PenStrokeStarted", onStarted);
      connection.off("PenStrokeAppended", onAppended);
      connection.off("PenCleared", onCleared);
      connection.off("PenFrameChanged", onFrame);
      void connection.invoke("LeaveLessonPen", lessonId).catch(() => {});
    };
  }, [connection, lessonId, revision, requestDraw]);

  /** A pointer position as a point inside the fitted box. */
  const pointOf = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const marks = frameBox(rect.width, rect.height, aspect);
    if (marks.width < 1 || marks.height < 1) return null;
    return {
      x: clampUnit((clientX - rect.left - marks.x) / marks.width),
      y: clampUnit((clientY - rect.top - marks.y) / marks.height),
    };
  };

  const send = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!markable || !connection) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const point = pointOf(event.clientX, event.clientY);
    if (!point) return;

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const id = newStrokeId();

    strokesRef.current.set(id, {
      id,
      color,
      width: INK_WIDTH,
      points: [point.x, point.y],
    });
    drawingRef.current = {
      id,
      x: point.x,
      y: point.y,
      lastSent: performance.now(),
      pending: [],
    };
    requestDraw();
    void connection
      .invoke(
        "StartPenStroke",
        lessonId,
        id,
        color,
        INK_WIDTH,
        point.x,
        point.y
      )
      .catch(() => {});
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const current = drawingRef.current;
    if (!current || !connection) return;
    const point = pointOf(event.clientX, event.clientY);
    if (!point) return;
    if (Math.abs(point.x - current.x) + Math.abs(point.y - current.y) < 0.0015)
      return;

    current.x = point.x;
    current.y = point.y;
    strokesRef.current.get(current.id)?.points.push(point.x, point.y);
    current.pending.push(point.x, point.y);
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

  const publishFrame = (next: number, force: boolean) => {
    const now = performance.now();
    if (!force && now - lastFrameSent.current < FRAME_INTERVAL_MS) {
      frameDirty.current = true;
      return;
    }
    lastFrameSent.current = now;
    frameDirty.current = false;
    void connection
      ?.invoke("SetPenFrame", lessonId, Number(next.toFixed(4)))
      .catch(() => {});
  };

  const fitStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setFitting(true);
  };

  const fitMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!fitting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // The corner sits half a width and half a height from the centre, so the
    // drag distances are the picture's ratio directly.
    const dx = Math.abs(event.clientX - (rect.left + rect.width / 2));
    const dy = Math.abs(event.clientY - (rect.top + rect.height / 2));
    if (dx < 8 || dy < 8) return;
    const next = clampAspect(dx / dy);
    if (Math.abs(next - aspect) < 0.002) return;
    setAspect(next);
    publishFrame(next, false);
  };

  const fitEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // The pointer may already be released.
    }
    setFitting(false);
    if (frameDirty.current) publishFrame(aspect, true);
  };

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

      {drawing && box.width > 1 && (
        <>
          {fitting && (
            <div
              aria-hidden
              className="pointer-events-none absolute border-2 border-dashed border-amber-300/80"
              style={{
                left: box.x,
                top: box.y,
                width: box.width,
                height: box.height,
              }}
            />
          )}
          <div
            role="slider"
            tabIndex={0}
            aria-label="Drag to fit the marks to the shared screen"
            aria-orientation="horizontal"
            aria-valuemin={MIN_ASPECT}
            aria-valuemax={MAX_ASPECT}
            aria-valuenow={Number(aspect.toFixed(2))}
            title="Drag to fit the marks to the shared screen"
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
                return;
              event.preventDefault();
              const next = clampAspect(
                aspect * (event.key === "ArrowRight" ? 1.03 : 1 / 1.03)
              );
              setAspect(next);
              publishFrame(next, true);
            }}
            onPointerDown={fitStart}
            onPointerMove={fitMove}
            onPointerUp={fitEnd}
            onPointerCancel={fitEnd}
            className="pointer-events-auto absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize touch-none rounded-full border-2 border-amber-300 bg-neutral-900/80 shadow-lg"
            style={{ left: box.x + box.width, top: box.y + box.height }}
          />
        </>
      )}

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
