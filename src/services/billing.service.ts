import { backendFetch } from "@/lib/backend-client";
import type {
  AcademyBankAccount,
  AdminBillingOverview,
  MonthlyPaymentClaim,
  StudentBilling,
  TeacherBilling,
  TeacherBillingRate,
  TeacherPayoutDetail,
  TeacherPayoutInput,
} from "@/types/billing";

const withMonth = (path: string, month?: string) =>
  month ? `${path}?month=${encodeURIComponent(month)}` : path;

export const getStudentBilling = (month?: string) =>
  backendFetch<StudentBilling>(withMonth("/api/student/billing", month));

export const markPaymentSent = (input: { month: string; note?: string }) =>
  backendFetch<MonthlyPaymentClaim>("/api/student/billing/claims", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getTeacherBilling = (month?: string) =>
  backendFetch<TeacherBilling>(withMonth("/api/teacher/billing", month));

export const savePayoutDetails = (input: TeacherPayoutInput) =>
  backendFetch<TeacherPayoutDetail>("/api/teacher/billing/payout-details", {
    method: "PUT",
    body: JSON.stringify(input),
  });

export const getAdminBilling = (month?: string) =>
  backendFetch<AdminBillingOverview>(withMonth("/api/admin/billing", month));

export const saveAcademyAccount = (input: {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  iban: string;
  swift: string;
  notes: string;
}) =>
  backendFetch<AcademyBankAccount>("/api/admin/billing/academy-account", {
    method: "PUT",
    body: JSON.stringify(input),
  });

export const saveTeacherRate = (
  teacherId: string,
  input: { studentPriceUsd: number; payoutEgp: number }
) =>
  backendFetch<TeacherBillingRate>(
    `/api/admin/billing/rates/${encodeURIComponent(teacherId)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );

export const confirmPaymentClaim = (id: string) =>
  backendFetch<MonthlyPaymentClaim>(
    `/api/admin/billing/claims/${encodeURIComponent(id)}/confirm`,
    { method: "POST" }
  );

export const rejectPaymentClaim = (id: string, note?: string) =>
  backendFetch<MonthlyPaymentClaim>(
    `/api/admin/billing/claims/${encodeURIComponent(id)}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ note: note ?? "" }),
    }
  );
