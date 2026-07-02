export const MAIN_DRAFT_KEY = "funeral-workflow-draft";
export const SIMPLIFIED_DRAFT_KEY = "TIHIYDOM_SIMPLIFIED_FORM_V1";

export type SafeStoredDraft = {
  formData: Record<string, unknown>;
  savedAt: string;
};

const SAFE_DRAFT_FIELDS = [
  "serviceType",
  "hasHall",
  "hallDuration",
  "needsHearse",
  "hearseCategory",
  "hearseRoute",
  "needsFamilyTransport",
  "familyTransportSeats",
  "needsPallbearers",
  "packageType",
  "selectedAdditionalServices",
  "liningColor",
  "coffinConfig",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function sanitizeDraftFormData(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) return {};

  return Object.fromEntries(
    SAFE_DRAFT_FIELDS.flatMap((field) =>
      Object.prototype.hasOwnProperty.call(input, field) ? [[field, input[field]]] : [],
    ),
  );
}

export function loadSessionDraft(key: string): SafeStoredDraft | null {
  if (typeof window === "undefined") return null;

  // Remove legacy persistent drafts. They may contain names, dates and document data.
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw || raw.length > 100_000) {
      if (raw) window.sessionStorage.removeItem(key);
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const formData = sanitizeDraftFormData(parsed.formData ?? parsed);
    const savedAt =
      typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString();
    return { formData, savedAt };
  } catch {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore cleanup failures.
    }
    return null;
  }
}

export function saveSessionDraft(key: string, formData: unknown) {
  if (typeof window === "undefined") return;

  const draft: SafeStoredDraft = {
    formData: sanitizeDraftFormData(formData),
    savedAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(draft);
  if (serialized.length > 100_000) return;

  try {
    window.sessionStorage.setItem(key, serialized);
  } catch {
    // Draft persistence is optional. Main workflow must remain usable.
  }
}
