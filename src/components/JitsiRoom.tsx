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
    const existing = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Unable to load the video room.")),
        { once: true }
      );
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error("Unable to load the video room. Check your connection.")
      );
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
  onJoined?: () => void;
  onLeft?: () => void;
  onApiReady?: (api: JitsiExternalApi | null) => void;
}

export function JitsiRoom({
  domain,
  room,
  displayName,
  onClose,
  onJoined,
  onLeft,
  onApiReady,
}: JitsiRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const onJoinedRef = useRef(onJoined);
  const onLeftRef = useRef(onLeft);
  const onApiReadyRef = useRef(onApiReady);
  // Re-creating the Jitsi instance drops the participant out of the call, so
  // the effect below must not depend on values that can change mid-call.
  const displayNameRef = useRef(displayName);
  const [mode, setMode] = useState<JoinMode | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [joined, setJoined] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [mediaAvailable, setMediaAvailable] = useState<boolean | null>(null);

  onCloseRef.current = onClose;
  onJoinedRef.current = onJoined;
  onLeftRef.current = onLeft;
  onApiReadyRef.current = onApiReady;
  displayNameRef.current = displayName;

  useEffect(() => {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.enumerateDevices) {
      setMediaAvailable(false);
      return;
    }
    let active = true;
    const detect = () => {
      void mediaDevices
        .enumerateDevices()
        .then((devices) => {
          if (!active) return;
          setMediaAvailable(
            devices.some(
              (device) =>
                device.kind === "audioinput" || device.kind === "videoinput"
            )
          );
        })
        .catch(() => {
          if (active) setMediaAvailable(null);
        });
    };
    detect();
    mediaDevices.addEventListener?.("devicechange", detect);
    return () => {
      active = false;
      mediaDevices.removeEventListener?.("devicechange", detect);
    };
  }, []);

  const requestDevices = async (nextMode: JoinMode) => {
    setPermissionError("");
    if (nextMode === "view-only") {
      setMode(nextMode);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError(
        "This browser cannot access a camera or microphone. You can still join to watch and listen."
      );
      return;
    }
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        nextMode === "audio-video"
          ? { audio: true, video: true }
          : { audio: true }
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

    // A different room means a new conference; never show the previous one's
    // joined state while it connects.
    setJoined(false);
    setLoadError("");

    loadJitsiScript(domain)
      .then(() => {
        if (disposed || !containerRef.current || !window.JitsiMeetExternalAPI)
          return;
        const options: JitsiExternalApiOptions = {
          roomName: room,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName: displayNameRef.current },
          configOverwrite: {
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            enableWelcomePage: false,
            // Legacy and current deep-link switches: without both, mobile
            // browsers open an "Open in app?" redirect dialog before the call.
            disableDeepLinking: true,
            deeplinking: { disabled: true },
            requireDisplayName: false,
            hideLoginButton: true,
            startWithAudioMuted: mode === "view-only",
            startWithVideoMuted: mode !== "audio-video",
            enableInsecureRoomNameWarning: false,
            // Only the controls a lesson actually needs.
            toolbarButtons: [
              "microphone",
              "camera",
              "desktop",
              "whiteboard",
              "chat",
              "hangup",
            ],
            disableReactions: true,
            disablePolls: true,
            disableVirtualBackground: true,
            hideConferenceSubject: true,
            hideConferenceTimer: true,
            // The embedded API opens and owns the floating window, so the lesson
            // preview can stay visible on other tabs and windows.
            pip: {
              enableBrowserPiP: true,
              showToolbarButton: true,
            },
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
        onApiReadyRef.current?.(api);
        api.addListener("videoConferenceJoined", () => {
          setJoined(true);
          onJoinedRef.current?.();
        });
        api.addListener("videoConferenceLeft", () => {
          onLeftRef.current?.();
        });
        api.addListener("readyToClose", () => onCloseRef.current());
      })
      .catch((error: unknown) => {
        if (!disposed) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load the video room."
          );
        }
      });

    return () => {
      disposed = true;
      onApiReadyRef.current?.(null);
      api?.dispose();
    };
  }, [domain, room, mode]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div ref={containerRef} className="h-full w-full" />

      {!mode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black p-6 text-center text-white">
          <div>
            <h2 className="text-2xl font-semibold">
              Ready to join your lesson?
            </h2>
            <p className="mt-2 max-w-md text-sm opacity-70">
              Your browser will ask for camera and microphone access. Allow it
              so your teacher can see and hear you.
            </p>
          </div>
          {mediaAvailable === false && (
            <p className="max-w-md rounded-xl bg-amber-400/15 px-4 py-3 text-sm text-amber-100">
              No camera or microphone was detected on this device. You can still
              join to watch and listen, and the lesson audio will play through
              your speakers.
            </p>
          )}
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
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                mediaAvailable === false
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "border border-white/20 opacity-80 hover:bg-white/10"
              }`}
            >
              <VideoOff size={16} /> Join without camera & mic
            </button>
          </div>
          {requesting && (
            <p className="inline-flex items-center gap-2 text-sm opacity-80">
              <Loader2 size={16} className="animate-spin" /> Waiting for browser
              permission…
            </p>
          )}
          {permissionError && (
            <div
              role="alert"
              className="max-w-md rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200"
            >
              <p>{permissionError}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => void requestDevices("view-only")}
                  className="rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-black transition hover:bg-white"
                >
                  Join without camera & mic
                </button>
                <button
                  type="button"
                  onClick={() => void requestDevices("audio-video")}
                  className="rounded-lg border border-white/40 px-3 py-2 text-xs font-semibold transition hover:bg-white/10"
                >
                  Try again
                </button>
              </div>
            </div>
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
          <p className="text-sm opacity-70">
            Refresh the page to try again, or contact the academy.
          </p>
        </div>
      )}
    </div>
  );
}
