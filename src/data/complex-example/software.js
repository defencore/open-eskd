export function addSoftware(ctx) {
  const { add, document, route, assemble, facilities: f, t } = ctx;
  add(
    {
      id: 'flight-software',
      parentId: 'avionics',
      designation: 'ATL.140.000',
      type: 'set',
      manufacturer: f.software,
    },
    [
      'Aircraft software configuration set',
      'Комплект конфігурації бортового ПЗ',
    ],
    [
      'Release references, bill of software materials and bench test evidence only. No autopilot source, flight-control algorithm or operational configuration is included.',
      'Лише посилання на випуски, склад програмних залежностей та докази стендової перевірки. Код автопілота, алгоритми керування польотом і робоча конфігурація не включені.',
    ],
  );
  document(
    'flight-software',
    'manifest',
    'software/aircraft/1.2.0/release-manifest.json',
    'specification',
  );
  document(
    'flight-software',
    'sbom',
    'software/aircraft/1.2.0/sbom.spdx.json',
    'other',
  );
  document(
    'flight-software',
    'configuration',
    'software/aircraft/1.2.0/configuration-index.md',
    'instructions',
  );
  for (const [id, designation, name, path] of [
    [
      'firmware-release',
      'SW.140.010',
      [
        'Supplier firmware release 1.2.0',
        'Випуск прошивки постачальника 1.2.0',
      ],
      'software/aircraft/1.2.0/supplier-firmware.bin',
    ],
    [
      'payload-software',
      'SW.140.020',
      ['Inspection payload application 0.8.0', 'Інспекційна програма 0.8.0'],
      'software/payload/0.8.0/source-reference.zip',
    ],
  ]) {
    add(
      {
        id,
        parentId: 'flight-software',
        designation,
        type: 'set',
        manufacturer: f.software,
      },
      name,
      [
        'Logical software item: identify the release, dependencies, build provenance and compatibility. Its unit quantity means one configured release, not manufactured hardware.',
        'Логічний програмний елемент: випуск, залежності, походження збірки та сумісність. Одиниця кількості означає налаштований випуск, а не виготовлену апаратуру.',
      ],
    );
    document(id, 'artifact', path, 'other');
    document(
      id,
      'tests',
      `verification/software/${id}_A_bench-test-plan.md`,
      'test',
    );
    route(
      id,
      'other',
      [
        {
          operation: 'prepare',
          instructions: t(
            'Identify the release and its compatibility record; do not load software onto operational equipment from this example.',
            'Ідентифікуйте випуск і запис сумісності; не завантажуйте ПЗ на робоче обладнання за цим прикладом.',
          ),
        },
        {
          operation: 'inspect',
          check: t(
            'Compare the release manifest, dependency inventory and provenance references.',
            'Зіставте маніфест випуску, перелік залежностей та посилання на походження.',
          ),
        },
        {
          operation: 'test',
          check: t(
            'Record synthetic bench replay outcomes against the linked test plan; real acceptance remains outstanding.',
            'Запишіть результати синтетичного стендового відтворення за планом; реальне приймання залишається відкритим.',
          ),
        },
      ],
      { documents: [id + '-artifact', id + '-tests'] },
    );
  }
  assemble('flight-software', [
    'flight-software-manifest',
    'flight-software-configuration',
  ]);
}
