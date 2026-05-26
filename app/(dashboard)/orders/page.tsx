export const dynamic = "force-dynamic";

import Link from "next/link";
import Header from "@/components/layout/Header";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/types";
import { Plus } from "lucide-react";

const STATUS_TABS = [
  { key: "ALL",       label: "전체" },
  { key: "RECEIVED",  label: "접수" },
  { key: "CONFIRMED", label: "확인" },
  { key: "PREPARING", label: "출고준비" },
  { key: "SHIPPED",   label: "출고" },
  { key: "DELIVERED", label: "납품완료" },
  { key: "SETTLED",   label: "정산완료" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusFilter = searchParams.status ?? "ALL";

  const orders = await prisma.order.findMany({
    where:
      statusFilter === "ALL"
        ? { status: { not: "CANCELLED" } }
        : { status: statusFilter as never },
    orderBy: { createdAt: "desc" },
    include: {
      clinic: { select: { clinicName: true } },
      orderItems: { select: { qty: true } },
    },
  });

  return (
    <>
      <Header title="주문 관리" />

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">총 {orders.length}건</p>
        <Link
          href="/orders/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          주문 접수
        </Link>
      </div>

      {/* 상태 탭 */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "ALL" ? "/orders" : `/orders?status=${tab.key}`}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">주문번호</th>
                <th className="table-header">한의원</th>
                <th className="table-header">품목수</th>
                <th className="table-header">합계금액</th>
                <th className="table-header">납품요청일</th>
                <th className="table-header">주문일시</th>
                <th className="table-header">상태</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center text-gray-400 py-12">
                    주문 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-blue-600">
                      <Link href={`/orders/${order.id}`}>{order.orderNo}</Link>
                    </td>
                    <td className="table-cell">{order.clinic.clinicName}</td>
                    <td className="table-cell">{order.orderItems.length}종</td>
                    <td className="table-cell font-medium">
                      {formatCurrency(Number(order.totalAmount))}
                    </td>
                    <td className="table-cell">
                      {formatDate(order.requestedDeliveryDate)}
                    </td>
                    <td className="table-cell text-gray-500">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${ORDER_STATUS_COLOR[order.status]}`}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        상세
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
