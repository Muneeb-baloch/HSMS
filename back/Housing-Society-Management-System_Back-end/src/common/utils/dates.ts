import { AppError } from '../../middleware/error.middleware';

/**
 * Coerces a value that arrived over HTTP/JSON (always a string, never a real
 * Date - every DTO's `Date` type is a TS-only lie) into a real Date,
 * throwing a clean 400 instead of either crashing later (calling a Date
 * method directly on the raw string) or silently persisting an Invalid Date.
 *
 * Use this at the top of any service function that receives a date field
 * from a controller/DTO, before the value is read with a Date method or
 * written to a Mongoose field.
 */
export function toDate(value: unknown, fieldName = 'date'): Date {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new AppError(400, `Invalid ${fieldName}`);
    }
    return value;
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new AppError(400, `${fieldName} is required`);
  }

  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    throw new AppError(400, `Invalid ${fieldName}: "${value}"`);
  }

  return parsed;
}
