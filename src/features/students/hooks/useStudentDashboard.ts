"use client";

import { useQuery } from "@tanstack/react-query";
import { getLessons } from "@/services/lesson.service";
import {
  getAssignedTeacherAvailability,
  getMyLessonRequests,
} from "@/services/scheduling.service";
import { useAuth } from "@/providers/auth-provider";

export const useStudentDashboard = () => {
  const { role } = useAuth();
  const enabled = role === "student";

  const lessonsQuery = useQuery({
    queryKey: ["lessons"],
    queryFn: () => getLessons(),
    enabled,
  });

  const availabilityQuery = useQuery({
    queryKey: ["availability", "student"],
    queryFn: getAssignedTeacherAvailability,
    enabled,
  });

  const requestsQuery = useQuery({
    queryKey: ["lesson-requests", "student"],
    queryFn: getMyLessonRequests,
    enabled,
  });

  return { lessonsQuery, availabilityQuery, requestsQuery };
};
