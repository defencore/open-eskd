export default {
  guideStockMaterialHelp: 'Material consumed during manufacture.',
  guideStockMaterialExample: 'Copper wire · 2.5 m',
  guideStockMaterialRule:
    'Specify the grade, quantity and unit. This entry has no child components.',
  guideStockMaterialExample2: 'Steel sheet · 1.2 kg per assembly',
  guideStockMaterialExample3: 'Adhesive · 0.05 kg per product',
  guideTechnologyHelp: 'The main way this component is made or supplied.',
  guideTechnologyExample: '3D printing · a printed enclosure',
  guideTechnologyExample2: 'Milling / Turning · machined components',
  guideTechnologyExample3: 'Casting / Laser cutting / Assembly / Purchase',
  guideTechnologyRule:
    'Choose the main technology, then add a typical route. A route may contain several technologies. Use Other and the process summary for a custom method.',
  guideStockHelp:
    'The workpiece or feedstock needed before the first operation.',
  guideStockExample: 'Plate · material grade and blank dimensions',
  guideStockExample2:
    'Bar / tube · size and machining allowance from the drawing',
  guideStockExample3: 'Filament / resin · product and required amount',
  guideStockRule:
    'Choose a blank type, then replace the prompt with actual dimensions, grade and amount. A suggestion is not a complete material specification.',
  guidePreparationHelp: 'What must be available or checked before work starts.',
  guidePreparationExample:
    'Approved drawing B + material certificate + inspection plan',
  guidePreparationExample2:
    'Blank, fixture, tooling and the reviewed manufacturing program',
  guidePreparationExample3:
    'Completed child components and their approved assembly documents',
  guidePreparationRule:
    'List prerequisites. Record operation-specific inputs and tools in the individual steps.',
  guideRouteOperationHelp: 'One step in the manufacturing sequence.',
  guideRouteOperationExample: 'Prepare → Mill → Inspect',
  guideRouteOperationExample2: 'Prepare → 3D print → Post-process → Inspect',
  guideRouteOperationExample3: 'Prepare → Assemble → Test',
  guideRouteOperationRule:
    'Choose an operation and use the arrows to set its order. Other allows a custom operation described in What to do.',
  guideRouteInstructionsHelp: 'The specific work to perform in this operation.',
  guideRouteInstructionsExample:
    'Machine the features identified in drawing B.',
  guideRouteInstructionsExample2:
    'Install the components according to the assembly drawing.',
  guideRouteInstructionsExample3:
    'Inspect using the approved inspection instruction.',
  guideRouteInstructionsRule:
    'Add document references and required parameters from the approved process. A template only sets the operation order.',
  guideRouteInputsHelp:
    'Materials, blanks or components consumed or used by this step.',
  guideRouteInputsExample: 'One blank from the specified stock',
  guideRouteInputsExample2: 'Housing × 1; cover × 1; fasteners × 4',
  guideRouteInputsExample3: 'Specified material · amount and unit per item',
  guideRouteInputsRule:
    'State quantities per manufactured item. Use component designations to identify assembly inputs.',
  guideRouteEquipmentHelp: 'Machines, fixtures and tools needed for this step.',
  guideRouteEquipmentExample: '3D printer + reviewed build file',
  guideRouteEquipmentExample2: 'Milling machine + fixture + tooling',
  guideRouteEquipmentExample3:
    'Assembly bench + tools + inspection instruments',
  guideRouteEquipmentRule:
    'Choose a starting option and add the exact machine, fixture and program references used by your workshop.',
  guideRouteFacilityHelp: 'Where this operation is performed.',
  guideRouteFacilityExample: 'Workshop 2 · machining',
  guideRouteFacilityExample2: 'Supplier A · casting',
  guideRouteFacilityExample3: 'Final assembly workshop',
  guideRouteFacilityRule:
    'Choose an existing location or enter a new one. If empty, the component location is used in the plan.',
  guideRouteCheckHelp:
    'The expected result and how it is checked before the next operation.',
  guideRouteCheckExample: 'Dimensions and finish verified against drawing B',
  guideRouteCheckExample2:
    'Assembly completeness checked against the specification',
  guideRouteCheckExample3: 'Test result recorded in the approved report',
  guideRouteCheckRule:
    'Reference acceptance criteria from controlled documents. Do not invent tolerances or limits from a template.',
  guideDependencyComponentHelp:
    'Select the component whose operation must finish first. This may be another part or an assembly in the current project.',
  guideDependencyComponentExample: 'Tube insert assembly',
  guideDependencyComponentExample2: 'Printed housing',
  guideDependencyComponentExample3: 'Sheet-metal bracket',
  guideDependencyComponentRule:
    'Select the actual placement, especially when the same component is used more than once. Publish a containing assembly to retain cross-component links in a reusable package.',
  guideDependencyOperationHelp:
    'This operation must finish before the current step starts. Earlier steps in the current route are already prerequisites through route order.',
  guideDependencyOperationExample: 'Piston fitting after tube press fitting',
  guideDependencyOperationExample2: 'Bending after drilling',
  guideDependencyOperationExample3: 'Final assembly after bracket inspection',
  guideDependencyOperationRule:
    'Choose a specific step. Dependencies cannot point back to a later dependent step. The app rejects cycles and missing prerequisites.',
  guideInputComponentHelp:
    'Link a required part, subassembly or matching part from the structure. Its current revision is recorded when selected.',
  guideInputComponentExample: 'Printed housing + tube for press fitting',
  guideInputComponentExample2:
    'Installed tube as the matching part for a piston',
  guideInputComponentExample3: 'Bracket + housing + fasteners for joining',
  guideInputComponentRule:
    'The operation waits for the linked component to be complete. To wait for an intermediate stage, choose a prerequisite operation instead. Review revision changes explicitly; links do not alter BOM quantities.',
  guideInputUsageHelp:
    'Distinguish an input used in the operation from a part used for matching, measurement or comparison. Both must be available.',
  guideInputUsageExample: 'Input: tube installed in housing',
  guideInputUsageExample2: 'Reference: installed tube used to match the piston',
  guideInputUsageExample3: 'Input: bolts used to join the bracket',
  guideInputUsageRule:
    'A reference is not an additional consumed part. This field describes use; quantities in the product tree remain authoritative.',
  guideInputQuantityHelp:
    'Record how much of the selected component is needed for one item processed by this operation, in that component’s unit.',
  guideInputQuantityExample: '1 tube per insert assembly',
  guideInputQuantityExample2: '4 bolts per bracket assembly',
  guideInputQuantityExample3: '1 matching tube for one piston',
  guideInputQuantityRule:
    'Enter a positive number. These are operation requirements, not additional BOM demand; do not sum repeated references as new products.',
  guideOperationDocumentHelp:
    'Select an attached drawing, process instruction or inspection document. The selected revision and file identity are recorded.',
  guideOperationDocumentExample: 'Drilling drawing, revision A',
  guideOperationDocumentExample2: 'Assembly and press-fitting instruction',
  guideOperationDocumentExample3: 'Piston matching inspection sheet',
  guideOperationDocumentRule:
    'A replaced file triggers review even if its revision label stays the same. A reusable component package must include its linked documents.',
  guideOperationDrillingHelp:
    'Use a separate drilling step after printing, turning or blank cutting. Record the setup and refer to the hole definition in the controlled drawing.',
  guideOperationDrillingExample:
    'Drill the printed part according to drawing A',
  guideOperationDrillingExample2: 'Drill the tube blank after turning',
  guideOperationDrillingExample3: 'Drill the sheet blank before bending',
  guideOperationDrillingRule:
    'Specify dimensions, tolerances, tooling and checks through approved documentation. Reorder steps to match the actual route.',
  guideOperationPressFitHelp:
    'Place press fitting in the assembly route. Link only the components required at this stage; later matching parts may be made afterward.',
  guideOperationPressFitExample: 'Press the tube into the printed housing',
  guideOperationPressFitExample2: 'Link housing and tube as operation inputs',
  guideOperationPressFitExample3:
    'Inspect the installed tube before piston fitting',
  guideOperationPressFitRule:
    'Use explicit inputs for staged assembly. Without explicit inputs an assembly operation waits for all immediate children. Record the approved fitting method and acceptance check.',
  guideOperationFittingHelp:
    'Link the exact matching part and the prerequisite that establishes its final condition. This records which pair the operation concerns.',
  guideOperationFittingExample: 'Match piston to the installed tube',
  guideOperationFittingExample2: 'Prerequisite: tube press fitting completed',
  guideOperationFittingExample3:
    'Reference: the selected tube placement and revision',
  guideOperationFittingRule:
    'If the whole assembly is not yet complete, depend on its specific operation rather than requiring that assembly as a completed input. Dimensions and acceptance criteria belong in controlled documents.',
  guideOperationFasteningHelp:
    'Describe joining the prepared components with the specified fasteners. Link the components needed at this step.',
  guideOperationFasteningExample:
    'Join the bent bracket to the printed housing',
  guideOperationFasteningExample2:
    'Select housing, bracket and bolts as inputs',
  guideOperationFasteningExample3:
    'Verify the joint against assembly drawing A',
  guideOperationFasteningRule:
    'Specify the fastening method, quantities and checks from the drawing or assembly instruction. Keep fasteners in the product structure when they belong to the final product.',
};
