import * as C from '../domain/index.js';
import { esc } from '../shared/html.js';
import { translate } from '../i18n/index.js';
import {
  routeLinkIndex,
  routeLinkLines,
} from '../domain/manufacturing-description.js';
import { configurationFingerprint } from './filesystem.js';

export async function projectReport(
  project,
  language = 'en',
  batch = null,
  facility = null,
) {
  C.validateProject(project);
  C.assert(
    ['en', 'ua'].includes(language),
    'Choose English or Ukrainian for the report.',
  );
  C.assert(
    facility === null || C.text(facility, 2000),
    'Invalid facility filter.',
  );
  if (batch !== null)
    C.assert(
      project.production.some((record) => C.equal(record, batch)),
      'Choose a batch from this project.',
    );
  const t = (key) => translate(language, key);
  const snapshot = batch ? batch.snapshot : C.working(project);
  const fingerprint = await configurationFingerprint(project, snapshot);
  const currentCheck =
    project.fileCheck?.fingerprint === fingerprint ? project.fileCheck : null;
  const checks = new Map(
    (currentCheck?.files || []).map((file) => [file.path, file.status]),
  );
  const progress = batch ? C.batchProgress(batch) : null;
  const plan = batch
    ? progress.tasks
    : C.operationPlan(snapshot).filter((task) => task.step);
  const tasks =
    facility === null
      ? plan
      : plan.filter(
          (task) =>
            (task.step.facility || task.component.manufacturer || '') ===
            facility,
        );
  const relevant = new Set(
    tasks.flatMap((task) => [
      task.component.id,
      ...task.step.componentInputs.map((ref) => ref.componentId),
    ]),
  );
  const docIds = new Set(
    tasks.flatMap((task) => task.step.documents.map((ref) => ref.documentId)),
  );
  const documents =
    facility === null
      ? snapshot.documents
      : snapshot.documents.filter(
          (doc) => relevant.has(doc.componentId) || docIds.has(doc.id),
        );
  const components =
    facility === null
      ? C.flatten(snapshot)
      : C.flatten(snapshot).filter((c) => relevant.has(c.id));
  const index = routeLinkIndex(snapshot, t);
  const links = (docs) =>
    docs
      .map(
        (doc) =>
          `<li><a href="${esc(C.relativeFileUrl(doc.path))}">${esc(doc.name)}</a> · ${esc(t('revision'))} ${esc(doc.revision)} · <code>${esc(doc.path)}</code> · ${esc(t('fileStatus_' + (checks.get(doc.path) || 'unknown')))}${doc.required ? '' : ' · ' + esc(t('optionalFile'))}</li>`,
      )
      .join('');
  const issues = C.readiness(snapshot);
  const heading = batch ? batch.name : snapshot.meta.name;
  const html = `<!doctype html><html lang="${language === 'ua' ? 'uk' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' file:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${esc(heading)} · Open ESKD</title><style>body{font:15px/1.5 system-ui,sans-serif;color:#26312d;margin:0;background:#f4f5f4}main{max-width:1050px;margin:auto;padding:32px}h1{font-size:28px}h2{margin-top:32px}h3{margin:0 0 12px}section,article{background:white;border:1px solid #d5dcd7;padding:20px;margin:16px 0;border-radius:5px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;border-bottom:1px solid #d5dcd7;padding:9px}code{overflow-wrap:anywhere}a{color:#245e46}img{max-width:100%;max-height:360px;object-fit:contain}p,li{white-space:pre-wrap;overflow-wrap:anywhere}.muted{color:#66726b}.warning{background:#fff8e5;padding:12px}.table-wrap{overflow:auto}dl{display:grid;grid-template-columns:150px 1fr;gap:6px}dd{margin:0;white-space:pre-wrap}nav a{margin-right:18px}@media(max-width:600px){main{padding:14px}dl{grid-template-columns:1fr}}@media print{body{background:white}main{padding:0}article{break-inside:avoid}nav{display:none}}</style></head><body><main><h1>${esc(heading)}</h1><p>${esc(snapshot.meta.designation)} · ${esc(t('currentVersion'))}: ${esc(batch ? batch.version : C.head(project).version)} · ${esc(batch ? batch.branch : project.activeBranch)}</p><p class="muted">${esc(t('reportRootHint'))}</p><p><code>${esc(fingerprint)}</code></p>${batch ? `<p>${esc(t(batch.mode))} · ${esc(t('batchQuantity'))}: ${batch.quantity} · ${esc(batch.author)} · ${esc(batch.createdAt)}${facility !== null ? ' · ' + esc(facility || t('unassigned')) : ''}</p>` : ''}<nav><a href="#components">${esc(t('structure'))}</a><a href="#operations">${esc(t('operationsOrder'))}</a><a href="#files">${esc(t('documents'))}</a></nav><section><h3>${esc(t('reportReadiness'))}</h3><p>${esc(t('engineeringIssues'))}: ${issues.length}</p><p>${currentCheck ? esc(t('lastFileCheck')) + ': ' + esc(currentCheck.checkedAt) : esc(t(project.fileCheck ? 'fileCheckStale' : 'noFileCheck'))}</p><p class="muted">${esc(t('fileCheckMeaning'))}</p>${
    issues.length
      ? `<ul>${issues
          .filter(
            (issue) => facility === null || relevant.has(issue.componentId),
          )
          .map(
            (issue) =>
              `<li>${esc(snapshot.components.find((c) => c.id === issue.componentId)?.designation || '')}: ${esc(t('issue_' + issue.code))}</li>`,
          )
          .join('')}</ul>`
      : ''
  }</section><h2 id="components">${esc(t('structure'))}</h2>${components
    .map((c) => {
      const docs = documents.filter((doc) => doc.componentId === c.id);
      const image = docs.find((doc) => doc.kind === 'image');
      return `<article><h3>${esc(C.placementLabel(c, index.placements))}</h3><p>${esc(t('revision'))}: ${esc(c.revision)} · ${esc(t(c.status))} · ${batch ? c.totalQuantity * batch.quantity : c.totalQuantity} ${esc(c.unit)}</p>${image ? `<img loading="lazy" src="${esc(C.relativeFileUrl(image.path))}" alt="${esc(c.name)}">` : ''}<dl>${[
        [
          'reportParent',
          snapshot.components.find((p) => p.id === c.parentId)?.designation ||
            '—',
        ],
        ['material', c.material],
        ['stock', c.manufacturing.stock],
        ['preparation', c.manufacturing.preparation],
        ['manufacturer', c.manufacturer],
        ['notes', c.notes],
        ...(c.provenance
          ? [
              ['provenanceBasis', t('origin_' + c.provenance.basis)],
              [
                'provenanceConfidence',
                t('confidence_' + c.provenance.confidence),
              ],
              ['provenanceReference', c.provenance.reference],
              ['provenanceNotes', c.provenance.notes],
            ]
          : []),
      ]
        .map(
          ([key, value]) =>
            `<dt>${esc(t(key))}</dt><dd>${esc(value || '—')}</dd>`,
        )
        .join('')}</dl><ul>${links(docs)}</ul></article>`;
    })
    .join('')}<h2 id="operations">${esc(t('operationsOrder'))}</h2>${tasks
    .map((task) => {
      const result = batch ? C.taskResult(batch, task.key, progress) : null;
      return `<article><h3>${task.sequence}. ${esc(C.placementLabel(task.component, index.placements, false))} · ${esc(t('operation_' + task.step.operation))}</h3><p>${esc(t('quantityToProcess'))}: ${task.quantity} ${esc(task.component.unit)} · ${esc(task.step.facility || task.component.manufacturer || t('unassigned'))}</p><p>${esc(t('routePrevious'))}: ${esc(C.prerequisiteLabels(task.prerequisites, index.placements, t).join('; ') || '—')}</p><dl>${[
        ['routeInstructions', task.step.instructions],
        ['routeInputs', task.step.inputs],
        ['routeEquipment', task.step.equipment],
        ['routeCheck', task.step.check],
      ]
        .map(
          ([key, value]) =>
            `<dt>${esc(t(key))}</dt><dd>${esc(value || '—')}</dd>`,
        )
        .join('')}</dl><ul>${routeLinkLines(task.step, index, t, true)
        .map((line) => `<li>${esc(line)}</li>`)
        .join(
          '',
        )}</ul>${result ? `<p>${esc(t('acceptedQuantity'))}: ${result.accepted} · ${esc(t('rejectedQuantity'))}: ${result.rejected}</p>${result.events.map((event) => `<p>${esc(event.createdAt)} · ${esc(event.operator)} · +${event.accepted} / −${event.rejected}<br>${esc(event.notes)}${event.evidencePath ? `<br><a href="${esc(C.relativeFileUrl(event.evidencePath))}">${esc(event.evidencePath)}</a>` : ''}</p>`).join('')}` : ''}</article>`;
    })
    .join(
      '',
    )}<h2 id="files">${esc(t('documents'))}</h2><section><ul>${links(documents)}</ul></section><p class="muted">Open ESKD · ${esc(t('reportFrozen'))}</p></main></body></html>`;
  return html;
}
