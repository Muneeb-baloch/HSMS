import { Decimal } from 'decimal.js';
import { Types } from 'mongoose';

/**
 * Canonical area units supported across Project -> PlotBlock -> Plot.
 * All areas are stored internally in square feet (base unit) as Decimal128
 * for exact arithmetic; these are only the user-facing display units.
 */
export type AreaUnit = 'marla' | 'kanal' | 'acre' | 'hectare' | 'sqyd' | 'sqft';

export const AREA_UNITS: AreaUnit[] = ['marla', 'kanal', 'acre', 'hectare', 'sqyd', 'sqft'];

// 1 <unit> = X sqft. Marla/Kanal use the Pakistani standard (1 Marla = 225 sqft),
// matching the values already used by this codebase's own seed data.
const TO_SQFT: Record<AreaUnit, string> = {
  sqft: '1',
  sqyd: '9', // 1 square yard / Gaz
  marla: '225',
  kanal: '4500', // 20 Marla
  acre: '43560',
  hectare: '107639.1041671',
};

// Legacy unit strings that existed in the DB before this unit set was standardized.
const LEGACY_UNIT_ALIASES: Record<string, AreaUnit> = {
  acres: 'acre',
  hectares: 'hectare',
};

export function isAreaUnit(value: unknown): value is AreaUnit {
  return typeof value === 'string' && (AREA_UNITS as string[]).includes(value);
}

/**
 * Normalizes a possibly-legacy unit string (e.g. plural 'acres'/'hectares' from
 * before this unit set was standardized) to a canonical AreaUnit.
 * Throws if the unit has no known mapping (e.g. 'sqm', 'km²') - these require
 * manual review since the user's required unit set doesn't include them.
 */
export function normalizeAreaUnit(unit: string): AreaUnit {
  if (isAreaUnit(unit)) return unit;
  const alias = LEGACY_UNIT_ALIASES[unit];
  if (alias) return alias;
  throw new Error(`Unsupported/legacy area unit "${unit}" - needs manual conversion`);
}

function factorFor(unit: AreaUnit): string {
  const factor = TO_SQFT[unit];
  if (!factor) {
    throw new Error(`Unsupported area unit: ${unit}`);
  }
  return factor;
}

export function decimalToString(d: Types.Decimal128 | string | number | undefined | null): string {
  if (d === undefined || d === null) return '0';
  return typeof d === 'object' ? d.toString() : String(d);
}

/** Converts a display value + unit into canonical base sqft, stored as Decimal128. */
export function toBaseSqft(value: number | string, unit: AreaUnit): Types.Decimal128 {
  const result = new Decimal(value).times(factorFor(unit));
  return Types.Decimal128.fromString(result.toFixed(6));
}

/** Converts a base sqft Decimal128 value back into a display unit, as a plain number. */
export function fromBaseSqft(
  base: Types.Decimal128 | string | number,
  unit: AreaUnit,
  precision = 4
): number {
  const result = new Decimal(decimalToString(base)).dividedBy(factorFor(unit));
  return result.toDecimalPlaces(precision).toNumber();
}

export function addBase(
  a: Types.Decimal128 | string | number,
  b: Types.Decimal128 | string | number
): Types.Decimal128 {
  const result = new Decimal(decimalToString(a)).plus(decimalToString(b));
  return Types.Decimal128.fromString(result.toFixed(6));
}

export function subtractBase(
  a: Types.Decimal128 | string | number,
  b: Types.Decimal128 | string | number
): Types.Decimal128 {
  const result = new Decimal(decimalToString(a)).minus(decimalToString(b));
  return Types.Decimal128.fromString(result.toFixed(6));
}

export function negateBase(a: Types.Decimal128 | string | number): Types.Decimal128 {
  const result = new Decimal(0).minus(decimalToString(a));
  return Types.Decimal128.fromString(result.toFixed(6));
}

export function compareBase(
  a: Types.Decimal128 | string | number,
  b: Types.Decimal128 | string | number
): number {
  return new Decimal(decimalToString(a)).comparedTo(decimalToString(b));
}

export function isZeroBase(a: Types.Decimal128 | string | number): boolean {
  return new Decimal(decimalToString(a)).isZero();
}

export const ZERO_BASE = Types.Decimal128.fromString('0');
