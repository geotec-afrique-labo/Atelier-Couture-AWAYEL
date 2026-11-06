'use strict';
/* Atelier Couture — export PNG, fiche technique PDF, fichier projet */
(function () {
  const AC = window.AC, E = AC.E;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const SERIF = '"Didot","Bodoni 72","Bodoni MT","Playfair Display",Georgia,serif';
  const SANS = '-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';

  AC.fileName = function (base, ext) {
    const s = String(base || 'croquis').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9 _-]+/g, '').trim().replace(/\s+/g, '_') || 'croquis';
    return s.slice(0, 60) + '.' + ext;
  };
  AC.saveBlob = async function (blob, name, preferShare) {
    if (preferShare && navigator.canShare && window.File) {
      try {
        const f = new File([blob], name, { type: blob.type });
        if (navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: name }); return 'share'; }
      } catch (e) { if (e && e.name === 'AbortError') return 'abort'; }
    }
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return 'download';
  };

  /* Cadre utile du croquis (silhouette + modules) */
  function contentBox() {
    const L = E.L, u = L.hu;
    let x0 = L.cx - 1.7 * u, x1 = L.cx + 1.7 * u, y0 = L.top - 0.5 * u, y1 = L.floorY + 0.35 * u;
    E.modules.forEach(m => AC.modCorners(m, L).forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }));
    x0 = Math.max(0, x0 - 20); y0 = Math.max(0, y0 - 20); x1 = Math.min(AC.DOC_W, x1 + 20); y1 = Math.min(AC.DOC_H, y1 + 20);
    return [x0, y0, x1 - x0, y1 - y0];
  }
  function drawFit(g, img, box, x, y, w, h) {
    const sc = Math.min(w / box[2], h / box[3]), dw = box[2] * sc, dh = box[3] * sc;
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(img, box[0] * img.width / AC.DOC_W, box[1] * img.height / AC.DOC_H, box[2] * img.width / AC.DOC_W, box[3] * img.height / AC.DOC_H, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }
  function wrap(g, text, x, y, maxW, lh, maxLines) {
    const paras = String(text || '').split(/\n/); let n = 0;
    for (const para of paras) {
      const words = para.split(/\s+/); let line = '';
      for (const w of words) {
        const t = line ? line + ' ' + w : w;
        if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y + n * lh); n++; line = w; if (maxLines && n >= maxLines) return n; }
        else line = t;
      }
      g.fillText(line, x, y + n * lh); n++;
      if (maxLines && n >= maxLines) return n;
    }
    return n;
  }

  AC.ficheRows = function () {
    const auto = AC.nomenclature(E.modules, E.tpl);
    const rows = (E.fiche.rows && E.fiche.rows.length && !E.fiche.auto) ? E.fiche.rows : auto.rows;
    return { rows, auto };
  };

  AC.buildFiche = function () {
    const Wp = 1654, Hp = 2339, M = 100, c = mk(Wp, Hp), g = c.getContext('2d'), f = E.fiche;
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, Wp, Hp);
    const gold = '#a8834a', ink = '#1f1b24', grey = '#7a7068';
    g.fillStyle = ink; g.textBaseline = 'alphabetic';
    g.font = '600 62px ' + SERIF; g.fillText(f.maison || 'Maison', M, 160);
    g.font = '600 24px ' + SANS; g.fillStyle = gold;
    g.fillText('F I C H E   T E C H N I Q U E', M, 210);
    const info = [['Modèle', f.modele || E.project.name], ['Référence', f.ref], ['Collection', f.collection], ['Client(e)', f.client], ['Créateur(trice)', f.createur], ['Date', f.date]];
    info.forEach(([k, v], i) => {
      const x = 900 + (i % 2) * 330, y = 110 + Math.floor(i / 2) * 64;
      g.font = '500 19px ' + SANS; g.fillStyle = grey; g.fillText(k.toUpperCase(), x, y);
      g.font = '500 27px ' + SANS; g.fillStyle = ink; wrap(g, v || '—', x, y + 30, 310, 30, 1);
    });
    g.strokeStyle = gold; g.lineWidth = 3; g.beginPath(); g.moveTo(M, 300); g.lineTo(Wp - M, 300); g.stroke();
    /* croquis */
    const img = E.composite(1.5, {}), box = contentBox();
    g.fillStyle = '#fbf8f3'; g.fillRect(M, 340, 740, 1290);
    g.strokeStyle = '#e4dccf'; g.lineWidth = 2; g.strokeRect(M, 340, 740, 1290);
    drawFit(g, img, box, M + 20, 360, 700, 1250);
    g.font = 'italic 22px ' + SERIF; g.fillStyle = grey;
    g.fillText('Silhouette ' + (AC.SPECS[E.tpl.g].name).toLowerCase() + ' — vue ' + ({ face: 'de face', dos: 'de dos', profil: 'de profil' })[E.tpl.v], M, 1670);
    /* colonne droite */
    let y = 370; const X = 890, CW = Wp - M - X;
    const title = t => { g.font = '600 30px ' + SERIF; g.fillStyle = ink; g.fillText(t, X, y); y += 14; g.strokeStyle = '#e4dccf'; g.lineWidth = 2; g.beginPath(); g.moveTo(X, y); g.lineTo(X + CW, y); g.stroke(); y += 36; };
    const { rows, auto } = AC.ficheRows();
    title('Nomenclature des tissus');
    if (!rows.length) { g.font = '400 22px ' + SANS; g.fillStyle = grey; g.fillText('Aucun tissu : ajoutez des modules.', X, y); y += 40; }
    rows.slice(0, 8).forEach(r => {
      const sw = mk(78, 78);
      AC.drawSwatch(sw, r.fabric || 'uni', r.hex || '#cccccc', r.hex2 || '#f2a900');
      g.drawImage(sw, X, y - 24); g.strokeStyle = '#d8cfc2'; g.lineWidth = 1.5; g.strokeRect(X, y - 24, 78, 78);
      g.font = '600 24px ' + SANS; g.fillStyle = ink; g.fillText(r.tissu || '', X + 98, y);
      g.font = '600 24px ' + SANS; g.textAlign = 'right'; g.fillText(r.metrage || '', X + CW, y); g.textAlign = 'left';
      g.font = '400 20px ' + SANS; g.fillStyle = grey;
      g.fillText(r.couleur || '', X + 98, y + 28);
      const n = wrap(g, (r.emplacement || '') + (r.fournisseur ? ' — ' + r.fournisseur : ''), X + 98, y + 54, CW - 98, 24, 2);
      y += Math.max(96, 54 + n * 24 + 18);
    });
    if (auto.ornaments.length) {
      y += 6; title('Ornements & broderies');
      auto.ornaments.forEach(o => {
        g.fillStyle = o.couleur; g.beginPath(); g.arc(X + 14, y - 8, 13, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#8b7a5c'; g.lineWidth = 1.5; g.stroke();
        g.font = '400 21px ' + SANS; g.fillStyle = ink;
        const n = wrap(g, o.places.join(', ') + ' — fil/couleur ' + AC.colorName(o.couleur), X + 40, y, CW - 40, 26, 2); y += n * 26 + 14;
      });
    }
    if (auto.supplies.length) {
      y += 6; title('Fournitures');
      g.font = '400 21px ' + SANS; g.fillStyle = ink;
      auto.supplies.slice(0, 10).forEach(s => { const n = wrap(g, '•  ' + s, X, y, CW, 26, 2); y += n * 26 + 4; });
    }
    if (y < 1560) {
      y += 10; title('Construction');
      g.font = '400 21px ' + SANS; g.fillStyle = ink;
      E.modules.forEach(m => {
        const d = AC.MOD[m.id]; if (!d || y > 1620) return;
        const n = wrap(g, '•  ' + d.name + (m.neck && d.top ? ' — ' + AC.NECK[m.neck].name.toLowerCase() : ''), X, y, CW, 26, 1); y += n * 26 + 2;
      });
    }
    /* notes */
    const ny = 1720;
    g.font = '600 30px ' + SERIF; g.fillStyle = ink; g.fillText('Notes', M, ny);
    g.strokeStyle = '#e4dccf'; g.lineWidth = 2; g.strokeRect(M, ny + 20, Wp - 2 * M, 440);
    g.font = '400 23px ' + SANS; g.fillStyle = ink;
    if (f.notes) wrap(g, f.notes, M + 24, ny + 66, Wp - 2 * M - 48, 32, 12);
    else { g.strokeStyle = '#efe9df'; for (let i = 1; i <= 12; i++) { g.beginPath(); g.moveTo(M + 24, ny + 20 + i * 34); g.lineTo(Wp - M - 24, ny + 20 + i * 34); g.stroke(); } }
    g.font = '400 18px ' + SANS; g.fillStyle = grey;
    g.fillText('Atelier Couture · ' + new Date().toLocaleDateString('fr-FR') + ' · Métrages indicatifs (laize 1,40 m), à valider sur toile avant achat.', M, Hp - 70);
    g.textAlign = 'right'; g.fillText('1 / 2', Wp - M, Hp - 70); g.textAlign = 'left';
    return c;
  };
  AC.buildCroquisPage = function () {
    const Wp = 1654, Hp = 2339, M = 100, c = mk(Wp, Hp), g = c.getContext('2d'), f = E.fiche;
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, Wp, Hp);
    g.font = '600 40px ' + SERIF; g.fillStyle = '#1f1b24'; g.fillText(f.modele || E.project.name, M, 140);
    g.font = '400 22px ' + SANS; g.fillStyle = '#7a7068'; g.fillText((f.maison || '') + (f.collection ? ' — ' + f.collection : ''), M, 180);
    drawFit(g, E.composite(2, {}), contentBox(), M, 230, Wp - 2 * M, Hp - 380);
    g.font = '400 18px ' + SANS; g.textAlign = 'right'; g.fillText('2 / 2', Wp - M, Hp - 70);
    return c;
  };

  /* PDF minimal : une image JPEG pleine page par page (A4) */
  AC.pdfFromCanvases = async function (canvases, title) {
    const imgs = [];
    for (const c of canvases) { const b = await E.toBlob(c, 'image/jpeg', 0.9); imgs.push({ bytes: new Uint8Array(await b.arrayBuffer()), w: c.width, h: c.height }); }
    const enc = new TextEncoder(), parts = [], offs = []; let off = 0;
    const push = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); off += b.length; };
    const obj = (n, body) => { offs[n] = off; push(n + ' 0 obj\n' + body + '\nendobj\n'); };
    push('%PDF-1.4\n%âãÏÓ\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [' + imgs.map((_, i) => (3 + 3 * i) + ' 0 R').join(' ') + '] /Count ' + imgs.length + ' >>');
    imgs.forEach((im, i) => {
      const pw = 595.28, ph = 841.89, pg = 3 + 3 * i, ct = pg + 1, ix = pg + 2;
      obj(pg, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pw + ' ' + ph + '] /Resources << /XObject << /Im' + i + ' ' + ix + ' 0 R >> >> /Contents ' + ct + ' 0 R >>');
      const s = 'q ' + pw + ' 0 0 ' + ph + ' 0 0 cm /Im' + i + ' Do Q';
      obj(ct, '<< /Length ' + s.length + ' >>\nstream\n' + s + '\nendstream');
      offs[ix] = off;
      push(ix + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + im.w + ' /Height ' + im.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + im.bytes.length + ' >>\nstream\n');
      push(im.bytes); push('\nendstream\nendobj\n');
    });
    const t = String(title || 'Fiche technique').normalize('NFD').replace(/[^\x20-\x7e]/g, '').replace(/[()\\]/g, '');
    const info = 3 + 3 * imgs.length;
    obj(info, '<< /Title (' + t + ') /Producer (Atelier Couture) >>');
    const xo = off;
    let x = 'xref\n0 ' + (info + 1) + '\n0000000000 65535 f \n';
    for (let k = 1; k <= info; k++) x += String(offs[k]).padStart(10, '0') + ' 00000 n \n';
    push(x + 'trailer\n<< /Size ' + (info + 1) + ' /Root 1 0 R /Info ' + info + ' 0 R >>\nstartxref\n' + xo + '\n%%EOF');
    return new Blob(parts, { type: 'application/pdf' });
  };

  AC.exportPNG = async function (o) {
    const c = E.composite(o.hd ? 2 : 1, { template: o.template, background: o.background });
    const b = await E.toBlob(c, 'image/png');
    return AC.saveBlob(b, AC.fileName(E.project.name, 'png'), o.share);
  };
  AC.exportPDF = async function (o) {
    const pages = [AC.buildFiche(), AC.buildCroquisPage()];
    const b = await AC.pdfFromCanvases(pages, E.fiche.modele || E.project.name);
    return AC.saveBlob(b, AC.fileName('Fiche_' + (E.fiche.modele || E.project.name), 'pdf'), o && o.share);
  };
  AC.exportProject = async function (o) {
    const data = await E.serialize();
    const b = new Blob([JSON.stringify(data)], { type: 'application/json' });
    return AC.saveBlob(b, AC.fileName(E.project.name, 'atelier'), o && o.share);
  };
})();
