// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendOrderEmail } from "../../../lib/mailer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customer?.email) {
      return NextResponse.json(
        { error: "Поле customer.email обязательно" },
        { status: 400 }
      );
    }

    const totalRub =
      body.services?.reduce((acc: number, s: any) => {
        const qty = s.quantity ?? 1;
        return acc + s.price * qty;
      }, 0) ?? 0;

    const totalAmount = Math.round(totalRub * 100);

    // ⚠️ ЭМУЛЯТОР ID (как у банка / платежки)
    const orderId = "order_" + crypto.randomBytes(6).toString("hex");

    // письмо (НЕ блокирует флоу)
    try {
      const managerEmail =
        process.env.ORDER_TARGET_EMAIL || "gorgerichig@gmail.com";

      await sendOrderEmail({
        to: [body.customer.email, managerEmail],
        subject: "Договор и детали заказа",
        html: `<p>Заказ принят. Сумма: ${totalRub.toLocaleString("ru-RU")} ₽</p>`,
      });
    } catch (e) {
      console.warn("Email failed (ignored):", e);
    }

    return NextResponse.json(
      {
        success: true,
        orderId,
        totalAmount, // копейки
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("ORDER API ERROR:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: String(error?.message ?? error),
      },
      { status: 500 }
    );
  }
}
