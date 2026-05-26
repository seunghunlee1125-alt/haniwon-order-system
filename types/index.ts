// ──────────────────────────────────────────────
// Enum 레이블 매핑 (한국어 표시용)
// ──────────────────────────────────────────────

export const ORDER_STATUS_LABEL: Record<string, string> = {
  RECEIVED:  "접수",
  CONFIRMED: "확인",
  PREPARING: "출고준비",
  SHIPPED:   "출고",
  DELIVERED: "납품완료",
  SETTLED:   "정산완료",
  CANCELLED: "취소",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  RECEIVED:  "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
  SHIPPED:   "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  SETTLED:   "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  ISSUED:  "발행",
  UNPAID:  "미수",
  PAID:    "입금완료",
  OVERDUE: "연체",
};

export const INVOICE_STATUS_COLOR: Record<string, string> = {
  ISSUED:  "bg-blue-100 text-blue-700",
  UNPAID:  "bg-yellow-100 text-yellow-700",
  PAID:    "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export const ITEM_CATEGORY_LABEL: Record<string, string> = {
  CONSUMABLE:     "소모품",
  MEDICAL_DEVICE: "의료기기",
  HERBAL:         "한약재",
  OTHER:          "기타",
};

export const CLINIC_STATUS_LABEL: Record<string, string> = {
  ACTIVE:     "활성",
  DORMANT:    "휴면",
  TERMINATED: "거래중단",
};

export const PAYMENT_TYPE_LABEL: Record<string, string> = {
  MONTHLY: "후불 월마감",
  PREPAID: "선불",
  CARD:    "카드",
};

// ──────────────────────────────────────────────
// API 응답 타입
// ──────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ──────────────────────────────────────────────
// 폼 타입
// ──────────────────────────────────────────────
export interface ClinicFormData {
  clinicName: string;
  ceoName?: string;
  businessNo?: string;
  address?: string;
  deliveryAddress?: string;
  phone?: string;
  email?: string;
  paymentType: "MONTHLY" | "PREPAID" | "CARD";
  creditLimit?: number;
  salesRepId?: string;
}

export interface ItemFormData {
  itemCode?: string;
  itemName: string;
  spec?: string;
  unit?: string;
  category: "CONSUMABLE" | "MEDICAL_DEVICE" | "HERBAL" | "OTHER";
  supplyPrice: number;
  listPrice?: number;
  isMedicalDevice?: boolean;
  licenseNo?: string;
  deviceGrade?: number;
  stockQty?: number;
  manufacturer?: string;
  supplier?: string;
}

export interface OrderItemInput {
  itemId: string;
  itemName: string;
  unit?: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface OrderFormData {
  clinicId: string;
  deliveryAddress?: string;
  requestedDeliveryDate?: string;
  orderChannel: "APP" | "PHONE" | "ADMIN" | "WEB";
  memo?: string;
  items: OrderItemInput[];
}
