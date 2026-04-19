import test from "node:test";
import assert from "node:assert/strict";

import {
  ADDITIONAL_SERVICES,
  calcTariffTotal,
  calculateTotal,
  type FormData as CalculatorFormData,
  // @ts-expect-error Node test runtime resolves explicit .ts ESM imports.
} from "../app/components/calculationUtils.ts";
// @ts-expect-error Node test runtime resolves explicit .ts ESM imports.
import { calcPayNowKopeks, calcPayNowRub } from "../lib/pricingMath.ts";

test("pay-plan math: full/deposit/split is deterministic", () => {
  assert.equal(calcPayNowRub(100_000, "full"), 100_000);
  assert.equal(calcPayNowRub(100_000, "deposit"), 5_000);
  assert.equal(calcPayNowRub(100_000, "split"), 25_000);

  assert.equal(calcPayNowKopeks(10_000_000, "full"), 10_000_000);
  assert.equal(calcPayNowKopeks(10_000_000, "deposit"), 500_000);
  assert.equal(calcPayNowKopeks(10_000_000, "split"), 2_500_000);
});

test("traditional tariff: add/remove option returns correct total", () => {
  const baseConfig = {
    format: "burial",
    transport: "none",
    pallbearers: "none",
    hall: "none",
    hearseTier: "standard",
    coordinationTier: "base",
    ceremonyType: "secular",
    churchService: "none",
    panikhida: "none",
    memorialMeal: "none",
    host: "no",
  } as const;

  const baseTotal = calcTariffTotal(baseConfig).total;
  const withPallbearers = calcTariffTotal({
    ...baseConfig,
    pallbearers: "standard",
  }).total;
  const removedAgain = calcTariffTotal({
    ...baseConfig,
    pallbearers: "none",
  }).total;

  assert.equal(baseTotal, 86_600);
  assert.equal(withPallbearers, 94_600);
  assert.equal(withPallbearers - baseTotal, 8_000);
  assert.equal(removedAgain, baseTotal);
});

test("ready package total matches package price without hidden additions", () => {
  const formData: CalculatorFormData = {
    serviceType: "burial",
    hasHall: false,
    hallDuration: 0,
    ceremonyType: "civil",
    packageType: "basic",
    needsHearse: false,
    needsFamilyTransport: false,
    familyTransportSeats: 0,
    needsPallbearers: false,
    selectedAdditionalServices: [],
    cemetery: "",
  };

  const total = calculateTotal(formData);
  assert.equal(total, 204_900);
});

test("custom flow additional service affects total exactly once", () => {
  const sampleService = ADDITIONAL_SERVICES[0];
  assert.ok(sampleService, "Expected at least one additional service");

  const baseData: CalculatorFormData = {
    serviceType: "burial",
    hasHall: false,
    hallDuration: 0,
    ceremonyType: "civil",
    packageType: "custom",
    needsHearse: false,
    needsFamilyTransport: false,
    familyTransportSeats: 0,
    needsPallbearers: false,
    selectedAdditionalServices: [],
    cemetery: "",
  };

  const withoutAdditions = calculateTotal(baseData);
  const withOneAddition = calculateTotal({
    ...baseData,
    selectedAdditionalServices: [sampleService.id],
  });

  assert.equal(withOneAddition - withoutAdditions, sampleService.price);
});
