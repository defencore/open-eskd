import { placementLabel } from '../../domain/placements.js';
import { esc } from '../../shared/html.js';
import { reportDocumentLinks } from './documents.js';
import { reportStructure } from './structure.js';
import { reportOperations } from './operations.js';
import { reportVerification } from './verification.js';

const style = `body{font:15px/1.5 system-ui,sans-serif;color:#26312d;margin:0;background:#f4f5f4}main{max-width:1050px;margin:auto;padding:32px}h1{font-size:28px}h2{margin-top:32px}h3{margin:0 0 12px}section,article{background:white;border:1px solid #d5dcd7;padding:20px;margin:16px 0;border-radius:5px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;border-bottom:1px solid #d5dcd7;padding:9px}code{overflow-wrap:anywhere}a{color:#245e46}img{max-width:100%;max-height:360px;object-fit:contain}p,li{white-space:pre-wrap;overflow-wrap:anywhere}.muted{color:#66726b}.warning{background:#fff8e5;padding:12px}.table-wrap{overflow:auto}dl{display:grid;grid-template-columns:150px 1fr;gap:6px}dd{margin:0;white-space:pre-wrap}nav a{margin-right:18px}@media(max-width:600px){main{padding:14px}dl{grid-template-columns:1fr}}@media print{body{background:white}main{padding:0}article{break-inside:avoid}nav{display:none}}`;

function reportReadiness({ t, issues, index, currentCheck, hadFileCheck }) {
  const details = issues
    .map((issue) => {
      const component = index.components.get(issue.componentId);
      return `<li>${esc(component ? placementLabel(component, index.placements, false) : '')}: ${esc(t('issue_' + issue.code))}</li>`;
    })
    .join('');
  return `<section><h3>${esc(t('reportReadiness'))}</h3><p>${esc(t('engineeringIssues'))}: ${issues.length}</p><p>${currentCheck ? esc(t('lastFileCheck')) + ': ' + esc(currentCheck.checkedAt) : esc(t(hadFileCheck ? 'fileCheckStale' : 'noFileCheck'))}</p><p class="muted">${esc(t('fileCheckMeaning'))}</p>${details ? `<ul>${details}</ul>` : ''}</section>`;
}

export function reportLayout(context) {
  const {
    language,
    heading,
    t,
    snapshot,
    batch,
    facility,
    version,
    branch,
    fingerprint,
    documents,
  } = context;
  return `<!doctype html><html lang="${language === 'ua' ? 'uk' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' file:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${esc(heading)} · Open ESKD</title><style>${style}</style></head><body><main><h1>${esc(heading)}</h1><p>${esc(snapshot.meta.designation)} · ${esc(t('currentVersion'))}: ${esc(version)} · ${esc(branch)}</p><p class="muted">${esc(t('reportRootHint'))}</p><p><code>${esc(fingerprint)}</code></p>${batch ? `<p>${esc(t(batch.mode))} · ${esc(t('batchQuantity'))}: ${batch.quantity} · ${esc(batch.author)} · ${esc(batch.createdAt)}${facility !== null ? ' · ' + esc(facility || t('unassigned')) : ''}</p>` : ''}<nav><a href="#components">${esc(t('structure'))}</a><a href="#operations">${esc(t('operationsOrder'))}</a><a href="#files">${esc(t('documents'))}</a><a href="#verification">${esc(t('verification'))}</a></nav>${reportReadiness(context)}<h2 id="components">${esc(t('structure'))}</h2>${reportStructure(context)}<h2 id="operations">${esc(t('operationsOrder'))}</h2>${reportOperations(context)}<h2 id="files">${esc(t('documents'))}</h2><section><ul>${reportDocumentLinks(documents, context)}</ul></section><h2 id="verification">${esc(t('verification'))}</h2>${reportVerification(context)}<p class="muted">Open ESKD · ${esc(t('reportFrozen'))}</p></main></body></html>`;
}
