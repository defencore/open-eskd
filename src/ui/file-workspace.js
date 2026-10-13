import * as C from '../domain/index.js';
import * as E from '../files/index.js';
import { esc } from '../shared/html.js';

export function createFileWorkspace(context) {
  const t = (...args) => context.t(...args);
  let scripts = null;
  let scriptKind = 'create';
  let platform = 'bash';
  let markers = false;
  let checkCurrent = false;
  let checkUnavailable = false;
  let checkedProject = null;
  let checkSequence = 0;
  async function refreshFileCheck() {
    const sequence = ++checkSequence,
      project = context.project();
    checkedProject = project;
    checkCurrent = checkUnavailable = false;
    if (!project?.fileCheck) return;
    try {
      const fingerprint = await E.configurationFingerprint(project);
      if (sequence === checkSequence && context.project() === project)
        checkCurrent = project.fileCheck.fingerprint === fingerprint;
    } catch (error) {
      if (sequence === checkSequence && context.project() === project)
        checkUnavailable = true;
      context.reportError?.('file check', error);
    }
  }
  function fileWorkspace() {
    const check = context.project().fileCheck;
    const matches = checkedProject === context.project() && checkCurrent;
    const unavailable =
      checkedProject === context.project() && checkUnavailable;
    const summary = check
      ? `${t(unavailable ? 'fileCheckUnavailable' : matches ? 'lastFileCheck' : 'fileCheckStale')}: ${context.fmtDate(check.checkedAt)} · ${check.files.filter((file) => ['missing', 'placeholder', 'empty', 'mismatch', 'unsafe', 'unreadable', 'hash-unavailable'].includes(file.status)).length} ${t('fileProblems')}`
      : t('noFileCheck');
    return `<section class="panel file-workspace"><div class="panel-header"><h2>${esc(t('localFileStructure'))}</h2></div><div class="panel-body"><ol class="file-workflow-steps"><li>${esc(t('fileWorkflow1'))}</li><li>${esc(t('fileWorkflow2'))}</li><li>${esc(t('fileWorkflow3'))}</li></ol><div class="title-actions">${context.button('createDirectories', 'filesystem-create', 'folder')}${context.button('checkFiles', 'filesystem-check', 'check')}${context.button('importFileCheck', 'import-file-check', 'upload')}${context.button('exportHtmlReport', 'export-html-report', 'file')}</div><p class="note-text">${esc(summary)}</p>${check && matches ? `<details><summary>${esc(t('verificationDetails'))}</summary><ul>${check.files.map((file) => `<li><code>${esc(file.path)}</code> · ${esc(t('fileStatus_' + file.status))}</li>`).join('')}</ul></details>` : ''}</div></section>`;
  }
  async function scriptModal(kind = scriptKind) {
    scriptKind = kind;
    scripts = await E.filesystemScripts(context.project(), platform, markers);
    context.showModal(
      kind === 'create' ? 'createDirectories' : 'checkFiles',
      `<p class="modal-description">${esc(t(kind === 'create' ? 'createScriptHint' : 'checkScriptHint'))}</p><div class="form-grid">${context.selectField(
        'scriptPlatform',
        'platform',
        [
          { value: 'bash', label: 'macOS / Linux · Bash' },
          { value: 'powershell', label: 'Windows · PowerShell' },
        ],
        platform,
        'data-file-platform',
      )}${
        kind === 'create'
          ? context.selectField(
              'placeholderMode',
              'markers',
              [
                { value: 'false', label: t('directoriesOnly') },
                { value: 'true', label: t('directoriesAndMarkers') },
              ],
              String(markers),
              'data-file-markers',
            )
          : ''
      }</div><label class="field"><span>${esc(t('generatedScript'))}</span><textarea class="script-preview" data-script-text readonly spellcheck="false">${esc(scripts[kind])}</textarea></label><div class="title-actions">${context.button('copyScript', 'copy-script', 'copy', true)}${context.button('downloadScript', 'download-script', 'download')}</div>${kind === 'check' ? `<p class="note-text">${esc(t('checkCaptureHint'))}</p><pre class="text-preview">${esc(platform === 'bash' ? '(set -C; bash check-files.sh > verification-new.json)' : './check-files.ps1 | Out-File -LiteralPath verification-new.json -Encoding utf8 -NoClobber')}</pre>` : ''}`,
    );
  }
  async function copyText(text, control = null) {
    try {
      await navigator.clipboard.writeText(text);
      context.toast(t('copied'));
    } catch {
      if (control) {
        control.focus();
        control.select();
        context.toast(t('copyManually'));
      } else
        context.showModal(
          'copyPath',
          `<label class="field"><textarea readonly>${esc(text)}</textarea></label><p>${esc(t('copyManually'))}</p>`,
        );
    }
  }
  function handleFileChange(target) {
    if (target.hasAttribute('data-file-platform')) {
      platform = target.value;
      scriptModal().catch(context.formError);
    }
    if (target.hasAttribute('data-file-markers')) {
      markers = target.value === 'true';
      scriptModal().catch(context.formError);
    }
    if (target.id === 'file-check-input') {
      const file = target.files[0];
      target.value = '';
      if (file)
        importCheck(file).catch((error) =>
          context.toast(context.errorMessage(error), true),
        );
    }
  }
  async function importCheck(file) {
    const { state } = context;
    if (state.busy) {
      context.toast(t('busy'));
      return;
    }
    state.busy = true;
    try {
      if (file.size > E.MAX_VERIFICATION_SIZE)
        throw new Error('Verification report exceeds the 32 MB limit.');
      const project = context.project(),
        candidate = C.clone(project);
      await E.acceptFileCheck(
        candidate,
        JSON.parse((await file.text()).replace(/^\ufeff/, '')),
      );
      state.projects[state.projects.indexOf(project)] = candidate;
      await context.persist(candidate);
      await refreshFileCheck();
      context.render();
      context.success(t('fileCheckImported'));
    } finally {
      state.busy = false;
    }
  }
  async function handleFileAction(name) {
    switch (name) {
      case 'filesystem-create':
        await scriptModal('create');
        break;
      case 'filesystem-check':
        await scriptModal('check');
        break;
      case 'copy-script':
        await copyText(
          scripts[scriptKind],
          context.modal.querySelector('[data-script-text]'),
        );
        break;
      case 'download-script':
        context.download(
          (platform === 'powershell' ? '\ufeff' : '') + scripts[scriptKind],
          (scriptKind === 'create' ? 'create-folders' : 'check-files') +
            (platform === 'powershell' ? '.ps1' : '.sh'),
          'text/plain;charset=utf-8',
        );
        break;
      case 'import-file-check':
        document.querySelector('#file-check-input').click();
        break;
      case 'export-html-report':
        context.download(
          await E.projectReport(context.project(), context.state.lang),
          'report.html',
          'text/html;charset=utf-8',
        );
        break;
      default:
        return false;
    }
    return true;
  }
  return {
    fileWorkspace,
    handleFileChange,
    handleFileAction,
    copyText,
    refreshFileCheck,
  };
}
