'use strict';
/* Atelier Couture — assistance : proportions, cohérence, tombé, vocabulaire, variantes */
(function () {
  const AC = window.AC;

  AC.PROPORTIONS = {
    femme: {
      titre: 'Croquis de mode femme — canon de 9 têtes',
      points: [
        'Hauteur totale = 9 têtes (le corps réel en compte 7,5 : le croquis allonge surtout les jambes).',
        'Épaules à 1,5 tête du sommet ; largeur d’épaules ≈ 1,5 hauteur de tête.',
        'Poitrine à 2,3 têtes, taille à 3 têtes : la taille fait environ une tête de large.',
        'Hanches à 3,9 têtes, aussi larges que les épaules : la silhouette en X se lit là.',
        'Entrejambe à 4,3 têtes, genoux à 6, chevilles à 8,4 : le genou est à mi-hauteur entre hanche et cheville.',
        'Les coudes tombent à la taille, les poignets à l’entrejambe.'
      ]
    },
    homme: {
      titre: 'Croquis de mode homme — canon de 9 têtes',
      points: [
        'Hauteur totale = 9 têtes ; carrure plus large que les hanches (silhouette en V).',
        'Largeur d’épaules ≈ 2 hauteurs de tête ; cou plus épais.',
        'Taille plus basse et moins marquée (3,1 têtes), hanches étroites.',
        'Entrejambe à 4,4 têtes, genoux à 6, chevilles à 8,4.',
        'Mains plus grandes : environ 3/4 de tête.'
      ]
    },
    enfant: {
      titre: 'Croquis enfant — canon de 6 têtes (environ 6–8 ans)',
      points: [
        'Hauteur totale = 6 têtes : la tête est grande par rapport au corps.',
        'Épaules étroites (≈ 1,2 tête), taille peu marquée, ventre légèrement arrondi.',
        'Taille à 2,5 têtes, entrejambe à 3,1 têtes, genoux à 4,3 têtes.',
        'Pas de pinces de poitrine : on construit par l’aisance, les fronces et les empiècements.',
        'Prévoir de l’aisance et des ourlets généreux (l’enfant grandit).'
      ]
    }
  };
  AC.PROP_TIPS = [
    'Tracez d’abord la ligne d’aplomb (milieu vertical) : tout le croquis s’équilibre dessus.',
    'Posez les volumes avant les détails : silhouette générale → pièces → coutures → ornements.',
    'Un vêtement s’écarte du corps de 1 à 3 mm sur le croquis aux zones ajustées, beaucoup plus aux zones amples.',
    'Les plis partent toujours d’un point de tension (épaule, taille, genou plié) et s’ouvrent vers l’ourlet.',
    'Activez la symétrie pour les pièces de face, désactivez-la pour les drapés et les plis.'
  ];

  AC.GLOSSARY = [
    ['Aplomb', 'Ligne verticale de référence (milieu devant/dos) ; un vêtement « d’aplomb » tombe droit, sans tourner.'],
    ['Aisance', 'Différence entre la mesure du corps et celle du vêtement : elle permet de bouger et de respirer.'],
    ['Appliqué', 'Motif découpé (tissu, dentelle, fleurs) cousu à la main sur le vêtement.'],
    ['Basque (péplum)', 'Volant évasé cousu à la taille, qui couvre le haut des hanches.'],
    ['Baleine', 'Tige souple (acier spiralé, plastique) glissée dans une coulisse pour structurer un corset ou un bustier.'],
    ['Bazin riche', 'Damassé de coton teint, battu et amidonné, très brillant ; matière reine des grands boubous.'],
    ['Biais', 'Direction à 45° du droit-fil : le tissu y devient élastique et épouse les courbes. Aussi : bande coupée dans ce sens pour finir un bord.'],
    ['Bourdon (point de)', 'Point serré et bombé qui dessine des motifs en relief ; très utilisé sur les broderies d’encolure.'],
    ['Brandebourg', 'Fermeture décorative en passementerie, formée de boucles et d’une olive.'],
    ['Cannetille', 'Fil métallique en spirale utilisé en broderie d’or.'],
    ['Cordonnet', 'Fil épais et rond qui souligne les contours d’une broderie.'],
    ['Corolle', 'Jupe en cercle ou demi-cercle, ample et ronde, taille marquée (ligne « New Look »).'],
    ['Coutil', 'Toile très serrée, sans élasticité, qui forme la structure d’un corset.'],
    ['Cran', 'Petite entaille de repère sur les bords des pièces, pour assembler au bon endroit.'],
    ['Crin (horsehair)', 'Galon raide cousu dans l’ourlet pour qu’un évasement garde sa forme.'],
    ['Découpe princesse', 'Couture qui part de l’emmanchure ou de l’épaule, passe par la poitrine et descend jusqu’à la taille ou l’ourlet.'],
    ['Doublure', 'Tissu intérieur qui cache les coutures, facilite l’enfilage et améliore le tombé.'],
    ['Droit-fil', 'Sens des fils de chaîne, parallèle à la lisière : le plus stable.'],
    ['Embu', 'Léger excédent de longueur résorbé sans fronces (tête de manche) pour donner du volume.'],
    ['Emmanchure', 'Ouverture du corsage où se monte la manche.'],
    ['Encolure', 'Bord du vêtement autour du cou (ronde, V, bateau, carrée…).'],
    ['Entoilage', 'Toile, souvent thermocollante, qui renforce une zone (col, parementure, poignet).'],
    ['Fond de robe', 'Robe intérieure ajustée qui porte un tissu transparent ou un drapé.'],
    ['Fronces', 'Petits plis irréguliers obtenus en resserrant un fil : ils créent de l’ampleur.'],
    ['Godet', 'Pièce en éventail insérée dans une couture pour évaser une jupe ou une manche.'],
    ['Gros-grain', 'Ruban côtelé et ferme ; à l’intérieur d’une robe bustier, il porte le poids à la taille.'],
    ['Guipure', 'Dentelle sans fond de tulle, aux motifs reliés par des brides.'],
    ['Laize', 'Largeur du tissu, d’une lisière à l’autre (souvent 1,40 m ou 1,50 m) : elle détermine le métrage.'],
    ['Métrage', 'Longueur de tissu à acheter, calculée selon la laize, le modèle et le raccord des motifs.'],
    ['Moulage', 'Construction du vêtement en drapant directement la toile sur un mannequin.'],
    ['Ndokette', 'Robe ample sénégalaise, souvent à volants et manches bouffantes.'],
    ['Mbubb (grand boubou)', 'Grande pièce ample tombant jusqu’aux chevilles, aux ailes larges jusqu’aux poignets.'],
    ['Organza', 'Voile de soie raide et léger, utilisé pour soutenir les volumes ou en surpiqûre transparente.'],
    ['Ourlet roulotté', 'Ourlet minuscule roulé à la main ou à la machine, pour les tissus fins.'],
    ['Parementure', 'Pièce intérieure qui finit une encolure, une emmanchure ou un devant de veste.'],
    ['Passepoil', 'Fin liseré pris dans une couture pour la souligner.'],
    ['Patron', 'Ensemble des gabarits en papier des pièces du vêtement.'],
    ['Pince', 'Pli cousu en pointe qui donne du volume (poitrine, hanches) et ajuste la taille.'],
    ['Plastron', 'Panneau du devant, souvent brodé, de l’encolure à la poitrine.'],
    ['Plissé soleil', 'Plis rayonnants fixés à chaud, qui s’ouvrent vers l’ourlet.'],
    ['Surpiqûre', 'Piqûre visible, décorative ou de maintien, parallèle à une couture.'],
    ['Taille basse', 'Ensemble sénégalais : haut ajusté (souvent à basque) et longue jupe-pagne ajustée.'],
    ['Thioup', 'Teinture artisanale du bazin (nouée, au trempé) qui crée dégradés et motifs.'],
    ['Toile', 'Prototype en coton écru qui sert à valider la coupe avant de couper le tissu définitif.'],
    ['Tombé', 'Façon dont un tissu pend et bouge sur le corps : raide, souple, fluide.'],
    ['Traîne', 'Prolongement de la jupe qui traîne au sol derrière la silhouette.'],
    ['Tulle', 'Filet léger en mailles hexagonales, utilisé en couches pour donner du volume.'],
    ['Wax', 'Coton imprimé à la cire des deux côtés, couleurs franches et motifs graphiques.']
  ];

  const FOCAL = d => !!d.focal;
  const STRAPLESS = n => n === 'coeur' || n === 'droit';
  AC.analyze = function (list, tpl) {
    const out = [], add = (lvl, t, x) => out.push({ lvl, t, x });
    const D = list.map(i => ({ i, d: AC.MOD[i.id] })).filter(x => x.d && x.d.build);
    if (!D.length) {
      add('info', 'Page blanche', 'Commencez par un ensemble (onglet Modules → Ensembles) ou posez une pièce de buste : corsage, robe ou boubou. Les modules s’adaptent à la silhouette choisie.');
      return out;
    }
    const cat = c => D.filter(x => x.d.cat === c);
    const robes = cat('robe'), cors = cat('corsage'), jupes = cat('jupe'), bas = cat('bas'), manches = cat('manche'), cols = cat('col'), ferm = cat('fermeture');
    const tops = D.filter(x => x.d.top), inner = cors.filter(x => x.d.id !== 'veste');
    const strapless = tops.find(x => STRAPLESS(x.i.neck));
    if (inner.length > 1) add('warn', 'Deux hauts superposés', 'Deux corsages se recouvrent. Gardez-en un seul, ou transformez le second en surpièce (veste, boléro).');
    if (robes.length && inner.length) add('warn', 'Robe + corsage', 'Une robe contient déjà son corsage. Pour un deux-pièces, retirez la robe ; pour superposer, préférez une veste ou un drapé.');
    if (robes.length > 1) add('warn', 'Deux robes', 'Deux robes se superposent : gardez-en une, ou utilisez la seconde comme surpièce transparente (mousseline, tulle).');
    if (jupes.length + bas.length > 1) add('warn', 'Deux bas', 'Jupe et pantalon (ou deux jupes) se recouvrent. Pour une jupe-culotte ou une surjupe, assumez-le et notez-le dans la fiche.');
    if (inner.length && !jupes.length && !bas.length && !robes.length) add('info', 'Et le bas ?', 'Le haut est posé : ajoutez une jupe ou un pantalon pour juger l’équilibre de la silhouette.');
    if ((jupes.length || bas.length) && !tops.length) add('info', 'Et le haut ?', 'Ajoutez un corsage, une chemise ou une veste : le haut fixe l’encolure et les manches.');
    if (strapless && manches.length) add('warn', 'Bustier et manches', 'Une manche montée a besoin d’une emmanchure : avec un bustier, choisissez une encolure à bretelles, ou dessinez des manches « tombées » séparées.');
    if (robes.find(x => x.d.wide) && manches.length) add('warn', 'Boubou et manches', 'Le grand boubou a ses ailes intégrées : une manche montée en plus surcharge la silhouette. Retirez la manche, ou passez à un kaftan.');
    if (manches.length > 2 || new Set(manches.map(x => x.d.id)).size > 1) add('warn', 'Plusieurs manches', 'Deux modèles de manches sont posés. Si c’est voulu (manche asymétrique), réduisez-en un à un seul côté ; sinon gardez-en un.');
    if (cols.length > 1) add('warn', 'Deux cols', 'Un seul col par encolure. Exception : col officier + jabot ou lavallière, qui se montent ensemble.');
    if (cols.length && strapless) add('warn', 'Col sans encolure', 'Un col se monte sur une encolure à bretelles : il ne tient pas sur un bustier.');
    const neckOf = tops.length ? tops[tops.length - 1].i.neck : null;
    if (cols.find(x => x.d.id === 'col-claudine') && (neckOf === 'v' || neckOf === 'profond')) add('warn', 'Col Claudine sur un V', 'Le col Claudine se monte sur une encolure ronde haute : appliquez « Encolure ronde ».');
    if (cols.find(x => x.d.id === 'col-tailleur' || x.d.id === 'col-chale') && neckOf && neckOf !== 'profond' && neckOf !== 'v') add('info', 'Revers et encolure', 'Un col tailleur ou châle se monte sur un V : appliquez « Décolleté plongeant » ou « Encolure en V » au haut.');
    const fitted = D.find(x => ['robe-fourreau', 'robe-sirene', 'corset', 'corsage-ajuste', 'corsage-princesse', 'jupe-crayon'].includes(x.d.id));
    if (fitted && !ferm.length) add('info', 'Fermeture', '« ' + fitted.d.name + ' » est ajusté : la fiche technique prévoit un zip invisible milieu dos. Dessinez-le en vue de dos avec le module « Zip invisible ».');
    const focal = D.filter(x => FOCAL(x.d));
    if (focal.length >= 3) add('warn', 'Trop de points focaux', focal.map(x => x.d.name).join(', ') + ' : en haute couture, un seul détail fort par silhouette se lit mieux. Gardez le plus fort, simplifiez les autres.');
    else if (!focal.length && D.length >= 2) add('info', 'Point focal', 'La silhouette est sobre. Un détail signature (broderie d’encolure, drapé, fleurs, nœud) attirera le regard là où vous le voulez.');
    const vTop = Math.max(0, ...D.filter(x => ['corsage', 'manche', 'col'].includes(x.d.cat)).map(x => x.d.vol || 0));
    const vBot = Math.max(0, ...D.filter(x => ['jupe', 'bas', 'robe'].includes(x.d.cat)).map(x => x.d.vol || 0));
    const waist = D.find(x => x.d.cat === 'ceinture' || x.d.id === 'basque');
    if (vTop >= 1 && vBot >= 2 && !waist) add('info', 'Volume en haut et en bas', 'Manches et jupe sont amples : marquez la taille (ceinture, basque) pour garder une silhouette en X.');
    if (vTop + vBot === 0 && D.length >= 2) add('info', 'Silhouette en colonne', 'Tout est près du corps : élégant et graphique. Jouez sur la matière (satin, velours) ou une fente pour le mouvement.');
    const cols2 = new Set(D.filter(x => !['broderie', 'fermeture'].includes(x.d.cat)).map(x => x.i.color));
    if (cols2.size > 4) add('info', 'Beaucoup de couleurs', cols2.size + ' couleurs de tissu : limitez-vous à 2 ou 3 et une couleur d’ornement pour une harmonie couture.');
    const wax = new Set(D.filter(x => x.i.fabric === 'wax').map(x => x.i.color + x.i.color2));
    if (wax.size > 1) add('info', 'Mélange de wax', 'Plusieurs wax différents : gardez une couleur commune entre eux, ou associez le wax à un uni.');
    D.forEach(({ i, d }) => {
      const F = AC.FAB[i.fabric]; if (!F || i.fabric === 'uni') return;
      if (d.drape && F.props.drape <= 1) add('warn', d.name + ' en ' + F.name, 'Ce tissu se drape mal (tenue ferme). Pour un vrai drapé, préférez soie, crêpe ou mousseline, ou simulez-le par des plis piqués.');
      if (d.pleat && ['wax', 'lin', 'velours', 'bazin', 'dentelle'].includes(i.fabric)) add('warn', 'Plissé en ' + F.name, 'Le plissé permanent se fixe à chaud sur fibre synthétique : en ' + F.name + ', prévoyez des plis creux repassés et piqués en haut.');
      if (d.struct && F.props.struct <= 1) add('info', d.name + ' : tenue', 'Le ' + F.name.toLowerCase() + ' ne tient pas seul : entoiler, doubler d’organza ou baleiner pour garder la forme.');
      if (F.props.sheer >= 2 && ['corsage', 'robe', 'jupe', 'bas'].includes(d.cat)) add('info', 'Transparence', d.name + ' en ' + F.name.toLowerCase() + ' : prévoir un fond de robe ou une doublure (soie, crêpe, couleur chair ou contrastée).');
      if ((d.vol || 0) >= 2 && F.props.weight >= 2 && d.cat === 'jupe') add('info', 'Poids de la jupe', 'Jupe ample en ' + F.name.toLowerCase() + ' : renforcer la taille (gros-grain) et répartir le poids sur des bretelles intérieures.');
      if (d.id === 'grand-boubou' && i.fabric === 'bazin') add('ok', 'Boubou en bazin', 'Le bazin riche donne le tombé sculpté du grand boubou ; coupez toutes les pièces dans le même sens pour un reflet uniforme.');
    });
    if (tpl && tpl.g === 'enfant' && D.find(x => x.d.id === 'corset')) add('warn', 'Corset pour enfant', 'Un corset baleiné est déconseillé pour un enfant : préférez un corsage doublé à pinces légères ou à smocks.');
    if (tpl && tpl.v === 'profil') add('info', 'Vue de profil', 'Les modules sont construits de face : en profil, servez-vous-en comme base et retouchez le contour au pinceau.');
    if (!out.some(o => o.lvl === 'warn')) out.unshift({ lvl: 'ok', t: 'Silhouette cohérente', x: 'Aucune incompatibilité de construction détectée entre les modules posés.' });
    return out;
  };

  AC.moduleAdvice = function (inst) {
    const d = AC.MOD[inst.id]; if (!d) return null;
    const F = AC.FAB[inst.fabric] || AC.FAB.uni;
    const notes = [];
    if (d.drape && F.props.drape <= 1 && inst.fabric !== 'uni') notes.push('Ce module demande un tissu fluide : le ' + F.name.toLowerCase() + ' le rendra raide.');
    if (d.struct) notes.push('Module structuré : la tenue vient de l’entoilage, des baleines ou du jupon, pas seulement du tissu.');
    if (d.fab && d.fab.length) notes.push('Tissus conseillés : ' + d.fab.map(f => AC.FAB[f] ? AC.FAB[f].name : f).join(', ') + '.');
    return { name: d.name, desc: d.desc, tips: d.tips || [], fabric: F, neck: inst.neck && AC.NECK[inst.neck], notes, sup: d.sup || [] };
  };

  /* Variantes : formes (modules de même famille), couleurs/tissus, ou les deux */
  AC.variants = function (list, mode, n, tpl) {
    const R = AC.rng((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    const pick = a => a[Math.floor(R() * a.length)];
    const out = [];
    for (let v = 0; v < n; v++) {
      let L = JSON.parse(JSON.stringify(list));
      let changedAny = false;
      if (mode !== 'couleur') {
        L = L.map(inst => {
          const d = AC.MOD[inst.id]; if (!d || R() > 0.55) return inst;
          const same = AC.MODS.filter(m => m.cat === d.cat && m.id !== d.id && m.build && !(tpl.g === 'enfant' && m.id === 'corset'));
          if (!same.length) return inst;
          const nd = pick(same); changedAny = true;
          return Object.assign({}, inst, { id: nd.id, tx: 0, ty: 0, s: 1, rot: 0, neck: nd.neck || null });
        });
        const hasSleeve = L.some(x => AC.MOD[x.id] && AC.MOD[x.id].cat === 'manche');
        L.forEach(inst => {
          const d = AC.MOD[inst.id];
          if (d && d.top && R() < 0.5) { inst.neck = pick(AC.NECKS.map(x => x.id).filter(id => !(hasSleeve && STRAPLESS(id)))); changedAny = true; }
          if (d && d.top && hasSleeve && STRAPLESS(inst.neck)) inst.neck = 'carree';
        });
        if (!changedAny && L.length) { const i = Math.floor(R() * L.length), d = AC.MOD[L[i].id]; const same = AC.MODS.filter(m => d && m.cat === d.cat && m.id !== d.id && m.build); if (same.length) { const nd = pick(same); L[i] = Object.assign({}, L[i], { id: nd.id, tx: 0, ty: 0, s: 1, rot: 0, neck: nd.neck || null }); } }
      }
      if (mode !== 'forme') {
        const pals = AC.PALETTES.filter(p => p.id !== 'peau' && p.id !== 'metal');
        const pal = pick(pals), main = pick(pal.c), sec = pick(pal.c.filter(c => c !== main)), acc = pick(['#c9a227', '#e5c07b', '#b7b7b7', '#b87333', '#f5efe2']);
        const prim = [];
        L.forEach(inst => {
          const d = AC.MOD[inst.id]; if (!d) return;
          const isPrim = ['robe', 'corsage', 'jupe', 'bas', 'manche'].includes(d.cat);
          inst.color = isPrim ? main : (R() < 0.5 ? main : sec);
          inst.color2 = sec; inst.trim = acc;
          if (d.fab && d.fab.length && R() < 0.6) inst.fabric = pick(d.fab);
          if (isPrim) prim.push(inst);
        });
        if (prim.length && R() < 0.75) { const f = prim[0].fabric; prim.forEach(i => { if (AC.MOD[i.id].cat !== 'jupe' || R() < 0.7) i.fabric = f; }); }
      }
      out.push(L);
    }
    return out;
  };
  AC.describeVariant = function (base, v) {
    const names = [];
    v.forEach((inst, i) => {
      const b = base[i]; const d = AC.MOD[inst.id]; if (!d) return;
      if (!b || b.id !== inst.id) names.push(d.name);
      else if (b.neck !== inst.neck && inst.neck) names.push(AC.NECK[inst.neck].name);
    });
    const fab = [...new Set(v.map(i => i.fabric).filter(f => f && f !== 'uni'))].map(f => AC.FAB[f].name);
    return (names.length ? names.slice(0, 3).join(' · ') : 'Mêmes formes') + (fab.length ? ' — ' + fab.slice(0, 2).join(', ') : '');
  };

  /* Nomenclature (métrage indicatif, laize 1,40 m, femme adulte) */
  AC.nomenclature = function (list, tpl) {
    const k = tpl.g === 'enfant' ? 0.55 : tpl.g === 'homme' ? 1.15 : 1;
    const rows = new Map(), sup = new Set(), orn = new Map();
    list.forEach(i => {
      const d = AC.MOD[i.id]; if (!d || !d.build) return;
      (d.sup || []).forEach(s => sup.add(s));
      if (['broderie', 'fermeture'].includes(d.cat)) { const key = i.trim; const o = orn.get(key) || { couleur: i.trim, places: [] }; o.places.push(d.name); orn.set(key, o); return; }
      const key = i.fabric + '|' + i.color + '|' + (i.fabric === 'wax' ? i.color2 : '');
      const r = rows.get(key) || { fabric: i.fabric, color: i.color, color2: i.color2, places: [], met: 0 };
      r.places.push(d.name); r.met += (d.met || 0) * k * (i.s || 1) * (i.fabric === 'wax' ? 1.12 : 1);
      rows.set(key, r);
    });
    const fab = [...rows.values()].map(r => ({
      tissu: (AC.FAB[r.fabric] || AC.FAB.uni).name, fabric: r.fabric, couleur: AC.colorName(r.color) + ' (' + r.color + ')', hex: r.color, hex2: r.color2,
      emplacement: r.places.join(', '), metrage: r.met ? (Math.ceil(r.met * 10) / 10).toFixed(1).replace('.', ',') + ' m' : '—', fournisseur: ''
    }));
    return { rows: fab, supplies: [...sup], ornaments: [...orn.values()] };
  };
})();
