import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import * as E from '../src/files/index.js';
import { translate } from '../src/i18n/index.js';

function fixture() {
  const project = C.createProject({ name: 'Report audit' });
  C.working(project).components.push(
    C.component({
      id: 'module',
      name: 'Control module',
      designation: 'DEMO.001',
      manufacturer: 'Electronics lab',
      notes: '<script>unsafe()</script>',
      manufacturing: C.manufacturing({
        steps: [
          C.operation({
            id: 'test',
            operation: 'test',
            facility: 'Verification lab',
            instructions: 'Follow the approved verification procedure.',
          }),
        ],
      }),
    }),
  );
  return E.registerDocuments(
    project,
    ['tests/Session α/clip #1.mp4', 'tests/Session α/results.csv'],
    'module',
  );
}

test('HTML reports retain local video and log links, escaped content and immutable result evidence', async () => {
  const project = fixture(),
    batch = C.createBatch(project, {
      name: 'QA-1',
      mode: 'prototype',
      quantity: 1,
      author: 'Planner',
    });
  C.recordResult(project, batch.id, {
    componentId: 'module',
    operationId: 'test',
    accepted: 1,
    rejected: 0,
    operator: 'Verifier',
    notes: '<video onerror="unsafe()">',
    evidencePath: 'tests/Session α/clip #1.mp4',
  });
  C.working(project).documents[0].path = 'tests/later-recording.mp4';
  const html = await E.projectReport(project, 'en', batch);
  assert(html.includes('href="./tests/Session%20%CE%B1/clip%20%231.mp4"'));
  assert(html.includes('href="./tests/Session%20%CE%B1/results.csv"'));
  assert(!html.includes('tests/later-recording.mp4'));
  assert(!html.includes('<script>'));
  assert(!html.includes('<video onerror'));
  assert(html.includes('&lt;video onerror='));
  assert(html.includes("default-src 'none'"));
});

test('facility report readiness counts exactly the displayed configuration issues', async () => {
  const project = fixture(),
    snapshot = C.working(project);
  snapshot.components.push(
    C.component({
      id: 'unrelated',
      name: 'Other module',
      designation: 'PRIVATE.001',
      manufacturer: 'Other lab',
      manufacturing: C.manufacturing({
        steps: [
          C.operation({
            id: 'inspect',
            operation: 'inspect',
            facility: 'Other lab',
          }),
        ],
      }),
    }),
  );
  const expected = C.readiness(snapshot).filter(
    (issue) => issue.componentId === 'module',
  ).length;
  assert(C.readiness(snapshot).length > expected);
  const html = await E.projectReport(project, 'en', null, 'Verification lab');
  assert(
    html.includes(`${translate('en', 'engineeringIssues')}: ${expected}</p>`),
  );
  assert(!html.includes('PRIVATE.001'));
  assert(!html.includes('Other module'));
});

test('an in-flight HTML export freezes content and version before asynchronous fingerprinting', async () => {
  const project = fixture(),
    original = C.clone(project),
    pending = E.projectReport(project);
  C.working(project).meta.name = 'Later project';
  C.working(project).components[0].name = 'Later module';
  C.working(project).documents[0].path = 'tests/later-recording.mp4';
  C.commit(project, {
    author: 'Engineer',
    message: 'Concurrent edit',
    version: 'later-version',
  });
  const html = await pending,
    fingerprint = await E.configurationFingerprint(original);
  assert(html.includes('Report audit'));
  assert(html.includes('Control module'));
  assert(html.includes(fingerprint));
  assert(html.includes('tests/Session α/clip #1.mp4'));
  assert(!html.includes('Later project'));
  assert(!html.includes('Later module'));
  assert(!html.includes('later-version'));
  assert(!html.includes('tests/later-recording.mp4'));
});
