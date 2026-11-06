'use strict';
/* Atelier Couture — bibliothèque de modules de vêtement (vectoriels, adaptés à la silhouette) */
(function () {
  const AC = window.AC = window.AC || {};

  AC.CATS = [
    { id: 'ensemble', name: 'Ensembles' },
    { id: 'corsage', name: 'Corsages', z: 30 },
    { id: 'robe', name: 'Robes & boubous', z: 25 },
    { id: 'jupe', name: 'Jupes', z: 12 },
    { id: 'bas', name: 'Pantalons', z: 10 },
    { id: 'manche', name: 'Manches', z: 20 },
    { id: 'encolure', name: 'Encolures' },
    { id: 'col', name: 'Cols', z: 50 },
    { id: 'drape', name: 'Drapés & volumes', z: 40 },
    { id: 'ceinture', name: 'Ceintures', z: 55 },
    { id: 'fermeture', name: 'Fermetures', z: 60 },
    { id: 'broderie', name: 'Broderies & ornements', z: 70 },
    { id: 'accessoire', name: 'Accessoires', z: 65 }
  ];
  const CATZ = {}; AC.CATS.forEach(c => { CATZ[c.id] = c.z || 0; });

  /* ---------- Outils géométriques ---------- */
  function mk(L) {
    const cx = L.cx, u = L.hu;
    const H = a => a.map(p => [cx - p[0], p[1], p[2] || 0]);
    const mir = a => a.map(p => [2 * cx - p[0], p[1], p[2] || 0]);
    const sym = a => {
      const r = mir(a).reverse();
      if (Math.abs(a[a.length - 1][0] - cx) < 0.5) r.shift();
      if (Math.abs(a[0][0] - cx) < 0.5) r.pop();
      return a.concat(r);
    };
    const sh = (t, pts, x) => Object.assign({ t, pts }, x || {});
    return {
      cx, u, H, mir, sym,
      P: pts => sh('piece', pts),
      T: pts => sh('trim', pts),
      S: (pts, closed) => sh('seam', pts, { closed: !!closed }),
      D: pts => sh('dash', pts),
      F: pts => sh('fold', pts),
      TL: (pts, closed) => sh('tline', pts, { closed: !!closed }),
      dots: (c, fill) => ({ t: 'dot', c, fill: fill || 'trim' }),
      pair: s => [s, s.c ? Object.assign({}, s, { c: s.c.map(d => [2 * cx - d[0], d[1], d[2]]) }) : Object.assign({}, s, { pts: mir(s.pts) })],
      wave: (y, half, amp, n) => { const o = []; for (let i = 0; i <= n; i++) o.push([cx - half + 2 * half * i / n, y + (i % 2 ? amp : 0)]); return o; }
    };
  }
  const C = p => [p[0], p[1], 1];
  function arm(L, t, side, e) {
    const A = L.arm, a = side === 'o' ? [A.sh, A.elbO, A.wrO] : [A.pit, A.elbI, A.wrI];
    let p, q, s;
    if (t <= 0.5) { p = a[0]; q = a[1]; s = t / 0.5; } else { p = a[1]; q = a[2]; s = (t - 0.5) / 0.5; }
    const x = p[0] + (q[0] - p[0]) * s, y = p[1] + (q[1] - p[1]) * s;
    return [side === 'o' ? x + (e || 0) : x - (e || 0), y];
  }
  const armMid = L => [(L.arm.sh[0] + L.arm.pit[0]) / 2 - 0.1 * L.hu, (L.arm.sh[1] + L.arm.pit[1]) / 2];
  function bodyHalf(L, y) {
    const a = [[L.pitY, L.bh], [L.bustY, L.bh * 1.02], [L.waistY, L.wh], [L.hipY, L.hh], [L.crotchY, L.hh * 0.98]];
    if (y <= a[0][0]) return a[0][1];
    for (let i = 0; i < a.length - 1; i++) if (y <= a[i + 1][0]) { const t = (y - a[i][0]) / (a[i + 1][0] - a[i][0]); return a[i][1] + (a[i + 1][1] - a[i][1]) * t; }
    return a[a.length - 1][1];
  }

  /* Encolures : points en demi-largeur, du côté vers le milieu devant */
  const NECK = {
    ronde: L => ({ pts: [[L.nh * 1.2, L.shY - 0.14 * L.hu, 1], [L.nh * 1.12, L.shY + 0.02 * L.hu], [L.nh * 0.62, L.shY + 0.15 * L.hu], [0, L.shY + 0.18 * L.hu]] }),
    v: L => ({ pts: [[L.nh * 1.3, L.shY - 0.13 * L.hu, 1], [0, L.bustY, 1]] }),
    carree: L => ({ pts: [[L.nh * 1.9, L.shY - 0.08 * L.hu, 1], [L.nh * 1.85, L.shY + 0.32 * L.hu, 1], [0, L.shY + 0.34 * L.hu, 1]] }),
    bateau: L => ({ pts: [[L.sh * 0.74, L.shY - 0.07 * L.hu, 1], [L.sh * 0.4, L.shY - 0.01 * L.hu], [0, L.shY + 0.03 * L.hu]] }),
    coeur: L => ({ strapless: true, pts: [[L.bh * 1.02, L.pitY + 0.1 * L.hu, 1], [L.bh * 0.86, L.pitY - 0.02 * L.hu], [L.bh * 0.48, L.bustY - 0.2 * L.hu], [L.bh * 0.14, L.bustY - 0.06 * L.hu], [0, L.bustY + 0.03 * L.hu, 1]] }),
    droit: L => ({ strapless: true, pts: [[L.bh * 1.02, L.pitY + 0.12 * L.hu, 1], [L.bh * 0.5, L.pitY + 0.15 * L.hu], [0, L.pitY + 0.16 * L.hu]] }),
    profond: L => ({ pts: [[L.nh * 1.35, L.shY - 0.13 * L.hu, 1], [0, L.waistY - 0.15 * L.hu, 1]] })
  };
  AC.NECKS = [
    { id: 'ronde', name: 'Encolure ronde', desc: 'Encolure ras-du-cou, finition par parementure ou biais. Universelle, elle met en valeur une broderie d’encolure.' },
    { id: 'v', name: 'Encolure en V', desc: 'Allonge le buste et affine le cou. Stabiliser le V avec un droit-fil thermocollant pour qu’il ne baille pas.' },
    { id: 'carree', name: 'Encolure carrée', desc: 'Encolure Renaissance, élégante avec une manche ballon. Angles crantés et parementure entoilée.' },
    { id: 'bateau', name: 'Encolure bateau', desc: 'Large d’une épaule à l’autre, peu profonde : élargit la carrure, très chic en crêpe ou bazin.' },
    { id: 'coeur', name: 'Bustier cœur', desc: 'Décolleté sans bretelles en forme de cœur : demande un corsage baleiné et un gros-grain intérieur à la taille.' },
    { id: 'droit', name: 'Bustier droit', desc: 'Bord droit sans bretelles, sobre et graphique : baleines, bonnets intégrés ou thermoformés.' },
    { id: 'profond', name: 'Décolleté plongeant', desc: 'V profond jusqu’à la taille : idéal pour veste ou robe du soir ; prévoir un adhésif ou une bride invisible.' }
  ];
  AC.NECK = {}; AC.NECKS.forEach(n => { AC.NECK[n.id] = n; });

  /* Buste générique : encolure + épaule + côté jusqu'à l'ourlet */
  function bodice(L, neck, o) {
    const k = mk(L), u = L.hu, e = o.ease || 1;
    const n = (NECK[neck] || NECK.ronde)(L);
    const pts = n.pts.slice().reverse();
    if (!n.strapless) {
      pts.push([L.sh * 0.98, L.shY + 0.02 * u, 1]);
      pts.push([L.sh * 0.9, L.shY + 0.22 * u]);
      pts.push([L.bh * 1.02 * e, L.pitY, 1]);
    }
    const stop = o.to || (o.hem - 0.06 * u);
    const side = [[L.bh * 1.03 * e, L.bustY], [L.wh * 1.06 * e * (o.waistEase || 1), L.waistY], [L.hh * 1.04 * e, L.hipY], [L.hh * 1.03 * e, L.crotchY]];
    side.forEach(p => { if (p[1] < stop && p[1] > pts[pts.length - 1][1] + 0.05 * u) pts.push(p); });
    if (o.tail) o.tail.forEach(p => pts.push(p));
    else { pts.push([o.hemH, o.hem, 1]); pts.push([0, o.hem + (o.dip || 0) * u, o.dip ? 1 : 0]); }
    return k.sym(k.H(pts));
  }

  /* ---------- Catalogue ---------- */
  const MODS = []; const MOD = {};
  function def(id, cat, name, meta, build) { const m = Object.assign({ id, cat, name, build, vol: 0, met: 0, fab: [], sup: [], tips: [] }, meta); MODS.push(m); MOD[id] = m; }

  /* ===== CORSAGES ===== */
  def('corsage-ajuste', 'corsage', 'Corsage ajusté à pinces', {
    neck: 'ronde', met: 0.8, fab: ['wax', 'bazin', 'crepe', 'satin', 'lin'], sup: ['Zip invisible 40 cm'], top: true,
    desc: 'Buste près du corps construit par des pinces de poitrine et de taille, arrêtées 2 cm avant le sommet de poitrine. Base du « taille basse ».',
    tips: ['Faire une toile d’essayage avant de couper le tissu définitif.', 'Repasser les pinces vers le milieu (pinces verticales) ou vers le bas (pinces de côté).']
  }, (L, o, k) => {
    const u = L.hu;
    return [k.P(bodice(L, o.neck || 'ronde', { hem: L.waistY + 0.12 * u, hemH: L.wh * 1.08, dip: 0.05 })),
      ...k.pair(k.S(k.H([[L.bh * 0.5, L.waistY + 0.12 * u], [L.bh * 0.47, L.bustY + 0.1 * u]])))];
  });
  def('corsage-princesse', 'corsage', 'Corsage à découpes princesse', {
    neck: 'carree', met: 0.9, fab: ['crepe', 'satin', 'bazin', 'velours', 'wax'], sup: ['Zip invisible 40 cm', 'Entoilage léger'], top: true,
    desc: 'Les découpes princesse partent de l’emmanchure, passent par le sommet de poitrine et descendent vers la taille : elles remplacent les pinces et sculptent le buste.',
    tips: ['Cranter les arrondis des découpes pour qu’elles tournent sans tirer.', 'Idéal pour jouer un contraste de matières entre panneaux.']
  }, (L, o, k) => {
    const u = L.hu;
    return [k.P(bodice(L, o.neck || 'carree', { hem: L.waistY + 0.12 * u, hemH: L.wh * 1.08, dip: 0.04 })),
      ...k.pair(k.S(k.H([[L.sh * 0.84, L.shY + 0.3 * u], [L.bh * 0.56, L.bustY - 0.06 * u], [L.bh * 0.5, L.bustY + 0.15 * u], [L.wh * 0.56, L.waistY + 0.13 * u]])))];
  });
  def('corset', 'corsage', 'Corset baleiné', {
    neck: 'coeur', met: 0.7, struct: true, fab: ['satin', 'bazin', 'velours', 'dentelle', 'wax'], sup: ['Baleines spirales (≈ 3 m)', 'Gros-grain 3 cm (ceinture intérieure)', 'Coutil de corseterie', 'Zip ou laçage dos'], top: true,
    desc: 'Corsage structuré sans bretelles : baleines dans des coulisses, ceinture intérieure en gros-grain qui porte le poids de la jupe. Pointe basse « taille pointe » au milieu devant.',
    tips: ['La tenue vient du coutil et des baleines, pas du tissu extérieur.', 'Ajuster sur la personne : 1 cm de jeu au maximum à la poitrine.']
  }, (L, o, k) => {
    const u = L.hu, out = [k.P(bodice(L, o.neck || 'coeur', { hem: L.waistY + 0.1 * u, hemH: L.wh * 1.06, dip: 0.16 }))];
    [0.22, 0.52, 0.82].forEach(f => out.push(...k.pair(k.S(k.H([[L.bh * f, L.bustY + 0.06 * u], [L.wh * f * 1.02, L.waistY + 0.1 * u + (1 - f) * 0.12 * u]])))));
    out.push(k.S([[k.cx, L.bustY + 0.05 * u], [k.cx, L.waistY + 0.25 * u]]));
    return out;
  });
  def('cache-coeur', 'corsage', 'Corsage cache-cœur', {
    neck: 'v', met: 1.0, drape: true, fab: ['soie', 'crepe', 'mousseline', 'dentelle'], sup: ['Pression ou agrafe intérieure'], top: true,
    desc: 'Deux devants croisés qui forment un V et se nouent ou s’agrafent sur le côté. Les plis partent de la taille vers l’épaule opposée.',
    tips: ['Couper les devants dans le biais pour un croisé souple.', 'Placer une pression au croisement pour éviter qu’il ne s’ouvre.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx;
    return [k.P(bodice(L, o.neck || 'v', { hem: L.waistY + 0.1 * u, hemH: L.wh * 1.07 })),
      k.S([[cx - L.nh * 1.3, L.shY - 0.13 * u], [cx - L.bh * 0.15, L.bustY - 0.1 * u], [cx + L.wh * 0.5, L.waistY - 0.1 * u], [cx + L.wh * 1.06, L.waistY + 0.04 * u]]),
      k.F([[cx + L.wh * 0.9, L.waistY], [cx + L.bh * 0.15, L.bustY - 0.05 * u]]),
      k.F([[cx + L.wh * 1.0, L.waistY + 0.04 * u], [cx + L.bh * 0.55, L.bustY + 0.05 * u]]),
      k.F([[cx + L.wh * 0.7, L.waistY + 0.05 * u], [cx - L.bh * 0.2, L.bustY + 0.2 * u]]),
      k.P([[cx + L.wh * 1.04, L.waistY - 0.02 * u], [cx + L.wh * 1.04 + 0.28 * u, L.waistY + 0.55 * u], [cx + L.wh * 1.04 + 0.12 * u, L.waistY + 0.6 * u, 1], [cx + L.wh * 0.98, L.waistY + 0.12 * u]])];
  });
  def('blouse', 'corsage', 'Blouse fluide froncée', {
    neck: 'bateau', met: 1.3, drape: true, vol: 1, fab: ['soie', 'mousseline', 'crepe', 'lin'], sup: ['Élastique ou coulisse'], top: true,
    desc: 'Corps ample froncé à l’encolure, qui blouse au-dessus des hanches. Les fronces se répartissent sur un biais ou une coulisse.',
    tips: ['Compter 1,5 à 2 fois la longueur finie pour des fronces généreuses.', 'Fronces : deux rangs de points longs, tirer les fils du dessous.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.hipY - 0.15 * u, out = [k.P(bodice(L, o.neck || 'bateau', { ease: 1.14, hem, hemH: bodyHalf(L, hem) * 1.15 }))];
    [0.2, 0.45, 0.7].forEach(f => out.push(...k.pair(k.F(k.H([[L.sh * 0.7 * f + 0.05 * u, L.shY + 0.05 * u], [L.bh * f * 1.1, L.bustY + 0.1 * u]])))));
    out.push(...k.pair(k.F(k.H([[L.bh * 0.8, L.bustY + 0.3 * u], [L.hh * 0.9, hem - 0.05 * u]]))));
    return out;
  });
  def('chemise', 'corsage', 'Chemise', {
    neck: 'ronde', met: 1.4, fab: ['lin', 'soie', 'crepe', 'uni'], sup: ['Boutons ×7', 'Entoilage col et patte'], top: true,
    desc: 'Chemise à patte de boutonnage, poche poitrine et pans arrondis (ourlet « queue de chemise »). À associer au col chemise.',
    tips: ['Entoiler la patte de boutonnage et le col.', 'Coutures rabattues ou anglaises pour une finition couture.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx, h = bodyHalf(L, L.hipY) * 1.1;
    return [k.P(bodice(L, o.neck || 'ronde', { ease: 1.08, to: L.hipY - 0.06 * u, tail: [[h, L.hipY - 0.04 * u, 1], [h * 0.6, L.hipY + 0.13 * u], [0, L.hipY + 0.2 * u]] })),
      k.D([[cx - 0.07 * u, L.shY + 0.19 * u], [cx - 0.07 * u, L.hipY + 0.19 * u]]), k.D([[cx + 0.07 * u, L.shY + 0.19 * u], [cx + 0.07 * u, L.hipY + 0.19 * u]]),
      k.S(k.H([[L.bh * 0.78, L.bustY - 0.16 * u, 1], [L.bh * 0.32, L.bustY - 0.16 * u, 1], [L.bh * 0.32, L.bustY + 0.14 * u, 1], [L.bh * 0.78, L.bustY + 0.14 * u, 1]]), true),
      k.dots([0.3, 0.75, 1.2, 1.65, 2.1, 2.55].map(i => [cx, L.shY + 0.26 * u + i * (L.hipY - L.shY) / 3.2, 0.028 * u]), 'btn')];
  });
  def('veste', 'corsage', 'Veste tailleur', {
    neck: 'profond', met: 1.6, struct: true, fab: ['crepe', 'velours', 'lin', 'bazin', 'wax'], sup: ['Entoilage thermocollant', 'Épaulettes', 'Doublure', 'Boutons ×2'], top: true,
    desc: 'Veste ajustée à découpes princesse, poches à rabat et croisement milieu devant. Se complète d’un col tailleur cranté ou d’un col châle.',
    tips: ['Entoiler devants, parementures et sous-col : c’est la base de la tenue tailleur.', 'Monter les manches avec une tête de manche (ouatine) pour un arrondi net.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx, hem = L.hipY + 0.22 * u, h = bodyHalf(L, L.hipY) * 1.14;
    return [k.P(bodice(L, o.neck || 'profond', { ease: 1.1, hem, hemH: h })),
      ...k.pair(k.S(k.H([[L.sh * 0.84, L.shY + 0.3 * u], [L.bh * 0.56, L.bustY], [L.wh * 0.6, L.waistY], [L.hh * 0.62, hem]]))),
      ...k.pair(k.S(k.H([[L.hh * 0.95, L.hipY - 0.04 * u, 1], [L.hh * 0.42, L.hipY - 0.04 * u, 1], [L.hh * 0.42, L.hipY + 0.07 * u, 1], [L.hh * 0.95, L.hipY + 0.07 * u, 1]]), true)),
      k.S([[cx, L.waistY - 0.15 * u], [cx, hem]]),
      k.dots([[cx, L.waistY - 0.02 * u, 0.04 * u], [cx, L.waistY + 0.3 * u, 0.04 * u]], 'btn')];
  });
  def('tunique', 'corsage', 'Tunique à fentes', {
    neck: 'ronde', met: 1.6, fab: ['bazin', 'lin', 'wax', 'crepe'], sup: ['Entoilage d’encolure'], top: true,
    desc: 'Tunique droite à mi-cuisse, fendue sur les côtés : pièce de base du costume sénégalais (avec pantalon ou sarouel).',
    tips: ['Renforcer le haut des fentes par une bride ou un point d’arrêt.', 'Belle base pour une broderie d’encolure et un plastron.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.crotchY + 0.55 * u, h = L.hh * 1.18;
    return [k.P(bodice(L, o.neck || 'ronde', { ease: 1.15, hem, hemH: h })),
      ...k.pair(k.S(k.H([[h * 0.995, hem], [h * 0.98, hem - 0.5 * u]])))];
  });

  /* ===== ROBES & BOUBOUS ===== */
  def('robe-fourreau', 'robe', 'Robe fourreau', {
    neck: 'bateau', met: 1.6, fab: ['crepe', 'satin', 'velours', 'wax', 'dentelle'], sup: ['Zip invisible 55 cm', 'Doublure'], top: true, bottom: true,
    desc: 'Robe près du corps de l’épaule au genou, construite par pinces poitrine-taille-hanches, fente ou pli d’aisance au dos.',
    tips: ['Prévoir 2 à 4 cm d’aisance aux hanches pour pouvoir s’asseoir.', 'Fente milieu dos ou pli creux : indispensable sous le genou.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.kneeY + 0.1 * u;
    return [k.P(bodice(L, o.neck || 'bateau', { hem, hemH: L.hh * 0.96 })),
      ...k.pair(k.S(k.H([[L.bh * 0.5, L.bustY + 0.1 * u], [L.bh * 0.47, L.waistY], [L.bh * 0.5, L.hipY - 0.2 * u]]))),
      k.D([[k.cx, hem], [k.cx, hem - 0.45 * u]])];
  });
  def('robe-sirene', 'robe', 'Robe sirène longue', {
    neck: 'coeur', met: 3.2, vol: 1, struct: true, fab: ['satin', 'crepe', 'dentelle', 'velours', 'bazin'], sup: ['Zip invisible 55 cm', 'Baleines (corsage)', 'Doublure', 'Crin horsehair pour l’ourlet'], top: true, bottom: true,
    desc: 'Ajustée jusqu’au genou puis évasée en godets jusqu’au sol : la silhouette de soirée par excellence.',
    tips: ['La coupe se joue à la ligne d’évasement : placez-la juste au-dessus du genou pour marcher.', 'Ourlet doublé de crin pour que l’évasement tienne.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx;
    const out = [k.P(bodice(L, o.neck || 'coeur', { to: L.crotchY + 0.01 * u, tail: [[L.hh * 0.97, L.crotchY], [L.hh * 0.86, L.kneeY - 0.1 * u], [L.hh * 1.15, L.kneeY + 0.9 * u], [L.hh * 1.75, L.floorY - 0.06 * u, 1], [0, L.floorY + 0.02 * u]] }))];
    out.push(...k.pair(k.S(k.H([[L.hh * 0.86, L.kneeY - 0.1 * u], [0, L.kneeY - 0.02 * u]]))));
    out.push(...k.pair(k.F(k.H([[L.hh * 0.62, L.kneeY + 0.1 * u], [L.hh * 1.05, L.floorY - 0.05 * u]]))));
    out.push(...k.pair(k.F(k.H([[L.hh * 0.25, L.kneeY + 0.2 * u], [L.hh * 0.4, L.floorY]]))));
    out.push(k.F([[cx, L.kneeY + 0.35 * u], [cx, L.floorY]]));
    return out;
  });
  def('robe-trapeze', 'robe', 'Robe trapèze', {
    neck: 'ronde', met: 1.8, fab: ['wax', 'lin', 'crepe', 'bazin', 'satin'], sup: ['Zip invisible 55 cm'], top: true, bottom: true,
    desc: 'Robe qui s’évase en ligne A dès la poitrine, pinces de poitrine partant du côté. Silhouette graphique années 60.',
    tips: ['Les pinces de côté suffisent : pas de pince de taille.', 'Un tissu à tenue (wax, lin, satin) garde la ligne A.']
  }, (L, o, k) => {
    const u = L.hu;
    return [k.P(bodice(L, o.neck || 'ronde', { ease: 1.06, to: L.pitY + 0.01 * u, tail: [[L.bh * 1.08, L.bustY], [L.hh * 1.18, L.hipY], [L.hh * 1.45, L.kneeY + 0.1 * u, 1], [0, L.kneeY + 0.15 * u]] })),
      ...k.pair(k.S(k.H([[L.bh * 1.06, L.bustY + 0.12 * u], [L.bh * 0.66, L.bustY + 0.03 * u]]))),
      ...k.pair(k.F(k.H([[L.hh * 0.75, L.hipY], [L.hh * 1.05, L.kneeY + 0.1 * u]])))];
  });
  def('robe-empire', 'robe', 'Robe empire longue', {
    neck: 'v', met: 3.0, drape: true, vol: 1, fab: ['mousseline', 'soie', 'crepe', 'dentelle'], sup: ['Zip invisible 40 cm', 'Fond de robe'], top: true, bottom: true,
    desc: 'Couture sous la poitrine, jupe fluide jusqu’au sol : allonge la silhouette et libère la taille.',
    tips: ['Froncer ou plisser la jupe sous la poitrine ; doubler le corsage.', 'Mousseline sur fond de crêpe pour un tombé aérien et opaque.']
  }, (L, o, k) => {
    const u = L.hu;
    return [k.P(bodice(L, o.neck || 'v', { to: L.bustY - 0.01 * u, tail: [[L.bh * 1.04, L.bustY], [L.bh * 1.0, L.bustY + 0.22 * u], [L.hh * 1.15, L.hipY], [L.hh * 1.45, L.kneeY + 0.5 * u], [L.hh * 1.62, L.floorY - 0.05 * u, 1], [0, L.floorY]] })),
      ...k.pair(k.S(k.H([[L.bh * 1.0, L.bustY + 0.22 * u], [0, L.bustY + 0.27 * u]]))),
      ...k.pair(k.F(k.H([[L.bh * 0.55, L.bustY + 0.28 * u], [L.hh * 0.95, L.floorY - 0.04 * u]]))),
      ...k.pair(k.F(k.H([[L.bh * 0.2, L.bustY + 0.3 * u], [L.hh * 0.35, L.floorY]])))];
  });
  def('grand-boubou', 'robe', 'Grand boubou', {
    neck: 'v', met: 4.5, vol: 2, fab: ['bazin', 'wax', 'soie', 'lin', 'satin'], sup: ['Fil de broderie (encolure, plastron)', 'Entoilage d’encolure'], top: true, bottom: true, wide: true,
    desc: 'Le mbubb : grande pièce ample d’une seule largeur, ailes jusqu’aux poignets, tombant jusqu’aux chevilles. Le tombé vient de la matière (bazin riche amidonné).',
    tips: ['Le volume se lit dans les ailes : dessinez les plis qui partent de l’épaule vers l’ourlet.', 'Encolure brodée et plastron sont la signature : un seul point focal suffit.']
  }, (L, o, k) => {
    const u = L.hu, wx = L.arm.wrO[0] + 0.38 * u, wy = L.arm.wrO[1];
    const n = (NECK[o.neck || 'v'] || NECK.v)(L);
    const pts = n.pts.slice().reverse().concat([[L.sh * 1.02, L.shY + 0.03 * u], [wx, wy - 0.28 * u, 1], [wx + 0.02 * u, wy + 0.2 * u], [wx * 0.97, wy + 0.55 * u], [wx * 0.94, L.kneeY], [wx * 0.95, L.floorY - 0.2 * u, 1], [0, L.floorY - 0.15 * u]]);
    return [k.P(k.sym(k.H(pts))),
      ...k.pair(k.F(k.H([[L.sh * 0.95, L.shY + 0.3 * u], [wx * 0.72, L.floorY - 0.25 * u]]))),
      ...k.pair(k.F(k.H([[wx * 0.82, wy + 0.15 * u], [wx * 0.9, L.floorY - 0.25 * u]]))),
      ...k.pair(k.F(k.H([[L.bh * 0.5, L.bustY + 0.25 * u], [L.hh * 0.45, L.floorY - 0.2 * u]]))),
      ...k.pair(k.F(k.H([[L.sh * 1.15, L.shY + 0.12 * u], [wx - 0.08 * u, wy - 0.18 * u]])))];
  });
  def('kaftan', 'robe', 'Kaftan', {
    neck: 'ronde', met: 3.0, fab: ['bazin', 'soie', 'crepe', 'lin', 'velours'], sup: ['Boutons boule ×8', 'Galon ou passementerie'], top: true, bottom: true,
    desc: 'Longue tunique droite fendue sur les côtés, ouverture boutonnée à l’encolure. Se porte avec manches longues ou évasées.',
    tips: ['Les fentes de côté donnent l’aisance de marche : arrêter au genou.', 'Une passementerie ou une broderie souligne la patte d’encolure.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx, h = L.hh * 1.24;
    return [k.P(bodice(L, o.neck || 'ronde', { to: L.pitY + 0.01 * u, tail: [[L.bh * 1.12, L.pitY + 0.1 * u, 1], [L.hh * 1.18, L.hipY], [h, L.floorY - 0.12 * u, 1], [0, L.floorY - 0.1 * u]] })),
      ...k.pair(k.S(k.H([[h, L.floorY - 0.12 * u], [h * 0.97, L.kneeY]]))),
      k.S([[cx, L.shY + 0.18 * u], [cx, L.bustY + 0.3 * u]]),
      k.dots([0, 1, 2, 3].map(i => [cx, L.shY + 0.26 * u + i * 0.14 * u, 0.025 * u]), 'btn')];
  });
  def('ndokette', 'robe', 'Ndokette à volants', {
    neck: 'ronde', met: 4.0, vol: 2, fab: ['wax', 'bazin', 'lin', 'satin'], sup: ['Élastique ou coulisse'], top: true, bottom: true,
    desc: 'Robe ample sénégalaise qui s’évase jusqu’au sol, rythmée de volants rapportés ; souvent portée avec des manches bouffantes et un foulard assorti.',
    tips: ['Un volant froncé demande 1,5 à 2 fois la longueur de la couture d’assemblage.', 'Le wax tient le volume des volants sans jupon.']
  }, (L, o, k) => {
    const u = L.hu, y1 = L.kneeY + 0.5 * u, y2 = L.kneeY + 1.6 * u;
    const out = [k.P(bodice(L, o.neck || 'ronde', { to: L.pitY + 0.01 * u, tail: [[L.bh * 1.12, L.pitY + 0.05 * u, 1], [L.hh * 1.3, L.hipY], [L.hh * 1.6, L.kneeY + 0.6 * u], [L.hh * 1.92, L.floorY - 0.05 * u, 1], [0, L.floorY]] }))];
    out.push(k.S(k.wave(y1, L.hh * 1.55, 0.05 * u, 14)), k.S(k.wave(y2, L.hh * 1.78, 0.05 * u, 16)));
    [0.3, 0.65, 0.95].forEach(f => out.push(...k.pair(k.F(k.H([[L.hh * 1.5 * f, y1 + 0.08 * u], [L.hh * 1.75 * f, y2 - 0.05 * u]]))), ...k.pair(k.F(k.H([[L.hh * 1.75 * f, y2 + 0.08 * u], [L.hh * 1.9 * f, L.floorY - 0.05 * u]])))));
    return out;
  });

  /* ===== JUPES ===== */
  const waistTop = L => [[0, L.waistY - 0.02 * L.hu], [L.wh * 1.03, L.waistY - 0.02 * L.hu, 1]];
  const band = (L, k) => k.S([[k.cx - L.wh * 1.03, L.waistY + 0.08 * L.hu], [k.cx + L.wh * 1.03, L.waistY + 0.08 * L.hu]]);
  def('jupe-crayon', 'jupe', 'Jupe crayon', {
    met: 0.9, fab: ['crepe', 'wax', 'velours', 'lin', 'satin'], sup: ['Zip invisible 20 cm', 'Doublure'], bottom: true,
    desc: 'Jupe droite resserrée vers le genou, pinces de taille, ceinture rapportée et fente ou pli d’aisance au dos.',
    tips: ['Resserrer de 2 à 3 cm par côté au genou, pas plus, pour garder la marche.', 'Doubler pour qu’elle glisse sur les hanches.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.kneeY + 0.12 * u;
    return [k.P(k.sym(k.H(waistTop(L).concat([[L.hh * 1.03, L.hipY], [L.hh * 0.95, hem, 1], [0, hem + 0.02 * u]])))), band(L, k),
      ...k.pair(k.S(k.H([[L.wh * 0.5, L.waistY + 0.08 * u], [L.wh * 0.52, L.hipY - 0.25 * u]]))), k.D([[k.cx, hem], [k.cx, hem - 0.4 * u]])];
  });
  def('jupe-trapeze', 'jupe', 'Jupe trapèze', {
    met: 1.1, fab: ['wax', 'lin', 'crepe', 'satin', 'bazin'], sup: ['Zip invisible 20 cm'], bottom: true,
    desc: 'Jupe en ligne A, légèrement évasée du bassin au genou : facile à porter, elle équilibre un buste ajusté.',
    tips: ['Couper les lés en droit-fil au milieu pour que les côtés tombent en biais léger.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.kneeY + 0.08 * u;
    return [k.P(k.sym(k.H(waistTop(L).concat([[L.hh * 1.08, L.hipY], [L.hh * 1.42, hem, 1], [0, hem + 0.04 * u]])))), band(L, k),
      ...k.pair(k.F(k.H([[L.hh * 0.7, L.hipY + 0.1 * u], [L.hh * 0.95, hem]])))];
  });
  def('jupe-corolle', 'jupe', 'Jupe corolle', {
    met: 3.5, vol: 2, struct: true, fab: ['satin', 'wax', 'bazin', 'tulle', 'crepe'], sup: ['Jupon ou crinoline', 'Zip invisible 20 cm', 'Crin pour l’ourlet'], bottom: true,
    desc: 'Jupe cercle ou demi-cercle à godets, mi-mollet : la ligne « New Look », taille marquée et ampleur ronde.',
    tips: ['Laisser pendre une jupe cercle 24 h avant de régler l’ourlet (le biais s’allonge).', 'Un jupon de tulle donne la rondeur sans alourdir.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.kneeY + 0.95 * u, w = L.hh * 2.05, pts = waistTop(L).concat([[L.hh * 1.3, L.hipY - 0.1 * u], [L.hh * 1.95, L.kneeY + 0.55 * u], [w, hem, 1]]);
    for (let i = 1; i <= 6; i++) pts.push([w * (1 - i / 6.6), hem + (i % 2 ? 0.07 * u : 0)]);
    pts.push([0, hem + 0.07 * u]);
    const out = [k.P(k.sym(k.H(pts))), band(L, k)];
    [0.35, 0.65, 0.92].forEach(f => out.push(...k.pair(k.F(k.H([[L.wh * f, L.waistY + 0.22 * u], [w * f * 0.95, hem]])))));
    return out;
  });
  def('jupe-sirene', 'jupe', 'Jupe sirène', {
    met: 2.2, vol: 1, fab: ['satin', 'wax', 'crepe', 'dentelle', 'bazin'], sup: ['Zip invisible 20 cm', 'Crin pour l’ourlet'], bottom: true,
    desc: 'Longue jupe moulante jusqu’au genou, puis évasée par des godets : la jupe du « taille basse » de cérémonie.',
    tips: ['Les godets se coupent en quart de cercle et s’insèrent dans les coutures.']
  }, (L, o, k) => {
    const u = L.hu;
    return [k.P(k.sym(k.H(waistTop(L).concat([[L.hh * 1.03, L.hipY], [L.hh * 0.9, L.kneeY - 0.1 * u], [L.hh * 1.2, L.kneeY + 1.0 * u], [L.hh * 1.75, L.floorY - 0.05 * u, 1], [0, L.floorY + 0.03 * u]])))), band(L, k),
      ...k.pair(k.S(k.H([[L.hh * 0.9, L.kneeY - 0.1 * u], [0, L.kneeY - 0.02 * u]]))),
      ...k.pair(k.F(k.H([[L.hh * 0.6, L.kneeY + 0.1 * u], [L.hh * 1.1, L.floorY - 0.04 * u]])))];
  });
  def('jupe-plissee', 'jupe', 'Jupe plissée soleil', {
    met: 2.2, vol: 1, pleat: true, fab: ['mousseline', 'crepe', 'soie', 'satin'], sup: ['Plissage thermofixé (atelier)', 'Ceinture entoilée'], bottom: true,
    desc: 'Jupe mi-mollet à plis rayonnants fixés à chaud, qui bougent à chaque pas.',
    tips: ['Le plissé permanent exige une fibre thermoplastique (polyester) : confier le tissu à un plisseur.', 'Ourlet fait avant plissage.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.kneeY + 0.8 * u, w = L.hh * 1.45;
    const out = [k.P(k.sym(k.H(waistTop(L).concat([[L.hh * 1.12, L.hipY], [w, hem, 1], [0, hem + 0.02 * u]])))), band(L, k)];
    for (let i = 1; i <= 6; i++) out.push(...k.pair(k.F(k.H([[L.wh * 1.02 * i / 6.6, L.waistY + 0.1 * u], [w * i / 6.6, hem]]))));
    out.push(k.F([[k.cx, L.waistY + 0.1 * u], [k.cx, hem]]));
    return out;
  });
  def('pagne', 'jupe', 'Pagne noué', {
    met: 2.0, fab: ['wax', 'bazin', 'lin', 'soie'], sup: [], bottom: true,
    desc: 'Pagne long enroulé et noué sur la hanche : un rectangle de tissu dont le pan croisé dessine une diagonale.',
    tips: ['Un pagne fait environ 2 yards (1,80 m) ; ajouter des liens intérieurs pour la tenue.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx, hem = L.floorY - 0.12 * u;
    return [k.P(k.sym(k.H(waistTop(L).concat([[L.hh * 1.04, L.hipY], [L.hh * 1.02, hem, 1], [0, hem + 0.02 * u]])))),
      k.S([[cx - L.wh * 0.85, L.waistY + 0.04 * u], [cx - L.hh * 0.1, L.hipY + 0.4 * u], [cx + L.hh * 0.25, L.kneeY + 0.6 * u], [cx + L.hh * 0.3, hem]]),
      k.P([[cx - L.wh * 1.0, L.waistY], [cx - L.wh * 0.72, L.waistY + 0.04 * u], [cx - L.wh * 0.8, L.waistY + 0.2 * u], [cx - L.wh * 1.05, L.waistY + 0.18 * u]]),
      k.P([[cx - L.wh * 0.95, L.waistY + 0.16 * u], [cx - L.wh * 0.8, L.waistY + 0.18 * u], [cx - L.wh * 0.85, L.hipY - 0.05 * u, 1], [cx - L.wh * 1.05, L.hipY - 0.12 * u, 1]]),
      k.F([[cx - L.wh * 0.8, L.waistY + 0.2 * u], [cx - L.hh * 0.7, L.hipY + 0.5 * u]]), k.F([[cx - L.wh * 0.9, L.waistY + 0.2 * u], [cx - L.hh * 0.95, L.kneeY]])];
  });
  def('jupe-longue', 'jupe', 'Jupe longue fendue', {
    met: 1.8, fab: ['wax', 'bazin', 'crepe', 'satin', 'dentelle'], sup: ['Zip invisible 20 cm'], bottom: true,
    desc: 'Jupe fourreau longue jusqu’à la cheville, fente devant pour la marche.',
    tips: ['Fente : arrêter 10 à 15 cm au-dessus du genou ; renforcer le haut par un point d’arrêt.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx, hem = L.floorY - 0.1 * u;
    return [k.P(k.sym(k.H(waistTop(L).concat([[L.hh * 1.03, L.hipY], [L.hh * 0.96, L.kneeY], [L.hh * 0.92, hem, 1], [0, hem + 0.02 * u]])))), band(L, k),
      k.S([[cx - L.hh * 0.42, hem], [cx - L.hh * 0.4, L.kneeY + 0.2 * u]])];
  });
  def('jupe-tulle', 'jupe', 'Jupe de bal en tulle', {
    met: 8.0, vol: 2, struct: true, fab: ['tulle', 'satin', 'mousseline'], sup: ['Crinoline ou jupon à cerceaux', 'Fond de jupe', 'Gros-grain de taille'], bottom: true,
    desc: 'Grande jupe de bal jusqu’au sol, faite de nombreuses couches de tulle froncées sur un fond de jupe.',
    tips: ['Monter les couches en décalé pour éviter un « bourrelet » à la taille.', 'Le poids se porte par une ceinture intérieure en gros-grain.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.floorY - 0.04 * u, w = L.hh * 2.7, pts = waistTop(L).concat([[L.hh * 1.6, L.hipY], [L.hh * 2.45, L.kneeY + 0.6 * u], [w, hem, 1]]);
    for (let i = 1; i <= 8; i++) pts.push([w * (1 - i / 8.6), hem + (i % 2 ? 0.06 * u : 0)]);
    pts.push([0, hem + 0.06 * u]);
    return [k.P(k.sym(k.H(pts))), band(L, k), k.S(k.wave(L.hipY + 0.9 * u, L.hh * 1.95, 0.06 * u, 14)), k.S(k.wave(L.kneeY + 1.0 * u, L.hh * 2.5, 0.06 * u, 18)),
      ...k.pair(k.F(k.H([[L.wh * 0.6, L.waistY + 0.2 * u], [w * 0.5, hem]]))), ...k.pair(k.F(k.H([[L.wh * 0.95, L.waistY + 0.2 * u], [w * 0.88, hem]])))];
  });

  /* ===== PANTALONS ===== */
  def('pantalon-palazzo', 'bas', 'Pantalon palazzo', {
    met: 2.6, drape: true, vol: 1, fab: ['crepe', 'soie', 'lin', 'wax'], sup: ['Zip invisible 20 cm', 'Ceinture entoilée'], bottom: true,
    desc: 'Pantalon très large et fluide dès la hanche, qui tombe jusqu’au sol comme une jupe.',
    tips: ['Un tissu fluide (crêpe, soie) fait tout : en tissu raide, il devient raide comme un carton.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.floorY - 0.04 * u;
    return [k.P(k.sym(k.H(waistTop(L).concat([[L.hh * 1.06, L.hipY], [L.hh * 1.32, hem, 1], [0.1 * u, hem, 1], [0.04 * u, L.crotchY + 0.35 * u], [0, L.crotchY + 0.12 * u, 1]])))), band(L, k),
      ...k.pair(k.F(k.H([[L.hh * 0.62, L.hipY], [L.hh * 0.72, hem]])))];
  });
  def('pantalon-droit', 'bas', 'Pantalon droit', {
    met: 1.4, fab: ['crepe', 'lin', 'bazin', 'velours', 'wax'], sup: ['Zip braguette 18 cm', 'Bouton', 'Entoilage de ceinture'], bottom: true,
    desc: 'Pantalon de tailleur à jambe droite, pli marqué devant et poches italiennes.',
    tips: ['Le pli de devant suit le droit-fil : marquez-le au fer avant d’assembler.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.ankleY + 0.25 * u;
    return [k.P(k.sym(k.H(waistTop(L).concat([[L.hh * 1.04, L.hipY], [L.kh * 1.32, L.kneeY], [L.ah + 0.34 * u, hem, 1], [0.04 * u, hem, 1], [0.06 * u, L.kneeY], [0, L.crotchY + 0.1 * u, 1]])))), band(L, k),
      ...k.pair(k.F(k.H([[L.hh * 0.55, L.hipY - 0.1 * u], [(L.ah + 0.38 * u) / 2, hem]]))),
      ...k.pair(k.S(k.H([[L.wh * 0.75, L.waistY + 0.08 * u], [L.hh * 1.0, L.hipY - 0.15 * u]])))];
  });
  def('sarouel', 'bas', 'Sarouel', {
    met: 2.2, vol: 1, fab: ['bazin', 'lin', 'wax', 'crepe'], sup: ['Élastique ou cordon de taille'], bottom: true,
    desc: 'Pantalon à entrejambe bas, ample sur les cuisses et resserré aux chevilles ; souvent porté sous un grand boubou ou un kaftan.',
    tips: ['L’entrejambe se place entre la mi-cuisse et le genou selon l’effet voulu.', 'Poignets de cheville froncés ou à élastique.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.ankleY + 0.2 * u;
    return [k.P(k.sym(k.H([[0, L.waistY - 0.02 * u], [L.wh * 1.06, L.waistY - 0.02 * u, 1], [L.hh * 1.2, L.hipY], [L.hh * 1.25, L.kneeY], [L.ah + 0.24 * u, L.ankleY - 0.05 * u], [L.ah + 0.2 * u, hem, 1], [0.05 * u, hem, 1], [0.12 * u, L.ankleY - 0.1 * u], [0.22 * u, L.kneeY + 0.3 * u], [0, L.kneeY - 0.2 * u, 1]]))), band(L, k),
      ...k.pair(k.S(k.H([[L.ah + 0.23 * u, L.ankleY], [0.08 * u, L.ankleY]]))),
      ...k.pair(k.F(k.H([[L.hh * 0.9, L.hipY + 0.2 * u], [0.3 * u, L.kneeY - 0.05 * u]]))), ...k.pair(k.F(k.H([[L.hh * 1.1, L.crotchY + 0.3 * u], [0.45 * u, L.kneeY + 0.4 * u]])))];
  });

  /* ===== MANCHES ===== */
  const sleeve = (L, k, pts) => k.pair(k.P(k.H(pts)));
  def('manche-courte', 'manche', 'Manche courte montée', {
    met: 0.3, fab: ['wax', 'crepe', 'lin', 'bazin', 'satin'], sup: [],
    desc: 'Manche montée classique arrêtée à mi-bras, tête de manche légèrement soutenue (embu).',
    tips: ['Répartir l’embu de la tête de manche entre les crans, sans fronces visibles.']
  }, (L, o, k) => {
    const u = L.hu;
    const out = sleeve(L, k, [C(L.arm.sh), arm(L, 0.15, 'o', 0.05 * u), C(arm(L, 0.3, 'o', 0.06 * u)), C(arm(L, 0.3, 'i', 0.03 * u)), arm(L, 0.08, 'i', 0.01 * u), C(L.arm.pit), armMid(L)]);
    out.push(...k.pair(k.D(k.H([arm(L, 0.27, 'o', 0.06 * u), arm(L, 0.27, 'i', 0.03 * u)]))));
    return out;
  });
  def('manche-ballon', 'manche', 'Manche ballon', {
    met: 0.6, vol: 1, fab: ['wax', 'bazin', 'satin', 'mousseline', 'tulle'], sup: ['Organza de soutien (optionnel)'],
    desc: 'Manche courte bouffante, froncée à l’emmanchure et resserrée par un poignet ou un biais.',
    tips: ['Un tissu à tenue (wax, satin, bazin) garde le volume ; en tissu souple, doubler d’organza.']
  }, (L, o, k) => {
    const u = L.hu;
    const out = sleeve(L, k, [C(L.arm.sh), arm(L, 0.08, 'o', 0.2 * u), arm(L, 0.22, 'o', 0.25 * u), C(arm(L, 0.36, 'o', 0.1 * u)), C(arm(L, 0.43, 'o', 0.04 * u)), C(arm(L, 0.43, 'i', 0.03 * u)), C(arm(L, 0.36, 'i', 0.06 * u)), arm(L, 0.16, 'i', 0.07 * u), C(L.arm.pit), armMid(L)]);
    out.push(...k.pair(k.S(k.H([arm(L, 0.36, 'o', 0.1 * u), arm(L, 0.36, 'i', 0.06 * u)]))));
    [0.25, 0.55, 0.8].forEach(f => { const a = arm(L, 0.02, 'o', 0.05 * u), b = arm(L, 0.35, 'o', 0.08 * u), i0 = arm(L, 0.08, 'i', 0), i1 = arm(L, 0.35, 'i', 0.06 * u);
      out.push(...k.pair(k.F(k.H([[a[0] + (i0[0] - a[0]) * f, a[1] + (i0[1] - a[1]) * f], [b[0] + (i1[0] - b[0]) * f, b[1] + (i1[1] - b[1]) * f]])))); });
    return out;
  });
  def('manche-longue', 'manche', 'Manche longue ajustée', {
    met: 0.6, fab: ['crepe', 'bazin', 'lin', 'velours', 'dentelle', 'wax'], sup: [],
    desc: 'Manche montée longue, coude légèrement cintré, poignet net ou boutonné.',
    tips: ['Une pince ou une embu au coude donne le mouvement du bras plié.']
  }, (L, o, k) => {
    const u = L.hu;
    const out = sleeve(L, k, [C(L.arm.sh), arm(L, 0.25, 'o', 0.04 * u), arm(L, 0.5, 'o', 0.035 * u), C(arm(L, 1.0, 'o', 0.03 * u)), C(arm(L, 1.0, 'i', 0.02 * u)), arm(L, 0.5, 'i', 0.02 * u), C(L.arm.pit), armMid(L)]);
    out.push(...k.pair(k.S(k.H([arm(L, 0.9, 'o', 0.032 * u), arm(L, 0.9, 'i', 0.02 * u)]))), ...k.pair(k.F(k.H([arm(L, 0.47, 'i', 0.02 * u), arm(L, 0.52, 'o', -0.06 * u)]))));
    return out;
  });
  def('manche-gigot', 'manche', 'Manche gigot', {
    met: 0.9, vol: 2, fab: ['satin', 'bazin', 'wax', 'velours', 'tulle'], sup: ['Organza de soutien'],
    desc: 'Très bouffante en haut, ajustée de l’avant-bras au poignet : manche romantique, spectaculaire en satin duchesse.',
    tips: ['Fronces ou plis couchés sur la tête de manche ; soutenir avec un volant d’organza intérieur.']
  }, (L, o, k) => {
    const u = L.hu;
    const out = sleeve(L, k, [C(L.arm.sh), arm(L, 0.1, 'o', 0.28 * u), arm(L, 0.32, 'o', 0.3 * u), arm(L, 0.55, 'o', 0.06 * u), C(arm(L, 1.0, 'o', 0.03 * u)), C(arm(L, 1.0, 'i', 0.02 * u)), arm(L, 0.55, 'i', 0.02 * u), arm(L, 0.3, 'i', 0.1 * u), C(L.arm.pit), armMid(L)]);
    [0.3, 0.6].forEach(f => { const a = arm(L, 0.02, 'o', 0.05 * u), b = arm(L, 0.45, 'o', 0.1 * u); out.push(...k.pair(k.F(k.H([[a[0] - f * 0.15 * u, a[1] + 0.05 * u], [b[0] - f * 0.15 * u, b[1]]])))); });
    return out;
  });
  def('manche-evasee', 'manche', 'Manche pagode évasée', {
    met: 0.8, vol: 1, fab: ['wax', 'soie', 'mousseline', 'dentelle', 'crepe'], sup: [],
    desc: 'Manche ajustée jusqu’au coude puis évasée en cloche jusqu’au poignet : très portée sur le « taille basse ».',
    tips: ['L’évasement se coupe en godet ; ourlet roulotté pour les tissus fins.']
  }, (L, o, k) => {
    const u = L.hu;
    const out = sleeve(L, k, [C(L.arm.sh), arm(L, 0.5, 'o', 0.04 * u), arm(L, 0.8, 'o', 0.18 * u), C(arm(L, 1.08, 'o', 0.42 * u)), arm(L, 1.1, 'i', 0.05 * u), C(arm(L, 1.06, 'i', 0.28 * u)), arm(L, 0.55, 'i', 0.02 * u), C(L.arm.pit), armMid(L)]);
    out.push(...k.pair(k.F(k.H([arm(L, 0.62, 'o', 0.02 * u), arm(L, 1.07, 'o', 0.2 * u)]))), ...k.pair(k.F(k.H([arm(L, 0.65, 'i', 0.0), arm(L, 1.06, 'i', 0.05 * u)]))));
    return out;
  });
  def('manche-chauve-souris', 'manche', 'Manche chauve-souris', {
    met: 0.8, vol: 1, drape: true, fab: ['crepe', 'soie', 'mousseline', 'lin'], sup: [],
    desc: 'Manche coupée d’un seul tenant avec le corsage, emmanchure profonde jusqu’à la taille : drapé souple sous le bras.',
    tips: ['Ajouter un gousset ou une couture renforcée sous le bras si la manche est ajustée au poignet.']
  }, (L, o, k) => {
    const u = L.hu;
    const out = sleeve(L, k, [C(L.arm.sh), arm(L, 0.5, 'o', 0.06 * u), C(arm(L, 1.0, 'o', 0.03 * u)), C(arm(L, 1.0, 'i', 0)), [L.arm.elbI[0] - 0.05 * u, L.arm.elbI[1] + 0.1 * u], C([L.wh * 1.08, L.waistY + 0.05 * u]), [L.bh * 1.0, L.pitY]]);
    out.push(...k.pair(k.F(k.H([[L.sh * 1.0, L.shY + 0.25 * u], [L.arm.elbI[0] - 0.02 * u, L.arm.elbI[1] - 0.05 * u]]))), ...k.pair(k.F(k.H([[L.bh * 1.05, L.bustY], [L.arm.elbI[0], L.arm.elbI[1] + 0.15 * u]]))));
    return out;
  });
  def('manche-cape', 'manche', 'Manche cape à volant', {
    met: 0.5, drape: true, fab: ['mousseline', 'soie', 'crepe', 'dentelle'], sup: [],
    desc: 'Volant en arc de cercle posé sur l’emmanchure, qui flotte sur le haut du bras.',
    tips: ['Couper en cercle : plus le rayon intérieur est petit, plus le volant ondule.']
  }, (L, o, k) => {
    const u = L.hu, a = arm(L, 0.42, 'o', 0.5 * u), b = arm(L, 0.38, 'i', 0.1 * u);
    const pts = [C(L.arm.sh), arm(L, 0.15, 'o', 0.25 * u), C(a)];
    for (let i = 1; i < 5; i++) { const t = i / 5; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + (i % 2 ? 0.07 * u : 0)]); }
    pts.push(C(b), C(L.arm.pit), armMid(L));
    const out = sleeve(L, k, pts);
    [0.3, 0.6].forEach(f => out.push(...k.pair(k.F(k.H([arm(L, 0.05, 'o', 0.05 * u), [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]])))));
    return out;
  });
  def('manche-eveque', 'manche', 'Manche évêque', {
    met: 0.9, vol: 1, fab: ['soie', 'mousseline', 'crepe', 'lin'], sup: ['Boutons de poignet ×4'],
    desc: 'Manche longue étroite à l’épaule et ample vers le bas, froncée dans un poignet boutonné.',
    tips: ['Le poignet se double et s’entoile ; fente de manche avec patte capucin.']
  }, (L, o, k) => {
    const u = L.hu;
    const out = sleeve(L, k, [C(L.arm.sh), arm(L, 0.3, 'o', 0.06 * u), arm(L, 0.75, 'o', 0.22 * u), arm(L, 0.93, 'o', 0.24 * u), C(arm(L, 1.0, 'o', 0.04 * u)), C(arm(L, 1.1, 'o', 0.03 * u)), C(arm(L, 1.1, 'i', 0.02 * u)), C(arm(L, 1.0, 'i', 0.02 * u)), arm(L, 0.9, 'i', 0.17 * u), arm(L, 0.5, 'i', 0.03 * u), C(L.arm.pit), armMid(L)]);
    out.push(...k.pair(k.S(k.H([arm(L, 1.0, 'o', 0.04 * u), arm(L, 1.0, 'i', 0.02 * u)]))));
    [0.3, 0.65].forEach(f => { const a = arm(L, 0.7, 'o', 0.15 * u), i = arm(L, 0.7, 'i', 0.1 * u), b = arm(L, 0.99, 'o', 0.06 * u), j = arm(L, 0.99, 'i', 0.03 * u);
      out.push(...k.pair(k.F(k.H([[a[0] + (i[0] - a[0]) * f, a[1] + (i[1] - a[1]) * f], [b[0] + (j[0] - b[0]) * f, b[1] + (j[1] - b[1]) * f]])))); });
    return out;
  });

  /* ===== COLS ===== */
  def('col-claudine', 'col', 'Col Claudine', {
    met: 0.2, fab: ['dentelle', 'satin', 'lin', 'crepe', 'uni'], sup: ['Entoilage léger'],
    desc: 'Col plat à bouts arrondis, posé à plat sur l’encolure ronde : fraîcheur, enfance, élégance sage.',
    tips: ['Se monte sur une encolure ronde haute ; dessous de col légèrement plus petit pour qu’il roule vers l’intérieur.']
  }, (L, o, k) => {
    const u = L.hu;
    return k.pair(k.P(k.H([[0.02 * u, L.shY + 0.19 * u, 1], [L.nh * 1.0, L.shY + 0.37 * u], [L.nh * 2.0, L.shY + 0.24 * u], [L.nh * 2.1, L.shY + 0.02 * u], [L.nh * 1.25, L.shY - 0.15 * u, 1], [L.nh * 1.1, L.shY + 0.03 * u], [L.nh * 0.6, L.shY + 0.16 * u]])));
  });
  def('col-chemise', 'col', 'Col chemise', {
    met: 0.2, fab: ['lin', 'soie', 'crepe', 'uni'], sup: ['Entoilage de col', 'Baleinettes de col'],
    desc: 'Col à pied de col et pointes : base de la chemise, net et structuré.',
    tips: ['Entoiler le dessus de col et le pied ; dégarnir les pointes avant de retourner.']
  }, (L, o, k) => {
    const u = L.hu;
    return [k.P(k.sym(k.H([[0, L.shY + 0.06 * u], [L.nh * 1.2, L.shY - 0.2 * u, 1], [L.nh * 1.28, L.shY - 0.1 * u, 1], [0, L.shY + 0.2 * u]]))),
      ...k.pair(k.P(k.H([[0.03 * u, L.shY + 0.14 * u, 1], [L.nh * 1.25, L.shY - 0.17 * u, 1], [L.nh * 1.75, L.shY + 0.02 * u], [L.nh * 0.95, L.shY + 0.42 * u, 1]])))];
  });
  def('col-officier', 'col', 'Col officier (Mao)', {
    met: 0.1, fab: ['bazin', 'lin', 'crepe', 'soie', 'velours'], sup: ['Entoilage ferme'],
    desc: 'Col droit montant sans rabat, qui entoure le cou : sobre, très présent dans les tenues masculines et les kaftans.',
    tips: ['Couper en léger arrondi (plus court en haut) pour qu’il épouse le cou.']
  }, (L, o, k) => {
    const u = L.hu;
    return [k.P(k.sym(k.H([[0, L.shY - 0.02 * u], [L.nh * 1.12, L.shY - 0.3 * u, 1], [L.nh * 1.25, L.shY - 0.12 * u, 1], [0, L.shY + 0.16 * u]]))),
      k.D([[k.cx - L.nh * 1.18, L.shY - 0.2 * u], [k.cx, L.shY + 0.07 * u], [k.cx + L.nh * 1.18, L.shY - 0.2 * u]])];
  });
  def('col-chale', 'col', 'Col châle', {
    met: 0.4, fab: ['satin', 'velours', 'crepe', 'bazin'], sup: ['Entoilage thermocollant'],
    desc: 'Revers continu, sans cran, qui s’enroule du cou jusqu’au croisement : le col du smoking et des vestes du soir.',
    tips: ['À monter sur une encolure en V profond ; contraste satin sur crêpe très couture.']
  }, (L, o, k) => {
    const u = L.hu;
    return k.pair(k.P(k.H([[L.nh * 1.05, L.shY - 0.18 * u, 1], [L.nh * 1.9, L.shY + 0.05 * u], [L.bh * 0.62, L.bustY], [L.bh * 0.25, L.waistY - 0.25 * u], [0.02 * u, L.waistY - 0.13 * u, 1], [L.nh * 0.45, L.bustY - 0.1 * u], [L.nh * 1.0, L.shY + 0.1 * u]])));
  });
  def('col-tailleur', 'col', 'Col tailleur cranté', {
    met: 0.4, fab: ['crepe', 'satin', 'velours', 'lin'], sup: ['Entoilage thermocollant'],
    desc: 'Col et revers séparés par un cran : la signature de la veste tailleur.',
    tips: ['Le cran se place à hauteur de clavicule ; la cassure de revers s’arrête au premier bouton.']
  }, (L, o, k) => {
    const u = L.hu;
    return [...k.pair(k.P(k.H([[L.nh * 1.05, L.shY - 0.18 * u, 1], [L.nh * 1.7, L.shY + 0.0 * u], [L.nh * 1.85, L.shY + 0.16 * u, 1], [L.nh * 1.4, L.shY + 0.24 * u, 1], [L.nh * 2.05, L.shY + 0.34 * u, 1], [L.bh * 0.56, L.bustY + 0.1 * u], [0.02 * u, L.waistY - 0.13 * u, 1], [L.nh * 0.45, L.bustY - 0.1 * u], [L.nh * 1.0, L.shY + 0.1 * u]]))),
      ...k.pair(k.S(k.H([[L.nh * 1.4, L.shY + 0.24 * u], [L.nh * 1.12, L.shY + 0.12 * u]])))];
  });
  def('lavalliere', 'col', 'Lavallière', {
    met: 0.5, drape: true, focal: true, fab: ['soie', 'mousseline', 'crepe', 'satin'], sup: [],
    desc: 'Longue bande nouée en gros nœud souple sous le menton : féminité et bourgeoisie chic.',
    tips: ['Couper la bande dans le biais pour un nœud qui gonfle sans casser.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx;
    return [...k.pair(k.P(k.H([[0.02 * u, L.shY + 0.22 * u, 1], [0.3 * u, L.shY + 0.06 * u], [0.45 * u, L.shY + 0.22 * u], [0.3 * u, L.shY + 0.36 * u], [0.02 * u, L.shY + 0.27 * u, 1]]))),
      k.P([[cx - 0.04 * u, L.shY + 0.28 * u], [cx - 0.2 * u, L.bustY + 0.1 * u], [cx - 0.26 * u, L.bustY + 0.42 * u, 1], [cx - 0.12 * u, L.bustY + 0.36 * u, 1], [cx + 0.01 * u, L.shY + 0.32 * u]]),
      k.P([[cx + 0.03 * u, L.shY + 0.28 * u], [cx + 0.14 * u, L.bustY + 0.2 * u], [cx + 0.22 * u, L.bustY + 0.6 * u, 1], [cx + 0.08 * u, L.bustY + 0.56 * u, 1], [cx - 0.02 * u, L.shY + 0.33 * u]]),
      k.P(k.sym(k.H([[0, L.shY + 0.16 * u], [0.07 * u, L.shY + 0.19 * u], [0.07 * u, L.shY + 0.29 * u], [0, L.shY + 0.32 * u]]))),
      ...k.pair(k.F(k.H([[0.1 * u, L.shY + 0.24 * u], [0.36 * u, L.shY + 0.2 * u]])))];
  });
  def('jabot', 'col', 'Jabot', {
    met: 0.4, focal: true, fab: ['mousseline', 'dentelle', 'soie', 'tulle'], sup: [],
    desc: 'Cascade de volants posée au milieu devant, de l’encolure à la poitrine.',
    tips: ['Volants coupés en spirale, ourlets roulottés ; se monte sous la patte ou sur un col officier.']
  }, (L, o, k) => {
    const u = L.hu, y = L.shY;
    return [k.P(k.sym(k.H([[0, y + 0.12 * u], [0.12 * u, y + 0.2 * u], [0.2 * u, y + 0.4 * u, 1], [0.12 * u, y + 0.42 * u], [0.25 * u, y + 0.62 * u, 1], [0.15 * u, y + 0.64 * u], [0.28 * u, L.bustY + 0.2 * u, 1], [0.1 * u, L.bustY + 0.18 * u], [0, L.bustY + 0.3 * u]]))),
      k.F([[k.cx, y + 0.2 * u], [k.cx - 0.05 * u, L.bustY + 0.2 * u]]), ...k.pair(k.F(k.H([[0.06 * u, y + 0.3 * u], [0.16 * u, y + 0.62 * u]])))];
  });

  /* ===== DRAPÉS & VOLUMES ===== */
  def('drape-epaule', 'drape', 'Drapé asymétrique d’épaule', {
    met: 1.2, drape: true, focal: true, asym: true, fab: ['soie', 'mousseline', 'crepe', 'satin'], sup: ['Fond de robe ajusté'],
    desc: 'Écharpe drapée qui part d’une épaule et traverse le buste jusqu’à la hanche opposée, où elle retombe en pan.',
    tips: ['Draper sur mannequin (moulage) et fixer les plis à la main sur un fond ajusté.', 'Coupé dans le biais, le drapé suit le corps sans tirer.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx;
    const top = [[cx - L.sh * 0.95, L.shY, 1], [cx - L.sh * 0.55, L.shY - 0.05 * u], [cx + L.wh * 0.2, L.waistY - 0.3 * u], [cx + L.wh * 1.1, L.waistY + 0.1 * u, 1]];
    const bot = [[cx + L.wh * 1.05, L.waistY + 0.45 * u], [cx + L.wh * 0.4, L.waistY + 0.25 * u], [cx - L.bh * 0.4, L.bustY + 0.05 * u], [cx - L.sh * 0.85, L.shY + 0.35 * u]];
    const out = [k.P(top.concat(bot))];
    [0.25, 0.5, 0.75].forEach(f => out.push(k.F([[cx - L.sh * (0.9 - 0.05 * f), L.shY + 0.35 * u * f], [cx - L.bh * 0.2, L.bustY - 0.25 * u + 0.25 * u * f], [cx + L.wh * 1.05, L.waistY + 0.1 * u + 0.35 * u * f]])));
    out.push(k.P([[cx + L.wh * 1.0, L.waistY + 0.3 * u], [cx + L.wh * 1.3, L.hipY + 0.4 * u], [cx + L.wh * 1.1, L.hipY + 0.85 * u, 1], [cx + L.wh * 0.85, L.hipY + 0.4 * u]]));
    out.push(k.F([[cx + L.wh * 1.05, L.waistY + 0.4 * u], [cx + L.wh * 1.1, L.hipY + 0.7 * u]]));
    return out;
  });
  def('drape-cascade', 'drape', 'Cascade de hanche', {
    met: 1.0, drape: true, focal: true, asym: true, fab: ['soie', 'mousseline', 'crepe', 'satin'], sup: [],
    desc: 'Volant en cascade fixé à la taille, qui retombe en plis ondulants le long de la jambe.',
    tips: ['Couper en spirale ou en cercle décentré ; plus la spirale est serrée, plus la cascade ondule.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx;
    const out = [k.P([[cx - L.wh * 1.05, L.waistY + 0.05 * u, 1], [cx - L.wh * 0.55, L.waistY + 0.12 * u], [cx - L.hh * 1.05, L.hipY + 0.9 * u], [cx - L.hh * 1.2, L.kneeY + 0.05 * u, 1], [cx - L.hh * 1.38, L.kneeY - 0.2 * u], [cx - L.hh * 1.5, L.kneeY - 0.15 * u, 1], [cx - L.hh * 1.5, L.hipY + 0.6 * u], [cx - L.hh * 1.25, L.hipY + 0.1 * u]])];
    out.push(k.F([[cx - L.wh * 0.9, L.waistY + 0.15 * u], [cx - L.hh * 1.3, L.kneeY - 0.15 * u]]), k.F([[cx - L.wh * 0.75, L.waistY + 0.15 * u], [cx - L.hh * 1.12, L.kneeY - 0.05 * u]]), k.F([[cx - L.wh * 1.0, L.waistY + 0.2 * u], [cx - L.hh * 1.45, L.hipY + 0.9 * u]]));
    return out;
  });
  def('drape-bustier', 'drape', 'Bustier drapé', {
    met: 0.8, drape: true, fab: ['soie', 'mousseline', 'crepe', 'satin'], sup: ['Fond baleiné'],
    desc: 'Plis horizontaux drapés sur un bustier baleiné, qui se resserrent au milieu devant.',
    tips: ['Les plis se fixent à la main sur le fond baleiné ; prévoir 2 à 3 fois la hauteur finie.']
  }, (L, o, k) => {
    const u = L.hu, out = [k.P(k.sym(k.H([[0, L.bustY - 0.15 * u], [L.bh * 0.6, L.bustY - 0.2 * u], [L.bh * 1.04, L.pitY + 0.12 * u, 1], [L.wh * 1.08, L.waistY - 0.05 * u, 1], [0, L.waistY + 0.05 * u]])))];
    [0.15, 0.35, 0.55, 0.75].forEach(f => { const y = L.pitY + 0.15 * u + (L.waistY - L.pitY - 0.2 * u) * f; out.push(...k.pair(k.F(k.H([[L.bh * 1.0 - f * 0.1 * L.bh, y], [L.bh * 0.5, y + 0.08 * u], [0.03 * u, y + 0.18 * u]])))); });
    return out;
  });
  def('noeud', 'drape', 'Grand nœud', {
    met: 0.8, focal: true, fab: ['satin', 'soie', 'velours', 'tulle'], sup: ['Organza ou crin pour la tenue'],
    desc: 'Nœud sculptural posé à la taille (devant ou dos), avec pans qui retombent.',
    tips: ['Monter les boucles sur une base cachée ; les doubler d’organza pour qu’elles restent gonflées.']
  }, (L, o, k) => {
    const u = L.hu, y = L.waistY;
    return [...k.pair(k.P(k.H([[0.06 * u, y - 0.05 * u, 1], [0.35 * u, y - 0.3 * u], [0.6 * u, y - 0.15 * u], [0.55 * u, y + 0.12 * u], [0.06 * u, y + 0.05 * u, 1]]))),
      ...k.pair(k.P(k.H([[0.03 * u, y + 0.05 * u], [0.2 * u, y + 0.5 * u], [0.3 * u, y + 0.9 * u, 1], [0.12 * u, y + 0.85 * u, 1], [0.0, y + 0.1 * u]]))),
      k.P(k.sym(k.H([[0, y - 0.1 * u], [0.09 * u, y - 0.08 * u, 1], [0.09 * u, y + 0.1 * u, 1], [0, y + 0.12 * u]]))),
      ...k.pair(k.F(k.H([[0.12 * u, y], [0.48 * u, y - 0.12 * u]])))];
  });
  def('basque', 'drape', 'Basque (péplum)', {
    met: 0.5, vol: 1, fab: ['wax', 'satin', 'crepe', 'bazin', 'dentelle'], sup: [],
    desc: 'Volant évasé cousu à la taille, qui souligne la cambrure et équilibre les hanches.',
    tips: ['Coupée en demi-cercle ou en cercle complet selon l’ampleur voulue.']
  }, (L, o, k) => {
    const u = L.hu, hem = L.hipY - 0.08 * u, w = L.hh * 1.32, pts = [[0, L.waistY], [L.wh * 1.06, L.waistY, 1], [w, hem, 1]];
    for (let i = 1; i <= 4; i++) pts.push([w * (1 - i / 4.6), hem + (i % 2 ? 0.06 * u : 0)]);
    pts.push([0, hem + 0.06 * u]);
    const out = [k.P(k.sym(k.H(pts)))];
    [0.3, 0.65, 0.95].forEach(f => out.push(...k.pair(k.F(k.H([[L.wh * f, L.waistY + 0.05 * u], [w * f * 0.95, hem]])))));
    return out;
  });
  def('traine', 'drape', 'Traîne', {
    met: 2.0, z: 5, vol: 1, fab: ['satin', 'tulle', 'dentelle', 'soie', 'mousseline'], sup: ['Boucle ou bouton de relevé de traîne'],
    desc: 'Prolongement de la jupe qui s’étale au sol derrière la silhouette : cérémonie et mariage.',
    tips: ['Prévoir un système de relevé (boucle, bouton) pour danser.']
  }, (L, o, k) => {
    const u = L.hu;
    return [k.P(k.sym(k.H([[0, L.kneeY + 0.5 * u], [L.hh * 1.5, L.kneeY + 1.2 * u], [L.hh * 2.6, L.floorY + 0.05 * u], [L.hh * 2.2, L.floorY + 0.3 * u], [0, L.floorY + 0.42 * u]]))),
      ...k.pair(k.F(k.H([[L.hh * 1.1, L.kneeY + 1.0 * u], [L.hh * 2.0, L.floorY + 0.2 * u]])))];
  });

  /* ===== CEINTURES ===== */
  def('ceinture-large', 'ceinture', 'Ceinture large à boucle', {
    met: 0.2, def: { fabric: 'uni', color: '#1f1b24' }, fab: ['velours', 'satin', 'uni', 'wax'], sup: ['Boucle', 'Entoilage ferme ou baleines'],
    desc: 'Large ceinture qui marque la taille : structure une robe ample ou un boubou.',
    tips: ['Une ceinture de 6 à 8 cm doit être galbée (coupée en arc) pour suivre la taille.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx;
    return [k.P(k.sym(k.H([[0, L.waistY - 0.13 * u], [L.wh * 1.1, L.waistY - 0.13 * u, 1], [L.wh * 1.12, L.waistY + 0.13 * u, 1], [0, L.waistY + 0.13 * u]]))),
      k.T([[cx - 0.14 * u, L.waistY - 0.17 * u, 1], [cx + 0.14 * u, L.waistY - 0.17 * u, 1], [cx + 0.14 * u, L.waistY + 0.17 * u, 1], [cx - 0.14 * u, L.waistY + 0.17 * u, 1]]),
      k.TL([[cx - 0.07 * u, L.waistY - 0.1 * u, 1], [cx + 0.07 * u, L.waistY - 0.1 * u, 1], [cx + 0.07 * u, L.waistY + 0.1 * u, 1], [cx - 0.07 * u, L.waistY + 0.1 * u, 1]], true)];
  });
  def('obi', 'ceinture', 'Ceinture obi nouée', {
    met: 0.6, fab: ['satin', 'soie', 'wax', 'bazin'], sup: ['Entoilage ferme'],
    desc: 'Haute ceinture enveloppante, inspirée du kimono, nouée sur le côté avec des pans.',
    tips: ['Entoiler le corps de ceinture ; les pans restent souples.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx;
    return [k.P(k.sym(k.H([[0, L.waistY - 0.25 * u], [L.wh * 1.12, L.waistY - 0.25 * u, 1], [L.wh * 1.12, L.waistY + 0.2 * u, 1], [0, L.waistY + 0.2 * u]]))),
      k.TL([[cx - L.wh * 1.1, L.waistY - 0.02 * u], [cx + L.wh * 1.1, L.waistY - 0.02 * u]]),
      k.P([[cx + L.wh * 0.6, L.waistY - 0.05 * u], [cx + L.wh * 0.9, L.hipY + 0.2 * u], [cx + L.wh * 0.7, L.hipY + 0.25 * u, 1], [cx + L.wh * 0.5, L.waistY + 0.1 * u]]),
      k.P([[cx + L.wh * 0.7, L.waistY], [cx + L.wh * 1.3, L.hipY + 0.05 * u], [cx + L.wh * 1.15, L.hipY + 0.12 * u, 1], [cx + L.wh * 0.62, L.waistY + 0.1 * u]])];
  });
  def('ceinture-noeud', 'ceinture', 'Ceinture à nœud', {
    met: 0.4, fab: ['satin', 'soie', 'velours', 'crepe'], sup: [],
    desc: 'Ceinture fine en ruban nouée au milieu devant : douceur et finition couture.',
    tips: ['Ruban double face ou bande coupée dans le biais.']
  }, (L, o, k) => {
    const u = L.hu, y = L.waistY;
    return [k.P(k.sym(k.H([[0, y - 0.06 * u], [L.wh * 1.08, y - 0.06 * u, 1], [L.wh * 1.08, y + 0.06 * u, 1], [0, y + 0.06 * u]]))),
      ...k.pair(k.P(k.H([[0.04 * u, y, 1], [0.22 * u, y - 0.16 * u], [0.3 * u, y + 0.02 * u], [0.04 * u, y + 0.04 * u, 1]]))),
      ...k.pair(k.P(k.H([[0.02 * u, y + 0.03 * u], [0.12 * u, y + 0.35 * u, 1], [0.04 * u, y + 0.38 * u, 1], [0.0, y + 0.06 * u]]))),
      k.P(k.sym(k.H([[0, y - 0.06 * u], [0.05 * u, y - 0.05 * u, 1], [0.05 * u, y + 0.06 * u, 1], [0, y + 0.07 * u]])))];
  });

  /* ===== FERMETURES ===== */
  def('boutonnage', 'fermeture', 'Boutonnage milieu devant', {
    met: 0, fab: [], sup: ['Boutons ×7', 'Entoilage de patte'],
    desc: 'Patte de boutonnage centrale avec boutonnières verticales : à poser sur un corsage, une robe ou un kaftan.',
    tips: ['Espacer les boutons de 6 à 8 cm ; toujours un bouton à hauteur de poitrine pour éviter l’entrebâillement.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx, y0 = L.shY + 0.3 * u, y1 = L.hipY;
    const c = []; for (let i = 0; i < 7; i++) c.push([cx, y0 + (y1 - y0) * i / 6, 0.035 * u]);
    return [k.D([[cx - 0.07 * u, y0 - 0.1 * u], [cx - 0.07 * u, y1 + 0.1 * u]]), k.D([[cx + 0.07 * u, y0 - 0.1 * u], [cx + 0.07 * u, y1 + 0.1 * u]]), k.dots(c, 'btn')];
  });
  def('zip-dos', 'fermeture', 'Zip invisible milieu dos', {
    met: 0, fab: [], sup: ['Zip invisible 55 cm', 'Agrafe d’encolure'], back: true,
    desc: 'Fermeture à glissière invisible dans la couture milieu dos : la finition de référence des robes ajustées.',
    tips: ['Poser le zip avant de fermer la couture ; pied presseur spécial zip invisible.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx;
    return [k.D([[cx, L.shY + 0.12 * u], [cx, L.hipY + 0.1 * u]]), k.T([[cx - 0.03 * u, L.shY + 0.1 * u], [cx + 0.03 * u, L.shY + 0.1 * u, 1], [cx + 0.02 * u, L.shY + 0.24 * u, 1], [cx - 0.02 * u, L.shY + 0.24 * u, 1]])];
  });
  def('lacage', 'fermeture', 'Laçage', {
    met: 0, fab: [], sup: ['Œillets ×12', 'Cordon ou ruban 2 m', 'Parementure entoilée'], focal: true,
    desc: 'Laçage croisé dans des œillets : réglable, sensuel, emblématique du corset.',
    tips: ['Œillets posés sur une double épaisseur entoilée ou une baleine de chaque côté.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx, y0 = L.bustY, y1 = L.waistY + 0.05 * u, n = 6, dx = 0.07 * u, c = [], out = [];
    for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * i / (n - 1); c.push([cx - dx, y, 0.018 * u], [cx + dx, y, 0.018 * u]); }
    for (let i = 0; i < n - 1; i++) { const a = y0 + (y1 - y0) * i / (n - 1), b = y0 + (y1 - y0) * (i + 1) / (n - 1); out.push(k.TL([[cx - dx, a], [cx + dx, b]]), k.TL([[cx + dx, a], [cx - dx, b]])); }
    out.push(k.dots(c, 'line'));
    return out;
  });
  def('brandebourgs', 'fermeture', 'Brandebourgs', {
    met: 0, fab: [], sup: ['Brandebourgs passementerie ×4'], focal: true,
    desc: 'Fermetures en passementerie (ganse en boucles et olive) posées horizontalement sur la poitrine : allure militaire et couture.',
    tips: ['Coudre à la main au point invisible ; se marie avec un col officier.']
  }, (L, o, k) => {
    const u = L.hu, out = [];
    for (let i = 0; i < 4; i++) {
      const y = L.bustY - 0.2 * u + i * 0.22 * u;
      out.push(...k.pair(k.TL(k.H([[0.03 * u, y], [0.14 * u, y - 0.06 * u], [0.3 * u, y], [0.14 * u, y + 0.06 * u]]), true)));
      out.push(k.dots([[k.cx, y, 0.025 * u]], 'trim'));
    }
    return out;
  });

  /* ===== BRODERIES & ORNEMENTS ===== */
  def('broderie-encolure', 'broderie', 'Broderie d’encolure', {
    met: 0, focal: true, fab: [], sup: ['Fil à broder (cordonnet, rayonne)', 'Stabilisateur de broderie'],
    desc: 'Bande brodée qui suit l’encolure : point de bourdon, cordonnet et motifs festonnés, signature des boubous et kaftans en bazin.',
    tips: ['Broder avant d’assembler, sur stabilisateur ; reporter le dessin au calque ou au poncif.']
  }, (L, o, k) => {
    const u = L.hu, inner = [[0, L.shY + 0.18 * u], [L.nh * 0.62, L.shY + 0.15 * u], [L.nh * 1.12, L.shY + 0.02 * u], [L.nh * 1.2, L.shY - 0.14 * u, 1]];
    const outer = [[L.nh * 1.85, L.shY - 0.1 * u, 1], [L.nh * 1.8, L.shY + 0.16 * u], [L.nh * 1.0, L.shY + 0.42 * u], [0, L.shY + 0.5 * u]];
    const mid = inner.map((p, i) => { const q = outer[outer.length - 1 - i]; return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; });
    const dots = []; k.sym(k.H(mid)).forEach(p => dots.push([p[0], p[1], 0.02 * u]));
    return [k.T(k.sym(k.H(inner.concat(outer)))), k.TL(k.sym(k.H(mid))), k.dots(dots, 'line')];
  });
  def('plastron', 'broderie', 'Plastron brodé', {
    met: 0, focal: true, fab: [], sup: ['Fil à broder', 'Stabilisateur de broderie'],
    desc: 'Panneau brodé au milieu devant, de l’encolure à la poitrine ou à la taille : motif géométrique, cordonnet ou perles.',
    tips: ['Un seul motif fort, répété en symétrie : la lisibilité prime à distance.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx, y0 = L.shY + 0.17 * u, y1 = L.waistY + 0.3 * u, out = [];
    out.push(k.T(k.sym(k.H([[0, y0], [0.25 * u, y0 - 0.05 * u, 1], [0.25 * u, y1, 1], [0, y1 + 0.15 * u, 1]]))));
    out.push(k.TL(k.sym(k.H([[0, y0 + 0.08 * u], [0.18 * u, y0 + 0.04 * u, 1], [0.18 * u, y1 - 0.03 * u, 1], [0, y1 + 0.08 * u, 1]])), true));
    for (let i = 0; i < 4; i++) { const y = y0 + 0.25 * u + i * (y1 - y0 - 0.3 * u) / 3.2; out.push(k.TL([[cx, y - 0.1 * u, 1], [cx + 0.1 * u, y, 1], [cx, y + 0.1 * u, 1], [cx - 0.1 * u, y, 1]], true)); }
    return out;
  });
  def('galon-ourlet', 'broderie', 'Galon d’ourlet', {
    met: 0, fab: [], sup: ['Galon ou ruban brodé (tour d’ourlet + 10 %)'],
    desc: 'Bande décorative à l’ourlet : galon, broderie ou passementerie qui leste et termine le vêtement.',
    tips: ['Déplacez et redimensionnez ce module pour l’ajuster exactement à votre ourlet.']
  }, (L, o, k) => {
    const u = L.hu, y0 = L.floorY - 0.42 * u, y1 = L.floorY - 0.24 * u, w = L.hh * 1.5;
    const zz = []; for (let i = 0; i <= 16; i++) zz.push([k.cx - w + 2 * w * i / 16, i % 2 ? y0 + 0.04 * u : y1 - 0.04 * u, 1]);
    return [k.T(k.sym(k.H([[0, y0], [w * 0.98, y0, 1], [w, y1, 1], [0, y1]]))), k.TL(zz)];
  });
  def('perles', 'broderie', 'Semis de perles', {
    met: 0, fab: [], sup: ['Perles de rocaille / sequins', 'Fil de perlage'],
    desc: 'Perles et sequins semés sur le corsage, plus denses vers l’encolure : éclat de soirée.',
    tips: ['Broder en dégradé de densité : le regard remonte vers le visage.']
  }, (L, o, k) => {
    const u = L.hu, R = AC.rng(42), c = [];
    for (let i = 0; i < 44; i++) { const t = R(); const y = L.pitY + (L.waistY - L.pitY) * t * t; const h = R() * bodyHalf(L, y) * 0.9; c.push([k.cx - h, y, (0.012 + R() * 0.012) * u]); c.push([k.cx + h, y, (0.012 + R() * 0.012) * u]); }
    return [k.dots(c, 'trim')];
  });
  def('dentelle-bordure', 'broderie', 'Bordure de dentelle festonnée', {
    met: 0.5, def: { fabric: 'dentelle', color: '#f5efe2' }, fab: ['dentelle'], sup: ['Dentelle à festons (tour d’ourlet + 10 %)'],
    desc: 'Bordure de dentelle dont les festons terminent un ourlet, une manche ou une encolure.',
    tips: ['Découper autour des motifs et appliquer à la main : la couture disparaît dans le dessin.']
  }, (L, o, k) => {
    const u = L.hu, y0 = L.kneeY - 0.1 * u, y1 = L.kneeY + 0.15 * u, w = L.hh * 1.0, n = 7, pts = [[0, y0], [w, y0, 1], [w, y1, 1]];
    for (let i = 1; i <= n * 2; i++) pts.push([w * (1 - i / (n * 2)), y1 + (i % 2 ? 0.07 * u : 0), i % 2 ? 0 : 1]);
    return [k.P(k.sym(k.H(pts)))];
  });
  def('broderie-manche', 'broderie', 'Poignets brodés', {
    met: 0, fab: [], sup: ['Fil à broder'],
    desc: 'Bandes brodées aux poignets, en écho à la broderie d’encolure.',
    tips: ['Répéter le motif d’encolure en plus petit pour l’unité de la silhouette.']
  }, (L, o, k) => {
    const u = L.hu;
    return [...k.pair(k.T(k.H([C(arm(L, 0.86, 'o', 0.05 * u)), C(arm(L, 1.0, 'o', 0.05 * u)), C(arm(L, 1.0, 'i', 0.04 * u)), C(arm(L, 0.86, 'i', 0.04 * u))]))),
      ...k.pair(k.TL(k.H([arm(L, 0.93, 'o', 0.05 * u), arm(L, 0.93, 'i', 0.04 * u)])))];
  });
  def('applique-fleurs', 'broderie', 'Fleurs en appliqué 3D', {
    met: 0, focal: true, asym: true, fab: [], sup: ['Organza ou soie pour pétales', 'Perles de cœur'],
    desc: 'Fleurs en relief (pétales découpés, brûlés ou thermoformés) posées en cascade sur l’épaule : un geste de haute couture.',
    tips: ['Concentrer les fleurs en diagonale épaule → taille ; la densité décroît vers le bas.']
  }, (L, o, k) => {
    const u = L.hu, cx = k.cx, out = [];
    [[cx - L.sh * 0.75, L.shY + 0.05 * u, 0.13], [cx - L.sh * 0.45, L.shY + 0.3 * u, 0.1], [cx - L.bh * 0.65, L.bustY + 0.05 * u, 0.09], [cx - L.bh * 0.2, L.bustY + 0.3 * u, 0.07], [cx - L.sh * 0.95, L.shY + 0.35 * u, 0.07]].forEach(([x, y, r]) => {
      const c = []; for (let a = 0; a < 6; a++) { const an = a * Math.PI / 3; c.push([x + Math.cos(an) * r * u * 0.62, y + Math.sin(an) * r * u * 0.62, r * u * 0.48]); }
      out.push(k.dots(c, 'trim'), k.dots([[x, y, r * u * 0.3]], 'line'));
    });
    return out;
  });

  /* ===== ACCESSOIRES ===== */
  def('foulard-tete', 'accessoire', 'Foulard de tête (moussor)', {
    met: 0.9, vol: 1, fab: ['wax', 'bazin', 'soie', 'satin'], sup: [],
    desc: 'Foulard noué et sculpté sur la tête, assorti à la tenue : il prolonge la ligne de la silhouette vers le haut.',
    tips: ['Un tissu à tenue (bazin, wax) permet des volumes sculptés ; la soie donne un drapé plus doux.']
  }, (L, o, k) => {
    const u = L.hu, t = L.top, r = L.headRx;
    return [k.P(k.sym(k.H([[0, t - 0.36 * u], [r * 0.95, t - 0.32 * u], [r * 1.45, t - 0.02 * u], [r * 1.32, t + 0.36 * u, 1], [r * 1.0, t + 0.24 * u], [r * 0.6, t + 0.16 * u], [0, t + 0.13 * u]]))),
      ...k.pair(k.P(k.H([[0.04 * u, t - 0.3 * u], [0.3 * u, t - 0.44 * u], [0.5 * u, t - 0.38 * u, 1], [0.2 * u, t - 0.2 * u]]))),
      k.P(k.sym(k.H([[0, t - 0.38 * u], [0.1 * u, t - 0.34 * u], [0.1 * u, t - 0.2 * u], [0, t - 0.16 * u]]))),
      ...k.pair(k.F(k.H([[r * 0.3, t - 0.15 * u], [r * 1.3, t + 0.1 * u]]))), ...k.pair(k.F(k.H([[r * 0.2, t], [r * 1.1, t + 0.22 * u]])))];
  });

  AC.MODS = MODS; AC.MOD = MOD;

  /* Encolures : « modules » qui modifient le haut existant */
  AC.NECKS.forEach(n => { MOD['enc-' + n.id] = { id: 'enc-' + n.id, cat: 'encolure', name: n.name, desc: n.desc, applyNeck: n.id, tips: [] }; MODS.push(MOD['enc-' + n.id]); });

  /* ---------- Ensembles de départ ---------- */
  AC.ENSEMBLES = [
    { id: 'boubou', name: 'Grand boubou brodé', g: ['femme', 'homme'], items: [['grand-boubou', { fabric: 'bazin', color: '#1f3a5f', neck: 'v' }], ['broderie-encolure', { trim: '#c9a227' }], ['plastron', { trim: '#c9a227' }], ['foulard-tete', { fabric: 'bazin', color: '#1f3a5f' }]] },
    { id: 'taillebasse', name: 'Taille basse en wax', g: ['femme'], items: [['jupe-sirene', { fabric: 'wax', color: '#d7263d', color2: '#f2a900' }], ['manche-evasee', { fabric: 'wax', color: '#d7263d', color2: '#f2a900' }], ['corsage-ajuste', { fabric: 'wax', color: '#d7263d', color2: '#f2a900', neck: 'carree' }], ['basque', { fabric: 'wax', color: '#d7263d', color2: '#f2a900' }], ['foulard-tete', { fabric: 'wax', color: '#d7263d', color2: '#f2a900' }]] },
    { id: 'sirene', name: 'Robe du soir sirène', g: ['femme'], items: [['robe-sirene', { fabric: 'satin', color: '#7b1e34', neck: 'coeur' }], ['drape-epaule', { fabric: 'mousseline', color: '#7b1e34' }], ['applique-fleurs', { trim: '#e5c07b' }]] },
    { id: 'bal', name: 'Robe de bal', g: ['femme'], items: [['jupe-tulle', { fabric: 'tulle', color: '#e8b4b8' }], ['corset', { fabric: 'satin', color: '#f6d6d6', neck: 'coeur' }], ['perles', { trim: '#e5c07b' }], ['ceinture-noeud', { fabric: 'satin', color: '#b9a6c9' }]] },
    { id: 'tailleur', name: 'Tailleur couture', g: ['femme'], items: [['jupe-crayon', { fabric: 'crepe', color: '#1f1b24' }], ['manche-longue', { fabric: 'crepe', color: '#1f1b24' }], ['veste', { fabric: 'crepe', color: '#1f1b24', neck: 'profond' }], ['col-tailleur', { fabric: 'satin', color: '#1f1b24' }]] },
    { id: 'kaftan', name: 'Kaftan homme brodé', g: ['homme'], items: [['sarouel', { fabric: 'bazin', color: '#f5f0e6' }], ['manche-longue', { fabric: 'bazin', color: '#f5f0e6' }], ['kaftan', { fabric: 'bazin', color: '#f5f0e6', neck: 'ronde' }], ['col-officier', { fabric: 'bazin', color: '#f5f0e6' }], ['plastron', { trim: '#0b2e59' }]] },
    { id: 'costume', name: 'Tunique & pantalon', g: ['homme'], items: [['pantalon-droit', { fabric: 'lin', color: '#e9dfc8' }], ['manche-longue', { fabric: 'lin', color: '#e9dfc8' }], ['tunique', { fabric: 'lin', color: '#e9dfc8', neck: 'ronde' }], ['broderie-encolure', { trim: '#6b4f3a' }]] },
    { id: 'ndokette', name: 'Ndokette à volants', g: ['femme'], items: [['ndokette', { fabric: 'wax', color: '#1b998b', color2: '#f2a900' }], ['manche-ballon', { fabric: 'wax', color: '#1b998b', color2: '#f2a900' }], ['foulard-tete', { fabric: 'wax', color: '#1b998b', color2: '#f2a900' }]] },
    { id: 'enfant', name: 'Robe de cérémonie enfant', g: ['enfant'], items: [['jupe-corolle', { fabric: 'satin', color: '#f4e1c1' }], ['manche-ballon', { fabric: 'mousseline', color: '#fffaf2' }], ['corsage-ajuste', { fabric: 'satin', color: '#f4e1c1', neck: 'ronde' }], ['col-claudine', { fabric: 'dentelle', color: '#fffaf2' }], ['ceinture-noeud', { fabric: 'satin', color: '#e8d0e6' }]] },
    { id: 'enfant-boubou', name: 'Petit boubou enfant', g: ['enfant'], items: [['grand-boubou', { fabric: 'bazin', color: '#5b2a86', neck: 'ronde' }], ['broderie-encolure', { trim: '#e5c07b' }]] }
  ];

  /* ---------- Instances ---------- */
  let uidN = Date.now() % 100000;
  AC.newInst = function (id, o, cur) {
    const d = MOD[id]; o = o || {}; cur = cur || {};
    const dd = d.def || {};
    return { uid: 'm' + (uidN++).toString(36), id, tx: 0, ty: 0, s: 1, rot: 0, flip: !!o.flip,
      fabric: o.fabric || dd.fabric || cur.fabric || 'uni', color: o.color || dd.color || cur.color || '#d8c3a5', color2: o.color2 || cur.color2 || '#f2a900',
      trim: o.trim || cur.trim || '#c9a227', neck: o.neck || d.neck || null };
  };
  AC.instZ = inst => { const d = MOD[inst.id]; return d ? (d.z != null ? d.z : CATZ[d.cat]) : 0; };
  AC.insertInst = function (list, inst) {
    const z = AC.instZ(inst); let i = list.length;
    while (i > 0 && AC.instZ(list[i - 1]) > z) i--;
    list.splice(i, 0, inst); return list;
  };

  /* ---------- Géométrie et rendu ---------- */
  const GEO = new Map();
  AC.modGeo = function (inst, L) {
    const key = inst.id + '|' + (inst.neck || '') + '|' + L.key;
    let g = GEO.get(key); if (g) return g;
    const d = MOD[inst.id];
    const shapes = d.build(L, inst, mk(L));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    shapes.forEach(s => { (s.pts || []).forEach(p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
      (s.c || []).forEach(p => { x0 = Math.min(x0, p[0] - p[2]); y0 = Math.min(y0, p[1] - p[2]); x1 = Math.max(x1, p[0] + p[2]); y1 = Math.max(y1, p[1] + p[2]); }); });
    g = { shapes, bb: [x0, y0, x1, y1], pivot: [(x0 + x1) / 2, (y0 + y1) / 2] };
    GEO.set(key, g); return g;
  };
  AC.modT = function (inst, geo) {
    const px = geo.pivot[0], py = geo.pivot[1], s = inst.s || 1, c = Math.cos(inst.rot || 0), sn = Math.sin(inst.rot || 0), f = inst.flip ? -1 : 1;
    return p => { const dx = (p[0] - px) * f * s, dy = (p[1] - py) * s; return [px + inst.tx + dx * c - dy * sn, py + inst.ty + dx * sn + dy * c, p[2] || 0]; };
  };
  AC.modCorners = function (inst, L) {
    const g = AC.modGeo(inst, L), T = AC.modT(inst, g), b = g.bb, pad = 6;
    return [T([b[0] - pad, b[1] - pad]), T([b[2] + pad, b[1] - pad]), T([b[2] + pad, b[3] + pad]), T([b[0] - pad, b[3] + pad])];
  };
  AC.modCenter = function (inst, L) { const g = AC.modGeo(inst, L); return [g.pivot[0] + inst.tx, g.pivot[1] + inst.ty]; };

  const LINE = '#2b2530';
  AC.drawInst = function (ctx, inst, L) {
    const d = MOD[inst.id]; if (!d || !d.build) return;
    const geo = AC.modGeo(inst, L), T = AC.modT(inst, geo), s = inst.s || 1;
    const lw = 2.3 * Math.sqrt(s);
    const fm = { x: geo.pivot[0] + inst.tx, y: geo.pivot[1] + inst.ty, rot: inst.rot, s: s };
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const sh of geo.shapes) {
      if (sh.t === 'dot') {
        sh.c.forEach(c => {
          const p = T(c), r = c[2] * s;
          ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
          const col = sh.fill === 'trim' ? inst.trim : sh.fill === 'btn' ? AC.shade(inst.color, -0.55) : LINE;
          ctx.fillStyle = col; ctx.fill();
          ctx.lineWidth = Math.max(0.6, lw * 0.3); ctx.strokeStyle = AC.shade(col, -0.4); ctx.stroke();
          if (r > 2.5) { ctx.beginPath(); ctx.arc(p[0] - r * 0.3, p[1] - r * 0.3, r * 0.3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill(); }
        });
        continue;
      }
      const pts = sh.pts.map(T);
      const path = new Path2D(); AC.spline(path, pts, sh.t === 'piece' || sh.t === 'trim' || sh.closed);
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      if (sh.t === 'piece') {
        let bb = [1e9, 1e9, -1e9, -1e9]; pts.forEach(p => { bb = [Math.min(bb[0], p[0]), Math.min(bb[1], p[1]), Math.max(bb[2], p[0]), Math.max(bb[3], p[1])]; });
        ctx.fillStyle = AC.fabricFill(ctx, inst.fabric, inst.color, inst.color2, fm);
        ctx.fill(path);
        AC.shadePiece(ctx, path, bb, inst.fabric, inst.color);
        ctx.lineWidth = lw; ctx.strokeStyle = LINE; ctx.stroke(path);
      } else if (sh.t === 'trim') {
        let bb = [1e9, 1e9, -1e9, -1e9]; pts.forEach(p => { bb = [Math.min(bb[0], p[0]), Math.min(bb[1], p[1]), Math.max(bb[2], p[0]), Math.max(bb[3], p[1])]; });
        const gr = ctx.createLinearGradient(bb[0], bb[1], bb[2], bb[3]);
        gr.addColorStop(0, AC.shade(inst.trim, 0.25)); gr.addColorStop(0.5, inst.trim); gr.addColorStop(1, AC.shade(inst.trim, -0.25));
        ctx.fillStyle = gr; ctx.fill(path);
        ctx.lineWidth = lw * 0.8; ctx.strokeStyle = AC.shade(inst.trim, -0.45); ctx.stroke(path);
      } else if (sh.t === 'seam') {
        ctx.globalAlpha = 0.85; ctx.lineWidth = lw * 0.55; ctx.strokeStyle = LINE; ctx.stroke(path);
      } else if (sh.t === 'dash') {
        ctx.globalAlpha = 0.8; ctx.setLineDash([7 * s, 5 * s]); ctx.lineWidth = lw * 0.45; ctx.strokeStyle = LINE; ctx.stroke(path);
      } else if (sh.t === 'fold') {
        ctx.globalAlpha = 0.55; ctx.lineWidth = lw * 0.6; ctx.strokeStyle = AC.shade(inst.color, -0.5); ctx.stroke(path);
      } else if (sh.t === 'tline') {
        ctx.globalAlpha = 0.95; ctx.lineWidth = lw * 0.7; ctx.strokeStyle = AC.shade(inst.trim, -0.35); ctx.stroke(path);
      }
    }
    ctx.restore();
  };
  AC.renderModules = function (ctx, list, L) { list.forEach(i => AC.drawInst(ctx, i, L)); };

  /* Test de sélection : pièces pleines, sinon boîte englobante */
  let hitCtx = null;
  AC.modHit = function (inst, L, x, y) {
    if (!hitCtx) hitCtx = document.createElement('canvas').getContext('2d');
    const geo = AC.modGeo(inst, L), T = AC.modT(inst, geo);
    let solid = false;
    for (const sh of geo.shapes) {
      if (sh.t === 'piece' || sh.t === 'trim') {
        solid = true;
        const p = new Path2D(); AC.spline(p, sh.pts.map(T), true);
        if (hitCtx.isPointInPath(p, x, y)) return true;
      }
    }
    if (solid) return false;
    const c = AC.modCorners(inst, L); const p = new Path2D(); p.moveTo(c[0][0], c[0][1]); c.slice(1).forEach(q => p.lineTo(q[0], q[1])); p.closePath();
    return hitCtx.isPointInPath(p, x, y);
  };

  /* Vignette d'un module (ou d'un ensemble) sur gabarit femme de face */
  AC.moduleThumb = function (canvas, items, g, v) {
    const L = AC.landmarks(g || 'femme', v || 'face');
    const insts = items.map(it => it.uid ? it : AC.newInst(it[0], it[1], { fabric: 'uni', color: '#d9c7b3' }));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    insts.forEach(i => { AC.modCorners(i, L).forEach(p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }); });
    if (!insts.length) { x0 = 300; y0 = 60; x1 = 1100; y1 = 1900; }
    const w = canvas.width, h = canvas.height, pad = 0.12;
    const bw = (x1 - x0) * (1 + pad * 2), bh = (y1 - y0) * (1 + pad * 2);
    const sc = Math.min(w / bw, h / bh);
    const ox = w / 2 - ((x0 + x1) / 2) * sc, oy = h / 2 - ((y0 + y1) / 2) * sc;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, w, h);
    ctx.setTransform(sc, 0, 0, sc, ox, oy);
    AC.drawTemplate(ctx, L.gender, L.view, { lw: 1.3 / Math.max(sc, 0.05), fill: 'rgba(240,226,214,0.6)', stroke: '#b5b9c6' });
    insts.slice().sort((a, b) => AC.instZ(a) - AC.instZ(b)).forEach(i => AC.drawInst(ctx, i, L));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };
})();
