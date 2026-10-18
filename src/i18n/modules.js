import commonEn from './common-en.js';
import commonUk from './common-uk.js';
import workspaceEn from './workspace-en.js';
import workspaceUk from './workspace-uk.js';
import structureEn from './structure-en.js';
import structureUk from './structure-uk.js';
import historyEn from './history-en.js';
import historyUk from './history-uk.js';
import catalogEn from './catalog-en.js';
import catalogUk from './catalog-uk.js';
import filesEn from './files-en.js';
import filesUk from './files-uk.js';
import manufacturingEn from './manufacturing-en.js';
import manufacturingUk from './manufacturing-uk.js';
import productionEn from './production-en.js';
import productionUk from './production-uk.js';
import projectGuidanceEn from './project-guidance-en.js';
import projectGuidanceUk from './project-guidance-uk.js';
import manufacturingGuidanceEn from './manufacturing-guidance-en.js';
import manufacturingGuidanceUk from './manufacturing-guidance-uk.js';
import examplesEn from './examples-en.js';
import examplesUk from './examples-uk.js';

export const translationModules = [
  { name: 'common', en: commonEn, ua: commonUk },
  { name: 'workspace', en: workspaceEn, ua: workspaceUk },
  { name: 'structure', en: structureEn, ua: structureUk },
  { name: 'history', en: historyEn, ua: historyUk },
  { name: 'catalog', en: catalogEn, ua: catalogUk },
  { name: 'files', en: filesEn, ua: filesUk },
  { name: 'manufacturing', en: manufacturingEn, ua: manufacturingUk },
  { name: 'production', en: productionEn, ua: productionUk },
  { name: 'examples', en: examplesEn, ua: examplesUk },
  { name: 'project-guidance', en: projectGuidanceEn, ua: projectGuidanceUk },
  {
    name: 'manufacturing-guidance',
    en: manufacturingGuidanceEn,
    ua: manufacturingGuidanceUk,
  },
];
