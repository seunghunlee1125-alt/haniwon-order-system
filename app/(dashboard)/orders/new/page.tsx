"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { OrderItemInput } from "@/types";

interface Clinic { id: string; clinicName: string; deliveryAddress?: string; address?: string }
interface Item   { id: string; itemName: string; spec?: string; unit?: string; supplyPrice: number }

export default function NewOrderPage() {
  const router = useRouter();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [items,   setItems]   = useState<Item[]>([]);

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [orderItems,  setOrderItems]  = useState<OrderItemInput[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [requestedDate,   setRequestedDate]   = useState("");
  const [memo,            setMemo]            = useState("");
  const [orderChannel,    setOrderChannel]    = useState("ADMIN");

  const [itemSearch,  setItemSearch]  = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  // 한의원 목록 로드
  useEffect(() => {
    fetch("/api/clinics")
      .then((r) => r.json())
      .then((d) => setClinics(d.data ?? []));
  }, []);

  // 품목 목록 로드
  useEffect(() => {
    fetch(`/api/items?search=${encodeURIComponent(itemSearch)}`)
      .then((r) => r.json())
      .then((d) => setItems(d.data ?? []));
  }, [itemSearch]);

  function handleClinicChange(clinicId: string) {
    const clinic = clinics.find((c) => c.id === clinicId) ?? null;
    setSelectedClinic(clinic);
    if (clinic) {
      setDeliveryAddress(clinic.deliveryAddress ?? clinic.address ?? "");
    }
  }

  function addItem(item: Item) {
    setOrderItems((prev) => {
      const exists = prev.find((oi) => oi.itemId === item.id);
      if (exists) {
        return prev.map((oi) =>
          oi.itemId === item.id ? { ...oi, qty: oi.qty + 1, amount: (oi.qty + 1) * oi.unitPrice } : oi
        );
      }
      return [
        ...prev,
        {
          itemId:    item.id,
          itemName:  item.itemName,
          unit:      item.unit,
          qty:       1,
          unitPrice: Number(item.supplyPrice),
          amount:    Number(item.supplyPrice),
        },
      ];
    });
  }

  function updateQty(itemId: string, qty: number) {
    if (qty <= 0) return;
    setOrderItems((prev) =>
      prev.map((oi) =>
        oi.itemId === itemId ? { ...oi, qty, amount: qty * oi.unitPrice } : oi
      )
    );
  }

  function updatePrice(itemId: string, unitPrice: number) {
    setOrderItems((prev) =>
      prev.map((oi) =>
        oi.itemId === itemId
          ? { ...oi, unitPrice, amount: oi.qty * unitPrice }
          : oi
      )
    );
  }

  function removeItem(itemId: string) {
    setOrderItems((prev) => prev.filter((oi) => oi.itemId !== itemId));
  }

  const totalAmount = orderItems.reduce((sum, oi) => sum + oi.amount, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClinic) return setError("한의원을 선택하세요.");
    if (orderItems.length === 0) return setError("품목을 1개 이상 추가하세요.");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId:              selectedClinic.id,
          deliveryAddress,
          requestedDeliveryDate: requestedDate || null,
          orderChannel,
          memo,
          items: orderItems.map(({ itemId, qty, unitPrice }) => ({
            itemId, qty, unitPrice,
          })),
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "주문 접수 실패");
      }

      router.push("/orders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="주문 접수" />

      <div className="max-w-5xl">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-5"
        >
          <ArrowLeft size={16} /> 목록으로
        </Link>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 주문 기본 정보 */}
          <div className="card p-6">
            <h2 className="text-base font-semibold mb-4">주문 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* 한의원 선택 */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  한의원 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClinic?.id ?? ""}
                  onChange={(e) => handleClinicChange(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— 한의원 선택 —</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>{c.clinicName}</option>
                  ))}
                </select>
              </div>

              {/* 납품지 */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  납품 주소
                </label>
                <input
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="납품지 주소"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 납품요청일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  납품 요청일
                </label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 주문 경로 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주문 경로
                </label>
                <select
                  value={orderChannel}
                  onChange={(e) => setOrderChannel(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADMIN">관리자 입력</option>
                  <option value="PHONE">전화</option>
                  <option value="APP">앱</option>
                  <option value="WEB">웹</option>
                </select>
              </div>

              {/* 메모 */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                <input
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="특이사항 입력"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 품목 추가 */}
          <div className="card p-6">
            <h2 className="text-base font-semibold mb-4">품목 추가</h2>
            <input
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder="품명 또는 코드로 검색..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addItem(item)}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                >
                  <Plus size={14} className="text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.itemName}</p>
                    <p className="text-xs text-gray-400">
                      {item.spec} · {formatCurrency(Number(item.supplyPrice))}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 주문 품목 목록 */}
          <div className="card p-6">
            <h2 className="text-base font-semibold mb-4">
              주문 목록{" "}
              <span className="text-sm font-normal text-gray-500">
                ({orderItems.length}종)
              </span>
            </h2>

            {orderItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                위에서 품목을 추가하세요.
              </p>
            ) : (
              <>
                <table className="w-full mb-4">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="table-header text-left">품명</th>
                      <th className="table-header text-right">단가</th>
                      <th className="table-header text-center">수량</th>
                      <th className="table-header text-right">금액</th>
                      <th className="table-header"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orderItems.map((oi) => (
                      <tr key={oi.itemId}>
                        <td className="table-cell">
                          <p className="font-medium">{oi.itemName}</p>
                          <p className="text-xs text-gray-400">{oi.unit}</p>
                        </td>
                        <td className="table-cell text-right">
                          <input
                            type="number"
                            value={oi.unitPrice}
                            onChange={(e) => updatePrice(oi.itemId, Number(e.target.value))}
                            className="w-24 border border-gray-200 rounded px-2 py-1 text-sm text-right"
                          />
                        </td>
                        <td className="table-cell text-center">
                          <input
                            type="number"
                            min={1}
                            value={oi.qty}
                            onChange={(e) => updateQty(oi.itemId, Number(e.target.value))}
                            className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-center"
                          />
                        </td>
                        <td className="table-cell text-right font-medium">
                          {formatCurrency(oi.amount)}
                        </td>
                        <td className="table-cell">
                          <button
                            type="button"
                            onClick={() => removeItem(oi.itemId)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 합계 */}
                <div className="flex justify-end border-t border-gray-200 pt-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">합계</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? "접수 중..." : "주문 접수"}
            </button>
            <Link
              href="/orders"
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
