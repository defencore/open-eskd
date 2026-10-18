import { addCommunications } from './communications.js';
import { addTracker } from './tracker.js';

export function addGround(ctx) {
  const { add, document, route, assemble, facilities: f } = ctx;
  add(
    {
      id: 'control-console',
      parentId: 'system',
      designation: 'ATL.200.000',
      type: 'assembly',
      manufacturer: f.electronics,
    },
    ['Operator control console', 'Пульт оператора'],
  );
  document(
    'control-console',
    'interface',
    'hardware/console/ATL.200.000_A_interface.pdf',
    'schematic',
  );
  for (const [id, designation, name, type, quantity] of [
    [
      'console-enclosure',
      'ATL.210.010',
      ['Console enclosure', 'Корпус пульта'],
      'part',
      1,
    ],
    [
      'console-display',
      'SUP.210.020',
      ['Procured console display', 'Придбаний дисплей пульта'],
      'purchased',
      1,
    ],
    [
      'console-controls',
      'SUP.210.030',
      ['Operator input module', 'Модуль органів керування'],
      'purchased',
      2,
    ],
    [
      'console-controller',
      'SUP.210.040',
      ['Console controller module', 'Контролер пульта'],
      'purchased',
      1,
    ],
  ]) {
    add(
      {
        id,
        parentId: 'control-console',
        designation,
        type,
        quantity,
        manufacturer: type === 'part' ? f.mechanical : f.supplier,
      },
      name,
    );
    document(
      id,
      'control',
      `hardware/console/${designation}_A_${id}.pdf`,
      type === 'part' ? 'drawing' : 'specification',
    );
    route(
      id,
      type === 'part' ? 'printing3d' : 'purchase',
      type === 'part'
        ? ['prepare', 'printing3d', 'inspect']
        : ['purchase', 'inspect'],
      { documents: [id + '-control'] },
    );
  }
  add(
    {
      id: 'console-software',
      parentId: 'control-console',
      designation: 'SW.210.050',
      type: 'set',
      manufacturer: f.software,
    },
    ['Console application release 0.9.0', 'Випуск програми пульта 0.9.0'],
  );
  document(
    'console-software',
    'release',
    'software/console/0.9.0/release-manifest.json',
    'specification',
  );
  document(
    'console-software',
    'tests',
    'verification/console/console-interface-test-plan.md',
    'test',
  );
  route('console-software', 'other', ['prepare', 'inspect', 'test'], {
    documents: ['console-software-release', 'console-software-tests'],
  });
  assemble('control-console', ['control-console-interface']);

  add(
    {
      id: 'ground-station',
      parentId: 'system',
      designation: 'ATL.300.000',
      type: 'assembly',
    },
    ['Ground monitoring station', 'Наземна станція моніторингу'],
  );
  document(
    'ground-station',
    'architecture',
    'infrastructure/ground/ATL.300.000_A_architecture.md',
    'specification',
  );
  for (const [id, designation, name] of [
    [
      'ground-computer',
      'SUP.310.010',
      ['Procured ground computer', 'Придбаний наземний комп’ютер'],
    ],
    [
      'network-switch',
      'SUP.310.020',
      ['Ground network switch', 'Мережевий комутатор станції'],
    ],
    [
      'evidence-storage',
      'SUP.310.030',
      ['Evidence archive storage', 'Накопичувач архіву доказів'],
    ],
  ]) {
    add(
      {
        id,
        parentId: 'ground-station',
        designation,
        type: 'purchased',
        manufacturer: f.supplier,
      },
      name,
    );
    document(
      id,
      'inventory',
      `infrastructure/ground/${designation}_A_inventory.md`,
      'specification',
    );
    route(id, 'purchase', ['purchase', 'inspect'], {
      documents: [id + '-inventory'],
    });
  }
  add(
    {
      id: 'ground-software',
      parentId: 'ground-station',
      designation: 'SW.310.040',
      type: 'set',
      manufacturer: f.software,
    },
    [
      'Monitoring and evidence software release 0.6.0',
      'Випуск ПЗ моніторингу й доказів 0.6.0',
    ],
  );
  document(
    'ground-software',
    'release',
    'software/ground/0.6.0/release-manifest.json',
    'specification',
  );
  document(
    'ground-software',
    'restore',
    'infrastructure/ground/offline-restore-and-access-plan.md',
    'instructions',
  );
  document(
    'ground-software',
    'logs',
    'verification/evidence/SIM-001/ground-replay.synthetic.log',
    'test',
    { required: false },
  );
  route('ground-software', 'other', ['prepare', 'inspect', 'test'], {
    documents: ['ground-software-release', 'ground-software-restore'],
  });
  assemble('ground-station', ['ground-station-architecture']);

  addCommunications(ctx);
  addTracker(ctx);
}
