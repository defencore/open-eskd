const iconPaths = {
  cube: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9M8 5.3l8 4.5v5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  tree: '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-5h14v5"/>',
  file: '<path d="M14 2H5a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  branch:
    '<circle cx="6" cy="4" r="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="6" r="2"/><path d="M6 6v12M6 14h5a7 7 0 0 0 7-6"/>',
  history: '<path d="M3 11a9 9 0 1 1 2.4 7M3 4v7h7M12 7v5l3 2"/>',
  factory:
    '<path d="M3 21V10l6 3V8l6 4V3h4l2 18Z"/><path d="M6 17h1M11 17h1M16 17h1"/>',
  settings:
    '<path d="M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z"/><circle cx="12" cy="12" r="3"/>',
  shield:
    '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-4-4L5 15Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  alert: '<path d="m12 3 10 18H2Z"/><path d="M12 9v5M12 17h.01"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  box: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16M10 4v16"/>',
  bolt: '<path d="m14 2-11 12h8l-1 8 11-12h-8Z"/>',
  merge:
    '<circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/><circle cx="12" cy="4" r="2"/><path d="M6 18v-3c0-5 6-4 6-9M18 18v-3c0-5-6-4-6-9"/>',
  folder: '<path d="M3 6V4h6l2 3h10v13H3Z"/>',
  print:
    '<path d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6Z"/><path d="M17 11h1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
};
export const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.cube}</svg>`;
