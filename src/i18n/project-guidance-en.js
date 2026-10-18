export default {
  formGuideIntro:
    'Fields marked * are required. Use ⓘ for guidance and examples.',
  guideProjectNameHelp:
    'A readable name for the product or component you are developing.',
  guideProjectNameExample: 'Drive control unit',
  guideProjectNameRule:
    'Use a short product name. Keep revision numbers and people’s names in their own fields.',
  guideProjectDesignationHelp:
    'A stable identifier used in the structure and documentation.',
  guideProjectDesignationExample: 'PRJ.001.000',
  guideProjectDesignationRule:
    'Use your organization’s coding rules. Three or four groups are both supported; group count does not limit the product-tree depth. These are illustrative codes. Keep identifiers stable across versions and moves.',
  guideProjectOwnerHelp:
    'The person or team responsible for coordinating this project.',
  guideProjectOwnerExample: 'Alex Smith · Mechanical engineering',
  guideProjectOwnerRule:
    'Optional at creation; you can assign the lead later. Version authors are recorded separately.',
  guideDescriptionHelp: 'What the product does and what this project includes.',
  guideDescriptionExample:
    'Controls an electric drive. Includes the enclosure, board and wiring; excludes the motor.',
  guideDescriptionRule:
    'Optional. Describe purpose and scope in 1–3 sentences; avoid repeating the name.',
  guideAssemblyHelp:
    'An assembly: components joined together to make one product.',
  guideAssemblyExample: 'Control unit = enclosure + board + fasteners',
  guideAssemblyRule:
    'Choose this when you will add parts or nested assemblies. It is the usual starting point for a product with multiple components.',
  guidePartHelp: 'A part: an item manufactured without assembly operations.',
  guidePartExample: 'Machined mounting bracket',
  guidePartRule:
    'Choose for one manufactured item. Attach its drawing and manufacturing details; a part cannot contain child components.',
  guideComplexHelp:
    'A complex: separate products that work together for a common purpose.',
  guideComplexExample: 'Test installation = test bench + control cabinet',
  guideComplexRule:
    'Choose when the products remain separate rather than being joined into one assembly.',
  guideSetHelp: 'A set: auxiliary items supplied together.',
  guideSetExample: 'Maintenance kit = spare parts + tools',
  guideSetRule:
    'Choose for a delivery or service kit whose items are not assembled into one product.',
  guideStandardHelp: 'A standard item identified by a standard and size.',
  guideStandardExample: 'Hexagon screw M6 × 20 · ISO 4017',
  guideStandardRule:
    'Record the applicable standard and dimensions so the correct item can be ordered. It has no child components.',
  guidePurchasedHelp: 'A purchased item ordered from a supplier.',
  guidePurchasedExample: '24 V power supply · supplier model PS-240',
  guidePurchasedRule:
    'Record the exact supplier part number and datasheet. Use an assembly instead if you need to manage its internal structure.',
  guideCreateRootHelp:
    'Create the first item in the structure using the project name and designation.',
  guideCreateRootExample: 'PRJ.001.000 · Drive control unit · quantity 1',
  guideCreateRootRule:
    'Keep checked to start immediately with the selected product type. Uncheck to build the structure manually later.',
  guideEmptyRootHelp: 'The project will start with an empty product structure.',
  guideEmptyRootExample: 'Create project → Add component',
  guideEmptyRootRule:
    'You will choose the type and designation when adding the first component.',
  guideDeferredTypeHelp:
    'The type is only needed when creating the main component.',
  guideDeferredTypeExample: 'Add an assembly or a part later',
  guideDeferredTypeRule:
    'Enable “Create the main component” to use this choice now.',
  guideNameHelp: 'A short name that identifies this item in the structure.',
  guideNameExample: 'Enclosure cover',
  guideNameRule:
    'Describe the item itself. Use the designation to distinguish similar components.',
  guideDesignationHelp:
    'The identifier used to link this component with its documents.',
  guideDesignationExample: 'PRJ.001.002',
  guideDesignationRule:
    'The suggested code is editable. Use your organization’s rules and a code unique in this structure. Reuse a catalog revision for repeated components.',
  guideParentHelp: 'Where this component belongs in the product structure.',
  guideParentExample: 'Cover → Drive control unit',
  guideParentRule:
    'Choose the immediate containing assembly, complex or set. Choose the top level for an independent main item.',
  guideQuantityHelp: 'How much is needed for one parent item.',
  guideQuantityExample: '4 bolts per assembly × 2 assemblies = 8 bolts total',
  guideQuantityRule:
    'Enter a positive number; do not enter the multiplied total. At the top level, quantity is the number of complete products.',
  guideUnitHelp: 'The measurement unit for the quantity.',
  guideUnitExample: 'pcs · kg · m',
  guideUnitRule:
    'Use pieces for countable items and an appropriate unit for materials. Keep the same unit for the same item.',
  guideOwnerHelp:
    'Who is responsible for developing or coordinating this component.',
  guideOwnerExample: 'Alex Smith · Mechanical team',
  guideOwnerRule:
    'Optional initially. Assign a person or team before handing work to manufacturing.',
  guideMaterialHelp: 'The material and grade used for this item.',
  guideMaterialExample: 'Aluminium EN AW-6061-T6',
  guideMaterialRule:
    'Optional initially. Use the specification from the drawing; add the delivery condition if it matters.',
  guideManufacturerHelp:
    'The facility, workshop or supplier that makes or supplies this item.',
  guideManufacturerExample: 'Workshop 2 · CNC machining',
  guideManufacturerRule:
    'Optional initially. Use consistent location names so the manufacturing view can group work correctly.',
  guideProcessHelp: 'A short manufacturing route or the main operations.',
  guideProcessExample: 'Cut stock → mill → deburr → inspect',
  guideProcessRule:
    'Optional. Summarize the process here; put ordered steps in Manufacturing route and attach approved detailed instructions.',
  guideNotesHelp: 'Additional instructions or constraints for this component.',
  guideNotesExample: 'Protect the mating surface during finishing.',
  guideNotesRule:
    'Optional. Write concrete instructions; keep dimensions and tolerances in the controlled drawing.',
  guideRevisionHelp:
    'The engineering revision of this component, separate from the project version.',
  guideRevisionExample: 'A → B after a design change',
  guideRevisionRule:
    'Start with A or your organization’s label. Record significant changes in a new component revision and a saved project version.',
  guideBulkInputHelp:
    'One component per row: designation, name and optional quantity.',
  guideBulkInputExample: 'PRJ.001.001; Enclosure; 1\nPRJ.001.002; Cover; 1',
  guideBulkInputRule:
    'Paste Excel columns or use semicolons. Empty quantity means 1. All rows use the chosen parent and type; check the preview before adding.',
  fieldHelp: 'Help',
  guideExamples: 'Examples',
  guideProjectNameExample2: 'Hydraulic pump unit',
  guideProjectNameExample3: 'Inspection camera bracket',
  guideProjectDesignationExample2:
    'PRJ.001.000.000 · a more detailed organizational code',
  guideProjectDesignationExample3:
    'CTRL-100 · a custom organizational identifier',
  guideProjectOwnerExample2: 'Electrical engineering team',
  guideProjectOwnerExample3: 'Project lead · Integration team',
  guideDescriptionExample2:
    'Mounts a sensor to the frame; includes the bracket and fasteners.',
  guideDescriptionExample3:
    'A maintenance kit for the pump; includes seals and service tools.',
  guideAssemblyExample2: 'Gearbox = housing + shafts + bearings',
  guideAssemblyExample3: 'Cable assembly = wires + connectors + sleeve',
  guidePartExample2: 'Turned steel shaft',
  guidePartExample3: 'Bent sheet-metal cover',
  guideComplexExample2:
    'Monitoring system = independent camera units + operator station',
  guideComplexExample3:
    'Pump installation = pump unit + separate control cabinet',
  guideSetExample2: 'Spare seals + replacement filters',
  guideSetExample3: 'Delivery accessories = adapters + tools + documentation',
  guideStandardExample2: 'Plain washer · ISO 7089 · size 6',
  guideStandardExample3: 'Hexagon nut · ISO 4032 · M6',
  guidePurchasedExample2: 'Motor · exact manufacturer model and part number',
  guidePurchasedExample3: 'Sensor · supplier part number + datasheet',
  guideCreateRootExample2: 'One bracket project → one main part',
  guideCreateRootExample3: 'One service kit project → one main set',
  guideEmptyRootExample2: 'Import drawings now → organize components later',
  guideEmptyRootExample3: 'Create several top-level items manually',
  guideDeferredTypeExample2:
    'Enable the main component → choose Part for a bracket',
  guideDeferredTypeExample3:
    'Enable the main component → choose Assembly for a gearbox',
  guideNameExample2: 'Mounting bracket',
  guideNameExample3: 'Drive control board',
  guideDesignationExample2: 'BRACKET-042 · your organization’s internal code',
  guideDesignationExample3: 'Supplier model PS-240 · for a purchased item',
  guideParentExample2: 'Bearing → Gearbox → Main product',
  guideParentExample3: 'Top level → a standalone bracket project',
  guideQuantityExample2: '1 cover per enclosure',
  guideQuantityExample3: '2.5 m of wire per cable assembly',
  guideUnitExample2: '4 screws · pcs',
  guideUnitExample3: '2.5 of wire · m; 1.2 of sheet · kg',
  guideOwnerExample2: 'Electrical design team · control board',
  guideOwnerExample3: 'Integration engineer · main assembly',
  guideMaterialExample2: 'Stainless steel · drawing-specified grade',
  guideMaterialExample3: 'Polyamide PA6 · drawing-specified condition',
  guideManufacturerExample2: 'Assembly workshop · final assembly',
  guideManufacturerExample3: 'Supplier A · purchased motor',
  guideProcessExample2: 'Populate board → solder → inspect → functional test',
  guideProcessExample3: 'Receive purchased items → inspect → assemble → test',
  guideNotesExample2: 'Match connector orientation to the assembly drawing.',
  guideNotesExample3:
    'Check the supplied model against the approved parts list.',
  guideRevisionExample2: 'Rev 01 → Rev 02 · your organization’s convention',
  guideRevisionExample3: 'Component B inside project version 1.3.0',
  guideBulkInputExample2: 'PRJ.001.003; Bracket; 4',
  guideBulkInputExample3: 'PRJ.001.004; Cover · quantity defaults to 1',
  guideNamesPartExample: 'Mounting bracket',
  guideNamesPartExample2: 'Shaft',
  guideNamesPartExample3: 'Enclosure cover',
  guideNamesAssemblyExample: 'Drive control unit',
  guideNamesAssemblyExample2: 'Gearbox',
  guideNamesAssemblyExample3: 'Cable assembly',
  guideNamesComplexExample: 'Test installation',
  guideNamesComplexExample2: 'Monitoring system',
  guideNamesComplexExample3: 'Pump installation',
  guideNamesSetExample: 'Pump maintenance kit',
  guideNamesSetExample2: 'Spare parts set',
  guideNamesSetExample3: 'Installation accessories',
  guideNamesStandardExample: 'Screw M6 × 20 · ISO 4017',
  guideNamesStandardExample2: 'Washer · ISO 7089 · size 6',
  guideNamesStandardExample3: 'Nut M6 · ISO 4032',
  guideNamesPurchasedExample: 'Power supply 24 V · model PS-240',
  guideNamesPurchasedExample2: 'Motor · manufacturer model',
  guideNamesPurchasedExample3: 'Sensor · supplier part number',
  guideNamesMaterialExample: 'Copper wire · specified cross-section',
  guideNamesMaterialExample2: 'Sheet steel · specified grade and thickness',
  guideNamesMaterialExample3: 'Adhesive · specified product',
  guideProgressHelp:
    'In progress: the component is still being designed or documented.',
  guideProgressExample: 'Bracket geometry is being refined.',
  guideProgressExample2:
    'Assembly structure is drafted; drawings are incomplete.',
  guideProgressExample3: 'The supplier model has not been selected yet.',
  guideProgressRule:
    'Use while editing. Move to In review when the design and required documents are ready for your team’s check.',
  guideReviewHelp:
    'In review: the component is ready for an engineering check.',
  guideReviewExample: 'Check drawing dimensions, tolerances and revision.',
  guideReviewExample2:
    'Check the assembly structure, quantities and document links.',
  guideReviewExample3: 'Verify the purchased item model against its datasheet.',
  guideReviewRule:
    'Use during your team’s review. Resolve comments before selecting Released; return to In progress if redesign is needed.',
  guideReleasedHelp:
    'Released: this component revision has completed your organization’s approval process.',
  guideReleasedExample:
    'Part B with the reviewed drawing B and assigned workshop.',
  guideReleasedExample2:
    'Assembly A with checked quantities and assembly documentation.',
  guideReleasedExample3:
    'Purchased model and datasheet accepted by the responsible engineer.',
  guideReleasedRule:
    'Choose only after approval. The selector does not sign or lock documents. Save a catalog revision to pin the component and a project version to record the configuration.',
  guideMaterialUnitsExample: 'Wire: 2.5 m',
  guideMaterialUnitsExample2: 'Sheet: 1.2 kg',
  guideMaterialUnitsExample3: 'Adhesive: 50 g',
  guideProjectWorkflowHelp:
    'Choose how the project starts. Both approaches support the same structure, files, revisions and manufacturing routes.',
  guideProjectWorkflowExample: 'Design: a new test fixture',
  guideProjectWorkflowExample2:
    'Decomposition: an existing pump, split into housing, shaft and seals',
  guideProjectWorkflowExample3:
    'Decomposition: document a purchased assembly before adapting it',
  guideProjectWorkflowRule:
    'The approach is an organizational aid. It does not certify the product or change its engineering requirements.',
};
