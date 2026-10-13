import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { VERSION } from '../src/domain/constants.js';
import { projectSchema } from '../src/domain/schema.js';
export async function writeSchema(check = false) {
  const path = fileURLToPath(
    new URL(`../schema/project-v${VERSION}.json`, import.meta.url),
  );
  const data = await format(JSON.stringify(projectSchema), {
    ...(await resolveConfig(path)),
    parser: 'json',
  });
  if (check) {
    if ((await readFile(path, 'utf8')) !== data)
      throw new Error(
        'The checked-in JSON Schema differs from the canonical schema definition. Run npm run schema.',
      );
  } else {
    await mkdir(fileURLToPath(new URL('../schema', import.meta.url)), {
      recursive: true,
    });
    await writeFile(path, data);
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  await writeSchema(process.argv.includes('--check'));
