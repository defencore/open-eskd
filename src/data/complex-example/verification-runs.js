import { COMPLEX_EXAMPLE_IDS as IDS } from './constants.js';

const ROOT = 'verification/evidence/SIM-002/';
const PROCEDURE = 'verification/system-bench-test-plan.md';

const cases = [
  {
    id: 'com-a',
    testCase: 'COM-003',
    name: [
      'Interface label mismatch on frozen A',
      'Невідповідність позначення інтерфейсу в зафіксованій A',
    ],
    componentId: IDS.communications,
    operationId: 'communications-op-4',
    batch: true,
    outcome: 'failed',
    performedAt: '2026-01-19T09:00:00.000Z',
    summary: [
      'One fictional label mismatch remains rejected in MVP-001 at telemetry A. The later B retest has a different configuration and does not close this frozen work order.',
      'Одна вигадана невідповідність позначення залишається браком у MVP-001 з телеметрією A. Пізніша повторна перевірка B має іншу конфігурацію й не закриває цей зафіксований наряд.',
    ],
  },
  {
    id: 'com-b',
    testCase: 'COM-003',
    name: [
      'Separate retest after interface revision B',
      'Окрема повторна перевірка після ревізії інтерфейсу B',
    ],
    componentId: IDS.communications,
    operationId: 'communications-op-4',
    outcome: 'passed',
    retestOf: 'com-a',
    performedAt: '2026-01-24T09:00:00.000Z',
    summary: [
      'Fictional document-label review passes for the saved B configuration. Retain the failed A run and both evidence collections. No actual radio test, compatibility approval or batch acceptance is represented.',
      'Вигаданий розгляд позначень документів успішний для збереженої конфігурації B. Збережіть невдалу спробу A й обидва набори доказів. Реальні радіовипробування, погодження сумісності чи приймання партії не підтверджуються.',
    ],
  },
  {
    id: 'software',
    testCase: 'SW-001',
    name: [
      'Software release reference replay',
      'Відтворення посилань на випуск ПЗ',
    ],
    componentId: 'firmware-release',
    operationId: 'firmware-release-op-3',
    outcome: 'passed',
    performedAt: '2026-01-24T10:00:00.000Z',
    summary: [
      'Fictional release-manifest and dependency identifiers agree in this replay. Separate observer and application log streams accompany the protocol. No firmware was executed or approved.',
      'Вигадані ідентифікатори маніфесту випуску та залежностей збігаються у відтворенні. До протоколу додано окремі потоки журналів спостерігача й програми. Прошивка не виконувалась і не погоджувалась.',
    ],
  },
  {
    id: 'bracket-initial',
    testCase: 'NCR-001',
    name: [
      'Bracket preparation identity rejection',
      'Брак ідентифікації заготовки кронштейна',
    ],
    componentId: 'tracker-bracket',
    operationId: 'tracker-bracket-op-1',
    batch: true,
    outcome: 'failed',
    performedAt: '2026-01-19T10:00:00.000Z',
    summary: [
      'The training blank-label mismatch is preserved as its own failed run. Counts remain in the production ledger; a verification outcome never adds accepted or rejected quantities automatically.',
      'Навчальну невідповідність позначення заготовки збережено окремою невдалою спробою. Кількості ведуться у виробничому журналі; результат перевірки автоматично не додає прийняту чи забраковану кількість.',
    ],
  },
  {
    id: 'bracket-replacement',
    testCase: 'NCR-001',
    name: [
      'Independent replacement blank review',
      'Окремий розгляд замінної заготовки',
    ],
    componentId: 'tracker-bracket',
    operationId: 'tracker-bracket-op-1',
    batch: true,
    retestOf: 'bracket-initial',
    outcome: 'passed',
    performedAt: '2026-01-19T11:00:00.000Z',
    summary: [
      'The replacement identity review has a new run ID, protocol and logs at the same frozen configuration. The original rejection and its evidence remain unchanged. No real blank was inspected.',
      'Розгляд ідентифікації заміни має новий ID спроби, протокол і журнали за тієї самої зафіксованої конфігурації. Початковий брак і докази незмінні. Реальна заготовка не перевірялася.',
    ],
  },
  {
    id: 'battery',
    testCase: 'PWR-001',
    name: [
      'Battery asset evidence incomplete',
      'Неповні докази ідентифікації акумуляторів',
    ],
    componentId: IDS.power,
    operationId: 'power-service-op-3',
    outcome: 'inconclusive',
    performedAt: '2026-01-24T11:00:00.000Z',
    summary: [
      'The fictional inventory evidence is incomplete, so no pass/fail conclusion is justified. This record contains no charging procedure, electrical parameters or battery service approval.',
      'Вигадані інвентаризаційні докази неповні, тому висновок про успіх чи невдачу необґрунтований. Запис не містить процедури заряджання, електричних параметрів чи допуску до обслуговування акумуляторів.',
    ],
  },
  {
    id: 'ground-restore',
    testCase: 'GST-001',
    name: [
      'Alternative ground station restore exercise',
      'Навчальне відновлення альтернативної наземної станції',
    ],
    componentId: 'ground-software',
    operationId: 'ground-software-op-3',
    alternative: true,
    outcome: 'passed',
    performedAt: '2026-01-21T10:00:00.000Z',
    summary: [
      'The fictional offline restore evidence belongs to the separate rugged-station branch, not main. Log filenames identify separate observer and application streams. No real workstation was restored.',
      'Вигадані докази офлайн-відновлення належать окремій гілці захищеної станції, а не main. Назви журналів розрізняють потоки спостерігача й програми. Реальну станцію не відновлювали.',
    ],
  },
  {
    id: 'integration',
    testCase: 'SYS-001',
    name: [
      'Final integration held for unresolved prerequisites',
      'Фінальна інтеграція очікує виконання передумов',
    ],
    componentId: IDS.verification,
    operationId: 'verification-op-2',
    outcome: 'blocked',
    performedAt: '2026-01-24T12:00:00.000Z',
    summary: [
      'Final integration is blocked while controlled documentation and actual accepted subsystem evidence are missing. Optional absent videos are planned references, never reviewed recordings or proof of completion.',
      'Фінальна інтеграція заблокована, доки відсутні контрольована документація й реальні прийняті докази підсистем. Необов’язкові відсутні відео — заплановані посилання, а не переглянуті записи чи підтвердження завершення.',
    ],
  },
];

function artifacts(id, t) {
  const prefix = ROOT + id + '/';
  const fields = [
    [
      'protocol',
      'protocol',
      'protocol.synthetic.md',
      ['Synthetic case protocol', 'Синтетичний протокол випадку'],
      true,
    ],
    [
      'application',
      'log',
      'application.synthetic.log',
      [
        'Synthetic application log stream',
        'Синтетичний потік журналу програми',
      ],
      true,
    ],
    [
      'observer',
      'log',
      'observer.synthetic.log',
      [
        'Synthetic observer log stream',
        'Синтетичний потік журналу спостерігача',
      ],
      true,
    ],
    [
      'dataset',
      'dataset',
      'dataset.synthetic.csv',
      ['Synthetic evidence index dataset', 'Синтетичний набір індексу доказів'],
      true,
    ],
    [
      'camera-front',
      'video',
      'video/camera-front.placeholder.mp4',
      [
        'Front camera reference — recording absent',
        'Посилання передньої камери — запис відсутній',
      ],
      false,
    ],
    [
      'camera-side',
      'video',
      'video/camera-side.placeholder.mp4',
      [
        'Side camera reference — recording absent',
        'Посилання бічної камери — запис відсутній',
      ],
      false,
    ],
    [
      'overview',
      'image',
      'images/overview.placeholder.jpg',
      [
        'Overview image reference — image absent',
        'Посилання оглядового фото — фото відсутнє',
      ],
      false,
    ],
  ];
  return fields.map(([suffix, kind, path, title, required]) => ({
    id: 'example-artifact-' + id + '-' + suffix,
    title: t(...title),
    kind,
    path: prefix + path,
    sha256: null,
    required,
    notes: required
      ? t(
          'Supplied synthetic text fixture; not a real test record.',
          'Наданий синтетичний текстовий приклад; не є реальним записом випробування.',
        )
      : t(
          'Optional absent placeholder. No media file or reviewed recording is supplied.',
          'Необов’язкова відсутня заглушка. Медіафайл чи переглянутий запис не надаються.',
        ),
  }));
}

export function addVerificationRuns(project, ctx) {
  project.extensions['org.openeskd.verification'] = {
    version: 1,
    runs: cases.map((entry) => ({
      id: 'example-verification-' + entry.id,
      name: 'SYNTHETIC · ' + ctx.t(...entry.name),
      testCase: entry.testCase,
      procedurePath: PROCEDURE,
      performedAt: entry.performedAt,
      operator: ctx.t(
        'Training verification reviewer',
        'Навчальний рецензент перевірки',
      ),
      componentId: entry.componentId,
      commitId: entry.batch
        ? IDS.baseline
        : entry.alternative
          ? 'example-commit-ground-variant'
          : IDS.replacement,
      branch: entry.alternative ? 'ground/rugged-station' : 'main',
      batchId: entry.batch ? IDS.batch : null,
      operationId: entry.operationId,
      retestOf: entry.retestOf
        ? 'example-verification-' + entry.retestOf
        : null,
      outcome: entry.outcome,
      summary:
        ctx.t('SYNTHETIC TRAINING ONLY. ', 'ЛИШЕ СИНТЕТИЧНЕ НАВЧАННЯ. ') +
        ctx.t(...entry.summary),
      artifacts: artifacts(entry.id, ctx.t),
    })),
  };
  return project;
}
