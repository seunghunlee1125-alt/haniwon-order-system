export const dynamic = "force-dynamic";

import Link from "next/link";
import Header from "@/components/layout/Header";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { ITEM_CATEGORY_LABEL } from "@/types";
import { Plus } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  ON_SALE:      "bg-green-100 text-green-700",
  DISCONTINUED: "bg-gray-100 text-gray-700",
  OUT_OF_STOCK: "bg-red-100 text-red-700",
};
const STATUS_LABEL: Record<string, string> = {
  ON_SALE:      "판매중",
  DISCONTINUED: "단종",
  OUT_OF_STOCK: "품절",
};

export default async function ItemsPage() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header title="품목 관리" />

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">총 {items.length}개 품목</p>
        <Link
          href="/items/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          품목 등록
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">품목코드</th>
                <th className="table-header">품명</th>
                <th className="table-header">규격/단위</th>
                <th className="table-header">카테고리</th>
                <th className="table-header">공급가</th>
                <th className="table-header">재고</th>
                <th className="table-header">의료기기</th>
                <th className="table-header">상태</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-cell text-center text-gray-400 py-12">
                    등록된 품목이 없습니다.{" "}
                    <Link href="/items/new" className="text-blue-600 hover:underline">
                      첫 품목을 등록해보세요.
                    </Link>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-500 font-mono text-xs">
                      {item.itemCode ?? "-"}
                    </td>
                    <td className="table-cell font-medium text-gray-900">
                      {item.itemName}
                    </td>
                    <td className="table-cell text-gray-500">
                      {[item.spec, item.unit].filter(Boolean).join(" / ") || "-"}
                    </td>
                    <td className="table-cell">
                      {ITEM_CATEGORY_LABEL[item.category]}
                    </td>
                    <td className="table-cell font-medium">
                      {formatCurrency(Number(item.supplyPrice))}
                    </td>
                    <td className="table-cell">{item.stockQty}개</td>
                    <td className="table-cell">
                      {item.isMedicalDevice ? (
                        <span className="badge bg-purple-100 text-purple-700">
                          {item.deviceGrade}등급
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${STATUS_COLOR[item.status]}`}>
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/items/${item.id}`}
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
