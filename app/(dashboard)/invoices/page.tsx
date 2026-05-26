export const dynamic = "force-dynamic";

import Link from "next/link";
import Header from "@/components/layout/Header";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_COLOR } from "@/types";
import { Plus } from "lucide-react";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusFilter = searchParams.status ?? "ALL";

  const invoices = await prisma.invoice.findMany({
    where:
      statusFilter === "ALL"
        ? {}
        : { status: statusFilter as never },
    orderBy: { createdAt: "desc" },
    include: {
      clinic: { select: { clinicName: true } },
      payments: { select: { paidAmount: true } },
    },
  });

  // 미수금 합계
  const totalUnpaid = await prisma.invoice.aggregate({
    where: { status: { in: ["UNPAID", "OVERDUE"] } },
    _sum: { totalAmount: true },
  });

  const STATUS_TABS = [
    { key: "ALL",     label: "전체" },
    { key: "ISSUED",  label: "발행" },
    { key: "UNPAID",  label: "미수" },
    { key: "PAID",    label: "입금완료" },
    { key: "OVERDUE", label: "연체" },
  ];

  return (
    <>
      <Header title="정산/청구" />

      {/* 미수금 요약 */}
      <div className="card p-5 mb-5 border-l-4 border-red-400">
        <p className="text-sm text-gray-500 mb-1">총 미수금</p>
        <p className="text-2xl font-bold text-red-600">
          {formatCurrency(Number(totalUnpaid._sum.totalAmount ?? 0))}
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{invoices.length}건</p>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          청구서 생성
        </Link>
      </div>

      {/* 상태 탭 */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "ALL" ? "/invoices" : `/invoices?status=${tab.key}`}
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
                <th className="table-header">청구서번호</th>
                <th className="table-header">한의원</th>
                <th className="table-header">청구기간</th>
                <th className="table-header">공급가액</th>
                <th className="table-header">부가세</th>
                <th className="table-header">합계</th>
                <th className="table-header">납기일</th>
                <th className="table-header">상태</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-cell text-center text-gray-400 py-12">
                    청구서가 없습니다.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-blue-600">
                      <Link href={`/invoices/${invoice.id}`}>{invoice.invoiceNo}</Link>
                    </td>
                    <td className="table-cell">{invoice.clinic.clinicName}</td>
                    <td className="table-cell">{invoice.billingPeriod}</td>
                    <td className="table-cell">
                      {formatCurrency(Number(invoice.supplyAmount))}
                    </td>
                    <td className="table-cell">
                      {formatCurrency(Number(invoice.vatAmount))}
                    </td>
                    <td className="table-cell font-semibold">
                      {formatCurrency(Number(invoice.totalAmount))}
                    </td>
                    <td className="table-cell">{formatDate(invoice.dueDate)}</td>
                    <td className="table-cell">
                      <span className={`badge ${INVOICE_STATUS_COLOR[invoice.status]}`}>
                        {INVOICE_STATUS_LABEL[invoice.status]}
                      </span>
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/invoices/${invoice.id}`}
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
