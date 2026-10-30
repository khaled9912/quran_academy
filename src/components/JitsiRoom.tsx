"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Mic, VideoOff } from "lucide-react";
import type { JitsiExternalApi, JitsiExternalApiOptions } from "@/types/jitsi";

const SCRIPT_ID = "jitsi-external-api";

type JoinMode = "audio-video" | "audio-only" | "view-only";

function loadJitsiScript(domain: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load the video room.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load the video room. Check your connection."));
    document.head.appendChild(script);
  });
}

function mediaErrorMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Camera and microphone access was blocked. Allow them for this site in your browser's address bar, then try again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera or microphone was found. You can still join to watch and listen.";
  }
  if (name === "NotReadableError") {
    return "Your camera or microphone is already in use by another app. Close it and try again.";
  }
  return "Could not access your camera or microphone. Check your browser permissions.";
}

interface JitsiRoomProps {
  domain: string;
  room: string;
  displayName: string;
  onClose: () => void;
}

export function JitsiRoom({ domain, room, displayName, onClose }: JitsiRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [mode, setMode] = useState<JoinMode | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [joined, setJoined] = useState(false);
  const [loadError, setLoadError] = useState("");

  onCloseRef.current = onClose;

  const requestDevices = async (nextMode: JoinMode) => {
    setPermissionError("");
    if (nextMode === "view-only") {
      setMode(nextMode);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError("This browser does not support camera or microphone access. Join to watch and listen instead.");
      return;
    }
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        nextMode === "audio-video" ? { audio: true, video: true } : { audio: true }
      );
      stream.getTracks().forEach((track) => track.stop());
      setMode(nextMode);
    } catch (error) {
      setPermissionError(mediaErrorMessage(error));
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    if (!mode) return;
    let disposed = false;
    let api: JitsiExternalApi | null = null;

    loadJitsiScript(domain)
      .then(() => {
        if (disposed || !containerRef.current || !window.JitsiMeetExternalAPI) return;
        const options: JitsiExternalApiOptions = {
          roomName: room,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName },
          configOverwrite: {
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            enableWelcomePage: false,
            disableDeepLinking: true,
            startWithAudioMuted: mode === "view-only",
            startWithVideoMuted: mode !== "audio-video",
            enableInsecureRoomNameWarning: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            MOBILE_APP_PROMO: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            DEFAULT_BACKGROUND: "#000000",
          },
        };
        api = new window.JitsiMeetExternalAPI(domain, options);
        api.addListener("videoConferenceJoined", () => setJoined(true));
        api.addListener("readyToClose", () => onCloseRef.current());
      })
      .catch((error: unknown) => {
        if (!disposed) {
          setLoadError(error instanceof Error ? error.message : "Unable to load the video room.");
        }
      });

    return () => {
      disposed = true;
      api?.dispose();
    };
  }, [domain, room, displayName, mode]);

  return (
    <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden rounded-3xl border border-card-border bg-black">
      <div ref={containerRef} className="h-full w-full" />

      {!mode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black p-6 text-center text-white">
          <div>
            <h2 className="text-2xl font-semibold">Ready to join your lesson?</h2>
            <p className="mt-2 max-w-md text-sm opacity-70">
              Your browser will ask for camera and microphone access. Allow it so your teacher can see and hear you.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void requestDevices("audio-video")}
              disabled={requesting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
            >
              <Camera size={18} /> Join with camera & mic
            </button>
            <button
              type="button"
              onClick={() => void requestDevices("audio-only")}
              disabled={requesting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-5 py-3 font-semibold transition hover:bg-white/10 disabled:opacity-50"
            >
              <Mic size={18} /> Join with mic only
            </button>
            <button
              type="button"
              onClick={() => void requestDevices("view-only")}
              disabled={requesting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold opacity-80 transition hover:bg-white/10 disabled:opacity-50"
            >
              <VideoOff size={16} /> Join muted
            </button>
          </div>
          {requesting && (
            <p className="inline-flex items-center gap-2 text-sm opacity-80">
              <Loader2 size={16} className="animate-spin" /> Waiting for browser permission…
            </p>
          )}
          {permissionError && (
            <p role="alert" className="max-w-md rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
              {permissionError}
            </p>
          )}
        </div>
      )}

      {mode && !joined && !loadError && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm opacity-80">Connecting to your lesson room…</p>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black p-6 text-center text-white">
          <p className="font-semibold">{loadError}</p>
          <p className="text-sm opacity-70">Refresh the page to try again, or contact the academy.</p>
        </div>
      )}
    </div>
  );
}
