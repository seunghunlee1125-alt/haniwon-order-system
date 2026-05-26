export const dynamic = "force-dynamic";

import Link from "next/link";
import Header from "@/components/layout/Header";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { CLINIC_STATUS_LABEL, PAYMENT_TYPE_LABEL } from "@/types";
import { Plus } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:     "bg-green-100 text-green-700",
  DORMANT:    "bg-yellow-100 text-yellow-700",
  TERMINATED: "bg-red-100 text-red-700",
};

export default async function ClinicsPage() {
  const clinics = await prisma.clinic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      salesRep: { select: { name: true } },
      _count: { select: { orders: true } },
    },
  });

  return (
    <>
      <Header title="기관 관리" />

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">총 {clinics.length}개 한의원</p>
        <Link
          href="/clinics/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          한의원 등록
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">원명</th>
                <th className="table-header">대표원장</th>
                <th className="table-header">연락처</th>
                <th className="table-header">결제방식</th>
                <th className="table-header">담당자</th>
                <th className="table-header">주문수</th>
                <th className="table-header">거래시작일</th>
                <th className="table-header">상태</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clinics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-cell text-center text-gray-400 py-12">
                    등록된 한의원이 없습니다.{" "}
                    <Link href="/clinics/new" className="text-blue-600 hover:underline">
                      첫 한의원을 등록해보세요.
                    </Link>
                  </td>
                </tr>
              ) : (
                clinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-gray-900">
                      {clinic.clinicName}
                    </td>
                    <td className="table-cell">{clinic.ceoName ?? "-"}</td>
                    <td className="table-cell">{clinic.phone ?? "-"}</td>
                    <td className="table-cell">
                      {PAYMENT_TYPE_LABEL[clinic.paymentType]}
                    </td>
                    <td className="table-cell">{clinic.salesRep?.name ?? "-"}</td>
                    <td className="table-cell">{clinic._count.orders}건</td>
                    <td className="table-cell">{formatDate(clinic.startDate)}</td>
                    <td className="table-cell">
                      <span className={`badge ${STATUS_COLOR[clinic.status]}`}>
                        {CLINIC_STATUS_LABEL[clinic.status]}
                      </span>
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/clinics/${clinic.id}`}
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
