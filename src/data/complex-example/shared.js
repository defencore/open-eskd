import * as C from '../../domain/index.js';
import {
  EXAMPLE_DATE,
  EXAMPLE_NAMESPACE,
  EXAMPLE_VERSION,
} from './constants.js';

export function createContext(lang) {
  const t = (en, uk) => (lang === 'uk' || lang === 'ua' ? uk : en);
  const snapshot = {
    meta: {
      name: t(
        'Atlas · Civilian inspection complex · Learning example',
        'Atlas · Цивільний інспекційний комплекс · Навчальний приклад',
      ),
      designation: 'ATL.000.000',
      description: t(
        'A fictional civilian infrastructure inspection system. Learn decomposition, hardware/software configuration, supplier boundaries, evidence, revision replacement and distributed MVP work orders. All results are synthetic; no real flight, launch, manufacturing approval or qualification is represented.',
        'Вигаданий комплекс цивільної інспекції інфраструктури. Декомпозиція, конфігурація апаратури й ПЗ, межі постачання, докази, заміна ревізій та розподілені MVP-наряди. Усі результати синтетичні; реальні польоти, запуски, допуски до виготовлення чи кваліфікація не підтверджуються.',
      ),
      owner: t(
        'Example systems engineering team',
        'Навчальна команда системної інженерії',
      ),
      workflow: 'design',
    },
    components: [],
    documents: [],
  };
  const componentById = new Map();
  const documentById = new Map();
  const facilities = {
    systems: t(
      'Systems integration laboratory',
      'Лабораторія системної інтеграції',
    ),
    mechanical: t('Mechanical workshop', 'Механічна майстерня'),
    electronics: t('Electronics laboratory', 'Лабораторія електроніки'),
    software: t('Software verification team', 'Команда перевірки ПЗ'),
    supplier: t('Supplier acceptance desk', 'Дільниця приймання постачання'),
    metrology: t(
      'Independent inspection laboratory',
      'Незалежна контрольна лабораторія',
    ),
    power: t('Battery service station', 'Дільниця обслуговування акумуляторів'),
  };
  function add(fields, name, notes) {
    const c = C.component({
      ...fields,
      name: t(...name),
      status: 'draft',
      owner: fields.owner || snapshot.meta.owner,
      manufacturer: fields.manufacturer || facilities.systems,
      revision: 'A',
      notes: notes
        ? t(...notes)
        : t(
            'Illustrative configuration only. Replace this description with reviewed project data.',
            'Лише навчальна конфігурація. Замініть опис перевіреними даними свого проєкту.',
          ),
      provenance: {
        basis: ['purchased', 'standard'].includes(fields.type)
          ? 'supplier'
          : 'designed',
        confidence: 'unverified',
        reference: '',
        notes: t(
          'Fictional example; provenance is not independently verified.',
          'Вигаданий приклад; походження не перевірене незалежно.',
        ),
      },
    });
    snapshot.components.push(c);
    componentById.set(c.id, c);
    return c;
  }
  function document(
    componentId,
    suffix,
    path,
    kind = 'instructions',
    fields = {},
  ) {
    const d = {
      id: componentId + '-' + suffix,
      componentId,
      name: path.split('/').at(-1),
      path,
      kind,
      revision: 'A',
      sha256: null,
      required: true,
      extensions: {
        [EXAMPLE_NAMESPACE]: { supplied: false, synthetic: true },
      },
      ...fields,
    };
    snapshot.documents.push(d);
    documentById.set(d.id, d);
    return d;
  }
  function route(componentId, technology, operations, options = {}) {
    const c = componentById.get(componentId);
    c.process = t(
      'Controlled example route; see linked documents.',
      'Навчальний контрольований маршрут; дивіться пов’язані документи.',
    );
    c.manufacturing = C.manufacturing({
      technology,
      stock: options.stock || '',
      preparation: t(
        'Check the selected revision, component identities and referenced documents. Example records do not authorize real work.',
        'Перевірте обрану ревізію, ідентифікацію складових і посилання на документи. Навчальні записи не дозволяють реальні роботи.',
      ),
      steps: operations.map((operation, index) => {
        const fields =
          typeof operation === 'string' ? { operation } : operation;
        const step = C.operation({
          id: componentId + '-op-' + (index + 1),
          facility: c.manufacturer,
          instructions: t(
            'Use the controlled procedure referenced by this operation; this example supplies no operating parameters.',
            'Користуйтеся контрольованою процедурою, вказаною в операції; приклад не містить робочих параметрів.',
          ),
          check: t(
            'Record objective evidence against the reviewed acceptance criteria. Synthetic example results are not approvals.',
            'Запишіть об’єктивні докази відповідності перевіреним критеріям. Синтетичні результати не є допусками.',
          ),
          ...fields,
        });
        if (options.documents)
          step.documents = options.documents.map((id) =>
            C.documentReference(documentById.get(id)),
          );
        return step;
      }),
    });
    return c.manufacturing;
  }
  function assemble(componentId, documents = [], inputIds) {
    const logical = componentById.get(componentId).type === 'set';
    const children =
      inputIds ||
      snapshot.components
        .filter((c) => c.parentId === componentId)
        .map((c) => c.id);
    return route(
      componentId,
      logical ? 'other' : 'assembly',
      [
        'prepare',
        {
          operation: logical ? 'other' : 'assembly',
          componentInputs: children.map((id) =>
            C.inputReference(
              componentById.get(id),
              componentById.get(id).quantity,
            ),
          ),
        },
        'inspect',
        'test',
      ],
      { documents },
    );
  }
  return {
    t,
    snapshot,
    componentById,
    documentById,
    facilities,
    add,
    document,
    route,
    assemble,
  };
}

export function initialProject(context) {
  const initial = {
    meta: C.clone(context.snapshot.meta),
    components: [],
    documents: [],
  };
  return {
    schema: C.SCHEMA,
    schemaVersion: C.VERSION,
    kind: 'project',
    id: 'inspection-complex-example',
    createdAt: EXAMPLE_DATE,
    updatedAt: EXAMPLE_DATE,
    activeBranch: 'main',
    catalog: {},
    branches: {
      main: {
        head: 'example-commit-created',
        working: C.clone(context.snapshot),
      },
    },
    commits: {
      'example-commit-created': {
        id: 'example-commit-created',
        parents: [],
        author: context.snapshot.meta.owner,
        message: context.t(
          'Create the fictional civilian inspection project',
          'Створити вигаданий проєкт цивільної інспекції',
        ),
        version: '0.1.0',
        status: 'draft',
        createdAt: EXAMPLE_DATE,
        snapshot: initial,
      },
    },
    production: [],
    fileCheck: null,
    extensions: {
      [EXAMPLE_NAMESPACE]: {
        id: 'inspection-complex',
        version: EXAMPLE_VERSION,
      },
    },
  };
}

// Domain commands create identities at runtime. Canonicalize the newly created
// identity immediately, without changing existing learning-navigation IDs.
export function fixedIdentity(project, generatedId, fixedId) {
  function replace(value) {
    if (value === generatedId) return fixedId;
    if (Array.isArray(value)) return value.map(replace);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key === generatedId ? fixedId : key,
        replace(child),
      ]),
    );
  }
  return replace(project);
}

export function fixedCommit(project, fields, id, date) {
  const record = C.commit(project, fields);
  record.createdAt = date;
  project.updatedAt = date;
  return fixedIdentity(project, record.id, id);
}

export function refreshControlledReferences(project) {
  const snapshot = C.working(project);
  const components = new Map(snapshot.components.map((c) => [c.id, c]));
  const documents = new Map(snapshot.documents.map((d) => [d.id, d]));
  for (const component of snapshot.components) {
    if (component.source) continue;
    for (const step of component.manufacturing.steps) {
      step.dependsOn = step.dependsOn.map((ref) => {
        const target = components.get(ref.componentId);
        const operation = target.manufacturing.steps.find(
          (op) => op.id === ref.operationId,
        );
        return C.operationReference(target, operation);
      });
      step.componentInputs = step.componentInputs.map((ref) =>
        C.inputReference(
          components.get(ref.componentId),
          ref.quantity,
          ref.usage,
        ),
      );
      step.documents = step.documents.map((ref) =>
        C.documentReference(documents.get(ref.documentId)),
      );
    }
  }
}
