'use strict';
/* Atelier Couture — interface tactile */
(function () {
  const AC = window.AC, E = AC.E;
  const $ = (s, r) => (r || document).querySelector(s);
  function h(tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (k === 'class') el.className = v; else if (k === 'html') el.innerHTML = v; else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
    }
    for (let i = 2; i < arguments.length; i++) [].concat(arguments[i]).forEach(c => { if (c == null || c === false) return; el.append(c.nodeType ? c : document.createTextNode(c)); });
    return el;
  }
  const IC = {
    menu: 'M4 7h16M4 12h16M4 17h16', undo: 'M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-4', redo: 'M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h4',
    sym: 'M12 3v18M8 7l-5 5 5 5M16 7l5 5-5 5', guide: 'M5 3v18M5 6h5M5 10h3M5 14h5M5 18h3M13 4h6v16h-6z', export: 'M12 3v12M7 8l5-5 5 5M5 14v6h14v-6',
    panel: 'M3 5h18v14H3zM15 5v14', brush: 'M15 4l5 5-8.5 8.5a3 3 0 0 1-2 .8H6v-3.5a3 3 0 0 1 .8-2zM13 6l5 5M6 18c-1 2-2.5 3-4 3 .5-1.5 1-3 4-3',
    eraser: 'M8 20h12M5.5 14.5l7-7a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L13 19H9l-3.5-3.5a1 1 0 0 1 0-1zM10 10l6 6',
    fill: 'M4 12l7-7 8 8-7 7zM4 12h15M20 16s2 2.4 2 3.8a2 2 0 0 1-4 0c0-1.4 2-3.8 2-3.8z', picker: 'M14.5 5.5l4 4M19 3l2 2-3.5 3.5-2-2zM13 7l4 4-8 8H5v-4z',
    select: 'M5 3l13 7-5.5 1.8L10.5 18z', hand: 'M8 12V6a1.5 1.5 0 0 1 3 0v5M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v7a7 7 0 0 1-7 7h-.5a5 5 0 0 1-4-2l-2.8-3.6a1.5 1.5 0 0 1 2.3-2L8 14',
    plus: 'M12 5v14M5 12h14', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    eyeoff: 'M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.8M6.6 6.7C3.8 8.5 2 12 2 12s3.6 6 10 6a9.6 9.6 0 0 0 4.4-1M9.9 9.9a3 3 0 0 0 4.2 4.2',
    lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3', unlock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 6.8-1.2', copy: 'M8 8h11v12H8zM5 16V4h11',
    flip: 'M12 3v18M9 6 3 18h6zM15 6l6 12h-6z', up: 'M12 19V5M6 11l6-6 6 6', down: 'M12 5v14M6 13l6 6 6-6',
    spark: 'M12 3l1.8 4.6L18.5 9l-4.7 1.6L12 15l-1.8-4.4L5.5 9l4.7-1.4zM18.5 15l.8 2 2 .7-2 .8-.8 2-.8-2-2-.8 2-.7z', close: 'M6 6l12 12M18 6 6 18',
    image: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9.5h.01', reset: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4', fabric: 'M4 6c3-2 5 2 8 0s5-2 8 0v12c-3-2-5 2-8 0s-5-2-8 0z',
    doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7', gem: 'M6 4h12l3 5-9 11L3 9zM3 9h18M9 4l3 16 3-16'
  };
  const I = n => '<svg class="i" viewBox="0 0 24 24"><path d="' + IC[n] + '"/></svg>';
  const Ie = n => { const s = document.createElement('span'); s.innerHTML = I(n); return s.firstChild; };

  /* ---------- Toast ---------- */
  let toastT = null;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200); }
  E.on('toast', toast);

  /* ---------- Popover ---------- */
  let popAnchor = null;
  function openPop(anchor, build) {
    const pop = $('#pop');
    if (!pop.hidden && popAnchor === anchor) { closePop(); return; }
    pop.innerHTML = ''; build(pop); pop.hidden = false; popAnchor = anchor;
    const r = anchor.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
    let x = r.right + 10, y = r.top - 10;
    if (x + pw > innerWidth - 8) x = Math.max(8, r.left - pw - 10);
    if (y + ph > innerHeight - 8) y = Math.max(8, innerHeight - ph - 8);
    pop.style.left = x + 'px'; pop.style.top = y + 'px';
  }
  function closePop() { $('#pop').hidden = true; popAnchor = null; }
  document.addEventListener('pointerdown', e => { const p = $('#pop'); if (!p.hidden && !p.contains(e.target) && !(popAnchor && popAnchor.contains(e.target))) closePop(); }, true);

  /* ---------- Modale ---------- */
  function modal(build, onClose) {
    const m = $('#modal'), sh = $('.sheet', m);
    sh.innerHTML = ''; build(sh, closeModal); m.hidden = false;
    m.onpointerdown = e => { if (e.target === m) closeModal(); };
    function closeModal() { m.hidden = true; sh.innerHTML = ''; if (onClose) onClose(); }
    return closeModal;
  }
  function ask(title, text, buttons) {
    return new Promise(res => {
      modal((sh, close) => {
        sh.append(h('h2', { text: title }), h('p', { class: 'muted', text: text }),
          h('div', { class: 'btns', style: 'justify-content:flex-end;margin-top:14px' }, buttons.map(b => h('button', { class: 'btn' + (b.gold ? ' gold' : ''), text: b.label, onclick: () => { close(); res(b.value); } }))));
      }, () => res(null));
    });
  }
  const sheetHead = (title, close, extra) => h('div', { class: 'hd' }, h('h2', { text: title }), h('div', { class: 'row' }, extra || null, h('button', { class: 'ib', html: I('close'), title: 'Fermer', onclick: close })));

  /* ---------- Curseur vertical ---------- */
  function vslider(el, o) {
    el.innerHTML = '<div class="fill"></div><div class="knob"></div><div class="lab"></div><div class="bubble"></div>';
    const fill = $('.fill', el), knob = $('.knob', el), lab = $('.lab', el), bub = $('.bubble', el);
    lab.textContent = o.label;
    const toT = v => Math.pow((v - o.min) / (o.max - o.min), 1 / (o.curve || 1));
    const fromT = t => o.min + (o.max - o.min) * Math.pow(t, o.curve || 1);
    function paint() {
      const t = Math.max(0, Math.min(1, toT(o.get()))), hh = el.clientHeight || 110;
      knob.style.top = ((1 - t) * (hh - 34) + 3) + 'px'; fill.style.height = (t * (hh - 34) + 31) + 'px';
      bub.textContent = o.fmt(o.get()); bub.style.top = ((1 - t) * (hh - 34)) + 'px';
    }
    function at(e) { const r = el.getBoundingClientRect(); const t = 1 - (e.clientY - r.top - 17) / (r.height - 34); o.set(fromT(Math.max(0, Math.min(1, t)))); paint(); }
    el.addEventListener('pointerdown', e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (_) { } el.classList.add('drag'); at(e); });
    el.addEventListener('pointermove', e => { if (el.classList.contains('drag')) at(e); });
    const up = () => { el.classList.remove('drag'); if (o.end) o.end(); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    return paint;
  }

  /* ---------- Sélecteur de couleur ---------- */
  function colorPicker(box, get, set, opts) {
    opts = opts || {};
    let [hh, ss, vv] = AC.rgb2hsv(...AC.hex2rgb(get()));
    const sv = h('div', { class: 'sv' }), svc = h('canvas', { width: 280, height: 160 }), svk = h('div', { class: 'k' });
    sv.append(svc, svk);
    const hue = h('div', { class: 'hue' }), hk = h('div', { class: 'k' }); hue.append(hk);
    const hex = h('input', { class: 'search', value: get(), maxlength: 7, style: 'margin:0;width:110px;height:34px', spellcheck: 'false', 'aria-label': 'Code couleur' });
    const prev = h('span', { class: 'sw', style: 'width:34px;height:34px' });
    function drawSV() {
      const g = svc.getContext('2d'), w = svc.width, ht = svc.height;
      g.fillStyle = AC.rgb2hex(...AC.hsv2rgb(hh, 1, 1)); g.fillRect(0, 0, w, ht);
      let gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, ht);
      gr = g.createLinearGradient(0, 0, 0, ht); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, w, ht);
    }
    function paint() {
      svk.style.left = (ss * 100) + '%'; svk.style.top = ((1 - vv) * 100) + '%';
      hk.style.left = (hh / 360 * 100) + '%';
      const c = AC.rgb2hex(...AC.hsv2rgb(hh, ss, vv)); prev.style.background = c;
      if (document.activeElement !== hex) hex.value = c;
    }
    function commit() { set(AC.rgb2hex(...AC.hsv2rgb(hh, ss, vv))); paint(); }
    function drag(el, fn) {
      el.addEventListener('pointerdown', e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (_) { } el._d = 1; fn(e); });
      el.addEventListener('pointermove', e => { if (el._d) fn(e); });
      el.addEventListener('pointerup', () => { el._d = 0; }); el.addEventListener('pointercancel', () => { el._d = 0; });
    }
    drag(sv, e => { const r = sv.getBoundingClientRect(); ss = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); vv = 1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)); commit(); });
    drag(hue, e => { const r = hue.getBoundingClientRect(); hh = Math.max(0, Math.min(359.9, (e.clientX - r.left) / r.width * 360)); drawSV(); commit(); });
    hex.addEventListener('change', () => { const v = hex.value.trim(); if (/^#?[0-9a-f]{6}$/i.test(v)) { const c = v[0] === '#' ? v : '#' + v; [hh, ss, vv] = AC.rgb2hsv(...AC.hex2rgb(c)); drawSV(); set(c); paint(); } });
    const setFrom = c => { [hh, ss, vv] = AC.rgb2hsv(...AC.hex2rgb(c)); drawSV(); set(c); paint(); renderSw(); };
    box.append(sv, hue, h('div', { class: 'row', style: 'margin-bottom:10px' }, prev, hex));
    const swBox = h('div'); box.append(swBox);
    let palIdx = opts.palette || 0;
    function renderSw() {
      swBox.innerHTML = '';
      if (E.recent.length) { swBox.append(h('div', { class: 'pal-name', text: 'Récentes' }), h('div', { class: 'sws' }, E.recent.map(c => h('button', { class: 'sw' + (c === get() ? ' on' : ''), style: 'background:' + c, title: c, onclick: () => setFrom(c) })))); }
      const chips = h('div', { class: 'chips', style: 'margin:4px 0 0;padding:0 0 6px' }, AC.PALETTES.map((p, i) => h('button', { class: 'chip' + (i === palIdx ? ' on' : ''), text: p.name, onclick: () => { palIdx = i; renderSw(); } })));
      swBox.append(chips, h('div', { class: 'sws' }, AC.PALETTES[palIdx].c.map(c => h('button', { class: 'sw' + (c === get() ? ' on' : ''), style: 'background:' + c, title: AC.colorName(c), onclick: () => setFrom(c) }))));
    }
    drawSV(); paint(); renderSw();
  }

  /* ---------- Barre d'outils ---------- */
  const TOOLS = [['brush', 'Pinceau', 'brush'], ['eraser', 'Gomme', 'eraser'], ['fill', 'Remplir avec le tissu', 'fill'], ['picker', 'Pipette', 'picker'], ['select', 'Modules : sélectionner, déplacer', 'select'], ['hand', 'Déplacer la feuille', 'hand']];
  const HINTS = {
    select: 'Touchez un module pour le sélectionner et faites-le glisser. Poignées : rotation (en haut) et taille (coin).',
    fill: 'Touchez une zone fermée : elle se remplit avec le tissu actif. Astuce : remplissez sur le calque « Couleurs », sous le trait.',
    picker: 'Touchez la feuille pour prélever une couleur de trait.',
    hand: 'Glissez pour déplacer la feuille. Avec deux doigts : pincer pour zoomer.',
    eraser: 'La gomme efface sur le calque actif. Réglez sa taille avec le curseur.'
  };
  const hinted = new Set();
  let paintSize, paintOp;
  function buildTools() {
    const nav = $('#tools');
    TOOLS.forEach(([id, title, ic]) => {
      const b = h('button', { class: 'tool', 'data-tool': id, title, 'aria-label': title, html: I(ic) + (id === 'brush' ? '<span class="badge"></span>' : '') });
      let lp = null;
      b.addEventListener('pointerdown', () => { if (id === 'brush') lp = setTimeout(() => { lp = 'done'; openBrushPop(b); }, 450); });
      b.addEventListener('pointerup', () => { if (lp && lp !== 'done') clearTimeout(lp); });
      b.addEventListener('click', () => {
        if (lp === 'done') { lp = null; return; } lp = null;
        if (id === 'brush' && E.tool === 'brush') { openBrushPop(b); return; }
        E.setTool(id); closePop();
        if (HINTS[id] && !hinted.has(id)) { hinted.add(id); toast(HINTS[id]); }
      });
      nav.append(b);
    });
    nav.append(h('div', { class: 'tsep' }));
    const s1 = h('div', { class: 'vs', title: 'Taille' }), s2 = h('div', { class: 'vs', title: 'Opacité' });
    nav.append(s1, h('div', { style: 'height:6px;flex:none' }), s2);
    paintSize = vslider(s1, { label: 'Taille', min: 1, max: 200, curve: 2.2, get: () => E.curSet().size, set: v => { E.curSet().size = Math.max(1, Math.round(v)); }, fmt: v => Math.round(v) + ' px' });
    paintOp = vslider(s2, { label: 'Opac.', min: 0.05, max: 1, get: () => E.curSet().op, set: v => { E.curSet().op = Math.round(v * 100) / 100; }, fmt: v => Math.round(v * 100) + ' %' });
    nav.append(h('div', { class: 'tsep' }));
    const bc = h('button', { class: 'swatch', id: 'bColor', title: 'Couleur du trait', 'aria-label': 'Couleur du trait' });
    bc.addEventListener('click', () => openPop(bc, pop => { pop.append(h('h4', { text: 'Couleur du trait' })); colorPicker(pop, () => E.color, c => E.setColor(c)); }));
    const bf = h('button', { class: 'fswatch', id: 'bFabric', title: 'Tissu actif', 'aria-label': 'Tissu actif' }, h('canvas', { width: 88, height: 88 }));
    bf.addEventListener('click', () => openFabricPop(bf));
    nav.append(bc, h('div', { class: 'tcap', text: 'Trait' }), h('div', { style: 'height:6px;flex:none' }), bf, h('div', { class: 'tcap', text: 'Tissu' }));
    const syncTools = () => {
      document.querySelectorAll('.tool').forEach(b => b.classList.toggle('on', b.dataset.tool === E.tool));
      const tb = $('.tool[data-tool=brush]'); tb.title = 'Pinceau : ' + AC.BRUSHES[E.brush].name + ' (toucher à nouveau pour changer)';
      paintSize(); paintOp();
    };
    E.on('tool', syncTools); E.on('brush', syncTools); syncTools();
    const syncColor = () => { bc.style.background = E.color; };
    E.on('color', syncColor); syncColor();
    const syncFab = () => { AC.drawSwatch($('canvas', bf), E.fabric, E.fcolor, E.fcolor2); updateSelbar(); };
    E.on('fabric', syncFab); syncFab();
  }
  function openBrushPop(anchor) {
    openPop(anchor, pop => {
      pop.append(h('h4', { text: 'Pinceaux' }));
      const list = h('div', { class: 'brushes' });
      Object.keys(AC.BRUSHES).filter(k => k !== 'gomme').forEach(k => {
        const c = h('canvas', { width: 260, height: 80 });
        const b = h('button', { class: 'brush' + (k === E.brush ? ' on' : ''), onclick: () => { E.setBrush(k); closePop(); toast(AC.BRUSHES[k].name + (k === 'tissu' ? ' : peint avec le tissu actif.' : '')); } }, c, h('span', { text: AC.BRUSHES[k].name }));
        list.append(b); E.brushPreview(c, k);
      });
      pop.append(list, h('p', { class: 'muted', text: 'Le stylet module l’épaisseur et l’opacité selon la pression. Au doigt, l’encre s’affine avec la vitesse.' }));
    });
  }
  function openFabricPop(anchor) {
    openPop(anchor, pop => {
      pop.style.width = '330px';
      pop.append(h('h4', { text: 'Tissu actif' }), h('p', { class: 'muted', style: 'margin:-6px 0 8px', text: 'Utilisé par les nouveaux modules, le remplissage et le pinceau tissu.' }));
      const grid = h('div', { class: 'fabgrid' });
      const drawAll = () => {
        grid.innerHTML = '';
        AC.FABRICS.forEach(f => {
          const c = h('canvas', { width: 120, height: 120 });
          grid.append(h('button', { class: 'fab' + (f.id === E.fabric ? ' on' : ''), onclick: () => { E.setFabric({ fabric: f.id }); drawAll(); } }, c, f.name.split(' (')[0]));
          AC.drawSwatch(c, f.id, E.fcolor, E.fcolor2);
        });
      };
      drawAll();
      pop.append(grid, h('div', { class: 'pal-name', style: 'margin-top:12px;font-weight:600;color:#1f1b24', text: 'Couleur du tissu' }));
      const cb = h('div'); pop.append(cb);
      colorPicker(cb, () => E.fcolor, c => { E.setFabric({ fcolor: c }); drawAll(); }, { palette: 1 });
      pop.append(h('div', { class: 'pal-name', style: 'font-weight:600;color:#1f1b24', text: 'Couleur secondaire (motif du wax)' }),
        h('div', { class: 'sws' }, AC.PALETTES[2].c.concat(['#c9a227', '#1f3a5f']).map(c => h('button', { class: 'sw' + (c === E.fcolor2 ? ' on' : ''), style: 'background:' + c, onclick: e => { E.setFabric({ fcolor2: c }); drawAll(); e.currentTarget.parentNode.querySelectorAll('.sw').forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); } }))),
        h('div', { class: 'pal-name', style: 'font-weight:600;color:#1f1b24', text: 'Broderies, boutons et ornements' }),
        h('div', { class: 'sws' }, AC.PALETTES[7].c.concat(['#7b1e34', '#0b2e59', '#ffffff']).map(c => h('button', { class: 'sw' + (c === E.trim ? ' on' : ''), style: 'background:' + c, onclick: e => { E.setFabric({ trim: c }); e.currentTarget.parentNode.querySelectorAll('.sw').forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); } }))));
    });
  }

  /* ---------- Barre du haut ---------- */
  function buildTop() {
    $('#bMenu').innerHTML = I('menu'); $('#bUndo').innerHTML = I('undo'); $('#bRedo').innerHTML = I('redo'); $('#bPanel').innerHTML = I('panel');
    $('#bSym i').outerHTML = I('sym'); $('#bGuide i').outerHTML = I('guide'); $('#bExport i').outerHTML = I('export');
    $('#bUndo').onclick = () => E.doUndo(); $('#bRedo').onclick = () => E.doRedo();
    $('#bSym').onclick = () => { E.sym = !E.sym; $('#bSym').classList.toggle('on', E.sym); E.requestRender(); toast(E.sym ? 'Symétrie activée : chaque trait est reflété de l’autre côté de l’axe.' : 'Symétrie désactivée.'); };
    $('#bGuide').onclick = () => { E.guide = !E.guide; $('#bGuide').classList.toggle('on', E.guide); E.requestRender(); E.emit('guide'); };
    $('#bExport').onclick = showExport;
    $('#bMenu').onclick = showProjects;
    $('#bPanel').onclick = () => { $('#panel').classList.toggle('closed'); };
    const nm = $('#pName');
    nm.addEventListener('change', () => E.rename(nm.value.trim()));
    nm.addEventListener('keydown', e => { if (e.key === 'Enter') nm.blur(); });
    E.on('project', () => { nm.value = E.project.name; });
    E.on('undo', () => { $('#bUndo').disabled = !E.undo.length; $('#bRedo').disabled = !E.redo.length; });
    const st = $('#saveState');
    E.on('dirty', () => { st.textContent = AC.DB.db ? 'Modifications…' : 'Non enregistré'; });
    E.on('saved', () => { st.textContent = 'Enregistré ✓'; });
    $('#bZoomIn').onclick = () => E.zoomBy(1.25); $('#bZoomOut').onclick = () => E.zoomBy(0.8); $('#bZoomFit').onclick = () => E.fit();
    E.on('view', () => { $('#bZoomFit').textContent = Math.round(E.view.s * 100) + ' %'; });
  }

  /* ---------- Panneau ---------- */
  let curTab = 'modules';
  function buildPanel() {
    const tabs = [['layers', 'Calques'], ['modules', 'Modules'], ['atelier', 'Atelier'], ['fiche', 'Fiche']];
    const bar = $('#panel .tabs');
    tabs.forEach(([id, name]) => bar.append(h('button', { 'data-tab': id, text: name, onclick: () => showTab(id) })));
    showTab(curTab);
    if (innerWidth <= 980) $('#panel').classList.add('closed');
  }
  function showTab(id) {
    curTab = id;
    document.querySelectorAll('#panel .tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === id));
    document.querySelectorAll('#panel .tabc').forEach(s => { s.hidden = s.id !== 'tab-' + id; });
    ({ layers: renderLayers, modules: renderModulesTab, atelier: renderAtelier, fiche: renderFiche })[id]();
  }
  AC.showTab = id => { $('#panel').classList.remove('closed'); showTab(id); };

  /* Calques */
  const thumbs = new Map();
  function renderLayers() {
    const box = $('#tab-layers'); if (box.hidden) return;
    box.innerHTML = ''; thumbs.clear();
    const fileIn = h('input', { type: 'file', accept: 'image/*', hidden: true, onchange: () => {
      const f = fileIn.files[0]; if (!f) return;
      const url = URL.createObjectURL(f), im = new Image();
      im.onload = () => { E.importImage(im); URL.revokeObjectURL(url); toast('Image importée sur un nouveau calque (opacité 60 %) : idéale comme référence.'); };
      im.src = url;
    } });
    box.append(h('div', { class: 'row', style: 'justify-content:space-between' }, h('h3', { text: 'Calques' }),
      h('div', { class: 'btns' }, h('button', { class: 'btn small', html: I('plus') + 'Calque', onclick: () => E.addLayer() }), h('button', { class: 'btn small', html: I('image') + 'Image', onclick: () => fileIn.click() }))), fileIn);
    E.layers.slice().reverse().forEach(l => {
      const c = h('canvas', { width: 80, height: 112 }); thumbs.set(l.id, c); E.layerThumb(l, c);
      const sub = l.kind === 'template' ? 'Gabarit · ' + AC.SPECS[E.tpl.g].name.toLowerCase() + ', ' + ({ face: 'face', dos: 'dos', profil: 'profil' })[E.tpl.v] : l.kind === 'modules' ? E.modules.length + ' module(s)' : Math.round(l.opacity * 100) + ' %';
      const eye = h('button', { class: 'ib', title: l.visible ? 'Masquer' : 'Afficher', html: I(l.visible ? 'eye' : 'eyeoff'), onclick: ev => { ev.stopPropagation(); E.setLayerProp(l.id, 'visible', !l.visible); renderLayers(); } });
      const lock = l.kind === 'template' ? null : h('button', { class: 'ib', title: l.locked ? 'Déverrouiller' : 'Verrouiller', html: I(l.locked ? 'lock' : 'unlock'), style: l.locked ? '' : 'opacity:.45', onclick: ev => { ev.stopPropagation(); E.setLayerProp(l.id, 'locked', !l.locked); renderLayers(); } });
      const on = l.id === E.activeId;
      const row = h('div', { class: 'layer' + (on ? ' on' : '') + (l.visible ? '' : ' hiddenL'), onclick: () => { if (l.kind === 'raster') E.setActive(l.id); else { openL = openL === l.id ? null : l.id; renderLayers(); } } },
        c, h('div', { class: 'ln' }, h('b', { text: l.name }), h('small', { text: sub })), eye, lock);
      box.append(row);
      if (on || openL === l.id) {
        const op = h('input', { type: 'range', min: 0, max: 100, value: Math.round(l.opacity * 100), oninput: () => { E.setLayerProp(l.id, 'opacity', op.value / 100); } });
        const opts = h('div', { class: 'lopts' }, h('div', { class: 'muted', text: 'Opacité' }), op);
        if (l.kind === 'raster') opts.append(h('div', { class: 'btns' },
          h('button', { class: 'btn small', text: 'Renommer', onclick: () => { const n = prompt('Nom du calque', l.name); if (n) { l.name = n; E.changed(); renderLayers(); } } }),
          h('button', { class: 'btn small', html: I('copy'), title: 'Dupliquer', onclick: () => E.duplicateLayer() }),
          h('button', { class: 'btn small', html: I('up'), title: 'Monter', onclick: () => E.moveLayer(l.id, 1) }),
          h('button', { class: 'btn small', html: I('down'), title: 'Descendre', onclick: () => E.moveLayer(l.id, -1) }),
          h('button', { class: 'btn small', text: 'Effacer', onclick: () => E.clearLayer(l.id) }),
          h('button', { class: 'btn small', html: I('trash'), title: 'Supprimer', onclick: () => E.deleteLayer(l.id) })));
        if (l.kind === 'template') opts.append(h('button', { class: 'btn small', text: 'Changer de silhouette…', onclick: showTemplate }));
        if (l.kind === 'modules') opts.append(h('div', { class: 'btns' }, h('button', { class: 'btn small', html: I('up'), title: 'Monter', onclick: () => E.moveLayer(l.id, 1) }), h('button', { class: 'btn small', html: I('down'), title: 'Descendre', onclick: () => E.moveLayer(l.id, -1) })));
        box.append(opts);
      }
    });
    box.append(h('p', { class: 'muted', text: 'Conseil : tracez le croquis sur « Croquis », la couleur sur « Couleurs » (en dessous). Les modules restent modifiables sur leur propre calque. Annuler : ↶ ou tap à deux doigts ; rétablir : tap à trois doigts.' }));
  }
  let openL = null;
  E.on('layers', renderLayers); E.on('tpl', renderLayers);
  E.on('thumbs', () => { thumbs.forEach((c, id) => { const l = E.layerById(id); if (l) E.layerThumb(l, c); }); });

  /* Modules */
  let modCat = 'ensemble';
  const thumbCache = new Map();
  function cachedThumb(key, items, target) {
    let src = thumbCache.get(key);
    if (!src) { src = document.createElement('canvas'); src.width = target.width; src.height = target.height; AC.moduleThumb(src, items, E.tpl.g === 'enfant' ? 'enfant' : E.tpl.g, 'face'); thumbCache.set(key, src); }
    target.getContext('2d').drawImage(src, 0, 0);
  }
  function renderModulesTab() {
    const box = $('#tab-modules'); if (box.hidden) return;
    box.innerHTML = '';
    box.append(h('div', { class: 'chips' }, AC.CATS.map(c => h('button', { class: 'chip' + (c.id === modCat ? ' on' : ''), text: c.name, onclick: () => { modCat = c.id; renderModulesTab(); } }))));
    const grid = h('div', { class: 'grid' });
    const g = E.tpl.g;
    let jobs = [];
    if (modCat === 'ensemble') {
      grid.className = 'grid two';
      const list = AC.ENSEMBLES.slice().sort((a, b) => (b.g.includes(g) ? 1 : 0) - (a.g.includes(g) ? 1 : 0));
      list.forEach(en => {
        const c = h('canvas', { width: 240, height: 336 });
        grid.append(h('button', { class: 'card wide', onclick: () => applyEnsemble(en) }, c, h('b', { text: en.name }), en.g.includes(g) ? null : h('div', { class: 'muted', style: 'font-size:11px', text: 'pensé pour : ' + en.g.join(', ') })));
        jobs.push(() => cachedThumb('ens:' + en.id + ':' + g, en.items, c));
      });
    } else {
      AC.MODS.filter(m => m.cat === modCat).forEach(m => {
        const c = h('canvas', { width: 180, height: 240 });
        grid.append(h('button', { class: 'card', title: m.desc, onclick: () => { const r = E.addModule(m.id); if (r && innerWidth <= 980) $('#panel').classList.add('closed'); } }, c, m.name));
        const items = m.applyNeck ? [['corsage-ajuste', { neck: m.applyNeck, fabric: 'uni', color: '#d9c7b3' }]] : [[m.id, { fabric: 'uni', color: '#d9c7b3' }]];
        jobs.push(() => cachedThumb(m.id + ':' + g, items, c));
      });
    }
    box.append(grid);
    const tip = modCat === 'encolure' ? 'Une encolure s’applique au corsage, à la robe ou au boubou sélectionné (ou au dernier posé).' : modCat === 'ensemble' ? 'Un ensemble pose plusieurs modules coordonnés. Ils s’adaptent à la silhouette (femme, homme, enfant).' : 'Touchez un module pour le poser. Il reprend le tissu actif. Avec l’outil Modules : glisser pour déplacer, poignées pour tourner et agrandir.';
    box.append(h('p', { class: 'muted', text: tip }));
    const run = () => { const j = jobs.shift(); if (j) { j(); requestAnimationFrame(run); } };
    requestAnimationFrame(run);
  }
  async function applyEnsemble(en) {
    let replace = true;
    if (E.modules.length) {
      const r = await ask('Ensemble « ' + en.name + ' »', 'Des modules sont déjà posés. Voulez-vous les remplacer par cet ensemble, ou l’ajouter par-dessus ?', [{ label: 'Annuler', value: null }, { label: 'Ajouter', value: 'add' }, { label: 'Remplacer', value: 'rep', gold: true }]);
      if (!r) return; replace = r === 'rep';
    }
    E.applyEnsemble(en, replace);
    toast('Ensemble posé : modifiez chaque pièce avec l’outil Modules, ou générez des variantes dans l’onglet Atelier.');
    if (innerWidth <= 980) $('#panel').classList.add('closed');
  }
  E.on('tpl', () => { thumbCache.clear(); if (curTab === 'modules') renderModulesTab(); });

  /* Atelier (assistance) */
  let atSub = 'conseils', varMode = 'mixte', lastVars = null, glossQ = '';
  function renderAtelier() {
    const box = $('#tab-atelier'); if (box.hidden) return;
    box.innerHTML = '';
    const subs = [['conseils', 'Conseils'], ['variantes', 'Variantes'], ['proportions', 'Proportions'], ['tissus', 'Tissus'], ['lexique', 'Lexique']];
    box.append(h('div', { class: 'sub' }, subs.map(([id, n]) => h('button', { class: 'chip' + (id === atSub ? ' on' : ''), text: n, onclick: () => { atSub = id; renderAtelier(); } }))));
    if (atSub === 'conseils') {
      const sel = E.selInst();
      if (sel) {
        const a = AC.moduleAdvice(sel);
        const b = h('div', { class: 'box' }, h('h4', { text: a.name }), h('div', { text: a.desc }));
        if (a.neck) b.append(h('p', { style: 'margin:6px 0 0' }, h('b', { text: a.neck.name + ' — ' }), a.neck.desc));
        if (a.tips.length || a.notes.length) b.append(h('ul', null, a.tips.concat(a.notes).map(t => h('li', { text: t }))));
        b.append(h('p', { style: 'margin:8px 0 0' }, h('b', { text: 'Tombé — ' + a.fabric.name + ' : ' }), a.fabric.tombe));
        b.append(h('p', { class: 'muted', style: 'margin:4px 0 0', text: a.fabric.conseil }));
        box.append(h('h3', { text: 'Module sélectionné' }), b);
      } else box.append(h('p', { class: 'muted', text: 'Sélectionnez un module (outil Modules) pour voir ses conseils de construction et de tombé.' }));
      box.append(h('h3', { text: 'Analyse de la silhouette' }));
      AC.analyze(E.modules, E.tpl).forEach(n => box.append(h('div', { class: 'note ' + n.lvl }, h('b', { text: n.t }), n.x)));
    } else if (atSub === 'variantes') {
      box.append(h('p', { class: 'muted', text: 'L’assistant propose des déclinaisons de votre silhouette : autres modules de la même famille, encolures, couleurs et tissus. Touchez une variante pour l’appliquer (↶ pour revenir).' }));
      box.append(h('div', { class: 'seg', style: 'margin-bottom:10px' }, [['forme', 'Formes'], ['couleur', 'Couleurs & tissus'], ['mixte', 'Mixte']].map(([id, n]) => h('button', { class: id === varMode ? 'on' : '', text: n, onclick: () => { varMode = id; renderAtelier(); } }))));
      box.append(h('button', { class: 'btn gold', html: I('spark') + 'Générer 6 variantes', onclick: () => {
        if (!E.modules.length) { toast('Posez d’abord des modules ou un ensemble.'); return; }
        lastVars = { base: JSON.parse(JSON.stringify(E.modules)), list: AC.variants(E.modules, varMode, 6, E.tpl) }; renderAtelier();
      } }));
      if (lastVars) {
        const grid = h('div', { class: 'grid two', style: 'margin-top:12px' }), jobs = [];
        lastVars.list.forEach((v, i) => {
          const c = h('canvas', { width: 240, height: 336 });
          grid.append(h('button', { class: 'card wide', onclick: () => E.setModules(v, 'Variante ' + (i + 1) + ' appliquée — ↶ pour revenir.') }, c, h('div', { text: AC.describeVariant(lastVars.base, v) })));
          jobs.push(() => AC.moduleThumb(c, v.map(x => Object.assign({}, x)), E.tpl.g, E.tpl.v === 'profil' ? 'face' : E.tpl.v));
        });
        box.append(grid);
        const run = () => { const j = jobs.shift(); if (j) { j(); requestAnimationFrame(run); } }; requestAnimationFrame(run);
      }
    } else if (atSub === 'proportions') {
      const P = AC.PROPORTIONS[E.tpl.g];
      const sw = h('button', { class: 'switch' + (E.guide ? ' on' : ''), 'aria-label': 'Afficher les repères', onclick: () => { $('#bGuide').click(); } });
      box.append(h('div', { class: 'setting' }, h('div', { class: 't' }, h('b', { text: 'Repères de proportions' }), h('small', { text: 'Lignes de têtes, taille, hanches, genoux… (jamais exportés)' })), sw));
      box.append(h('h3', { text: P.titre }), h('div', { class: 'box' }, h('ul', { style: 'margin:0' }, P.points.map(t => h('li', { text: t })))));
      box.append(h('h3', { text: 'Méthode de construction' }), h('div', { class: 'box' }, h('ul', { style: 'margin:0' }, AC.PROP_TIPS.map(t => h('li', { text: t })))));
    } else if (atSub === 'tissus') {
      box.append(h('p', { class: 'muted', text: 'Le tombé décide de la coupe. Touchez « Utiliser » pour en faire le tissu actif.' }));
      AC.FABRICS.forEach(f => {
        const c = h('canvas', { width: 108, height: 108 }); AC.drawSwatch(c, f.id, E.fcolor, E.fcolor2);
        const p = f.props, bar = (n, v) => n + ' ' + '●'.repeat(v) + '○'.repeat(3 - v);
        box.append(h('div', { class: 'fabrow' }, c, h('div', null, h('b', { text: f.name }), h('div', { class: 'muted', text: [bar('Fluidité', p.drape), bar('Tenue', p.struct), bar('Brillance', p.sheen)].join(' · ') }), h('div', { text: f.tombe }), h('div', { class: 'muted', style: 'margin:3px 0 5px', text: f.conseil }),
          h('button', { class: 'btn small', text: E.fabric === f.id ? 'Tissu actif ✓' : 'Utiliser', onclick: () => { E.setFabric({ fabric: f.id }); renderAtelier(); } }))));
      });
    } else {
      const s = h('input', { class: 'search', placeholder: 'Rechercher un terme (pince, biais, bazin…)', value: glossQ });
      const list = h('div');
      const fill = () => { const q = s.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); glossQ = s.value; list.innerHTML = '';
        AC.GLOSSARY.filter(([t, d]) => !q || (t + ' ' + d).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)).forEach(([t, d]) => list.append(h('div', { class: 'gl' }, h('b', { text: t }), h('div', { text: d })))); };
      s.addEventListener('input', fill); box.append(s, list); fill();
    }
  }
  const reAtelier = () => { if (curTab === 'atelier' && (atSub === 'conseils' || atSub === 'proportions')) renderAtelier(); };
  E.on('modules', reAtelier); E.on('select', reAtelier); E.on('guide', reAtelier); E.on('tpl', reAtelier);

  /* Fiche technique */
  function renderFiche() {
    const box = $('#tab-fiche'); if (box.hidden) return;
    box.innerHTML = '';
    const f = E.fiche;
    const fld = (k, label) => h('label', { class: 'field' }, h('span', { text: label }), h('input', { value: f[k] || '', onchange: e => { f[k] = e.target.value; E.changed(); } }));
    box.append(h('h3', { text: 'Fiche technique' }), fld('maison', 'Maison / marque'), fld('modele', 'Nom du modèle'),
      h('div', { class: 'two-col' }, fld('ref', 'Référence'), fld('collection', 'Collection / saison'), fld('client', 'Client(e)'), fld('createur', 'Créateur(trice)')), fld('date', 'Date'));
    box.append(h('h3', { text: 'Nomenclature des tissus' }));
    const { rows, auto } = AC.ficheRows();
    if (f.auto || !f.rows.length) {
      if (!rows.length) box.append(h('p', { class: 'muted', text: 'Posez des modules : la nomenclature (tissu, couleur, emplacement, métrage) se calcule automatiquement.' }));
      rows.forEach(r => { const c = h('canvas', { width: 72, height: 72 }); AC.drawSwatch(c, r.fabric, r.hex, r.hex2);
        box.append(h('div', { class: 'nrow' }, h('div', { class: 'top' }, c, h('div', { style: 'flex:1' }, h('b', { text: r.tissu + ' — ' + r.metrage }), h('div', { class: 'muted', text: r.couleur }))), h('div', { style: 'font-size:13px', text: r.emplacement }))); });
      if (rows.length) box.append(h('p', { class: 'muted', text: 'Métrage indicatif pour une laize de 1,40 m (raccord du wax inclus), à confirmer sur toile.' }),
        h('button', { class: 'btn small', text: 'Modifier la nomenclature', onclick: () => { f.rows = JSON.parse(JSON.stringify(rows)); f.auto = false; E.changed(); renderFiche(); } }));
    } else {
      f.rows.forEach((r, i) => {
        const inp = (k, ph) => h('input', { value: r[k] || '', placeholder: ph, onchange: e => { r[k] = e.target.value; E.changed(); } });
        const c = h('canvas', { width: 72, height: 72 }); AC.drawSwatch(c, r.fabric || 'uni', r.hex || '#cccccc', r.hex2);
        box.append(h('div', { class: 'nrow' }, h('div', { class: 'top' }, c, inp('tissu', 'Tissu'), h('button', { class: 'ib', html: I('trash'), title: 'Supprimer la ligne', onclick: () => { f.rows.splice(i, 1); E.changed(); renderFiche(); } })),
          inp('couleur', 'Couleur'), inp('emplacement', 'Emplacement'), h('div', { class: 'two-col' }, inp('metrage', 'Métrage'), inp('fournisseur', 'Fournisseur / prix'))));
      });
      box.append(h('div', { class: 'btns' }, h('button', { class: 'btn small', html: I('plus') + 'Ligne', onclick: () => { f.rows.push({ tissu: '', couleur: '', emplacement: '', metrage: '', fournisseur: '', fabric: 'uni', hex: '#cccccc' }); E.changed(); renderFiche(); } }),
        h('button', { class: 'btn small', text: 'Revenir au calcul automatique', onclick: () => { f.auto = true; f.rows = []; E.changed(); renderFiche(); } })));
    }
    if (auto.supplies.length) box.append(h('h3', { text: 'Fournitures' }), h('div', { class: 'box' }, h('ul', { style: 'margin:0' }, auto.supplies.map(s => h('li', { text: s })))));
    box.append(h('h3', { text: 'Notes' }), h('label', { class: 'field' }, h('textarea', { placeholder: 'Mesures, finitions, essayages, délais…', onchange: e => { f.notes = e.target.value; E.changed(); } }, f.notes || '')));
    box.append(h('button', { class: 'btn gold', html: I('doc') + 'Exporter la fiche PDF', onclick: () => runExport('pdf', {}) }));
  }
  E.on('fiche', () => { if (curTab === 'fiche') renderFiche(); });
  E.on('modules', () => { if (curTab === 'fiche' && E.fiche.auto) renderFiche(); if (curTab === 'layers') renderLayers(); });

  /* ---------- Barre de sélection de module ---------- */
  function updateSelbar() {
    const bar = $('#selbar'), s = E.selInst();
    if (!s || E.tool !== 'select') { bar.hidden = true; return; }
    const d = AC.MOD[s.id]; bar.hidden = false; bar.innerHTML = '';
    const mini = h('canvas', { class: 'mini', width: 52, height: 52 }); AC.drawSwatch(mini, E.fabric, E.fcolor, E.fcolor2);
    bar.append(h('span', { class: 'nm', text: d.name }));
    const hasPieces = !['broderie', 'fermeture'].includes(d.cat) || d.id === 'dentelle-bordure';
    if (hasPieces) bar.append(h('button', { title: 'Appliquer le tissu actif', onclick: () => E.selAction('fabric') }, mini));
    if (['broderie', 'fermeture'].includes(d.cat) || d.id === 'ceinture-large') bar.append(h('button', { title: 'Appliquer la couleur d’ornement', html: '<span class="mini" style="background:' + E.trim + ';border-radius:50%"></span>', onclick: () => E.selAction('trim') }));
    if (d.top) bar.append(h('select', { title: 'Encolure', onchange: e => E.updateSel({ neck: e.target.value }) }, AC.NECKS.map(n => h('option', { value: n.id, selected: n.id === (s.neck || d.neck) }, n.name))));
    [['flip', 'Miroir', 'flip'], ['dup', 'Dupliquer', 'copy'], ['up', 'Passer devant', 'up'], ['down', 'Passer derrière', 'down'], ['reset', 'Position d’origine', 'reset'], ['delete', 'Supprimer', 'trash']].forEach(([a, t, ic]) => bar.append(h('button', { title: t, 'aria-label': t, html: I(ic), onclick: () => E.selAction(a) })));
    bar.append(h('button', { title: 'Conseils', html: I('spark'), onclick: () => { atSub = 'conseils'; AC.showTab('atelier'); } }), h('button', { title: 'Désélectionner', html: I('close'), onclick: () => E.selAction('deselect') }));
  }
  E.on('select', updateSelbar); E.on('tool', updateSelbar); E.on('modules', updateSelbar);

  /* ---------- Dialogues ---------- */
  function silPicker(box, state, onChange) {
    const prev = h('canvas', { width: 300, height: 424 });
    const draw = () => {
      const g = prev.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 300, 424);
      const sc = 424 / AC.DOC_H; g.setTransform(sc, 0, 0, sc, (300 - AC.DOC_W * sc) / 2, 0);
      AC.drawTemplate(g, state.g, state.v, { lw: 4 });
      if (state.ens) { const L = AC.landmarks(state.g, state.v); state.ens.items.forEach(([id, o]) => AC.drawInst(g, AC.newInst(id, o, {}), L)); }
      g.setTransform(1, 0, 0, 1, 0, 0);
    };
    const segG = h('div', { class: 'seg' }), segV = h('div', { class: 'seg' });
    const paintSeg = () => {
      segG.innerHTML = ''; segV.innerHTML = '';
      AC.GENDERS.forEach(x => segG.append(h('button', { class: x.id === state.g ? 'on' : '', text: x.name, onclick: () => { state.g = x.id; if (state.ens && !state.ens.g.includes(x.id)) state.ens = null; paintSeg(); draw(); onChange && onChange(); } })));
      AC.VIEWS.forEach(x => segV.append(h('button', { class: x.id === state.v ? 'on' : '', text: x.name, onclick: () => { state.v = x.id; paintSeg(); draw(); onChange && onChange(); } })));
    };
    paintSeg(); draw();
    box.append(h('div', { class: 'silprev' }, prev, h('div', { style: 'display:grid;gap:10px;align-content:start' }, h('b', { text: 'Silhouette' }), segG, h('b', { text: 'Vue' }), segV,
      h('p', { class: 'muted', style: 'margin:0', text: 'Croquis de mode : 9 têtes (adulte), 6 têtes (enfant). Les modules s’adaptent à la silhouette choisie.' }))));
    return draw;
  }
  function showNew(first) {
    modal((sh, close) => {
      const st = { g: E.tpl.g || 'femme', v: 'face', ens: null };
      const name = h('input', { class: 'search', value: first ? 'Mon premier croquis' : 'Nouveau croquis', style: 'margin-bottom:12px' });
      sh.append(sheetHead(first ? 'Bienvenue dans l’Atelier' : 'Nouveau croquis', close));
      if (first) sh.append(h('p', { class: 'muted', style: 'margin-top:-4px', text: 'Choisissez une silhouette et, si vous le souhaitez, un ensemble de départ. Vous pourrez tout modifier ensuite.' }));
      sh.append(h('label', { class: 'field' }, h('span', { text: 'Nom du croquis' }), name));
      let ensBox;
      const redraw = silPicker(sh, st, () => paintEns());
      sh.append(h('h3', { text: 'Point de départ', style: 'font:600 18px var(--serif);margin:14px 0 8px' }));
      ensBox = h('div', { class: 'ens' }); sh.append(ensBox);
      function paintEns() {
        ensBox.innerHTML = '';
        const blank = h('button', { class: 'card' + (!st.ens ? ' on' : ''), onclick: () => { st.ens = null; paintEns(); redraw(); } }, h('canvas', { width: 150, height: 200 }), 'Page vierge');
        ensBox.append(blank); AC.moduleThumb($('canvas', blank), [], st.g, 'face');
        AC.ENSEMBLES.filter(e => e.g.includes(st.g)).forEach(en => {
          const c = h('canvas', { width: 150, height: 200 });
          ensBox.append(h('button', { class: 'card' + (st.ens === en ? ' on' : ''), onclick: () => { st.ens = en; paintEns(); redraw(); } }, c, en.name));
          requestAnimationFrame(() => AC.moduleThumb(c, en.items, st.g, 'face'));
        });
      }
      paintEns();
      sh.append(h('div', { class: 'btns', style: 'justify-content:flex-end;margin-top:16px' }, h('button', { class: 'btn', text: 'Annuler', onclick: close }),
        h('button', { class: 'btn gold', text: 'Créer le croquis', onclick: async () => { close(); await E.newProject({ name: name.value.trim() || 'Sans titre', g: st.g, v: st.v, ensemble: st.ens && st.v !== 'profil' ? st.ens : (st.ens || null) }); toast('Croquis créé. Dessinez au stylet ; deux doigts pour zoomer.'); } })));
    });
  }
  function showTemplate() {
    modal((sh, close) => {
      const st = { g: E.tpl.g, v: E.tpl.v };
      sh.append(sheetHead('Changer de silhouette', close));
      silPicker(sh, st);
      sh.append(h('p', { class: 'muted', text: 'Vos dessins ne bougent pas ; les modules se recalculent sur la nouvelle silhouette.' }),
        h('div', { class: 'btns', style: 'justify-content:flex-end' }, h('button', { class: 'btn', text: 'Annuler', onclick: close }), h('button', { class: 'btn gold', text: 'Appliquer', onclick: () => { close(); E.setTemplate(st.g, st.v); } })));
    });
  }
  async function showProjects() {
    if (E.dirty) await E.save();
    const list = await E.listProjects();
    modal((sh, close) => {
      const imp = h('input', { type: 'file', accept: '.atelier,application/json', hidden: true, onchange: async () => {
        const f = imp.files[0]; if (!f) return;
        try { const obj = JSON.parse(await f.text()); close(); await E.deserialize(obj); toast('Projet importé.'); } catch (e) { toast('Import impossible : ' + e.message); }
      } });
      sh.append(sheetHead('Mes croquis', close, h('button', { class: 'btn gold', html: I('plus') + 'Nouveau', onclick: () => { close(); showNew(false); } })), imp);
      if (!AC.DB.db) sh.append(h('div', { class: 'note warn' }, h('b', { text: 'Stockage local indisponible' }), 'Ce navigateur n’autorise pas l’enregistrement (navigation privée ?). Exportez vos croquis en fichier .atelier pour ne rien perdre.'));
      const grid = h('div', { class: 'projects' });
      list.forEach(p => {
        const url = p.thumb ? URL.createObjectURL(new Blob([p.thumb], { type: 'image/jpeg' })) : null;
        const card = h('div', { class: 'proj' + (p.id === E.project.id ? ' cur' : '') }, url ? h('img', { src: url, alt: '' }) : h('div', { class: 'ph' }),
          h('div', { class: 'pi' }, h('b', { text: p.name }), h('div', { class: 'muted', text: new Date(p.updated).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) }),
            h('div', { class: 'btns', style: 'margin-top:6px' },
              h('button', { class: 'btn small gold', text: 'Ouvrir', onclick: async () => { close(); await E.openProject(p.id); toast('« ' + p.name + ' » ouvert.'); } }),
              h('button', { class: 'btn small', html: I('copy'), title: 'Dupliquer', onclick: async () => { await E.duplicateProject(p.id); close(); showProjects(); } }),
              h('button', { class: 'btn small', html: I('trash'), title: 'Supprimer', onclick: async () => {
                const ok = await ask('Supprimer « ' + p.name + ' » ?', 'Le croquis sera effacé de cet appareil. Pensez à l’exporter avant si vous voulez le garder.', [{ label: 'Annuler', value: false }, { label: 'Supprimer', value: true, gold: true }]);
                if (ok) { await E.deleteProject(p.id); if (p.id === E.project.id) { await E.newProject({ name: 'Sans titre', g: 'femme', v: 'face' }); } }
                showProjects();
              } }))));
        grid.append(card);
      });
      sh.append(grid, h('div', { class: 'btns', style: 'margin:12px 0 4px' }, h('button', { class: 'btn', text: 'Importer un fichier .atelier', onclick: () => imp.click() })));
      const S = E.settings;
      const sw = (k, title, sub) => { const b = h('button', { class: 'switch' + (S[k] ? ' on' : ''), onclick: () => { S[k] = !S[k]; b.classList.toggle('on', S[k]); E.saveSettings(); } }); return h('div', { class: 'setting' }, h('div', { class: 't' }, h('b', { text: title }), h('small', { text: sub })), b); };
      const rng = (k, title, sub, min, max, step) => { const r = h('input', { type: 'range', min, max, step, value: S[k], style: 'width:150px', oninput: () => { S[k] = parseFloat(r.value); E.saveSettings(); } }); return h('div', { class: 'setting' }, h('div', { class: 't' }, h('b', { text: title }), h('small', { text: sub })), r); };
      sh.append(h('h3', { text: 'Réglages', style: 'font:600 18px var(--serif);margin:18px 0 4px' }),
        sw('fingerDraw', 'Dessiner au doigt', 'Désactivé : le doigt sert seulement à zoomer et déplacer (le stylet dessine). Se désactive tout seul quand un stylet est détecté.'),
        rng('smoothing', 'Lissage du trait', 'Plus élevé = courbes plus douces, un peu moins réactives.', 0, 0.9, 0.05),
        rng('pressure', 'Courbe de pression', 'À gauche : trait épais même en appuyant peu. À droite : il faut appuyer davantage.', 0.4, 1.8, 0.05));
      sh.append(h('h3', { text: 'Gestes', style: 'font:600 18px var(--serif);margin:18px 0 4px' }), h('div', { class: 'box' }, h('ul', { style: 'margin:0' }, [
        'Deux doigts : pincer pour zoomer, glisser pour déplacer la feuille.', 'Tap à deux doigts : annuler. Tap à trois doigts : rétablir.',
        'Toucher l’outil Pinceau une seconde fois (ou appui long) : choisir le pinceau.', 'Outil Modules : glisser un module, poignées pour tourner et redimensionner.',
        'Clavier (si branché) : Ctrl+Z / Ctrl+Y, B pinceau, E gomme, V modules, [ ] taille, 0 ajuster.'].map(t => h('li', { text: t })))));
    });
  }
  async function runExport(kind, o) {
    toast('Préparation de l’export…');
    await new Promise(r => setTimeout(r, 30));
    try {
      const r = kind === 'png' ? await AC.exportPNG(o) : kind === 'pdf' ? await AC.exportPDF(o) : await AC.exportProject(o);
      if (r === 'download') toast(kind === 'pdf' ? 'Fiche technique PDF prête (téléchargements).' : kind === 'png' ? 'Image PNG prête (téléchargements).' : 'Sauvegarde .atelier prête (téléchargements).');
    } catch (e) { console.error(e); toast('Export impossible : ' + (e.message || e)); }
  }
  function showExport() {
    const o = { template: true, background: true, hd: false, share: false };
    modal((sh, close) => {
      sh.append(sheetHead('Exporter', close));
      const sw = (k, title, sub) => { const b = h('button', { class: 'switch' + (o[k] ? ' on' : ''), onclick: () => { o[k] = !o[k]; b.classList.toggle('on', o[k]); } }); return h('div', { class: 'setting' }, h('div', { class: 't' }, h('b', { text: title }), h('small', { text: sub })), b); };
      sh.append(sw('template', 'Inclure le gabarit', 'Garder la silhouette sous le dessin.'), sw('background', 'Fond blanc', 'Désactivé : fond transparent (PNG).'), sw('hd', 'Haute définition (×2)', '2800 × 3960 px : modules et gabarit recalculés en vectoriel.'));
      if (navigator.canShare) sh.append(sw('share', 'Partager directement', 'Ouvre le menu de partage de la tablette (WhatsApp, Fichiers, e-mail…).'));
      sh.append(h('div', { class: 'grid', style: 'margin-top:16px' },
        h('button', { class: 'card', style: 'padding:14px 8px', onclick: () => { close(); runExport('png', o); } }, Ie('image'), h('b', { text: 'Image PNG' }), h('div', { class: 'muted', text: 'Le croquis seul' })),
        h('button', { class: 'card', style: 'padding:14px 8px', onclick: () => { close(); runExport('pdf', o); } }, Ie('doc'), h('b', { text: 'Fiche technique PDF' }), h('div', { class: 'muted', text: 'Croquis, nomenclature, notes' })),
        h('button', { class: 'card', style: 'padding:14px 8px', onclick: () => { close(); runExport('atelier', o); } }, Ie('copy'), h('b', { text: 'Sauvegarde .atelier' }), h('div', { class: 'muted', text: 'Projet complet, réimportable' }))));
      sh.querySelectorAll('.card svg').forEach(s => { s.style.width = '30px'; s.style.height = '30px'; s.style.margin = '0 auto 6px'; s.style.color = '#a8834a'; });
    });
  }

  /* ---------- Démarrage ---------- */
  async function init() {
    buildTop(); buildTools(); buildPanel();
    E.attach($('#cv'));
    let ok = false;
    try { await AC.DB.open(); ok = true; if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { }); }
    catch (e) { toast('Stockage local indisponible : exportez vos croquis (.atelier) pour les garder.'); }
    let last = null; try { last = localStorage.getItem('ac-last'); } catch (e) { }
    let opened = false;
    if (ok && last) { try { opened = await E.openProject(last); } catch (e) { console.error(e); } }
    if (!opened && ok) { try { const l = await E.listProjects(); if (l.length) opened = await E.openProject(l[0].id); } catch (e) { console.error(e); } }
    if (!opened) { await E.newProject({ name: 'Mon premier croquis', g: 'femme', v: 'face' }); showNew(true); }
    E.emit('undo'); E.emit('view');
    /* Hors ligne : uniquement une fois hébergée (pas sur le serveur de test local, pour voir les modifications tout de suite) */
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
    window.addEventListener('beforeunload', () => { if (E.dirty) E.save(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && E.dirty) E.save(); });
  }
  AC.ui = { toast, showNew, showProjects, showExport, showTab };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
