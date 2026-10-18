export default {
  production: 'Production',
  productionSubtitle: 'Frozen work orders and production results',
  newBatch: 'Issue a batch / MVP',
  productionHint:
    'Issue a work order from the current configuration, distribute instructions by facility, and record accepted/rejected quantities per operation. The batch retains its original routes after project edits.',
  productionBatch: 'Batch',
  noBatches: 'No work orders yet',
  noBatchesText: 'Define routes, then issue a prototype or series batch.',
  batchName: 'Batch / work order name',
  batchMode: 'Production mode',
  prototype: 'Prototype / MVP',
  series: 'Series',
  batchQuantity: 'Project units to produce',
  batchAuthor: 'Issued by',
  issueBatch: 'Issue work order',
  batchFrozenHint:
    'The current structure, file revisions and routes will be frozen in this batch. Quantities multiply the project BOM. Later edits do not update existing work orders.',
  batchSnapshotHint:
    'This batch retains the structure, file revisions and routes captured when it was issued. Quantities multiply that configuration. Later project edits do not update this work order.',
  operationsRecorded: 'operations accounted for',
  batchReport: 'Batch report',
  facilityWorkOrder: 'Facility work order',
  recordResult: 'Record result',
  acceptedQuantity: 'Accepted quantity',
  rejectedQuantity: 'Rejected quantity',
  resultOperator: 'Performed / inspected by',
  resultNotes: 'Inspection result / rejection reason',
  evidencePath: 'Inspection record path (optional)',
  operationComplete: 'Accounted for',
  waitingPrerequisites: 'Waiting for accepted prerequisites',
  resultHistory: 'Result records',
  remainingQuantity: 'Quantity remaining',
  checkNotDefined: 'Acceptance criteria have not been defined.',
  operation: 'Operation',
  guideBatchNameHelp:
    'Use a unique, readable production identifier. The record will contain a frozen configuration.',
  guideBatchNameRule:
    'Use the controlled project requirements and approved documentation.',
  guideBatchNameExample: 'MVP-001',
  guideBatchNameExample2: 'BATCH-2026-004',
  guideBatchNameExample3: 'Housing trial run',
  guideBatchModeHelp:
    'Prototype and series use the same operation tracking. Choose the purpose of this run.',
  guideBatchModeRule:
    'Use the controlled project requirements and approved documentation.',
  guideBatchModeExample: 'Prototype: fit check',
  guideBatchModeExample2: 'MVP: complete demonstrator',
  guideBatchModeExample3: 'Series: approved production run',
  guideBatchQuantityHelp:
    'Number of full project units. All component and operation quantities are multiplied by it.',
  guideBatchQuantityRule:
    'Use the controlled project requirements and approved documentation.',
  guideBatchQuantityExample: '1 product × 4 screws = 4 screws',
  guideBatchQuantityExample2: '10 products × 2 tubes = 20 tubes',
  guideBatchQuantityExample3: '3 standalone parts = 3 parts',
  guideBatchAuthorHelp:
    'Person issuing the work order. This remains with the batch.',
  guideBatchAuthorRule:
    'Use the controlled project requirements and approved documentation.',
  guideBatchAuthorExample: 'Project engineer',
  guideBatchAuthorExample2: 'Production planner',
  guideBatchAuthorExample3: 'Workshop supervisor',
  guideAcceptedHelp:
    'Add newly inspected conforming units. Do not include quantities already recorded. Downstream operations wait for the whole prerequisite batch to be accepted.',
  guideAcceptedRule:
    'Use the controlled project requirements and approved documentation.',
  guideAcceptedExample: '5 conforming tubes',
  guideAcceptedExample2: '1 accepted prototype',
  guideAcceptedExample3: '0 accepted / 2 rejected',
  guideRejectedHelp:
    'Add newly rejected units and explain the reason in the inspection notes. Accepted units cannot exceed the order. Rejected attempts remain recorded when a replacement or reworked unit is accepted.',
  guideRejectedRule:
    'Use the controlled project requirements and approved documentation.',
  guideRejectedExample: '1: hole outside tolerance',
  guideRejectedExample2: '2: failed visual inspection',
  guideRejectedExample3: '0: all units conform',
  guideOperatorHelp:
    'Identify the person performing or inspecting the operation.',
  guideOperatorRule:
    'Use the controlled project requirements and approved documentation.',
  guideOperatorExample: 'Machinist name',
  guideOperatorExample2: 'Assembly technician',
  guideOperatorExample3: 'Quality inspector',
  guideResultNotesHelp:
    'Record the acceptance evidence or the specific rejection reason. Results are append-only; they are exchanged with the project JSON.',
  guideResultNotesRule:
    'Use the controlled project requirements and approved documentation.',
  guideResultNotesExample: 'Dimensions checked against drawing B',
  guideResultNotesExample2: 'Fit check passed; inspection record attached',
  guideResultNotesExample3: 'Rejected: burrs remain at hole exit',
  guideEvidenceHelp:
    'Optional relative path to a measurement sheet, photograph or test protocol. It is linked from the exported batch report.',
  guideEvidenceRule:
    'Use the controlled project requirements and approved documentation.',
  guideEvidenceExample: 'reports/MVP-001/tube-check.pdf',
  guideEvidenceExample2: 'reports/MVP-001/fit-check.jpg',
  guideEvidenceExample3: 'reports/BATCH-004/test.csv',
  productionSearch: 'Find an operation, component or facility…',
  productionMore: 'Show more operations',
  operationInstruction: 'Instructions and prerequisites',
  productionQuantityError: 'Accepted quantity exceeds the work order target.',
  productionPrerequisiteError:
    'Accept the whole prerequisite batch before recording the next operation.',
  productionResultError:
    'Enter valid new quantities, an operator, and an inspection note for any rejection.',
  batchNameUsed: 'A batch with this name already exists.',
  productionNeedsOperations:
    'Define manufacturing or inspection operations before issuing a work order.',
  productionInputRouteMissing:
    'Before issuing the batch, add an inspection or manufacturing operation for this required input',
};
