import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

/** Tailwind 클래스 병합 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 금액 포맷 (예: 1,234,567원) */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toLocaleString("ko-KR") + "원";
}

/** 날짜 포맷 (예: 2026-05-26) */
export function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  return format(new Date(date), "yyyy-MM-dd", { locale: ko });
}

/** 날짜+시간 포맷 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return "-";
  return format(new Date(date), "yyyy-MM-dd HH:mm", { locale: ko });
}

/** 주문번호 생성 (예: ORD-20260526-001) */
export function generateOrderNo(seq: number): string {
  const date = format(new Date(), "yyyyMMdd");
  return `ORD-${date}-${String(seq).padStart(3, "0")}`;
}

/** 납품번호 생성 */
export function generateDeliveryNo(seq: number): string {
  const date = format(new Date(), "yyyyMMdd");
  return `DLV-${date}-${String(seq).padStart(3, "0")}`;
}

/** 청구서번호 생성 */
export function generateInvoiceNo(period: string, seq: number): string {
  return `INV-${period}-${String(seq).padStart(3, "0")}`;
}
