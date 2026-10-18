import * as C from '../../domain/index.js';

export function addVerification(ctx) {
  const { add, document, route, facilities: f, t, componentById } = ctx;
  add(
    {
      id: 'verification',
      parentId: 'system',
      designation: 'ATL.900.000',
      type: 'set',
      manufacturer: f.metrology,
    },
    [
      'Verification plans and evidence package',
      'Комплект планів перевірки й доказів',
    ],
    [
      'Trace requirements to procedures, selected hardware/software revisions and evidence paths. Every result in this example is synthetic; missing media paths are optional references, not proof of a real trial.',
      'Зв’язок вимог із процедурами, обраними ревізіями апаратури й ПЗ та шляхами доказів. Усі результати синтетичні; відсутні медіафайли — необов’язкові посилання, а не підтвердження реального випробування.',
    ],
  );
  document(
    'verification',
    'matrix',
    'verification/requirements-verification-matrix.csv',
    'specification',
  );
  document(
    'verification',
    'plan',
    'verification/system-bench-test-plan.md',
    'test',
  );
  document(
    'verification',
    'change-review',
    'verification/changes/CHG-002_telemetry-adapter-substitution.md',
    'instructions',
  );

  add(
    {
      id: 'bench-fixture',
      parentId: 'verification',
      designation: 'SUP.910.010',
      type: 'purchased',
      manufacturer: f.supplier,
    },
    [
      'Supplier bench interface fixture',
      'Стендовий інтерфейсний пристрій постачальника',
    ],
  );
  document(
    'bench-fixture',
    'identity',
    'verification/fixtures/bench-fixture-identity.md',
    'specification',
  );
  route('bench-fixture', 'purchase', ['purchase', 'inspect'], {
    documents: ['bench-fixture-identity'],
  });

  add(
    {
      id: 'replay-dataset',
      parentId: 'verification',
      designation: 'DATA.910.020',
      type: 'set',
      manufacturer: f.software,
    },
    [
      'Synthetic bench replay dataset',
      'Синтетичний набір стендового відтворення',
    ],
  );
  document(
    'replay-dataset',
    'manifest',
    'verification/evidence/SIM-001/dataset-manifest.json',
    'test',
    { required: false },
  );
  document(
    'replay-dataset',
    'telemetry',
    'verification/evidence/SIM-001/telemetry.synthetic.csv',
    'test',
    { required: false },
  );
  document(
    'replay-dataset',
    'console',
    'verification/evidence/SIM-001/console-replay.synthetic.log',
    'test',
    { required: false },
  );
  route('replay-dataset', 'other', ['prepare', 'inspect'], {
    documents: ['replay-dataset-manifest'],
  });

  add(
    {
      id: 'evidence-index',
      parentId: 'verification',
      designation: 'DOC.910.030',
      type: 'set',
      manufacturer: f.metrology,
    },
    [
      'Synthetic inspection, log and video index',
      'Індекс синтетичних оглядів, логів і відео',
    ],
    [
      'The log and CSV fixtures are supplied separately in the repository example folder. MP4 files are deliberately absent placeholders: register a real recording only after a controlled trial. No generated media is passed off as actual evidence.',
      'Приклади логів і CSV надаються окремо в папці прикладу репозиторію. MP4 навмисно відсутні: реєструйте справжній запис лише після контрольованої перевірки. Згенеровані матеріали не видаються за реальні докази.',
    ],
  );
  document(
    'evidence-index',
    'index',
    'verification/evidence/SIM-001/evidence-index.md',
    'test',
    { required: false },
  );
  document(
    'evidence-index',
    'inspection',
    'verification/evidence/SIM-001/bracket-inspection.synthetic.csv',
    'test',
    { required: false },
  );
  document(
    'evidence-index',
    'communications',
    'verification/evidence/SIM-001/communications-bench.synthetic.log',
    'test',
    { required: false },
  );
  document(
    'evidence-index',
    'video-bench',
    'verification/evidence/SIM-001/video/bench-interface.placeholder.mp4',
    'other',
    { required: false },
  );
  document(
    'evidence-index',
    'video-inspection',
    'verification/evidence/SIM-001/video/bracket-inspection.placeholder.mp4',
    'other',
    { required: false },
  );
  document(
    'evidence-index',
    'photo',
    'verification/evidence/SIM-001/images/bench-overview.placeholder.jpg',
    'image',
    { required: false },
  );
  route(
    'evidence-index',
    'other',
    [
      {
        operation: 'inspect',
        instructions: t(
          'Check the index labels and distinguish supplied synthetic text fixtures from absent video placeholders; do not mark missing recordings as reviewed.',
          'Перевірте позначки індексу та відрізніть надані синтетичні текстові приклади від відсутніх відеозаглушок; не відмічайте відсутні записи як переглянуті.',
        ),
      },
    ],
    { documents: ['evidence-index-index'] },
  );

  const dependencies = [
    'communications',
    'ground-software',
    'firmware-release',
    'tracker-software',
  ].map((id) => {
    const component = componentById.get(id);
    return C.operationReference(
      component,
      component.manufacturing.steps.at(-1),
    );
  });
  route(
    'verification',
    'other',
    [
      'prepare',
      {
        operation: 'test',
        dependsOn: dependencies,
        componentInputs: [
          'bench-fixture',
          'replay-dataset',
          'evidence-index',
        ].map((id) => C.inputReference(componentById.get(id))),
        instructions: t(
          'Review the synthetic bench integration case against the requirements matrix and the exact software/hardware revisions. No flight or launcher operation belongs to this example.',
          'Перевірте синтетичний стендовий інтеграційний приклад за матрицею вимог і точними ревізіями ПЗ та апаратури. Польоти чи запуск не входять до цього прикладу.',
        ),
        check: t(
          'Keep unresolved requirements open. Synthetic demonstration results cannot release or qualify the real product.',
          'Залиште невирішені вимоги відкритими. Синтетичні навчальні результати не випускають і не кваліфікують реальний виріб.',
        ),
      },
      'inspect',
    ],
    { documents: ['verification-matrix', 'verification-plan'] },
  );
}
