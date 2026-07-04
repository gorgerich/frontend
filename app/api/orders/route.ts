import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { sendOrderEmail } from "@/lib/mailer";
import { buildOrderSummary } from "@/lib/orderSummary";
import { PUBLIC_OFFER_HREF } from "@/lib/legalLinks";
import { z } from "zod";

export const runtime = "nodejs";
const MAX_ORDER_BODY_BYTES = 500_000;
const MAX_ORDER_TOTAL_RUB = 10_000_000;

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

const ShortTextSchema = z.string().trim().max(200);
const LongTextSchema = z.string().trim().max(5_000);
const MoneyInputSchema = z
  .union([
    z.number().finite(),
    z.string().trim().regex(/^\d+(?:[.,]\d{1,2})?$/),
  ])
  .refine((value) => {
    const parsed = toNumber(value);
    return parsed !== null && parsed >= 0 && parsed <= MAX_ORDER_TOTAL_RUB;
  }, "Некорректная сумма");

const BreakdownItemSchema = z.object({
  name: ShortTextSchema.optional(),
  label: ShortTextSchema.optional(),
  title: ShortTextSchema.optional(),
  category: ShortTextSchema.optional(),
  price: MoneyInputSchema.optional(),
});

const BreakdownSectionSchema = z.object({
  category: ShortTextSchema.optional(),
  name: ShortTextSchema.optional(),
  title: ShortTextSchema.optional(),
  description: LongTextSchema.optional(),
  price: MoneyInputSchema.optional(),
  quantity: z.number().int().min(1).max(100).optional(),
  qty: z.number().int().min(1).max(100).optional(),
  items: z.array(BreakdownItemSchema).max(100).optional(),
});

const FormDataSchema = z
  .object({
    specialRequests: LongTextSchema.optional(),
    paymentMethod: z.enum(["deposit_10", "call_rep"]).optional(),
    serviceType: z.enum(["burial", "cremation", "unsure"]).optional(),
    packageType: ShortTextSchema.optional(),
    paymentPlan: z.enum(["full", "deposit", "split"]).optional(),
    paidNowRub: MoneyInputSchema.optional(),
    splitSchedule: z.string().max(20_000).optional(),
  })
  .catchall(z.unknown());

const OrderPayloadSchema = z
  .object({
    customer: z
      .object({
        email: z.string().trim().email().max(254).optional(),
        name: ShortTextSchema.optional(),
        phone: z.string().trim().max(30).optional(),
      })
      .optional(),
    deceased: z
      .object({
        name: ShortTextSchema.optional(),
        age: z.number().int().min(0).max(150).optional(),
        birthDate: z.string().trim().max(40).optional(),
        deathDate: z.string().trim().max(40).optional(),
        relationship: ShortTextSchema.optional(),
      })
      .optional(),
    ceremony: z
      .object({
        type: ShortTextSchema.optional(),
        order: ShortTextSchema.optional(),
        date: z.string().trim().max(40).optional(),
        time: z.string().trim().max(40).optional(),
        timeSlot: ShortTextSchema.optional(),
        place: ShortTextSchema.optional(),
        cemetery: ShortTextSchema.optional(),
        serviceType: z.enum(["burial", "cremation", "unsure"]).optional(),
      })
      .optional(),
    services: z
      .array(
        z.object({
          name: ShortTextSchema,
          description: LongTextSchema.optional(),
          price: MoneyInputSchema,
          quantity: z.number().int().min(1).max(100).optional(),
        }),
      )
      .max(100)
      .optional(),
    notes: LongTextSchema.optional(),
    breakdown: z.array(BreakdownSectionSchema).max(50).optional(),
    orderFlow: ShortTextSchema.optional(),
    package: z
      .object({
        id: ShortTextSchema.optional(),
        name: ShortTextSchema.optional(),
        price: MoneyInputSchema.optional(),
        features: z.array(z.string().trim().max(500)).max(100).optional(),
      })
      .optional(),
    addons: z
      .array(
        z.object({
          name: ShortTextSchema.optional(),
          price: MoneyInputSchema.optional(),
        }),
      )
      .max(100)
      .optional(),
    total: MoneyInputSchema.optional(),
    paymentMethod: z.enum(["deposit_10", "call_rep"]).optional(),
    userEmail: z.string().trim().email().max(254).optional(),
    userName: ShortTextSchema.optional(),
    formData: FormDataSchema.optional(),
  })
  .refine(
    (body) =>
      body.total !== undefined ||
      Boolean(body.services?.length) ||
      Boolean(body.breakdown?.length) ||
      body.package?.price !== undefined,
    {
      message: "Заказ не содержит цены или состава",
      path: ["total"],
    },
  );

type OrderPayload = z.infer<typeof OrderPayloadSchema>;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "https://tihiydom.com";

const isAbsoluteUrl = (href: string) => /^https?:\/\//i.test(href);

function buildOfferUrl(href: string) {
  return isAbsoluteUrl(href) ? href : `${SITE_URL}${href}`;
}

function inferOfferFilename(href: string, contentType?: string | null) {
  const ext = path.extname(href).toLowerCase();
  if (ext === ".pdf" || contentType?.includes("pdf")) {
    return { filename: "Публичная оферта.pdf", contentType: "application/pdf" };
  }
  if (ext === ".html" || contentType?.includes("html")) {
    return { filename: "Публичная оферта.html", contentType: "text/html; charset=utf-8" };
  }
  return {
    filename: "Публичная оферта.html",
    contentType: contentType || "text/html; charset=utf-8",
  };
}

async function loadPublicOfferAttachment(href: string) {
  const offerUrl = buildOfferUrl(href);

  // 1) Prefer a local public file if it exists.
  if (!isAbsoluteUrl(href) && href.startsWith("/")) {
    const publicPath = path.join(process.cwd(), "public", href.replace(/^\//, ""));
    try {
      const buffer = await fs.readFile(publicPath);
      const meta = inferOfferFilename(href);
      return { offerUrl, buffer, ...meta };
    } catch {
      // Fall through to fetch.
    }
  }

  // 2) Fallback: fetch the URL.
  const res = await fetch(offerUrl, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Offer fetch failed: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const meta = inferOfferFilename(href, res.headers.get("content-type"));
  return { offerUrl, buffer, ...meta };
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
        const rawItems = section.items;
        const items = Array.isArray(rawItems)
          ? rawItems
              .map((item) => {
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
        const price = toNumber(s.price);
        if (!price || price <= 0) return null;

        const quantityRaw = toNumber(s.quantity);
        const quantity = quantityRaw && quantityRaw > 0 ? Math.floor(quantityRaw) : 1;

        return {
          name: String(s.name ?? "Услуга"),
          description: s.description ? String(s.description) : undefined,
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
          quantity: 1,
        } as ServiceItem;
      })
      .filter(Boolean) as ServiceItem[];
  }

  return [];
}

function computeTotalRub(body: OrderPayload, services: ServiceItem[]): number {
  const totalFromFront = toNumber(body.total);
  const computed = services.reduce((acc, s) => acc + s.price * (s.quantity ?? 1), 0);
  const safeComputed = computed > 0 && Number.isFinite(computed) ? Math.round(computed) : 0;
  const safeFront = totalFromFront && totalFromFront > 0 ? Math.round(totalFromFront) : 0;

  if (safeComputed > 0) {
    if (safeFront > 0 && Math.abs(safeFront - safeComputed) >= 1) {
      console.warn("order_total_mismatch", {
        frontTotalRub: safeFront,
        computedTotalRub: safeComputed,
      });
    }
    return safeComputed;
  }

  return safeFront;
}

function buildEmailHtml(
  body: OrderPayload,
  services: ServiceItem[],
  totalRub: number,
  options?: {
    orderSummaryHtml?: string;
    showServicesTable?: boolean;
    paymentMethodLabel?: string;
    paymentMethod?: string;
    paymentLink?: string | null;
    orderId?: string;
    createdAtLabel?: string;
  },
) {
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
                <td style="padding:8px 10px; border:1px solid #e5e7eb; word-break:break-word;">${idx + 1}</td>
                <td style="padding:8px 10px; border:1px solid #e5e7eb; word-break:break-word;">
                  <div style="font-weight:600;">${escapeHtml(s.name)}</div>
                  ${s.description ? `<div style="color:#555; font-size:12px; margin-top:2px;">${escapeHtml(s.description)}</div>` : ""}
                </td>
                <td style="padding:8px 10px; border:1px solid #e5e7eb; text-align:right; word-break:break-word;">${qty}</td>
                <td style="padding:8px 10px; border:1px solid #e5e7eb; text-align:right; word-break:break-word;">${s.price.toLocaleString("ru-RU")} ₽</td>
                <td style="padding:8px 10px; border:1px solid #e5e7eb; text-align:right; word-break:break-word;">${sum.toLocaleString("ru-RU")} ₽</td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="5" style="padding:10px; border:1px solid #e5e7eb; text-align:center;">
            Перечень услуг не заполнен
          </td>
        </tr>
      `
    : "";

  const servicesTableHtml = showServicesTable
    ? `
    <h3 style="font-size:15px; margin:14px 0 8px; font-weight:700; color:#111;">Перечень услуг и стоимость</h3>

    <table style="border-collapse:collapse; width:100%; font-size:13px; margin:0 0 14px; table-layout:fixed;">
      <thead>
        <tr>
          <th style="padding:8px 10px; border:1px solid #e5e7eb; text-align:left; width:36px;">№</th>
          <th style="padding:8px 10px; border:1px solid #e5e7eb; text-align:left;">Услуга</th>
          <th style="padding:8px 10px; border:1px solid #e5e7eb; text-align:right; width:72px;">Кол-во</th>
          <th style="padding:8px 10px; border:1px solid #e5e7eb; text-align:right; width:90px;">Цена</th>
          <th style="padding:8px 10px; border:1px solid #e5e7eb; text-align:right; width:90px;">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${servicesRows}
        <tr>
          <td colspan="4" style="padding:10px; border:1px solid #e5e7eb; text-align:right; font-weight:700;">Итого:</td>
          <td style="padding:10px; border:1px solid #e5e7eb; text-align:right; font-weight:700;">
            ${totalRub.toLocaleString("ru-RU")} ₽
          </td>
        </tr>
      </tbody>
    </table>
    `
    : "";

  const notes = body.notes ?? body.formData?.specialRequests;
  const paymentMethodLabel = options?.paymentMethodLabel;
  const paymentMethod = options?.paymentMethod;
  const paymentLink = options?.paymentLink;
  const orderId = options?.orderId ?? "";
  const createdAtLabel = options?.createdAtLabel ?? new Date().toLocaleDateString("ru-RU");
  const summaryBlock = orderSummaryHtml
    ? orderSummaryHtml
    : `<div style="font-size:14px;line-height:1.7;color:#374151;">Данные заказа не заполнены.</div>`;

  const paymentText =
    paymentMethod === "call_rep"
      ? "Наш представитель свяжется с вами для уточнения деталей оплаты."
      : paymentLink
        ? `Ссылка на оплату: <a href="${escapeHtml(paymentLink)}" target="_blank" rel="noreferrer">${escapeHtml(
            paymentLink,
          )}</a>`
        : "Ссылка на оплату будет направлена отдельным письмом.";

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
              <td style="padding:0 18px 24px 18px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;">
                  <tr>
                    <td style="padding:20px 22px 10px 22px;">
                      <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">
                        Тихий дом
                      </div>
                      <div style="margin-top:10px;font-size:26px;line-height:1.2;font-weight:700;color:#111;">
                        Примите наши соболезнования.
                      </div>
                      <div style="margin-top:10px;font-size:15px;line-height:1.6;color:#374151;">
                        Мы получили вашу заявку и зафиксировали выбранные услуги и стоимость. Ниже — договор-оферта, детали заказа и итоговая сумма.
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 22px 10px 22px;">
                      <div style="height:1px;background:#e5e7eb;"></div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 22px 14px 22px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-size:12px;color:#6b7280;">Номер заявки</td>
                          <td align="right" style="font-size:12px;color:#6b7280;">Дата</td>
                        </tr>
                        <tr>
                          <td style="font-size:16px;font-weight:700;color:#111;">№ ${escapeHtml(orderId)}</td>
                          <td align="right" style="font-size:14px;color:#111;">${escapeHtml(createdAtLabel)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 22px 10px 22px;">
                      <div style="height:1px;background:#e5e7eb;"></div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 22px 14px 22px;">
                      <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:8px;">Что будет дальше</div>
                      <ol style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.7;">
                        <li>Мы проверим детали заявки и при необходимости уточним важные моменты.</li>
                        <li>Если вы выбрали оплату по защищённой ссылке — отправим ссылку отдельным письмом.</li>
                        <li>После подтверждения — передадим заказ партнёрам и будем держать в курсе статуса.</li>
                      </ol>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 22px 10px 22px;">
                      <div style="height:1px;background:#e5e7eb;"></div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 22px 14px 22px;">
                      <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:8px;">Состав заказа</div>
                      <div style="font-size:14px;line-height:1.7;color:#374151;">
                        ${summaryBlock}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 22px 10px 22px;">
                      <div style="height:1px;background:#e5e7eb;"></div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 22px 14px 22px;">
                      ${servicesTableHtml}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 22px 10px 22px;">
                      <div style="height:1px;background:#e5e7eb;"></div>
                    </td>
                  </tr>

                  ${
                    paymentMethodLabel
                      ? `
                  <tr>
                    <td style="padding:0 22px 14px 22px;">
                      <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:8px;">Оплата</div>
                      <div style="font-size:14px;line-height:1.7;color:#374151;">
                        Способ оплаты: <b>${escapeHtml(paymentMethodLabel)}</b><br/>
                        ${paymentText}
                      </div>
                      <div style="margin-top:12px;padding:12px;border-radius:12px;background:#f3f4f6;border:1px solid #e5e7eb;">
                        <div style="font-size:13px;line-height:1.7;color:#111;">
                          Важно: мы никогда не просим номер карты и CVC. Оплата проводится только на защищённой странице банка/провайдера.
                          Если есть сомнения — напишите на <a href="mailto:info@tihiydom.com" style="color:#111;text-decoration:underline;">info@tihiydom.com</a>.
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 22px 10px 22px;">
                      <div style="height:1px;background:#e5e7eb;"></div>
                    </td>
                  </tr>
                  `
                      : ""
                  }

                  ${
                    notes
                      ? `
                  <tr>
                    <td style="padding:0 22px 14px 22px;">
                      <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:6px;">Дополнительные пожелания</div>
                      <div style="font-size:14px;line-height:1.7;color:#374151;">${escapeHtml(String(notes))}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 22px 10px 22px;">
                      <div style="height:1px;background:#e5e7eb;"></div>
                    </td>
                  </tr>
                  `
                      : ""
                  }

                  <tr>
                    <td style="padding:0 22px 18px 22px;color:#6b7280;font-size:12px;line-height:1.6;">
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
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!z.string().email().max(254).safeParse(email).success) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        user: {
          email,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      select: {
        publicId: true,
        createdAt: true,
        status: true,
        totalAmount: true,
        serviceType: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        orders: orders.map((order) => ({
          id: order.publicId,
          createdAt: order.createdAt,
          status: order.status,
          totalAmount: order.totalAmount / 100,
          serviceType: order.serviceType.toUpperCase(),
          user: order.user,
        })),
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  } catch (error: unknown) {
    console.error("orders_list_failed", { error: errorMessage(error) });
    return NextResponse.json({ error: "Не удалось загрузить заказы" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_ORDER_BODY_BYTES) {
      return NextResponse.json({ error: "Заказ слишком большой" }, { status: 413 });
    }

    let input: unknown;
    try {
      input = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
    }

    const parsed = OrderPayloadSchema.safeParse(input);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Некорректные данные заказа",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    const body = parsed.data;

    const customerEmail = String(body.customer?.email ?? body.userEmail ?? "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
    if (!emailOk) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    const services = normalizeServices(body);
    const submittedTotal = toNumber(body.total);
    const servicesTotal = services.reduce(
      (sum, service) => sum + service.price * (service.quantity ?? 1),
      0,
    );
    if (
      submittedTotal !== null &&
      submittedTotal > 0 &&
      servicesTotal > 0 &&
      Math.abs(submittedTotal - servicesTotal) >= 1
    ) {
      return NextResponse.json(
        { error: "Итоговая сумма не совпадает с составом заказа" },
        { status: 400 },
      );
    }

    const totalRub = computeTotalRub(body, services);
    if (totalRub <= 0 || totalRub > MAX_ORDER_TOTAL_RUB) {
      return NextResponse.json({ error: "Некорректная итоговая сумма" }, { status: 400 });
    }
    const totalAmount = Math.round(totalRub * 100);

    const publicId = "order_" + crypto.randomBytes(6).toString("hex");
    const paymentMethodRaw = String(body.paymentMethod ?? body.formData?.paymentMethod ?? "").trim();
    const paymentMethod =
      paymentMethodRaw === "deposit_10" || paymentMethodRaw === "call_rep"
        ? paymentMethodRaw
        : undefined;
    const paymentMethodLabel =
      paymentMethod === "deposit_10"
        ? "Депозит 10%"
        : paymentMethod === "call_rep"
          ? "Мне нужна консультация"
          : undefined;
    const paymentLink =
      paymentMethod === "deposit_10"
        ? process.env.PAYMENT_LINK_CARD || null
        : paymentMethod === "call_rep"
          ? null
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

    const orderSummaryHtml = summary.htmlFragment || "";

    const createdAtLabel = createdOrder?.createdAt
      ? new Date(createdOrder.createdAt).toLocaleDateString("ru-RU")
      : new Date().toLocaleDateString("ru-RU");

    let html = buildEmailHtml(bodyForEmail, services, totalRub, {
      orderSummaryHtml,
      showServicesTable: true,
      paymentMethodLabel,
      paymentMethod,
      paymentLink,
      orderId: publicId,
      createdAtLabel,
    });

    const notes = bodyForEmail.notes ?? bodyForEmail.formData?.specialRequests;
    const servicesTextLines = services.length
      ? services.map((service, index) => {
          const qty = service.quantity ?? 1;
          const sum = service.price * qty;
          return `${index + 1}. ${service.name} ×${qty} — ${sum.toLocaleString("ru-RU")} ₽`;
        })
      : ["Перечень услуг не заполнен"];

    const textParts: string[] = [
      "Договор-оферта и детали заказа",
      `Номер заявки: № ${publicId}`,
      `Дата: ${createdAtLabel}`,
      "",
      "Что будет дальше",
      "1. Мы проверим детали заявки и при необходимости уточним важные моменты.",
      "2. Если вы выбрали оплату по защищённой ссылке — отправим ссылку отдельным письмом.",
      "3. После подтверждения — передадим заказ партнёрам и будем держать в курсе статуса.",
      "",
      "Состав заказа",
      summary.plainText || "Данные не заполнены",
      "",
      "Перечень услуг и стоимость",
      ...servicesTextLines,
      `Итого: ${totalRub.toLocaleString("ru-RU")} ₽`,
    ];
    if (paymentMethodLabel) {
      textParts.push("", "Оплата", `Способ оплаты: ${paymentMethodLabel}`);
      if (paymentMethod === "call_rep") {
        textParts.push("Наш представитель свяжется с вами для уточнения деталей оплаты.");
      } else if (paymentLink) {
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

    // Attach the same public offer that is linked in the footer.
    const offerHref = PUBLIC_OFFER_HREF;
    let offerUrl = buildOfferUrl(offerHref);
    let offerAttachment:
      | {
          filename: string;
          content: string;
        }
      | undefined;

    try {
      const offer = await loadPublicOfferAttachment(offerHref);
      offerUrl = offer.offerUrl;
      offerAttachment = {
        filename: offer.filename,
        content: offer.buffer.toString("base64"),
      };
    } catch (error: unknown) {
      console.warn("offer_attachment_failed", {
        orderId: publicId,
        error: errorMessage(error),
      });
      textParts.push("", `Публичная оферта: ${offerUrl}`);
      const offerHtmlLink = `
        <p style="margin:12px 22px 0 22px;font-size:12px;line-height:1.6;color:#6b7280;">
          Публичная оферта:
          <a href="${escapeHtml(offerUrl)}" style="color:#6b7280;text-decoration:underline;">
            ${escapeHtml(offerUrl)}
          </a>
        </p>
      `;
      html = html.replace("</body>", `${offerHtmlLink}</body>`);
    }

    const text = textParts.join("\n");

    let emailSent = false;
    try {
      await sendOrderEmail({
        to: customerEmail,
        subject: "Договор, детали заказа и оплата",
        html,
        text,
        orderId: publicId,
        attachments: offerAttachment ? [offerAttachment] : undefined,
      });
      emailSent = true;
      console.info("email_sent_success", { orderId: publicId });
    } catch (error: unknown) {
      console.error("email_sent_failed", { orderId: publicId, error: errorMessage(error) });
    }

    return NextResponse.json(
      {
        ok: true,
        success: true,
        orderId: publicId, // фронт ждёт строку
        totalAmount,
        totalRub,
        emailSent,
        ...(emailSent
          ? {}
          : { warning: "Заявка сохранена, но письмо пока не отправлено" }),
        paymentLink,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("ORDER API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage(error) },
      { status: 500 }
    );
  }
}
