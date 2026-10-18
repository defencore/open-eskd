export function addTracker(ctx) {
  const { add, document, route, assemble, facilities: f } = ctx;
  add(
    {
      id: 'antenna-tracker',
      parentId: 'system',
      designation: 'ATL.500.000',
      type: 'assembly',
      manufacturer: f.mechanical,
    },
    ['Antenna positioning tracker', 'Поворотний механізм антени'],
    [
      'Mechanical, electrical and software configuration register. Only stationary synthetic bench checks are represented; motion commands and pointing algorithms are not supplied.',
      'Реєстр механічної, електричної та програмної конфігурації. Представлені лише стаціонарні синтетичні стендові перевірки; команди руху й алгоритми наведення не надаються.',
    ],
  );
  document(
    'antenna-tracker',
    'assembly',
    'hardware/tracker/ATL.500.000_A_assembly.pdf',
    'assemblyDrawing',
  );
  document(
    'antenna-tracker',
    'interface',
    'hardware/tracker/ATL.500.000_A_electrical-interface.pdf',
    'schematic',
  );
  add(
    {
      id: 'tracker-bracket',
      parentId: 'antenna-tracker',
      designation: 'ATL.510.010',
      type: 'part',
      quantity: 2,
      material: 'Sheet grade defined by the controlled drawing',
      manufacturer: f.mechanical,
    },
    ['Tracker mounting bracket', 'Монтажний кронштейн трекера'],
    [
      'Two brackets per tracker. The MVP ledger retains one rejected preparation and an accepted replacement, without erasing the rejected record.',
      'Два кронштейни на трекер. У MVP-журналі збережено один брак підготовки та прийняту заміну без видалення запису про брак.',
    ],
  );
  document(
    'tracker-bracket',
    'drawing',
    'hardware/tracker/ATL.510.010_A_bracket.pdf',
    'drawing',
  );
  route(
    'tracker-bracket',
    'laserCutting',
    ['prepare', 'laserCutting', 'inspect'],
    {
      documents: ['tracker-bracket-drawing'],
      stock:
        'Blank specification remains in the controlled drawing; example dimensions are intentionally absent.',
    },
  );
  for (const [id, designation, name] of [
    [
      'tracker-drive',
      'SUP.510.020',
      ['Procured positioning drive', 'Придбаний поворотний привід'],
    ],
    [
      'tracker-controller',
      'SUP.510.030',
      ['Supplier tracker controller', 'Контролер трекера постачальника'],
    ],
  ]) {
    add(
      {
        id,
        parentId: 'antenna-tracker',
        designation,
        type: 'purchased',
        manufacturer: f.supplier,
      },
      name,
    );
    document(
      id,
      'interface',
      `suppliers/tracker/${designation}_A_interface.pdf`,
      'specification',
    );
    route(id, 'purchase', ['purchase', 'inspect'], {
      documents: [id + '-interface'],
    });
  }
  add(
    {
      id: 'tracker-software',
      parentId: 'antenna-tracker',
      designation: 'SW.510.040',
      type: 'set',
      manufacturer: f.software,
    },
    [
      'Tracker release and compatibility set',
      'Комплект випуску й сумісності ПЗ трекера',
    ],
  );
  document(
    'tracker-software',
    'release',
    'software/tracker/0.4.0/release-manifest.json',
    'specification',
  );
  document(
    'tracker-software',
    'tests',
    'verification/tracker/stationary-interface-test-plan.md',
    'test',
  );
  route('tracker-software', 'other', ['prepare', 'inspect', 'test'], {
    documents: ['tracker-software-release', 'tracker-software-tests'],
  });
  assemble('antenna-tracker', [
    'antenna-tracker-assembly',
    'antenna-tracker-interface',
  ]);
}
