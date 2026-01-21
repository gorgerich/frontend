import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOrderEmail } from "@/lib/mailer";
import { buildOrderSummary } from "@/lib/orderSummary";

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
  ceremony?: {
    type?: string;
    order?: string;
    date?: string;
    time?: string;
    timeSlot?: string;
    place?: string;
    cemetery?: string;
    serviceType?: string;
  };
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

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Первая половина дня",
  afternoon: "Вторая половина дня",
  evening: "Вечер",
  night: "Ночь",
};

function formatDateValue(value?: string | Date) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toLocaleDateString("ru-RU");
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("ru-RU");
  }
  return String(value);
}

function formatTimeSlotLabel(timeSlot?: string, time?: string) {
  if (timeSlot && TIME_SLOT_LABELS[timeSlot]) return TIME_SLOT_LABELS[timeSlot];
  if (timeSlot) return timeSlot;
  if (time) return time;
  return undefined;
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
  options?: {
    orderSummaryHtml?: string;
    showServicesTable?: boolean;
    paymentMethodLabel?: string;
    paymentLink?: string | null;
    orderId?: string;
    createdAtLabel?: string;
  },
) {
  const customerName = body.customer?.name ?? body.userName ?? "клиент";
  const customerEmail = body.customer?.email ?? body.userEmail ?? "";
  const customerPhone = body.customer?.phone ?? "";

  const ceremony = body.ceremony ?? {};
  const deceased = body.deceased ?? {};
  const ceremonyDateLabel = formatDateValue(
    ceremony.date ?? body.formData?.farewellDateTime?.date,
  );
  const ceremonyTimeLabel = formatTimeSlotLabel(
    ceremony.timeSlot ?? body.formData?.farewellDateTime?.timeSlot,
    ceremony.time ?? body.formData?.farewellDateTime?.time,
  );

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

  const servicesHeadingIndex = orderSummaryHtml ? 5 : 4;
  const servicesTableHtml = showServicesTable
    ? `
    <h2 style="font-size:16px; margin:18px 0 8px;">${servicesHeadingIndex}. Перечень услуг и стоимость</h2>

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
  const paymentMethodLabel = options?.paymentMethodLabel;
  const paymentLink = options?.paymentLink;
  const orderId = options?.orderId ?? "";
  const createdAtLabel = options?.createdAtLabel ?? new Date().toLocaleDateString("ru-RU");

  const line = (label: string, value?: string) => {
    if (!value) return "";
    const trimmed = String(value).trim();
    if (!trimmed) return "";
    return `${escapeHtml(label)}: ${escapeHtml(trimmed)}`;
  };

  const customerLines = [
    line("Имя", customerName && customerName !== "клиент" ? customerName : ""),
    line("Email", customerEmail),
    line("Телефон", customerPhone),
  ].filter(Boolean);
  const deceasedLines = [
    line("Имя", deceased.name),
    line("Дата рождения", deceased.birthDate),
    line("Дата смерти", deceased.deathDate),
    line("Степень родства", deceased.relationship),
  ].filter(Boolean);
  const ceremonyLines = [
    line("Тип", ceremony.type ?? body.formData?.ceremonyType),
    line("Кладбище", ceremony.cemetery ?? body.formData?.cemetery),
    line("Дата", ceremonyDateLabel),
    line("Время", ceremonyTimeLabel),
    line("Место", ceremony.place),
  ].filter(Boolean);

  const customerBlock = customerLines.length
    ? `
      <div style="margin:0 0 12px;">
        <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:6px;">Данные заказчика</div>
        <div style="font-size:14px;line-height:1.7;color:#374151;">${customerLines.join("<br/>")}</div>
      </div>
    `
    : "";
  const deceasedBlock = deceasedLines.length
    ? `
      <div style="margin:0 0 12px;">
        <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:6px;">Данные усопшего</div>
        <div style="font-size:14px;line-height:1.7;color:#374151;">${deceasedLines.join("<br/>")}</div>
      </div>
    `
    : "";
  const ceremonyBlock = ceremonyLines.length
    ? `
      <div style="margin:0 0 12px;">
        <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:6px;">Данные церемонии</div>
        <div style="font-size:14px;line-height:1.7;color:#374151;">${ceremonyLines.join("<br/>")}</div>
      </div>
    `
    : "";

  const detailsHtml = [customerBlock, deceasedBlock, ceremonyBlock, orderSummaryHtml, servicesTableHtml]
    .filter(Boolean)
    .join("");

  const paymentText = paymentLink
    ? `Ссылка на оплату: <a href="${escapeHtml(paymentLink)}" target="_blank" rel="noreferrer">${escapeHtml(
        paymentLink,
      )}</a>`
    : "Ссылка на оплату будет направлена отдельным письмом.";

  const paymentBlock = paymentMethodLabel
    ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
        style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;">
        <tr>
          <td style="padding:16px;">
            <div style="font-size:14px;font-weight:700;color:#111;">Оплата</div>
            <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#374151;">
              Способ оплаты: <b>${escapeHtml(paymentMethodLabel)}</b><br/>
              ${paymentText}
            </div>
            <div style="margin-top:12px;padding:12px 12px;border-radius:12px;background:#f3f4f6;border:1px solid #e5e7eb;">
              <div style="font-size:13px;line-height:1.7;color:#111;">
                Важно: мы никогда не просим номер карты и CVC. Оплата проводится только на защищённой странице банка/провайдера.
                Если есть сомнения — напишите на <a href="mailto:info@tihiydom.com" style="color:#111;text-decoration:underline;">info@tihiydom.com</a>.
              </div>
            </div>
          </td>
        </tr>
      </table>
    `
    : "";

  return `
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Договор-оферта и детали заказа</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#111;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Заявка №${escapeHtml(orderId)} принята. Договор и детали заказа внутри.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f9;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;">
            <tr>
              <td style="padding:18px 18px 10px 18px;">
                <div style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">
                  Тихий дом
                </div>
                <div style="margin-top:10px;font-size:26px;line-height:1.2;font-weight:700;color:#111;">
                  Примите наши соболезнования.
                </div>
                <div style="margin-top:10px;font-size:15px;line-height:1.6;color:#374151;">
                  Мы получили вашу заявку и уже зафиксировали выбранные услуги и стоимость.
                  Ниже — договор-оферта, детали заказа и итоговая сумма.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 18px 18px 18px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                  style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;">
                  <tr>
                    <td style="padding:16px 16px 6px 16px;">
                      <div style="font-size:14px;color:#6b7280;">Номер заявки</div>
                      <div style="margin-top:2px;font-size:18px;font-weight:700;color:#111;">№ ${escapeHtml(
                        orderId,
                      )}</div>
                      <div style="margin-top:6px;font-size:13px;line-height:1.6;color:#6b7280;">
                        Дата: ${escapeHtml(createdAtLabel)}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 16px 14px 16px;">
                      <div style="height:1px;background:#e5e7eb;"></div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 16px 14px 16px;">
                      <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:8px;">Что будет дальше</div>
                      <ol style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.7;">
                        <li>Мы проверим детали заявки и при необходимости уточним важные моменты.</li>
                        <li>Если вы выбрали оплату по защищённой ссылке — отправим ссылку отдельным письмом.</li>
                        <li>После подтверждения — передадим заказ партнёрам и будем держать в курсе статуса.</li>
                      </ol>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 16px 14px 16px;">
                      <div style="height:1px;background:#e5e7eb;"></div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 16px 14px 16px;">
                      <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:8px;">Детали заказа</div>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                        style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
                        <tr>
                          <td style="padding:14px;">
                            ${detailsHtml || "<div style=\"font-size:14px;color:#6b7280;\">Данные заказа не заполнены.</div>"}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 16px 14px 16px;">
                      <div style="height:1px;background:#e5e7eb;"></div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 16px 16px 16px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-size:14px;color:#6b7280;">Итого</td>
                          <td align="right" style="font-size:18px;font-weight:800;color:#111;">${formatRub(
                            totalRub,
                          )}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            ${
              paymentBlock
                ? `<tr><td style="padding:0 18px 18px 18px;">${paymentBlock}</td></tr>`
                : ""
            }

            ${
              notes
                ? `<tr><td style="padding:0 18px 18px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                      style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;">
                      <tr>
                        <td style="padding:16px;">
                          <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:8px;">Дополнительные пожелания</div>
                          <div style="font-size:14px;line-height:1.7;color:#374151;">${escapeHtml(notes)}</div>
                        </td>
                      </tr>
                    </table>
                  </td></tr>`
                : ""
            }

            <tr>
              <td style="padding:0 18px 24px 18px;color:#6b7280;font-size:12px;line-height:1.6;">
                Если вы хотите уточнить детали — просто ответьте на это письмо или напишите на
                <a href="mailto:info@tihiydom.com" style="color:#6b7280;text-decoration:underline;">info@tihiydom.com</a>.
                <br/><br/>
                © ${new Date().getFullYear()} Тихий дом
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderPayload;

    const customerEmail = String(body.customer?.email ?? body.userEmail ?? "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
    if (!emailOk) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    const services = normalizeServices(body);
    const totalRub = computeTotalRub(body, services);
    const totalAmount = Math.round(totalRub * 100);

    const publicId = "order_" + crypto.randomBytes(6).toString("hex");
    const paymentMethodRaw = String(body.paymentMethod ?? body.formData?.paymentMethod ?? "").trim();
    const paymentMethod =
      paymentMethodRaw === "card" || paymentMethodRaw === "sbp" || paymentMethodRaw === "transfer"
        ? paymentMethodRaw
        : undefined;
    const paymentMethodLabel =
      paymentMethod === "card"
        ? "Картой по защищённой ссылке"
        : paymentMethod === "sbp"
          ? "СБП по QR"
          : paymentMethod === "transfer"
            ? "Оплата по банковским реквизитам"
            : undefined;
    const paymentLink =
      paymentMethod === "card"
        ? process.env.PAYMENT_LINK_CARD || null
        : paymentMethod === "sbp"
          ? process.env.PAYMENT_LINK_SBP || null
          : paymentMethod === "transfer"
            ? process.env.PAYMENT_LINK_TRANSFER || null
            : null;

    const user = await prisma.user.upsert({
      where: { email: customerEmail },
      update: { name: body.customer?.name ?? body.userName ?? undefined },
      create: { email: customerEmail, name: body.customer?.name ?? body.userName ?? null },
    });

    const serviceType = String(body.ceremony?.serviceType ?? body.formData?.serviceType ?? "burial");

    const createdOrder = await prisma.order.create({
      data: {
        publicId,
        userId: user.id,
        status: "PENDING",
        serviceType,
        totalAmount,
        customerEmail,
        paymentMethod: paymentMethod ?? null,
        paymentLink,
        meta: JSON.stringify({ ...body, services }),
      },
    });
    console.info("order_created", { orderId: publicId });

    // email
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

    const paymentPlan = bodyForEmail.formData?.paymentPlan;
    const paidNowRaw = Number(bodyForEmail.formData?.paidNowRub);
    const payNowRub = Number.isFinite(paidNowRaw) ? paidNowRaw : undefined;
    let splitSchedule: Array<{ title: string; amountRub: number }> | undefined;
    if (bodyForEmail.formData?.splitSchedule) {
      try {
        const parsed = JSON.parse(String(bodyForEmail.formData.splitSchedule));
        if (Array.isArray(parsed)) {
          splitSchedule = parsed
            .map((entry) => ({
              title: String(entry?.title || "").trim(),
              amountRub: Number(entry?.amountRub || 0),
            }))
            .filter((entry) => entry.title && Number.isFinite(entry.amountRub));
        }
      } catch {
        splitSchedule = undefined;
      }
    }

    const packageLabel =
      bodyForEmail.package?.name ??
      (bodyForEmail.formData?.packageType && bodyForEmail.formData?.packageType !== "custom"
        ? bodyForEmail.formData.packageType
        : undefined);

    const summary = buildOrderSummary(bodyForEmail.formData || {}, {
      totalRub,
      paymentPlan,
      payNowRub,
      splitSchedule,
      packageLabel,
    });

    const orderSummaryHtml = summary.htmlFragment
      ? `<h2 style="font-size:16px; margin:18px 0 8px;">4. Состав заказа</h2>${summary.htmlFragment}`
      : "";

    const createdAtLabel = createdOrder?.createdAt
      ? new Date(createdOrder.createdAt).toLocaleDateString("ru-RU")
      : new Date().toLocaleDateString("ru-RU");

    const html = buildEmailHtml(bodyForEmail, services, totalRub, {
      orderSummaryHtml,
      showServicesTable: true,
      paymentMethodLabel,
      paymentLink,
      orderId: publicId,
      createdAtLabel,
    });

    const notes = bodyForEmail.notes ?? bodyForEmail.formData?.specialRequests;
    const textLine = (label: string, value?: string) => {
      if (!value) return "";
      const trimmed = String(value).trim();
      if (!trimmed) return "";
      return `${label}: ${trimmed}`;
    };
    const customerTextLines = [
      textLine("Имя", bodyForEmail.customer?.name ?? bodyForEmail.userName),
      textLine("Email", bodyForEmail.customer?.email ?? bodyForEmail.userEmail),
      textLine("Телефон", bodyForEmail.customer?.phone),
    ].filter(Boolean);
    const deceasedTextLines = [
      textLine("Имя", bodyForEmail.deceased?.name),
      textLine("Дата рождения", bodyForEmail.deceased?.birthDate),
      textLine("Дата смерти", bodyForEmail.deceased?.deathDate),
      textLine("Степень родства", bodyForEmail.deceased?.relationship),
    ].filter(Boolean);
    const ceremonyTextLines = [
      textLine("Тип", bodyForEmail.ceremony?.type ?? bodyForEmail.formData?.ceremonyType),
      textLine("Кладбище", bodyForEmail.ceremony?.cemetery ?? bodyForEmail.formData?.cemetery),
      textLine(
        "Дата",
        formatDateValue(bodyForEmail.ceremony?.date ?? bodyForEmail.formData?.farewellDateTime?.date),
      ),
      textLine(
        "Время",
        formatTimeSlotLabel(
          bodyForEmail.ceremony?.timeSlot ?? bodyForEmail.formData?.farewellDateTime?.timeSlot,
          bodyForEmail.ceremony?.time ?? bodyForEmail.formData?.farewellDateTime?.time,
        ),
      ),
      textLine("Место", bodyForEmail.ceremony?.place),
    ].filter(Boolean);

    const textParts: string[] = ["Договор-оферта и детали заказа"];
    if (customerTextLines.length) {
      textParts.push("", "Данные заказчика", ...customerTextLines);
    }
    if (deceasedTextLines.length) {
      textParts.push("", "Данные усопшего", ...deceasedTextLines);
    }
    if (ceremonyTextLines.length) {
      textParts.push("", "Данные церемонии", ...ceremonyTextLines);
    }
    textParts.push("", "Состав заказа", summary.plainText || "Данные не заполнены");
    if (paymentMethodLabel) {
      textParts.push("", "Оплата:", `Способ оплаты: ${paymentMethodLabel}`);
      if (paymentLink) {
        textParts.push(`Ссылка на оплату: ${paymentLink}`);
      } else {
        textParts.push("Ссылка на оплату будет направлена отдельным письмом.");
      }
      textParts.push(
        "Важно: мы не просим номер карты и CVC. Оплата только на защищённой странице банка/провайдера. Если сомневаетесь — напишите на info@tihiydom.com",
      );
    }
    if (notes) {
      textParts.push("", "Дополнительные пожелания:", String(notes));
    }
    const text = textParts.join("\n");

    try {
      await sendOrderEmail({
        to: customerEmail,
        subject: "Договор, детали заказа и оплата",
        html,
        text,
        orderId: publicId,
      });
      console.info("email_sent_success", { orderId: publicId });
    } catch (e: any) {
      console.error("email_sent_failed", { orderId: publicId, error: e?.message || String(e) });
      return NextResponse.json({ error: "Email send failed" }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        orderId: publicId, // фронт ждёт строку
        totalAmount,
        totalRub,
        emailSent: true,
        paymentLink,
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
