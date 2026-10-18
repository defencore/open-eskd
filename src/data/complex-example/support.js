export function addSupport(ctx) {
  const { add, document, route, assemble, facilities: f } = ctx;
  add(
    {
      id: 'power-service',
      parentId: 'system',
      designation: 'ATL.600.000',
      type: 'assembly',
      manufacturer: f.power,
    },
    [
      'Battery charging and service infrastructure',
      'Інфраструктура заряджання й обслуговування акумуляторів',
    ],
    [
      'Track approved supplier batteries, chargers, adapter identities and service records. This example contains no charging parameters or battery handling procedure.',
      'Облік дозволених постачальником акумуляторів, зарядних пристроїв, адаптерів і сервісних записів. Приклад не містить параметрів заряджання чи процедур поводження з акумуляторами.',
    ],
  );
  document(
    'power-service',
    'compatibility',
    'infrastructure/power/ATL.600.000_A_compatibility-register.md',
    'specification',
  );
  document(
    'power-service',
    'service-plan',
    'infrastructure/power/ATL.600.000_A_supplier-service-index.md',
    'instructions',
  );
  for (const [id, designation, name, quantity] of [
    [
      'service-battery',
      'SUP.610.010',
      ['Supplier battery pack inventory', 'Парк акумуляторів постачальника'],
      4,
    ],
    [
      'battery-charger',
      'SUP.610.020',
      ['Procured battery charger', 'Придбаний зарядний пристрій'],
      2,
    ],
    [
      'charge-adapter',
      'SUP.610.030',
      [
        'Supplier-approved charging adapter',
        'Схвалений постачальником зарядний адаптер',
      ],
      4,
    ],
    [
      'battery-storage',
      'SUP.610.040',
      [
        'Supplier battery storage cabinet',
        'Шафа зберігання акумуляторів від постачальника',
      ],
      1,
    ],
  ]) {
    add(
      {
        id,
        parentId: 'power-service',
        designation,
        type: 'purchased',
        quantity,
        manufacturer: f.supplier,
      },
      name,
    );
    document(
      id,
      'supplier',
      `suppliers/power/${designation}_A_supplier-document-index.md`,
      'specification',
    );
    route(id, 'purchase', ['purchase', 'inspect'], {
      documents: [id + '-supplier'],
    });
  }
  add(
    {
      id: 'battery-service-records',
      parentId: 'power-service',
      designation: 'DOC.610.050',
      type: 'set',
      manufacturer: f.power,
    },
    [
      'Battery identity and service record set',
      'Комплект ідентифікації й сервісних записів акумуляторів',
    ],
  );
  document(
    'battery-service-records',
    'register',
    'infrastructure/power/battery-identity-and-service-register.csv',
    'other',
  );
  document(
    'battery-service-records',
    'example-log',
    'verification/evidence/SIM-001/battery-identity.synthetic.csv',
    'test',
    { required: false },
  );
  route('battery-service-records', 'other', ['prepare', 'inspect'], {
    documents: ['battery-service-records-register'],
  });
  assemble('power-service', [
    'power-service-compatibility',
    'power-service-service-plan',
  ]);

  add(
    {
      id: 'launch-assist',
      parentId: 'system',
      designation: 'ATL.700.000',
      type: 'assembly',
      manufacturer: f.supplier,
    },
    [
      'Procured launch-assist / catapult package',
      'Придбаний стартовий / катапультний комплект',
    ],
    [
      'Supplier-controlled black-box package. Only configuration, serial identity, custody and document completeness are represented. No launcher design, energy, sizing, setup or launch instruction is included.',
      'Придбаний комплект як чорна скринька. Лише конфігурація, серійна ідентифікація, відповідальне зберігання та повнота документів. Конструкція, енергія, розрахунки, налаштування та інструкції запуску не включені.',
    ],
  );
  document(
    'launch-assist',
    'supplier-index',
    'suppliers/launch-assist/ATL.700.000_A_supplier-document-index.md',
    'specification',
  );
  document(
    'launch-assist',
    'boundary',
    'suppliers/launch-assist/ATL.700.000_A_responsibility-boundary.md',
    'instructions',
  );
  for (const [id, designation, name] of [
    [
      'supplier-catapult',
      'SUP.710.010',
      ['Supplier launch-assist unit', 'Стартовий модуль постачальника'],
    ],
    [
      'launch-transport',
      'SUP.710.020',
      [
        'Supplier transport and custody kit',
        'Транспортно-обліковий комплект постачальника',
      ],
    ],
  ]) {
    add(
      {
        id,
        parentId: 'launch-assist',
        designation,
        type: 'purchased',
        manufacturer: f.supplier,
      },
      name,
    );
    route(id, 'purchase', ['purchase', 'inspect']);
  }
  route('launch-assist', 'purchase', ['prepare', 'inspect'], {
    documents: ['launch-assist-supplier-index', 'launch-assist-boundary'],
  });

  add(
    {
      id: 'recovery',
      parentId: 'aircraft',
      designation: 'ATL.800.000',
      type: 'assembly',
      manufacturer: f.supplier,
    },
    [
      'Procured parachute recovery package',
      'Придбаний комплект парашутної системи',
    ],
    [
      'Supplier-controlled black box. Record revision, service identity and supplier interface references. No sizing, deployment logic, packing or activation instructions are supplied.',
      'Чорна скринька постачальника. Облік ревізії, сервісної ідентифікації та посилань на інтерфейси. Розрахунки, логіка спрацювання, пакування чи інструкції активації не надаються.',
    ],
  );
  document(
    'recovery',
    'supplier-index',
    'suppliers/recovery/ATL.800.000_A_supplier-document-index.md',
    'specification',
  );
  document(
    'recovery',
    'service-status',
    'suppliers/recovery/ATL.800.000_A_service-status-register.csv',
    'other',
  );
  for (const [id, designation, name] of [
    [
      'parachute-module',
      'SUP.810.010',
      ['Supplier parachute module', 'Парашутний модуль постачальника'],
    ],
    [
      'recovery-interface',
      'SUP.810.020',
      [
        'Supplier recovery interface module',
        'Інтерфейсний модуль парашутної системи',
      ],
    ],
  ]) {
    add(
      {
        id,
        parentId: 'recovery',
        designation,
        type: 'purchased',
        manufacturer: f.supplier,
      },
      name,
    );
    route(id, 'purchase', ['purchase', 'inspect']);
  }
  route('recovery', 'purchase', ['prepare', 'inspect'], {
    documents: ['recovery-supplier-index', 'recovery-service-status'],
  });
  // Recovery is added after the aircraft builder, so rebuild the explicit input
  // list to include this supplier-controlled subsystem in final configuration.
  assemble('aircraft', ['aircraft-interfaces']);
}
