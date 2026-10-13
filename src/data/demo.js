import * as C from '../domain/index.js';
export async function demoProject() {
  const p = C.createProject({
    name: 'Vector · Control system',
    designation: 'VCT.010.000',
    description:
      'Modular industrial control unit. Mechanical enclosure, power electronics and field interfaces.',
    owner: 'Olena Kovalenko',
  });
  const s = C.working(p);
  const make = (
    id,
    parentId,
    name,
    designation,
    type,
    quantity,
    status,
    manufacturer,
    material = '',
    owner = 'Olena Kovalenko',
    process = '',
  ) =>
    C.component({
      id,
      parentId,
      name,
      designation,
      type,
      quantity,
      status,
      manufacturer,
      material,
      owner,
      process,
      revision: 'A',
      unit: 'pcs',
      notes: '',
    });
  s.components = [
    make(
      'system',
      null,
      'Control unit',
      'VCT.010.000',
      'assembly',
      1,
      'review',
      'Final assembly · Kyiv',
      '',
      'Olena Kovalenko',
      'Assembly and functional testing',
    ),
    make(
      'enclosure',
      'system',
      'Enclosure assembly',
      'VCT.010.100',
      'assembly',
      1,
      'released',
      'Mechanical workshop · Lviv',
      'Aluminium 6061',
      'Andrii Melnyk',
      'Mechanical assembly',
    ),
    make(
      'body',
      'enclosure',
      'Enclosure body',
      'VCT.010.101',
      'part',
      1,
      'released',
      'Mechanical workshop · Lviv',
      'Aluminium 6061-T6',
      'Andrii Melnyk',
      'CNC milling · anodizing',
    ),
    make(
      'cover',
      'enclosure',
      'Top cover',
      'VCT.010.102',
      'part',
      1,
      'review',
      'Mechanical workshop · Lviv',
      'Aluminium 5052',
      'Andrii Melnyk',
      'Laser cutting · bending',
    ),
    make(
      'screw',
      'enclosure',
      'M3 × 10 socket screw',
      'ISO4762.M3x10',
      'standard',
      8,
      'released',
      'Fastener supplier',
      'Stainless steel A2',
      'Andrii Melnyk',
      'Purchase',
    ),
    make(
      'power',
      'system',
      'Power stage',
      'VCT.010.200',
      'assembly',
      1,
      'review',
      'Electronics lab · Kyiv',
      '',
      'Olena Kovalenko',
      'PCB assembly · electrical testing',
    ),
    make(
      'pcb',
      'power',
      'Power board',
      'VCT.010.201',
      'part',
      1,
      'released',
      'PCB manufacturer · Dnipro',
      'FR-4, 1.6 mm',
      'Olena Kovalenko',
      '4-layer PCB fabrication',
    ),
    make(
      'heatsink',
      'power',
      'Heat sink',
      'VCT.010.202',
      'part',
      2,
      'draft',
      '',
      'Aluminium 6063',
      'Andrii Melnyk',
      'Extrusion · cutting',
    ),
    make(
      'mosfet',
      'power',
      'Power MOSFET',
      'IRF3205',
      'purchased',
      4,
      'released',
      'Electronic components supplier',
      '',
      'Olena Kovalenko',
      'Purchase',
    ),
    make(
      'interface',
      'system',
      'Field interface board',
      'VCT.010.300',
      'purchased',
      1,
      'released',
      'Electronics lab · Kyiv',
      '',
      'Olena Kovalenko',
      'Purchase · incoming inspection',
    ),
    make(
      'connector',
      'system',
      'Panel connector, 8 pin',
      'CON.M12.8',
      'purchased',
      2,
      'released',
      'Connector supplier',
      '',
      'Olena Kovalenko',
      'Purchase',
    ),
    make(
      'gasket',
      'enclosure',
      'Seal gasket',
      'VCT.010.103',
      'part',
      1,
      'draft',
      'Mechanical workshop · Lviv',
      'Silicone, 2 mm',
      'Andrii Melnyk',
      'Die cutting',
    ),
  ];
  const files = [
    { name: 'VCT.010.101_body.pdf', componentId: 'body', kind: 'drawing' },
    {
      name: 'VCT.010.100_assembly.pdf',
      componentId: 'enclosure',
      kind: 'assemblyDrawing',
    },
    {
      name: 'VCT.010.201_fabrication.pdf',
      componentId: 'pcb',
      kind: 'drawing',
    },
    { name: 'functional-test.md', componentId: 'system', kind: 'test' },
    { name: 'project-notes.md', componentId: null, kind: 'instructions' },
  ];
  for (const file of files) {
    s.documents.push({
      id: C.uid(),
      name: file.name,
      path: C.suggestedPath(
        s.components.find((c) => c.id === file.componentId),
        file.kind,
      ),
      componentId: file.componentId,
      kind: file.kind,
      revision: 'A',
      sha256: null,
      required: true,
    });
  }
  for (const c of s.components) {
    const technology =
      c.type === 'assembly'
        ? 'assembly'
        : c.id === 'body'
          ? 'milling'
          : c.id === 'cover'
            ? 'laserCutting'
            : ['standard', 'purchased'].includes(c.type)
              ? 'purchase'
              : '';
    if (!technology) continue;
    c.manufacturing = C.manufacturing({
      technology,
      stock:
        c.id === 'body'
          ? 'Aluminium blank; dimensions specified by the approved drawing.'
          : c.id === 'cover'
            ? 'Sheet stock; grade and thickness specified by the drawing.'
            : '',
      preparation:
        'Demonstration only. Verify approved documents, material and required child components before production.',
      steps: C.routeTemplate(technology).map((step) => ({
        ...step,
        instructions:
          'Demonstration only. Perform the operation according to the approved process document.',
        facility: c.manufacturer,
        check: 'Record the result against the approved inspection criteria.',
      })),
    });
  }
  C.commit(p, {
    author: 'Olena Kovalenko',
    message: 'Initial product structure and engineering documentation',
    version: '0.2.0',
    status: 'draft',
  });
  C.createBranch(p, 'mechanical/alternative');
  C.working(p).components.find((c) => c.id === 'body').material =
    'Aluminium 6082-T6';
  C.working(p).components.find((c) => c.id === 'cover').status = 'released';
  C.commit(p, {
    author: 'Andrii Melnyk',
    message: 'Alternative enclosure alloy and top cover review',
    version: '0.2.1-mechanical',
    status: 'review',
  });
  p.activeBranch = 'main';
  C.working(p).components.find((c) => c.id === 'pcb').notes =
    'Fabrication files reviewed. Verify solder mask and copper weight with supplier.';
  C.commit(p, {
    author: 'Olena Kovalenko',
    message: 'Reviewed power board fabrication requirements',
    version: '0.3.0',
    status: 'review',
  });
  return p;
}
