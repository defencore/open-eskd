export class ValidationError extends Error {
  constructor(message, code = 'validation') {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
  }
}
export const assert = (condition, message, code) => {
  if (!condition) throw new ValidationError(message, code);
};
export const text = (value, length = 10000) =>
  typeof value === 'string' &&
  value.length <= length * 2 &&
  !/[\uD800-\uDFFF]/u.test(value) &&
  (value.length <= length || [...value].length <= length);
export const validKeys = (object, allowed) =>
  object &&
  typeof object === 'object' &&
  !Array.isArray(object) &&
  Object.keys(object).every((key) => allowed.includes(key));
export const keys = (object, allowed) =>
  assert(validKeys(object, allowed), 'Unknown or unsafe schema field.');
export const validId = (value) =>
  text(value, 100) &&
  value.length > 0 &&
  !/[\s\x00-\x1f\x7f]/u.test(value) &&
  !['__proto__', 'constructor', 'prototype'].includes(value);
export const validHash = (value) =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export function validDate(value) {
  if (
    !text(value, 30) ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) ||
    !Number.isFinite(Date.parse(value))
  )
    return false;
  const normalized = value.includes('.')
    ? value.replace(
        /\.(\d+)Z$/,
        (_, fraction) => '.' + fraction.padEnd(3, '0') + 'Z',
      )
    : value.replace('Z', '.000Z');
  return new Date(value).toISOString() === normalized;
}
