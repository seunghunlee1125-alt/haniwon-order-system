import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 시드 데이터 생성 시작...");

  // 관리자 계정 생성
  const hashedPw = await bcrypt.hash("admin1234", 10);

  const admin = await prisma.user.upsert({
    where:  { email: "admin@haniwon.com" },
    update: {},
    create: {
      name:     "관리자",
      email:    "admin@haniwon.com",
      password: hashedPw,
      role:     "ADMIN",
      phone:    "010-0000-0000",
    },
  });
  console.log("✅ 관리자 계정:", admin.email);

  // 영업사원 계정
  const sales = await prisma.user.upsert({
    where:  { email: "sales@haniwon.com" },
    update: {},
    create: {
      name:     "김영업",
      email:    "sales@haniwon.com",
      password: await bcrypt.hash("sales1234", 10),
      role:     "SALES",
    },
  });
  console.log("✅ 영업사원 계정:", sales.email);

  // 샘플 한의원
  const clinic1 = await prisma.clinic.upsert({
    where:  { businessNo: "123-45-67890" },
    update: {},
    create: {
      clinicName:      "강남한의원",
      ceoName:         "이원장",
      businessNo:      "123-45-67890",
      address:         "서울시 강남구 테헤란로 123",
      deliveryAddress: "서울시 강남구 테헤란로 123 1층",
      phone:           "02-1234-5678",
      email:           "gangnam@clinic.com",
      paymentType:     "MONTHLY",
      creditLimit:     5000000,
      salesRepId:      sales.id,
      startDate:       new Date("2024-01-01"),
      status:          "ACTIVE",
    },
  });

  const clinic2 = await prisma.clinic.upsert({
    where:  { businessNo: "234-56-78901" },
    update: {},
    create: {
      clinicName:  "서초한의원",
      ceoName:     "박원장",
      businessNo:  "234-56-78901",
      address:     "서울시 서초구 서초대로 456",
      phone:       "02-2345-6789",
      paymentType: "MONTHLY",
      creditLimit: 3000000,
      salesRepId:  sales.id,
      startDate:   new Date("2024-03-01"),
      status:      "ACTIVE",
    },
  });
  console.log("✅ 샘플 한의원 생성:", clinic1.clinicName, clinic2.clinicName);

  // 샘플 품목
  const items = await Promise.all([
    prisma.item.upsert({
      where:  { itemCode: "CS-001" },
      update: {},
      create: {
        itemCode:    "CS-001",
        itemName:    "일회용 침",
        spec:        "0.20×30mm",
        unit:        "박스(100개)",
        category:    "CONSUMABLE",
        supplyPrice: 8000,
        listPrice:   10000,
        stockQty:    500,
        manufacturer: "동방침구",
        supplier:    "동방메디컬",
      },
    }),
    prisma.item.upsert({
      where:  { itemCode: "CS-002" },
      update: {},
      create: {
        itemCode:    "CS-002",
        itemName:    "한방 거즈",
        spec:        "10×10cm, 12겹",
        unit:        "박스(100매)",
        category:    "CONSUMABLE",
        supplyPrice: 12000,
        listPrice:   15000,
        stockQty:    300,
        manufacturer: "신흥메디칼",
      },
    }),
    prisma.item.upsert({
      where:  { itemCode: "MD-001" },
      update: {},
      create: {
        itemCode:       "MD-001",
        itemName:       "적외선 조사기",
        spec:           "250W, 원적외선",
        unit:           "대",
        category:       "MEDICAL_DEVICE",
        supplyPrice:    180000,
        listPrice:      250000,
        isMedicalDevice: true,
        licenseNo:      "수허 12345호",
        deviceGrade:    2,
        stockQty:       20,
        manufacturer:   "태양메디텍",
      },
    }),
    prisma.item.upsert({
      where:  { itemCode: "CS-003" },
      update: {},
      create: {
        itemCode:    "CS-003",
        itemName:    "소독용 알코올 솜",
        spec:        "개별포장",
        unit:        "박스(200개)",
        category:    "CONSUMABLE",
        supplyPrice: 5500,
        listPrice:   7000,
        stockQty:    800,
        manufacturer: "유한킴벌리",
      },
    }),
  ]);
  console.log("✅ 샘플 품목:", items.map((i) => i.itemName).join(", "));

  console.log("\n🎉 시드 완료!");
  console.log("─────────────────────────────");
  console.log("관리자 로그인 정보:");
  console.log("  이메일:   admin@haniwon.com");
  console.log("  비밀번호: admin1234");
  console.log("─────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
