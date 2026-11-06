'use strict';
/* Atelier Couture — couleurs, palettes et textures de tissus procédurales */
(function () {
  const AC = window.AC = window.AC || {};

  /* ---------- Couleurs ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  AC.hex2rgb = function (h) {
    h = String(h || '#000').replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  AC.rgb2hex = (r, g, b) => '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  AC.shade = function (hex, amt) {
    const [r, g, b] = AC.hex2rgb(hex);
    if (amt >= 0) return AC.rgb2hex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
    return AC.rgb2hex(r * (1 + amt), g * (1 + amt), b * (1 + amt));
  };
  AC.rgba = function (hex, a) { const [r, g, b] = AC.hex2rgb(hex); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; };
  AC.mix = function (a, b, t) { const A = AC.hex2rgb(a), B = AC.hex2rgb(b); return AC.rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  AC.rgb2hsv = function (r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
    return [h, mx ? d / mx : 0, mx];
  };
  AC.hsv2rgb = function (h, s, v) {
    const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
  };
  AC.complement = function (hex) {
    const [h, s, v] = AC.rgb2hsv(...AC.hex2rgb(hex));
    const rgb = AC.hsv2rgb((h + 160) % 360, Math.max(0.55, s), Math.max(0.7, v));
    return AC.rgb2hex(...rgb);
  };
  const NAMES = [
    ['noir', '#111111'], ['anthracite', '#3a3a3a'], ['gris', '#8a8a8a'], ['blanc', '#ffffff'], ['ivoire', '#f5efe2'], ['écru', '#e9dfc8'],
    ['beige', '#d8c3a5'], ['camel', '#b88a55'], ['marron', '#5a3a22'], ['chocolat', '#3d2314'], ['or', '#c9a227'], ['champagne', '#e5c07b'],
    ['jaune', '#f2c200'], ['orange', '#e07a2e'], ['corail', '#f46f5e'], ['rouge', '#c8102e'], ['rouge vif', '#d7263d'], ['bordeaux', '#7b1e34'], ['rose poudré', '#efc6c4'],
    ['fuchsia', '#d6246e'], ['violet', '#5b2a86'], ['lilas', '#b9a6c9'], ['bleu nuit', '#0b1f3a'], ['indigo', '#1f3a5f'], ['bleu roi', '#1d4fbf'],
    ['bleu ciel', '#9cc7e8'], ['turquoise', '#1b998b'], ['vert émeraude', '#0f6e4f'], ['vert olive', '#6b7a2e'], ['vert d’eau', '#bfe0cf'], ['argent', '#b7b7b7']
  ];
  AC.colorName = function (hex) {
    const c = AC.hex2rgb(hex); let best = NAMES[0][0], bd = 1e9;
    NAMES.forEach(([n, h]) => { const d = AC.hex2rgb(h); const e = (c[0] - d[0]) ** 2 * 0.3 + (c[1] - d[1]) ** 2 * 0.59 + (c[2] - d[2]) ** 2 * 0.11; if (e < bd) { bd = e; best = n; } });
    return best;
  };

  AC.PALETTES = [
    { id: 'dakar', name: 'Dakar couture', c: ['#1f3a5f', '#c9a227', '#7b1e34', '#f5efe2', '#0f6e4f', '#e07a2e', '#3b2a1a'] },
    { id: 'bazin', name: 'Bazin royal', c: ['#0b2e59', '#5b2a86', '#c9a227', '#f5f0e6', '#9b1b30', '#0f5e57', '#1a1a1a'] },
    { id: 'wax', name: 'Wax solaire', c: ['#f2a900', '#d7263d', '#1b998b', '#2e294e', '#f46036', '#ffffff', '#111111'] },
    { id: 'pastel', name: 'Pastels haute couture', c: ['#f6d6d6', '#f4e1c1', '#cfe3d4', '#d6d9f2', '#e8d0e6', '#fffaf2', '#b9a6c9'] },
    { id: 'soir', name: 'Soirée', c: ['#111111', '#7b1e34', '#0b1f3a', '#0f6e4f', '#5b2a86', '#e5c07b', '#b7b7b7'] },
    { id: 'neutres', name: 'Neutres d’atelier', c: ['#000000', '#3a3a3a', '#8a8178', '#c7bfb3', '#e9e3d9', '#ffffff', '#6b4f3a'] },
    { id: 'peau', name: 'Carnations', c: ['#f6dcc8', '#e7b99a', '#c68a65', '#a0663f', '#7a4a2b', '#5a3420', '#3d2314'] },
    { id: 'metal', name: 'Métalliques & fils', c: ['#c9a227', '#e5c07b', '#b7b7b7', '#b87333', '#8c7853', '#f5efe2', '#1f1b24'] }
  ];

  /* ---------- Tissus ----------
     props : drape (0 raide … 3 très fluide), struct (tenue), sheen (brillance), sheer (transparence), weight (poids) */
  AC.FABRICS = [
    { id: 'uni', name: 'Uni', props: { drape: 2, struct: 1, sheen: 0, sheer: 0, weight: 1 },
      tombe: 'Aplat de couleur, sans matière définie : idéal pour poser les volumes avant de choisir le tissu.',
      conseil: 'Choisissez la matière avant de finaliser : elle décide du tombé, des coutures et du métrage.' },
    { id: 'wax', name: 'Wax', props: { drape: 1, struct: 2, sheen: 1, sheer: 0, weight: 2 },
      tombe: 'Coton imprimé à la cire, tissage serré et apprêt ferme : il garde les formes nettes, marque bien les pinces mais se drape peu.',
      conseil: 'Raccordez les motifs au milieu devant et aux coutures de côté (prévoir 10 à 15 % de métrage en plus). Les manches ballon et les basques tiennent seules ; évitez les drapés fluides.' },
    { id: 'bazin', name: 'Bazin riche', props: { drape: 0, struct: 3, sheen: 3, sheer: 0, weight: 2 },
      tombe: 'Damassé de coton teint, battu et amidonné : très brillant, sculptural, il tient debout et donne l’ampleur majestueuse du grand boubou.',
      conseil: 'Coupez dans le même sens (le damassé reflète la lumière différemment). Les broderies au fil (point de bourdon, cordonnet) se posent bien à l’encolure et en plastron. Peu adapté aux fronces fines.' },
    { id: 'soie', name: 'Soie (crêpe de Chine, twill)', props: { drape: 3, struct: 0, sheen: 2, sheer: 0, weight: 0 },
      tombe: 'Fluide, souple, elle suit le corps et se drape magnifiquement ; coupée dans le biais, elle épouse les courbes.',
      conseil: 'Coupe en biais pour les robes nuisette et les drapés ; ourlet roulotté à la main ; papier de soie sous la machine. Laisser reposer une coupe en biais 24 h avant l’ourlet.' },
    { id: 'satin', name: 'Satin duchesse', props: { drape: 1, struct: 3, sheen: 3, sheer: 0, weight: 2 },
      tombe: 'Satin épais à reflets profonds : il tient les volumes (jupes corolle, robes de bal) et forme des plis ronds et nobles.',
      conseil: 'Marque les épingles et les découtures : bâtir dans les valeurs de couture. Doubler, et entoiler les zones structurées. Repasser à l’envers avec une pattemouille.' },
    { id: 'dentelle', name: 'Dentelle (Calais, guipure)', props: { drape: 2, struct: 1, sheen: 0, sheer: 2, weight: 1 },
      tombe: 'Motifs ajourés sur fond de tulle : souple, elle laisse deviner la peau et se travaille en découpe autour des motifs.',
      conseil: 'Placer les festons en bordure (ourlet, encolure, poignet). Assembler par superposition invisible (à la main, autour des motifs). Prévoir un fond couleur chair ou contrasté.' },
    { id: 'mousseline', name: 'Mousseline de soie', props: { drape: 3, struct: 0, sheen: 1, sheer: 3, weight: 0 },
      tombe: 'Voile très léger et transparent : il flotte, se superpose et crée du mouvement.',
      conseil: 'Coutures anglaises ou ourlets roulottés ; superposer deux ou trois épaisseurs pour gagner en couleur ; toujours prévoir un fond de robe.' },
    { id: 'velours', name: 'Velours', props: { drape: 2, struct: 2, sheen: 2, sheer: 0, weight: 3 },
      tombe: 'Lourd et profond, il absorbe la lumière ; son poil (sens) change la couleur selon l’orientation.',
      conseil: 'Couper toutes les pièces dans le même sens du poil, repasser sur une planche à aiguilles. Lignes simples : il épaissit les découpes.' },
    { id: 'tulle', name: 'Tulle', props: { drape: 1, struct: 2, sheen: 0, sheer: 3, weight: 0 },
      tombe: 'Filet léger qui crée du volume par superposition : jupes de bal, jupons, voiles.',
      conseil: 'Compter plusieurs couches (souvent 3 à 7) froncées sur un fond de jupe ; le métrage augmente très vite.' },
    { id: 'crepe', name: 'Crêpe', props: { drape: 3, struct: 1, sheen: 0, sheer: 0, weight: 1 },
      tombe: 'Grain mat légèrement granité, tombé fluide et net : la matière idéale des robes fourreau et des tailleurs souples.',
      conseil: 'Tolère les pinces et les découpes princesse ; entoiler légèrement parementures et cols ; s’effiloche : surfiler.' },
    { id: 'lin', name: 'Lin', props: { drape: 1, struct: 2, sheen: 0, sheer: 0, weight: 1 },
      tombe: 'Fibre naturelle fraîche, un peu raide, au froissé élégant : coupes droites et amples.',
      conseil: 'Laver avant la coupe (rétrécit) ; coutures rabattues ; éviter les silhouettes très ajustées.' }
  ];
  AC.FAB = {}; AC.FABRICS.forEach(f => { AC.FAB[f.id] = f; });
  AC.FAB_SHADE = { uni: [0.1, 0.12], wax: [0.06, 0.12], bazin: [0.26, 0.18], soie: [0.3, 0.2], satin: [0.42, 0.26], dentelle: [0, 0.05], mousseline: [0.12, 0.04], velours: [0.08, 0.38], tulle: [0, 0], crepe: [0.06, 0.12], lin: [0.04, 0.1] };

  function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  AC.rng = rng;

  const cache = new Map();
  AC.fabricTile = function (fid, color, color2) {
    const key = fid + '|' + color + '|' + (fid === 'wax' ? color2 : '');
    if (cache.has(key)) return cache.get(key);
    if (cache.size > 80) cache.clear();
    const S = fid === 'wax' ? 180 : 128;
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    const R = rng(1234);
    const dark = AC.shade(color, -0.45), light = AC.shade(color, 0.22);
    const noise = (n, a, sz) => { for (let i = 0; i < n; i++) { g.fillStyle = R() < 0.5 ? AC.rgba('#000000', a * R()) : AC.rgba('#ffffff', a * R()); g.fillRect(R() * S, R() * S, sz, sz); } };
    switch (fid) {
      case 'wax': {
        const c2 = color2 || AC.complement(color);
        g.fillStyle = color; g.fillRect(0, 0, S, S);
        [[45, 45], [135, 135]].forEach(([x, y]) => {
          [[38, c2], [29, dark], [21, color], [13, c2], [5, '#ffffff']].forEach(([r, col]) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); });
          g.strokeStyle = AC.rgba('#ffffff', 0.7); g.lineWidth = 1.5;
          for (let a = 0; a < 12; a++) { const an = a * Math.PI / 6; g.beginPath(); g.moveTo(x + Math.cos(an) * 30, y + Math.sin(an) * 30); g.lineTo(x + Math.cos(an) * 37, y + Math.sin(an) * 37); g.stroke(); }
        });
        [[135, 45], [45, 135]].forEach(([x, y]) => {
          g.save(); g.translate(x, y); g.rotate(Math.PI / 4);
          g.fillStyle = dark; g.fillRect(-24, -24, 48, 48);
          g.fillStyle = c2; g.fillRect(-17, -17, 34, 34);
          g.fillStyle = color; g.fillRect(-9, -9, 18, 18);
          g.restore();
          g.fillStyle = '#ffffff';
          [[-38, 0], [38, 0], [0, -38], [0, 38]].forEach(([dx, dy]) => { g.beginPath(); g.arc(x + dx, y + dy, 3, 0, Math.PI * 2); g.fill(); });
        });
        g.strokeStyle = AC.rgba(dark, 0.25); g.lineWidth = 0.8;
        for (let i = 0; i < 14; i++) { g.beginPath(); let x = R() * S, y = R() * S; g.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (R() - 0.5) * 30; y += (R() - 0.5) * 30; g.lineTo(x, y); } g.stroke(); }
        break;
      }
      case 'bazin': {
        g.fillStyle = color; g.fillRect(0, 0, S, S);
        g.strokeStyle = AC.rgba(light, 0.55); g.lineWidth = 2;
        g.beginPath(); g.moveTo(0, 64); g.lineTo(64, 0); g.lineTo(128, 64); g.lineTo(64, 128); g.closePath(); g.stroke();
        g.fillStyle = AC.rgba(light, 0.45);
        for (let a = 0; a < 4; a++) { g.save(); g.translate(64, 64); g.rotate(a * Math.PI / 2); g.beginPath(); g.ellipse(0, -13, 6, 12, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
        [[0, 0], [128, 0], [0, 128], [128, 128]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill(); });
        g.strokeStyle = AC.rgba('#ffffff', 0.06); g.lineWidth = 1;
        for (let i = -S; i < S; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + S, S); g.stroke(); }
        break;
      }
      case 'soie':
        g.fillStyle = color; g.fillRect(0, 0, S, S);
        for (let y = 0; y < S; y += 2) { g.fillStyle = AC.rgba(R() < 0.5 ? '#ffffff' : '#000000', 0.03 * R()); g.fillRect(0, y, S, 1); }
        break;
      case 'satin':
        g.fillStyle = color; g.fillRect(0, 0, S, S);
        for (let y = 0; y < S; y += 3) { g.fillStyle = AC.rgba('#ffffff', 0.025); g.fillRect(0, y, S, 1); }
        break;
      case 'dentelle': {
        g.fillStyle = AC.rgba(color, 0.14); g.fillRect(0, 0, S, S);
        g.strokeStyle = AC.rgba(color, 0.75); g.lineWidth = 0.9;
        const st = 8;
        for (let y = 0; y <= S; y += st) for (let x = 0; x <= S; x += st) { g.beginPath(); g.arc(x + ((y / st) % 2 ? st / 2 : 0), y, st / 2, 0, Math.PI * 2); g.stroke(); }
        const fl = (x, y, r) => {
          g.fillStyle = AC.rgba(color, 0.92); g.strokeStyle = AC.rgba(dark, 0.6); g.lineWidth = 1;
          for (let a = 0; a < 6; a++) { g.save(); g.translate(x, y); g.rotate(a * Math.PI / 3); g.beginPath(); g.ellipse(0, -r * 0.6, r * 0.32, r * 0.55, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore(); }
          g.fillStyle = AC.rgba(dark, 0.5); g.beginPath(); g.arc(x, y, r * 0.22, 0, Math.PI * 2); g.fill();
        };
        fl(32, 32, 20); fl(96, 96, 22); fl(96, 30, 10); fl(30, 98, 10);
        g.strokeStyle = AC.rgba(color, 0.9); g.lineWidth = 2;
        g.beginPath(); g.moveTo(52, 40); g.quadraticCurveTo(70, 60, 82, 82); g.stroke();
        break;
      }
      case 'mousseline':
        g.fillStyle = AC.rgba(color, 0.45); g.fillRect(0, 0, S, S);
        for (let x = 0; x < S; x += 3) { g.fillStyle = AC.rgba('#ffffff', 0.06 * R()); g.fillRect(x, 0, 2, S); }
        break;
      case 'velours':
        g.fillStyle = AC.shade(color, -0.12); g.fillRect(0, 0, S, S);
        noise(2600, 0.16, 1);
        break;
      case 'tulle': {
        g.fillStyle = AC.rgba(color, 0.2); g.fillRect(0, 0, S, S);
        g.strokeStyle = AC.rgba(color, 0.65); g.lineWidth = 0.7;
        for (let i = -S; i <= S; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + S, S); g.stroke(); g.beginPath(); g.moveTo(i + S, 0); g.lineTo(i, S); g.stroke(); }
        break;
      }
      case 'crepe':
        g.fillStyle = color; g.fillRect(0, 0, S, S);
        noise(3200, 0.12, 1);
        break;
      case 'lin':
        g.fillStyle = color; g.fillRect(0, 0, S, S);
        for (let i = 0; i < 60; i++) { g.fillStyle = AC.rgba(R() < 0.5 ? '#ffffff' : '#000000', 0.08 + 0.06 * R()); g.fillRect(0, R() * S, S, 1 + R() * 1.5); g.fillRect(R() * S, 0, 1 + R(), S); }
        break;
      default:
        g.fillStyle = color; g.fillRect(0, 0, S, S);
    }
    cache.set(key, c);
    return c;
  };

  /* Remplissage : couleur ou motif (avec matrice : translation/rotation/échelle) */
  AC.fabricFill = function (ctx, fid, color, color2, m) {
    if (!fid || fid === 'uni') return color;
    const pat = ctx.createPattern(AC.fabricTile(fid, color, color2), 'repeat');
    if (m && pat.setTransform && typeof DOMMatrix !== 'undefined') {
      const M = new DOMMatrix();
      M.translateSelf(m.x || 0, m.y || 0); M.rotateSelf((m.rot || 0) * 180 / Math.PI);
      const sc = (m.s || 1) * (fid === 'wax' ? 0.75 : 0.7);
      M.scaleSelf(sc, sc);
      pat.setTransform(M);
    }
    return pat;
  };

  /* Ombrage de volume dans une pièce (lumière en haut à gauche) */
  AC.shadePiece = function (ctx, path, bb, fid, color) {
    const sh = AC.FAB_SHADE[fid] || AC.FAB_SHADE.uni;
    if (!sh[0] && !sh[1]) return;
    ctx.save(); ctx.clip(path);
    const g = ctx.createLinearGradient(bb[0], bb[1], bb[2], bb[3] * 0.3 + bb[1] * 0.7);
    g.addColorStop(0, 'rgba(0,0,0,' + (sh[1] * 0.6) + ')');
    g.addColorStop(0.22, 'rgba(255,255,255,' + sh[0] + ')');
    g.addColorStop(0.42, 'rgba(255,255,255,0)');
    if (fid === 'satin' || fid === 'soie') { g.addColorStop(0.62, 'rgba(255,255,255,' + sh[0] * 0.55 + ')'); g.addColorStop(0.74, 'rgba(255,255,255,0)'); }
    g.addColorStop(1, 'rgba(0,0,0,' + sh[1] + ')');
    ctx.fillStyle = g; ctx.fillRect(bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]);
    ctx.restore();
  };

  AC.drawSwatch = function (canvas, fid, color, color2) {
    const g = canvas.getContext('2d'); const w = canvas.width, h = canvas.height;
    g.clearRect(0, 0, w, h);
    if (fid === 'dentelle' || fid === 'tulle' || fid === 'mousseline') { g.fillStyle = '#e8dccf'; g.fillRect(0, 0, w, h); }
    g.fillStyle = AC.fabricFill(g, fid, color, color2, { s: w / 110 });
    g.fillRect(0, 0, w, h);
    const p = new Path2D(); p.rect(0, 0, w, h);
    AC.shadePiece(g, p, [0, 0, w, h], fid, color);
  };
})();
