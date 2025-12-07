// app/api/orders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmail } from "../../lib/mailer";
export const runtime = "nodejs";

type ServiceItem = {
  id?: string;
  name: string;
  description?: string;
  price: number;
  quantity?: number;
};

type OrderPayload = {
  customer: {
    email: string;
    name?: string;
    phone?: string;
  };
  deceased?: {
    name?: string;
    age?: number;
  };
  ceremony?: {
    date?: string;
    time?: string;
    place?: string;
    type?: string; // "BURIAL" | "CREMATION" | др.
  };
  services?: ServiceItem[];
  notes?: string;
};

function buildEmailHtml(order: OrderPayload, total: number) {
  let servicesRows = "";

  if (order.services && order.services.length) {
    servicesRows = order.services
      .map((s, index) => {
        const qty = s.quantity ?? 1;
        const sum = s.price * qty;
        return `
          <tr>
            <td style="padding: 4px 8px; border: 1px solid #ddd;">${index + 1}</td>
            <td style="padding: 4px 8px; border: 1px solid #ddd;">${s.name}</td>
            <td style="padding: 4px 8px; border: 1px solid #ddd; text-align:right;">${qty}</td>
            <td style="padding: 4px 8px; border: 1px solid #ddd; text-align:right;">${s.price.toLocaleString(
              "ru-RU"
            )} ₽</td>
            <td style="padding: 4px 8px; border: 1px solid #ddd; text-align:right;">${sum.toLocaleString(
              "ru-RU"
            )} ₽</td>
          </tr>
        `;
      })
      .join("");
  } else {
    servicesRows = `
      <tr>
        <td colspan="5" style="padding: 8px; border: 1px solid #ddd; text-align:center;">
          Перечень услуг не заполнен
        </td>
      </tr>
    `;
  }

  const ceremony = order.ceremony ?? {};
  const deceased = order.deceased ?? {};

  return `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111;">
    <h1 style="font-size:20px; margin-bottom:16px;">Договор-оферта на организацию похорон</h1>

    <p>Уважаемый(ая) ${order.customer.name ?? "клиент"},</p>
    <p>
      Ниже — детали вашего заказа на организацию церемонии.
      Пожалуйста, внимательно ознакомьтесь с условиями и перечнем услуг.
    </p>

    <h2 style="font-size:16px; margin-top:24px; margin-bottom:8px;">1. Данные заказчика</h2>
    <p>
      Имя: ${order.customer.name ?? "не указано"}<br/>
      Email: ${order.customer.email}<br/>
      Телефон: ${order.customer.phone ?? "не указан"}
    </p>

    <h2 style="font-size:16px; margin-top:24px; margin-bottom:8px;">2. Данные усопшего</h2>
    <p>
      Имя: ${deceased.name ?? "не указано"}<br/>
      Возраст: ${
        typeof deceased.age === "number" ? deceased.age : "не указан"
      }
    </p>

    <h2 style="font-size:16px; margin-top:24px; margin-bottom:8px;">3. Данные церемонии</h2>
    <p>
      Тип церемонии: ${ceremony.type ?? "не указан"}<br/>
      Дата: ${ceremony.date ?? "не указана"}<br/>
      Время: ${ceremony.time ?? "не указано"}<br/>
      Место: ${ceremony.place ?? "не указано"}
    </p>

    <h2 style="font-size:16px; margin-top:24px; margin-bottom:8px;">4. Перечень услуг и стоимость</h2>

    <table style="border-collapse:collapse; width:100%; font-size:14px; margin-bottom:16px;">
      <thead>
        <tr>
          <th style="padding:4px 8px; border:1px solid #ddd; text-align:left;">№</th>
          <th style="padding:4px 8px; border:1px solid #ddd; text-align:left;">Услуга</th>
          <th style="padding:4px 8px; border:1px solid #ddd; text-align:right;">Кол-во</th>
          <th style="padding:4px 8px; border:1px solid #ddd; text-align:right;">Цена</th>
          <th style="padding:4px 8px; border:1px solid #ddd; text-align:right;">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${servicesRows}
        <tr>
          <td colspan="4" style="padding:8px; border:1px solid #ddd; text-align:right; font-weight:bold;">Итого:</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:right; font-weight:bold;">
            ${total.toLocaleString("ru-RU")} ₽
          </td>
        </tr>
      </tbody>
    </table>

    ${
      order.notes
        ? `<h2 style="font-size:16px; margin-top:24px; margin-bottom:8px;">5. Дополнительные пожелания</h2>
           <p>${order.notes}</p>`
        : ""
    }

    <p style="margin-top:24px; font-size:12px; color:#555;">
      Настоящее письмо является электронным подтверждением условий оказания услуг. 
      Фактическое заключение договора может быть оформлено в письменном виде при встрече с представителем ритуальной службы.
    </p>
  </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderPayload;

    if (!body.customer?.email) {
      return NextResponse.json(
        { error: "Поле customer.email обязательно" },
        { status: 400 }
      );
    }

    const total =
      body.services?.reduce((acc, s) => {
        const qty = s.quantity ?? 1;
        return acc + s.price * qty;
      }, 0) ?? 0;

    const html = buildEmailHtml(body, total);

   await sendOrderEmail({
  to: process.env.ORDER_TARGET_EMAIL || body.customer.email,
  subject: "Договор и детали заказа",
  html,
});



    // orderId можно сгенерировать как timestamp, чтобы что-то вернуть фронту
    const orderId = Date.now();

    return NextResponse.json(
      {
        success: true,
        orderId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ORDER API ERROR (POST):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Listing orders is not implemented on this endpoint" },
    { status: 200 }
  );
}
