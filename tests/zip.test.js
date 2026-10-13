import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import * as Z from '../src/files/zip/index.js';

test('ZIP round trip preserves Unicode paths, empty files and binary content', async () => {
  const source = [
    { name: 'креслення/деталь.txt', data: 'Engineering content' },
    { name: 'empty.txt', data: '' },
    { name: 'binary.bin', data: new Uint8Array([0, 255, 1, 2, 128]) },
  ];
  const entries = await Z.read(Z.create(source));
  assert.deepEqual(
    entries.map((e) => e.name),
    source.map((e) => e.name),
  );
  assert.equal(Z.decoder.decode(entries[0].data), 'Engineering content');
  assert.equal(entries[1].data.length, 0);
  assert.deepEqual(entries[2].data, source[2].data);
});
test('CRC32 matches the standard check vector', () =>
  assert.equal(Z.crc32(Z.encoder.encode('123456789')), 0xcbf43926));
test('ZIP traversal and absolute paths are rejected', () => {
  for (const name of [
    '../file',
    '/root/file',
    'C:\\file',
    'safe/../../file',
    'safe/./file',
    'file\0.txt',
  ])
    assert.throws(() => Z.create([{ name, data: '' }]), /Unsafe/);
});
test('duplicate paths and corrupt file content are rejected', async () => {
  assert.throws(
    () =>
      Z.create([
        { name: 'same.txt', data: 'a' },
        { name: 'same.txt', data: 'b' },
      ]),
    /Duplicate/,
  );
  const duplicate = new Uint8Array(
    await Z.create([
      { name: 'same.txt', data: 'a' },
      { name: 'diff.txt', data: 'b' },
    ]).arrayBuffer(),
  );
  const target = Z.encoder.encode('diff.txt');
  for (let i = 0; i < duplicate.length - target.length; i++)
    if (target.every((byte, index) => duplicate[i + index] === byte))
      duplicate.set(Z.encoder.encode('same.txt'), i);
  await assert.rejects(Z.read(duplicate), /Duplicate/);
  const bytes = new Uint8Array(
    await Z.create([{ name: 'test.txt', data: 'abc' }]).arrayBuffer(),
  );
  bytes[38] ^= 1;
  await assert.rejects(Z.read(bytes), /checksum/);
});
test('truncated archives and encrypted ZIPs are rejected', async () => {
  const bytes = new Uint8Array(
    await Z.create([{ name: 'test.txt', data: 'abc' }]).arrayBuffer(),
  );
  await assert.rejects(Z.read(bytes.slice(0, -1)), /valid ZIP/);
  const centralOffset = 30 + 8 + 3;
  bytes[centralOffset + 8] |= 1;
  await assert.rejects(Z.read(bytes), /Password/);
});
test('DEFLATE entries made by external ZIP tools can be read', async () => {
  const name = Z.encoder.encode('drawing.txt'),
    data = Z.encoder.encode('A drawing '.repeat(1000)),
    compressed = new Uint8Array(deflateRawSync(data));
  const crc = Z.crc32(data);
  const local = new Uint8Array(30 + name.length),
    lv = new DataView(local.buffer);
  lv.setUint32(0, 0x04034b50, true);
  lv.setUint16(4, 20, true);
  lv.setUint16(6, 0x800, true);
  lv.setUint16(8, 8, true);
  lv.setUint32(14, crc, true);
  lv.setUint32(18, compressed.length, true);
  lv.setUint32(22, data.length, true);
  lv.setUint16(26, name.length, true);
  local.set(name, 30);
  const central = new Uint8Array(46 + name.length),
    cv = new DataView(central.buffer);
  cv.setUint32(0, 0x02014b50, true);
  cv.setUint16(6, 20, true);
  cv.setUint16(8, 0x800, true);
  cv.setUint16(10, 8, true);
  cv.setUint32(16, crc, true);
  cv.setUint32(20, compressed.length, true);
  cv.setUint32(24, data.length, true);
  cv.setUint16(28, name.length, true);
  central.set(name, 46);
  const end = new Uint8Array(22),
    ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, 1, true);
  ev.setUint16(10, 1, true);
  ev.setUint32(12, central.length, true);
  ev.setUint32(16, local.length + compressed.length, true);
  const entries = await Z.read(new Blob([local, compressed, central, end]));
  assert.equal(Z.decoder.decode(entries[0].data), Z.decoder.decode(data));
});
test('SHA-256 verifies original file bytes', async () => {
  const bytes = new Uint8Array([0, 1, 127, 255]);
  assert.equal((await Z.hash(bytes)).length, 64);
  assert.equal(
    await Z.hash(Z.encoder.encode('abc')),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});

test('ZIP creation rejects files and archives exceeding import limits before serialization', () => {
  const large = new Uint8Array(25 * 1024 * 1024 + 1);
  assert.throws(() => Z.create([{ name: 'report.html', data: large }]), {
    code: 'file-limit',
  });
  const chunk = large.subarray(0, 25 * 1024 * 1024);
  assert.throws(
    () =>
      Z.create(
        Array.from({ length: 8 }, (_, i) => ({
          name: `report-${i}.html`,
          data: chunk,
        })),
      ),
    { code: 'file-limit' },
  );
  assert.throws(() => Z.create([{ name: 'a//b', data: '' }]), /Unsafe/);
});

test('inconsistent local headers and directory sizes are rejected', async () => {
  const original = new Uint8Array(
    await Z.create([{ name: 'test.txt', data: 'abc' }]).arrayBuffer(),
  );
  const name = original.slice();
  name[30] = 100;
  await assert.rejects(Z.read(name), /headers differ/);
  const method = original.slice();
  new DataView(method.buffer).setUint16(8, 8, true);
  await assert.rejects(Z.read(method), /headers differ/);
  const directory = original.slice(),
    view = new DataView(directory.buffer);
  view.setUint32(
    directory.length - 10,
    view.getUint32(directory.length - 10, true) + 1,
    true,
  );
  await assert.rejects(Z.read(directory), /directory/);
});

test('streamed entries with data descriptors round trip and inconsistent descriptors fail', async () => {
  const source = new Uint8Array(
      await Z.create([
        { name: 'stream.txt', data: 'streamed data' },
      ]).arrayBuffer(),
    ),
    nameLength = 10,
    dataLength = 13,
    centralStart = 30 + nameLength + dataLength,
    descriptor = new Uint8Array(16),
    dv = new DataView(descriptor.buffer),
    sv = new DataView(source.buffer);
  dv.setUint32(0, 0x08074b50, true);
  dv.setUint32(4, sv.getUint32(14, true), true);
  dv.setUint32(8, dataLength, true);
  dv.setUint32(12, dataLength, true);
  const bytes = Z.concat([
      source.subarray(0, centralStart),
      descriptor,
      source.subarray(centralStart),
    ]),
    view = new DataView(bytes.buffer);
  view.setUint16(6, 0x808, true);
  view.setUint32(14, 0, true);
  view.setUint32(18, 0, true);
  view.setUint32(22, 0, true);
  view.setUint16(centralStart + 16 + 8, 0x808, true);
  view.setUint32(bytes.length - 6, centralStart + 16, true);
  assert.equal(
    Z.decoder.decode((await Z.read(bytes))[0].data),
    'streamed data',
  );
  bytes[centralStart + 4] ^= 1;
  await assert.rejects(Z.read(bytes), /descriptor/);
});
