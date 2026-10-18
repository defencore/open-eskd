export function addCommunications(ctx) {
  const { add, document, route, assemble, facilities: f } = ctx;
  add(
    {
      id: 'communications',
      parentId: 'system',
      designation: 'ATL.400.000',
      type: 'assembly',
      manufacturer: f.electronics,
    },
    ['Civilian communications subsystem', 'Система цивільного зв’язку'],
    [
      'Track supplier compatibility, harness identities and bench interface checks. No radio frequencies, link-budget design or operating settings are supplied.',
      'Облік сумісності постачальників, ідентифікації джгутів та стендових перевірок інтерфейсів. Радіочастоти, розрахунок каналу й робочі налаштування не надаються.',
    ],
  );
  document(
    'communications',
    'interface',
    'hardware/communications/ATL.400.000_A_interface-matrix.md',
    'specification',
  );
  document(
    'communications',
    'test-plan',
    'verification/communications/ATL.400.000_A_bench-plan.md',
    'test',
  );
  for (const [id, designation, name] of [
    [
      'telemetry-module',
      'SUP.410.010',
      ['Supplier telemetry module', 'Телеметричний модуль постачальника'],
    ],
    [
      'radio-antenna',
      'SUP.410.020',
      ['Procured communications antenna', 'Придбана антена зв’язку'],
    ],
    [
      'communications-harness',
      'SUP.410.030',
      ['Supplier communications harness', 'Джгут зв’язку постачальника'],
    ],
  ]) {
    add(
      {
        id,
        parentId: 'communications',
        designation,
        type: 'purchased',
        manufacturer: f.supplier,
      },
      name,
      id === 'telemetry-module'
        ? [
            'Revision A uses supplier adapter A. Revision B documents a reviewed supplier adapter substitution; examine catalog ancestry and the frozen MVP A batch.',
            'Ревізія A використовує адаптер постачальника A. Ревізія B документує перевірку заміни адаптера; дивіться походження каталогу та зафіксовану MVP-партію A.',
          ]
        : undefined,
    );
    document(
      id,
      'interface',
      `suppliers/communications/${designation}_A_interface.pdf`,
      'specification',
    );
    route(id, 'purchase', ['purchase', 'inspect'], {
      documents: [id + '-interface'],
    });
  }
  assemble('communications', [
    'communications-interface',
    'communications-test-plan',
  ]);
}
