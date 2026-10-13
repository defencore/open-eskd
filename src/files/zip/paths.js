export function safePath(path) {
  if (typeof path !== 'string' || /[\uD800-\uDFFF]/u.test(path))
    throw new Error('Unsafe archive path.');
  const value = path.replace(/\\/g, '/');
  if (
    !value ||
    value.startsWith('/') ||
    /^[A-Za-z]:/.test(value) ||
    value
      .split('/')
      .some(
        (p, index, parts) =>
          p === '..' || p === '.' || (!p && index !== parts.length - 1),
      ) ||
    /[\x00-\x1f\x7f]/.test(value)
  )
    throw new Error('Unsafe archive path.');
  return value;
}
