import { readPreference } from '../storage/preferences.js';
import { strings } from '../i18n/index.js';
import { createVerificationState } from './verification-state.js';
export function createState() {
  const lang = readPreference('eskd-language', 'ua');
  return {
    ...createVerificationState(),
    lang: Object.hasOwn(strings, lang) ? lang : 'ua',
    author: readPreference('eskd-author', ''),
    projects: [],
    projectId: null,
    view: readPreference('eskd-view', 'projects'),
    selected: null,
    search: '',
    catalogSearch: '',
    catalogLimit: 200,
    batchId: null,
    manufacturingMode: 'route',
    manufacturingSearch: '',
    manufacturingLimit: 50,
    filter: '',
    collapsed: new Set(),
    storageMode: 'persistent',
    saveState: 'saved',
    pendingWrites: 0,
    unsaved: new Map(),
    rejected: [],
    busy: false,
    mergePlan: null,
    pendingImport: null,
    restoreId: null,
  };
}
