import { backendFetch } from "@/lib/backend-client";

/**
 * Which controls a live lesson room offers. The server owns the answer so the
 * web app and the mobile binary switch together; see `LessonRoom__*` in the
 * backend operations runbook.
 */
export interface LessonRoomFlags {
  whiteboard: boolean;
  chat: boolean;
  cameraBackground: boolean;
  pen: boolean;
  /**
   * Jitsi's "Performance settings" picker. Web only: the mobile SDK fixes a
   * shorter native toolbar that has no such button, so this flag reaches the
   * payload but no mobile control.
   */
  performanceSettings: boolean;
  transcription: boolean;
  reportConcern: boolean;
}

export const LESSON_ROOM_FLAGS_KEY = ["config", "lesson-room"] as const;

export const getLessonRoomFlags = async (): Promise<LessonRoomFlags> => {
  const raw = await backendFetch<Partial<LessonRoomFlags>>(
    "/api/config/lesson-room",
    { signal: AbortSignal.timeout(10_000) }
  );
  return {
    whiteboard: Boolean(raw?.whiteboard),
    chat: Boolean(raw?.chat),
    cameraBackground: Boolean(raw?.cameraBackground),
    pen: Boolean(raw?.pen),
    performanceSettings: Boolean(raw?.performanceSettings),
    transcription: raw?.transcription === true,
    reportConcern: raw?.reportConcern === true,
  };
};
