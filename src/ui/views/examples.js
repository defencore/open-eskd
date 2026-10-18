import { COMPLEX_EXAMPLE_SECTIONS } from '../../data/demo.js';
import { esc } from '../../shared/html.js';
import { isExampleProject } from '../../application/example-project.js';

export function createExamplesView(context) {
  const t = (key) => context.t(key);
  function renderExampleHome() {
    return `<section class="panel example-intro"><div><span class="eyebrow">${esc(t('exampleLearningLabel'))}</span><h2>${esc(t('exampleTitle'))}</h2><p>${esc(t('exampleHomeDescription'))}</p><div class="example-tags">${['exampleHardware', 'exampleSoftware', 'exampleEvidence', 'exampleInfrastructure', 'exampleVersions'].map((key) => `<span>${esc(t(key))}</span>`).join('')}</div></div><div>${context.button('exampleOpen', 'demo', 'info')}</div></section>`;
  }

  function renderExampleGuide() {
    if (!isExampleProject(context.project())) return context.renderProjects();
    const project = context.project();
    const snapshot = context.snapshot();
    const stats = [
      [snapshot.components.length, 'componentCount'],
      [snapshot.documents.length, 'documents'],
      [Object.keys(project.branches).length, 'exampleBranches'],
      [Object.keys(project.commits).length, 'exampleSavedVersions'],
    ];
    const destinations = [
      ['documents', 'file', 'exampleDocumentsDescription'],
      ['manufacturing', 'factory', 'exampleManufacturingDescription'],
      ['history', 'history', 'exampleHistoryDescription'],
      ['catalog', 'box', 'exampleCatalogDescription'],
      ['production', 'check', 'exampleProductionDescription'],
    ];
    return `${context.titleRow('exampleGuide', context.button('exampleCreateOwn', 'new-project', 'plus', true))}<div class="example-disclaimer">${esc(t('exampleSyntheticNotice'))}</div><div class="example-stats">${stats.map(([count, key]) => `<div><strong>${count}</strong><span>${esc(t(key))}</span></div>`).join('')}</div><section class="example-guide-section"><h2>${esc(t('exampleExploreTitle'))}</h2><p class="muted">${esc(t('exampleExploreDescription'))}</p><div class="example-grid">${COMPLEX_EXAMPLE_SECTIONS.map(
      (section, index) => {
        const component = snapshot.components.find(
          (item) => item.id === section.componentId,
        );
        return `<article class="panel example-card"><div class="example-card-heading"><span>${String(index + 1).padStart(2, '0')}</span><h3>${esc(t(section.titleKey))}</h3></div><p>${esc(t(section.descriptionKey))}</p>${component ? `<small class="code">${esc(component.designation)}</small>${context.button('exampleExploreComponent', 'example-section', 'tree', false, `data-id="${esc(section.id)}"`)}` : `<small>${esc(t('exampleSectionUnavailable'))}</small>`}</article>`;
      },
    ).join(
      '',
    )}</div></section><section class="panel example-workflow"><h2>${esc(t('exampleLifecycleTitle'))}</h2><div class="example-destinations">${destinations.map(([view, icon, description]) => `<div>${context.button(view, 'nav', icon, false, `data-view="${view}"`)}<p>${esc(t(description))}</p></div>`).join('')}</div></section><section class="panel example-next"><h2>${esc(t('exampleOwnTitle'))}</h2><ol>${['exampleOwnStructure', 'exampleOwnFiles', 'exampleOwnRoutes', 'exampleOwnEvidence', 'exampleOwnHistory', 'exampleOwnProduction'].map((key) => `<li>${esc(t(key))}</li>`).join('')}</ol><p>${esc(t('exampleOwnNotice'))}</p>${context.button('exampleCreateOwn', 'new-project', 'plus', true)}</section>`;
  }
  return { renderExampleHome, renderExampleGuide };
}
