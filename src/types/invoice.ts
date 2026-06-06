export interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  dueDate?: string;
  status?: "paid" | "unpaid" | "overdue";
}
