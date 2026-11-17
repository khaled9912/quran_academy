import { backendFetch } from "@/lib/backend-client";

export interface OnboardingInvite {
  fullName: string;
  slots: string[];
  meetingStartsAt: string | null;
  meetingEndsAt: string | null;
  picked: boolean;
  expiresAt: string;
}

export interface PickedMeeting {
  meetingStartsAt: string;
  meetingEndsAt: string;
  joinUrl: string;
}

export interface OnboardingMeeting {
  applicationId: string;
  room: string;
  startsAt: string;
  endsAt: string;
  counterpartName: string;
  onboardedAt: string | null;
}

export const getOnboardingInvite = (token: string) =>
  backendFetch<OnboardingInvite>(
    `/api/onboarding/${encodeURIComponent(token)}`
  );

export const pickOnboardingSlot = (token: string, slot: string) =>
  backendFetch<PickedMeeting>(
    `/api/onboarding/${encodeURIComponent(token)}/pick`,
    { method: "POST", body: JSON.stringify({ slot }) }
  );

export const getOnboardingMeeting = (applicationId?: string) =>
  backendFetch<OnboardingMeeting>(
    `/api/onboarding/meeting${
      applicationId ? `?applicationId=${encodeURIComponent(applicationId)}` : ""
    }`
  );