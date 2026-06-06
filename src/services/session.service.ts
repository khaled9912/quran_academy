import { backendFetch } from "@/lib/backend-client";
import type { Session } from "@/types/session";

export const getSessions = async (): Promise<Session[]> => {
  return backendFetch("/api/sessions");
};

export const getUpcomingSessions = async (): Promise<Session[]> => {
  return backendFetch("/api/sessions?upcoming=true");
};
