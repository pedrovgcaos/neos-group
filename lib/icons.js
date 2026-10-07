// Ícones de linha (24x24, stroke). Compartilhado entre o site (servidor) e o painel admin.
(function (root, factory) {
  const icons = factory();
  if (typeof module === 'object' && module.exports) module.exports = icons;
  else root.NEOS_ICONS = icons;
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    water: '<path d="M12 3c3.6 4.4 6 7.6 6 10.6a6 6 0 0 1-12 0C6 10.6 8.4 7.4 12 3Z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
    drop: '<path d="M12 3c3.6 4.4 6 7.6 6 10.6a6 6 0 0 1-12 0C6 10.6 8.4 7.4 12 3Z"/>',
    tank: '<ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-12"/><path d="M5 11.5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
    filter: '<rect x="3" y="5" width="18" height="12" rx="1"/><path d="M7 5v12M11 5v12M15 5v12M19 5v12"/><path d="M8 21h8"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14 -1.5 7 5-2.5 5 2.5-1.5-7"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2Z"/><path d="M14.5 6.5 17 4l3 3-2.5 2.5"/>',
    recycle: '<path d="M7 19H4.5a1.5 1.5 0 0 1-1.3-2.2L5.5 13"/><path d="M11 19h8.5a1.5 1.5 0 0 0 1.3-2.2L18 12"/><path d="m14 16-3 3 3 3"/><path d="M9.5 8.5 11.2 5.6a1.5 1.5 0 0 1 2.6 0L16 9.5"/><path d="m8.5 4.5 1 4-4 1"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="m9 13 2 2 4-4"/>',
    leaf: '<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19 13 11"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    compass: '<path d="M12 3v3"/><circle cx="12" cy="8" r="2"/><path d="M10.8 9.7 5 21M13.2 9.7 19 21"/><path d="M6.5 16h11"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    gauge: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 4-5"/><path d="M4 17h16"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    feather: '<path d="M20 4c-6 0-12 4-12 11v5"/><path d="M8 15c5 0 9-3 10-8"/><path d="M8 11h6"/>',
    trend: '<path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/>',
    factory: '<path d="M3 21V10l5 3V10l5 3V6l8 4v11Z"/><path d="M7 17h2M12 17h2M17 17h2"/>',
    shield: '<path d="M12 3 4.5 6v6c0 4.6 3.2 7.6 7.5 9 4.3-1.4 7.5-4.4 7.5-9V6L12 3Z"/>',
    bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z"/>',
    grid: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>',
    palette: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><circle cx="12" cy="16" r="3"/>',
    check: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 6 8.5 7 8.5-7"/>',
    pin: '<path d="M12 21s-7-6.3-7-11.5a7 7 0 0 1 14 0C19 14.7 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
  };
});
