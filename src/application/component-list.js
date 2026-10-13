import * as C from '../domain/index.js';

export function splitRow(line, separator) {
  const fields = [];
  let value = '',
    quoted = false;
  for (let i = 0; i < line.length; i++) {
    const character = line[i];
    if (character === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (character === separator && !quoted) {
      fields.push(value.trim());
      value = '';
    } else value += character;
  }
  if (quoted) return null;
  fields.push(value.trim());
  return fields;
}

export function parseList(input, snapshot) {
  const rows = [],
    errors = [];
  const used = new Set(
    snapshot.components.map((c) => c.designation.trim().toLowerCase()),
  );
  const lines = input.replace(/^\ufeff/, '').split(/\r?\n/);
  const separator = lines.some((line) => line.includes('\t')) ? '\t' : ';';
  for (let index = 0; index < lines.length; index++) {
    if (!lines[index].trim()) continue;
    const fields = splitRow(lines[index], separator);
    const line = index + 1;
    if (!fields || fields.length < 2 || fields.length > 3) {
      errors.push({ line, code: 'columns' });
      continue;
    }
    const [designation, name, quantityText = '1'] = fields;
    if (
      !rows.length &&
      ['designation', 'позначення'].includes(designation.toLowerCase()) &&
      ['name', 'назва'].includes(name.toLowerCase())
    )
      continue;
    const quantity = Number((quantityText || '1').replace(',', '.'));
    if (
      !designation ||
      !C.text(designation, 200) ||
      !name ||
      !C.text(name, 200)
    ) {
      errors.push({ line, code: 'required' });
      continue;
    }
    if (used.has(designation.toLowerCase())) {
      errors.push({ line, code: 'duplicate', value: designation });
      continue;
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1000000) {
      errors.push({ line, code: 'quantity' });
      continue;
    }
    used.add(designation.toLowerCase());
    rows.push({ designation, name, quantity });
  }
  if (snapshot.components.length + rows.length > 10000)
    errors.push({ line: 0, code: 'limit' });
  return { rows, errors };
}

export function addList(project, input, parentId, type, owner) {
  const candidate = C.clone(project),
    snapshot = C.working(candidate);
  C.assertEditable(snapshot, parentId);
  const result = parseList(input, snapshot);
  if (result.errors.length || !result.rows.length)
    throw new Error('Fix the component list before adding it.');
  snapshot.components.push(
    ...result.rows.map((row) =>
      C.component({
        ...row,
        id: C.uid(),
        parentId: parentId || null,
        type,
        owner: owner || '',
        unit: 'pcs',
        revision: 'A',
        status: 'draft',
        material: '',
        manufacturer: '',
        process: '',
        notes: '',
        provenance: C.provenance(
          snapshot.meta.workflow === 'decomposition' ? 'observed' : 'designed',
        ),
      }),
    ),
  );
  C.validateSnapshot(snapshot, candidate.catalog);
  return candidate;
}
