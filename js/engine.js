'use strict';
/* Atelier Couture — moteur : calques, pinceaux sensibles à la pression, gestes, annulation, stockage */
(function () {
  const AC = window.AC;
  const W = AC.DOC_W, H = AC.DOC_H;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  const E = AC.E = {
    layers: [], activeId: null, modules: [], selUid: null,
    tpl: { g: 'femme', v: 'face' }, L: null,
    view: { s: 0.4, tx: 0, ty: 0 },
    tool: 'brush', brush: 'encre', prevTool: 'brush',
    color: '#1f1b24', fabric: 'wax', fcolor: '#1f3a5f', fcolor2: '#f2a900', trim: '#c9a227',
    bs: { crayon: { size: 5, op: 0.9 }, encre: { size: 7, op: 1 }, feutre: { size: 16, op: 0.8 }, aquarelle: { size: 46, op: 0.7 }, gouache: { size: 24, op: 0.95 }, tissu: { size: 34, op: 1 }, gomme: { size: 28, op: 1 } },
    sym: false, guide: false,
    settings: { fingerDraw: true, smoothing: 0.35, pressure: 0.85, penSeen: false },
    undo: [], redo: [],
    project: { id: null, name: 'Sans titre', created: 0 },
    fiche: null, dirty: false, recent: []
  };
  const listeners = {};
  E.on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
  E.emit = (ev, a) => { (listeners[ev] || []).forEach(f => { try { f(a); } catch (e) { console.error(e); } }); };
  E.toast = msg => E.emit('toast', msg);

  try { const s = JSON.parse(localStorage.getItem('ac-settings') || 'null'); if (s) Object.assign(E.settings, s); } catch (e) { }
  E.saveSettings = () => { try { localStorage.setItem('ac-settings', JSON.stringify(E.settings)); } catch (e) { } };

  E.defaultFiche = () => ({ maison: 'AWAYEL STORE', modele: '', ref: '', collection: '', client: '', createur: '', date: new Date().toLocaleDateString('fr-FR'), notes: '', rows: [], auto: true });
  E.fiche = E.defaultFiche();

  /* ---------- Calques ---------- */
  let lidN = 1;
  function newLayer(name, kind) {
    const c = mkCanvas(W, H);
    return { id: 'l' + Date.now().toString(36) + (lidN++), name, kind: kind || 'raster', canvas: c, ctx: c.getContext('2d'), visible: true, opacity: kind === 'template' ? 0.75 : 1, locked: false, saveDirty: true };
  }
  E.layerById = id => E.layers.find(l => l.id === id);
  E.active = () => E.layerById(E.activeId);
  E.modLayer = () => E.layers.find(l => l.kind === 'modules');
  E.tplLayer = () => E.layers.find(l => l.kind === 'template');

  E.renderTemplate = function () {
    const l = E.tplLayer(); if (!l) return;
    l.ctx.clearRect(0, 0, W, H);
    AC.drawTemplate(l.ctx, E.tpl.g, E.tpl.v);
  };
  E.renderModulesLayer = function () {
    const l = E.modLayer(); if (!l) return;
    l.ctx.clearRect(0, 0, W, H);
    AC.renderModules(l.ctx, E.modules, E.L);
    modDirty = false;
  };

  E.resetDoc = function (g, v) {
    E.tpl = { g: g || 'femme', v: v || 'face' };
    E.L = AC.landmarks(E.tpl.g, E.tpl.v);
    const t = newLayer('Gabarit', 'template'), col = newLayer('Couleurs'), m = newLayer('Modules', 'modules'), sk = newLayer('Croquis');
    E.layers = [t, col, m, sk]; E.activeId = sk.id;
    E.modules = []; E.selUid = null; E.undo = []; E.redo = [];
    E.renderTemplate(); E.renderModulesLayer();
    E.emit('layers'); E.emit('modules'); E.emit('undo'); E.emit('tpl');
  };

  E.setActive = function (id) {
    const l = E.layerById(id); if (!l) return;
    if (l.kind !== 'raster') { E.toast(l.kind === 'modules' ? 'Les modules se modifient avec l’outil Sélection.' : 'Le gabarit ne se dessine pas : réglez son opacité ou changez de silhouette.'); return; }
    E.activeId = id; E.emit('layers');
  };
  function layersEntry() { return { t: 'lay', order: E.layers.slice(), active: E.activeId }; }
  E.addLayer = function (name) {
    pushUndo(layersEntry());
    const l = newLayer(name || ('Calque ' + (E.layers.filter(x => x.kind === 'raster').length + 1)));
    const i = E.layers.indexOf(E.active());
    E.layers.splice(i >= 0 ? i + 1 : E.layers.length, 0, l);
    E.activeId = l.id; changed(); E.emit('layers'); requestRender();
    return l;
  };
  E.duplicateLayer = function () {
    const a = E.active(); if (!a) return;
    pushUndo(layersEntry());
    const l = newLayer(a.name + ' (copie)'); l.ctx.drawImage(a.canvas, 0, 0); l.opacity = a.opacity;
    E.layers.splice(E.layers.indexOf(a) + 1, 0, l); E.activeId = l.id; changed(); E.emit('layers'); requestRender();
  };
  E.deleteLayer = function (id) {
    const l = E.layerById(id); if (!l || l.kind !== 'raster') return;
    if (E.layers.filter(x => x.kind === 'raster').length <= 1) { E.toast('Il faut garder au moins un calque de dessin.'); return; }
    pushUndo(layersEntry());
    E.layers = E.layers.filter(x => x !== l);
    if (E.activeId === id) { const r = E.layers.filter(x => x.kind === 'raster'); E.activeId = r[r.length - 1].id; }
    changed(); E.emit('layers'); requestRender();
  };
  E.moveLayer = function (id, dir) {
    const i = E.layers.findIndex(l => l.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= E.layers.length) return;
    pushUndo(layersEntry());
    const a = E.layers.slice(); [a[i], a[j]] = [a[j], a[i]]; E.layers = a;
    changed(); E.emit('layers'); requestRender();
  };
  E.clearLayer = function (id) {
    const l = E.layerById(id); if (!l || l.kind !== 'raster') return;
    pushUndo({ t: 'px', lid: l.id, x: 0, y: 0, data: l.ctx.getImageData(0, 0, W, H) });
    l.ctx.clearRect(0, 0, W, H); changed(l); requestRender();
  };
  E.setLayerProp = function (id, k, v) { const l = E.layerById(id); if (!l) return; l[k] = v; changed(); requestRender(); E.emit('layerprop', l); };
  E.importImage = function (img) {
    const l = E.addLayer('Image importée');
    const sc = Math.min(W * 0.9 / img.width, H * 0.9 / img.height, 1);
    const w = img.width * sc, h = img.height * sc;
    l.ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    l.opacity = 0.6; changed(l); E.emit('layers'); requestRender();
  };

  E.setTemplate = function (g, v, noUndo) {
    if (!noUndo) pushUndo({ t: 'tpl', tpl: Object.assign({}, E.tpl) });
    E.tpl = { g, v }; E.L = AC.landmarks(g, v);
    E.renderTemplate(); E.renderModulesLayer(); changed(); E.emit('tpl'); E.emit('modules'); requestRender();
  };

  /* ---------- Annulation ---------- */
  const MAX_BYTES = 220 * 1024 * 1024;
  function entryBytes(e) { return e.t === 'px' ? e.data.width * e.data.height * 4 : 1000; }
  function pushUndo(e) {
    E.undo.push(e); E.redo.length = 0;
    let tot = 0; E.undo.forEach(x => { tot += entryBytes(x); });
    while ((tot > MAX_BYTES || E.undo.length > 80) && E.undo.length > 1) tot -= entryBytes(E.undo.shift());
    E.emit('undo');
  }
  E.pushUndo = pushUndo;
  function swap(en) {
    if (en.t === 'px') {
      const l = E.layerById(en.lid) || findLayerAnywhere(en.lid); if (!l) return;
      const cur = l.ctx.getImageData(en.x, en.y, en.data.width, en.data.height);
      l.ctx.putImageData(en.data, en.x, en.y); en.data = cur; changed(l);
    } else if (en.t === 'mod') {
      const cur = JSON.stringify(E.modules); E.modules = JSON.parse(en.data); en.data = cur;
      if (!E.modules.find(m => m.uid === E.selUid)) E.selUid = null;
      E.renderModulesLayer(); changed(); E.emit('modules'); E.emit('select');
    } else if (en.t === 'lay') {
      const cur = layersEntry(); E.layers = en.order; E.activeId = en.active; en.order = cur.order; en.active = cur.active;
      E.layers.forEach(l => { l.saveDirty = true; }); changed(); E.emit('layers');
    } else if (en.t === 'tpl') {
      const cur = Object.assign({}, E.tpl); E.setTemplate(en.tpl.g, en.tpl.v, true); en.tpl = cur;
    }
  }
  function findLayerAnywhere(id) {
    for (const e of E.undo.concat(E.redo)) if (e.t === 'lay') { const l = e.order.find(x => x.id === id); if (l) return l; }
    return null;
  }
  E.doUndo = function () { if (stroke) cancelStroke(); const e = E.undo.pop(); if (!e) return; swap(e); E.redo.push(e); E.emit('undo'); requestRender(); };
  E.doRedo = function () { const e = E.redo.pop(); if (!e) return; swap(e); E.undo.push(e); E.emit('undo'); requestRender(); };

  /* ---------- Changements et sauvegarde automatique ---------- */
  let saveTimer = null, thumbTimer = null;
  function changed(layer) {
    if (layer) layer.saveDirty = true;
    E.dirty = true; E.emit('dirty');
    clearTimeout(saveTimer); saveTimer = setTimeout(autoSave, 2500);
    clearTimeout(thumbTimer); thumbTimer = setTimeout(() => E.emit('thumbs'), 400);
  }
  E.changed = changed;
  function autoSave() { if (stroke || action) { saveTimer = setTimeout(autoSave, 1500); return; } E.save().catch(e => console.error(e)); }

  /* ---------- Vue ---------- */
  let cv = null, vctx = null, DPR = 1, rect = { left: 0, top: 0, width: 1, height: 1 }, rq = false, modDirty = false;
  const STAGE = '#e9e4dc';
  const cache = { ok: false, below: null, above: null };
  function requestRender() { if (!rq) { rq = true; requestAnimationFrame(render); } }
  E.requestRender = requestRender;
  E.modulesDirty = () => { modDirty = true; requestRender(); };

  function setDocT(g) { const v = E.view; g.setTransform(DPR * v.s, 0, 0, DPR * v.s, DPR * v.tx, DPR * v.ty); }
  function drawPaper(g) {
    setDocT(g);
    g.fillStyle = 'rgba(60,45,30,0.10)'; g.fillRect(6, 10, W, H);
    g.fillStyle = 'rgba(60,45,30,0.06)'; g.fillRect(2, 4, W + 6, H + 8);
    g.fillStyle = '#fffdf9'; g.fillRect(0, 0, W, H);
  }
  function drawLayer(g, l) {
    if (!l.visible) return;
    g.globalAlpha = l.opacity; g.drawImage(l.canvas, 0, 0); g.globalAlpha = 1;
    if (stroke && l === stroke.lay && !stroke.B.erase) { g.globalAlpha = stroke.op * l.opacity; g.drawImage(sc, 0, 0); g.globalAlpha = 1; }
  }
  function buildCache() {
    cache.ok = false;
    if (!cv || E.layers.length < 3) return;
    const w = cv.width, h = cv.height;
    if (!cache.below || cache.below.width !== w || cache.below.height !== h) { cache.below = mkCanvas(w, h); cache.above = mkCanvas(w, h); }
    const b = cache.below.getContext('2d'), a = cache.above.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0); b.fillStyle = STAGE; b.fillRect(0, 0, w, h);
    a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, w, h);
    drawPaper(b); setDocT(a);
    const i = E.layers.indexOf(stroke.lay);
    E.layers.forEach((l, k) => { if (k < i) drawLayer(b, l); else if (k > i) drawLayer(a, l); });
    cache.ok = true;
  }
  function render() {
    rq = false; if (!cv) return;
    if (modDirty) E.renderModulesLayer();
    const g = vctx;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = E.view.s < 1 ? 'medium' : 'low';
    if (stroke && cache.ok) {
      g.drawImage(cache.below, 0, 0);
      setDocT(g); drawLayer(g, stroke.lay);
      g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(cache.above, 0, 0);
    } else {
      g.fillStyle = STAGE; g.fillRect(0, 0, cv.width, cv.height);
      drawPaper(g);
      E.layers.forEach(l => drawLayer(g, l));
    }
    setDocT(g);
    if (E.guide) AC.drawGuide(g, E.tpl.g, E.tpl.v, E.view.s);
    if (E.sym) {
      g.save(); g.strokeStyle = 'rgba(168,131,74,0.75)'; g.lineWidth = 1.5 / E.view.s; g.setLineDash([10 / E.view.s, 8 / E.view.s]);
      g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke(); g.restore();
    }
    const sel = selInst();
    if (sel && E.tool === 'select') drawSelection(g, sel);
  }
  function handles(inst) {
    const c = AC.modCorners(inst, E.L), s = E.view.s;
    const tc = [(c[0][0] + c[1][0]) / 2, (c[0][1] + c[1][1]) / 2];
    const ang = (inst.rot || 0) - Math.PI / 2;
    return { c, tc, rot: [tc[0] + Math.cos(ang) * 42 / s, tc[1] + Math.sin(ang) * 42 / s], scale: c[2] };
  }
  function drawSelection(g, inst) {
    const h = handles(inst), s = E.view.s;
    g.save();
    g.lineWidth = 1.6 / s; g.strokeStyle = '#a8834a'; g.setLineDash([8 / s, 6 / s]);
    g.beginPath(); g.moveTo(h.c[0][0], h.c[0][1]); h.c.slice(1).forEach(p => g.lineTo(p[0], p[1])); g.closePath(); g.stroke();
    g.setLineDash([]);
    g.beginPath(); g.moveTo(h.tc[0], h.tc[1]); g.lineTo(h.rot[0], h.rot[1]); g.stroke();
    [[h.rot, '↻'], [h.scale, '⤡']].forEach(([p]) => {
      g.beginPath(); g.arc(p[0], p[1], 11 / s, 0, Math.PI * 2); g.fillStyle = '#fffdf9'; g.fill(); g.lineWidth = 2 / s; g.stroke();
      g.beginPath(); g.arc(p[0], p[1], 4 / s, 0, Math.PI * 2); g.fillStyle = '#a8834a'; g.fill();
    });
    g.restore();
  }

  function resize() {
    if (!cv) return;
    const r = cv.parentElement.getBoundingClientRect();
    const oldW = rect.width, oldH = rect.height, first = !cv.width || oldW <= 1;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(1, Math.round(r.width * DPR)); cv.height = Math.max(1, Math.round(r.height * DPR));
    rect = cv.getBoundingClientRect();
    if (first) E.fit(); else { E.view.tx += (r.width - oldW) / 2; E.view.ty += (r.height - oldH) / 2; }
    cache.ok = false; requestRender(); E.emit('view');
  }
  E.fit = function () {
    const w = rect.width, h = rect.height;
    const s = Math.min((w - 40) / W, (h - 40) / H);
    E.view = { s, tx: (w - W * s) / 2, ty: (h - H * s) / 2 };
    requestRender(); E.emit('view');
  };
  E.zoomBy = function (k, cx, cy) {
    const v = E.view; if (cx == null) { cx = rect.width / 2; cy = rect.height / 2; }
    const ns = clamp(v.s * k, 0.05, 6), f = ns / v.s;
    v.tx = cx - (cx - v.tx) * f; v.ty = cy - (cy - v.ty) * f; v.s = ns;
    requestRender(); E.emit('view');
  };
  const toDoc = (x, y) => ({ x: (x - rect.left - E.view.tx) / E.view.s, y: (y - rect.top - E.view.ty) / E.view.s });
  E.toDoc = toDoc;

  /* ---------- Pinceaux ---------- */
  const BR = AC.BRUSHES = {
    crayon: { name: 'Crayon graphite', type: 'stamp', tex: 'grain', sp: 0.18, rad: (p, s) => s / 2 * (0.55 + 0.45 * p), alpha: p => 0.25 + 0.6 * p, jit: 0.25, max: 40 },
    encre: { name: 'Encre', type: 'hull', vel: true, rad: (p, s) => s / 2 * (0.12 + 0.88 * p), max: 60 },
    feutre: { name: 'Feutre', type: 'hull', rad: (p, s) => s / 2 * (0.85 + 0.15 * p), max: 80 },
    aquarelle: { name: 'Aquarelle', type: 'stamp', tex: 'soft', sp: 0.12, rad: (p, s) => s / 2 * (0.65 + 0.35 * p), alpha: p => 0.07 + 0.13 * p, max: 200 },
    gouache: { name: 'Gouache', type: 'stamp', tex: 'dense', sp: 0.09, rad: (p, s) => s / 2 * (0.6 + 0.4 * p), alpha: p => 0.55 + 0.4 * p, jit: 0.06, max: 160 },
    tissu: { name: 'Pinceau tissu', type: 'hull', pattern: true, rad: (p, s) => s / 2 * (0.75 + 0.25 * p), max: 200 },
    gomme: { name: 'Gomme', type: 'hull', erase: true, rad: (p, s) => s / 2 * (0.6 + 0.4 * p), max: 200 }
  };
  const masks = {};
  function mask(kind) {
    if (masks[kind]) return masks[kind];
    const S = 64, c = mkCanvas(S, S), g = c.getContext('2d'), R = AC.rng(kind.length * 97 + 3);
    if (kind === 'soft') {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.65)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, S, S);
    } else {
      const id = g.createImageData(S, S);
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const d = Math.hypot(x - 31.5, y - 31.5) / 32; if (d >= 1) continue;
        let a = kind === 'grain' ? (R() < 0.5 ? R() : 0) * (1 - d * d) : (0.6 + 0.4 * R()) * Math.min(1, (1 - d) * 4);
        id.data[(y * S + x) * 4 + 3] = a * 255;
      }
      g.putImageData(id, 0, 0);
    }
    return (masks[kind] = c);
  }
  const stampCache = new Map();
  function stampImg(kind, color) {
    const key = kind + color; let c = stampCache.get(key); if (c) return c;
    if (stampCache.size > 40) stampCache.clear();
    c = mkCanvas(64, 64); const g = c.getContext('2d');
    g.drawImage(mask(kind), 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, 64, 64);
    stampCache.set(key, c); return c;
  }
  function hull(g, ax, ay, ra, bx, by, rb) {
    const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy);
    if (d > Math.abs(ra - rb) + 0.01) {
      const th = Math.atan2(dy, dx), al = Math.acos(clamp((ra - rb) / d, -1, 1));
      g.beginPath();
      g.moveTo(ax + ra * Math.cos(th + al), ay + ra * Math.sin(th + al));
      g.lineTo(bx + rb * Math.cos(th + al), by + rb * Math.sin(th + al));
      g.lineTo(bx + rb * Math.cos(th - al), by + rb * Math.sin(th - al));
      g.lineTo(ax + ra * Math.cos(th - al), ay + ra * Math.sin(th - al));
      g.closePath(); g.fill();
    }
    g.beginPath(); g.arc(bx, by, rb, 0, Math.PI * 2); g.fill();
  }
  function grow(st, x, y, r) { const b = st.bb; b[0] = Math.min(b[0], x - r); b[1] = Math.min(b[1], y - r); b[2] = Math.max(b[2], x + r); b[3] = Math.max(b[3], y + r); }
  function dab(g, st, x, y, p) {
    const B = st.B, r = Math.max(0.4, B.rad(p, st.size));
    if (B.type === 'hull') { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    else { g.globalAlpha = B.alpha(p); g.drawImage(st.stamp, x - r, y - r, 2 * r, 2 * r); g.globalAlpha = B.erase ? st.op : 1; }
    grow(st, x, y, r);
  }
  function seg(g, st, a, b, remKey) {
    const B = st.B;
    if (B.type === 'hull') {
      const ra = Math.max(0.4, B.rad(a.p, st.size)), rb = Math.max(0.4, B.rad(b.p, st.size));
      hull(g, a.x, a.y, ra, b.x, b.y, rb); grow(st, a.x, a.y, ra); grow(st, b.x, b.y, rb);
      return;
    }
    const d = Math.hypot(b.x - a.x, b.y - a.y); if (d < 0.01) return;
    const sp = Math.max(0.5, B.rad(a.p, st.size) * B.sp);
    let t = st[remKey] || 0;
    while (t <= d) {
      const f = t / d, p = a.p + (b.p - a.p) * f, r = Math.max(0.4, B.rad(p, st.size));
      let x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
      if (B.jit) { x += (st.R() - 0.5) * r * B.jit * 2; y += (st.R() - 0.5) * r * B.jit * 2; }
      g.globalAlpha = B.alpha(p); g.drawImage(st.stamp, x - r, y - r, 2 * r, 2 * r);
      grow(st, x, y, r);
      t += sp;
    }
    g.globalAlpha = 1;
    st[remKey] = t - d;
  }
  const mirP = p => ({ x: W - p.x, y: p.y, p: p.p });

  let sc = null, sctx = null, bc = null, bctx = null;
  function ensureBuffers() {
    if (sc) return;
    sc = mkCanvas(W, H); sctx = sc.getContext('2d');
    bc = mkCanvas(W, H); bctx = bc.getContext('2d');
  }
  let stroke = null;
  function targetCtx(st) { return st.B.erase ? st.lay.ctx : sctx; }
  function drawTo(st, x, y, p) {
    const g = targetCtx(st), pt = { x, y, p };
    if (!st.last) {
      dab(g, st, x, y, p); if (E.sym) { const m = mirP(pt); dab(g, st, m.x, m.y, p); }
      st.last = pt; return;
    }
    if (Math.hypot(x - st.last.x, y - st.last.y) < 0.35) return;
    seg(g, st, st.last, pt, 'rem');
    if (E.sym) seg(g, st, mirP(st.last), mirP(pt), 'remM');
    st.last = pt;
  }
  function startStroke(e) {
    const lay = E.active();
    if (!lay || lay.kind !== 'raster') { E.toast('Choisissez un calque de dessin.'); return; }
    if (!lay.visible) { E.toast('Ce calque est masqué : affichez-le pour dessiner.'); return; }
    if (lay.locked) { E.toast('Ce calque est verrouillé.'); return; }
    ensureBuffers();
    const bname = E.tool === 'eraser' ? 'gomme' : E.brush, B = BR[bname], set = E.bs[bname];
    bctx.globalCompositeOperation = 'copy'; bctx.drawImage(lay.canvas, 0, 0); bctx.globalCompositeOperation = 'source-over';
    sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over'; sctx.clearRect(0, 0, W, H);
    const st = stroke = { id: e.pointerId, type: e.pointerType, t0: performance.now(), lay, B, bname, size: set.size, op: set.op, color: E.color,
      last: null, sm: null, raw: null, rawT: 0, p: 0.55, rem: 0, remM: 0, bb: [1e9, 1e9, -1e9, -1e9], R: AC.rng(Math.random() * 1e9) };
    if (B.type === 'stamp') st.stamp = stampImg(B.tex, E.color);
    const g = targetCtx(st);
    if (B.erase) { g.save(); g.globalCompositeOperation = 'destination-out'; g.globalAlpha = st.op; g.fillStyle = '#000'; }
    else g.fillStyle = B.pattern ? AC.fabricFill(g, E.fabric, E.fcolor, E.fcolor2, { s: 1 }) : E.color;
    if (B.pattern && E.fabric === 'uni') g.fillStyle = E.fcolor;
    buildCache();
    addPoint(e);
  }
  function addPoint(ev) {
    const st = stroke; if (!st) return;
    const d = toDoc(ev.clientX, ev.clientY), now = ev.timeStamp || performance.now();
    let p;
    if (ev.pointerType === 'pen') {
      p = ev.pressure > 0 ? ev.pressure : 0.15;
      p = Math.pow(clamp(p, 0.02, 1), E.settings.pressure);
    } else if (st.B.vel && st.raw) {
      const dist = Math.hypot(d.x - st.raw.x, d.y - st.raw.y) * E.view.s, dt = Math.max(1, now - st.rawT);
      const target = clamp(1.05 - (dist / dt) * 0.28, 0.32, 1);
      p = st.p + (target - st.p) * 0.25;
    } else p = st.B.vel ? 0.6 : 0.65;
    st.raw = d; st.rawT = now; st.p = p;
    const k = E.settings.smoothing * 0.85;
    if (!st.sm) st.sm = { x: d.x, y: d.y, p };
    else { st.sm.x += (d.x - st.sm.x) * (1 - k); st.sm.y += (d.y - st.sm.y) * (1 - k); st.sm.p += (p - st.sm.p) * (1 - k * 0.5); }
    drawTo(st, st.sm.x, st.sm.y, st.sm.p);
  }
  function finishGraphics(st) { if (st.B.erase) st.lay.ctx.restore(); }
  function endStroke() {
    const st = stroke; if (!st) return;
    if (st.raw && st.sm) for (let i = 0; i < 5; i++) { st.sm.x += (st.raw.x - st.sm.x) * 0.5; st.sm.y += (st.raw.y - st.sm.y) * 0.5; drawTo(st, st.sm.x, st.sm.y, st.sm.p); }
    finishGraphics(st);
    const b = st.bb, x = clamp(Math.floor(b[0]) - 2, 0, W), y = clamp(Math.floor(b[1]) - 2, 0, H), x2 = clamp(Math.ceil(b[2]) + 2, 0, W), y2 = clamp(Math.ceil(b[3]) + 2, 0, H);
    const w = x2 - x, h = y2 - y;
    if (!st.B.erase && w > 0 && h > 0) {
      const g = st.lay.ctx; g.save(); g.globalAlpha = st.op; g.drawImage(sc, x, y, w, h, x, y, w, h); g.restore();
      sctx.clearRect(x, y, w, h);
    }
    if (w > 0 && h > 0) pushUndo({ t: 'px', lid: st.lay.id, x, y, data: bctx.getImageData(x, y, w, h) });
    stroke = null; cache.ok = false; changed(st.lay); requestRender();
  }
  function cancelStroke() {
    const st = stroke; if (!st) return;
    finishGraphics(st);
    if (st.B.erase) { const g = st.lay.ctx; g.save(); g.globalCompositeOperation = 'copy'; g.drawImage(bc, 0, 0); g.restore(); }
    sctx.clearRect(0, 0, W, H);
    stroke = null; cache.ok = false; requestRender();
  }

  /* Aperçu d'un pinceau dans une petite toile */
  E.brushPreview = function (canvas, bname) {
    const g = canvas.getContext('2d'), B = BR[bname], w = canvas.width, h = canvas.height;
    g.clearRect(0, 0, w, h);
    if (B.erase) { g.fillStyle = '#d9cfc2'; g.fillRect(8, h / 2 - 8, w - 16, 16); }
    const tmp = mkCanvas(w, h), tg = tmp.getContext('2d');
    const st = { B, size: Math.min(h * 0.5, Math.max(4, E.bs[bname].size * 0.45)), op: E.bs[bname].op, bb: [0, 0, 0, 0], R: AC.rng(5), rem: 0 };
    if (B.type === 'stamp') st.stamp = stampImg(B.tex, E.color);
    tg.fillStyle = B.pattern ? (E.fabric === 'uni' ? E.fcolor : AC.fabricFill(tg, E.fabric, E.fcolor, E.fcolor2, { s: 0.5 })) : (B.erase ? '#000' : E.color);
    let last = null;
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, pt = { x: 10 + t * (w - 20), y: h / 2 + Math.sin(t * Math.PI * 2) * h * 0.22, p: Math.sin(t * Math.PI) * 0.9 + 0.1 };
      if (!last) dab(tg, st, pt.x, pt.y, pt.p); else seg(tg, st, last, pt, 'rem');
      last = pt;
    }
    if (B.erase) { g.globalCompositeOperation = 'destination-out'; g.drawImage(tmp, 0, 0); g.globalCompositeOperation = 'source-over'; }
    else { g.globalAlpha = st.op; g.drawImage(tmp, 0, 0); g.globalAlpha = 1; }
  };

  /* ---------- Remplissage et pipette ---------- */
  function checkPaint(l) {
    if (!l || l.kind !== 'raster') { E.toast('Choisissez un calque de dessin.'); return false; }
    if (!l.visible || l.locked) { E.toast('Ce calque est masqué ou verrouillé.'); return false; }
    return true;
  }
  function doFill(d) {
    const lay = E.active(); if (!checkPaint(lay)) return;
    const x0 = Math.floor(d.x), y0 = Math.floor(d.y); if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H) return;
    const comp = mkCanvas(W, H), g = comp.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    E.layers.forEach(l => { if (l.visible) { g.globalAlpha = l.opacity; g.drawImage(l.canvas, 0, 0); } }); g.globalAlpha = 1;
    const data = g.getImageData(0, 0, W, H).data;
    const i0 = (y0 * W + x0) * 4, tr = data[i0], tg = data[i0 + 1], tb = data[i0 + 2], tol = 46;
    const mask = new Uint8Array(W * H);
    const match = i => { const j = i * 4; return Math.abs(data[j] - tr) <= tol && Math.abs(data[j + 1] - tg) <= tol && Math.abs(data[j + 2] - tb) <= tol; };
    const stack = [x0, y0]; let mnx = x0, mxx = x0, mny = y0, mxy = y0, count = 0;
    while (stack.length) {
      const y = stack.pop(); let x = stack.pop(), i = y * W + x;
      while (x >= 0 && !mask[i] && match(i)) { x--; i--; }
      x++; i++;
      let up = false, dn = false;
      while (x < W && !mask[i] && match(i)) {
        mask[i] = 1; count++;
        if (x < mnx) mnx = x; if (x > mxx) mxx = x; if (y < mny) mny = y; if (y > mxy) mxy = y;
        if (y > 0) { const k = i - W; if (!mask[k] && match(k)) { if (!up) { stack.push(x, y - 1); up = true; } } else up = false; }
        if (y < H - 1) { const k = i + W; if (!mask[k] && match(k)) { if (!dn) { stack.push(x, y + 1); dn = true; } } else dn = false; }
        x++; i++;
      }
    }
    const rx = Math.max(0, mnx - 3), ry = Math.max(0, mny - 3), rw = Math.min(W, mxx + 4) - rx, rh = Math.min(H, mxy + 4) - ry;
    const mc = mkCanvas(rw, rh), mg = mc.getContext('2d'), id = mg.createImageData(rw, rh);
    for (let y = 0; y < rh; y++) for (let x = 0; x < rw; x++) {
      const gx = rx + x, gy = ry + y; let on = mask[gy * W + gx];
      if (!on) for (let dy = -2; dy <= 2 && !on; dy++) for (let dx = -2; dx <= 2; dx++) { if (dx * dx + dy * dy > 5) continue; const X = gx + dx, Y = gy + dy; if (X >= 0 && Y >= 0 && X < W && Y < H && mask[Y * W + X]) { on = 1; break; } }
      if (on) id.data[(y * rw + x) * 4 + 3] = 255;
    }
    mg.putImageData(id, 0, 0);
    mg.globalCompositeOperation = 'source-in'; mg.translate(-rx, -ry);
    mg.fillStyle = E.fabric === 'uni' ? E.fcolor : AC.fabricFill(mg, E.fabric, E.fcolor, E.fcolor2, { s: 1 });
    mg.fillRect(rx, ry, rw, rh);
    pushUndo({ t: 'px', lid: lay.id, x: rx, y: ry, data: lay.ctx.getImageData(rx, ry, rw, rh) });
    lay.ctx.drawImage(mc, rx, ry);
    changed(lay); requestRender();
    if (count > W * H * 0.6) E.toast('Zone ouverte : une grande partie de la page a été remplie. Annulez (↶) si ce n’était pas voulu.');
  }
  function pick(d) {
    const c = mkCanvas(1, 1), g = c.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fffdf9'; g.fillRect(0, 0, 1, 1);
    E.layers.forEach(l => { if (l.visible) { g.globalAlpha = l.opacity; g.drawImage(l.canvas, Math.floor(d.x), Math.floor(d.y), 1, 1, 0, 0, 1, 1); } });
    const p = g.getImageData(0, 0, 1, 1).data;
    E.setColor(AC.rgb2hex(p[0], p[1], p[2]));
    E.setTool(E.prevTool === 'picker' ? 'brush' : E.prevTool);
  }

  /* ---------- Outils et couleurs ---------- */
  E.setTool = function (t) {
    if (t !== E.tool && E.tool !== 'picker') E.prevTool = E.tool;
    E.tool = t; if (t !== 'select') { /* garder la sélection */ }
    E.emit('tool'); requestRender();
  };
  E.setBrush = function (b) { E.brush = b; E.setTool('brush'); E.emit('brush'); };
  E.setColor = function (c) {
    E.color = c;
    E.recent = [c].concat(E.recent.filter(x => x !== c)).slice(0, 10);
    E.emit('color');
  };
  E.setFabric = function (o) { Object.assign(E, o); E.emit('fabric'); };
  E.curSet = () => E.bs[E.tool === 'eraser' ? 'gomme' : E.brush];

  /* ---------- Modules ---------- */
  const selInst = () => E.modules.find(m => m.uid === E.selUid) || null;
  E.selInst = selInst;
  function modEntry() { return { t: 'mod', data: JSON.stringify(E.modules) }; }
  E.addModule = function (id, opts) {
    const d = AC.MOD[id]; if (!d) return;
    if (d.applyNeck) return E.applyNeck(d.applyNeck);
    pushUndo(modEntry());
    const inst = AC.newInst(id, opts, { fabric: E.fabric, color: E.fcolor, color2: E.fcolor2, trim: E.trim });
    AC.insertInst(E.modules, inst);
    E.selUid = inst.uid;
    const ml = E.modLayer(); if (ml && !ml.visible) ml.visible = true;
    E.renderModulesLayer(); changed(); E.emit('modules'); E.emit('select'); E.emit('layers');
    if (E.tool !== 'select') E.setTool('select');
    requestRender();
    return inst;
  };
  E.applyNeck = function (neck) {
    let t = selInst(); if (!t || !AC.MOD[t.id].top) t = E.modules.slice().reverse().find(m => AC.MOD[m.id] && AC.MOD[m.id].top);
    if (!t) { E.toast('Ajoutez d’abord un corsage, une robe ou un boubou : l’encolure s’y applique.'); return null; }
    pushUndo(modEntry());
    t.neck = neck; E.selUid = t.uid;
    E.renderModulesLayer(); changed(); E.emit('modules'); E.emit('select'); requestRender();
    E.toast(AC.NECK[neck].name + ' appliquée à « ' + AC.MOD[t.id].name + ' ».');
    return t;
  };
  E.applyEnsemble = function (ens, replace) {
    pushUndo(modEntry());
    if (replace) E.modules = [];
    ens.items.forEach(([id, o]) => AC.insertInst(E.modules, AC.newInst(id, o, { fabric: E.fabric, color: E.fcolor, color2: E.fcolor2, trim: E.trim })));
    E.selUid = null;
    const ml = E.modLayer(); if (ml) ml.visible = true;
    E.renderModulesLayer(); changed(); E.emit('modules'); E.emit('select'); requestRender();
  };
  E.setModules = function (list, label) {
    pushUndo(modEntry());
    E.modules = JSON.parse(JSON.stringify(list)); E.selUid = null;
    E.renderModulesLayer(); changed(); E.emit('modules'); E.emit('select'); requestRender();
    if (label) E.toast(label);
  };
  E.updateSel = function (props, noUndo) {
    const s = selInst(); if (!s) return;
    if (!noUndo) pushUndo(modEntry());
    Object.assign(s, props);
    E.renderModulesLayer(); changed(); E.emit('modules'); E.emit('select'); requestRender();
  };
  E.selAction = function (a) {
    const s = selInst(); if (!s) return;
    const i = E.modules.indexOf(s);
    if (a === 'delete') { pushUndo(modEntry()); E.modules.splice(i, 1); E.selUid = null; }
    else if (a === 'dup') { pushUndo(modEntry()); const c = Object.assign({}, s, { uid: AC.newInst(s.id).uid, tx: s.tx + 30, ty: s.ty + 30 }); E.modules.splice(i + 1, 0, c); E.selUid = c.uid; }
    else if (a === 'flip') { pushUndo(modEntry()); s.flip = !s.flip; }
    else if (a === 'up' && i < E.modules.length - 1) { pushUndo(modEntry()); E.modules.splice(i, 1); E.modules.splice(i + 1, 0, s); }
    else if (a === 'down' && i > 0) { pushUndo(modEntry()); E.modules.splice(i, 1); E.modules.splice(i - 1, 0, s); }
    else if (a === 'reset') { pushUndo(modEntry()); Object.assign(s, { tx: 0, ty: 0, s: 1, rot: 0 }); }
    else if (a === 'fabric') { pushUndo(modEntry()); Object.assign(s, { fabric: E.fabric, color: E.fcolor, color2: E.fcolor2 }); }
    else if (a === 'trim') { pushUndo(modEntry()); s.trim = E.trim; }
    else if (a === 'deselect') { E.selUid = null; }
    E.renderModulesLayer(); changed(); E.emit('modules'); E.emit('select'); requestRender();
  };
  E.select = function (uid) { E.selUid = uid; if (uid && E.tool !== 'select') E.setTool('select'); E.emit('select'); requestRender(); };

  /* ---------- Entrées : stylet, doigts, souris ---------- */
  const ptrs = new Map();
  let gesture = null, action = null, spaceDown = false;
  const local = p => ({ x: p.x - rect.left, y: p.y - rect.top });
  function touchList() { return [...ptrs.values()].filter(p => p.type === 'touch'); }
  function centroid(list) { let x = 0, y = 0; list.forEach(p => { x += p.x; y += p.y; }); return { x: x / list.length - rect.left, y: y / list.length - rect.top }; }
  function spread(list) { if (list.length < 2) return 0; return Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y); }
  function startGesture(list) {
    gesture = { ids: new Set(list.map(p => p.id)), t0: performance.now(), maxN: list.length, moved: false };
    rebase();
  }
  function rebase() {
    const list = [...ptrs.values()].filter(p => gesture.ids.has(p.id));
    gesture.v0 = Object.assign({}, E.view); gesture.c0 = centroid(list); gesture.d0 = spread(list); gesture.n = list.length;
  }
  function moveGesture() {
    const list = [...ptrs.values()].filter(p => gesture.ids.has(p.id)); if (!list.length) return;
    const c = centroid(list), d = spread(list), v0 = gesture.v0;
    const k = list.length >= 2 && gesture.d0 > 10 ? d / gesture.d0 : 1;
    const ns = clamp(v0.s * k, 0.05, 6), f = ns / v0.s;
    E.view = { s: ns, tx: c.x - (gesture.c0.x - v0.tx) * f, ty: c.y - (gesture.c0.y - v0.ty) * f };
    if (Math.hypot(c.x - gesture.c0.x, c.y - gesture.c0.y) > 10 || Math.abs(d - gesture.d0) > 12) gesture.moved = true;
    requestRender(); E.emit('view');
  }
  function fingerCanDraw() { return E.settings.fingerDraw || E.tool === 'select' || E.tool === 'picker' || E.tool === 'hand'; }

  function onDown(e) {
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (_) { }
    rect = cv.getBoundingClientRect();
    ptrs.set(e.pointerId, { id: e.pointerId, type: e.pointerType, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    if (e.pointerType === 'pen' && !E.settings.penSeen) {
      E.settings.penSeen = true;
      if (E.settings.fingerDraw) { E.settings.fingerDraw = false; E.toast('Stylet détecté : le doigt sert maintenant à zoomer et déplacer la feuille. Modifiable dans Réglages.'); }
      E.saveSettings(); E.emit('settings');
    }
    if (e.pointerType === 'touch') {
      const t = touchList();
      if (gesture) { gesture.ids.add(e.pointerId); gesture.maxN = Math.max(gesture.maxN, gesture.ids.size); rebase(); return; }
      if (t.length >= 2) {
        if (stroke && stroke.type === 'touch') { if (performance.now() - stroke.t0 < 350) cancelStroke(); else endStroke(); }
        if (action && action.type === 'touch') endAction();
        startGesture(t); return;
      }
      if (!fingerCanDraw()) { startGesture(t); return; }
    }
    if (e.pointerType === 'mouse' && (e.button === 1 || e.button === 2 || spaceDown)) { action = { kind: 'pan', id: e.pointerId, type: 'mouse', v0: Object.assign({}, E.view), x0: e.clientX, y0: e.clientY }; return; }
    if (gesture || stroke || action) return;
    const d = toDoc(e.clientX, e.clientY);
    switch (E.tool) {
      case 'brush': case 'eraser': startStroke(e); break;
      case 'fill': doFill(d); break;
      case 'picker': pick(d); break;
      case 'hand': action = { kind: 'pan', id: e.pointerId, type: e.pointerType, v0: Object.assign({}, E.view), x0: e.clientX, y0: e.clientY }; break;
      case 'select': selDown(e, d); break;
    }
  }
  function onMove(e) {
    const p = ptrs.get(e.pointerId); if (!p) return;
    p.x = e.clientX; p.y = e.clientY;
    if (gesture && gesture.ids.has(e.pointerId)) { moveGesture(); return; }
    if (stroke && stroke.id === e.pointerId) {
      const list = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      if (list && list.length) list.forEach(addPoint); else addPoint(e);
      requestRender(); return;
    }
    if (action && action.id === e.pointerId) actionMove(e);
  }
  function onUp(e) {
    const p = ptrs.get(e.pointerId);
    ptrs.delete(e.pointerId);
    if (gesture && gesture.ids.has(e.pointerId)) {
      gesture.ids.delete(e.pointerId);
      if (!gesture.ids.size) {
        const dt = performance.now() - gesture.t0;
        if (!gesture.moved && dt < 320 && gesture.maxN === 2) { E.doUndo(); E.toast('Annulé (tap à deux doigts)'); }
        else if (!gesture.moved && dt < 380 && gesture.maxN >= 3) { E.doRedo(); E.toast('Rétabli (tap à trois doigts)'); }
        gesture = null;
      } else rebase();
      return;
    }
    if (stroke && stroke.id === e.pointerId) { endStroke(); return; }
    if (action && action.id === e.pointerId) endAction();
    void p;
  }

  function selDown(e, d) {
    const ml = E.modLayer();
    if (ml && (!ml.visible || ml.locked)) { E.toast('Le calque Modules est masqué ou verrouillé.'); return; }
    const sel = selInst(), s = E.view.s;
    if (sel) {
      const h = handles(sel);
      const hit = q => Math.hypot(d.x - q[0], d.y - q[1]) < 26 / s;
      if (hit(h.rot) || hit(h.scale)) {
        const c = AC.modCenter(sel, E.L);
        action = { kind: hit(h.rot) ? 'rot' : 'scale', id: e.pointerId, type: e.pointerType, inst: sel, before: JSON.stringify(E.modules), c, d0: d, s0: sel.s, r0: sel.rot || 0, moved: false };
        return;
      }
    }
    let found = null;
    for (let i = E.modules.length - 1; i >= 0; i--) { if (AC.modHit(E.modules[i], E.L, d.x, d.y)) { found = E.modules[i]; break; } }
    if (sel && !found && AC.modHit(sel, E.L, d.x, d.y)) found = sel;
    if (found) {
      E.selUid = found.uid;
      action = { kind: 'move', id: e.pointerId, type: e.pointerType, inst: found, before: JSON.stringify(E.modules), d0: d, t0: [found.tx, found.ty], moved: false };
    } else E.selUid = null;
    E.emit('select'); requestRender();
  }
  function actionMove(e) {
    const a = action;
    if (a.kind === 'pan') { E.view.tx = a.v0.tx + (e.clientX - a.x0); E.view.ty = a.v0.ty + (e.clientY - a.y0); requestRender(); E.emit('view'); return; }
    const d = toDoc(e.clientX, e.clientY), inst = a.inst;
    if (Math.hypot(d.x - a.d0.x, d.y - a.d0.y) * E.view.s > 3) a.moved = true;
    if (!a.moved) return;
    if (a.kind === 'move') { inst.tx = a.t0[0] + d.x - a.d0.x; inst.ty = a.t0[1] + d.y - a.d0.y; }
    else if (a.kind === 'scale') { const r0 = Math.hypot(a.d0.x - a.c[0], a.d0.y - a.c[1]), r1 = Math.hypot(d.x - a.c[0], d.y - a.c[1]); inst.s = clamp(a.s0 * r1 / Math.max(1, r0), 0.15, 5); }
    else if (a.kind === 'rot') { let r = a.r0 + Math.atan2(d.y - a.c[1], d.x - a.c[0]) - Math.atan2(a.d0.y - a.c[1], a.d0.x - a.c[0]); const snap = Math.round(r / (Math.PI / 12)) * Math.PI / 12; if (Math.abs(r - snap) < 0.04) r = snap; inst.rot = r; }
    E.modulesDirty();
  }
  function endAction() {
    const a = action; action = null; if (!a) return;
    if (a.kind !== 'pan' && a.moved) { pushUndo({ t: 'mod', data: a.before }); E.renderModulesLayer(); changed(); E.emit('modules'); }
    E.emit('select'); requestRender();
  }
  function onWheel(e) {
    e.preventDefault();
    rect = cv.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 40 && !e.shiftKey) E.zoomBy(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - rect.left, e.clientY - rect.top);
    else { E.view.tx -= e.deltaX; E.view.ty -= e.deltaY; requestRender(); E.emit('view'); }
  }
  function onKey(e) {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const mod = e.ctrlKey || e.metaKey;
    if (e.type === 'keyup') { if (e.code === 'Space') spaceDown = false; return; }
    if (e.code === 'Space') { spaceDown = true; e.preventDefault(); return; }
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? E.doRedo() : E.doUndo(); return; }
    if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); E.doRedo(); return; }
    if (mod) return;
    const k = e.key.toLowerCase();
    if (k === 'b') E.setTool('brush'); else if (k === 'e') E.setTool('eraser'); else if (k === 'v') E.setTool('select');
    else if (k === 'g') E.setTool('fill'); else if (k === 'i') E.setTool('picker'); else if (k === 'h') E.setTool('hand');
    else if (k === '[' || k === ']') { const s = E.curSet(); s.size = clamp(Math.round(s.size * (k === ']' ? 1.15 : 0.87)), 1, 200); E.emit('brush'); }
    else if ((k === 'delete' || k === 'backspace') && selInst()) E.selAction('delete');
    else if (k === '0') E.fit();
  }
  E.attach = function (canvas) {
    cv = canvas;
    vctx = cv.getContext('2d', { desynchronized: true, alpha: false }) || cv.getContext('2d');
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp);
    cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('lostpointercapture', e => { if (ptrs.has(e.pointerId)) onUp(e); });
    cv.addEventListener('wheel', onWheel, { passive: false });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(n => document.addEventListener(n, e => e.preventDefault(), { passive: false }));
    if (window.ResizeObserver) new ResizeObserver(resize).observe(cv.parentElement); else window.addEventListener('resize', resize);
    resize();
  };
  E.isBusy = () => !!(stroke || action || gesture);
  E.renderNow = render; /* utilisé pour mesurer le temps d'affichage */

  /* ---------- Composition (export, vignettes) ---------- */
  E.composite = function (scale, opt) {
    opt = opt || {};
    const w = Math.round(W * scale), h = Math.round(H * scale), c = mkCanvas(w, h), g = c.getContext('2d');
    if (opt.background !== false) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); }
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    E.layers.forEach(l => {
      if (!l.visible) return;
      if (l.kind === 'template' && opt.template === false) return;
      if (l.kind !== 'raster' && Math.abs(scale - 1) > 0.01) {
        const t = mkCanvas(w, h), tg = t.getContext('2d'); tg.setTransform(scale, 0, 0, scale, 0, 0);
        if (l.kind === 'template') AC.drawTemplate(tg, E.tpl.g, E.tpl.v); else AC.renderModules(tg, E.modules, E.L);
        g.globalAlpha = l.opacity; g.drawImage(t, 0, 0); g.globalAlpha = 1;
      } else { g.globalAlpha = l.opacity; g.drawImage(l.canvas, 0, 0, w, h); g.globalAlpha = 1; }
    });
    return c;
  };
  E.layerThumb = function (l, canvas) {
    const g = canvas.getContext('2d'); g.clearRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = '#fffdf9'; g.fillRect(0, 0, canvas.width, canvas.height);
    g.imageSmoothingQuality = 'medium'; g.drawImage(l.canvas, 0, 0, canvas.width, canvas.height);
  };

  /* ---------- Stockage local (IndexedDB) ---------- */
  const DB = AC.DB = {
    db: null,
    open() {
      return new Promise((res, rej) => {
        if (!window.indexedDB) { rej(new Error('IndexedDB indisponible')); return; }
        const r = indexedDB.open('atelier-couture', 1);
        r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('projects')) d.createObjectStore('projects', { keyPath: 'id' }); if (!d.objectStoreNames.contains('pixels')) d.createObjectStore('pixels'); };
        r.onsuccess = () => { DB.db = r.result; res(DB.db); };
        r.onerror = () => rej(r.error);
      });
    },
    run(store, mode, fn) {
      return new Promise((res, rej) => {
        const t = DB.db.transaction(store, mode), req = fn(t.objectStore(store));
        t.oncomplete = () => res(req ? req.result : undefined); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
      });
    },
    get: (s, k) => DB.run(s, 'readonly', st => st.get(k)),
    put: (s, v, k) => DB.run(s, 'readwrite', st => k === undefined ? st.put(v) : st.put(v, k)),
    del: (s, k) => DB.run(s, 'readwrite', st => st.delete(k)),
    all: s => DB.run(s, 'readonly', st => st.getAll())
  };
  const toBlob = (c, type, q) => new Promise(res => c.toBlob(res, type, q));
  E.toBlob = toBlob;
  let saving = false;
  E.save = async function () {
    if (!DB.db || !E.project.id) return;
    if (saving) { clearTimeout(saveTimer); saveTimer = setTimeout(autoSave, 1500); return; }
    saving = true;
    try {
      const id = E.project.id;
      for (const l of E.layers) {
        if (l.kind === 'raster' && l.saveDirty) {
          l.saveDirty = false;
          const b = await toBlob(l.canvas, 'image/png');
          await DB.put('pixels', await b.arrayBuffer(), id + ':' + l.id);
        }
      }
      const th = E.composite(0.13, {});
      const tb = await toBlob(th, 'image/jpeg', 0.8);
      const old = await DB.get('projects', id);
      const rec = { id, name: E.project.name, created: E.project.created || Date.now(), updated: Date.now(), tpl: E.tpl, activeId: E.activeId,
        layers: E.layers.map(l => ({ id: l.id, name: l.name, kind: l.kind, visible: l.visible, opacity: l.opacity, locked: l.locked })),
        modules: E.modules, fiche: E.fiche, thumb: await tb.arrayBuffer() };
      await DB.put('projects', rec);
      if (old && old.layers) for (const ol of old.layers) if (ol.kind === 'raster' && !rec.layers.find(x => x.id === ol.id)) await DB.del('pixels', id + ':' + ol.id);
      E.dirty = false; E.emit('saved');
    } catch (err) { console.error(err); E.toast('Sauvegarde impossible : ' + (err && err.message || err)); }
    finally { saving = false; }
  };
  function loadImage(buf) {
    return new Promise((res, rej) => {
      const blob = new Blob([buf], { type: 'image/png' });
      if (window.createImageBitmap) { createImageBitmap(blob).then(res, () => fallback()); return; }
      fallback();
      function fallback() { const url = URL.createObjectURL(blob), im = new Image(); im.onload = () => { URL.revokeObjectURL(url); res(im); }; im.onerror = rej; im.src = url; }
    });
  }
  E.loadImage = loadImage;
  E.newProject = async function (o) {
    if (E.dirty) await E.save();
    E.resetDoc(o.g, o.v);
    E.project = { id: 'p' + Date.now().toString(36), name: o.name || 'Sans titre', created: Date.now() };
    E.fiche = E.defaultFiche(); E.fiche.modele = E.project.name;
    if (o.ensemble) E.applyEnsemble(o.ensemble, true);
    E.undo = []; E.redo = []; E.emit('undo');
    E.emit('project'); E.emit('fiche'); E.fit(); changed();
    try { localStorage.setItem('ac-last', E.project.id); } catch (e) { }
  };
  E.openProject = async function (id) {
    const rec = await DB.get('projects', id); if (!rec) return false;
    if (E.dirty && E.project.id !== id) await E.save();
    E.tpl = rec.tpl || { g: 'femme', v: 'face' }; E.L = AC.landmarks(E.tpl.g, E.tpl.v);
    const layers = [];
    for (const m of rec.layers) {
      const l = newLayer(m.name, m.kind); Object.assign(l, { id: m.id, visible: m.visible, opacity: m.opacity, locked: m.locked, saveDirty: false });
      if (m.kind === 'raster') { const buf = await DB.get('pixels', id + ':' + m.id); if (buf) { try { l.ctx.drawImage(await loadImage(buf), 0, 0); } catch (e) { console.error(e); } } }
      layers.push(l);
    }
    E.layers = layers; E.activeId = rec.activeId && layers.find(l => l.id === rec.activeId && l.kind === 'raster') ? rec.activeId : (layers.filter(l => l.kind === 'raster').pop() || {}).id;
    E.modules = rec.modules || []; E.selUid = null; E.fiche = Object.assign(E.defaultFiche(), rec.fiche || {});
    E.project = { id, name: rec.name, created: rec.created };
    E.undo = []; E.redo = [];
    E.renderTemplate(); E.renderModulesLayer();
    E.dirty = false;
    ['layers', 'modules', 'undo', 'tpl', 'project', 'fiche', 'select', 'thumbs'].forEach(x => E.emit(x));
    E.fit();
    try { localStorage.setItem('ac-last', id); } catch (e) { }
    return true;
  };
  E.listProjects = async function () { if (!DB.db) return []; const a = await DB.all('projects'); return a.sort((x, y) => y.updated - x.updated); };
  E.deleteProject = async function (id) {
    const rec = await DB.get('projects', id); if (!rec) return;
    for (const l of rec.layers || []) if (l.kind === 'raster') await DB.del('pixels', id + ':' + l.id);
    await DB.del('projects', id);
  };
  E.duplicateProject = async function (id) {
    const rec = await DB.get('projects', id); if (!rec) return;
    const nid = 'p' + Date.now().toString(36);
    for (const l of rec.layers || []) if (l.kind === 'raster') { const b = await DB.get('pixels', id + ':' + l.id); if (b) await DB.put('pixels', b, nid + ':' + l.id); }
    rec.id = nid; rec.name = rec.name + ' (copie)'; rec.created = rec.updated = Date.now();
    await DB.put('projects', rec);
  };
  E.rename = function (name) { E.project.name = name || 'Sans titre'; if (!E.fiche.modele) E.fiche.modele = E.project.name; changed(); E.emit('project'); };

  /* Fichier de sauvegarde complet (.atelier) */
  E.serialize = async function () {
    const layers = [];
    for (const l of E.layers) layers.push({ id: l.id, name: l.name, kind: l.kind, visible: l.visible, opacity: l.opacity, locked: l.locked, png: l.kind === 'raster' ? l.canvas.toDataURL('image/png') : null });
    return { format: 'atelier-couture', version: 1, name: E.project.name, tpl: E.tpl, modules: E.modules, fiche: E.fiche, layers, saved: new Date().toISOString() };
  };
  E.deserialize = async function (obj) {
    if (!obj || obj.format !== 'atelier-couture') throw new Error('Ce fichier n’est pas un projet Atelier Couture.');
    if (E.dirty) await E.save();
    E.tpl = obj.tpl || { g: 'femme', v: 'face' }; E.L = AC.landmarks(E.tpl.g, E.tpl.v);
    const layers = [];
    for (const m of obj.layers) {
      const l = newLayer(m.name, m.kind); Object.assign(l, { visible: m.visible, opacity: m.opacity, locked: m.locked, saveDirty: true });
      if (m.png) { await new Promise(res => { const im = new Image(); im.onload = () => { l.ctx.drawImage(im, 0, 0); res(); }; im.onerror = res; im.src = m.png; }); }
      layers.push(l);
    }
    E.layers = layers; E.activeId = (layers.filter(l => l.kind === 'raster').pop() || {}).id;
    E.modules = obj.modules || []; E.fiche = Object.assign(E.defaultFiche(), obj.fiche || {});
    E.project = { id: 'p' + Date.now().toString(36), name: (obj.name || 'Projet importé'), created: Date.now() };
    E.undo = []; E.redo = []; E.selUid = null;
    E.renderTemplate(); E.renderModulesLayer();
    ['layers', 'modules', 'undo', 'tpl', 'project', 'fiche', 'select'].forEach(x => E.emit(x));
    E.fit(); changed();
  };
})();
