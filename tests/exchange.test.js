import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import * as Z from '../src/files/zip/index.js';
import * as E from '../src/files/index.js';

function fixture() {
  let p = C.createProject({ name: 'Exchange test', designation: 'EX.100' });
  p = E.registerDocuments(p, ['drawings/drawing.pdf']);
  C.commit(p, {
    author: 'Engineer',
    message: 'Original documentation',
    version: '0.2.0',
  });
  C.createBranch(p, 'alternative');
  C.working(p).meta.description = 'Alternative';
  C.commit(p, {
    author: 'Engineer',
    message: 'Alternative',
    version: '0.3.0-alt',
  });
  p.activeBranch = 'main';
  C.working(p).documents = [];
  return p;
}
test('metadata ZIP retains branches, history and removed file references without original bytes', async () => {
  const p = fixture(),
    zip = await E.archive(p);
  assert.deepEqual(
    (await E.read(new File([zip], 'engineering.zip'))).project,
    p,
  );
  const entries = await Z.read(zip);
  for (const name of [
    'project.json',
    'report.html',
    'create-folders.sh',
    'check-files.sh',
    'create-folders.ps1',
    'check-files.ps1',
    'manufacturing/BOM.csv',
  ])
    assert(entries.some((e) => e.name === name));
  assert(!entries.some((e) => e.name.startsWith('files/')));
  assert.equal(
    Object.values(p.commits).find((c) => c.version === '0.2.0').snapshot
      .documents[0].path,
    'drawings/drawing.pdf',
  );
});
test('one JSON retains identities, references and metadata only', async () => {
  const p = fixture();
  assert.deepEqual(
    (await E.read(new File([E.json(p)], 'project.json'))).project,
    p,
  );
  assert(!E.json(p).includes('"blobs"'));
});
test('wrapped metadata ZIP imports and ordinary file archives are rejected', async () => {
  const p = fixture(),
    entries = await Z.read(await E.archive(p));
  assert.deepEqual(
    (
      await E.read(
        new File(
          [Z.create(entries.map((e) => ({ ...e, name: 'package/' + e.name })))],
          'wrapped.zip',
        ),
      )
    ).project,
    p,
  );
  await assert.rejects(
    E.read(
      new File(
        [Z.create([{ name: 'CAD/part.step', data: 'bytes' }])],
        'files.zip',
      ),
    ),
    /project.json/,
  );
});
test('multiple manifests and rewritten metadata are rejected', async () => {
  const p = fixture(),
    entries = await Z.read(await E.archive(p));
  entries.push({ name: 'other/project.json', data: entries[0].data });
  await assert.rejects(
    E.read(new File([Z.create(entries)], 'multiple.zip')),
    /one project.json/,
  );
  p.blobs = {};
  await assert.rejects(
    E.read(new File([JSON.stringify(p)], 'invalid.json')),
    /unsafe schema/,
  );
});
test('registering paths infers purposes and rejects unsafe paths transactionally', () => {
  const p = C.createProject({ name: 'External files' });
  const result = E.registerDocuments(p, [
    'CAD/bracket.step',
    'notes/setup.txt',
  ]);
  assert.deepEqual(
    C.working(result).documents.map((d) => d.kind),
    ['model', 'instructions'],
  );
  assert.equal(C.working(p).documents.length, 0);
  assert.throws(
    () => E.registerDocuments(p, ['../secret.pdf']),
    /relative file path/,
  );
});
test('CSV exports neutralize spreadsheet formula prefixes', () => {
  const p = C.createProject({ name: 'CSV' });
  C.working(p).components.push(
    C.component({ name: '=HYPERLINK("example")', designation: 'EX.1' }),
  );
  assert(E.csv(C.working(p)).includes('"\'=HYPERLINK(""example"")"'));
});
test('invalid dates and unsafe commit identities are rejected', () => {
  const p = fixture();
  C.head(p).createdAt = 'invalid';
  assert.throws(() => C.validateProject(p), /timestamp/);
  C.head(p).createdAt = C.now();
  p.commits.constructor = { ...C.head(p), id: 'constructor' };
  assert.throws(() => C.validateProject(p), /Invalid version record/);
});

test('metadata imports reject engineering payloads instead of silently dropping them on export', async () => {
  const p = fixture(),
    zip = Z.create([
      { name: 'project.json', data: E.json(p) },
      { name: 'CAD/part.step', data: 'Engineering bytes remain external' },
    ]);
  await assert.rejects(E.read(new File([zip], 'mixed.zip')), {
    code: 'metadata-package',
  });
});

test('CSV retains whitespace while neutralizing formula-like text after it', () => {
  const p = C.createProject({ name: 'Whitespace CSV' });
  C.working(p).components.push(
    C.component({ name: '  =SUM(1,2)', designation: 'CSV.1' }),
  );
  assert(E.csv(C.working(p)).includes('"\'  =SUM(1,2)"'));
});
