'use strict';
/* Atelier Couture — gabarits de silhouette (croquis de mode) et repères de proportions */
(function () {
  const AC = window.AC = window.AC || {};
  const W = AC.DOC_W = 1400, H = AC.DOC_H = 1980;

  /* Courbe lissée (Catmull-Rom -> Bézier). Un point [x, y, 1] est un angle vif. */
  AC.spline = function (p, pts, closed) {
    const n = pts.length; if (n < 2) return;
    const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    p.moveTo(pts[0][0], pts[0][1]);
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const c1x = p1[2] ? p1[0] : p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[2] ? p1[1] : p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[2] ? p2[0] : p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[2] ? p2[1] : p2[1] - (p3[1] - p1[1]) / 6;
      p.bezierCurveTo(c1x, c1y, c2x, c2y, p2[0], p2[1]);
    }
    if (closed) p.closePath();
  };

  /* Contours : [hauteur en têtes, demi-largeur en têtes, angle?] */
  const SPECS = {
    femme: {
      name: 'Femme', heads: 9, hu: 196, top: 100,
      head: { cy: 0.5, rx: 0.34, ry: 0.5 },
      body: [[1.0,0.15],[1.28,0.16],[1.4,0.4],[1.5,0.74,1],[1.72,0.66],[2.0,0.57],[2.28,0.59],[2.62,0.48],[3.0,0.4],[3.4,0.53],[3.85,0.64],[4.2,0.62],[4.7,0.53],[5.4,0.43],[5.95,0.35],[6.5,0.37],[7.3,0.28],[8.35,0.16],[8.7,0.19],[8.98,0.17,1],[9.0,0.06,1],[8.5,0.07],[7.4,0.11],[6.6,0.14],[6.05,0.1],[5.3,0.12],[4.6,0.11],[4.28,0.03,1]],
      arm: [[1.48,0.72],[1.62,0.82],[2.0,0.83],[2.5,0.81],[3.0,0.82],[3.6,0.88],[4.05,0.92],[4.3,0.97],[4.6,0.94],[4.68,0.87],[4.5,0.8],[4.08,0.8],[3.6,0.77],[3.0,0.7],[2.5,0.65],[2.02,0.6]],
      prof: [[1.05,-0.13],[1.35,-0.18],[1.7,-0.27],[2.1,-0.29],[2.6,-0.2],[3.0,-0.15],[3.45,-0.27],[3.85,-0.36],[4.25,-0.3],[4.8,-0.22],[5.5,-0.16],[5.95,-0.14],[6.5,-0.21],[7.3,-0.15],[8.35,-0.08],[8.8,-0.12],[8.98,-0.1,1],[9.0,0.32,1],[8.85,0.3],[8.45,0.06],[7.4,0.02],[6.4,0.05],[5.95,0.09],[5.0,0.16],[4.2,0.2],[3.65,0.17],[3.05,0.12],[2.62,0.18],[2.3,0.33],[2.05,0.3],[1.65,0.16],[1.32,0.1],[1.05,0.1]],
      parm: [[1.5,-0.17],[1.85,-0.2],[2.5,-0.17],[3.0,-0.13],[3.6,-0.06],[4.05,0.0],[4.35,0.03],[4.62,0.06],[4.6,0.16],[4.35,0.17],[4.05,0.11],[3.6,0.06],[3.0,0.02],[2.5,0.03],[2.0,0.05]],
      lm: { neckY: 1.15, nh: 0.17, shY: 1.5, sh: 0.74, pitY: 1.98, bustY: 2.28, bh: 0.59, waistY: 3.0, wh: 0.4, hipY: 3.85, hh: 0.64, crotchY: 4.28, kneeY: 5.95, kh: 0.36, ankleY: 8.35, ah: 0.16, floorY: 9.0,
        arm: { sh: [0.74, 1.5], pit: [0.6, 2.0], elbO: [0.82, 3.0], elbI: [0.7, 3.0], wrO: [0.92, 4.05], wrI: [0.8, 4.08] } }
    },
    homme: {
      name: 'Homme', heads: 9, hu: 196, top: 100,
      head: { cy: 0.5, rx: 0.33, ry: 0.5 },
      body: [[1.0,0.19],[1.3,0.21],[1.42,0.55],[1.52,0.92,1],[1.75,0.84],[2.0,0.76],[2.3,0.74],[2.7,0.64],[3.1,0.58],[3.5,0.6],[3.9,0.62],[4.3,0.62],[4.8,0.55],[5.5,0.46],[6.05,0.37],[6.6,0.4],[7.4,0.31],[8.4,0.19],[8.75,0.22],[8.98,0.2,1],[9.0,0.06,1],[8.5,0.08],[7.4,0.12],[6.6,0.15],[6.1,0.11],[5.3,0.13],[4.7,0.12],[4.38,0.03,1]],
      arm: [[1.5,0.9],[1.65,1.02],[2.0,1.03],[2.5,1.0],[3.05,0.99],[3.7,1.02],[4.15,1.05],[4.4,1.1],[4.72,1.06],[4.8,0.98],[4.6,0.92],[4.18,0.92],[3.7,0.9],[3.05,0.84],[2.5,0.8],[2.02,0.77]],
      prof: [[1.05,-0.15],[1.35,-0.21],[1.7,-0.29],[2.1,-0.3],[2.6,-0.24],[3.1,-0.2],[3.5,-0.26],[3.9,-0.31],[4.3,-0.28],[4.9,-0.22],[5.6,-0.17],[6.05,-0.15],[6.6,-0.22],[7.4,-0.16],[8.4,-0.09],[8.82,-0.13],[8.98,-0.11,1],[9.0,0.34,1],[8.85,0.32],[8.48,0.07],[7.4,0.03],[6.5,0.06],[6.05,0.1],[5.1,0.17],[4.3,0.2],[3.7,0.2],[3.1,0.17],[2.6,0.22],[2.25,0.27],[1.9,0.24],[1.5,0.15],[1.3,0.12],[1.05,0.12]],
      parm: [[1.5,-0.2],[1.85,-0.23],[2.5,-0.2],[3.05,-0.15],[3.7,-0.08],[4.15,-0.01],[4.45,0.03],[4.75,0.06],[4.72,0.17],[4.45,0.18],[4.15,0.12],[3.7,0.07],[3.05,0.03],[2.5,0.04],[2.0,0.06]],
      lm: { neckY: 1.15, nh: 0.2, shY: 1.52, sh: 0.92, pitY: 2.0, bustY: 2.3, bh: 0.74, waistY: 3.1, wh: 0.58, hipY: 3.9, hh: 0.62, crotchY: 4.38, kneeY: 6.05, kh: 0.37, ankleY: 8.4, ah: 0.19, floorY: 9.0,
        arm: { sh: [0.92, 1.52], pit: [0.77, 2.02], elbO: [0.99, 3.05], elbI: [0.84, 3.05], wrO: [1.05, 4.15], wrI: [0.92, 4.18] } }
    },
    enfant: {
      name: 'Enfant', heads: 6, hu: 268, top: 190,
      head: { cy: 0.5, rx: 0.42, ry: 0.5 },
      body: [[0.98,0.17],[1.12,0.18],[1.2,0.4],[1.28,0.6,1],[1.45,0.55],[1.62,0.5],[1.85,0.5],[2.2,0.47],[2.45,0.46],[2.75,0.5],[3.0,0.52],[3.2,0.5],[3.6,0.42],[4.1,0.32],[4.35,0.31],[4.8,0.3],[5.3,0.24],[5.65,0.18],[5.85,0.2],[5.99,0.18,1],[6.0,0.05,1],[5.7,0.06],[5.2,0.09],[4.7,0.12],[4.35,0.08],[3.8,0.1],[3.35,0.08],[3.12,0.03,1]],
      arm: [[1.27,0.58],[1.38,0.66],[1.7,0.67],[2.35,0.68],[2.8,0.72],[3.05,0.74],[3.22,0.77],[3.42,0.73],[3.45,0.67],[3.28,0.63],[3.05,0.64],[2.8,0.61],[2.35,0.57],[1.95,0.53],[1.64,0.51]],
      prof: null, parm: null,
      lm: { neckY: 1.05, nh: 0.18, shY: 1.28, sh: 0.6, pitY: 1.62, bustY: 1.85, bh: 0.5, waistY: 2.45, wh: 0.46, hipY: 3.0, hh: 0.52, crotchY: 3.12, kneeY: 4.35, kh: 0.31, ankleY: 5.65, ah: 0.18, floorY: 6.0,
        arm: { sh: [0.6, 1.28], pit: [0.51, 1.64], elbO: [0.68, 2.35], elbI: [0.57, 2.35], wrO: [0.74, 3.05], wrI: [0.64, 3.05] } }
    }
  };
  /* Profil enfant : dérivé du profil femme par correspondance des repères */
  const MF = [1.05, 1.5, 2.28, 3.0, 3.85, 4.28, 5.95, 8.35, 9.0], MC = [0.98, 1.28, 1.85, 2.45, 3.0, 3.12, 4.35, 5.65, 6.0];
  function mapY(y) {
    for (let i = 0; i < MF.length - 1; i++) {
      if (y <= MF[i + 1] || i === MF.length - 2) { const t = (y - MF[i]) / (MF[i + 1] - MF[i]); return MC[i] + t * (MC[i + 1] - MC[i]); }
    }
    return y;
  }
  const kid = pts => pts.map(p => { let x = p[1] * 0.86; if (p[0] > 2.1 && p[0] < 2.45 && x > 0.2) x = 0.2; return [mapY(p[0]), x, p[2] || 0]; });
  SPECS.enfant.prof = kid(SPECS.femme.prof);
  SPECS.enfant.parm = kid(SPECS.femme.parm);

  AC.SPECS = SPECS;
  AC.GENDERS = [{ id: 'femme', name: 'Femme' }, { id: 'homme', name: 'Homme' }, { id: 'enfant', name: 'Enfant' }];
  AC.VIEWS = [{ id: 'face', name: 'Face' }, { id: 'dos', name: 'Dos' }, { id: 'profil', name: 'Profil' }];

  AC.landmarks = function (g, v) {
    const S = SPECS[g] || SPECS.femme, u = S.hu, t = S.top, m = S.lm;
    const L = { cx: W / 2, hu: u, top: t, gender: g, view: v, key: g + '-' + v, heads: S.heads,
      headRx: S.head.rx * u, headCy: t + S.head.cy * u };
    ['neckY', 'shY', 'pitY', 'bustY', 'waistY', 'hipY', 'crotchY', 'kneeY', 'ankleY', 'floorY'].forEach(k => { L[k] = t + m[k] * u; });
    ['nh', 'sh', 'bh', 'wh', 'hh', 'kh', 'ah'].forEach(k => { L[k] = m[k] * u; });
    L.arm = {};
    Object.keys(m.arm).forEach(k => { L.arm[k] = [m.arm[k][0] * u, t + m.arm[k][1] * u]; });
    return L;
  };

  /* Dessin du gabarit (trait clair, carnation légère) */
  AC.drawTemplate = function (ctx, g, v, o) {
    o = o || {};
    const S = SPECS[g] || SPECS.femme, u = S.hu, t = S.top, cx = W / 2;
    ctx.save();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.lineWidth = o.lw || 2.2;
    ctx.strokeStyle = o.stroke || '#8d93a5';
    ctx.fillStyle = o.fill || 'rgba(240,226,214,0.7)';
    const D = (p, sx) => [cx + sx * p[1] * u, t + p[0] * u, p[2] || 0];
    const fillStroke = (pts, closedStroke) => {
      const f = new Path2D(); AC.spline(f, pts, true); ctx.fill(f);
      const s = new Path2D(); AC.spline(s, pts, closedStroke); ctx.stroke(s);
    };
    const head = (dx) => {
      const p = new Path2D(); p.ellipse(cx + dx * u, t + S.head.cy * u, S.head.rx * u * (dx ? 1.12 : 1), S.head.ry * u, 0, 0, Math.PI * 2);
      ctx.fill(p); ctx.stroke(p);
    };
    if (v === 'profil') {
      const arm = S.parm.map(p => D(p, 1));
      fillStroke(S.prof.map(p => D(p, 1)), true);
      head(0.04);
      fillStroke(arm, false);
      ctx.globalAlpha = 0.35; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(cx + 0.3 * u, t + 0.5 * u); ctx.lineTo(cx + 0.42 * u, t + 0.5 * u); ctx.stroke();
    } else {
      const left = S.body.map(p => D(p, -1)), right = S.body.slice().reverse().map(p => D(p, 1));
      fillStroke(left.concat(right), true);
      head(0);
      [-1, 1].forEach(sx => fillStroke(S.arm.map(p => D(p, sx)), false));
      ctx.globalAlpha = 0.35; ctx.lineWidth = 1.3;
      if (v === 'face') {
        ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(cx, t + 0.12 * u); ctx.lineTo(cx, t + 0.95 * u); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(cx - S.head.rx * u * 0.8, t + 0.5 * u); ctx.lineTo(cx + S.head.rx * u * 0.8, t + 0.5 * u); ctx.stroke();
      } else {
        const m = S.lm;
        ctx.setLineDash([8, 7]);
        ctx.beginPath(); ctx.moveTo(cx, t + (m.neckY + 0.1) * u); ctx.lineTo(cx, t + m.waistY * u); ctx.stroke();
        ctx.setLineDash([]);
        [-1, 1].forEach(sx => {
          ctx.beginPath();
          ctx.moveTo(cx + sx * 0.12 * u, t + (m.shY + 0.2) * u);
          ctx.quadraticCurveTo(cx + sx * m.bh * 0.8 * u, t + (m.shY + 0.25) * u, cx + sx * m.bh * 0.55 * u, t + (m.bustY + 0.1) * u);
          ctx.stroke();
        });
        /* chignon pour signaler le dos */
        ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.arc(cx, t + 0.62 * u, S.head.rx * u * 0.38, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.restore();
  };

  /* Repères de proportions (affichés à l'écran, jamais exportés) */
  AC.drawGuide = function (ctx, g, v, s) {
    const S = SPECS[g] || SPECS.femme, u = S.hu, t = S.top, cx = W / 2, m = S.lm;
    const k = 1 / s;
    ctx.save();
    ctx.lineWidth = 1.2 * k;
    ctx.strokeStyle = 'rgba(168,131,74,0.55)';
    ctx.fillStyle = 'rgba(120,90,45,0.9)';
    ctx.font = (12 * k) + 'px -apple-system, Segoe UI, sans-serif';
    const x0 = cx - 1.55 * u, x1 = cx + 1.55 * u;
    for (let i = 0; i <= S.heads; i++) {
      const y = t + i * u;
      ctx.setLineDash(i % 1 === 0 ? [] : [4 * k, 4 * k]);
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      if (i < S.heads) { ctx.textAlign = 'right'; ctx.fillText(String(i + 1), x0 - 8 * k, y + u / 2 + 4 * k); }
    }
    ctx.setLineDash([6 * k, 6 * k]);
    ctx.strokeStyle = 'rgba(168,131,74,0.8)';
    ctx.beginPath(); ctx.moveTo(cx, t - 0.2 * u); ctx.lineTo(cx, t + (S.heads + 0.1) * u); ctx.stroke();
    ctx.setLineDash([]);
    const marks = [['Épaules', m.shY], ['Poitrine', m.bustY], ['Taille', m.waistY], ['Hanches', m.hipY], ['Entrejambe', m.crotchY], ['Genoux', m.kneeY], ['Chevilles', m.ankleY]];
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'rgba(160,60,60,0.65)';
    marks.forEach(([name, y]) => {
      const yy = t + y * u;
      ctx.beginPath(); ctx.moveTo(cx - 1.2 * u, yy); ctx.lineTo(x1, yy); ctx.stroke();
      ctx.fillStyle = 'rgba(140,50,50,0.95)';
      ctx.fillText(name, x1 + 8 * k, yy + 4 * k);
    });
    ctx.restore();
  };
})();
