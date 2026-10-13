import { icon } from '../ui/icons.js';
import { esc } from '../shared/html.js';

export function createComponents(context) {
  const t = (...args) => context.t(...args);
  const badge = (status) =>
    `<span class="badge ${esc(status)}"><i class="dot"></i>${esc(t(status))}</span>`;

  const symbol = (type) =>
    `<span class="component-symbol ${esc(type)}">${icon(['assembly', 'complex', 'set'].includes(type) ? 'cube' : type === 'purchased' ? 'bolt' : type === 'standard' ? 'box' : type === 'material' ? 'layers' : 'box')}</span>`;

  const button = (label, action, iconName, primary = false, extra = '') =>
    `<button type="button" class="button${primary ? ' primary' : ''}" data-action="${action}" ${extra}>${iconName ? icon(iconName) : ''}<span>${esc(t(label))}</span></button>`;

  const iconButton = (label, action, name, id = '') =>
    `<button type="button" class="icon-button" title="${esc(t(label))}" aria-label="${esc(t(label))}" data-action="${action}" data-id="${esc(id)}">${icon(name)}</button>`;

  const field = (label, name, value = '', extra = '', type = 'text') =>
    `<label class="field"><span>${esc(t(label))}${extra.includes('required') ? ' *' : ''}</span><input type="${type}" name="${name}" value="${esc(value)}" ${extra}></label>`;

  const textarea = (label, name, value = '', extra = '', attributes = '') =>
    `<label class="field ${extra}"><span>${esc(t(label))}${attributes.includes('required') ? ' *' : ''}</span><textarea name="${name}" ${attributes.includes('maxlength=') ? '' : 'maxlength="10000"'} ${attributes}>${esc(value)}</textarea></label>`;

  const selectField = (label, name, options, value, extra = '') =>
    `<label class="field"><span>${esc(t(label))}</span><select name="${name}" ${extra}>${options.map((o) => `<option value="${esc(o.value)}"${o.value === value ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>`;

  const link = (label, action, id = '') =>
    `<button type="button" class="text-link" data-action="${action}" data-id="${esc(id)}">${esc(t(label))}${icon('arrow')}</button>`;

  const empty = (title, body, action = '', label = '', iconName = 'cube') =>
    `<div class="empty">${icon(iconName)}<h3>${esc(t(title))}</h3>${body ? `<p>${esc(t(body))}</p>` : ''}${action ? button(label, action, 'plus', true) : ''}</div>`;

  return {
    badge,
    symbol,
    button,
    iconButton,
    field,
    textarea,
    selectField,
    link,
    empty,
  };
}
