import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node test runtime resolves explicit .ts ESM imports.
import { sanitizeDraftFormData } from "../lib/draftStorage.ts";

test("draft sanitizer removes personal and payment data", () => {
  const sanitized = sanitizeDraftFormData({
    serviceType: "burial",
    packageType: "standard",
    fullName: "Иван Иванов",
    birthDate: "1950-01-01",
    deathDate: "2026-07-01",
    deathCertificate: "secret",
    clientEmail: "person@example.com",
    userEmail: "person@example.com",
    paymentPlan: "full",
    specialRequests: "private note",
  });

  assert.deepEqual(sanitized, {
    serviceType: "burial",
    packageType: "standard",
  });
});

test("draft sanitizer keeps non-identifying configuration", () => {
  const sanitized = sanitizeDraftFormData({
    hasHall: true,
    hallDuration: 60,
    needsHearse: true,
    hearseCategory: "comfort",
    selectedAdditionalServices: ["flowers"],
    hearseRoute: { morgue: true, cemetery: true },
  });

  assert.deepEqual(sanitized, {
    hasHall: true,
    hallDuration: 60,
    needsHearse: true,
    hearseCategory: "comfort",
    selectedAdditionalServices: ["flowers"],
    hearseRoute: { morgue: true, cemetery: true },
  });
});
