import * as C from '../../domain/index.js';
import { esc } from '../../shared/html.js';
import { reportFields } from './documents.js';

export function verificationReportRuns(project, batch, facility) {
  const configurations = new Map();
  return C.verificationRuns(project)
    .filter((run) => batch === null || run.batchId === batch.id)
    .map((run) => {
      const key = run.batchId
        ? `batch:${run.batchId}`
        : `commit:${run.commitId}`;
      if (!configurations.has(key)) {
        const snapshot = C.verificationSnapshot(project, run);
        configurations.set(key, {
          snapshot,
          components: new Map(snapshot.components.map((c) => [c.id, c])),
          placements: C.placementIndex(snapshot),
        });
      }
      const configuration = configurations.get(key),
        component = configuration.components.get(run.componentId),
        operation = component?.manufacturing.steps.find(
          (step) => step.id === run.operationId,
        ),
        sourceBatch = project.production.find(
          (item) => item.id === run.batchId,
        ),
        commit = project.commits[run.commitId];
      return { run, component, operation, configuration, sourceBatch, commit };
    })
    .filter(({ component, operation }) => {
      if (facility === null) return true;
      if (!component) return false;
      if (operation)
        return (
          (operation.facility || component.manufacturer || '') === facility
        );
      return (
        component.manufacturer === facility ||
        component.manufacturing.steps.some(
          (step) =>
            (step.facility || component.manufacturer || '') === facility,
        )
      );
    })
    .sort(
      (a, b) =>
        a.run.testCase.localeCompare(b.run.testCase) ||
        b.run.performedAt.localeCompare(a.run.performedAt) ||
        a.run.id.localeCompare(b.run.id),
    );
}

function reportArtifact(artifact, { t, checks }) {
  return `<li><a href="${esc(C.relativeFileUrl(artifact.path))}">${esc(artifact.title)}</a> · ${esc(t('verificationArtifactKind_' + artifact.kind))}<br><code>${esc(artifact.path)}</code> · ${esc(t('fileStatus_' + (checks.get(artifact.path) || 'unknown')))}${artifact.required ? '' : ' · ' + esc(t('optionalFile'))}${artifact.sha256 ? `<br>SHA-256: <code>${esc(artifact.sha256)}</code>` : ''}${artifact.notes ? `<p>${esc(artifact.notes)}</p>` : ''}</li>`;
}

export function reportVerification(context) {
  const { verificationRuns: runs, t } = context;
  if (!runs.length)
    return `<section><p>${esc(t('verificationEmpty'))}</p></section>`;
  const visibleIds = new Set(runs.map(({ run }) => run.id)),
    groups = new Map();
  for (const item of runs) {
    if (!groups.has(item.run.testCase)) groups.set(item.run.testCase, []);
    groups.get(item.run.testCase).push(item);
  }
  return [...groups]
    .map(
      ([testCase, items]) =>
        `<section><h3>${esc(t('verificationCase'))}: ${esc(testCase)}</h3>${items
          .map(
            ({
              run,
              component,
              operation,
              configuration,
              sourceBatch,
              commit,
            }) => {
              const fields = [
                ['verificationRun', run.id],
                [
                  'verificationOutcome',
                  t('verificationOutcome_' + run.outcome),
                ],
                ['verificationPerformedAt', run.performedAt],
                ['verificationOperator', run.operator],
                [
                  'verificationConfiguration',
                  `${sourceBatch?.version || commit.version} · ${run.branch} · ${run.commitId}`,
                ],
                [
                  'component',
                  component
                    ? `${C.placementLabel(component, configuration.placements)} · ${t('revision')} ${component.revision}${operation ? ' · ' + t('operation_' + operation.operation) : ''}`
                    : t('verificationGlobalScope'),
                ],
                ...(sourceBatch ? [['batchName', sourceBatch.name]] : []),
                ['verificationSummary', run.summary],
              ];
              return `<article id="verification-run-${esc(encodeURIComponent(run.id))}"><h4>${esc(run.name)}</h4>${reportFields(fields, t)}${run.procedurePath ? `<p>${esc(t('verificationProcedure'))}: <a href="${esc(C.relativeFileUrl(run.procedurePath))}"><code>${esc(run.procedurePath)}</code></a></p>` : ''}${run.retestOf ? `<p>${esc(t('verificationRetestOf'))}: ${visibleIds.has(run.retestOf) ? `<a href="#verification-run-${esc(encodeURIComponent(run.retestOf))}">${esc(run.retestOf)}</a>` : esc(run.retestOf)}</p>` : ''}<p>${esc(t('verificationArtifacts'))}: ${run.artifacts.length}</p><ul>${run.artifacts.map((artifact) => reportArtifact(artifact, context)).join('')}</ul></article>`;
            },
          )
          .join('')}</section>`,
    )
    .join('');
}
