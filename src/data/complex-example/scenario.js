import * as C from '../../domain/index.js';
import { COMPLEX_EXAMPLE_IDS as IDS, EXAMPLE_NAMESPACE } from './constants.js';
import {
  fixedCommit,
  fixedIdentity,
  refreshControlledReferences,
} from './shared.js';

function publish(project, ctx, label, date) {
  const result = C.publishComponent(project, IDS.telemetry, {
    label,
    author: ctx.t(
      'Example configuration engineer',
      'Навчальний інженер конфігурації',
    ),
    message:
      label === 'A'
        ? ctx.t(
            'Initial supplier module and adapter interface reference',
            'Початкове посилання на модуль та інтерфейс адаптера постачальника',
          )
        : ctx.t(
            'CHG-002: supplier adapter substitution; compare interface revision B and retain revision A for the issued MVP batch',
            'CHG-002: заміна адаптера постачальника; зіставити інтерфейс B і зберегти A для виданої MVP-партії',
          ),
    status: 'draft',
  });
  result.record.createdAt = date;
  const fixed = fixedIdentity(
    result.project,
    result.record.id,
    label === 'A' ? IDS.catalogA : IDS.catalogB,
  );
  refreshControlledReferences(fixed);
  return fixed;
}

export function createScenario(project, ctx) {
  let p = publish(project, ctx, 'A', '2026-01-16T09:00:00.000Z');
  p = fixedCommit(
    p,
    {
      author: ctx.t(
        'Example systems engineering team',
        'Навчальна команда системної інженерії',
      ),
      message: ctx.t(
        'MVP A: complete product breakdown, supplier boundaries, software release references and synthetic verification plan',
        'MVP A: повна декомпозиція, межі постачання, посилання на випуски ПЗ та синтетичний план перевірки',
      ),
      version: '0.2.0-mvp-a',
      status: 'draft',
    },
    IDS.baseline,
    '2026-01-17T09:00:00.000Z',
  );
  p = createMvpBatch(p, ctx);

  C.createBranch(p, 'ground/rugged-station', IDS.baseline);
  const alternative = C.working(p);
  const computer = alternative.components.find(
    (c) => c.id === 'ground-computer',
  );
  computer.revision = 'ALT-1';
  computer.notes = ctx.t(
    'Parallel evaluation: rugged supplier computer instead of the office workstation. Review offline restore, data portability and interface compatibility before adopting the variant. This branch is not merged into main.',
    'Паралельне опрацювання: захищений комп’ютер постачальника замість офісної станції. Перед прийняттям перевірте офлайн-відновлення, переносимість даних і сумісність інтерфейсів. Гілку не зведено з main.',
  );
  computer.manufacturer = ctx.t(
    'Alternative supplier evaluation',
    'Оцінювання альтернативного постачальника',
  );
  refreshControlledReferences(p);
  p = fixedCommit(
    p,
    {
      author: ctx.t(
        'Example ground station team',
        'Навчальна команда наземної станції',
      ),
      message: ctx.t(
        'Independent ground station variant: evaluate a rugged workstation without changing the MVP A baseline',
        'Незалежний варіант наземної станції: оцінити захищений комп’ютер без зміни базової конфігурації MVP A',
      ),
      version: '0.2.1-ground-variant',
      status: 'review',
    },
    'example-commit-ground-variant',
    '2026-01-20T09:00:00.000Z',
  );

  p.activeBranch = 'main';
  p = C.checkoutComponent(p, IDS.telemetry);
  const snapshot = C.working(p);
  const telemetry = snapshot.components.find((c) => c.id === IDS.telemetry);
  telemetry.notes = ctx.t(
    'CHG-002: supplier adapter B replaces adapter A after a documentation compatibility review. The physical form and operating settings remain supplier-controlled. Catalog B descends from A; MVP-001 remains pinned to A. Real substitution approval is still outstanding.',
    'CHG-002: адаптер B замінює A після навчального розгляду документальної сумісності. Фізичне виконання й робочі налаштування контролює постачальник. Каталог B походить від A; MVP-001 залишається на A. Реальне погодження заміни ще не отримано.',
  );
  const interfaceDoc = snapshot.documents.find(
    (d) => d.componentId === IDS.telemetry,
  );
  interfaceDoc.revision = 'B';
  interfaceDoc.path = 'suppliers/communications/SUP.410.010_B_interface.pdf';
  interfaceDoc.name = 'SUP.410.010_B_interface.pdf';
  const communications = snapshot.components.find(
    (c) => c.id === IDS.communications,
  );
  communications.revision = 'B';
  const compatibility = snapshot.documents.find(
    (d) => d.id === 'communications-interface',
  );
  compatibility.path =
    'hardware/communications/ATL.400.000_B_interface-matrix.md';
  compatibility.name = 'ATL.400.000_B_interface-matrix.md';
  compatibility.revision = 'B';
  refreshControlledReferences(p);
  p = publish(p, ctx, 'B', '2026-01-22T09:00:00.000Z');
  p = fixedCommit(
    p,
    {
      author: ctx.t(
        'Example configuration engineer',
        'Навчальний інженер конфігурації',
      ),
      message: ctx.t(
        'CHG-002: use telemetry module revision B for future work; retain the frozen MVP A work order and rejection history',
        'CHG-002: використовувати ревізію B телеметричного модуля для майбутніх робіт; зберегти зафіксований наряд MVP A та історію браку',
      ),
      version: '0.3.0-interface-b',
      status: 'review',
    },
    IDS.replacement,
    '2026-01-23T09:00:00.000Z',
  );
  C.validateProject(p);
  return p;
}

function createMvpBatch(project, ctx) {
  const batch = C.createBatch(project, {
    name: 'MVP-001 · SYNTHETIC',
    mode: 'prototype',
    quantity: 2,
    author: ctx.t(
      'Example production planner',
      'Навчальний планувальник виробництва',
    ),
    extensions: {
      [EXAMPLE_NAMESPACE]: { synthetic: true, purpose: 'training-only' },
    },
  });
  batch.createdAt = '2026-01-18T09:00:00.000Z';
  let p = fixedIdentity(project, batch.id, IDS.batch);
  let sequence = 0;
  function result(
    componentId,
    index,
    accepted,
    rejected = 0,
    notes,
    evidencePath = '',
  ) {
    const frozen = p.production[0];
    const component = frozen.snapshot.components.find(
      (c) => c.id === componentId,
    );
    const event = C.recordResult(p, IDS.batch, {
      componentId,
      operationId: component.manufacturing.steps[index].id,
      accepted,
      rejected,
      operator: ctx.t(
        'Example inspection operator',
        'Навчальний оператор контролю',
      ),
      notes:
        notes ||
        ctx.t(
          'SYNTHETIC: training-only acceptance record; no real item was inspected.',
          'СИНТЕТИЧНО: навчальний запис приймання; реальний виріб не перевірявся.',
        ),
      evidencePath,
      extensions: { [EXAMPLE_NAMESPACE]: { synthetic: true } },
    });
    sequence++;
    event.createdAt = `2026-01-18T10:${String(sequence).padStart(2, '0')}:00.000Z`;
    p = fixedIdentity(
      p,
      event.id,
      'example-result-' + String(sequence).padStart(3, '0'),
    );
  }
  result(
    'tracker-bracket',
    0,
    3,
    1,
    ctx.t(
      'SYNTHETIC NCR-001: one blank identity label did not match the preparation record. Quarantine the example unit; the rejected record stays in the ledger.',
      'СИНТЕТИЧНО NCR-001: маркування однієї заготовки не збіглося із записом підготовки. Навчальну одиницю відокремлено; запис браку залишається в журналі.',
    ),
    'verification/evidence/SIM-001/bracket-inspection.synthetic.csv',
  );
  result(
    'tracker-bracket',
    0,
    1,
    0,
    ctx.t(
      'SYNTHETIC NCR-001 replacement: one replacement blank accepted; previous rejection retained. Four accepted blanks now unblock the next operation.',
      'СИНТЕТИЧНА заміна NCR-001: прийнята одна замінна заготовка, попередній брак збережено. Чотири прийняті заготовки відкривають наступну операцію.',
    ),
    'verification/evidence/SIM-001/bracket-inspection.synthetic.csv',
  );
  result('tracker-bracket', 1, 4);
  result(
    'tracker-bracket',
    2,
    4,
    0,
    undefined,
    'verification/evidence/SIM-001/bracket-inspection.synthetic.csv',
  );

  for (const id of [
    'telemetry-module',
    'radio-antenna',
    'communications-harness',
  ]) {
    result(id, 0, 2);
    result(
      id,
      1,
      2,
      0,
      undefined,
      'verification/evidence/SIM-001/communications-bench.synthetic.log',
    );
  }
  for (const index of [0, 1, 2]) result('communications', index, 2);
  result(
    'communications',
    3,
    1,
    1,
    ctx.t(
      'SYNTHETIC bench case COM-003: one interface label mismatch. Keep the accepted quantity at one until the separate controlled rework and retest are recorded.',
      'СИНТЕТИЧНИЙ стендовий випадок COM-003: одна невідповідність позначення інтерфейсу. Прийнята кількість залишається один, доки окремо не записані контрольоване доопрацювання та повторна перевірка.',
    ),
    'verification/evidence/SIM-001/communications-bench.synthetic.log',
  );

  for (const index of [0, 1, 2])
    result(
      'firmware-release',
      index,
      2,
      0,
      undefined,
      'verification/evidence/SIM-001/console-replay.synthetic.log',
    );
  C.validateProject(p);
  return p;
}
