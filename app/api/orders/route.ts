import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateOrderNo } from "@/lib/utils";
import { z } from "zod";

const OrderItemSchema = z.object({
  itemId:    z.string().uuid(),
  qty:       z.number().int().positive(),
  unitPrice: z.number().positive(),
});

const OrderSchema = z.object({
  clinicId:              z.string().uuid(),
  deliveryAddress:       z.string().optional(),
  requestedDeliveryDate: z.string().optional().nullable(),
  orderChannel:          z.enum(["APP", "PHONE", "ADMIN", "WEB"]).default("ADMIN"),
  memo:                  z.string().optional(),
  items:                 z.array(OrderItemSchema).min(1, "품목을 1개 이상 선택하세요"),
});

// GET /api/orders
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status   = searchParams.get("status") ?? "";
  const clinicId = searchParams.get("clinicId") ?? "";

  const orders = await prisma.order.findMany({
    where: {
      ...(status   && { status: status as never }),
      ...(clinicId && { clinicId }),
    },
    include: {
      clinic:     { select: { clinicName: true } },
      orderItems: { include: { item: { select: { itemName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: orders });
}

// POST /api/orders
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = OrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "입력값 오류" },
      { status: 400 }
    );
  }

  const { items, requestedDeliveryDate, ...orderData } = parsed.data;

  // 합계 계산
  const totalAmount = items.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  );

  // 주문번호 생성 (당일 시퀀스)
  const todayCount = await prisma.order.count({
    where: {
      orderDate: {
        gte: new Date(new Date().toDateString()),
      },
    },
  });
  const orderNo = generateOrderNo(todayCount + 1);

  const order = await prisma.order.create({
    data: {
      ...orderData,
      orderNo,
      totalAmount,
      requestedDeliveryDate: requestedDeliveryDate
        ? new Date(requestedDeliveryDate)
        : null,
      createdById: (session.user as { id?: string }).id,
      orderItems: {
        create: items.map((item) => ({
          itemId:    item.itemId,
          qty:       item.qty,
          unitPrice: item.unitPrice,
          amount:    item.qty * item.unitPrice,
        })),
      },
    },
    include: { orderItems: true },
  });

  return NextResponse.json({ success: true, data: order }, { status: 201 });
}
