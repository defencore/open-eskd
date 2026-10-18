import * as C from '../domain/index.js';
import * as Z from './zip/index.js';
import { csv } from './bom.js';
import { manufacturingGuide } from './manufacturing.js';
import { filesystemScripts } from './filesystem.js';
import { projectReport } from './report.js';

export async function archive(project) {
  C.validateProject(project);
  project = C.clone(project);
  const bash = await filesystemScripts(project, 'bash');
  const ps = await filesystemScripts(project, 'powershell');
  return Z.create([
    { name: 'project.json', data: JSON.stringify(project, null, 2) },
    { name: 'report.html', data: await projectReport(project) },
    { name: 'create-folders.sh', data: bash.create },
    { name: 'check-files.sh', data: bash.check },
    { name: 'create-folders.ps1', data: '\ufeff' + ps.create },
    { name: 'check-files.ps1', data: '\ufeff' + ps.check },
    { name: 'manufacturing/BOM.csv', data: csv(C.working(project)) },
    { name: 'manufacturing/ASSEMBLY.md', data: manufacturingGuide(project) },
    {
      name: 'README.txt',
      data: 'Open ESKD metadata package. Original CAD and engineering files are stored separately.\nSave project.json and report.html in the project root. Run the creation script from that root, then move real files into the expected paths. Creation never deletes or replaces existing files.\nCheck scripts only read files and emit a JSON verification report on stdout and readable results on stderr. Save the output to a NEW file and import it into Open ESKD. A present file is not an engineering approval.\nPowerShell scripts use UTF-8 with a BOM for Windows PowerShell 5.1.\n',
    },
  ]);
}
