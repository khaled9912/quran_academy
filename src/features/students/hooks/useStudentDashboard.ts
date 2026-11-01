"use client";

import { useQuery } from "@tanstack/react-query";
import { getLessons } from "@/services/lesson.service";
import {
  getAssignedTeacherAvailability,
  getMyLessonRequests,
} from "@/services/scheduling.service";
import { useAuth } from "@/providers/auth-provider";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";

export const useStudentDashboard = () => {
  const { role } = useAuth();
  const enabled = role === "student";

  const lessonsQuery = useQuery({
    queryKey: ["lessons"],
    queryFn: () => getLessons(),
    enabled,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const availabilityQuery = useQuery({
    queryKey: ["availability", "student"],
    queryFn: getAssignedTeacherAvailability,
    enabled,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const requestsQuery = useQuery({
    queryKey: ["lesson-requests", "student"],
    queryFn: getMyLessonRequests,
    enabled,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  return { lessonsQuery, availabilityQuery, requestsQuery };
};
