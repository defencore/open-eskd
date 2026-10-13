export function createInfoTooltips(context) {
  let trigger = null;
  let panel = null;
  let pinned = false;
  let closeTimer;

  function cancelClose() {
    clearTimeout(closeTimer);
  }

  function dismissInfoTooltip() {
    cancelClose();
    if (panel) panel.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    trigger = panel = null;
    pinned = false;
  }

  function position() {
    const margin = 12;
    panel.style.maxHeight = `${Math.max(100, window.innerHeight - margin * 2)}px`;
    const anchor = trigger.getBoundingClientRect();
    const box = panel.getBoundingClientRect();
    const left = Math.max(
      margin,
      Math.min(
        anchor.right - box.width,
        window.innerWidth - box.width - margin,
      ),
    );
    const below = anchor.bottom + 8;
    const top =
      below + box.height <= window.innerHeight - margin
        ? below
        : Math.max(margin, anchor.top - box.height - 8);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  function open(button, pin = false) {
    cancelClose();
    if (trigger !== button) dismissInfoTooltip();
    context.updateFormGuidance(button);
    trigger = button;
    panel = document.getElementById(button.dataset.infoTooltip);
    pinned = pinned || pin;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    position();
  }

  function inside(node) {
    return node && (trigger?.contains(node) || panel?.contains(node));
  }

  function deferClose() {
    cancelClose();
    if (!pinned) closeTimer = setTimeout(dismissInfoTooltip, 180);
  }

  function bindInfoTooltips() {
    document.addEventListener('pointerover', (event) => {
      if (event.pointerType === 'touch') return;
      const button = event.target.closest('[data-info-tooltip]');
      if (button && !button.contains(event.relatedTarget)) open(button);
      else if (inside(event.target)) cancelClose();
    });
    document.addEventListener('pointerout', (event) => {
      if (inside(event.target) && !inside(event.relatedTarget)) deferClose();
    });
    document.addEventListener('focusin', (event) => {
      const button = event.target.closest('[data-info-tooltip]');
      if (button) open(button);
      else if (!inside(event.target)) dismissInfoTooltip();
    });
    document.addEventListener('focusout', (event) => {
      if (!inside(event.relatedTarget)) deferClose();
    });
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-info-tooltip]');
      if (button) {
        event.preventDefault();
        if (trigger === button && pinned) dismissInfoTooltip();
        else open(button, true);
      } else if (!inside(event.target)) dismissInfoTooltip();
    });
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape' && panel) {
          event.preventDefault();
          event.stopImmediatePropagation();
          dismissInfoTooltip();
        }
      },
      true,
    );
    document.addEventListener(
      'scroll',
      (event) => {
        if (!panel || panel.contains(event.target)) return;
        const anchor = trigger.getBoundingClientRect();
        const bounds = trigger
          .closest('.modal-body')
          ?.getBoundingClientRect() || { top: 0, bottom: window.innerHeight };
        if (anchor.bottom <= bounds.top || anchor.top >= bounds.bottom)
          dismissInfoTooltip();
        else position();
      },
      true,
    );
    window.addEventListener('resize', dismissInfoTooltip);
  }

  return { bindInfoTooltips, dismissInfoTooltip };
}
