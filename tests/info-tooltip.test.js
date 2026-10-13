import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { createInfoTooltips } from '../src/ui/info-tooltip.js';

function fixture(t, width = 1280, height = 720) {
  const listeners = new Map();
  const attributes = {};
  const anchor = { top: height - 50, bottom: height - 24, right: width - 5 };
  const panel = {
    hidden: true,
    style: {},
    contains: (node) => node === panel,
    getBoundingClientRect: () => ({
      width: Math.min(400, width - 24),
      height: 300,
    }),
  };
  const button = {
    dataset: { infoTooltip: 'help' },
    contains: (node) => node === button,
    closest: (selector) => (selector === '[data-info-tooltip]' ? button : null),
    setAttribute: (key, value) => {
      attributes[key] = value;
    },
    getBoundingClientRect: () => anchor,
  };
  const outside = { closest: () => null };
  const previous = ['document', 'window'].map((key) => [
    key,
    Object.getOwnPropertyDescriptor(globalThis, key),
  ]);
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      addEventListener: (name, handler) => listeners.set(name, handler),
      getElementById: () => panel,
    },
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      innerWidth: width,
      innerHeight: height,
      addEventListener() {},
    },
  });
  let updates = 0;
  const controller = createInfoTooltips({
    updateFormGuidance: () => updates++,
  });
  controller.bindInfoTooltips();
  t.after(() => {
    controller.dismissInfoTooltip();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  function dispatch(name, target = button, extra = {}) {
    const event = {
      target,
      relatedTarget: null,
      pointerType: 'mouse',
      preventDefault() {},
      ...extra,
    };
    listeners.get(name)(event);
    return event;
  }
  return {
    dispatch,
    panel,
    button,
    outside,
    attributes,
    updates: () => updates,
  };
}

test('hover help opens without a click and stays readable while moving onto the tooltip', async (t) => {
  const f = fixture(t);
  f.dispatch('pointerover');
  assert.equal(f.panel.hidden, false);
  assert.equal(f.attributes['aria-expanded'], 'true');
  assert.equal(f.updates(), 1, 'Help must use the current form selection');
  f.dispatch('pointerout', f.button, { relatedTarget: f.panel });
  await delay(220);
  assert.equal(f.panel.hidden, false);
  f.dispatch('pointerout', f.panel, { relatedTarget: f.outside });
  await delay(220);
  assert.equal(f.panel.hidden, true);
  assert.equal(f.attributes['aria-expanded'], 'false');
});

test('touch and keyboard help can be dismissed without submitting or closing the form', (t) => {
  const f = fixture(t);
  f.dispatch('pointerover', f.button, { pointerType: 'touch' });
  assert.equal(f.panel.hidden, true);
  f.dispatch('focusin');
  f.dispatch('click');
  assert.equal(
    f.panel.hidden,
    false,
    'Focus followed by a tap must keep help open',
  );
  f.dispatch('click');
  assert.equal(f.panel.hidden, true, 'A second tap closes help');
  f.dispatch('focusin');
  let prevented = false,
    stopped = false;
  f.dispatch('keydown', f.button, {
    key: 'Escape',
    preventDefault: () => {
      prevented = true;
    },
    stopImmediatePropagation: () => {
      stopped = true;
    },
  });
  assert(prevented && stopped, 'Escape must not reach the enclosing modal');
  assert.equal(f.panel.hidden, true);
  f.dispatch('click');
  f.dispatch('click', f.outside);
  assert.equal(f.panel.hidden, true, 'An outside tap dismisses help');
});

test('tooltips near the bottom and right of a mobile viewport fit inside its bounds', (t) => {
  const f = fixture(t, 390, 844);
  f.dispatch('focusin');
  const left = Number.parseFloat(f.panel.style.left);
  const top = Number.parseFloat(f.panel.style.top);
  assert(left >= 12 && left + 366 <= 378);
  assert(top >= 12 && top + 300 <= 832);
  f.dispatch('scroll', f.panel);
  assert.equal(
    f.panel.hidden,
    false,
    'Scrolling a long tooltip must not dismiss it',
  );
});
