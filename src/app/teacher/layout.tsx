"use client";

import { TeacherAgreementGate } from "@/components/TeacherAgreementGate";
import type { ReactNode } from "react";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return <TeacherAgreementGate>{children}</TeacherAgreementGate>;
}
