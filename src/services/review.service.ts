import { backendFetch } from "@/lib/backend-client";
import type {
  ReviewInput,
  ReviewQueueFilter,
  ReviewQueueItem,
  ReviewWorkspace,
  WeeklyDigest,
} from "@/types/review";

export interface ReviewQueueParams {
  status?: ReviewQueueFilter;
  flagged?: boolean;
  from?: string;
  to?: string;
}

export const getReviewQueue = ({
  status = "all",
  flagged,
  from,
  to,
}: ReviewQueueParams = {}) => {
  const params = new URLSearchParams({ status });
  if (flagged) params.set("flagged", "true");
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return backendFetch<ReviewQueueItem[]>(
    `/api/admin/review-queue?${params.toString()}`
  );
};

export const getReviewWorkspace = (lessonId: string) =>
  backendFetch<ReviewWorkspace>(
    `/api/admin/lessons/${encodeURIComponent(lessonId)}/review`
  );

export const saveQualityReview = (lessonId: string, input: ReviewInput) =>
  backendFetch<{
    id: string;
    lessonId: string;
    status: ReviewInput["status"];
    updatedAt: string;
  }>(`/api/admin/lessons/${encodeURIComponent(lessonId)}/review`, {
    method: "PUT",
    body: JSON.stringify(input),
  });

export const getWeeklyDigest = (weekStart?: string) =>
  backendFetch<WeeklyDigest>(
    `/api/admin/review-digest${
      weekStart ? `?weekStart=${encodeURIComponent(weekStart)}` : ""
    }`
  );
