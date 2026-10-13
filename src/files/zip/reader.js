import { concat } from './binary.js';
import { crc32 } from './crc.js';
import { safePath } from './paths.js';
import { MAX_SIZE, entryLimit, limitError } from './limits.js';

export async function read(input, { entryAllowed } = {}) {
  const bytes =
    input instanceof Uint8Array
      ? input
      : new Uint8Array(await input.arrayBuffer());
  if (bytes.length > MAX_SIZE) throw limitError();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (
      view.getUint32(i, true) === 0x06054b50 &&
      i + 22 + view.getUint16(i + 20, true) === bytes.length
    ) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error('Not a valid ZIP archive.');
  if (view.getUint16(end + 4, true) || view.getUint16(end + 6, true))
    throw new Error('Multi-volume ZIP archives are not supported.');
  const count = view.getUint16(end + 10, true);
  let offset = view.getUint32(end + 16, true);
  const directoryStart = offset;
  const directorySize = view.getUint32(end + 12, true);
  if (
    count > 5000 ||
    count === 65535 ||
    view.getUint16(end + 8, true) !== count ||
    offset + directorySize > end
  )
    throw new Error('Invalid or unsupported ZIP directory.');
  const directoryEnd = offset + directorySize;
  const filenameDecoder = new TextDecoder('utf-8', { fatal: true });
  const entries = [],
    names = new Set();
  let total = 0;
  for (let n = 0; n < count; n++) {
    if (
      offset + 46 > directoryEnd ||
      view.getUint32(offset, true) !== 0x02014b50
    )
      throw new Error('Invalid ZIP directory entry.');
    const flags = view.getUint16(offset + 8, true),
      method = view.getUint16(offset + 10, true);
    const checksum = view.getUint32(offset + 16, true),
      compressedSize = view.getUint32(offset + 20, true),
      size = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true),
      extraLength = view.getUint16(offset + 30, true),
      commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    if (offset + 46 + nameLength + extraLength + commentLength > directoryEnd)
      throw new Error('Truncated ZIP directory.');
    const name = safePath(
      filenameDecoder.decode(
        bytes.subarray(offset + 46, offset + 46 + nameLength),
      ),
    );
    offset += 46 + nameLength + extraLength + commentLength;
    if (entryAllowed && !entryAllowed(name)) {
      const error = new Error(
        'Choose project.json or an Open ESKD metadata toolkit; transfer engineering files separately. Unexpected archive entry: ' +
          name,
      );
      error.code = 'metadata-package';
      error.info = name;
      throw error;
    }
    if (names.has(name)) throw new Error('Duplicate archive path.');
    names.add(name);
    if (flags & 0x2041)
      throw new Error('Password-protected archives are not supported.');
    if (![0, 8].includes(method))
      throw new Error('Only stored and DEFLATE ZIP entries are supported.');
    if (
      localOffset + 30 > directoryStart ||
      view.getUint32(localOffset, true) !== 0x04034b50
    )
      throw new Error('Invalid ZIP file header.');
    const start =
      localOffset +
      30 +
      view.getUint16(localOffset + 26, true) +
      view.getUint16(localOffset + 28, true);
    if (start + compressedSize > directoryStart)
      throw new Error('Truncated ZIP file.');
    const localName = safePath(
      filenameDecoder.decode(
        bytes.subarray(
          localOffset + 30,
          localOffset + 30 + view.getUint16(localOffset + 26, true),
        ),
      ),
    );
    if (
      localName !== name ||
      view.getUint16(localOffset + 6, true) !== flags ||
      view.getUint16(localOffset + 8, true) !== method
    )
      throw new Error('ZIP local and directory headers differ.');
    if (
      !(flags & 8) &&
      (view.getUint32(localOffset + 14, true) !== checksum ||
        view.getUint32(localOffset + 18, true) !== compressedSize ||
        view.getUint32(localOffset + 22, true) !== size)
    )
      throw new Error('ZIP local and directory sizes or checksums differ.');
    if (flags & 8) {
      const descriptor = start + compressedSize;
      const matches = (position) =>
        position + 12 <= directoryStart &&
        view.getUint32(position, true) === checksum &&
        view.getUint32(position + 4, true) === compressedSize &&
        view.getUint32(position + 8, true) === size;
      if (
        !matches(descriptor) &&
        !(
          descriptor + 16 <= directoryStart &&
          view.getUint32(descriptor, true) === 0x08074b50 &&
          matches(descriptor + 4)
        )
      )
        throw new Error('ZIP data descriptor does not match its directory.');
    }
    total += size;
    if (total > MAX_SIZE || size > entryLimit(name)) throw limitError();
    let data = bytes.slice(start, start + compressedSize);
    if (method === 8) {
      if (typeof DecompressionStream === 'undefined')
        throw new Error(
          'This browser cannot read compressed ZIP files. Use a current Chrome, Edge, Firefox or Safari browser.',
        );
      const reader = new Blob([data])
        .stream()
        .pipeThrough(new DecompressionStream('deflate-raw'))
        .getReader();
      const chunks = [];
      let length = 0;
      try {
        for (;;) {
          const result = await reader.read();
          if (result.done) break;
          length += result.value.length;
          if (length > size || length > MAX_SIZE) {
            await reader.cancel();
            throw new Error('ZIP expanded beyond its declared size.');
          }
          chunks.push(result.value);
        }
      } finally {
        reader.releaseLock();
      }
      data = concat(chunks);
    }
    if (data.length !== size || crc32(data) !== checksum)
      throw new Error('ZIP file checksum failed.');
    if (!name.endsWith('/')) entries.push({ name, data });
  }
  if (offset !== directoryEnd)
    throw new Error('ZIP directory size does not match its entries.');
  return entries;
}
