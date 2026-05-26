"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewClinicPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    clinicName:      "",
    ceoName:         "",
    businessNo:      "",
    address:         "",
    deliveryAddress: "",
    phone:           "",
    email:           "",
    paymentType:     "MONTHLY",
    creditLimit:     "",
    startDate:       "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : 0,
          startDate:   form.startDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "등록 실패");
      }

      router.push("/clinics");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="한의원 등록" />

      <div className="max-w-2xl">
        <Link
          href="/clinics"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-5"
        >
          <ArrowLeft size={16} /> 목록으로
        </Link>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-6">기본 정보</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 원명 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  원명 <span className="text-red-500">*</span>
                </label>
                <input
                  name="clinicName"
                  value={form.clinicName}
                  onChange={handleChange}
                  required
                  placeholder="OO한의원"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  대표원장
                </label>
                <input
                  name="ceoName"
                  value={form.ceoName}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 사업자번호 / 연락처 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사업자번호
                </label>
                <input
                  name="businessNo"
                  value={form.businessNo}
                  onChange={handleChange}
                  placeholder="000-00-00000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연락처
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="02-0000-0000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 주소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사업장 주소
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="서울시 강남구 ..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                납품지 주소 <span className="text-xs text-gray-400">(다를 경우 입력)</span>
              </label>
              <input
                name="deliveryAddress"
                value={form.deliveryAddress}
                onChange={handleChange}
                placeholder="납품 주소 (비우면 사업장 주소와 동일)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="clinic@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 결제방식 / 신용한도 / 거래시작일 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제방식
                </label>
                <select
                  name="paymentType"
                  value={form.paymentType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MONTHLY">후불 월마감</option>
                  <option value="PREPAID">선불</option>
                  <option value="CARD">카드</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  신용한도 (원)
                </label>
                <input
                  name="creditLimit"
                  type="number"
                  value={form.creditLimit}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  거래시작일
                </label>
                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? "저장 중..." : "등록하기"}
              </button>
              <Link
                href="/clinics"
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                취소
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
