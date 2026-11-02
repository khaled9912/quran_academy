export type PaymentClaimStatus = "pending" | "confirmed" | "rejected";

export interface AcademyBankAccount {
  id: number;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  iban: string;
  swift: string;
  notes: string;
  updatedAt: string;
}

export interface BillingLesson {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  startsAt: string;
  endsAt: string;
  isTrial: boolean;
  amount: number;
}

export interface BillingMonth {
  /** Academy-time month key, e.g. 2026-11. */
  month: string;
  lessonCount: number;
  total: number;
}

export interface MonthlyPaymentClaim {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  month: string;
  lessonCount: number;
  amountUsd: number;
  status: PaymentClaimStatus;
  studentNote?: string | null;
  adminNote?: string | null;
  claimedAt: string;
  reviewedAt?: string | null;
}

export interface StudentBilling {
  month: string;
  monthClosed: boolean;
  months: BillingMonth[];
  lessons: BillingLesson[];
  totalUsd: number;
  bankAccount?: AcademyBankAccount | null;
  claim?: MonthlyPaymentClaim | null;
  canClaim: boolean;
}

export interface TeacherPayoutDetail {
  teacherId: string;
  instaPayAccount: string;
  vodafoneCashNumber: string;
  bankName: string;
  bankAccountHolder: string;
  bankIban: string;
  updatedAt: string;
}

export interface TeacherPayoutInput {
  instaPayAccount: string;
  vodafoneCashNumber: string;
  bankName: string;
  bankAccountHolder: string;
  bankIban: string;
}

export interface TeacherBilling {
  month: string;
  monthClosed: boolean;
  months: BillingMonth[];
  lessons: BillingLesson[];
  totalEgp: number;
  payoutPerLessonEgp: number;
  payoutDetails: TeacherPayoutDetail;
  hasPayoutDetails: boolean;
}

export interface TeacherBillingRate {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  studentPriceUsd: number;
  payoutEgp: number;
}

export interface AdminTeacherPayout {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  lessonCount: number;
  payoutPerLessonEgp: number;
  totalEgp: number;
  payoutDetails: TeacherPayoutDetail;
}

export interface AdminBillingOverview {
  bankAccount?: AcademyBankAccount | null;
  rates: TeacherBillingRate[];
  claims: MonthlyPaymentClaim[];
  teacherPayouts: AdminTeacherPayout[];
  month: string;
}
