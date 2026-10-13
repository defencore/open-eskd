import * as C from '../domain/index.js';
import * as Z from './zip/index.js';

export async function read(file) {
  if (file.size > Z.MAX_SIZE)
    throw new Error('Archive exceeds the 200 MB limit.');
  let input;
  if (/\.json$/i.test(file.name) || file.type === 'application/json')
    input = JSON.parse(
      new TextDecoder('utf-8', { fatal: true })
        .decode(await file.arrayBuffer())
        .replace(/^\ufeff/, ''),
    );
  else {
    const metadataEntries = [
      'project.json',
      'report.html',
      'create-folders.sh',
      'check-files.sh',
      'create-folders.ps1',
      'check-files.ps1',
      'manufacturing/BOM.csv',
      'manufacturing/ASSEMBLY.md',
      'README.txt',
    ];
    const entries = await Z.read(file, {
      entryAllowed: (name) =>
        name.endsWith('/') ||
        metadataEntries.some(
          (entry) => name === entry || name.endsWith('/' + entry),
        ),
    });
    const manifests = entries.filter(
      (e) => e.name === 'project.json' || e.name.endsWith('/project.json'),
    );
    if (manifests.length !== 1)
      throw new Error(
        'Choose an Open ESKD JSON or metadata package with one project.json manifest.',
      );
    const entry = manifests[0];
    const prefix = entry.name.slice(0, -'project.json'.length);
    if (
      entries.some(
        (file) => !metadataEntries.some((name) => file.name === prefix + name),
      )
    )
      throw new Error(
        'Choose one project.json metadata toolkit in a single archive folder.',
      );
    input = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(entry.data),
    );
  }
  if (!input || input.schema !== C.SCHEMA)
    throw new Error('Choose an Open ESKD project manifest.');
  C.validateProject(input);
  return { project: input };
}
