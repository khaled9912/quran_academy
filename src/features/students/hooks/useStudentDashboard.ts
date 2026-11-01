"use client";

import { useQuery } from "@tanstack/react-query";
import { getLessons } from "@/services/lesson.service";
import {
  getAssignedWeeklyAvailability,
  getMyChangeRequests,
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
    queryFn: getAssignedWeeklyAvailability,
    enabled,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const changesQuery = useQuery({
    queryKey: ["change-requests", "student"],
    queryFn: getMyChangeRequests,
    enabled,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  return { lessonsQuery, availabilityQuery, changesQuery };
};
