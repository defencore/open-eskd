import * as C from '../../domain/index.js';
import { createContext, initialProject } from './shared.js';
import { addAircraft } from './aircraft.js';
import { addGround } from './ground.js';
import { addSupport } from './support.js';
import { addVerification } from './verification.js';
import { createScenario } from './scenario.js';
import { localizeExampleIdentities } from './locale.js';
import { EXAMPLE_NAMESPACE, SUPPLIED_EXAMPLE_PATHS } from './constants.js';

export { COMPLEX_EXAMPLE_IDS, COMPLEX_EXAMPLE_SECTIONS } from './constants.js';

export function createComplexExample(lang = 'en') {
  const ctx = createContext(lang);
  ctx.add(
    {
      id: 'system',
      parentId: null,
      designation: 'ATL.000.000',
      type: 'complex',
    },
    [
      'Atlas civilian infrastructure inspection complex',
      'Цивільний комплекс інспекції інфраструктури Atlas',
    ],
    [
      'Start here: follow the subsystem tree, inspect software release references and synthetic verification evidence, compare telemetry revisions A/B and the parallel ground-station branch, then examine the immutable MVP A production batch. This is an organization example, not a construction or operating manual.',
      'Почніть тут: дерево підсистем, посилання на випуски ПЗ та синтетичні докази, ревізії A/B телеметрії, паралельна гілка наземної станції й незмінна виробнича партія MVP A. Це приклад організації, а не інструкція виготовлення чи експлуатації.',
    ],
  );
  ctx.document(
    'system',
    'requirements',
    'documentation/system/ATL.000.000_A_requirements.md',
    'specification',
  );
  ctx.document(
    'system',
    'configuration',
    'documentation/system/ATL.000.000_A_configuration-management-plan.md',
    'instructions',
  );
  ctx.document(
    'system',
    'handover',
    'documentation/system/ATL.000.000_A_facility-handover-matrix.csv',
    'instructions',
  );
  addAircraft(ctx);
  addGround(ctx);
  addSupport(ctx);
  addVerification(ctx);
  ctx.assemble('system', ['system-requirements', 'system-configuration']);
  for (const document of ctx.snapshot.documents)
    document.extensions[EXAMPLE_NAMESPACE].supplied =
      SUPPLIED_EXAMPLE_PATHS.includes(document.path);
  const project = localizeExampleIdentities(
    createScenario(initialProject(ctx), ctx),
    lang,
  );
  C.validateProject(project);
  return project;
}
