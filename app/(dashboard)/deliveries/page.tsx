import Link from "next/link";
import Header from "@/components/layout/Header";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/types";

export default async function DeliveriesPage() {
  // 납품 대기 (출고 상태) + 납품 완료 주문 목록
  const orders = await prisma.order.findMany({
    where: { status: { in: ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"] } },
    orderBy: [
      { status: "asc" },
      { requestedDeliveryDate: "asc" },
    ],
    include: {
      clinic: { select: { clinicName: true, deliveryAddress: true, address: true } },
      delivery: true,
    },
  });

  const pending   = orders.filter((o) => o.status !== "DELIVERED");
  const completed = orders.filter((o) => o.status === "DELIVERED");

  return (
    <>
      <Header title="납품 관리" />

      {/* 납품 대기 */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          납품 대기{" "}
          <span className="text-sm font-normal text-orange-600">
            ({pending.length}건)
          </span>
        </h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">주문번호</th>
                  <th className="table-header">한의원</th>
                  <th className="table-header">납품지 주소</th>
                  <th className="table-header">납품요청일</th>
                  <th className="table-header">주문상태</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center text-gray-400 py-8">
                      납품 대기 건이 없습니다.
                    </td>
                  </tr>
                ) : (
                  pending.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium text-blue-600">
                        <Link href={`/orders/${order.id}`}>{order.orderNo}</Link>
                      </td>
                      <td className="table-cell">{order.clinic.clinicName}</td>
                      <td className="table-cell text-gray-500 text-xs">
                        {order.clinic.deliveryAddress ?? order.clinic.address ?? "-"}
                      </td>
                      <td className="table-cell">
                        {formatDate(order.requestedDeliveryDate)}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${ORDER_STATUS_COLOR[order.status]}`}>
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                      </td>
                      <td className="table-cell">
                        <Link
                          href={`/deliveries/${order.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          납품처리
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 납품 완료 */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          납품 완료{" "}
          <span className="text-sm font-normal text-green-600">
            ({completed.length}건)
          </span>
        </h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">납품번호</th>
                  <th className="table-header">주문번호</th>
                  <th className="table-header">한의원</th>
                  <th className="table-header">납품일</th>
                  <th className="table-header">수령자</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {completed.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center text-gray-400 py-8">
                      납품 완료 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  completed.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium text-gray-700">
                        {order.delivery?.deliveryNo ?? "-"}
                      </td>
                      <td className="table-cell text-blue-600">
                        <Link href={`/orders/${order.id}`}>{order.orderNo}</Link>
                      </td>
                      <td className="table-cell">{order.clinic.clinicName}</td>
                      <td className="table-cell">
                        {formatDate(order.delivery?.deliveryDate ?? null)}
                      </td>
                      <td className="table-cell">
                        {order.delivery?.receiverName ?? "-"}
                      </td>
                      <td className="table-cell">
                        <Link
                          href={`/deliveries/${order.id}`}
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
      </div>
    </>
  );
}
