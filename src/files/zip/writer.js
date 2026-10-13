import { encoder, concat } from './binary.js';
import { crc32 } from './crc.js';
import { MAX_SIZE, entryLimit, limitError } from './limits.js';
import { safePath } from './paths.js';

export function create(entries) {
  if (entries.length > 5000) throw new Error('Too many archive entries.');
  const names = new Set();
  let archiveSize = 22;
  const prepared = entries.map((entry) => {
    const path = safePath(entry.name),
      name = encoder.encode(path);
    if (name.length > 65535) throw new Error('Archive path is too long.');
    if (names.has(path)) throw new Error('Duplicate archive path.');
    names.add(path);
    const data =
      typeof entry.data === 'string' ? encoder.encode(entry.data) : entry.data;
    if (!(data instanceof Uint8Array))
      throw new Error('ZIP entries require text or byte arrays.');
    archiveSize += 76 + name.length * 2 + data.length;
    if (data.length > entryLimit(path) || archiveSize > MAX_SIZE)
      throw limitError();
    return { name, data };
  });
  const local = [],
    central = [];
  let offset = 0;
  for (const { name, data } of prepared) {
    const crc = crc32(data);
    const header = new Uint8Array(30 + name.length),
      view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x800, true);
    view.setUint16(12, 0x21, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, name.length, true);
    header.set(name, 30);
    local.push(header, data);
    const record = new Uint8Array(46 + name.length),
      recordView = new DataView(record.buffer);
    recordView.setUint32(0, 0x02014b50, true);
    recordView.setUint16(4, 20, true);
    recordView.setUint16(6, 20, true);
    recordView.setUint16(8, 0x800, true);
    recordView.setUint16(14, 0x21, true);
    recordView.setUint32(16, crc, true);
    recordView.setUint32(20, data.length, true);
    recordView.setUint32(24, data.length, true);
    recordView.setUint16(28, name.length, true);
    recordView.setUint32(42, offset, true);
    record.set(name, 46);
    central.push(record);
    offset += header.length + data.length;
  }
  const directory = concat(central);
  const end = new Uint8Array(22),
    view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, entries.length, true);
  view.setUint16(10, entries.length, true);
  view.setUint32(12, directory.length, true);
  view.setUint32(16, offset, true);
  return new Blob([...local, directory, end], { type: 'application/zip' });
}
