const filenameEncoder = new TextEncoder();
export function safeName(name) {
  const value = String(name)
    .replace(/[\uD800-\uDFFF]/gu, '_')
    .normalize('NFC')
    .replace(/[<>:"/\\|?*\x00-\x1f\x7f]/g, '_')
    .replace(/[ .]+$/g, '');
  const extension = value.match(/\.[a-z0-9]{1,12}$/i)?.[0] || '';
  const stem = extension ? value.slice(0, -extension.length) : value;
  let result = '',
    bytes = filenameEncoder.encode(extension).length;
  for (const character of stem) {
    const size = filenameEncoder.encode(character).length;
    if (bytes + size > 198 || [...result].length >= 148) break;
    result += character;
    bytes += size;
  }
  result = result.replace(/[ .]+$/g, '') || 'file';
  if (/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(result))
    result = '_' + result;
  return result + extension;
}

export function inferKind(name) {
  const extension = name.split('.').pop().toLowerCase();
  if (
    [
      'step',
      'stp',
      'stl',
      'iges',
      'igs',
      'obj',
      '3mf',
      'f3d',
      'sldprt',
      'sldasm',
    ].includes(extension)
  )
    return 'model';
  if (['dxf', 'dwg', 'svg'].includes(extension)) return 'drawing';
  if (['sch', 'kicad_sch'].includes(extension)) return 'schematic';
  if (['md', 'txt'].includes(extension)) return 'instructions';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) return 'image';
  if (extension === 'pdf') return 'drawing';
  return 'other';
}
