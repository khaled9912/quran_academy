"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { JitsiExternalApi } from "@/types/jitsi";
import {
  desktopSpeechConstructor,
  postLessonLight,
  SelfTranscriptionSession,
  type CaptureState,
  type SpeechConstructor,
  type SpeechWindow,
} from "@/services/self-transcription.service";

export function useSelfTranscription(options: {
  lessonId: string;
  userId?: string;
  participant: boolean;
  enabled: boolean;
  validUntil: number;
}) {
  const latest = useRef(options);
  latest.current = options;
  const [Engine, setEngine] = useState<SpeechConstructor | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [consent, setConsentState] = useState(false);
  const consentRef = useRef(false);
  const [api, setApi] = useState<JitsiExternalApi | null>(null);
  const apiRef = useRef<JitsiExternalApi | null>(null);
  const [joinedAt, setJoinedAt] = useState<number | null>(null);
  const joinRef = useRef<number | null>(null);
  const [state, setState] = useState<CaptureState>("stopped");
  const session = useRef<SelfTranscriptionSession | null>(null);

  const allowed = useCallback(() => {
    const current = latest.current;
    return (
      current.participant &&
      Boolean(current.userId) &&
      current.enabled &&
      Date.now() < current.validUntil
    );
  }, []);

  useEffect(() => {
    const constructor = desktopSpeechConstructor(
      window as unknown as SpeechWindow
    );
    const available = Boolean(constructor && globalThis.crypto?.randomUUID);
    setSupported(available);
    setEngine(() => (available ? constructor : null));
  }, []);

  const setConsent = useCallback(
    (value: boolean) => {
      const granted = value && allowed() && supported === true;
      consentRef.current = granted;
      // Stop/abort before scheduling a React render.
      session.current?.setConsent(granted);
      setConsentState(granted);
    },
    [allowed, supported]
  );

  const stop = useCallback((flush = true) => {
    session.current?.close(flush);
    session.current = null;
    consentRef.current = false;
    joinRef.current = null;
    setJoinedAt(null);
    setConsentState(false);
    setState("stopped");
  }, []);

  const onApiReady = useCallback(
    (next: JitsiExternalApi | null) => {
      if (apiRef.current && apiRef.current !== next) stop(false);
      apiRef.current = next;
      setApi(next);
    },
    [stop]
  );

  const onJoined = useCallback(() => {
    if (joinRef.current === null) {
      joinRef.current = Date.now();
      setJoinedAt(joinRef.current);
    }
  }, []);

  useLayoutEffect(() => {
    if (
      !api ||
      joinedAt === null ||
      !Engine ||
      !options.participant ||
      !options.userId
    )
      return;
    // Bind the authenticated identity as well as the lesson. A session change
    // must not upload old text under a newly signed-in user's cookie.
    const userId = options.userId;
    const lessonId = options.lessonId;
    const currentAllowed = () =>
      allowed() &&
      latest.current.userId === userId &&
      latest.current.lessonId === lessonId;
    const current = new SelfTranscriptionSession({
      api,
      Engine,
      joinedAt,
      allowed: currentAllowed,
      send: (body, request) =>
        postLessonLight(lessonId, "transcript/self", body, request),
      onState: setState,
    });
    session.current = current;
    current.setConsent(consentRef.current);
    return () => {
      current.close(currentAllowed());
      if (session.current === current) session.current = null;
    };
  }, [
    api,
    joinedAt,
    Engine,
    options.lessonId,
    options.userId,
    options.participant,
    allowed,
  ]);

  useLayoutEffect(() => {
    if (!allowed()) {
      consentRef.current = false;
      setConsentState(false);
    }
    session.current?.refreshPermission();
    // The callback guard checks wall time too; this timer proactively releases
    // the speech service if config becomes stale with no other UI render.
    if (!options.enabled) return;
    const timer = window.setTimeout(
      () => {
        consentRef.current = false;
        session.current?.refreshPermission();
        setConsentState(false);
      },
      Math.max(0, options.validUntil - Date.now()) + 1
    );
    return () => window.clearTimeout(timer);
  }, [
    allowed,
    options.enabled,
    options.validUntil,
    options.participant,
    options.userId,
  ]);

  useEffect(() => {
    const onHide = () => stop(true);
    const onUnauthorized = () => stop(false);
    window.addEventListener("pagehide", onHide);
    // Do not wait for auth-provider's asynchronous /auth/me confirmation.
    window.addEventListener("academy:unauthorized", onUnauthorized);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("academy:unauthorized", onUnauthorized);
    };
  }, [stop]);

  return { consent, setConsent, supported, state, stop, onApiReady, onJoined };
}
