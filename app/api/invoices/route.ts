import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateInvoiceNo } from "@/lib/utils";
import { z } from "zod";

const InvoiceSchema = z.object({
  clinicId:      z.string().uuid(),
  billingPeriod: z.string().regex(/^\d{4}-\d{2}$/, "YYYY-MM 형식으로 입력하세요"),
  orderIds:      z.array(z.string().uuid()).min(1, "주문을 1건 이상 선택하세요"),
  dueDate:       z.string().optional().nullable(),
});

// GET /api/invoices
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status   = searchParams.get("status") ?? "";
  const clinicId = searchParams.get("clinicId") ?? "";

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status   && { status: status as never }),
      ...(clinicId && { clinicId }),
    },
    include: {
      clinic:       { select: { clinicName: true } },
      payments:     true,
      invoiceOrders: { include: { order: { select: { orderNo: true, totalAmount: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: invoices });
}

// POST /api/invoices  → 청구서 생성
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = InvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "입력값 오류" },
      { status: 400 }
    );
  }

  const { clinicId, billingPeriod, orderIds, dueDate } = parsed.data;

  // 대상 주문 합계 계산
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds }, clinicId },
  });

  const supplyAmount = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount),
    0
  );
  const vatAmount   = Math.round(supplyAmount * 0.1);
  const totalAmount = supplyAmount + vatAmount;

  // 청구서 번호 생성
  const seq = await prisma.invoice.count({ where: { billingPeriod } });
  const invoiceNo = generateInvoiceNo(billingPeriod, seq + 1);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo,
      clinicId,
      billingPeriod,
      issueDate:    new Date(),
      supplyAmount,
      vatAmount,
      totalAmount,
      status:       "ISSUED",
      dueDate:      dueDate ? new Date(dueDate) : null,
      invoiceOrders: {
        create: orderIds.map((orderId) => ({ orderId })),
      },
    },
  });

  return NextResponse.json({ success: true, data: invoice }, { status: 201 });
}
