export default {
  structureSubtitle:
    'Add assemblies and parts. Select a row to view or edit its details.',
  basicInfo: 'Basic details',
  productionInfo: 'Manufacturing details',
  versionInfo: 'Revision & status',
  basicInfoHint:
    'Start with the component identity and quantity. Other details can be added later.',
  addAssembly: 'Add assembly',
  addChild: 'Add to this assembly',
  addAnother: 'Add & continue',
  add: 'Add',
  structureStart: 'Start with an assembly',
  structureStartText:
    'An assembly groups parts and other assemblies. For example, a control unit containing an enclosure and a board.',
  structureRootHint:
    'The main assembly is ready. Add its parts or nested assemblies.',
  structureHelp:
    'A part is a single item. An assembly can contain other components. Enter quantities per parent assembly.',
  selectedComponent: 'Selected component',
  selectedAssembly: 'Selected assembly',
  clearFilters: 'Clear filters',
  selectionHint:
    'Select a component in the table. Choose Edit to change its details.',
  itemLocation: 'Part of',
  componentCount: 'Components',
  showAll: 'Expand all',
  hideAll: 'Collapse all',
  bulkAdd: 'Paste a list',
  bulkTitle: 'Add a list of components',
  bulkHint:
    'Copy three columns from Excel: designation, name, quantity. You can also separate fields with semicolons. One row is one component.',
  bulkInput: 'Component list',
  bulkPlaceholder: 'PRJ.001.001; Enclosure; 1\nPRJ.001.002; Cover; 1',
  bulkDefaultType: 'Component type for this list',
  bulkPreview: 'Preview',
  bulkReady: 'Ready to add',
  bulkEmpty: 'Paste a list to check it before adding.',
  bulkLine: 'Row',
  bulk_columns: 'Use 2 or 3 columns: designation, name, quantity.',
  bulk_required: 'Enter designation and name (up to 200 characters).',
  bulk_duplicate: 'This designation is already in use',
  bulk_quantity: 'Quantity must be greater than zero.',
  bulk_limit: 'A project can contain up to 10,000 components.',
  bulkAdded: 'Components added from the list',
  duplicateDesignation: 'This designation is already in use. Choose another.',
  parentTypeError:
    'This component contains child items. It must remain an assembly, complex or set.',
  backToStructure: 'Back to structure',
  quantityRange:
    'The total quantity is too large. Reduce quantities in nested components.',
  provenance: 'Origin and verification',
  workflow: 'Project approach',
  extensions: 'Organizational annotations',
  basis: 'Information origin',
  confidence: 'Verification level',
  reference: 'Evidence reference',
  decomposeTask: 'Describe an existing product',
  decomposeTaskText:
    'Break a finished product into assemblies and parts. Record measurements, evidence and the work needed to reproduce it.',
  decomposeProject: 'Decompose a product',
  decompositionDescription:
    'Start with the complete product, add its assemblies, then the parts inside each assembly. Mark observed information and confirm it with measurements or documentation.',
  decompositionStructureHint:
    'Work from the product down to its assemblies and parts. Select a parent before adding an element. Record evidence in “Origin and verification”; unverified observations appear in readiness checks.',
  projectWorkflow: 'Project approach',
  workflow_design: 'Design a new product',
  workflow_decomposition: 'Describe an existing product',
  provenanceTitle: 'Origin and verification',
  provenanceBasis: 'Information origin',
  provenanceConfidence: 'Verification level',
  provenanceReference: 'Evidence reference',
  provenanceNotes: 'Observations and uncertainty',
  origin_designed: 'Designed by the team',
  origin_observed: 'Observed in an existing product',
  origin_supplier: 'Supplier information',
  origin_unspecified: 'Origin not yet known',
  confidence_unverified: 'Needs verification',
  confidence_measured: 'Verified by measurement',
  confidence_documented: 'Verified against documentation',
  issue_provenance:
    'An observed element needs verification and an evidence reference',
  guideProvenanceBasisHelp:
    'Record where this element’s information came from. An observation describes what was found; it still needs verification before reproduction.',
  guideProvenanceBasisExample: 'Designed: bracket developed by your team',
  guideProvenanceBasisExample2: 'Observed: bushing found during disassembly',
  guideProvenanceBasisExample3:
    'Supplier: motor described in the manufacturer’s datasheet',
  guideProvenanceBasisRule:
    'Keep supplier references and distinguish observations from design decisions.',
  guideProvenanceConfidenceHelp:
    'Select what supports the description. Measured or documented observations require an evidence reference. A visual estimate remains unverified.',
  guideProvenanceConfidenceExample:
    'Needs verification: approximate material or hidden geometry',
  guideProvenanceConfidenceExample2:
    'Measured: dimensions recorded in a measurement sheet',
  guideProvenanceConfidenceExample3:
    'Documented: checked against an approved drawing revision',
  guideProvenanceConfidenceRule:
    'Verification is a declared engineering record; the application cannot confirm the measurements itself.',
  guideProvenanceReferenceHelp:
    'Reference the drawing, measurement record or supplier document supporting this description. Register local files in Files as relative paths.',
  guideProvenanceReferenceExample:
    'documents/measurements/housing-2026-10-13.pdf',
  guideProvenanceReferenceExample2: 'Drawing MECH.001.100.001, revision B',
  guideProvenanceReferenceExample3:
    'Supplier datasheet ABC-42, revision 3, page 6',
  guideProvenanceReferenceRule:
    'An evidence reference is descriptive text. To include a file in generated checks, add a file reference separately.',
  guideProvenanceNotesHelp:
    'Describe uncertainty, measurement conditions and questions that still need an engineering decision.',
  guideProvenanceNotesExample:
    'Material identification is provisional; confirm from supplier certificate.',
  guideProvenanceNotesExample2:
    'Dimensions measured on one sample; inspect additional samples.',
  guideProvenanceNotesExample3:
    'Internal surface cannot be inspected without disassembly.',
  guideProvenanceNotesRule:
    'Do not replace controlled drawings or acceptance criteria with informal notes.',
  shownComponents: 'Shown components',
  productTree: 'Product structure',
  viewAll: 'View full structure',
  allTypes: 'All types',
  searchComponents: 'Search components…',
  addComponent: 'Add component',
  editComponent: 'Edit component',
  selectComponent: 'Select a component',
  selectComponentText:
    'Select a row to inspect its documentation and manufacturing details.',
  duplicate: 'Create similar',
  deleteComponent: 'Delete component',
  deleteComponentText:
    'This component, its descendants and their document links will be removed from the current branch. Saved versions remain in history.',
  noComponents: 'Build your product structure',
  noComponentsText:
    'Start with an assembly, then add parts, purchased items and materials.',
  parentId: 'Parent assembly',
  rootType: 'Main component type',
  partProjectCreated:
    'Part project created. Add its documentation and manufacturing details.',
  similarElementHint:
    'Creates a similar element using these fields and route. Add children and file references separately. Review the route links before use.',
};
