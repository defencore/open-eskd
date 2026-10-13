export const clone = (value) => structuredClone(value);

export function equal(a, b) {
  if (a === b) return true;
  if (
    !a ||
    !b ||
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    Array.isArray(a) !== Array.isArray(b)
  )
    return false;
  const left = Object.keys(a).sort(),
    right = Object.keys(b).sort();
  return (
    left.length === right.length &&
    left.every((key, i) => key === right[i] && equal(a[key], b[key]))
  );
}

export const uid = () => crypto.randomUUID();

export const now = () => new Date().toISOString();

export const own = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);
