import Header from "@/components/layout/Header";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/types";
import {
  ClipboardList,
  Truck,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

async function getStats() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    todayOrders,
    pendingDeliveries,
    unpaidInvoices,
    monthSales,
    recentOrders,
  ] = await Promise.all([
    // 오늘 접수 주문 수
    prisma.order.count({
      where: {
        orderDate: { gte: new Date(today.toDateString()) },
        status: { not: "CANCELLED" },
      },
    }),
    // 납품 예정 (출고 상태)
    prisma.order.count({
      where: { status: { in: ["CONFIRMED", "PREPARING", "SHIPPED"] } },
    }),
    // 미수금 청구서 수
    prisma.invoice.count({
      where: { status: { in: ["UNPAID", "OVERDUE"] } },
    }),
    // 이번 달 납품완료 매출합계
    prisma.order.aggregate({
      where: {
        status: { in: ["DELIVERED", "SETTLED"] },
        updatedAt: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    // 최근 주문 5건
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { clinic: { select: { clinicName: true } } },
    }),
  ]);

  return {
    todayOrders,
    pendingDeliveries,
    unpaidInvoices,
    monthSales: monthSales._sum.totalAmount ?? 0,
    recentOrders,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      label: "오늘 신규 주문",
      value: `${stats.todayOrders}건`,
      icon: ClipboardList,
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "납품 대기",
      value: `${stats.pendingDeliveries}건`,
      icon: Truck,
      color: "bg-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "미수금 청구서",
      value: `${stats.unpaidInvoices}건`,
      icon: AlertCircle,
      color: "bg-red-500",
      bg: "bg-red-50",
    },
    {
      label: "이번 달 매출",
      value: formatCurrency(Number(stats.monthSales)),
      icon: TrendingUp,
      color: "bg-green-500",
      bg: "bg-green-50",
    },
  ];

  return (
    <>
      <Header title="대시보드" />

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{card.label}</p>
                <div className={`${card.bg} p-2 rounded-lg`}>
                  <Icon size={18} className={card.color.replace("bg-", "text-")} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* 최근 주문 */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">최근 주문</h2>
          <a href="/orders" className="text-sm text-blue-600 hover:underline">
            전체보기
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">주문번호</th>
                <th className="table-header">한의원</th>
                <th className="table-header">금액</th>
                <th className="table-header">납품요청일</th>
                <th className="table-header">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-cell text-center text-gray-400 py-8">
                    주문 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-blue-600">
                      <a href={`/orders/${order.id}`}>{order.orderNo}</a>
                    </td>
                    <td className="table-cell">{order.clinic.clinicName}</td>
                    <td className="table-cell">{formatCurrency(Number(order.totalAmount))}</td>
                    <td className="table-cell">{formatDate(order.requestedDeliveryDate)}</td>
                    <td className="table-cell">
                      <span className={`badge ${ORDER_STATUS_COLOR[order.status]}`}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
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
