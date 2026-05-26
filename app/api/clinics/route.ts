import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const ClinicSchema = z.object({
  clinicName:      z.string().min(1, "원명은 필수입니다"),
  ceoName:         z.string().optional(),
  businessNo:      z.string().optional(),
  address:         z.string().optional(),
  deliveryAddress: z.string().optional(),
  phone:           z.string().optional(),
  email:           z.string().email().optional().or(z.literal("")),
  paymentType:     z.enum(["MONTHLY", "PREPAID", "CARD"]).default("MONTHLY"),
  creditLimit:     z.number().default(0),
  salesRepId:      z.string().uuid().optional(),
  startDate:       z.string().optional().nullable(),
});

// GET /api/clinics
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const clinics = await prisma.clinic.findMany({
    where: {
      ...(search && {
        OR: [
          { clinicName: { contains: search, mode: "insensitive" } },
          { ceoName:    { contains: search, mode: "insensitive" } },
          { phone:      { contains: search } },
        ],
      }),
      ...(status && { status: status as never }),
    },
    include: {
      salesRep: { select: { name: true } },
      _count:   { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: clinics });
}

// POST /api/clinics
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = ClinicSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "입력값 오류" },
      { status: 400 }
    );
  }

  const { email, salesRepId, startDate, ...rest } = parsed.data;

  const clinic = await prisma.clinic.create({
    data: {
      ...rest,
      email:      email || null,
      salesRepId: salesRepId || null,
      startDate:  startDate ? new Date(startDate) : null,
    },
  });

  return NextResponse.json({ success: true, data: clinic }, { status: 201 });
}
