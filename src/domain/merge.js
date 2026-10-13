import { mergeProduction } from './production.js';
import { mergeCatalog } from './catalog/exchange.js';
import { clone, equal, own } from './objects.js';
import { assert } from './constraints.js';
import { validateProject } from './validation.js';
import { dirty } from './project.js';
import { commonAncestor } from './revisions.js';
import { diff } from './diff.js';

export function prepareMerge(project, sourceName) {
  assert(
    sourceName !== project.activeBranch && own(project.branches, sourceName),
    'Select another branch.',
  );
  assert(
    !dirty(project),
    'Save a version of the current branch before merging.',
  );
  const target = project.branches[project.activeBranch],
    source = project.branches[sourceName];
  assert(
    equal(source.working, project.commits[source.head].snapshot),
    'Save a version of the source branch before merging.',
  );
  assert(
    target.head !== source.head,
    'These branches already point to the same version.',
  );
  const baseId = commonAncestor(project, target.head, source.head);
  assert(baseId, 'The branches have no shared history.');
  const base = project.commits[baseId].snapshot;
  const ours = target.working,
    theirs = source.working;
  const merged = { meta: {}, components: [], documents: [] };
  const conflicts = [];
  function choose(b, o, t, path) {
    if (equal(o, t) || equal(b, t)) return cloneValue(o);
    if (equal(b, o)) return cloneValue(t);
    conflicts.push({ path, base: b, ours: o, theirs: t });
    return cloneValue(o);
  }
  function cloneValue(value) {
    return value === undefined ? undefined : clone(value);
  }
  for (const key of new Set(
    [base, ours, theirs].flatMap((s) => Object.keys(s.meta)),
  ))
    merged.meta[key] = choose(
      base.meta[key],
      ours.meta[key],
      theirs.meta[key],
      ['meta', key],
    );
  for (const kind of ['components', 'documents']) {
    const maps = [base, ours, theirs].map(
      (s) => new Map(s[kind].map((x) => [x.id, x])),
    );
    for (const id of new Set(maps.flatMap((m) => [...m.keys()]))) {
      const [b, o, t] = maps.map((m) => m.get(id));
      let item;
      if (!b || !o || !t) item = choose(b, o, t, [kind, id]);
      else {
        item = {};
        for (const key of new Set([
          ...Object.keys(b),
          ...Object.keys(o),
          ...Object.keys(t),
        ]))
          item[key] = choose(b[key], o[key], t[key], [kind, id, key]);
      }
      if (item) merged[kind].push(item);
    }
  }
  return {
    sourceName,
    targetName: project.activeBranch,
    parents: [target.head, source.head],
    baseId,
    merged,
    conflicts,
    changes: diff(ours, merged),
  };
}

export function resolveMerge(plan, choices) {
  const snapshot = clone(plan.merged);
  plan.conflicts.forEach((conflict, i) => {
    assert(
      ['ours', 'theirs'].includes(choices[i]),
      'Resolve every conflict before merging.',
    );
    const value = clone(conflict[choices[i]]);
    const [kind, id, field] = conflict.path;
    if (kind === 'meta') snapshot.meta[id] = value;
    else if (field) snapshot[kind].find((x) => x.id === id)[field] = value;
    else {
      snapshot[kind] = snapshot[kind].filter((x) => x.id !== id);
      if (value) snapshot[kind].push(clone(value));
    }
  });
  return snapshot;
}

export function importHistory(local, incoming) {
  validateProject(incoming);
  assert(
    local.id === incoming.id,
    'Only copies of the same project can exchange history.',
  );
  const candidate = clone(local);
  mergeCatalog(candidate, incoming);
  for (const [namespace, value] of Object.entries(incoming.extensions || {})) {
    assert(
      !candidate.extensions ||
        !own(candidate.extensions, namespace) ||
        equal(candidate.extensions[namespace], value),
      'Project extension metadata conflict: ' + namespace,
    );
    if (!candidate.extensions) candidate.extensions = {};
    candidate.extensions[namespace] = clone(value);
  }
  for (const [id, record] of Object.entries(incoming.commits)) {
    assert(
      !own(candidate.commits, id) || equal(candidate.commits[id], record),
      'The same version ID has different content. Import rejected.',
    );
    candidate.commits[id] = clone(record);
  }
  mergeProduction(candidate, incoming);
  const names = [];
  for (const [name, branch] of Object.entries(incoming.branches)) {
    if (
      Object.values(candidate.branches).some(
        (b) => b.head === branch.head && equal(b.working, branch.working),
      )
    )
      continue;
    const base = [...`incoming/${name}`];
    let newName = base.slice(0, 100).join(''),
      n = 2;
    while (own(candidate.branches, newName)) {
      const suffix = '-' + n++;
      newName = base.slice(0, 100 - suffix.length).join('') + suffix;
    }
    candidate.branches[newName] = clone(branch);
    names.push(newName);
  }
  validateProject(candidate);
  return { project: candidate, names };
}
