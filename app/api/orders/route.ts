import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOrderEmail } from "@/lib/mailer";

export const runtime = "nodejs";

type ServiceItem = {
  name: string;
  description?: string;
  price: number; // RUB
  quantity?: number;
};

type BreakdownItem = {
  name: string;
  price?: number;
};

type BreakdownSection = {
  category: string;
  price?: number;
  description?: string;
  quantity?: number;
  items?: BreakdownItem[];
};

type OrderPayload = {
  customer?: { email?: string; name?: string; phone?: string };
  deceased?: { name?: string; age?: number; birthDate?: string; deathDate?: string; relationship?: string };
  ceremony?: { type?: string; order?: string; date?: string; time?: string; place?: string; cemetery?: string; serviceType?: string };
  services?: ServiceItem[];
  notes?: string;
  breakdown?: Array<{
    category?: string;
    name?: string;
    title?: string;
    description?: string;
    price?: number | string;
    quantity?: number;
    qty?: number;
  }>;
  orderFlow?: string;
  package?: { id?: string; name?: string; price?: number | string; features?: string[] };
  addons?: Array<{ name?: string; price?: number | string }>;
  total?: number | string;
  paymentMethod?: string;
  userEmail?: string;
  userName?: string;
  formData?: any;
};

function escapeHtml(input: unknown) {
  const s = input === null || input === undefined ? "" : String(input);
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function formatRub(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function normalizeBreakdownSections(body: OrderPayload): BreakdownSection[] {
  if (Array.isArray(body.breakdown) && body.breakdown.length) {
    return body.breakdown
      .map((section) => {
        const categoryRaw = section?.category ?? section?.title ?? section?.name;
        if (!categoryRaw) return null;

        const price = toNumber(section?.price);
        const q1 = toNumber(section?.quantity);
        const q2 = toNumber(section?.qty);
        const quantity = q1 && q1 > 0 ? q1 : q2 && q2 > 0 ? q2 : 1;
        const qty = Math.floor(quantity);
        const rawItems = (section as any)?.items;
        const items = Array.isArray(rawItems)
          ? rawItems
              .map((item: any) => {
                const nameRaw = item?.name ?? item?.label ?? item?.title ?? item?.category;
                if (!nameRaw) return null;
                const itemPrice = toNumber(item?.price);
                return {
                  name: String(nameRaw),
                  price: itemPrice ?? undefined,
                } as BreakdownItem;
              })
              .filter(Boolean)
          : undefined;

        return {
          category: String(categoryRaw),
          price: price ?? undefined,
          description: section?.description ? String(section.description) : undefined,
          quantity: qty > 0 ? qty : 1,
          items: items && items.length ? (items as BreakdownItem[]) : undefined,
        } as BreakdownSection;
      })
      .filter(Boolean) as BreakdownSection[];
  }

  const sections: BreakdownSection[] = [];

  const pkg = body.package;
  if (pkg?.name) {
    const pkgFeatures = Array.isArray(pkg.features) ? pkg.features : [];
    const items = pkgFeatures
      .map((feature) => String(feature).trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    sections.push({
      category: `Пакет "${pkg.name}"`,
      price: toNumber(pkg.price) ?? undefined,
      items: items.length ? items : undefined,
    });
  }

  const addons = Array.isArray(body.addons) ? body.addons : [];
  if (addons.length) {
    const items = addons
      .map((addon) => {
        const nameRaw = addon?.name;
        if (!nameRaw) return null;
        const addonPrice = toNumber(addon?.price);
        return {
          name: String(nameRaw),
          price: addonPrice ?? undefined,
        } as BreakdownItem;
      })
      .filter(Boolean) as BreakdownItem[];

    if (items.length) {
      const addonsTotal = items.reduce((acc, item) => acc + (item.price ?? 0), 0);
      sections.push({
        category: "Дополнительные услуги",
        price: addonsTotal > 0 ? addonsTotal : undefined,
        items,
      });
    }
  }

  if (!sections.length && Array.isArray(body.services) && body.services.length) {
    const items = body.services
      .map((service) => {
        const nameRaw = service?.name;
        if (!nameRaw) return null;
        const price = toNumber(service?.price);
        return {
          name: String(nameRaw),
          price: price ?? undefined,
        } as BreakdownItem;
      })
      .filter(Boolean) as BreakdownItem[];

    if (items.length) {
      const itemsTotal = items.reduce((acc, item) => acc + (item.price ?? 0), 0);
      sections.push({
        category: "Услуги",
        price: itemsTotal > 0 ? itemsTotal : undefined,
        items,
      });
    }
  }

  return sections;
}

function normalizeServices(body: OrderPayload): ServiceItem[] {
  if (Array.isArray(body.services) && body.services.length) {
    return body.services
      .map((s) => {
        const price = toNumber((s as any)?.price);
        if (!price || price <= 0) return null;

        const quantityRaw = toNumber((s as any)?.quantity);
        const quantity = quantityRaw && quantityRaw > 0 ? Math.floor(quantityRaw) : 1;

        return {
          name: String((s as any)?.name ?? "Услуга"),
          description: (s as any)?.description ? String((s as any)?.description) : undefined,
          price,
          quantity,
        } as ServiceItem;
      })
      .filter(Boolean) as ServiceItem[];
  }

  const breakdownSections = normalizeBreakdownSections(body);
  if (breakdownSections.length) {
    return breakdownSections
      .map((section) => {
        const price = toNumber(section.price);
        if (!price || price <= 0) return null;

        return {
          name: String(section.category),
          description: section.description,
          price,
          quantity: section.quantity ?? 1,
        } as ServiceItem;
      })
      .filter(Boolean) as ServiceItem[];
  }

  return [];
}

function computeTotalRub(body: OrderPayload, services: ServiceItem[]): number {
  const totalFromFront = toNumber(body.total);
  if (totalFromFront && totalFromFront > 0) return totalFromFront;

  const calc = services.reduce((acc, s) => acc + s.price * (s.quantity ?? 1), 0);
  return calc > 0 && Number.isFinite(calc) ? calc : 0;
}

function buildOrderSummaryHtml(sections: BreakdownSection[], totalRub: number) {
  if (!sections.length) return "";

  const rows = sections
    .map((section) => {
      const sectionPriceLabel =
        typeof section.price === "number" && section.price > 0 ? formatRub(section.price) : "—";
      const itemsRows = (section.items ?? [])
        .map((item) => {
          const itemPriceLabel =
            typeof item.price === "number" && item.price > 0 ? formatRub(item.price) : "включено";
          return `
            <tr>
              <td style="padding: 6px 10px 6px 24px; border: 1px solid #eee; color:#555;">
                <span style="color:#888;">•</span> ${escapeHtml(item.name)}
              </td>
              <td style="padding: 6px 10px; border: 1px solid #eee; text-align:right; color:#555;">
                ${itemPriceLabel}
              </td>
            </tr>
          `;
        })
        .join("");

      return `
        <tr>
          <td style="padding: 8px 10px; border: 1px solid #ddd; font-weight:600;">
            ${escapeHtml(section.category)}
          </td>
          <td style="padding: 8px 10px; border: 1px solid #ddd; text-align:right; font-weight:600;">
            ${sectionPriceLabel}
          </td>
        </tr>
        ${itemsRows}
      `;
    })
    .join("");

  return `
    <h2 style="font-size:16px; margin:18px 0 8px;">4. Состав заказа</h2>
    <table style="border-collapse:collapse; width:100%; font-size:14px; margin:0 0 16px;">
      <thead>
        <tr>
          <th style="padding:6px 10px; border:1px solid #ddd; text-align:left;">Группа / услуга</th>
          <th style="padding:6px 10px; border:1px solid #ddd; text-align:right;">Стоимость</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr>
          <td style="padding:10px; border:1px solid #ddd; text-align:right; font-weight:700;">Итого:</td>
          <td style="padding:10px; border:1px solid #ddd; text-align:right; font-weight:700;">
            ${formatRub(totalRub)}
          </td>
        </tr>
      </tbody>
    </table>
  `;
}

function buildEmailHtml(
  body: OrderPayload,
  services: ServiceItem[],
  totalRub: number,
  options?: { orderSummaryHtml?: string; showServicesTable?: boolean },
) {
  const customerName = body.customer?.name ?? body.userName ?? "клиент";
  const customerEmail = body.customer?.email ?? body.userEmail ?? "";
  const customerPhone = body.customer?.phone ?? "";

  const ceremony = body.ceremony ?? {};
  const deceased = body.deceased ?? {};

  const orderSummaryHtml = options?.orderSummaryHtml ?? "";
  const showServicesTable = options?.showServicesTable !== false;

  const servicesRows = showServicesTable
    ? services.length
      ? services
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
          .join("")
      : `
        <tr>
          <td colspan="5" style="padding: 10px; border: 1px solid #ddd; text-align:center;">
            Перечень услуг не заполнен
          </td>
        </tr>
      `
    : "";

  const servicesTableHtml = showServicesTable
    ? `
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
    `
    : "";

  const notes = body.notes ?? body.formData?.specialRequests;

  return `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111; line-height:1.4;">
    <h1 style="font-size:20px; margin:0 0 12px;">Договор-оферта и детали заказа</h1>

    <p style="margin:0 0 12px;">Уважаемый(ая) ${escapeHtml(customerName)},</p>
    <p style="margin:0 0 16px;">
      Мы получили ваш запрос на организацию церемонии. Ниже — данные заказа и итоговая стоимость.
    </p>

    <h2 style="font-size:16px; margin:18px 0 8px;">1. Данные заказчика</h2>
    <p style="margin:0 0 8px;">
      Имя: ${escapeHtml(customerName)}<br/>
      Email: ${escapeHtml(customerEmail)}<br/>
      Телефон: ${escapeHtml(customerPhone || "не указан")}
    </p>

    <h2 style="font-size:16px; margin:18px 0 8px;">2. Данные усопшего</h2>
    <p style="margin:0 0 8px;">
      Имя: ${escapeHtml(deceased.name ?? "не указано")}<br/>
      Дата рождения: ${escapeHtml(deceased.birthDate ?? "не указана")}<br/>
      Дата смерти: ${escapeHtml(deceased.deathDate ?? "не указана")}<br/>
      Степень родства: ${escapeHtml(deceased.relationship ?? "не указана")}
    </p>

    <h2 style="font-size:16px; margin:18px 0 8px;">3. Данные церемонии</h2>
    <p style="margin:0 0 8px;">
      Тип: ${escapeHtml(ceremony.type ?? body.formData?.ceremonyType ?? "не указан")}<br/>
      Формат / пакет: ${escapeHtml(ceremony.order ?? "не указан")}<br/>
      Кладбище: ${escapeHtml(ceremony.cemetery ?? body.formData?.cemetery ?? "не указано")}<br/>
      Дата: ${escapeHtml(ceremony.date ?? "не указана")}<br/>
      Время: ${escapeHtml(ceremony.time ?? "не указано")}<br/>
      Место: ${escapeHtml(ceremony.place ?? "не указано")}
    </p>

    ${orderSummaryHtml}
    ${servicesTableHtml}

    ${
      notes
        ? `<h2 style="font-size:16px; margin:18px 0 8px;">5. Дополнительные пожелания</h2>
           <p style="margin:0 0 8px;">${escapeHtml(notes)}</p>`
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

    const services = normalizeServices(body);
    const totalRub = computeTotalRub(body, services);
    const totalAmount = Math.round(totalRub * 100);

    const publicId = "order_" + crypto.randomBytes(6).toString("hex");

    const user = await prisma.user.upsert({
      where: { email: customerEmail },
      update: { name: body.customer?.name ?? body.userName ?? undefined },
      create: { email: customerEmail, name: body.customer?.name ?? body.userName ?? null },
    });

    const serviceType = String(body.ceremony?.serviceType ?? body.formData?.serviceType ?? "burial");

    await prisma.order.create({
      data: {
        publicId,
        userId: user.id,
        status: "PENDING",
        serviceType,
        totalAmount,
        meta: JSON.stringify({ ...body, services }),
      },
    });

    // email
    try {
      const managerEmail = process.env.ORDER_TARGET_EMAIL || "gorgerichig@gmail.com";

      const bodyForEmail: OrderPayload = {
        ...body,
        customer: {
          email: customerEmail,
          name: body.customer?.name ?? body.userName,
          phone: body.customer?.phone,
        },
      };

      const breakdownSections = normalizeBreakdownSections(bodyForEmail);
      const isSimplified = bodyForEmail.orderFlow === "simplified";
      if (isSimplified) {
        console.log("Email breakdown sections:", breakdownSections);
      }

      const orderSummaryHtml = buildOrderSummaryHtml(breakdownSections, totalRub);

      const html = buildEmailHtml(bodyForEmail, services, totalRub, {
        orderSummaryHtml,
        showServicesTable: !orderSummaryHtml,
      });

      await sendOrderEmail({
        to: [customerEmail, managerEmail],
        subject: "Договор и детали заказа",
        html,
      });
    } catch (e) {
      console.error("Email failed (ignored):", e);
    }

    return NextResponse.json(
      {
        success: true,
        orderId: publicId, // фронт ждёт строку
        totalAmount,
        totalRub,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("ORDER API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}
