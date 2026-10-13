export function childIndex(snapshot) {
  const children = new Map();
  for (const component of snapshot.components) {
    if (!children.has(component.parentId)) children.set(component.parentId, []);
    children.get(component.parentId).push(component);
  }
  return children;
}
export function descendants(snapshot, id) {
  const children = childIndex(snapshot),
    result = new Set(),
    queue = [id];
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    if (result.has(current)) continue;
    result.add(current);
    for (const component of children.get(current) || [])
      queue.push(component.id);
  }
  return result;
}
export function flatten(snapshot) {
  const children = childIndex(snapshot),
    rows = [];
  function walk(parentId, depth, factor) {
    for (const component of children.get(parentId) || []) {
      const totalQuantity = factor * component.quantity;
      rows.push({ ...component, depth, totalQuantity });
      walk(component.id, depth + 1, totalQuantity);
    }
  }
  walk(null, 0, 1);
  return rows;
}
