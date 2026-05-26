import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const ItemSchema = z.object({
  itemCode:        z.string().optional(),
  itemName:        z.string().min(1, "품명은 필수입니다"),
  spec:            z.string().optional(),
  unit:            z.string().optional(),
  category:        z.enum(["CONSUMABLE", "MEDICAL_DEVICE", "HERBAL", "OTHER"]).default("CONSUMABLE"),
  supplyPrice:     z.number().positive("공급가는 0보다 커야 합니다"),
  listPrice:       z.number().optional(),
  isMedicalDevice: z.boolean().default(false),
  licenseNo:       z.string().optional(),
  deviceGrade:     z.number().int().min(1).max(4).optional(),
  licenseExpiry:   z.string().optional().nullable(),
  stockQty:        z.number().int().default(0),
  manufacturer:    z.string().optional(),
  supplier:        z.string().optional(),
});

// GET /api/items
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";

  const items = await prisma.item.findMany({
    where: {
      status: { not: "DISCONTINUED" },
      ...(search && {
        OR: [
          { itemName: { contains: search, mode: "insensitive" } },
          { itemCode: { contains: search } },
        ],
      }),
      ...(category && { category: category as never }),
    },
    orderBy: { itemName: "asc" },
  });

  return NextResponse.json({ success: true, data: items });
}

// POST /api/items
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = ItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "입력값 오류" },
      { status: 400 }
    );
  }

  const { licenseExpiry, ...rest } = parsed.data;

  const item = await prisma.item.create({
    data: {
      ...rest,
      licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
    },
  });

  return NextResponse.json({ success: true, data: item }, { status: 201 });
}
