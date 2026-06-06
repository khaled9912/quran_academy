export interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  status: "present" | "absent" | "late";
  recordedAt?: string;
}
