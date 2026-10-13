export function nextDesignation(snapshot, parentId) {
  const parent = snapshot.components.find((c) => c.id === parentId);
  const base = parent?.designation || snapshot.meta.designation || 'PRJ';
  const used = new Set(
    snapshot.components.map((c) => c.designation.trim().toLowerCase()),
  );
  const match = base.match(/^(.*\.)(\d+)$/);
  for (let index = 1; index <= 10001; index++) {
    const value = match
      ? match[1] +
        String(BigInt(match[2]) + BigInt(index)).padStart(match[2].length, '0')
      : `${base}-${String(index).padStart(2, '0')}`;
    if (!used.has(value.toLowerCase())) return value;
  }
  throw new Error('No unused designation is available.');
}
