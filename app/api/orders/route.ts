// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendOrderEmail } from "../../../lib/mailer";

export const runtime = "nodejs";

type ServiceItem = {
  name: string;
  description?: string;
  price: number; // RUB
  quantity?: number;
};

type OrderPayload = {
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
  };
  deceased?: {
    name?: string;
    age?: number;
    birthDate?: string;
    deathDate?: string;
    relationship?: string;
  };
  ceremony?: {
    type?: string;
    order?: string;
    date?: string;
    time?: string;
    place?: string;
    cemetery?: string;
    serviceType?: string;
  };
  // старый формат
  services?: ServiceItem[];
  notes?: string;

  // текущий формат твоего фронта
  breakdown?: Array<{
    category?: string;
    name?: string;
    title?: string;
    description?: string;
    price?: number; // RUB
    quantity?: number;
    qty?: number;
  }>;

  // итог с фронта (RUB)
  total?: number;

  // дополнительные поля (не мешают)
  paymentMethod?: string;
  userEmail?: string;
  userName?: string;
  formData?: any;
};

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeServices(body: OrderPayload): ServiceItem[] {
  // 1) если пришли services — используем
  if (Array.isArray(body.services) && body.services.length) {
    return body.services
      .filter((s) => typeof s?.price === "number" && s.price > 0)
      .map((s) => ({
        name: String(s.name ?? "Услуга"),
        description: s.description ? String(s.description) : undefined,
        price: Number(s.price),
        quantity: typeof s.quantity === "number" && s.quantity > 0 ? s.quantity : 1,
      }));
  }

  // 2) иначе строим из breakdown
  if (Array.isArray(body.breakdown) && body.breakdown.length) {
    return body.breakdown
      .filter((b) => typeof b?.price === "number" && (b.price as number) > 0)
      .map((b) => ({
        name: String(b.category ?? b.title ?? b.name ?? "Услуга"),
        description: b.description ? String(b.description) : undefined,
        price: Number(b.price),
        quantity:
          typeof b.quantity === "number" && b.quantity > 0
            ? b.quantity
            : typeof b.qty === "number" && b.qty > 0
              ? b.qty
              : 1,
      }));
  }

  return [];
}

function computeTotalRub(body: OrderPayload, services: ServiceItem[]): number {
  // Если фронт прислал total — используем (это твой текущий реальный итог)
  if (typeof body.total === "number" && body.total > 0) return body.total;

  // Иначе считаем из services/breakdown
  const calc = services.reduce((acc, s) => acc + s.price * (s.quantity ?? 1), 0);
  return calc > 0 ? calc : 0;
}

function buildEmailHtml(body: OrderPayload, services: ServiceItem[], totalRub: number) {
  const customerName =
    body.customer?.name ?? body.userName ?? "клиент";

  const customerEmail =
    body.customer?.email ?? body.userEmail ?? "";

  const customerPhone =
    body.customer?.phone ?? "";

  const ceremony = body.ceremony ?? {};
  const deceased = body.deceased ?? {};

  let servicesRows = "";
  if (services.length) {
    servicesRows = services
      .map((s, idx) => {
        const qty = s.quantity ?? 1;
        const sum = s.price * qty;
        return `
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #ddd;">${idx + 1}</td>
            <td style="padding: 6px 10px; border: 1px solid #ddd;">
              <div style="font-weight:600;">${escapeHtml(s.name)}</div>
              ${s.description ? `<div style="color:#555; font-size:12px; margin-top:2px;">${escapeHtml(s.description)}</div>` : ""}
            </td>
            <td style="padding: 6px 10px; border: 1px solid #ddd; text-align:right;">${qty}</td>
            <td style="padding: 6px 10px; border: 1px solid #ddd; text-align:right;">${s.price.toLocaleString("ru-RU")} ₽</td>
            <td style="padding: 6px 10px; border: 1px solid #ddd; text-align:right;">${sum.toLocaleString("ru-RU")} ₽</td>
          </tr>
        `;
      })
      .join("");
  } else {
    servicesRows = `
      <tr>
        <td colspan="5" style="padding: 10px; border: 1px solid #ddd; text-align:center;">
          Перечень услуг не заполнен
        </td>
      </tr>
    `;
  }

  const notes = body.notes ?? body.formData?.specialRequests;

  return `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111; line-height:1.4;">
    <h1 style="font-size:20px; margin:0 0 12px;">Договор-оферта и детали заказа</h1>

    <p style="margin:0 0 12px;">Уважаемый(ая) ${escapeHtml(String(customerName))},</p>
    <p style="margin:0 0 16px;">
      Мы получили ваш запрос на организацию церемонии. Ниже — данные заказа и итоговая стоимость.
    </p>

    <h2 style="font-size:16px; margin:18px 0 8px;">1. Данные заказчика</h2>
    <p style="margin:0 0 8px;">
      Имя: ${escapeHtml(String(customerName))}<br/>
      Email: ${escapeHtml(String(customerEmail))}<br/>
      Телефон: ${escapeHtml(String(customerPhone || "не указан"))}
    </p>

    <h2 style="font-size:16px; margin:18px 0 8px;">2. Данные усопшего</h2>
    <p style="margin:0 0 8px;">
      Имя: ${escapeHtml(String(deceased.name ?? "не указано"))}<br/>
      Дата рождения: ${escapeHtml(String(deceased.birthDate ?? "не указана"))}<br/>
      Дата смерти: ${escapeHtml(String(deceased.deathDate ?? "не указана"))}<br/>
      Степень родства: ${escapeHtml(String(deceased.relationship ?? "не указана"))}
    </p>

    <h2 style="font-size:16px; margin:18px 0 8px;">3. Данные церемонии</h2>
    <p style="margin:0 0 8px;">
      Тип: ${escapeHtml(String(ceremony.type ?? body.formData?.ceremonyType ?? "не указан"))}<br/>
      Формат / пакет: ${escapeHtml(String(ceremony.order ?? "не указан"))}<br/>
      Кладбище: ${escapeHtml(String(ceremony.cemetery ?? body.formData?.cemetery ?? "не указано"))}<br/>
      Дата: ${escapeHtml(String(ceremony.date ?? "не указана"))}<br/>
      Время: ${escapeHtml(String(ceremony.time ?? "не указано"))}<br/>
      Место: ${escapeHtml(String(ceremony.place ?? "не указано"))}
    </p>

    <h2 style="font-size:16px; margin:18px 0 8px;">4. Перечень услуг и стоимость</h2>

    <table style="border-collapse:collapse; width:100%; font-size:14px; margin:0 0 16px;">
      <thead>
        <tr>
          <th style="padding:6px 10px; border:1px solid #ddd; text-align:left;">№</th>
          <th style="padding:6px 10px; border:1px solid #ddd; text-align:left;">Услуга</th>
          <th style="padding:6px 10px; border:1px solid #ddd; text-align:right;">Кол-во</th>
          <th style="padding:6px 10px; border:1px solid #ddd; text-align:right;">Цена</th>
          <th style="padding:6px 10px; border:1px solid #ddd; text-align:right;">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${servicesRows}
        <tr>
          <td colspan="4" style="padding:10px; border:1px solid #ddd; text-align:right; font-weight:700;">Итого:</td>
          <td style="padding:10px; border:1px solid #ddd; text-align:right; font-weight:700;">
            ${totalRub.toLocaleString("ru-RU")} ₽
          </td>
        </tr>
      </tbody>
    </table>

    ${
      notes
        ? `<h2 style="font-size:16px; margin:18px 0 8px;">5. Дополнительные пожелания</h2>
           <p style="margin:0 0 8px;">${escapeHtml(String(notes))}</p>`
        : ""
    }

    <p style="margin-top:18px; font-size:12px; color:#555;">
      Это письмо подтверждает получение заявки и содержит детали заказа.
      Финальные условия и состав услуг фиксируются в договоре.
    </p>
  </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderPayload;

    const customerEmail = body.customer?.email ?? body.userEmail;
    if (!customerEmail) {
      return NextResponse.json({ error: "Поле customer.email обязательно" }, { status: 400 });
    }

    // нормализуем services из breakdown/services
    const services = normalizeServices(body);

    // считаем итог (RUB) и приводим к копейкам
    const totalRub = computeTotalRub(body, services);
    const totalAmount = Math.round(totalRub * 100);

    // ⚠️ ЭМУЛЯТОР ID (как у банка / платежки)
    const orderId = "order_" + crypto.randomBytes(6).toString("hex");

    // письмо (НЕ блокирует флоу)
    try {
      const managerEmail = process.env.ORDER_TARGET_EMAIL || "gorgerichig@gmail.com";
      const html = buildEmailHtml(
        {
          ...body,
          customer: {
            email: customerEmail,
            name: body.customer?.name ?? body.userName,
            phone: body.customer?.phone,
          },
          services,
        },
        services,
        totalRub
      );

      await sendOrderEmail({
        to: [customerEmail, managerEmail],
        subject: "Договор и детали заказа",
        html,
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
