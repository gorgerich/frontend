export type PayPlan = "full" | "deposit" | "split";

export const DEPOSIT_RATE = 0.05;
export const SPLIT_PARTS = 4;

export function normalizeRub(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

export function normalizeKopeks(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

export function calcPayNowRub(totalRub: number, plan: PayPlan): number {
  const normalized = normalizeRub(totalRub);
  if (plan === "deposit") return Math.max(0, Math.round(normalized * DEPOSIT_RATE));
  if (plan === "split") return Math.floor(normalized / SPLIT_PARTS);
  return normalized;
}

export function calcPayNowKopeks(totalKopeks: number, plan: PayPlan): number {
  const normalized = normalizeKopeks(totalKopeks);
  if (plan === "deposit") return Math.max(1, Math.round(normalized * DEPOSIT_RATE));
  if (plan === "split") return Math.max(1, Math.round(normalized / SPLIT_PARTS));
  return Math.max(1, normalized);
}

