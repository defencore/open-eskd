import { equal } from './objects.js';

export function diff(a, b) {
  const result = [];
  for (const kind of ['components', 'documents']) {
    const left = new Map(a[kind].map((x) => [x.id, x]));
    const right = new Map(b[kind].map((x) => [x.id, x]));
    for (const id of new Set([...left.keys(), ...right.keys()])) {
      const before = left.get(id),
        after = right.get(id);
      if (!equal(before, after))
        result.push({
          kind,
          id,
          action: !before ? 'added' : !after ? 'removed' : 'changed',
          before,
          after,
          fields:
            before && after
              ? [
                  ...new Set([...Object.keys(before), ...Object.keys(after)]),
                ].filter((k) => !equal(before[k], after[k]))
              : [],
        });
    }
  }
  if (!equal(a.meta, b.meta))
    result.push({
      kind: 'meta',
      action: 'changed',
      before: a.meta,
      after: b.meta,
      fields: [
        ...new Set([...Object.keys(a.meta), ...Object.keys(b.meta)]),
      ].filter((k) => !equal(a.meta[k], b.meta[k])),
    });
  return result;
}
