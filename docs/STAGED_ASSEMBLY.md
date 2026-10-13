# Staged mechanical assembly example

Open `examples/staged-assembly.json` through **Open JSON / ZIP**. It is an illustrative workflow with draft components and a demonstration instruction, not a manufacturing-ready design. Supply the actual material grades, geometry, drawings, tooling and acceptance criteria before release.

## Structure and routes

| Component                | Parent                   | Route                                          |
| ------------------------ | ------------------------ | ---------------------------------------------- |
| Mechanical assembly      | Project root             | Fastening, inspection                          |
| Tube and piston assembly | Mechanical assembly      | Press fitting, piston installation, inspection |
| Printed housing          | Tube and piston assembly | Printing, drilling, inspection                 |
| Duralumin tube           | Tube and piston assembly | Turning, drilling, inspection                  |
| Piston                   | Tube and piston assembly | Turning, fitting, inspection                   |
| Sheet-metal bracket      | Mechanical assembly      | Blank cutting, drilling, bending, inspection   |
| Fasteners                | Mechanical assembly      | Purchase, inspection                           |

The tube assembly intentionally contains the piston even though piston work starts after an intermediate assembly operation. Product containment describes the final product; operation dependencies describe how it is made.

## Describe the staged work

1. Give the printed housing its printing, drilling and inspection steps. Give the tube its turning, drilling and inspection steps. Their ordered routes provide the internal prerequisites automatically.
2. In **Tube and piston assembly → Press fitting**, expand **Prerequisites, components and documents**. Add the printed housing and tube as explicit component inputs. Do not include the piston at this stage.
3. In **Piston → Turning**, add **Tube and piston assembly → Press fitting** as a prerequisite operation. Piston work now starts after the tube has been installed.
4. In **Piston → Fitting**, add the tube as a **Reference / matching part**. The selected placement and revision identify which tube is being used. The earlier turning step is already a prerequisite.
5. In **Tube and piston assembly → Assembly**, add the piston as an input. This step waits for piston manufacture and fitting to finish.
6. Describe the bracket's cutting, drilling and bending route. List the actual fasteners and their quantities in the product structure.
7. The final fastening operation has no explicit subset of inputs. It therefore waits for all immediate children: the tube/piston assembly, bracket and fasteners.
8. Open **Manufacturing → Operations order**. Verify that housing and tube inspection precede press fitting, press fitting precedes piston turning, and the finished piston precedes installation. Bracket work can proceed independently.

Do not require the complete tube/piston assembly as an input to piston fitting: the assembly is not complete until the piston is installed. That would create a cycle. Use the specific press-fitting prerequisite and the tube reference instead.

## Control changes and transfer the project

Selecting a component input records its revision and catalog revision identity when pinned. Selecting an operation document records its revision and file hash. A later change marks the affected operation for review. After checking the effect on instructions and acceptance criteria, use **Confirm current revision** and save the component. The app does not accept changed revisions automatically. Unreviewed links block a released project version.

Save a project version to retain the entire plan, then export JSON or ZIP. A reusable catalog package must contain the linked components and documents; publish the containing mechanical assembly for this example. Occurrence IDs and document IDs are remapped when a revision is reused, so links stay inside the chosen placement.

A matching-part link identifies a planned component placement and revision. It does not record manufactured serial numbers, measurements or acceptance results for an individual physical pair.

File paths refer to external documents. Generate directories, supply real files and import a check report as described in [FILESYSTEM.md](FILESYSTEM.md). The example remains intentionally incomplete. Issue an illustrative batch through **Production** to explore staged operation results; see [PRODUCTION.md](PRODUCTION.md).
