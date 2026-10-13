# Open ESKD offline package

Open ESKD runs entirely in your browser. Its interface is available in English and Ukrainian. Project files stay on your device.

## Open without an internet connection

1. Extract the complete ZIP into a local folder.
2. Open **open-eskd.html** in a current browser. This single file includes all application code, styles and icons. You do not need a server, account or installation.
3. Choose **Create project** or **Open JSON / ZIP**. Use the info icon beside each creation field: hover, keyboard focus or tap shows guidance and several examples. Type and status help follows the selected value. Examples are illustrative; enter your own product data.
4. To explore a ready-made structure, choose **Open example** or import `examples/quick-start.json`.
5. Export project JSON after meaningful changes and before moving the workspace to another browser or address.

For optional local HTTP hosting, serve this folder and open `index.html`. The HTTP version uses the separate application files and can cache them for offline reloads. Direct file opening should use `open-eskd.html`.

## Your project data

The browser stores projects locally when IndexedDB is available. If the app reports session-only storage, export before closing the tab. Clearing browser data can remove stored projects. A project ZIP or JSON is the transferable backup; this application ZIP does not contain your engineering projects.

Browser storage belongs to the address and browser profile. Export a project before changing either, then import it in the new workspace.

## Working with a structure

- **Product structure:** add components, choose their parent and enter quantity per parent item. A part has no children; assemblies, complexes and sets can contain items.
- **Documents:** attach drawings, models, specifications and instructions to the relevant component.
- **Versions & variants:** save a project configuration and use variants for parallel development.
- **Component catalog:** reuse an exact component revision or exchange a subsystem package with another team.
- **Manufacturing:** review preparation, ordered operations and location worklists for the current configuration.
- **Save project JSON:** keep the complete project, including saved versions and file references.

Follow your organization's designation rules, documentation requirements and approval process. The sample codes do not define a mandatory ESKD numbering format.

Read [Engineering workflow](docs/WORKFLOW.md), [Component workflow](docs/COMPONENTS.md) and [Package format](docs/FORMAT.md) and [Manufacturing workflow](docs/MANUFACTURING.md) for detailed instructions.

The package also contains `examples/staged-assembly.json` and `docs/STAGED_ASSEMBLY.md`. This illustrative workflow demonstrates printing/drilling, tube press fitting, dependent piston work and final bracket fastening. Open the JSON as a separate project; supply actual controlled documentation before manufacturing.

See [FILESYSTEM.md](FILESYSTEM.md) for local file creation, verification, and [PRODUCTION.md](PRODUCTION.md) for frozen work orders.
