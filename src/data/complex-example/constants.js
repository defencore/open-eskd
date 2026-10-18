export const EXAMPLE_DATE = '2026-01-15T09:00:00.000Z';
export const EXAMPLE_NAMESPACE = 'org.openeskd.example';
export const SUPPLIED_EXAMPLE_PATHS = Object.freeze([
  'verification/requirements-verification-matrix.csv',
  'verification/system-bench-test-plan.md',
  'verification/changes/CHG-002_telemetry-adapter-substitution.md',
  'verification/evidence/SIM-001/dataset-manifest.json',
  'verification/evidence/SIM-001/telemetry.synthetic.csv',
  'verification/evidence/SIM-001/console-replay.synthetic.log',
  'verification/evidence/SIM-001/ground-replay.synthetic.log',
  'verification/evidence/SIM-001/battery-identity.synthetic.csv',
  'verification/evidence/SIM-001/evidence-index.md',
  'verification/evidence/SIM-001/bracket-inspection.synthetic.csv',
  'verification/evidence/SIM-001/communications-bench.synthetic.log',
]);
export const COMPLEX_EXAMPLE_IDS = Object.freeze({
  project: 'inspection-complex-example',
  system: 'system',
  aircraft: 'aircraft',
  airframe: 'airframe',
  avionics: 'avionics',
  software: 'flight-software',
  console: 'control-console',
  ground: 'ground-station',
  communications: 'communications',
  telemetry: 'telemetry-module',
  tracker: 'antenna-tracker',
  power: 'power-service',
  launch: 'launch-assist',
  recovery: 'recovery',
  verification: 'verification',
  catalogA: 'example-telemetry-revision-a',
  catalogB: 'example-telemetry-revision-b',
  baseline: 'example-commit-mvp-a',
  replacement: 'example-commit-replacement-b',
  batch: 'example-batch-mvp-001',
});

export const COMPLEX_EXAMPLE_SECTIONS = Object.freeze(
  [
    ['overview', 'system', 'Overview'],
    ['aircraft', 'aircraft', 'Aircraft'],
    ['software', 'flight-software', 'Software'],
    ['ground', 'ground-station', 'Ground'],
    ['communications', 'communications', 'Communications'],
    ['tracker', 'antenna-tracker', 'Tracker'],
    ['power', 'power-service', 'Power'],
    ['suppliers', 'launch-assist', 'Suppliers'],
    ['verification', 'verification', 'Verification'],
    ['replacement', 'telemetry-module', 'Replacement'],
  ].map(([id, componentId, suffix]) =>
    Object.freeze({
      id,
      componentId,
      titleKey: 'exampleSection' + suffix,
      descriptionKey: 'exampleSection' + suffix + 'Description',
    }),
  ),
);
