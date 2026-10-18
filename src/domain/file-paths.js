const pathEncoder = new TextEncoder();
// Portable paths are relative to the directory containing project.json and report.html.
export function validFilePath(path) {
  return (
    typeof path === 'string' &&
    path.length > 0 &&
    path.length <= 800 &&
    !/[\uD800-\uDFFF]/u.test(path) &&
    !/[\\\x00-\x1f\x7f<>:"|?*]/.test(path) &&
    path
      .split('/')
      .every(
        (part) =>
          part &&
          part !== '.' &&
          part !== '..' &&
          part.length <= 120 &&
          pathEncoder.encode(part).length <= 200 &&
          !/[ .]$/.test(part) &&
          !/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(part),
      )
  );
}

export function pathSegment(value) {
  const clean = String(value)
    .replace(/[\uD800-\uDFFF]/gu, '_')
    .normalize('NFC')
    .replace(/[\\/\x00-\x1f\x7f<>:"|?*]/g, '_');
  let result = '',
    bytes = 0,
    count = 0;
  for (const character of clean) {
    const size = pathEncoder.encode(character).length;
    if (count === 80 || bytes + size > 160) break;
    result += character;
    bytes += size;
    count++;
  }
  result = result.replace(/[ .]+$/g, '');
  return validFilePath(result) ? result : '_' + (result || 'item');
}

export function componentDirectory(component) {
  return `components/${pathSegment(component.designation)}/rev-${pathSegment(component.revision || 'unassigned')}`;
}

export function suggestedPath(component, kind = 'drawing') {
  const folder = component ? componentDirectory(component) : 'documents';
  const code = component ? pathSegment(component.designation) : 'project';
  return kind === 'image'
    ? `${folder}/preview.png`
    : `${folder}/${code}_${kind}.${kind === 'model' ? 'step' : kind === 'instructions' ? 'md' : 'pdf'}`;
}

export function fileInventory(snapshot, references = []) {
  const paths = new Map();
  function add(reference, documentId = null) {
    if (!validFilePath(reference.path))
      throw new Error('Invalid relative file path.');
    const key = reference.path.toLowerCase().normalize('NFC');
    const item = paths.get(key);
    if (item) {
      if (
        item.path !== reference.path ||
        (item.sha256 && reference.sha256 && item.sha256 !== reference.sha256)
      )
        throw new Error(
          'File paths conflict on a case-insensitive filesystem: ' +
            reference.path,
        );
      item.sha256 ||= reference.sha256;
      item.required ||= reference.required;
      if (documentId !== null) item.documents.push(documentId);
    } else
      paths.set(key, {
        path: reference.path,
        sha256: reference.sha256,
        required: reference.required,
        documents: documentId === null ? [] : [documentId],
      });
  }
  for (const doc of snapshot.documents) add(doc, doc.id);
  for (const reference of references) add(reference);
  const files = [...paths.values()].sort((a, b) =>
    a.path.localeCompare(b.path),
  );
  const directories = new Set(['documents', 'manufacturing', 'reports']);
  for (const c of snapshot.components) directories.add(componentDirectory(c));
  for (const file of files) {
    const parts = file.path.split('/');
    for (let i = 1; i < parts.length; i++)
      directories.add(parts.slice(0, i).join('/'));
  }
  for (const path of directories) {
    if (paths.has(path.toLowerCase().normalize('NFC')))
      throw new Error('A file path is also a directory: ' + path);
  }
  for (const file of files) {
    if (
      paths.has(
        (file.path + '.eskd-placeholder').toLowerCase().normalize('NFC'),
      ) ||
      file.path.toLowerCase().endsWith('.eskd-placeholder')
    )
      throw new Error(
        'The .eskd-placeholder suffix is reserved for absence markers.',
      );
    if (
      ['project.json', 'report.html', 'verification.json'].includes(
        file.path.split('/')[0].toLowerCase(),
      )
    )
      throw new Error(
        'This filename is reserved for project exchange: ' + file.path,
      );
  }
  return { files, directories: [...directories].sort() };
}

export function relativeFileUrl(path) {
  if (!validFilePath(path)) throw new Error('Invalid relative file path.');
  return './' + path.split('/').map(encodeURIComponent).join('/');
}
