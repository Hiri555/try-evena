/* ============================================================
   SS7 — ÉPISODE 2 · LA TRAME
   ============================================================ */
const o = (i) => Object.assign({ o: 0, dx: 0, dy: 0, sc: 1, p: 0, g: 0, ok: 0 }, i);
const EO = 'power4.out', EIO = 'power2.inOut', EB = 'back.out(2.4)', EX = 'expo.out';

function addHeader(tl, S, num, titre, dur, at = 0.25) {
  S.hdr = o(); S.num = num; S.titre = titre;
  tl.to(S.hdr, { o: 1, duration: .55, ease: EO }, at)
    .to(S.hdr, { o: 0, duration: .45, ease: 'power2.in' }, dur - .55);
}
function addOutro(tl, S, dur) {
  S.out = o();
  tl.to(S.out, { o: 1, duration: .40, ease: 'power2.in' }, dur - .40);
}
function fadeOut(g, S) { /* la transition est un glissement de feuille */ }
function addCam(tl, S, moves) {
  S.cam = o({ z: 1, x: 0, y: 0, rot: 0 });
  moves.forEach(m => tl.to(S.cam, Object.assign({ duration: m[1], ease: EIO }, m[2]), m[0]));
}
function derive(f) {
  return { x: Math.sin(f / 237) * 11 + Math.sin(f / 91) * 3,
           y: Math.cos(f / 301) * 8 + Math.cos(f / 117) * 2.5,
           z: 1 + Math.sin(f / 409) * 0.007,
           rot: Math.sin(f / 523) * 0.0016 };
}
function page(g, S) {
  bgPaper(g); carreaux(g, 1); watermark(g);
  if (S && S.hdr) entete(g, S.num, S.titre, S.hdr);
}
function plate(g, img, a, dy = 0, m = 0.05) {
  // dy descend la plate : utile quand une étiquette 3D vient buter
  // contre le bandeau de titre. m est le débord, à augmenter avec dy.
  if (!img || a <= 0) return;
  g.save(); g.globalAlpha = a;
  g.drawImage(img, -W * m, -H * m + dy, W * (1 + 2 * m), H * (1 + 2 * m));
  g.restore();
}
function flecheD(g, x1, y1, x2, y2, u, opt = {}) {
  if (u <= 0) return;
  const { color = C.encre2, lw = 2.4, head = 13 } = opt;
  trait(g, x1, y1, x2, y2, u, { color, lw, amp: 1.2 });
  if (u > .82) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    g.save(); g.globalAlpha = clamp((u - .82) / .18);
    g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x2 - head * Math.cos(a - .42), y2 - head * Math.sin(a - .42));
    g.lineTo(x2, y2);
    g.lineTo(x2 - head * Math.cos(a + .42), y2 - head * Math.sin(a + .42));
    g.stroke(); g.restore();
  }
}
function boite(g, x, y, w, h, titre, sous, u, opt = {}) {
  if (u <= 0) return;
  const { color = C.encre2, fill = '#FBF7EC', ts = 25 } = opt;
  g.save(); g.globalAlpha = u; g.textAlign = 'center';
  g.fillStyle = fill; rr(g, x - w / 2, y - h / 2, w, h, 6); g.fill();
  g.strokeStyle = color; g.lineWidth = 2.6; g.stroke();
  setFont(g, F.d, ts, 700, 1.3); g.fillStyle = C.encre;
  g.fillText(titre, x, y + (sous ? -2 : ts * .36));
  if (sous) { setFont(g, F.b, 15, 500, .3); g.fillStyle = C.encre3; g.fillText(sous, x, y + 22); }
  g.restore();
}
function croix(g, x, y, s, u, color = C.rouge) {
  if (u <= 0) return;
  g.save(); g.globalAlpha = u; g.strokeStyle = color; g.lineWidth = 6 * s; g.lineCap = 'round';
  const d = 18 * s * clamp(u * 1.4);
  g.beginPath(); g.moveTo(x - d, y - d); g.lineTo(x + d, y + d);
  g.moveTo(x + d, y - d); g.lineTo(x - d, y + d); g.stroke();
  g.restore();
}
function coche(g, x, y, s, u, color = C.vert) {
  if (u <= 0) return;
  wire(g, [[x - 20 * s, y], [x - 6 * s, y + 15 * s], [x + 22 * s, y - 18 * s]],
       clamp(u * 1.3), { color, lw: 6 * s });
}

/* ══════════════ la trame de TD3 — 38 octets, le coeur de l'épisode ══════════════
   Une seule grille, réutilisée du chapitre 06 au chapitre 10 : on n'explique
   pas cinq fois la même trame avec cinq dessins différents. */
const TRAME = ['C3','F9','23','C5','4A','B7','C9','0D','13','00','01','10','20','00',
               '0A','00','02','0A','08','04','10','97','04','69','99','19','F7','0A',
               '08','84','15','97','04','99','74','75','03','00'];
/* [premier, dernier, couleur, nom] — 1-indexé comme au tableau */
const ZONES = [[1, 2,  'bleu',   'CORRECTION'],
               [3, 3,  'vert',   'INL'],
               [4, 4,  'or',     'SIO'],
               [5, 8,  'bleuL',  'ÉTIQUETTE'],
               [9, 10, 'encre2', 'CIC'],
               [11,11, 'rouge',  'IAM'],
               [12,16, 'rougeL', 'PARTIE FIXE OBLIGATOIRE'],
               [17,18, 'jaune',  'POINTEURS'],
               [19,27, 'vert',   "N° APPELÉ"],
               [28,37, 'bleu',   "N° APPELANT  ·  facultatif"],
               [38,38, 'encre3', 'FIN']];
const CW = 92, CH_ = 66, CG = 5, NPL = 19;   // case, gouttière, par ligne

function octetXY(n, y0) {                    // n : 1..38
  const i = n - 1, r = Math.floor(i / NPL), c = i % NPL;
  const tot = NPL * CW + (NPL - 1) * CG;
  return [1000 - tot / 2 + c * (CW + CG), y0 + r * (CH_ + 30)];
}
/* u : opacité d'ensemble. hi : {n: {c, u}} met en avant certains octets.
   zone : index de ZONES à étiqueter. dim : les autres s'effacent. */
function octets(g, y0, u, opt = {}) {
  if (u <= 0) return;
  const { hi = {}, dim = 0, zones = null, num = true } = opt;
  g.save(); g.globalAlpha = u; g.textAlign = 'center';
  for (let n = 1; n <= 38; n++) {
    const [x, y] = octetXY(n, y0);
    const h = hi[n];
    const z = ZONES.find(z => n >= z[0] && n <= z[1]);
    const act = h ? 1 : (dim > 0 ? 1 - dim : 1);
    g.globalAlpha = u * act;
    const col = h ? (C[h.c] || C.rouge) : (zones && z ? C[z[2]] : C.encre3);
    g.fillStyle = h ? 'rgba(255,252,244,.96)' : 'rgba(251,247,236,.72)';
    rr(g, x, y, CW, CH_, 5); g.fill();
    g.strokeStyle = col; g.lineWidth = h ? 3.2 : 1.8; g.stroke();
    setFont(g, F.m, h ? 30 : 27, h ? 700 : 500, 1.2);
    g.fillStyle = h ? col : C.encre;
    g.fillText(TRAME[n - 1], x + CW / 2, y + CH_ / 2 + 10);
    if (num) {
      setFont(g, F.m, 15, 500, .6); g.fillStyle = C.encre3;
      g.fillText(String(n), x + CW / 2, y + CH_ + 20);
    }
  }
  if (zones) {
    g.globalAlpha = u;
    ZONES.forEach(z => {
      const [xa, ya] = octetXY(z[0], y0), [xb] = octetXY(z[1], y0);
      if (ya !== octetXY(z[1], y0)[1]) return;          // zone à cheval : on saute
      const x1 = xa, x2 = xb + CW;
      trait(g, x1, ya - 12, x2, ya - 12, u, { color: C[z[2]], lw: 3, amp: 1.2 });
      setFont(g, F.m, 15, 600, 2.4); g.fillStyle = C[z[2]]; g.textAlign = 'center';
      g.fillText(z[3], (x1 + x2) / 2, ya - 22);
    });
  }
  g.restore();
}
/* une flèche de pointeur, qui part d'un octet et arrive sur un autre */
function pointeur(g, a, b, y0, u, col = C.jaune, label = '') {
  if (u <= 0) return;
  const [xa, ya] = octetXY(a, y0), [xb, yb] = octetXY(b, y0);
  const x1 = xa + CW / 2, x2 = xb + CW / 2;
  const yb_ = ya + CH_ + 40, dip = 8;
  g.save(); g.globalAlpha = u;
  g.strokeStyle = col; g.lineWidth = 3; g.setLineDash([9, 7]);
  g.beginPath(); g.moveTo(x1, ya + CH_ + 4);
  g.bezierCurveTo(x1, yb_ + dip, x2, yb_ + dip, x2, yb + CH_ + 4);
  g.stroke(); g.setLineDash([]);
  g.beginPath(); g.moveTo(x2, yb + CH_ + 4);
  g.lineTo(x2 - 8, yb + CH_ + 20); g.lineTo(x2 + 8, yb + CH_ + 20);
  g.closePath(); g.fillStyle = col; g.fill();
  if (label) {
    setFont(g, F.m, 19, 600, 2); g.fillStyle = col; g.textAlign = 'center';
    g.fillText(label, (x1 + x2) / 2, y0 - 26);
  }
  g.restore();
}

/* ══════════════ 00 · L'ACCROCHE — 22.583 s ══════════════ */
const CH0 = {
  dur: 22.583, bl: { dir: 'cahier', from: 0, to: 0 },
  setup(tl, S) {
    const T = i => L(0, i);
    this.bl.from = T(2) - 0.6; this.bl.to = this.bl.from + 7.9;
    addCam(tl, S, [[0.6,2.4,{z:1.05}],[2.0,5.0,{y:-30,z:1.06}],
                   [8.0,1.0,{x:0,y:0,z:0.99}],[8.8,7.4,{z:1.05}],
                   [16.4,1.0,{x:0,y:0,z:0.99}],[17.2,5.0,{z:1.05}]]);
    S.tit = o({ dy: 26 }); S.sous = o(); S.bl = o(); S.hex = o(); S.res = o({ dy: 18 });
    tl.to(S.tit, { o: 1, dy: 0, duration: .8, ease: EO }, T(0) - 0.3)
      .to(S.sous, { o: 1, p: 1, duration: 1.1, ease: 'none' }, T(1) - 0.2)
      .to([S.tit, S.sous], { o: 0, duration: .5 }, T(2) - 0.9)
      .to(S.bl, { o: 1, duration: .9, ease: EO }, T(2) - 0.6)
      .to(S.hex, { o: 1, duration: .6, ease: EO }, T(2) + 1.0)
      .to([S.bl, S.hex], { o: 0, duration: .8 }, T(4) - 0.7)
      .to(S.res, { o: 1, dy: 0, duration: .7, ease: EO }, T(4) - 0.2)
      .to(S.res, { o: 0, duration: .5 }, this.dur - 0.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    page(g, null);
    plate(g, pl, S.bl.o * .92);
    if (S.tit.o > 0) {
      g.save(); g.globalAlpha = S.tit.o; g.textAlign = 'center';
      setFont(g, F.m, 22, 500, 7); g.fillStyle = C.rouge;
      g.fillText('SIGNALISATION SÉMAPHORE N°7  ·  ÉPISODE 3', 1000, 392 + S.tit.dy);
      setFont(g, F.d, 136, 700, 2); g.fillStyle = C.encre;
      g.fillText('LE DÉCODAGE', 1000, 520 + S.tit.dy);
      surligne(g, 560, 492, 880, clamp((S.tit.o - .3) / .7), 58);
      g.restore();
    }
    if (S.sous.o > 0) {
      g.save(); g.globalAlpha = S.sous.o; g.textAlign = 'center';
      setFont(g, F.h, 54, 700, 0); g.fillStyle = C.encre2;
      typeOn(g, "celui-là, tu vas le regarder deux fois", 1000, 640, clamp(S.sous.p * 1.6), 'center');
      g.restore();
    }
    if (S.hex.o > 0) {
      panneau(g, 300, 430, 1400, 240, S.hex.o, .90);
      g.save(); g.globalAlpha = S.hex.o; g.textAlign = 'center';
      setFont(g, F.m, 20, 500, 5); g.fillStyle = C.rouge;
      g.fillText('CE QU\'ON TE DONNE  ·  DOCUMENTS AUTORISÉS', 1000, 492);
      setFont(g, F.m, 34, 600, 3.4); g.fillStyle = C.encre;
      g.fillText('C3 F9 23 C5 4A B7 C9 0D 13 00 01 10 20 00 0A 00 02 0A 08', 1000, 566);
      g.fillText('04 10 97 04 69 99 19 F7 0A 08 84 15 97 04 99 74 75 03 00', 1000, 616);
      g.restore();
    }
    if (S.res.o > 0) {
      g.save(); g.globalAlpha = S.res.o; g.textAlign = 'center';
      setFont(g, F.m, 20, 500, 5); g.fillStyle = C.encre3;
      g.fillText('MAIS D\'ABORD', 1000, 436 + S.res.dy);
      setFont(g, F.d, 60, 700, 1.4); g.fillStyle = C.encre;
      g.fillText('la fonction qu\'on n\'a jamais ouverte', 1000, 522 + S.res.dy);
      setFont(g, F.h, 48, 700, 0); g.fillStyle = C.bleu;
      g.fillText('celle qui garde le réseau debout quand il tombe', 1000, 616 + S.res.dy);
      g.restore();
    }
    entete(g, null, null, null);
  }
};

/* ══════════════ 01 · LA GESTION DU RÉSEAU — 53.250 s ══════════════ */
const CH1 = {
  dur: 53.250, bl: { dir: 'rondpoint', from: 0, to: 0 },
  setup(tl, S) {
    const T = i => L(1, i);
    this.bl.from = T(10) + 0.1; this.bl.to = this.bl.from + 7.9;
    addCam(tl, S, [[0.8,2.4,{z:1.05}],[2.0,8.0,{z:1.06,y:-20}],
                   [11.0,1.2,{x:0,y:0,z:0.99}],[11.8,15.0,{z:1.05,y:30}],
                   [28.0,1.2,{x:0,y:0,z:0.99}],[28.8,10.0,{z:1.04}],
                   [40.0,1.2,{x:0,y:0,z:0.99}],[41.0,11.0,{z:1.05,y:20}]]);
    S.cit = o({ dy: 16 }); S.bl = o(); S.f = [o({ dy: 20 }), o({ dy: 20 }), o({ dy: 20 })];
    addHeader(tl, S, '01', 'LA GESTION DU RÉSEAU SÉMAPHORE', this.dur);
    tl.to(S.cit, { o: 1, dy: 0, duration: .7, ease: EO }, T(0) - 0.3)
      .to(S.cit, { o: 0, duration: .6 }, T(5) - 0.5)
      .to(S.f[0], { o: 1, dy: 0, duration: .55, ease: EB }, T(6) - 0.4)
      .to(S.f[1], { o: 1, dy: 0, duration: .55, ease: EB }, T(9) - 0.4)
      .to(S.bl, { o: 1, duration: .8, ease: EO }, T(10) + 0.1)
      .to(S.bl, { o: 0, duration: .8 }, T(12) - 0.9)
      .to(S.f[2], { o: 1, dy: 0, duration: .55, ease: EB }, T(12) - 0.3)
      .to([...S.f], { o: 0, duration: .5 }, this.dur - 0.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    page(g, null);
    citation(g, 330, 400, ['Le niveau 3 assume deux groupes de fonctions :',
                           "l'orientation des messages,",
                           'et la gestion du réseau sémaphore.'],
             S.cit, { size: 52, source: 'le prof' });
    if (S.cit.o > 0) {
      g.save(); g.globalAlpha = S.cit.o; g.textAlign = 'center';
      setFont(g, F.b, 30, 500, .4); g.fillStyle = C.encre2;
      g.fillText("on a fait l'orientation dans l'épisode 2  —  voici l'autre", 1000, 672);
      g.restore();
    }
    plate(g, pl, S.bl.o * .94);
    if (S.bl.o > 0) {
      g.save(); g.globalAlpha = S.bl.o; g.textAlign = 'center';
      panneau(g, 440, 860, 1120, 150, S.bl.o, .88);
      setFont(g, F.h, 54, 700, 0); g.fillStyle = C.encre;
      g.fillText('« le policier au rond-point »', 1000, 930);
      setFont(g, F.b, 26, 500, .4); g.fillStyle = C.encre2;
      g.fillText("il répartit le trafic pour ne saturer aucun canal", 1000, 976);
      g.restore();
    }
    const FN = [['GESTION DES CANAUX', 'LOCAL', C.bleu,
                 'surveille chaque canal, un par un',
                 'canal en panne  →  bascule sur un canal de secours'],
                ['GESTION DU TRAFIC', 'ENSEMBLE', C.or,
                 'répartit le trafic sur tous les canaux',
                 'pour ne pas en saturer un seul  —  le policier au rond-point'],
                ['GESTION DES ROUTES', 'GLOBAL  ·  quasi-associé', C.vert,
                 'vue d\'ensemble du réseau',
                 'un PTS tombe  →  elle diffuse les nouvelles routes']];
    S.f.forEach((s, i) => {
      if (s.o <= 0) return;
      const y = 332 + i * 192 + s.dy;
      g.save(); g.globalAlpha = s.o;
      g.fillStyle = 'rgba(251,247,236,.80)'; rr(g, 250, y, 1500, 160, 8); g.fill();
      g.strokeStyle = FN[i][2]; g.lineWidth = 3; g.stroke();
      g.fillStyle = FN[i][2]; rr(g, 250, y, 10, 160, 4); g.fill();
      g.textAlign = 'left';
      setFont(g, F.d, 36, 700, 1.2); g.fillStyle = C.encre;
      g.fillText(FN[i][0], 300, y + 58);
      setFont(g, F.m, 17, 600, 3); g.fillStyle = FN[i][2];
      g.fillText(FN[i][1], 302, y + 92);
      setFont(g, F.b, 25, 500, .3); g.fillStyle = C.encre2;
      g.fillText(FN[i][3], 900, y + 60);
      setFont(g, F.b, 23, 400, .3); g.fillStyle = C.encre3;
      g.fillText(FN[i][4], 900, y + 100);
      g.restore();
    });
    // le plan filmé passe sous le bandeau : on lui rend un fond de papier
    if (S.bl.o > 0) {
      g.save(); g.globalAlpha = S.bl.o * .93;
      g.fillStyle = 'rgba(237,228,210,.97)';
      rr(g, -40, 40, 1060, 96, 10); g.fill();
      g.restore();
    }
    entete(g, S.num, S.titre, S.hdr);
  }
};

/* ══════════════ 02 · LA TRAME DE GESTION — 31.833 s ══════════════ */
const CH2 = {
  dur: 31.833,
  setup(tl, S) {
    const T = i => L(2, i);
    addCam(tl, S, [[0.8,2.4,{z:1.05}],[2.0,7.0,{z:1.06,y:-20}],
                   [10.0,1.2,{x:0,y:0,z:0.99}],[10.8,9.0,{z:1.05,y:30}],
                   [20.4,1.2,{x:0,y:0,z:0.99}],[21.2,9.0,{z:1.05}]]);
    S.ins = o({ sc: 1.5 }); S.cons = o({ dy: 16 }); S.tr = o(); S.ch = [];
    for (let i = 0; i < 6; i++) S.ch.push(o({ dy: 18 }));
    addHeader(tl, S, '02', 'LA TRAME DE GESTION', this.dur);
    tl.to(S.ins, { o: 1, sc: 1, duration: .6, ease: EB }, T(2) - 0.4)
      .to(S.cons, { o: 1, dy: 0, duration: .6, ease: EO }, T(3) - 0.3)
      .to([S.ins, S.cons], { o: 0, duration: .5 }, T(5) - 0.5)
      .to(S.tr, { o: 1, duration: .5, ease: EO }, T(5) - 0.2);
    S.ch.forEach((s, i) => tl.to(s, { o: 1, dy: 0, duration: .4, ease: EB },
                                 T(5) + 0.3 + i * ((LE(2, 7) - T(5) - 1.4) / 6)));
    tl.to([S.tr, ...S.ch], { o: 0, duration: .5 }, this.dur - 0.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.ins.o > 0) {
      g.save(); g.globalAlpha = S.ins.o; g.textAlign = 'center';
      g.translate(1000, 430); g.scale(S.ins.sc, S.ins.sc); g.translate(-1000, -430);
      setFont(g, F.m, 20, 500, 5); g.fillStyle = C.encre3;
      g.fillText("L'INDICATEUR DE SOUS-SYSTÈME", 1000, 392);
      setFont(g, F.m, 86, 700, 8); g.fillStyle = C.rouge;
      g.fillText('INS = 0000', 1000, 478);
      g.restore();
    }
    if (S.cons.o > 0) {
      g.save(); g.globalAlpha = S.cons.o; g.textAlign = 'center';
      setFont(g, F.d, 46, 700, 1); g.fillStyle = C.encre;
      g.fillText('ce message ne dépasse jamais le niveau 3', 1000, 596 + S.cons.dy);
      setFont(g, F.h, 50, 700, 0); g.fillStyle = C.bleu;
      g.fillText('donc : pas d\'étiquette téléphonique', 1000, 686 + S.cons.dy);
      g.restore();
    }
    if (S.tr.o > 0) {
      g.save(); g.globalAlpha = S.tr.o; g.textAlign = 'center';
      setFont(g, F.m, 20, 500, 5); g.fillStyle = C.rouge;
      g.fillText('TRAME DE GESTION  ·  INS = 0000', 1000, 376);
      g.restore();
    }
    const CHp = [['OCTET', 'de service', 250, C.or],
                 ['INS=0000', '+ DSS', 290, C.rouge],
                 ['CPD', '14 bits', 250, C.bleu],
                 ['CPO', '14 bits', 250, C.bleu],
                 ['COC', '4 bits · n° du canal', 330, C.jaune],
                 ['H0 · H1', '4+4 bits · le problème', 360, C.vert]];
    if (S.ch.some(s => s.o > 0)) {
      const GA = 12, TOT = CHp.reduce((a, b) => a + b[2], 0) + GA * 5;
      let x = 1000 - TOT / 2;
      S.ch.forEach((s, i) => {
        if (s.o > 0) {
          const [nm, sub, w, col] = CHp[i];
          g.save(); g.globalAlpha = s.o; g.textAlign = 'center';
          g.fillStyle = 'rgba(251,247,236,.86)';
          rr(g, x, 430 + s.dy, w, 116, 6); g.fill();
          g.strokeStyle = col; g.lineWidth = 3; g.stroke();
          setFont(g, F.d, 30, 700, 1.2); g.fillStyle = C.encre;
          g.fillText(nm, x + w / 2, 480 + s.dy);
          setFont(g, F.b, 18, 500, .3); g.fillStyle = C.encre3;
          g.fillText(sub, x + w / 2, 514 + s.dy);
          g.restore();
        }
        x += CHp[i][2] + GA;
      });
      if (S.ch[5].o > 0) {
        g.save(); g.globalAlpha = S.ch[5].o; g.textAlign = 'center';
        setFont(g, F.h, 46, 700, 0); g.fillStyle = C.encre2;
        g.fillText('le COC remplace le SCS  —  et H0/H1 dit quel problème régler', 1000, 640);
        g.restore();
      }
    }
    entete(g, S.num, S.titre, S.hdr);
  }
};

/* ══════════════ 03 · COC, CIC, SCS — 32.542 s ══════════════ */
const CH3 = {
  dur: 32.542,
  setup(tl, S) {
    const T = i => L(3, i);
    addCam(tl, S, [[0.8,2.4,{z:1.05}],[2.0,8.0,{z:1.06,y:-20}],
                   [11.0,1.2,{x:0,y:0,z:0.99}],[11.8,14.0,{z:1.05,y:20}],
                   [26.4,1.2,{x:0,y:0,z:0.99}],[27.2,5.0,{z:1.04}]]);
    S.t = o(); S.c = [o({ dy: 22 }), o({ dy: 22 }), o({ dy: 22 })]; S.note = o({ sc: 1.3 });
    addHeader(tl, S, '03', 'COC  ·  CIC  ·  SCS', this.dur);
    tl.to(S.t, { o: 1, duration: .5, ease: EO }, T(0) - 0.3)
      .to(S.c[0], { o: 1, dy: 0, duration: .5, ease: EB }, T(2) - 0.4)
      .to(S.c[1], { o: 1, dy: 0, duration: .5, ease: EB }, T(3) - 0.4)
      .to(S.c[2], { o: 1, dy: 0, duration: .5, ease: EB }, T(5) - 0.4)
      .to(S.note, { o: 1, sc: 1, duration: .6, ease: EB }, T(7) - 0.4)
      .to([S.t, ...S.c, S.note], { o: 0, duration: .5 }, this.dur - 0.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.t.o > 0) {
      g.save(); g.globalAlpha = S.t.o; g.textAlign = 'center';
      setFont(g, F.h, 54, 700, 0); g.fillStyle = C.encre2;
      g.fillText('trois sigles de quatre bits — et tout le monde les confond', 1000, 330);
      g.restore();
    }
    const CA = [['SCS', 'MESSAGE NORMAL', C.bleu, "il choisit l'itinéraire",
                 'sélection du canal sémaphore'],
                ['COC', 'MESSAGE DE GESTION', C.jaune, 'il désigne le canal à réparer',
                 'numéro du canal sémaphore concerné'],
                ['CIC', 'LA VOIX', C.rouge, "c'est le circuit téléphonique",
                 "code d'identification du circuit"]];
    S.c.forEach((s, i) => {
      if (s.o <= 0) return;
      const x = 160 + i * 570, y = 420 + s.dy;
      g.save(); g.globalAlpha = s.o; g.textAlign = 'center';
      g.fillStyle = 'rgba(251,247,236,.86)'; rr(g, x, y, 520, 290, 8); g.fill();
      g.strokeStyle = CA[i][2]; g.lineWidth = 3.2; g.stroke();
      setFont(g, F.m, 17, 600, 3.6); g.fillStyle = CA[i][2];
      g.fillText(CA[i][1], x + 260, y + 48);
      setFont(g, F.d, 92, 700, 3); g.fillStyle = C.encre;
      g.fillText(CA[i][0], x + 260, y + 146);
      setFont(g, F.b, 27, 600, .3); g.fillStyle = C.encre;
      g.fillText(CA[i][3], x + 260, y + 204);
      setFont(g, F.b, 20, 400, .3); g.fillStyle = C.encre3;
      g.fillText(CA[i][4], x + 260, y + 246);
      g.restore();
    });
    if (S.note.o > 0) {
      g.save(); g.globalAlpha = S.note.o; g.textAlign = 'center';
      g.translate(1000, 800); g.scale(S.note.sc, S.note.sc); g.translate(-1000, -800);
      g.fillStyle = 'rgba(242,193,78,.22)'; rr(g, 400, 756, 1200, 112, 8); g.fill();
      g.strokeStyle = C.jaune; g.lineWidth = 2.6; g.stroke();
      setFont(g, F.m, 30, 600, 2); g.fillStyle = C.encre;
      g.fillText('COC = 0000  →  « tous les canaux »', 1000, 800);
      setFont(g, F.b, 24, 500, .3); g.fillStyle = C.encre2;
      g.fillText('il ne reste donc que 15 canaux adressables individuellement', 1000, 840);
      g.restore();
    }
    entete(g, S.num, S.titre, S.hdr);
  }
};

/* ══════════════ 04 · LES ORDRES DE SECOURS — 48.417 s ══════════════ */
const CH4 = {
  dur: 48.417,
  setup(tl, S) {
    const T = i => L(4, i);
    addCam(tl, S, [[0.8,2.4,{z:1.05}],[2.0,8.0,{z:1.06,y:-20}],
                   [11.0,1.2,{x:0,y:0,z:0.99}],[11.8,14.0,{z:1.05,y:40}],
                   [26.6,1.2,{x:0,y:0,z:0.99}],[27.4,11.0,{z:1.05}],
                   [39.0,1.2,{x:0,y:0,z:0.99}],[39.8,8.0,{z:1.04}]]);
    S.tab = o(); S.r = []; for (let i = 0; i < 6; i++) S.r.push(o({ dx: -22 }));
    S.gram = o(); S.cit = o({ dy: 16 }); S.cle = o({ dy: 16 });
    addHeader(tl, S, '04', 'LES ORDRES DE SECOURS', this.dur);
    tl.to(S.tab, { o: 1, duration: .5, ease: EO }, T(1) - 0.3);
    [T(2) - 0.3, T(2) + 1.5, T(3) - 0.3, T(3) + 1.8, T(4) - 0.3, T(4) + 2.1]
      .forEach((a, i) => tl.to(S.r[i], { o: 1, dx: 0, duration: .4, ease: EO }, a));
    tl.to(S.gram, { o: 1, duration: .5, ease: EO }, T(5) - 0.3)
      .to([S.tab, ...S.r, S.gram], { o: 0, duration: .5 }, T(7) - 0.6)
      .to(S.cit, { o: 1, dy: 0, duration: .7, ease: EO }, T(7) - 0.4)
      .to(S.cit, { o: 0, duration: .5 }, T(10) - 0.5)
      .to(S.cle, { o: 1, dy: 0, duration: .6, ease: EO }, T(10) - 0.2)
      .to(S.cle, { o: 0, duration: .5 }, this.dur - 0.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.tab.o > 0) {
      g.save(); g.globalAlpha = S.tab.o; g.textAlign = 'center';
      setFont(g, F.m, 20, 500, 5); g.fillStyle = C.encre3;
      g.fillText('CODÉS SUR H0 ET H1', 1000, 346);
      g.restore();
    }
    const MS = [['1', '1', 'PCO', 'ordre de passage sur canal de secours', C.bleu],
                ['2', '1', 'PCA', 'accusé de passage sur canal de secours', C.bleuL],
                ['1', '2', 'PUO', 'ordre de passage URGENT', C.rouge],
                ['2', '2', 'PUA', 'accusé de passage urgent', C.rougeL],
                ['5', '2', 'RCO', 'ordre de retour sur canal normal', C.vert],
                ['6', '1', 'RCA', 'accusé de retour sur canal normal', C.vert]];
    S.r.forEach((s, i) => {
      if (s.o <= 0) return;
      const y = 396 + i * 84;
      g.save(); g.globalAlpha = s.o; g.textAlign = 'left';
      g.fillStyle = i % 2 ? 'rgba(251,247,236,.52)' : 'rgba(251,247,236,.80)';
      rr(g, 330 + s.dx, y, 1340, 72, 5); g.fill();
      g.strokeStyle = MS[i][4]; g.lineWidth = 2.2; g.stroke();
      g.textAlign = 'center';
      setFont(g, F.m, 26, 600, 1.6); g.fillStyle = C.encre2;
      g.fillText('H1 ' + MS[i][0], 410 + s.dx, y + 46);
      g.fillText('H0 ' + MS[i][1], 540 + s.dx, y + 46);
      setFont(g, F.d, 40, 700, 2); g.fillStyle = MS[i][4];
      g.fillText(MS[i][2], 700 + s.dx, y + 50);
      g.textAlign = 'left';
      setFont(g, F.b, 26, 500, .3); g.fillStyle = C.encre;
      g.fillText(MS[i][3], 800 + s.dx, y + 46);
      g.restore();
    });
    if (S.gram.o > 0) {
      g.save(); g.globalAlpha = S.gram.o; g.textAlign = 'center';
      setFont(g, F.h, 52, 700, 0); g.fillStyle = C.encre;
      g.fillText('toujours la même grammaire : un ordre, un accusé', 1000, 950);
      g.restore();
    }
    citation(g, 330, 420, ["Si un canal est trop encombré, l'autre extrémité envoie une",
                           "trame sémaphore d'état occupé. Le niveau 3 considère le canal",
                           "encombré, et fait passer tout le faisceau auquel il appartient",
                           "en état encombré."],
             S.cit, { size: 40, source: 'le prof' });
    if (S.cle.o > 0) {
      g.save(); g.globalAlpha = S.cle.o; g.textAlign = 'center';
      g.fillStyle = 'rgba(200,65,43,.12)'; rr(g, 300, 448 + S.cle.dy, 1400, 160, 8); g.fill();
      g.strokeStyle = C.rouge; g.lineWidth = 3; g.stroke();
      setFont(g, F.m, 19, 600, 4); g.fillStyle = C.rouge;
      g.fillText("L'IDÉE À RETENIR", 1000, 496 + S.cle.dy);
      setFont(g, F.d, 42, 700, .8); g.fillStyle = C.encre;
      g.fillText('la décision de détourner le trafic appartient', 1000, 552 + S.cle.dy);
      g.fillText('au niveau gestion, pas au canal lui-même', 1000, 596 + S.cle.dy);
      g.restore();
    }
    entete(g, S.num, S.titre, S.hdr);
  }
};

/* ══════════════ 05 · ANATOMIE D'UN MESSAGE DE NIVEAU 4 — 40.083 s ══════════════ */
const CH5 = {
  dur: 40.083,
  setup(tl, S) {
    const T = i => L(5, i);
    addCam(tl, S, [[0.8,2.4,{z:1.05}],[2.0,9.0,{z:1.06,y:-20}],
                   [12.0,1.2,{x:0,y:0,z:0.99}],[12.8,13.0,{z:1.05,y:30}],
                   [26.4,1.2,{x:0,y:0,z:0.99}],[27.2,10.0,{z:1.05}]]);
    S.z = [o({ dy: 20 }), o({ dy: 20 })]; S.ch = [o({ dx: -18 }), o({ dx: -18 })];
    S.reg = o({ dy: 14 }); S.ptr = o(); S.ref = o({ sc: .94 });
    addHeader(tl, S, '05', 'ANATOMIE D\'UN MESSAGE DE NIVEAU 4', this.dur);
    tl.to(S.z[0], { o: 1, dy: 0, duration: .5, ease: EB }, T(3) - 0.4)
      .to(S.z[1], { o: 1, dy: 0, duration: .5, ease: EB }, T(3) + 1.6)
      .to(S.ch[0], { o: 1, dx: 0, duration: .45, ease: EO }, T(4) - 0.3)
      .to(S.ch[1], { o: 1, dx: 0, duration: .45, ease: EO }, T(4) + 1.4)
      .to(S.reg, { o: 1, dy: 0, duration: .5, ease: EO }, T(5) - 0.3)
      .to(S.ptr, { o: 1, duration: .5, ease: EO }, T(6) - 0.3)
      .to([...S.z, ...S.ch, S.reg, S.ptr], { o: 0, duration: .5 }, T(7) - 0.5)
      .to(S.ref, { o: 1, sc: 1, duration: .7, ease: EB }, T(7) - 0.2)
      .to(S.ref, { o: 0, duration: .5 }, this.dur - 0.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    const ZN = [['SOUS-DOMAINE OBLIGATOIRE', 'toujours là', C.rouge, 300],
                ['SOUS-DOMAINE FACULTATIF', 'parfois', C.bleu, 1060]];
    S.z.forEach((s, i) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o; g.textAlign = 'center';
      g.fillStyle = 'rgba(251,247,236,.80)';
      rr(g, ZN[i][3], 360 + s.dy, 640, 150, 8); g.fill();
      g.strokeStyle = ZN[i][2]; g.lineWidth = 3;
      if (i) g.setLineDash([12, 8]);
      g.stroke(); g.setLineDash([]);
      setFont(g, F.d, 30, 700, 1.2); g.fillStyle = C.encre;
      g.fillText(ZN[i][0], ZN[i][3] + 320, 420 + s.dy);
      setFont(g, F.b, 22, 500, .3); g.fillStyle = ZN[i][2];
      g.fillText(ZN[i][1], ZN[i][3] + 320, 462 + s.dy);
      g.restore();
    });
    const CF = [['CHAMPS DE LONGUEUR FIXE', 'on sait où ils sont', C.vert],
                ['CHAMPS DE LONGUEUR VARIABLE', 'précédés de leur longueur', C.jaune]];
    S.ch.forEach((s, i) => {
      if (s.o <= 0) return;
      const y = 556 + i * 92;
      g.save(); g.globalAlpha = s.o; g.textAlign = 'left';
      g.fillStyle = CF[i][2]; rr(g, 300 + s.dx, y, 10, 72, 4); g.fill();
      setFont(g, F.d, 30, 700, 1); g.fillStyle = C.encre;
      g.fillText(CF[i][0], 336 + s.dx, y + 34);
      setFont(g, F.b, 22, 400, .3); g.fillStyle = C.encre3;
      g.fillText(CF[i][1], 336 + s.dx, y + 64);
      g.restore();
    });
    if (S.reg.o > 0) {
      g.save(); g.globalAlpha = S.reg.o; g.textAlign = 'center';
      setFont(g, F.h, 50, 700, 0); g.fillStyle = C.encre;
      g.fillText("règle d'or : un champ variable est toujours précédé de sa longueur",
                 1000, 790 + S.reg.dy);
      g.restore();
    }
    if (S.ptr.o > 0) {
      g.save(); g.globalAlpha = S.ptr.o; g.textAlign = 'center';
      setFont(g, F.b, 30, 500, .4); g.fillStyle = C.bleu;
      g.fillText('et on y accède par un pointeur : « il commence N octets plus loin »',
                 1000, 862);
      g.restore();
    }
    if (S.ref.o > 0) {
      fiche(g, 300, 380, 1400, 320, S.ref, (gg, x, y, w, h, u) => {
        gg.textAlign = 'center';
        setFont(gg, F.m, 19, 600, 4); gg.fillStyle = C.rouge;
        gg.fillText('LE RÉFLEXE AVANT DE DÉCODER', x + w / 2, y + 58);
        setFont(gg, F.d, 46, 700, 1); gg.fillStyle = C.encre;
        gg.fillText("lire l'INS — il dit quelle norme ouvrir", x + w / 2, y + 130);
        setFont(gg, F.m, 40, 600, 2); gg.fillStyle = C.bleu;
        gg.fillText('SSUT  →  Q.723', x + w / 2 - 300, y + 214);
        gg.fillStyle = C.vert;
        gg.fillText('SSUR  →  Q.763', x + w / 2 + 300, y + 214);
        setFont(gg, F.b, 24, 500, .3); gg.fillStyle = C.encre2;
        gg.fillText('se tromper de table, c\'est tout décoder faux', x + w / 2, y + 274);
      });
    }
    entete(g, S.num, S.titre, S.hdr);
  }
};

/* ══════════════ 06 · POSER LES OCTETS — 31.583 s ══════════════ */
const GRP = [[[1, 2], 'bleu'], [[3, 3], 'vert'], [[4, 4], 'or'],
             [[5, 8], 'bleuL'], [[9, 10], 'encre2'], [[11, 38], 'rouge']];
function hiDe(etats) {
  const hi = {};
  etats.forEach((s, i) => {
    if (s.o <= 0.45) return;
    const [[a, b], c] = GRP[i];
    for (let n = a; n <= b; n++) hi[n] = { c };
  });
  return hi;
}
const CH6 = {
  dur: 31.583,
  setup(tl, S) {
    const T = i => L(6, i);
    addCam(tl, S, [[0.8,2.4,{z:1.04}],[2.0,9.0,{z:1.05,y:-14}],
                   [12.0,1.2,{x:0,y:0,z:0.99}],[12.8,12.0,{z:1.05,y:24}],
                   [25.4,1.2,{x:0,y:0,z:0.99}],[26.2,5.0,{z:1.04}]]);
    S.gr = o(); S.g = []; for (let i = 0; i < 6; i++) S.g.push(o());
    S.onze = o({ sc: 1.4 });
    addHeader(tl, S, '06', 'POSER LES 38 OCTETS', this.dur);
    tl.to(S.gr, { o: 1, duration: .8, ease: EO }, T(0) - 0.3);
    [T(2) - 0.3, T(3) - 0.3, T(3) + 1.8, T(4) - 0.3, T(5) - 0.3, T(6) - 0.3]
      .forEach((a, i) => tl.to(S.g[i], { o: 1, duration: .4, ease: EO }, a));
    tl.to(S.onze, { o: 1, sc: 1, duration: .6, ease: EB }, T(7) - 0.3)
      .to([S.gr, ...S.g, S.onze], { o: 0, duration: .5 }, this.dur - 0.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    octets(g, 430, S.gr.o, { hi: hiDe(S.g), dim: 0.45 });
    const LB = [['1-2', 'CORRECTION  ·  niveau 2', C.bleu],
                ['3', "INL  ·  l'indicateur de longueur", C.vert],
                ['4', 'SIO  ·  octet de service', C.or],
                ['5-8', "ÉTIQUETTE D'ACHEMINEMENT", C.bleuL],
                ['9-10', 'CIC  ·  circuit téléphonique', C.encre2],
                ['11 → 38', 'LE MESSAGE DE NIVEAU 4', C.rouge]];
    let y = 660;
    S.g.forEach((s, i) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o; g.textAlign = 'left';
      setFont(g, F.m, 26, 700, 1.6); g.fillStyle = LB[i][2];
      g.fillText('octets ' + LB[i][0], 430, y);
      setFont(g, F.b, 26, 500, .3); g.fillStyle = C.encre;
      g.fillText(LB[i][1], 680, y);
      g.restore();
      y += 48;
    });
    if (S.onze.o > 0) {
      g.save(); g.globalAlpha = S.onze.o; g.textAlign = 'center';
      g.translate(1000, 980); g.scale(S.onze.sc, S.onze.sc); g.translate(-1000, -980);
      setFont(g, F.h, 56, 700, 0); g.fillStyle = C.rouge;
      g.fillText("onze octets avant d'arriver au message", 1000, 996);
      g.restore();
    }
    entete(g, S.num, S.titre, S.hdr);
  }
};

/* ══════════════ 07 · Q1 — LA LONGUEUR — 37.917 s ══════════════ */
const CH7 = {
  dur: 37.917,
  setup(tl, S) {
    const T = i => L(7, i);
    addCam(tl, S, [[0.8,2.4,{z:1.04}],[2.0,10.0,{z:1.06,y:-20}],
                   [13.0,1.2,{x:0,y:0,z:0.99}],[13.8,14.0,{z:1.05,y:26}],
                   [28.6,1.2,{x:0,y:0,z:0.99}],[29.4,7.0,{z:1.04}]]);
    S.q = o({ dy: 16 }); S.gr = o(); S.bin = o(); S.coup = o(); S.som = o();
    S.rep = o({ sc: 1.3 }); S.ver = o({ dy: 14 });
    addHeader(tl, S, '07', 'QUESTION 1  ·  LA LONGUEUR', this.dur);
    tl.to(S.q, { o: 1, dy: 0, duration: .6, ease: EO }, T(0) - 0.3)
      .to(S.gr, { o: 1, duration: .6, ease: EO }, T(1) - 0.4)
      .to(S.bin, { o: 1, duration: .5, ease: EO }, T(3) - 0.3)
      .to(S.coup, { o: 1, duration: .5, ease: EO }, T(4) - 0.3)
      .to(S.som, { o: 1, duration: .5, ease: EO }, T(5) - 0.3)
      .to(S.rep, { o: 1, sc: 1, duration: .6, ease: EB }, T(6) - 0.3)
      .to(S.ver, { o: 1, dy: 0, duration: .5, ease: EO }, T(7) - 0.3)
      .to([S.q, S.gr, S.bin, S.coup, S.som, S.rep, S.ver], { o: 0, duration: .5 },
          this.dur - 0.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.q.o > 0) {
      g.save(); g.globalAlpha = S.q.o; g.textAlign = 'center';
      setFont(g, F.h, 54, 700, 0); g.fillStyle = C.encre;
      g.fillText('quelle est la longueur du champ information ?', 1000, 336 + S.q.dy);
      g.restore();
    }
    octets(g, 400, S.gr.o, { hi: { 3: { c: 'vert' } }, dim: 0.62, num: true });
    if (S.bin.o > 0) {
      g.save(); g.globalAlpha = S.bin.o; g.textAlign = 'center';
      setFont(g, F.m, 56, 700, 5); g.fillStyle = C.encre;
      g.fillText('0x23', 640, 700);
      setFont(g, F.b, 30, 500, .4); g.fillStyle = C.encre3;
      g.fillText('→', 790, 694);
      setFont(g, F.m, 56, 700, 5); g.fillStyle = C.encre;
      g.fillText('0010 0011', 1060, 700);
      g.restore();
    }
    if (S.coup.o > 0) {
      g.save(); g.globalAlpha = S.coup.o; g.textAlign = 'center';
      g.fillStyle = 'rgba(200,65,43,.14)'; rr(g, 846, 652, 216, 66, 6); g.fill();
      g.strokeStyle = C.rouge; g.lineWidth = 2.6; g.setLineDash([8, 6]); g.stroke();
      g.setLineDash([]);
      setFont(g, F.m, 19, 600, 2.6); g.fillStyle = C.rouge;
      g.fillText('ON IGNORE', 954, 630);
      setFont(g, F.b, 24, 500, .3); g.fillStyle = C.vert;
      g.fillText('on garde les 6 bits utiles  :  10 0011', 1340, 762);
      g.restore();
    }
    if (S.som.o > 0) {
      g.save(); g.globalAlpha = S.som.o; g.textAlign = 'center';
      setFont(g, F.m, 40, 600, 3); g.fillStyle = C.encre2;
      g.fillText('32  +  2  +  1', 1000, 836);
      g.restore();
    }
    if (S.rep.o > 0) {
      g.save(); g.globalAlpha = S.rep.o; g.textAlign = 'center';
      g.translate(1000, 916); g.scale(S.rep.sc, S.rep.sc); g.translate(-1000, -916);
      setFont(g, F.d, 76, 700, 1.4); g.fillStyle = C.vert;
      g.fillText('champ information  =  35 octets', 1000, 932);
      surligne(g, 540, 902, 920, clamp((S.rep.o - .3) / .7), 52);
      g.restore();
    }
    if (S.ver.o > 0) {
      g.save(); g.globalAlpha = S.ver.o; g.textAlign = 'center';
      setFont(g, F.h, 44, 700, 0); g.fillStyle = C.encre2;
      g.fillText('vérification :  2 + 1 + 35 = 38  —  la trame entière', 1000, 1012 + S.ver.dy);
      g.restore();
    }
    entete(g, S.num, S.titre, S.hdr);
  }
};

/* ══════════════ 08 · Q2 — LA CATÉGORIE — 38.250 s ══════════════ */
const CH8 = {
  dur: 38.250,
  setup(tl, S) {
    const T = i => L(8, i);
    addCam(tl, S, [[0.8,2.4,{z:1.04}],[2.0,10.0,{z:1.06,y:-20}],
                   [13.0,1.2,{x:0,y:0,z:0.99}],[13.8,13.0,{z:1.05,y:26}],
                   [27.6,1.2,{x:0,y:0,z:0.99}],[28.4,8.0,{z:1.04}]]);
    S.q = o({ dy: 16 }); S.ord = o(); S.p = []; for (let i = 0; i < 5; i++) S.p.push(o({ dy: 14 }));
    S.gr = o(); S.tab = o({ sc: .94 }); S.aut = o();
    addHeader(tl, S, '08', 'QUESTION 2  ·  LA CATÉGORIE', this.dur);
    tl.to(S.q, { o: 1, dy: 0, duration: .6, ease: EO }, T(0) - 0.3)
      .to(S.ord, { o: 1, duration: .5, ease: EO }, T(1) - 0.3);
    [T(2) - 0.2, T(2) + 1.3, T(3) - 0.2, T(3) + 1.4, T(3) + 2.6]
      .forEach((a, i) => tl.to(S.p[i], { o: 1, dy: 0, duration: .35, ease: EB }, a));
    tl.to(S.gr, { o: 1, duration: .5, ease: EO }, T(4) - 0.4)
      .to(S.tab, { o: 1, sc: 1, duration: .6, ease: EB }, T(5) - 0.3)
      .to(S.aut, { o: 1, duration: .5, ease: EO }, T(7) - 0.3)
      .to([S.q, S.ord, ...S.p, S.gr, S.tab, S.aut], { o: 0, duration: .5 }, this.dur - 0.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.q.o > 0) {
      g.save(); g.globalAlpha = S.q.o; g.textAlign = 'center';
      setFont(g, F.h, 54, 700, 0); g.fillStyle = C.encre;
      g.fillText('quelle est la catégorie du demandeur ?', 1000, 330 + S.q.dy);
      g.restore();
    }
    if (S.ord.o > 0) {
      g.save(); g.globalAlpha = S.ord.o; g.textAlign = 'center';
      setFont(g, F.m, 19, 500, 4.4); g.fillStyle = C.encre3;
      g.fillText('LA PARTIE FIXE OBLIGATOIRE, DANS L\'ORDRE DE LA NORME', 1000, 404);
      g.restore();
    }
    const PF = [['11', 'type de message', C.rouge], ['12', 'nature connexion', C.encre2],
                ['13-14', "indicateurs d'appel", C.encre2],
                ['15', 'CATÉGORIE', C.jaune], ['16', 'support', C.encre2]];
    S.p.forEach((s, i) => {
      if (s.o <= 0) return;
      const w = 300, GA = 14, TOT = 5 * w + 4 * GA, x = 1000 - TOT / 2 + i * (w + GA);
      g.save(); g.globalAlpha = s.o; g.textAlign = 'center';
      g.fillStyle = i === 3 ? 'rgba(242,193,78,.26)' : 'rgba(251,247,236,.78)';
      rr(g, x, 440 + s.dy, w, 96, 6); g.fill();
      g.strokeStyle = PF[i][2]; g.lineWidth = i === 3 ? 3.4 : 2.2; g.stroke();
      setFont(g, F.m, 20, 600, 2); g.fillStyle = C.encre3;
      g.fillText('octet ' + PF[i][0], x + w / 2, 474 + s.dy);
      setFont(g, F.d, i === 3 ? 28 : 24, 700, 1); g.fillStyle = C.encre;
      g.fillText(PF[i][1], x + w / 2, 512 + s.dy);
      g.restore();
    });
    octets(g, 584, S.gr.o, { hi: { 15: { c: 'jaune' } }, dim: 0.66, num: true });
    if (S.tab.o > 0) {
      fiche(g, 340, 800, 1320, 230, S.tab, (gg, x, y, w, h, u) => {
        gg.textAlign = 'center';
        setFont(gg, F.m, 19, 600, 4); gg.fillStyle = C.rouge;
        gg.fillText('TABLE « CATÉGORIE DE L\'APPELANT »  ·  Q.763', x + w / 2, y + 50);
        setFont(gg, F.m, 48, 700, 4); gg.fillStyle = C.encre;
        gg.fillText('0x0A  =  0000 1010', x + w / 2, y + 122);
        setFont(gg, F.d, 50, 700, 1); gg.fillStyle = C.vert;
        gg.fillText('abonné appelant ordinaire', x + w / 2, y + 190);
      });
    }
    if (S.aut.o > 0) {
      g.save(); g.globalAlpha = S.aut.o; g.textAlign = 'center';
      setFont(g, F.b, 25, 500, .3); g.fillStyle = C.encre3;
      g.fillText('pour information  ·  0x0B = abonné prioritaire  ·  0x0D = appel d\'essai',
                 1000, 1064);
      g.restore();
    }
    entete(g, S.num, S.titre, S.hdr);
  }
};

/* ══════════════ 09 · Q3 ET Q4 — LES DEUX NUMÉROS — 71.750 s ══════════════ */
const CH9 = {
  dur: 71.750,
  setup(tl, S) {
    const T = i => L(9, i);
    addCam(tl, S, [[0.8,2.4,{z:1.04}],[2.0,10.0,{z:1.05,y:-16}],
                   [13.0,1.2,{x:0,y:0,z:0.99}],[13.8,16.0,{z:1.05,y:22}],
                   [30.4,1.2,{x:0,y:0,z:0.99}],[31.2,14.0,{z:1.05}],
                   [46.0,1.2,{x:0,y:0,z:0.99}],[46.8,14.0,{z:1.05,y:20}],
                   [61.4,1.2,{x:0,y:0,z:0.99}],[62.2,8.0,{z:1.04}]]);
    S.q = o({ dy: 16 }); S.gr = o(); S.p1 = o(); S.ent = o({ dy: 14 });
    S.bcd = o({ sc: 1.3 }); S.n1 = o({ dy: 16 }); S.st = o();
    S.p2 = o(); S.n2 = o({ dy: 16 });
    addHeader(tl, S, '09', 'QUESTIONS 3 ET 4  ·  LES DEUX NUMÉROS', this.dur);
    tl.to(S.q, { o: 1, dy: 0, duration: .6, ease: EO }, T(0) - 0.3)
      .to(S.gr, { o: 1, duration: .6, ease: EO }, T(2) - 0.4)
      .to(S.p1, { o: 1, duration: .6, ease: EO }, T(3) - 0.3)
      .to(S.ent, { o: 1, dy: 0, duration: .5, ease: EO }, T(5) - 0.3)
      .to(S.bcd, { o: 1, sc: 1, duration: .6, ease: EB }, T(8) - 0.3)
      .to(S.n1, { o: 1, dy: 0, duration: .6, ease: EO }, T(10) - 0.3)
      .to(S.st, { o: 1, duration: .5, ease: EO }, T(11) - 0.3)
      .to([S.p1, S.ent, S.bcd], { o: 0, duration: .5 }, T(12) - 0.5)
      .to(S.p2, { o: 1, duration: .6, ease: EO }, T(13) - 0.3)
      .to(S.n2, { o: 1, dy: 0, duration: .6, ease: EO }, T(15) - 0.3)
      .to([S.q, S.gr, S.n1, S.st, S.p2, S.n2], { o: 0, duration: .5 }, this.dur - 0.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.q.o > 0) {
      g.save(); g.globalAlpha = S.q.o; g.textAlign = 'center';
      setFont(g, F.h, 52, 700, 0); g.fillStyle = C.encre;
      g.fillText('les deux numéros — et c\'est là que les pointeurs servent', 1000, 326 + S.q.dy);
      g.restore();
    }
    const hi = {};
    if (S.p1.o > 0.4) { hi[17] = { c: 'jaune' }; for (let n = 19; n <= 27; n++) hi[n] = { c: 'vert' }; }
    if (S.p2.o > 0.4) { hi[18] = { c: 'jaune' }; for (let n = 28; n <= 37; n++) hi[n] = { c: 'bleu' }; }
    octets(g, 398, S.gr.o, { hi, dim: 0.66, num: true });
    if (S.p1.o > 0) pointeur(g, 17, 19, 398, S.p1.o, C.vert, 'pointeur 0x02  →  +2 octets');
    if (S.p2.o > 0) pointeur(g, 18, 28, 398, S.p2.o, C.bleu, 'pointeur 0x0A  →  +10 octets');
    if (S.ent.o > 0) {
      g.save(); g.globalAlpha = S.ent.o; g.textAlign = 'center';
      setFont(g, F.b, 27, 500, .3); g.fillStyle = C.encre2;
      g.fillText('octet 19 : longueur 8    ·    octet 20 : nature = international    ·    octet 21 : plan = RNIS',
                 1000, 742 + S.ent.dy);
      g.restore();
    }
    if (S.bcd.o > 0) {
      g.save(); g.globalAlpha = S.bcd.o; g.textAlign = 'center';
      g.translate(1000, 830); g.scale(S.bcd.sc, S.bcd.sc); g.translate(-1000, -830);
      g.fillStyle = 'rgba(200,65,43,.12)'; rr(g, 330, 776, 1340, 112, 8); g.fill();
      g.strokeStyle = C.rouge; g.lineWidth = 3; g.stroke();
      setFont(g, F.m, 19, 600, 3.4); g.fillStyle = C.rouge;
      g.fillText('BCD  ·  LE POIDS FAIBLE VIENT D\'ABORD', 1000, 812);
      setFont(g, F.m, 33, 700, 2.4); g.fillStyle = C.encre;
      g.fillText('0x97  ne se lit pas  9 7   —   il se lit  7 , 9', 1000, 862);
      g.restore();
    }
    if (S.n1.o > 0) {
      g.save(); g.globalAlpha = S.n1.o; g.textAlign = 'center';
      setFont(g, F.m, 19, 600, 4); g.fillStyle = C.vert;
      g.fillText('NUMÉRO DE L\'APPELÉ  ·  obligatoire', 1000, 938 + S.n1.dy);
      setFont(g, F.m, 64, 700, 7); g.fillStyle = C.encre;
      g.fillText('7 9 4 0 9 6 9 9 9 1 7', 1000, 1010 + S.n1.dy);
      g.restore();
    }
    if (S.st.o > 0) {
      g.save(); g.globalAlpha = S.st.o; g.textAlign = 'center';
      setFont(g, F.b, 24, 500, .3); g.fillStyle = C.encre3;
      g.fillText('le F final = 1111 = signal ST, fin de numérotation', 1000, 1060);
      g.restore();
    }
    if (S.n2.o > 0) {
      g.save(); g.globalAlpha = S.n2.o; g.textAlign = 'center';
      setFont(g, F.m, 19, 600, 4); g.fillStyle = C.bleu;
      g.fillText('NUMÉRO DE L\'APPELANT  ·  facultatif, et il est bien là', 1000, 866 + S.n2.dy);
      setFont(g, F.m, 64, 700, 7); g.fillStyle = C.encre;
      g.fillText('7 9 4 0 9 9 4 7 5 7 3', 1000, 938 + S.n2.dy);
      setFont(g, F.b, 24, 500, .3); g.fillStyle = C.encre3;
      g.fillText("octet 28 = 0x0A = le code du paramètre « numéro de l'appelant »",
                 1000, 986 + S.n2.dy);
      g.restore();
    }
    entete(g, S.num, S.titre, S.hdr);
  }
};

/* ══════════════ 10 · Q5 — LE RNIS DE BOUT EN BOUT — 54.250 s ══════════════ */
const CH10 = {
  dur: 54.250,
  setup(tl, S) {
    const T = i => L(10, i);
    addCam(tl, S, [[0.8,2.4,{z:1.04}],[2.0,10.0,{z:1.06,y:-20}],
                   [13.0,1.2,{x:0,y:0,z:0.99}],[13.8,14.0,{z:1.05,y:24}],
                   [28.4,1.2,{x:0,y:0,z:0.99}],[29.2,14.0,{z:1.05}],
                   [44.0,1.2,{x:0,y:0,z:0.99}],[44.8,8.0,{z:1.04}]]);
    S.q = o({ dy: 16 }); S.gr = o(); S.p1 = o({ dx: -22 }); S.p2 = o({ dx: 22 });
    S.rep = o({ sc: 1.3 });
    addHeader(tl, S, '10', 'QUESTION 5  ·  LE RNIS DE BOUT EN BOUT', this.dur);
    tl.to(S.q, { o: 1, dy: 0, duration: .6, ease: EO }, T(0) - 0.3)
      .to(S.gr, { o: 1, duration: .6, ease: EO }, T(1) - 0.3)
      .to(S.p1, { o: 1, dx: 0, duration: .6, ease: EO }, T(2) - 0.4)
      .to(S.p2, { o: 1, dx: 0, duration: .6, ease: EO }, T(5) - 0.4)
      .to(S.rep, { o: 1, sc: 1, duration: .6, ease: EB }, T(9) - 0.3)
      .to([S.q, S.gr, S.p1, S.p2, S.rep], { o: 0, duration: .5 }, this.dur - 0.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.q.o > 0) {
      g.save(); g.globalAlpha = S.q.o; g.textAlign = 'center';
      setFont(g, F.h, 50, 700, 0); g.fillStyle = C.encre;
      g.fillText('le SSUR est-il utilisé sur toute la connexion ?', 1000, 324 + S.q.dy);
      g.restore();
    }
    const hi = {};
    if (S.p1.o > 0.4) hi[4] = { c: 'or' };
    if (S.p2.o > 0.4) { hi[13] = { c: 'rouge' }; hi[14] = { c: 'rougeL' }; }
    octets(g, 392, S.gr.o, { hi, dim: 0.68, num: true });
    const PR = [[S.p1, 250, 'PREUVE 1  ·  L\'OCTET DE SERVICE', C.or, '0xC5', '→  4 bits de poids faible = 5',
                 '5 = sous-système utilisateur pour le RNIS', 'on est bien en SSUR'],
                [S.p2, 1030, 'PREUVE 2  ·  LES INDICATEURS D\'APPEL', C.rouge, '0x20', '→  0010 0000',
                 'le 6ᵉ bit — le bit F — vaut 1', 'Q.763 : SSUR utilisé sur toute la connexion']];
    PR.forEach(([s, x, tit, col, hex, bin, l1, l2]) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o; g.textAlign = 'center';
      g.fillStyle = 'rgba(251,247,236,.84)'; rr(g, x + s.dx, 630, 720, 300, 8); g.fill();
      g.strokeStyle = col; g.lineWidth = 3; g.stroke();
      setFont(g, F.m, 18, 600, 3); g.fillStyle = col;
      g.fillText(tit, x + s.dx + 360, 678);
      setFont(g, F.m, 56, 700, 4); g.fillStyle = C.encre;
      g.fillText(hex, x + s.dx + 360, 756);
      setFont(g, F.m, 30, 600, 2.4); g.fillStyle = C.encre2;
      g.fillText(bin, x + s.dx + 360, 806);
      setFont(g, F.b, 23, 500, .3); g.fillStyle = C.encre;
      g.fillText(l1, x + s.dx + 360, 858);
      setFont(g, F.b, 22, 400, .3); g.fillStyle = C.encre3;
      g.fillText(l2, x + s.dx + 360, 896);
      g.restore();
    });
    if (S.rep.o > 0) {
      g.save(); g.globalAlpha = S.rep.o; g.textAlign = 'center';
      g.translate(1000, 1000); g.scale(S.rep.sc, S.rep.sc); g.translate(-1000, -1000);
      setFont(g, F.d, 62, 700, 1.4); g.fillStyle = C.vert;
      g.fillText('OUI  —  et avec deux justifications indépendantes', 1000, 1012);
      g.restore();
    }
    entete(g, S.num, S.titre, S.hdr);
  }
};

/* ══════════════ 11 · LE RÉFLEXE — 53.917 s ══════════════ */
const CH11 = {
  dur: 53.917,
  setup(tl, S) {
    const Q = i => L(11, i);
    addCam(tl, S, [[0.9,2.4,{z:1.04}],[2.4,22.0,{y:60,z:1.055}],
                   [26.0,16.0,{y:120,z:1.06}],[43.0,1.2,{x:0,y:0,z:0.98}],
                   [44.0,9.0,{z:1.05}]]);
    S.card = o({ sc: .94 }); S.b = []; for (let i = 0; i < 6; i++) S.b.push(o({ dx: -18 }));
    S.fin = o(); S.sig = o({ p: 0 });
    addHeader(tl, S, '11', 'LE RÉFLEXE DU DÉCODAGE', this.dur);
    tl.to(S.card, { o: 1, sc: 1, duration: .7, ease: EB }, Q(0) - 0.4);
    [Q(1) - 0.3, Q(2) - 0.3, Q(3) - 0.3, Q(4) - 0.3, Q(5) - 0.3, Q(6) - 0.3]
      .forEach((a, i) => tl.to(S.b[i], { o: 1, dx: 0, duration: .45, ease: EO }, a));
    tl.to([S.card, ...S.b], { o: 0, duration: .6 }, Q(7) - 0.5)
      .to(S.fin, { o: 1, duration: .7, ease: EO }, Q(7) - 0.1)
      .to(S.fin, { o: 0, duration: .5 }, Q(11) - 0.4)
      .to(S.sig, { o: 1, duration: .9, ease: EO }, Q(11) - 0.1)
      .to(S.sig, { p: 1, duration: 1.4, ease: EO }, Q(11) + 0.3);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.card.o > 0) {
      fiche(g, 150, 300, 1700, 700, S.card, (gg, x, y, w, h, u) => {
        gg.textAlign = 'left';
        setFont(gg, F.m, 20, 600, 4.4); gg.fillStyle = C.rouge;
        gg.fillText('À REFAIRE À L\'EXAMEN, DANS CET ORDRE', x + 56, y + 64);
        setFont(gg, F.d, 58, 700, 1.2); gg.fillStyle = C.encre;
        gg.fillText('LE RÉFLEXE DU DÉCODAGE', x + 56, y + 134);
        trait(gg, x + 56, y + 164, x + w - 56, y + 164, u, { color: C.encre3, lw: 2 });
      });
    }
    const ET = [['1', 'compter les octets', 'correction (2) + INL + information'],
                ['2', "l'INL donne la longueur", "l'octet de service donne la norme"],
                ['3', "sauter l'étiquette", 'SIO + CPD + CPO + SCS + CIC, puis le type de message'],
                ['4', 'dérouler la partie fixe', "dans l'ordre exact du tableau Q.763"],
                ['5', 'suivre les pointeurs', 'numéro appelé, puis partie facultative'],
                ['6', 'chiffres en BCD', 'poids faible d\'abord · F = ST · 0 de remplissage']];
    S.b.forEach((s, i) => {
      if (s.o <= 0) return;
      const y = 500 + i * 80;
      g.save(); g.globalAlpha = s.o; g.textAlign = 'left';
      g.fillStyle = C.rouge; g.beginPath();
      g.arc(238 + s.dx, y - 8, 17, 0, 7); g.fill();
      setFont(g, F.m, 21, 700, 0); g.fillStyle = '#FBF7EC'; g.textAlign = 'center';
      g.fillText(ET[i][0], 238 + s.dx, y - 1);
      g.textAlign = 'left';
      setFont(g, F.d, 34, 700, .8); g.fillStyle = C.encre;
      g.fillText(ET[i][1], 282 + s.dx, y);
      setFont(g, F.b, 24, 400, .3); g.fillStyle = C.encre3;
      g.fillText(ET[i][2], 282 + s.dx, y + 34);
      g.restore();
    });
    if (S.fin.o > 0) {
      g.save(); g.globalAlpha = S.fin.o; g.textAlign = 'center';
      setFont(g, F.m, 20, 500, 6); g.fillStyle = C.rouge;
      g.fillText('TROIS ÉPISODES', 1000, 400);
      setFont(g, F.d, 76, 700, 1.6); g.fillStyle = C.encre;
      g.fillText('LA ROUTE  ·  LA TRAME  ·  LE DÉCODAGE', 1000, 492);
      setFont(g, F.h, 52, 700, 0); g.fillStyle = C.bleu;
      g.fillText('du bit qui passe sur un intervalle de temps', 1000, 600);
      g.fillText("jusqu'au numéro de téléphone qu'on lit dans la trame", 1000, 666);
      setFont(g, F.b, 28, 500, .4); g.fillStyle = C.encre2;
      g.fillText('le reste, c\'est de la révision', 1000, 752);
      g.restore();
    }
    signature(g, S.sig, 'SS7  ·  ÉPISODE 3  ·  LE DÉCODAGE', 'bon courage à tous');
    entete(g, S.num, S.titre, S.hdr);
  }
};

const CHAPTERS = [CH0, CH1, CH2, CH3, CH4, CH5, CH6, CH7, CH8, CH9, CH10, CH11];
