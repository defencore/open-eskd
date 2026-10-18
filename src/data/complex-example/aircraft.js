import { addSoftware } from './software.js';

export function addAircraft(ctx) {
  const { add, document, route, assemble, facilities: f, t } = ctx;
  add(
    {
      id: 'aircraft',
      parentId: 'system',
      designation: 'ATL.100.000',
      type: 'assembly',
    },
    ['Civilian inspection aircraft', 'Цивільний інспекційний БПЛА'],
    [
      'Product breakdown only: airframe, procured propulsion, avionics and software configuration. No geometry, flight parameters or operating procedure is supplied.',
      'Лише структура виробу: планер, придбана силова установка, авіоніка та конфігурація ПЗ. Геометрія, параметри польоту й експлуатаційні процедури не надаються.',
    ],
  );
  document(
    'aircraft',
    'interfaces',
    'hardware/aircraft/ATL.100.000_A_interface-register.md',
    'specification',
  );
  add(
    {
      id: 'airframe',
      parentId: 'aircraft',
      designation: 'ATL.110.000',
      type: 'assembly',
      manufacturer: f.mechanical,
    },
    ['Airframe configuration', 'Конфігурація планера'],
  );
  document(
    'airframe',
    'assembly',
    'hardware/airframe/ATL.110.000_A_assembly.pdf',
    'assemblyDrawing',
  );
  for (const [
    id,
    designation,
    name,
    material,
    technology,
    operations,
    quantity,
  ] of [
    [
      'airframe-shell',
      'ATL.110.010',
      ['Supplier airframe shell', 'Корпус планера від постачальника'],
      '',
      'purchase',
      ['purchase', 'inspect'],
      1,
    ],
    [
      'camera-bracket',
      'ATL.110.020',
      ['Inspection camera bracket', 'Кронштейн інспекційної камери'],
      'Grade specified in controlled drawing',
      'printing3d',
      ['prepare', 'printing3d', 'inspect'],
      1,
    ],
    [
      'service-cover',
      'ATL.110.030',
      ['Service access cover', 'Сервісна кришка'],
      'Grade specified in controlled drawing',
      'sheetMetal',
      ['prepare', 'cutStock', 'bending', 'inspect'],
      2,
    ],
    [
      'cover-fasteners',
      'STD.110.040',
      ['Service cover fastener set', 'Комплект кріплень сервісної кришки'],
      '',
      'purchase',
      ['purchase', 'inspect'],
      8,
    ],
  ]) {
    add(
      {
        id,
        parentId: 'airframe',
        designation,
        type: technology === 'purchase' ? 'purchased' : 'part',
        material,
        quantity,
        manufacturer: technology === 'purchase' ? f.supplier : f.mechanical,
      },
      name,
    );
    const doc = document(
      id,
      'control',
      `hardware/airframe/${designation}_A_${id}.${technology === 'purchase' ? 'md' : 'pdf'}`,
      technology === 'purchase' ? 'specification' : 'drawing',
    );
    route(id, technology, operations, {
      documents: [doc.id],
      stock:
        technology === 'purchase'
          ? ''
          : t(
              'Material and blank defined by the controlled drawing; no dimensions supplied in this example.',
              'Матеріал і заготовка визначаються контрольованим кресленням; приклад не містить розмірів.',
            ),
    });
  }
  assemble('airframe', ['airframe-assembly']);

  add(
    {
      id: 'propulsion',
      parentId: 'aircraft',
      designation: 'ATL.120.000',
      type: 'assembly',
      manufacturer: f.supplier,
    },
    ['Procured propulsion package', 'Придбаний комплект силової установки'],
    [
      'Supplier-controlled black box. Track serial identity and interface documentation only; no sizing, tuning or operating instructions.',
      'Чорна скринька під контролем постачальника. Облік серійної ідентифікації та інтерфейсних документів; без розрахунків, налаштувань чи інструкцій експлуатації.',
    ],
  );
  document(
    'propulsion',
    'supplier',
    'suppliers/propulsion/ATL.120.000_A_supplier-interface.pdf',
    'specification',
  );
  for (const [id, designation, name] of [
    [
      'propulsion-unit',
      'SUP.120.010',
      ['Supplier propulsion unit', 'Силовий модуль постачальника'],
    ],
    [
      'propulsion-controller',
      'SUP.120.020',
      ['Supplier motor controller', 'Контролер двигуна постачальника'],
    ],
  ]) {
    add(
      {
        id,
        parentId: 'propulsion',
        designation,
        type: 'purchased',
        manufacturer: f.supplier,
      },
      name,
    );
    route(id, 'purchase', ['purchase', 'inspect']);
  }
  assemble('propulsion', ['propulsion-supplier']);

  add(
    {
      id: 'avionics',
      parentId: 'aircraft',
      designation: 'ATL.130.000',
      type: 'assembly',
      manufacturer: f.electronics,
    },
    ['Avionics and payload', 'Авіоніка та інспекційне обладнання'],
  );
  document(
    'avionics',
    'schematic',
    'hardware/avionics/ATL.130.000_A_interconnect.pdf',
    'schematic',
  );
  for (const [id, designation, name] of [
    [
      'autopilot',
      'SUP.130.010',
      ['Procured autopilot module', 'Придбаний модуль автопілота'],
    ],
    [
      'inspection-camera',
      'SUP.130.020',
      ['Civilian inspection camera', 'Камера цивільної інспекції'],
    ],
    [
      'navigation-receiver',
      'SUP.130.030',
      ['Supplier navigation receiver', 'Навігаційний приймач постачальника'],
    ],
  ]) {
    add(
      {
        id,
        parentId: 'avionics',
        designation,
        type: 'purchased',
        manufacturer: f.supplier,
      },
      name,
    );
    document(
      id,
      'supplier',
      `suppliers/avionics/${designation}_A_interface.pdf`,
      'specification',
    );
    route(id, 'purchase', ['purchase', 'inspect'], {
      documents: [id + '-supplier'],
    });
  }
  add(
    {
      id: 'avionics-carrier',
      parentId: 'avionics',
      designation: 'ATL.130.040',
      type: 'part',
      manufacturer: f.electronics,
      material: 'PCB material defined by the fabrication specification',
    },
    ['Avionics interface carrier board', 'Інтерфейсна плата авіоніки'],
  );
  document(
    'avionics-carrier',
    'schematic',
    'hardware/avionics/ATL.130.040_A_schematic.pdf',
    'schematic',
  );
  document(
    'avionics-carrier',
    'fabrication',
    'hardware/avionics/ATL.130.040_A_fabrication.zip',
    'other',
  );
  document(
    'avionics-carrier',
    'board',
    'hardware/avionics/ATL.130.040_A_board.step',
    'model',
  );
  route('avionics-carrier', 'other', ['prepare', 'other', 'inspect', 'test'], {
    documents: ['avionics-carrier-schematic', 'avionics-carrier-fabrication'],
  });

  addSoftware(ctx);
  assemble('avionics', ['avionics-schematic']);
  assemble('aircraft', ['aircraft-interfaces']);
}
