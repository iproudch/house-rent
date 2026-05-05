import { roundToMaxTwoDecimals } from "./number";

const WATER_VAT_RATE = 0.07;

const WATER_RATE_TIERS = [
  { maxUnits: 10, rate: 10.2 },
  { maxUnits: 20, rate: 16 },
  { maxUnits: 30, rate: 19 },
  { maxUnits: 50, rate: 21.2 },
];

export const calculateWaterBill = (units: number): number => {
  const usage = Math.max(0, units);
  let remainingUnits = usage;
  let previousMaxUnits = 0;
  let subtotal = 0;

  for (const tier of WATER_RATE_TIERS) {
    if (remainingUnits <= 0) break;

    const tierUnits = Math.min(remainingUnits, tier.maxUnits - previousMaxUnits);
    subtotal += tierUnits * tier.rate;
    remainingUnits -= tierUnits;
    previousMaxUnits = tier.maxUnits;
  }

  if (remainingUnits > 0) {
    subtotal += remainingUnits * WATER_RATE_TIERS[WATER_RATE_TIERS.length - 1].rate;
  }

  return roundToMaxTwoDecimals(subtotal * (1 + WATER_VAT_RATE));
};
