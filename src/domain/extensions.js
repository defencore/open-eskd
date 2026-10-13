import { assert, text } from './constraints.js';

export const EXTENSION_NAMESPACE = /^(?:[a-z][a-z0-9-]*\.)+[a-z][a-z0-9-]*$/;
export function validateExtensions(value) {
  if (value === undefined) return;
  assert(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      (Object.getPrototypeOf(value) === Object.prototype ||
        Object.getPrototypeOf(value) === null) &&
      Object.keys(value).length <= 16,
    'Invalid extension namespace map.',
  );
  function json(item, depth = 0) {
    assert(depth <= 16, 'Extension nesting exceeds the supported limit.');
    if (item === null || typeof item === 'boolean') return;
    if (typeof item === 'number') {
      assert(Number.isFinite(item), 'Extensions require finite JSON numbers.');
      return;
    }
    if (typeof item === 'string') {
      assert(text(item, 65536), 'Invalid extension text.');
      return;
    }
    assert(
      item &&
        typeof item === 'object' &&
        (Array.isArray(item) ||
          Object.getPrototypeOf(item) === Object.prototype ||
          Object.getPrototypeOf(item) === null),
      'Extensions must contain JSON values.',
    );
    if (Array.isArray(item))
      assert(
        Object.keys(item).length === item.length &&
          Object.keys(item).every((key, index) => key === String(index)),
        'Extensions require dense JSON arrays.',
      );
    for (const key of Object.keys(item)) {
      assert(
        text(key, 65536) &&
          !['__proto__', 'prototype', 'constructor'].includes(key),
        'Unsafe extension property.',
      );
      json(item[key], depth + 1);
    }
  }
  for (const [namespace, payload] of Object.entries(value)) {
    assert(
      EXTENSION_NAMESPACE.test(namespace) && namespace.length <= 120,
      'Use a reverse-DNS extension namespace.',
    );
    json(payload);
  }
  assert(
    new TextEncoder().encode(JSON.stringify(value)).length <= 65536,
    'Extension payload exceeds 64 KiB.',
  );
}
