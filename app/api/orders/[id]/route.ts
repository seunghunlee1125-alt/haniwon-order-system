import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET /api/orders/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      clinic:     true,
      orderItems: { include: { item: true } },
      delivery:   { include: { deliveryItems: { include: { item: true } } } },
      salesRep:   { select: { name: true } },
      createdBy:  { select: { name: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: order });
}

// PATCH /api/orders/:id  → 주문 상태 변경
const PatchSchema = z.object({
  status: z
    .enum(["RECEIVED", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "SETTLED", "CANCELLED"])
    .optional(),
  memo: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = PatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "입력값 오류" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data:  parsed.data,
  });

  return NextResponse.json({ success: true, data: order });
}
