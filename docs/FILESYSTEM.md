# Local files and project manifests

Open ESKD 3 uses one lightweight `project.json` to describe product structure, file references, revisions, manufacturing routes and production results. CAD models, drawings, photographs and measurements remain in ordinary local folders. The browser does not upload, read or store their bytes.

## Engineer workflow

1. Create a project and describe its components and operations.
2. In **Documents**, add a relative path for each expected file. Choose its component, document type, revision, requirement and optional SHA-256.
3. Use **Suggest a standard path** for `components/<designation>/rev-<revision>/<designation>_<purpose>.<extension>`. An image defaults to `preview.png` in the same revision directory. The suggestion is editable.
4. Save the JSON in the project root as `project.json`.
5. Choose **Create folders**, select Bash or PowerShell, and paste the script into a terminal opened in that root. Alternatively, download and run it, passing an existing root directory as its first argument.
6. Move and rename actual files yourself. Script generation cannot rename existing CAD files or update CAD-internal dependencies.
7. Choose **Check files** and run the new script. It prints readable results to stderr and JSON to stdout. Capture stdout into a new filename, then use **Import check result**.
8. Export the HTML report and save it in that same root. It includes relative links, component images, structure, operations and checks. Open it locally without a server.

Creation only creates absent directories. Optional absence markers use `<expected-path>.eskd-placeholder`; they are separate from actual drawings and never count as a complete file. Existing target files and markers are never overwritten or removed. Internal symbolic links and Windows reparse points are refused. The selected root itself is an explicit user-chosen location. These scripts are intended for trusted project directories, not adversarial filesystems being modified concurrently.

Checking is read-only. It distinguishes `missing`, `placeholder`, `empty`, `unsafe`, `unreadable`, `present`, `verified`, `mismatch` and `hash-unavailable`. Actual files take precedence over old marker sidecars. Unlisted files are left alone. A present file has not been verified against expected bytes unless a SHA-256 is configured and matches. File presence is not approval of engineering content.

## Capturing check results

Bash 3.2 or newer is supported, including the Bash distributed with macOS. Hash checks use `sha256sum` when available or macOS `shasum -a 256`. No Node.js, Python or jq is needed.

```bash
(set -C; bash check-files.sh > verification-new.json)
```

The subshell enables Bash's no-clobber protection only for this output file. A failed completeness check returns status 1 but still emits valid JSON; operational errors return 2. Paste mode also runs inside a subshell, so shell options and exit calls do not change or close the surrounding interactive shell.

Windows PowerShell 5.1 and PowerShell 7 scripts use literal paths, .NET filesystem methods and streaming SHA-256. Hashing reads the file stream directly, including Unicode and punctuation in filenames, and disposes both the stream and hash algorithm. Downloaded `.ps1` files contain a UTF-8 BOM for Windows PowerShell 5.1. The generated script can also be pasted into an open PowerShell session. Do not change machine execution policy just to run it.

```powershell
./check-files.ps1 | Out-File -LiteralPath verification-new.json -Encoding utf8 -NoClobber
```

PowerShell prints JSON and diagnostics without terminating the host session. Import validates that the report contains every expected path and the exact configuration fingerprint. A later structure, route, note or revision change makes the previous report stale. Generate a new check script after edits. OS-specific maximum path lengths still apply; use a short project root and short path segments.

PowerShell is not installed in the macOS development environment. Its generator is checked locally for escaping, literal paths, reparse-point guards and exclusive marker creation. The reusable Windows CI suite executes creation, repeated creation, verification and junction checks in Windows PowerShell and PowerShell 7; Pages deployment waits for that suite. A local skip is not a Windows execution result. Bash scripts are executed in disposable test directories, including repeated creation, Unicode names, shell-like filenames, missing files, placeholders, empty files, hashes and symlinks.

Relevant platform documentation: [Bash redirections](https://www.gnu.org/software/bash/manual/html_node/Redirections.html), [PowerShell Get-Item](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-item?view=powershell-5.1), [HashAlgorithm.ComputeHash](https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.hashalgorithm.computehash).

## Current-format exchange

Only current schema-6 JSON and metadata ZIPs are accepted. Unsupported browser records remain untouched and can be exported for external handling. Normal projects and packages contain no engineering file bytes. Original CAD and drawing files are transferred separately by their owners.

Imported verification JSON is limited to 32 MiB, covering the maximum supported inventory without requiring the engineer to split a generated report.
