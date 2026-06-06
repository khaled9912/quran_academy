"use client";

import { useQuery } from "@tanstack/react-query";
import { getCourses } from "@/services/course.service";
import { getUpcomingSessions } from "@/services/session.service";

export const useStudentDashboard = () => {
  const coursesQuery = useQuery({
    queryKey: ["student-courses"],
    queryFn: getCourses,
    staleTime: 1000 * 60 * 5,
  });

  const sessionsQuery = useQuery({
    queryKey: ["student-sessions"],
    queryFn: getUpcomingSessions,
    staleTime: 1000 * 60 * 5,
  });

  return { coursesQuery, sessionsQuery };
};
