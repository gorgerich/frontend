// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, ServiceType } from "@prisma/client";
import { prisma } from `../../../lib/prisma`;

// Создание заказа
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      userEmail,
      userName,
      formData,
      total,
      breakdown,
      externalId,
    } = body;

    if (!userEmail) {
      return NextResponse.json(
        { ok: false, error: "EMAIL_REQUIRED" },
        { status: 400 },
      );
    }

    // upsert пользователя по email
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { name: userName ?? null },
      create: { email: userEmail, name: userName ?? null },
    });

    // маппинг типа услуги
    const serviceType: ServiceType =
      formData?.serviceType === "cremation"
        ? ServiceType.CREMATION
        : ServiceType.BURIAL;

    // создание заказа
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        externalId: externalId ?? null,
        status: OrderStatus.PENDING,
        serviceType,
        fullName: formData?.fullName ?? null,
        totalAmount: typeof total === "number" ? total : 0,
        meta: formData ?? {},
        items: {
          create:
            Array.isArray(breakdown) &&
            breakdown.length > 0
              ? breakdown.map((item: any) => ({
                  label: item.label ?? "Позиция",
                  amount: typeof item.amount === "number" ? item.amount : 0,
                  quantity:
                    typeof item.quantity === "number" ? item.quantity : 1,
                  kind: item.kind ?? null,
                }))
              : [],
        },
      },
    });

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (e) {
    console.error("ORDER_CREATE_FAILED", e);
    return NextResponse.json(
      { ok: false, error: "ORDER_CREATE_FAILED" },
      { status: 500 },
    );
  }
}

// Получение заказов по email (для личного кабинета)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") ?? undefined;

  try {
    const orders = await prisma.order.findMany({
      where: email ? { user: { email } } : undefined,
      include: {
        items: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, orders });
  } catch (e) {
    console.error("ORDERS_FETCH_FAILED", e);
    return NextResponse.json(
      { ok: false, error: "ORDERS_FETCH_FAILED" },
      { status: 500 },
    );
  }
}