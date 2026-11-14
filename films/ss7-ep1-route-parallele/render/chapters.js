/* ============================================================
   SS7 — ÉPISODE 1 · LA ROUTE PARALLÈLE
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
function fadeOut(g, S) { /* la transition est un glissement de feuille, plus un fondu */ }
/* la caméra : jamais immobile. moves = [[t, durée, {z,x,y}], ...] */
function addCam(tl, S, moves) {
  S.cam = o({ z: 1, x: 0, y: 0, rot: 0 });
  moves.forEach(m => tl.to(S.cam, Object.assign({ duration: m[1], ease: EIO }, m[2]), m[0]));
}
/* respiration permanente : la page n'est jamais parfaitement figée */
function derive(f) {
  return { x: Math.sin(f / 237) * 11 + Math.sin(f / 91) * 3,
           y: Math.cos(f / 301) * 8 + Math.cos(f / 117) * 2.5,
           z: 1 + Math.sin(f / 409) * 0.007,
           rot: Math.sin(f / 523) * 0.0016 };
}
function page(g, S) {                       // le fond commun à tous les chapitres
  bgPaper(g); carreaux(g, 1); watermark(g);
  if (S && S.hdr) entete(g, S.num, S.titre, S.hdr);
}
function plate(g, img, a) {
  if (!img || a <= 0) return;
  const m = 0.05;                       // marge : la caméra ne doit jamais voir le bord
  g.save(); g.globalAlpha = a;
  g.drawImage(img, -W * m, -H * m, W * (1 + 2 * m), H * (1 + 2 * m));
  g.restore();
}

/* ---------- petits objets dessinés ---------- */
function flecheD(g, x1, y1, x2, y2, u, opt = {}) {      // flèche tirée à la main
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
function feuille(g, x, y, s, u, color = C.bleu) {        // une petite « feuille de papier »
  if (u <= 0) return;
  g.save(); g.globalAlpha = u;
  g.fillStyle = '#FBF7EC'; g.strokeStyle = color; g.lineWidth = 2;
  rr(g, x - 13 * s, y - 17 * s, 26 * s, 34 * s, 3 * s); g.fill(); g.stroke();
  g.strokeStyle = color; g.lineWidth = 1.6; g.globalAlpha = u * .75;
  for (let i = 0; i < 3; i++) {
    g.beginPath(); g.moveTo(x - 8 * s, y - 8 * s + i * 8 * s);
    g.lineTo(x + 8 * s, y - 8 * s + i * 8 * s); g.stroke();
  }
  g.restore();
}
function valise(g, x, y, s, u) {                          // un bagage
  if (u <= 0) return;
  g.save(); g.globalAlpha = u;
  g.fillStyle = C.rouge; rr(g, x - 17 * s, y - 12 * s, 34 * s, 24 * s, 3 * s); g.fill();
  g.strokeStyle = C.rouge; g.lineWidth = 2.4;
  g.beginPath(); g.moveTo(x - 7 * s, y - 12 * s); g.lineTo(x - 7 * s, y - 19 * s);
  g.lineTo(x + 7 * s, y - 19 * s); g.lineTo(x + 7 * s, y - 12 * s); g.stroke();
  g.restore();
}
function bateau(g, x, y, s, u, roul = 0, color = C.rouge) {
  if (u <= 0) return;
  g.save(); g.globalAlpha = u; g.translate(x, y); g.rotate(roul);
  g.fillStyle = color;
  g.beginPath(); g.moveTo(-30 * s, 0); g.lineTo(30 * s, 0);
  g.lineTo(20 * s, 16 * s); g.lineTo(-20 * s, 16 * s); g.closePath(); g.fill();
  g.strokeStyle = color; g.lineWidth = 2.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -26 * s); g.stroke();
  g.beginPath(); g.moveTo(2 * s, -24 * s); g.lineTo(20 * s, -12 * s); g.lineTo(2 * s, -6 * s);
  g.closePath(); g.fill();
  g.restore();
}
function helico(g, x, y, s, u, spin) {
  if (u <= 0) return;
  g.save(); g.globalAlpha = u; g.translate(x, y);
  g.fillStyle = C.bleu;
  g.beginPath(); g.ellipse(0, 0, 26 * s, 15 * s, 0, 0, 7); g.fill();
  g.strokeStyle = C.bleu; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(22 * s, -2 * s); g.lineTo(52 * s, -6 * s); g.stroke();
  g.beginPath(); g.moveTo(50 * s, -14 * s); g.lineTo(54 * s, 2 * s); g.stroke();
  g.beginPath(); g.moveTo(-14 * s, 14 * s); g.lineTo(-14 * s, 22 * s);
  g.moveTo(10 * s, 14 * s); g.lineTo(10 * s, 22 * s);
  g.moveTo(-22 * s, 22 * s); g.lineTo(20 * s, 22 * s); g.stroke();
  const r = 44 * s * (0.35 + 0.65 * Math.abs(Math.cos(spin)));
  g.beginPath(); g.moveTo(-r, -17 * s); g.lineTo(r, -17 * s); g.stroke();
  g.beginPath(); g.moveTo(0, -17 * s); g.lineTo(0, -6 * s); g.stroke();
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
  g.save(); g.globalAlpha = u; g.strokeStyle = color; g.lineWidth = 6 * s;
  g.lineCap = 'round'; g.lineJoin = 'round';
  const p = [[x - 20 * s, y], [x - 6 * s, y + 15 * s], [x + 22 * s, y - 18 * s]];
  wire(g, p, clamp(u * 1.3), { color, lw: 6 * s });
  g.restore();
}

/* ══════════════ 00 · ACCROCHE — 21.750 s ══════════════ */
const CH0 = {
  dur: 21.750,
  setup(tl, S) {
    addCam(tl, S, [[0.6, 2.2, {z: 1.055}], [4.3, 1.4, {z: 1.0, y: 0}], [5.0, 8.0, {x: -70, z: 1.03}], [13.4, 1.2, {x: 0, y: 0, z: 0.985}], [14.2, 6.6, {z: 1.045}]]);
    S.num = o({ p: 0 }); S.rail = o(); S.sig = o(); S.lab = o();
    S.tit = o({ dy: 26 }); S.sous = o(); S.pied = o();
    S.vP = { t: 0 }; S.sP = { t: 0 };
    tl.to(S.num, { o: 1, p: 1, duration: 1.9, ease: 'none' }, .7)
      .to(S.num, { o: 0, duration: .5 }, 4.3)
      .to(S.rail, { o: 1, p: 1, duration: .9, ease: EX }, 4.5)
      .to(S.vP, { t: 1, duration: 7.2, ease: 'none' }, 5.0)
      .to(S.sig, { o: 1, p: 1, duration: .7, ease: EX }, 5.4)
      .to(S.sP, { t: 1, duration: 2.1, ease: 'power1.inOut' }, 5.7)
      .to(S.lab, { o: 1, duration: .6, ease: EO }, 8.6)
      .to([S.rail, S.sig, S.lab], { o: 0, duration: .7 }, 13.4)
      .to(S.tit, { o: 1, dy: 0, duration: .9, ease: EO }, 13.9)
      .to(S.sous, { o: 1, p: 1, duration: 1.3, ease: 'none' }, 15.1)
      .to(S.pied, { o: 1, duration: .7, ease: EO }, 17.2);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.num.o > 0) {
      g.save(); g.globalAlpha = S.num.o; g.textAlign = 'center';
      setFont(g, F.m, 19, 500, 5); g.fillStyle = C.encre3;
      g.fillText('TU COMPOSES UN NUMÉRO', 1000, 440);
      const N = '77 940 96 99 17', n = Math.floor(S.num.p * N.length);
      setFont(g, F.d, 104, 700, 7); g.fillStyle = C.encre;
      g.fillText(N.slice(0, n), 1000, 560);
      g.restore();
    }
    const RY = 640, RX0 = 300, RX1 = 1700;
    if (S.rail.o > 0) {
      trait(g, RX0, RY, RX1, RY, S.rail.p, { color: C.rouge, lw: 7, amp: 2.2 });
      if (S.vP.t > 0) {
        const x = lerp(RX0, RX1, S.vP.t * S.rail.p);
        runner(g, [[RX0, RY], [x, RY]], 1, { color: C.rouge, r: 13, alpha: S.rail.o });
      }
    }
    if (S.sig.o > 0) {
      const SY = 470;
      trait(g, RX0, SY, RX1, SY, S.sig.p, { color: C.bleu, lw: 4, amp: 2, dash: [16, 13] });
      if (S.sP.t > 0) {
        const x = lerp(RX0, RX1, S.sP.t);
        runner(g, [[RX0, SY], [x, SY]], 1, { color: C.bleu, r: 10, alpha: S.sig.o, trail: .05 });
      }
      if (S.sP.t > .99) {
        g.save(); g.globalAlpha = S.sig.o;
        setFont(g, F.h, 44, 700, 0); g.fillStyle = C.bleu; g.textAlign = 'left';
        g.fillText('déjà arrivée.', RX1 + 20, SY + 12);
        g.restore();
      }
    }
    if (S.lab.o > 0) {
      g.save(); g.globalAlpha = S.lab.o; g.textAlign = 'left';
      setFont(g, F.d, 27, 700, 2.6); g.fillStyle = C.bleu;
      g.fillText('LA SIGNALISATION', RX0, 418);
      setFont(g, F.b, 18, 500, .3); g.fillStyle = C.encre3;
      g.fillText('sa propre route — elle passe devant', RX0, 444);
      setFont(g, F.d, 27, 700, 2.6); g.fillStyle = C.rouge;
      g.fillText('LA PAROLE', RX0, 706);
      setFont(g, F.b, 18, 500, .3); g.fillStyle = C.encre3;
      g.fillText('le circuit, plus lent à monter', RX0, 732);
      g.restore();
    }
    if (S.tit.o > 0) {
      g.save(); g.globalAlpha = S.tit.o; g.textAlign = 'center';
      g.translate(0, S.tit.dy);
      setFont(g, F.m, 20, 500, 7); g.fillStyle = C.encre3;
      g.fillText('SIGNALISATION  SÉMAPHORE', 1000, 392);
      setFont(g, F.d, 190, 700, 2); g.fillStyle = C.encre;
      g.fillText('N°7', 1000, 548);
      surligne(g, 822, 424, 356, clamp((S.tit.o - .4) / .6), 124, 'rgba(242,193,78,.46)');
      g.restore();
    }
    if (S.sous.o > 0) {
      g.save(); g.globalAlpha = S.sous.o; g.textAlign = 'center';
      setFont(g, F.d, 30, 700, 5); g.fillStyle = C.rouge;
      g.fillText('ÉPISODE 1', 1000, 628);
      setFont(g, F.h, 76, 700, 0); g.fillStyle = C.encre;
      typeOn(g, 'la route parallèle', 1000, 712, S.sous.p, 'center');
      g.restore();
    }
    if (S.pied.o > 0) {
      g.save(); g.globalAlpha = S.pied.o; g.textAlign = 'center';
      setFont(g, F.b, 20, 400, .4); g.fillStyle = C.encre3;
      g.fillText("d'après le cours de signalisation sémaphore N°7  ·  séance 01", 1000, 812);
      g.restore();
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 01 · SIGNALER — 55.083 s ══════════════ */
const CH1 = {
  dur: 55.083,
  setup(tl, S) {
    addCam(tl, S, [[1.2, 2.0, {z: 1.05, y: -28}], [5.0, 6.0, {x: -90, z: 1.08}], [11.6, 2.4, {x: 60, y: -120, z: 1.1}], [18.8, 1.4, {x: 0, y: 0, z: 0.97}], [19.6, 9.0, {z: 1.045, y: 18}], [31.0, 1.6, {y: 120, z: 1.06}], [35.2, 1.4, {x: 0, y: 0, z: 0.975}], [36.0, 9.0, {z: 1.05, y: -26}], [45.0, 4.0, {x: -70, y: 60, z: 1.09}]]);
    S.gare = o(); S.bag = { t: 0 }; S.bagO = o(); S.pap = o(); S.papT = { t: 0 };
    S.ord = [o(), o(), o()];
    S.def = o({ sc: .94 }); S.h = [o(), o(), o()]; S.pas = o();
    S.per = o(); S.br = [o(), o(), o()]; S.tam = o({ sc: 1.5 }); S.post = o({ sc: .9 });
    addHeader(tl, S, '01', "SIGNALER, C'EST QUOI ?", this.dur);
    tl.to(S.gare, { o: 1, p: 1, duration: 1.1, ease: EX }, 1.4)
      .to(S.bagO, { o: 1, duration: .6 }, 5.2)
      .to(S.bag, { t: 1, duration: 9.0, ease: 'none' }, 5.4)
      .to(S.pap, { o: 1, duration: .6 }, 9.0)
      .to(S.papT, { t: 1, duration: 5.4, ease: 'none' }, 9.2)
      .to(S.ord[0], { o: 1, p: 1, duration: .8, ease: 'none' }, 12.6)
      .to(S.ord[1], { o: 1, p: 1, duration: 1.0, ease: 'none' }, 14.3)
      .to(S.ord[2], { o: 1, p: 1, duration: 1.0, ease: 'none' }, 16.2)
      .to([S.gare, S.bagO, S.pap, S.ord[0], S.ord[1], S.ord[2]], { o: 0, duration: .7 }, 19.0)
      .to(S.def, { o: 1, sc: 1, duration: .8, ease: EB }, 19.6)
      .to(S.h[0], { p: 1, duration: .5, ease: EO }, 23.4)
      .to(S.h[1], { p: 1, duration: .5, ease: EO }, 25.0)
      .to(S.h[2], { p: 1, duration: .5, ease: EO }, 26.6)
      .to(S.pas, { o: 1, duration: .6, ease: EO }, 31.4)
      .to([S.def, S.pas], { o: 0, duration: .6 }, 35.0)
      .to(S.per, { o: 1, p: 1, duration: 1.6, ease: EX }, 35.6)
      .to(S.br[0], { o: 1, duration: .5, ease: EO }, 37.6)
      .to(S.br[1], { o: 1, duration: .5, ease: EO }, 39.2)
      .to(S.br[2], { o: 1, duration: .5, ease: EO }, 40.8)
      .to(S.tam, { o: 1, sc: 1, duration: .55, ease: EB }, 45.0)
      .to(S.post, { o: 1, sc: 1, duration: .6, ease: EB }, 48.4)
      .to([S.per, S.br[0], S.br[1], S.br[2], S.tam, S.post], { o: 0, duration: .5 }, 54.1);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    const GY = 560, X1 = 360, X2 = 1640;
    if (S.gare.o > 0) {
      g.save(); g.globalAlpha = S.gare.o;
      [[X1, 'GARE A'], [X2, 'GARE B']].forEach(([x, nm]) => {
        trait(g, x - 92, GY + 70, x + 92, GY + 70, S.gare.p, { color: C.encre, lw: 3 });
        trait(g, x - 92, GY + 70, x - 92, GY - 40, S.gare.p, { color: C.encre, lw: 3 });
        trait(g, x + 92, GY + 70, x + 92, GY - 40, S.gare.p, { color: C.encre, lw: 3 });
        trait(g, x - 110, GY - 40, x + 110, GY - 70, S.gare.p, { color: C.encre, lw: 3 });
        g.globalAlpha = S.gare.o * clamp(S.gare.p * 2 - 1);
        setFont(g, F.d, 23, 700, 2.4); g.fillStyle = C.encre; g.textAlign = 'center';
        g.fillText(nm, x, GY + 112);
        g.globalAlpha = S.gare.o;
      });
      trait(g, X1 + 100, GY + 40, X2 - 100, GY + 40, S.gare.p, { color: C.encre3, lw: 5 });
      g.restore();
    }
    if (S.bagO.o > 0) for (let i = 0; i < 4; i++) {
      const u = (S.bag.t * 1.5 + i * .25) % 1.5;
      if (u > 1) continue;
      valise(g, lerp(X1 + 110, X2 - 110, u), GY + 22, 1, S.bagO.o * band(u, 0, 1, .12));
    }
    if (S.bagO.o > 0) {
      g.save(); g.globalAlpha = S.bagO.o; g.textAlign = 'center';
      setFont(g, F.d, 26, 700, 2.4); g.fillStyle = C.rouge;
      g.fillText('LES BAGAGES  =  LA PAROLE', 1000, GY + 148);
      g.restore();
    }
    if (S.pap.o > 0) {
      for (let i = 0; i < 3; i++) {
        const u = (S.papT.t * 2.6 + i * .34) % 1.4;
        if (u > 1) continue;
        feuille(g, lerp(X1 + 110, X2 - 110, u), GY - 150 + Math.sin(u * 9) * 10, 1,
                S.pap.o * band(u, 0, 1, .12));
      }
      g.save(); g.globalAlpha = S.pap.o; g.textAlign = 'center';
      setFont(g, F.d, 26, 700, 2.4); g.fillStyle = C.bleu;
      g.fillText('LES PAPIERS  =  LA SIGNALISATION', 1000, GY - 212);
      g.restore();
    }
    const ORD = ['Prépare-toi.', 'Le bagage 42 va quai 3.', 'Confirmé, tu peux fermer.'];
    S.ord.forEach((s, i) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o;
      setFont(g, F.h, 46, 700, 0); g.fillStyle = C.bleu; g.textAlign = 'left';
      typeOn(g, '« ' + ORD[i] + ' »', 560, 300 + i * 58, s.p, 'left');
      g.restore();
    });
    if (S.def.o > 0) {
      const X0 = 354, Y2 = 502;
      // on mesure les trois verbes pour poser le surligneur exactement dessus
      setFont(g, F.b, 33, 400, .2);
      const MOTS = ['pour  ', 'établir', ',  ', 'superviser', '  et  ', 'rompre'];
      const pos = []; let cx = X0;
      MOTS.forEach(m => { pos.push([cx, g.measureText(m).width]); cx += g.measureText(m).width; });
      fiche(g, 300, 300, 1400, 400, S.def, (gg, x, y, w, h, u) => {
        gg.textAlign = 'left';
        setFont(gg, F.m, 17, 500, 4.4); gg.fillStyle = C.rouge;
        gg.fillText('DÉFINITION  ·  À RETENIR TELLE QUELLE', x + 54, y + 62);
        setFont(gg, F.b, 33, 400, .2); gg.fillStyle = C.encre;
        gg.fillText("l'ensemble des ordres et des informations échangés", X0, y + 148);
        MOTS.forEach((m, i) => gg.fillText(m, pos[i][0], Y2));
        gg.fillText('une communication.', X0, y + 256);
        setFont(gg, F.b, 23, 400, .2); gg.fillStyle = C.encre2;
        gg.fillText('Avant la parole, pendant, et après.', X0, y + 330);
      });
      [1, 3, 5].forEach((k, i) =>
        surligne(g, pos[k][0] - 6, Y2 - 34, pos[k][1] + 12, S.h[i].p, 44));
    }
    if (S.pas.o > 0) {
      g.save(); g.globalAlpha = S.pas.o; g.textAlign = 'center';
      setFont(g, F.h, 50, 700, 0); g.fillStyle = C.rouge;
      g.fillText("et ce n'est pas que le téléphone !", 1000, 772);
      g.restore();
    }
    if (S.per.o > 0) {
      const y = 520, xs = [300, 720, 1280, 1700];
      g.save(); g.globalAlpha = S.per.o;
      trait(g, xs[0], y, xs[3], y, S.per.p, { color: C.encre3, lw: 3 });
      g.restore();
      boite(g, xs[0], y, 150, 86, 'POSTE', null, S.per.o * clamp(S.per.p * 3));
      boite(g, xs[1], y, 210, 110, 'COMMUT.', 'A', S.per.o * clamp(S.per.p * 3 - .7));
      boite(g, xs[2], y, 210, 110, 'COMMUT.', 'B', S.per.o * clamp(S.per.p * 3 - 1.3));
      boite(g, xs[3], y, 150, 86, 'POSTE', null, S.per.o * clamp(S.per.p * 3 - 1.9));
      const BR = [['A', 'TERMINALE', xs[0], xs[1], 'non normalisée', C.encre3, 196],
                  ['B', 'INTERNE', xs[1] - 105, xs[1] + 105, 'non normalisée', C.encre3, 300],
                  ['C', 'INTER-COMMUTATEUR', xs[1], xs[2], "c'est l'objet du cours", C.bleu, 196]];
      S.br.forEach((s, i) => {
        if (s.o <= 0) return;
        const [k, nm, xa, xb, note, col, dy] = BR[i];
        const xm = (xa + xb) / 2;
        g.save(); g.globalAlpha = s.o; g.textAlign = 'center';
        g.strokeStyle = col; g.lineWidth = 2.2; g.lineCap = 'round';
        g.beginPath();
        g.moveTo(xa + 16, y - dy + 48); g.lineTo(xa + 16, y - dy + 62);
        g.lineTo(xb - 16, y - dy + 62); g.lineTo(xb - 16, y - dy + 48); g.stroke();
        setFont(g, F.d, 25, 700, 2.4); g.fillStyle = col;
        g.fillText(k + '  ·  ' + nm, xm, y - dy + 22);
        setFont(g, F.b, 18, 500, .3); g.fillStyle = C.encre3;
        g.fillText(note, xm, y - dy + 46);
        g.restore();
      });
      tampon(g, 1000, 700, 'NORMALISÉ  UIT-T', S.tam, { color: C.vert, size: 30, rot: -5 });
      postit(g, 1280, 742, 540, 'POURQUOI ?',
             ["L'intérieur d'un Alcatel", "ne regarde qu'Alcatel.",
              'Mais entre deux commutateurs,', 'il faut une langue commune.'], S.post);
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 02 · VOIE PAR VOIE — 61.625 s ══════════════
   plate Blender « mic » 29.5 → 45.5 s                        */
const CH2 = {
  dur: 61.625, bl: { dir: 'mic', from: 29.5, to: 41.4 },
  setup(tl, S) {
    addCam(tl, S, [[1.2, 2.0, {z: 1.06}], [4.0, 4.0, {x: -80, z: 1.09}], [8.2, 1.4, {x: 0, y: -20, z: 0.98}], [8.8, 6.0, {z: 1.05, y: -40}], [12.4, 7.0, {y: 90, z: 1.07}], [21.8, 1.6, {x: 0, y: 30, z: 1.0}], [22.4, 6.0, {z: 1.05, y: 60}], [28.8, 1.6, {x: 0, y: 0, z: 0.96}], [29.4, 15.0, {z: 1.05}], [45.6, 1.4, {z: 0.97, y: -40}], [46.2, 5.0, {z: 1.04, y: -20}], [51.6, 8.0, {z: 1.07, y: 60}]]);
    S.circ = o(); S.coll = o(); S.arch = o(); S.cit1 = o({ dy: 18 });
    S.fam = [o({ dx: -24 }), o({ dx: -24 })];
    S.bl = o(); S.mic = o(); S.cit2 = o({ dy: 18 });
    S.mer = o(); S.bat = o(); S.obs = o(); S.coule = { t: 0 }; S.x = o({ sc: 1.6 });
    addHeader(tl, S, '02', 'LA VOIE PAR VOIE', this.dur);
    tl.to(S.circ, { o: 1, p: 1, duration: 1.1, ease: EX }, 1.5)
      .to(S.coll, { o: 1, duration: .6, ease: EO }, 4.0)
      .to([S.circ, S.coll], { o: 0, duration: .6 }, 8.0)
      .to(S.arch, { o: 1, p: 1, duration: 1.8, ease: EX }, 8.6)
      .to(S.cit1, { o: 1, dy: 0, duration: .8, ease: EO }, 12.4)
      .to(S.cit1, { o: 0, duration: .6 }, 21.6)
      .to(S.fam[0], { o: 1, dx: 0, duration: .6, ease: EO }, 22.4)
      .to(S.fam[1], { o: 1, dx: 0, duration: .6, ease: EO }, 24.6)
      .to([S.arch, S.fam[0], S.fam[1]], { o: 0, duration: .7 }, 28.6)
      .to(S.bl, { o: 1, duration: 1.0, ease: EO }, 29.2)
      .to(S.mic, { o: 1, duration: .6, ease: EO }, 31.0)
      .to([S.bl, S.mic], { o: 0, duration: 1.0 }, 45.0)
      .to(S.cit2, { o: 1, dy: 0, duration: .8, ease: EO }, 46.2)
      .to(S.cit2, { o: 0, duration: .6 }, 51.4)
      .to(S.mer, { o: 1, p: 1, duration: .9, ease: EX }, 51.8)
      .to(S.bat, { o: 1, duration: .7, ease: EO }, 52.4)
      .to(S.obs, { o: 1, duration: .5, ease: EB }, 53.4)
      .to(S.coule, { t: 1, duration: 2.4, ease: 'power2.in' }, 55.0)
      .to(S.x, { o: 1, sc: 1, duration: .5, ease: EB }, 57.4)
      .to([S.mer, S.bat, S.obs, S.x], { o: 0, duration: .5 }, 60.6);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    page(g, null);
    plate(g, pl, S.bl.o);
    if (S.circ.o > 0) {
      trait(g, 300, 520, 1700, 520, S.circ.p, { color: C.rouge, lw: 9, amp: 2.4 });
      g.save(); g.globalAlpha = S.circ.o * clamp(S.circ.p * 2 - 1); g.textAlign = 'center';
      setFont(g, F.d, 27, 700, 2.6); g.fillStyle = C.rouge;
      g.fillText('UN CIRCUIT DE PAROLE', 1000, 600);
      g.restore();
    }
    if (S.coll.o > 0) {
      for (let i = 0; i < 4; i++) feuille(g, 460 + i * 360, 520, .9, S.coll.o, C.bleu);
      g.save(); g.globalAlpha = S.coll.o; g.textAlign = 'center';
      setFont(g, F.h, 50, 700, 0); g.fillStyle = C.encre;
      g.fillText('les papiers sont collés dessus', 1000, 410);
      g.restore();
    }
    if (S.arch.o > 0) {
      const y = 430;
      boite(g, 420, y, 250, 128, 'UC', 'enregistreurs', S.arch.o * clamp(S.arch.p * 3));
      boite(g, 840, y, 250, 128, 'URA', 'injecte / extrait', S.arch.o * clamp(S.arch.p * 3 - .8));
      boite(g, 1300, y, 230, 128, 'IT 16', 'du MIC', S.arch.o * clamp(S.arch.p * 3 - 1.5),
            { color: C.bleu });
      g.save(); g.globalAlpha = S.arch.o;
      flecheD(g, 548, y, 712, y, clamp(S.arch.p * 3 - .5), { color: C.encre2 });
      flecheD(g, 968, y, 1182, y, clamp(S.arch.p * 3 - 1.2), { color: C.bleu, lw: 3 });
      flecheD(g, 1418, y, 1660, y, clamp(S.arch.p * 3 - 2.0), { color: C.bleu, lw: 3 });
      g.textAlign = 'left';
      setFont(g, F.b, 19, 500, .3); g.fillStyle = C.encre3;
      g.fillText('→ vers le commutateur suivant', 1500, y - 24);
      g.restore();
    }
    citation(g, 330, 700, ["C'est l'URA qui injecte la signalisation,",
                           'et c\'est lui qui la récupère à la réception.',
                           'Mais le message qu\'il injecte, c\'est les enregistreurs',
                           'de l\'unité de commande qui le lui envoient.'],
             S.cit1, { size: 40, source: 'le prof, au tableau' });
    const FAM = [['SIGNAUX D\'ENREGISTREUR', 'les ordres qui pilotent l\'appel', C.bleu],
                 ['SIGNAUX DE LIGNE', 'décroché · raccroché · occupé', C.rouge]];
    S.fam.forEach((s, i) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o; g.translate(s.dx, 0); g.textAlign = 'left';
      const y = 690 + i * 104;
      g.fillStyle = i ? 'rgba(200,65,43,.10)' : 'rgba(31,95,139,.10)';
      rr(g, 330, y - 44, 1240, 84, 6); g.fill();
      g.strokeStyle = FAM[i][2]; g.lineWidth = 2.2; g.stroke();
      setFont(g, F.d, 27, 700, 2.4); g.fillStyle = FAM[i][2];
      g.fillText(FAM[i][0], 364, y + 2);
      setFont(g, F.b, 21, 500, .3); g.fillStyle = C.encre2;
      g.fillText(FAM[i][1], 364, y + 28);
      g.restore();
    });
    if (S.mic.o > 0) {
      g.save(); g.globalAlpha = S.mic.o; g.textAlign = 'left';
      setFont(g, F.h, 46, 700, 0); g.fillStyle = C.encre;
      g.fillText('2 voies par trame  ·  15 trames  ·  les 30 voies servies', 300, 930);
      g.restore();
    }
    citation(g, 330, 420, ['Tant que les deux étaient embarqués dans le même cycle,',
                           "je n'ai ni signalisation, ni données.",
                           'Même si le réseau ne fonctionne pas,',
                           'je ne saurais pas pourquoi.'],
             S.cit2, { size: 46, source: 'le prof' });
    if (S.mer.o > 0) {
      const my = 700;
      g.save(); g.globalAlpha = S.mer.o;
      g.strokeStyle = C.encre3; g.lineWidth = 2.6; g.lineCap = 'round';
      for (let k = 0; k < 2; k++) {
        g.beginPath();
        for (let x = 280; x <= 1720; x += 12) {
          const yy = my + 34 + k * 26 + Math.sin(x * .017 + k * 1.3 + t * .9) * 7;
          x === 280 ? g.moveTo(x, yy) : g.lineTo(x, yy);
        }
        g.globalAlpha = S.mer.o * (k ? .4 : .7) * S.mer.p; g.stroke();
      }
      g.restore();
      const XB = [560, 1000, 1440];
      XB.forEach((x, i) => {
        const sink = (i === 1) ? S.coule.t : 0;
        bateau(g, x, my + Math.sin(t * 1.1 + i) * 5 + sink * 70, 1.5,
               S.bat.o * (1 - sink * .55), sink * .5);
      });
      if (S.obs.o > 0) {
        const sink = S.coule.t;
        g.save(); g.globalAlpha = S.obs.o * (1 - sink * .55);
        g.fillStyle = C.bleu;
        g.beginPath(); g.arc(XB[1], my + Math.sin(t * 1.1 + 1) * 5 + sink * 70 - 52, 13, 0, 7); g.fill();
        g.restore();
        g.save(); g.globalAlpha = S.obs.o * (1 - sink); g.textAlign = 'center';
        setFont(g, F.b, 19, 600, .4); g.fillStyle = C.bleu;
        g.fillText("L'OBSERVATEUR", XB[1], my - 96);
        g.restore();
      }
      croix(g, XB[1], my - 10, 2.2, S.x.o * S.x.sc > 0 ? S.x.o : 0);
      if (S.x.o > 0) {
        g.save(); g.globalAlpha = S.x.o; g.textAlign = 'center';
        setFont(g, F.h, 52, 700, 0); g.fillStyle = C.rouge;
        g.fillText('le bateau coule — personne ne peut le signaler', 1000, 912);
        g.restore();
      }
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 03 · VOIE COMMUNE — 29.375 s ══════════════
   plate Blender « res » 3.5 → 24.0 s                         */
const CH3 = {
  dur: 29.375, bl: { dir: 'res', from: 3.5, to: 15.4 },
  setup(tl, S) {
    addCam(tl, S, [[0.4, 3.0, {z: 1.03}], [3.0, 8.0, {z: 1.07, x: -40}], [10.2, 2.0, {x: 120, y: -40, z: 1.08}], [13.8, 3.0, {x: -60, y: -110, z: 1.07}], [22.6, 1.6, {x: 0, y: 0, z: 0.97}], [24.4, 5.0, {z: 1.05}]]);
    S.bl = o(); S.tam = o({ sc: 1.6 }); S.heli = o(); S.msg = o(); S.fin = o({ sc: .94 });
    addHeader(tl, S, '03', 'LA VOIE COMMUNE', this.dur);
    tl.to(S.bl, { o: 1, duration: 1.1, ease: EO }, 3.0)
      .to(S.tam, { o: 1, sc: 1, duration: .55, ease: EB }, 10.4)
      .to(S.heli, { o: 1, duration: .7, ease: EO }, 14.2)
      .to(S.msg, { o: 1, duration: .5, ease: EO }, 17.4)
      .to([S.tam, S.heli, S.msg], { o: 0, duration: .6 }, 22.8)
      .to(S.bl, { o: 0, duration: 1.0 }, 23.4)
      .to(S.fin, { o: 1, sc: 1, duration: .8, ease: EB }, 24.6)
      .to(S.fin, { o: 0, duration: .5 }, 28.4);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    page(g, null);
    plate(g, pl, S.bl.o);
    tampon(g, 1560, 236, 'HORS  BANDE', S.tam, { color: C.bleu, size: 28, rot: 7 });
    if (S.heli.o > 0) {
      panneau(g, 196, 612, 680, 452, S.heli.o, 0.93);
      const bx = 536, by = 868;
      g.save(); g.globalAlpha = S.heli.o * .9;
      g.strokeStyle = C.encre3; g.lineWidth = 2.2;
      g.beginPath();
      for (let x = bx - 180; x <= bx + 200; x += 10) {
        const yy = by + 26 + Math.sin(x * .03 + t) * 5;
        x === bx - 180 ? g.moveTo(x, yy) : g.lineTo(x, yy);
      }
      g.stroke(); g.restore();
      bateau(g, bx - 150, by, 1.0, S.heli.o);
      bateau(g, bx, by + 38, 1.0, S.heli.o * .7, .5);          // celui qui coule
      bateau(g, bx + 150, by, 1.0, S.heli.o);
      helico(g, bx, by - 150, 1.3, S.heli.o, t * 17);
      g.save(); g.globalAlpha = S.heli.o; g.textAlign = 'center';
      setFont(g, F.h, 42, 700, 0); g.fillStyle = C.bleu;
      g.fillText("l'observateur est dans l'hélicoptère", 536, 968);
      g.restore();
      if (S.msg.o > 0) {
        g.save(); g.globalAlpha = S.msg.o; g.textAlign = 'center';
        setFont(g, F.b, 22, 600, .3); g.fillStyle = C.encre;
        g.fillText('la parole tombe  →  la signalisation continue', 536, 1008);
        g.fillStyle = C.rouge;
        g.fillText('elle peut même annoncer la panne.', 536, 1042);
        g.restore();
      }
    }
    if (S.fin.o > 0) {
      g.save(); g.globalAlpha = S.fin.o; g.textAlign = 'center';
      g.translate(1000, 540); g.scale(S.fin.sc, S.fin.sc); g.translate(-1000, -540);
      setFont(g, F.d, 76, 700, 3); g.fillStyle = C.encre;
      g.fillText('VOIE COMMUNE', 1000, 500);
      surligne(g, 612, 428, 776, clamp((S.fin.o - .3) / .7), 82);
      setFont(g, F.d, 120, 700, 4); g.fillStyle = C.bleu;
      g.fillText('=  SS7', 1000, 646);
      g.restore();
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 04 · DE N°5 À SS7 — 48.417 s ══════════════ */
const CH4 = {
  dur: 48.417,
  setup(tl, S) {
    addCam(tl, S, [[1.0, 2.4, {z: 1.05}], [2.0, 7.0, {x: 140, z: 1.08}], [8.6, 3.0, {x: -60, z: 1.06}], [13.4, 1.4, {x: 0, y: 0, z: 0.97}], [14.0, 8.0, {z: 1.05, y: -18}], [21.0, 5.0, {y: 70, z: 1.07}], [26.2, 5.0, {x: -50, y: 10, z: 1.09}], [34.4, 1.6, {x: 0, y: 0, z: 0.985}], [35.0, 6.0, {z: 1.055}], [41.6, 5.0, {z: 1.04, y: -30}]]);
    S.ax = o(); S.j = [o({ dy: 20 }), o({ dy: 20 }), o({ dy: 20 }), o({ dy: 20 })];
    S.x6 = o({ sc: 1.5 });
    S.slot = o(); S.rem = { n: 0 }; S.bad = o({ sc: 1.4 }); S.calc = o(); S.hl = o();
    S.lourd = o(); S.good = { w: 0 }; S.ok = o({ sc: 1.4 }); S.fin = o();
    addHeader(tl, S, '04', "POURQUOI LE N°6 A ÉCHOUÉ", this.dur);
    tl.to(S.ax, { o: 1, p: 1, duration: 1.3, ease: EX }, 1.3)
      .to(S.j[0], { o: 1, dy: 0, duration: .6, ease: EO }, 2.2)
      .to(S.j[1], { o: 1, dy: 0, duration: .6, ease: EO }, 8.8)
      .to(S.x6, { o: 1, sc: 1, duration: .5, ease: EB }, 11.6)
      .to([S.ax, S.j[0], S.j[1], S.x6], { o: 0, duration: .6 }, 13.6)
      .to(S.slot, { o: 1, p: 1, duration: 1.0, ease: EX }, 14.2)
      .to(S.calc, { o: 1, duration: .6, ease: EO }, 21.2)
      .to(S.hl, { p: 1, duration: .6, ease: EO }, 24.4)
      .to(S.rem, { n: 26, duration: 4.0, ease: 'none' }, 26.4)
      .to(S.bad, { o: 1, sc: 1, duration: .5, ease: EB }, 30.6)
      .to(S.lourd, { o: 1, duration: .6, ease: EO }, 31.6)
      .to([S.bad, S.lourd, S.calc], { o: 0, duration: .5 }, 34.0)
      .to(S.rem, { n: 0, duration: .4 }, 34.0)
      .to(S.good, { w: 1, duration: 1.1, ease: EO }, 34.6)
      .to(S.ok, { o: 1, sc: 1, duration: .5, ease: EB }, 36.0)
      .to(S.j[2], { o: 1, dy: 0, duration: .6, ease: EO }, 37.4)
      .to([S.slot, S.ok, S.j[2]], { o: 0, duration: .6 }, 41.0)
      .to(S.fin, { o: 1, duration: .8, ease: EO }, 41.8)
      .to(S.fin, { o: 0, duration: .5 }, 47.4);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    const AY = 480, A0 = 300, A1 = 1700;
    if (S.ax.o > 0) {
      trait(g, A0, AY, A1, AY, S.ax.p, { color: C.encre2, lw: 3 });
      const J = [['AVANT 1970', 'CCITT N°5', 'fréquences · voie par voie', C.encre, A0 + 180],
                 ['DÉBUT 70s', 'CCITT N°6', 'première voie commune — 2,4 kbit/s', C.rouge, A0 + 700]];
      S.j.slice(0, 2).forEach((s, i) => {
        if (s.o <= 0) return;
        const [an, nm, sb, col, x] = J[i];
        g.save(); g.globalAlpha = s.o; g.translate(0, s.dy); g.textAlign = 'center';
        g.fillStyle = col; g.beginPath(); g.arc(x, AY, 11, 0, 7); g.fill();
        setFont(g, F.m, 16, 500, 3.2); g.fillStyle = C.encre3; g.fillText(an, x, AY - 108);
        setFont(g, F.d, 40, 700, 1.8); g.fillStyle = col; g.fillText(nm, x, AY - 58);
        setFont(g, F.b, 19, 500, .3); g.fillStyle = C.encre2; g.fillText(sb, x, AY + 44);
        g.restore();
      });
      if (S.x6.o > 0) {
        croix(g, A0 + 700, AY + 108, 1.7, S.x6.o);
        g.save(); g.globalAlpha = S.x6.o; g.textAlign = 'center';
        setFont(g, F.h, 54, 700, 0); g.fillStyle = C.rouge;
        g.fillText('il échoue.', A0 + 700, AY + 212);
        g.restore();
      }
    }
    const SX = 400, SW = 1200, SY = 430, SH = 150;
    if (S.slot.o > 0) {
      g.save(); g.globalAlpha = S.slot.o; g.textAlign = 'center';
      g.fillStyle = 'rgba(31,95,139,.07)';
      rr(g, SX, SY, SW * S.slot.p, SH, 6); g.fill();
      g.strokeStyle = C.bleu; g.lineWidth = 3; g.setLineDash([11, 8]);
      rr(g, SX, SY, SW * S.slot.p, SH, 6); g.stroke(); g.setLineDash([]);
      setFont(g, F.d, 27, 700, 2.6); g.fillStyle = C.bleu;
      g.fillText('UN INTERVALLE DE TEMPS  =  64 kbit/s', SX + SW / 2, SY - 34);
      g.restore();
      const bw = SW * 2.4 / 64;
      const n = Math.floor(S.rem.n);
      for (let i = 0; i < n; i++) {
        g.save(); g.globalAlpha = S.slot.o;
        g.fillStyle = C.rouge; rr(g, SX + 4 + i * bw, SY + 16, bw - 5, SH - 32, 3); g.fill();
        g.restore();
      }
      if (n >= 26) {
        g.save(); g.globalAlpha = S.slot.o;
        g.strokeStyle = C.rouge; g.lineWidth = 2;
        const rx = SX + 4 + 26 * bw, rw = SX + SW - 4 - rx;
        for (let x = rx; x < rx + rw; x += 9) {
          g.beginPath(); g.moveTo(x, SY + 16); g.lineTo(x - 18, SY + SH - 16); g.stroke();
        }
        g.strokeStyle = C.rouge; g.lineWidth = 2.6;
        g.strokeRect(rx, SY + 16, rw, SH - 32);
        g.restore();
      }
      if (S.good.w > 0) {
        g.save(); g.globalAlpha = S.slot.o;
        g.fillStyle = C.bleu; rr(g, SX + 4, SY + 16, (SW - 8) * S.good.w, SH - 32, 4); g.fill();
        if (S.good.w > .9) {
          setFont(g, F.d, 34, 700, 2.4); g.fillStyle = '#FBF7EC'; g.textAlign = 'center';
          g.fillText('CCITT N°7  ·  64 kbit/s', SX + SW / 2, SY + SH / 2 + 12);
        }
        g.restore();
      }
    }
    if (S.calc.o > 0) {
      g.save(); g.globalAlpha = S.calc.o; g.textAlign = 'center';
      setFont(g, F.m, 34, 500, 1.6); g.fillStyle = C.encre;
      g.fillText('8 bits  /  125 µs   =   64 000 bit/s', 1000, 700);
      g.restore();
      surligne(g, 1130, 672, 224, S.hl.p, 42);
      g.save(); g.globalAlpha = S.calc.o; g.textAlign = 'center';
      setFont(g, F.b, 22, 500, .3); g.fillStyle = C.encre3;
      g.fillText("c'est la taille d'un intervalle, et elle ne se discute pas", 1000, 742);
      g.restore();
    }
    if (S.bad.o > 0) {
      g.save(); g.globalAlpha = S.bad.o; g.textAlign = 'center';
      setFont(g, F.h, 52, 700, 0); g.fillStyle = C.rouge;
      g.fillText('26 fois 2,4 = 62,4 … et il reste un trou', 1000, 830);
      g.restore();
    }
    if (S.lourd.o > 0) {
      g.save(); g.globalAlpha = S.lourd.o; g.textAlign = 'center';
      setFont(g, F.b, 25, 500, .3); g.fillStyle = C.encre2;
      g.fillText('il faudrait re-multiplexer la signalisation pour la faire rentrer  —  trop lourd.', 1000, 886);
      g.restore();
    }
    if (S.ok.o > 0) {
      coche(g, 1000, 660, 2.0, S.ok.o);
      g.save(); g.globalAlpha = S.ok.o; g.textAlign = 'center';
      setFont(g, F.h, 54, 700, 0); g.fillStyle = C.vert;
      g.fillText('pile dans un intervalle.', 1000, 770);
      g.restore();
    }
    if (S.j[2].o > 0) {
      g.save(); g.globalAlpha = S.j[2].o; g.textAlign = 'center';
      setFont(g, F.b, 23, 500, .3); g.fillStyle = C.encre2;
      g.fillText('spécifié à Genève en 1981  ·  complété à Malaga en 1984', 1000, 860);
      g.restore();
    }
    if (S.fin.o > 0) {
      g.save(); g.globalAlpha = S.fin.o; g.textAlign = 'center';
      setFont(g, F.m, 18, 500, 5); g.fillStyle = C.encre3;
      g.fillText('1992  ·  LE CCITT DEVIENT L\'UIT-T', 1000, 420);
      setFont(g, F.d, 82, 700, 3); g.fillStyle = C.encre;
      g.fillText('CCITT N°7', 740, 540);
      g.fillStyle = C.bleu; g.fillText('SS7', 1320, 540);
      flecheD(g, 940, 522, 1180, 522, clamp(S.fin.o * 1.6), { color: C.rouge, lw: 4, head: 18 });
      setFont(g, F.h, 54, 700, 0); g.fillStyle = C.rouge;
      g.fillText('même protocole, nouveau nom', 1000, 648);
      g.restore();
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 05 · QUI HABITE CE RÉSEAU — 46.042 s ══════════════ */
const CH5 = {
  dur: 46.042,
  setup(tl, S) {
    addCam(tl, S, [[1.2, 2.4, {z: 1.06, x: -60}], [5.4, 3.0, {x: 60, z: 1.08}], [8.4, 3.0, {x: -60, y: 70, z: 1.07}], [15.6, 2.0, {x: 0, y: -110, z: 1.04}], [17.2, 4.0, {x: 90, y: 0, z: 1.09}], [21.2, 5.0, {x: 0, y: 110, z: 1.05}], [31.2, 1.4, {x: 0, y: 0, z: 0.965}], [32.0, 8.0, {z: 1.05, y: -20}], [39.8, 5.0, {y: 80, z: 1.07}]]);
    S.ps = o({ dy: 22 }); S.psL = o(); S.tam = o({ sc: 1.5 });
    S.pts = o({ dy: 22 }); S.ptsL = o();
    S.reg = o(); S.pou = o(); S.mv = { t: 0 }; S.jete = { t: 0 };
    S.cit = o({ dy: 18 });
    S.fx = o(); S.nfx = { n: 0 }; S.fxL = o(); S.max = o({ sc: .9 });
    addHeader(tl, S, '05', 'QUI HABITE CE RÉSEAU', this.dur);
    tl.to(S.ps, { o: 1, dy: 0, duration: .7, ease: EO }, 1.4)
      .to(S.psL, { o: 1, duration: .6, ease: EO }, 2.6)
      .to(S.tam, { o: 1, sc: 1, duration: .5, ease: EB }, 5.6)
      .to(S.pts, { o: 1, dy: 0, duration: .7, ease: EO }, 8.6)
      .to(S.ptsL, { o: 1, duration: .6, ease: EO }, 10.0)
      .to([S.tam], { o: 0, duration: .5 }, 15.0)
      .to(S.reg, { o: 1, duration: .6, ease: EO }, 15.8)
      .to(S.pou, { o: 1, duration: .6, ease: EB }, 16.8)
      .to(S.mv, { t: 1, duration: 1.8, ease: 'power1.inOut' }, 17.4)
      .to(S.jete, { t: 1, duration: 1.1, ease: 'power2.in' }, 19.4)
      .to(S.cit, { o: 1, dy: 0, duration: .8, ease: EO }, 21.4)
      .to([S.ps, S.psL, S.pts, S.ptsL, S.reg, S.pou], { o: 0, duration: .6 }, 20.6)
      .to(S.cit, { o: 0, duration: .6 }, 31.4)
      .to(S.fx, { o: 1, duration: .6, ease: EO }, 32.2)
      .to(S.nfx, { n: 16, duration: 4.4, ease: 'power1.inOut' }, 33.0)
      .to(S.fxL, { o: 1, duration: .6, ease: EO }, 35.0)
      .to(S.max, { o: 1, sc: 1, duration: .6, ease: EB }, 40.0)
      .to([S.fx, S.fxL, S.max], { o: 0, duration: .5 }, 45.0);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    node(g, 560, 520, S.ps, { kind: 'CAA', label: 'un commutateur', code: 'PS', sc: 1.25 });
    if (S.psL.o > 0) {
      g.save(); g.globalAlpha = S.psL.o; g.textAlign = 'left';
      setFont(g, F.d, 32, 700, 2.4); g.fillStyle = C.bleu;
      g.fillText('PS  ·  POINT SÉMAPHORE', 760, 404);
      setFont(g, F.b, 23, 500, .3); g.fillStyle = C.encre2;
      g.fillText("c'est lui qui traite SS7 — il vit dans un commutateur", 760, 442);
      g.restore();
    }
    tampon(g, 1180, 560, 'PAS DE PS, PAS DE SS7', S.tam, { color: C.rouge, size: 27, rot: -6 });
    node(g, 560, 880, S.pts, { kind: 'PTS', label: 'aucun abonné raccordé', code: 'PTS', sc: 1.25 });
    if (S.ptsL.o > 0) {
      g.save(); g.globalAlpha = S.ptsL.o; g.textAlign = 'left';
      setFont(g, F.d, 32, 700, 2.4); g.fillStyle = C.bleu;
      g.fillText('PTS  ·  POINT DE TRANSFERT', 760, 770);
      setFont(g, F.b, 23, 500, .3); g.fillStyle = C.encre2;
      g.fillText('il ne fait que faire transiter la signalisation des autres', 760, 808);
      g.restore();
    }
    if (S.reg.o > 0) {
      g.save(); g.globalAlpha = S.reg.o; g.textAlign = 'center';
      setFont(g, F.d, 36, 700, 2.6); g.fillStyle = C.rouge;
      g.fillText('UN PS NE FAIT JAMAIS TRANSITER', 1000, 236);
      surligne(g, 598, 200, 806, clamp(S.reg.o * 1.4), 46);
      g.restore();
    }
    if (S.pou.o > 0) {                                   // la poubelle
      const px = 1500, py = 652;
      g.save(); g.globalAlpha = S.pou.o;
      g.strokeStyle = C.encre2; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(px - 42, py - 44); g.lineTo(px - 32, py + 54);
      g.lineTo(px + 32, py + 54); g.lineTo(px + 42, py - 44); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(px - 54, py - 50); g.lineTo(px + 54, py - 50); g.stroke();
      g.beginPath(); g.moveTo(px - 14, py - 50); g.lineTo(px - 14, py - 62);
      g.lineTo(px + 14, py - 62); g.lineTo(px + 14, py - 50); g.stroke();
      g.globalAlpha = S.pou.o * .5;
      for (let i = -1; i <= 1; i++) {
        g.beginPath(); g.moveTo(px + i * 18, py - 36); g.lineTo(px + i * 18 + 3, py + 44); g.stroke();
      }
      g.restore();
      const from = [740, 652], mid = [1180, 652];
      const x = lerp(from[0], mid[0], S.mv.t);
      const fall = S.jete.t;
      const fx = lerp(mid[0], px, fall), fy = lerp(652, py + 22, fall * fall);
      g.save(); g.globalAlpha = S.pou.o * (1 - fall * .3);
      feuille(g, fall > 0 ? fx : x, fall > 0 ? fy : 652, 1.3, 1, C.rouge);
      g.restore();
      if (S.mv.t > .25 && fall < .3) {
        g.save(); g.globalAlpha = S.pou.o * clamp((S.mv.t - .25) * 3) * (1 - fall * 3);
        g.textAlign = 'center';
        setFont(g, F.m, 19, 500, 2); g.fillStyle = C.rouge;
        g.fillText('CPD ≠ mon code', (fall > 0 ? fx : x), 598);
        g.restore();
      }
    }
    citation(g, 330, 470, ["Si le CT reçoit un message dont la destination finale n'est pas lui,",
                           "il le supprime. Il n'a pas les moyens de faire du transit."],
             S.cit, { size: 44, source: 'le prof' });
    if (S.fx.o > 0) {
      const x1 = 460, x2 = 1540, YC = 600;
      const n = Math.max(1, Math.round(S.nfx.n));
      g.save();
      for (let i = 0; i < n; i++) {
        const y = YC - (n - 1) * 13 + i * 26;
        g.strokeStyle = C.bleu; g.lineWidth = 2.8; g.globalAlpha = S.fx.o * .85;
        g.beginPath(); g.moveTo(x1 + 58, y); g.lineTo(x2 - 58, y); g.stroke();
      }
      g.restore();
      node(g, x1, YC, { o: S.fx.o }, { kind: 'PS', ps: false, sc: 1.15 });
      node(g, x2, YC, { o: S.fx.o }, { kind: 'PS', ps: false, sc: 1.15 });
      g.save(); g.globalAlpha = S.fx.o; g.textAlign = 'center';
      setFont(g, F.d, 40, 700, 2); g.fillStyle = C.bleu;
      g.fillText(String(n), 1000, YC - (n - 1) * 13 - 44);
      setFont(g, F.m, 18, 500, 2.4); g.fillStyle = C.encre3;
      g.fillText(n > 1 ? 'CANAUX SÉMAPHORES' : 'CANAL SÉMAPHORE', 1000, YC - (n - 1) * 13 - 18);
      g.restore();
      if (S.fxL.o > 0) {
        g.save(); g.globalAlpha = S.fxL.o; g.textAlign = 'center';
        setFont(g, F.d, 34, 700, 2.6); g.fillStyle = C.encre;
        g.fillText('UN FAISCEAU  =  2 À 16 CANAUX SÉMAPHORES', 1000, 262);
        setFont(g, F.b, 22, 500, .3); g.fillStyle = C.encre3;
        g.fillText('un canal sémaphore = 64 kbit/s', 1000, 298);
        g.restore();
      }
      postit(g, 1180, 850, 560, 'À RETENIR',
             ['Entre deux mêmes points :', 'quatre faisceaux au maximum.'], S.max);
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 06 · LES TROIS MODES — 59.667 s ══════════════ */
const AX = 360, BX = 1640, PTSX = 1000, PTSY = [330, 520, 710];
function topo(g, u, opt = {}) {
  const { routes = [], live = -1, grey = [], voix = false } = opt;
  if (u <= 0) return;
  g.save(); g.globalAlpha = u;
  PTSY.forEach((y, i) => {
    const off = grey.indexOf(i) >= 0;
    g.globalAlpha = u * (off ? .22 : 1);
    g.fillStyle = '#FBF7EC'; g.beginPath(); g.arc(PTSX, y, 30, 0, 7); g.fill();
    g.strokeStyle = C.bleu; g.lineWidth = 2.8; g.stroke();
    setFont(g, F.m, 15, 500, 1); g.fillStyle = C.bleu; g.textAlign = 'center';
    g.fillText('PTS', PTSX, y + 5);
  });
  g.globalAlpha = u;
  g.restore();
  node(g, AX, 520, { o: u }, { kind: 'CAA', code: 'PS', sc: 1.05 });
  node(g, BX, 520, { o: u }, { kind: 'CAA', code: 'PS', sc: 1.05 });
  routes.forEach(i => {
    const off = grey.indexOf(i) >= 0;
    const a = u * (off ? .18 : 1);
    wire(g, [[AX + 54, 486], [PTSX - 30, PTSY[i]]], 1,
         { color: C.bleu, lw: off ? 2 : 3, alpha: a, dash: [12, 9] });
    wire(g, [[PTSX + 30, PTSY[i]], [BX - 54, 486]], 1,
         { color: C.bleu, lw: off ? 2 : 3, alpha: a, dash: [12, 9] });
  });
  if (voix) wire(g, [[AX, 616], [BX, 616]], 1, { color: C.rouge, lw: 7, alpha: u });
}
const CH6 = {
  dur: 59.667,
  setup(tl, S) {
    addCam(tl, S, [[1.0, 3.0, {z: 1.05}], [8.4, 1.4, {x: 0, y: 0, z: 0.97}], [9.0, 6.0, {z: 1.05, y: 20}], [16.8, 5.0, {y: 110, z: 1.07}], [23.8, 2.0, {y: -90, z: 1.04}], [27.5, 1.4, {x: 0, y: 0, z: 0.965}], [28.2, 8.0, {z: 1.05}], [36.2, 4.0, {y: 90, z: 1.07}], [45.5, 1.4, {x: 0, y: 0, z: 0.965}], [46.2, 7.0, {z: 1.05}], [54.2, 4.0, {x: -80, y: -80, z: 1.08}]]);
    S.q = o(); S.A = o(); S.Aok = o({ sc: 1.4 }); S.cit = o({ dy: 16 }); S.Alim = o();
    S.B = o(); S.bm = { t: 0 }; S.Bx = o({ sc: 1.4 }); S.Bl = o();
    S.Cc = o(); S.cm = { t: 0 }; S.Cok = o({ sc: 1.4 }); S.Cl = o(); S.post = o({ sc: .9 });
    addHeader(tl, S, '06', "LES TROIS MODES D'EXPLOITATION", this.dur);
    tl.to(S.q, { o: 1, p: 1, duration: 1.5, ease: 'none' }, 1.2)
      .to(S.q, { o: 0, duration: .5 }, 8.2)
      .to(S.A, { o: 1, duration: .8, ease: EO }, 8.8)
      .to(S.Aok, { o: 1, sc: 1, duration: .5, ease: EB }, 13.4)
      .to(S.cit, { o: 1, dy: 0, duration: .8, ease: EO }, 17.0)
      .to(S.Alim, { o: 1, duration: .6, ease: EO }, 24.0)
      .to([S.A, S.Aok, S.cit, S.Alim], { o: 0, duration: .6 }, 27.2)
      .to(S.B, { o: 1, duration: .8, ease: EO }, 27.9)
      .to(S.bm, { t: 1, duration: 5.2, ease: 'none' }, 30.0)
      .to(S.Bx, { o: 1, sc: 1, duration: .5, ease: EB }, 36.4)
      .to(S.Bl, { o: 1, duration: .6, ease: EO }, 42.8)
      .to([S.B, S.Bx, S.Bl], { o: 0, duration: .6 }, 45.2)
      .to(S.Cc, { o: 1, duration: .8, ease: EO }, 45.9)
      .to(S.cm, { t: 1, duration: 4.6, ease: 'none' }, 47.4)
      .to(S.Cok, { o: 1, sc: 1, duration: .5, ease: EB }, 51.4)
      .to(S.Cl, { o: 1, duration: .6, ease: EO }, 52.2)
      .to(S.post, { o: 1, sc: 1, duration: .6, ease: EB }, 54.6)
      .to([S.Cc, S.Cok, S.Cl, S.post], { o: 0, duration: .5 }, 58.6);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.q.o > 0) {
      g.save(); g.globalAlpha = S.q.o; g.textAlign = 'center';
      setFont(g, F.h, 70, 700, 0); g.fillStyle = C.encre;
      typeOn(g, 'par où passe la signalisation,', 1000, 480, clamp(S.q.p * 2), 'center');
      typeOn(g, 'par rapport à la parole ?', 1000, 566, clamp(S.q.p * 2 - 1), 'center');
      g.globalAlpha = S.q.o * clamp(S.q.p * 3 - 2);
      setFont(g, F.d, 30, 700, 4); g.fillStyle = C.rouge;
      g.fillText('TROIS RÉPONSES  ·  TROIS MODES', 1000, 680);
      g.restore();
    }
    const titre = (nm, sous, col) => {
      g.save(); g.textAlign = 'center';
      setFont(g, F.d, 44, 700, 3); g.fillStyle = col;
      g.fillText(nm, 1000, 220);
      setFont(g, F.b, 22, 500, .3); g.fillStyle = C.encre2;
      g.fillText(sous, 1000, 256);
      g.restore();
    };
    if (S.A.o > 0) {
      g.save(); g.globalAlpha = S.A.o; titre('MODE ASSOCIÉ', 'aucun transfert au milieu', C.vert); g.restore();
      node(g, AX, 520, { o: S.A.o }, { kind: 'CAA', code: 'PS', sc: 1.05 });
      node(g, BX, 520, { o: S.A.o }, { kind: 'CAA', code: 'PS', sc: 1.05 });
      wire(g, [[AX + 54, 470], [BX - 54, 470]], S.A.o, { color: C.bleu, lw: 4, dash: [13, 10] });
      wire(g, [[AX, 616], [BX, 616]], S.A.o, { color: C.rouge, lw: 7 });
      g.save(); g.globalAlpha = S.A.o; g.textAlign = 'center';
      setFont(g, F.b, 20, 600, .4); g.fillStyle = C.bleu;
      g.fillText('LA SIGNALISATION', 1000, 444);
      g.fillStyle = C.rouge; g.fillText('LA PAROLE  —  MÊME TRAJET', 1000, 660);
      g.restore();
      coche(g, 1000, 742, 1.8, S.Aok.o);
    }
    citation(g, 330, 806, ['Deux CAA ne peuvent pas communiquer en mode associé',
                           'si les deux PS ne sont pas liés directement.'],
             S.cit, { size: 42, source: 'le prof' });
    if (S.Alim.o > 0) {
      g.save(); g.globalAlpha = S.Alim.o; g.textAlign = 'center';
      setFont(g, F.h, 48, 700, 0); g.fillStyle = C.rouge;
      g.fillText('…un lien direct partout ? impossible à l\'échelle d\'un pays', 1000, 334);
      g.restore();
    }
    if (S.B.o > 0) {
      g.save(); g.globalAlpha = S.B.o; titre('MODE NON ASSOCIÉ', 'tous les chemins sont permis', C.encre); g.restore();
      topo(g, S.B.o, { routes: [0, 1, 2] });
      const ORD = [1, 0, 2];                       // 1 → PTS1, 2 → PTS0, 3 → PTS2
      for (let k = 0; k < 3; k++) {
        const u = clamp(S.bm.t * 1.5 - k * .18);
        if (u <= 0) continue;
        const i = ORD[k];
        const path = [[AX + 54, 486], [PTSX, PTSY[i]], [BX - 54, 486]];
        const spd = [1.0, 0.62, 0.86][k];
        const p = runner(g, path, clamp(u * spd), { color: C.bleu, r: 15, alpha: S.B.o });
        if (p) {
          g.save(); g.globalAlpha = S.B.o;
          setFont(g, F.d, 19, 700, 0); g.fillStyle = '#FBF7EC'; g.textAlign = 'center';
          g.fillText(String(k + 1), p[0], p[1] + 7);
          g.restore();
        }
      }
      if (S.Bx.o > 0) {
        g.save(); g.globalAlpha = S.Bx.o; g.textAlign = 'center';
        setFont(g, F.d, 30, 700, 3); g.fillStyle = C.rouge;
        g.fillText('ARRIVÉE :   2   ·   1   ·   3', 1000, 800);
        g.restore();
        croix(g, 1000, 858, 1.6, S.Bx.o);
      }
      if (S.Bl.o > 0) {
        g.save(); g.globalAlpha = S.Bl.o; g.textAlign = 'center';
        setFont(g, F.h, 50, 700, 0); g.fillStyle = C.rouge;
        g.fillText('SS7 ne sait pas remettre dans l\'ordre  →  interdit pour la voix', 1000, 930);
        g.restore();
      }
    }
    if (S.Cc.o > 0) {
      g.save(); g.globalAlpha = S.Cc.o; titre('MODE QUASI-ASSOCIÉ', 'plusieurs chemins, un seul choisi', C.vert); g.restore();
      topo(g, S.Cc.o, { routes: [0, 1, 2], grey: [0, 2] });
      for (let k = 0; k < 3; k++) {
        const u = clamp(S.cm.t * 1.45 - k * .22);
        if (u <= 0) continue;
        const path = [[AX + 54, 486], [PTSX, PTSY[1]], [BX - 54, 486]];
        const p = runner(g, path, u, { color: C.bleu, r: 15, alpha: S.Cc.o });
        if (p) {
          g.save(); g.globalAlpha = S.Cc.o;
          setFont(g, F.d, 19, 700, 0); g.fillStyle = '#FBF7EC'; g.textAlign = 'center';
          g.fillText(String(k + 1), p[0], p[1] + 7);
          g.restore();
        }
      }
      if (S.Cok.o > 0) {
        g.save(); g.globalAlpha = S.Cok.o; g.textAlign = 'center';
        setFont(g, F.d, 30, 700, 3); g.fillStyle = C.vert;
        g.fillText('ARRIVÉE :   1   ·   2   ·   3', 1000, 800);
        g.restore();
        coche(g, 1000, 858, 1.7, S.Cok.o);
      }
      if (S.Cl.o > 0) {
        g.save(); g.globalAlpha = S.Cl.o; g.textAlign = 'center';
        setFont(g, F.h, 50, 700, 0); g.fillStyle = C.vert;
        g.fillText("la résistance du non associé, et l'ordre de l'associé", 1000, 930);
        g.restore();
      }
      postit(g, 1300, 272, 560, "PIÈGE D'EXAMEN",
             ["SS7 n'est spécifié que pour", "l'associé et le quasi-associé."], S.post);
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 07 · L'ADRESSE — 46.083 s ══════════════ */
const CH7 = {
  dur: 46.083,
  setup(tl, S) {
    addCam(tl, S, [[1.0, 2.6, {z: 1.07}], [4.6, 4.0, {z: 1.1, y: -30}], [7.8, 4.0, {y: 120, z: 1.06}], [15.8, 4.0, {x: -120, y: -20, z: 1.1}], [19.2, 3.0, {x: 120, z: 1.1}], [21.8, 2.0, {x: 0, y: 40, z: 1.04}], [32.4, 1.4, {x: 0, y: 0, z: 0.97}], [33.2, 6.0, {z: 1.05}], [39.8, 5.0, {y: 70, z: 1.07}]]);
    S.code = o({ sc: .9 }); S.d = [o(), o(), o()]; S.zon = o();
    S.tab = o(); S.ln = [o({ dx: -20 }), o({ dx: -20 }), o({ dx: -20 }), o({ dx: -20 })];
    S.deux = o(); S.ana = o();
    addHeader(tl, S, '07', 'LIRE UN CODE DE POINT SÉMAPHORE', this.dur);
    tl.to(S.code, { o: 1, sc: 1, duration: .8, ease: EB }, 1.3)
      .to(S.d[0], { o: 1, p: 1, duration: .7, ease: EO }, 4.8)
      .to(S.zon, { o: 1, duration: .7, ease: EO }, 8.0)
      .to(S.d[1], { o: 1, p: 1, duration: .7, ease: EO }, 16.0)
      .to(S.d[2], { o: 1, p: 1, duration: .7, ease: EO }, 19.4)
      .to([S.zon, S.d[0], S.d[1], S.d[2]], { o: 0, duration: .5 }, 21.4)
      .to(S.tab, { o: 1, duration: .6, ease: EO }, 22.0)
      .to(S.ln[0], { o: 1, dx: 0, duration: .5, ease: EO }, 22.8)
      .to(S.ln[1], { o: 1, dx: 0, duration: .5, ease: EO }, 24.4)
      .to(S.ln[2], { o: 1, dx: 0, duration: .5, ease: EO }, 26.0)
      .to(S.ln[3], { o: 1, dx: 0, duration: .5, ease: EO }, 27.6)
      .to([S.tab, S.ln[0], S.ln[1], S.ln[2], S.ln[3], S.code, S.d[0], S.d[1], S.d[2]],
          { o: 0, duration: .6 }, 32.6)
      .to(S.deux, { o: 1, duration: .8, ease: EO }, 33.4)
      .to(S.ana, { o: 1, duration: .7, ease: EO }, 40.0)
      .to([S.deux, S.ana], { o: 0, duration: .5 }, 45.0);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    const CY = 360;
    if (S.code.o > 0) {
      g.save(); g.globalAlpha = S.code.o; g.textAlign = 'center';
      g.translate(1000, CY); g.scale(S.code.sc, S.code.sc); g.translate(-1000, -CY);
      setFont(g, F.d, 150, 700, 8); g.fillStyle = C.encre;
      g.fillText('6 - 016 - 1', 1000, CY);
      g.restore();
    }
    const PART = [[756, 96, 'ZONE MONDIALE', "l'Afrique", C.rouge, 0],
                  [1000, 212, 'ZONE DE SIGNALISATION', 'le Sénégal', C.bleu, 104],
                  [1248, 96, 'IDENTITÉ DU POINT', 'le point lui-même', C.vert, 208]];
    S.d.forEach((s, i) => {
      if (s.o <= 0) return;
      const [x, w, nm, sub, col, dd] = PART[i];
      g.save(); g.globalAlpha = s.o; g.textAlign = 'center';
      g.strokeStyle = col; g.lineWidth = 3; g.lineCap = 'round';
      const ww = w * s.p;
      g.beginPath();
      g.moveTo(x - ww / 2, CY + 34); g.lineTo(x - ww / 2, CY + 52);
      g.lineTo(x + ww / 2, CY + 52); g.lineTo(x + ww / 2, CY + 34); g.stroke();
      g.beginPath(); g.moveTo(x, CY + 52); g.lineTo(x, CY + 56 + (26 + dd) * s.p); g.stroke();
      g.globalAlpha = s.o * clamp(s.p * 2 - 1);
      setFont(g, F.d, 22, 700, 2.2); g.fillStyle = col;
      g.fillText(nm, x, CY + 112 + dd);
      setFont(g, F.h, 38, 700, 0); g.fillStyle = C.encre;
      g.fillText(sub, x, CY + 154 + dd);
      g.restore();
    });
    if (S.zon.o > 0) {
      const Z = [['2', 'Europe'], ['3', 'États-Unis'], ['4', 'Asie'],
                 ['5', 'Australie'], ['6', 'Afrique'], ['7', 'Amérique du Sud']];
      g.save(); g.globalAlpha = S.zon.o; g.textAlign = 'left';
      setFont(g, F.m, 17, 500, 3.4); g.fillStyle = C.encre3;
      g.fillText('LES ZONES MONDIALES  ·  0 ET 1 SONT RÉSERVÉES', 560, 742);
      Z.forEach(([k, nm], i) => {
        const x = 560 + (i % 3) * 320, y = 800 + Math.floor(i / 3) * 62;
        const hot = k === '6';
        g.globalAlpha = S.zon.o * clamp(S.zon.o * 6 - i);
        setFont(g, F.d, 40, 700, 0); g.fillStyle = hot ? C.rouge : C.encre;
        g.fillText(k, x, y);
        setFont(g, F.b, 23, hot ? 600 : 400, .3); g.fillStyle = hot ? C.rouge : C.encre2;
        g.fillText(nm, x + 44, y);
      });
      g.restore();
    }
    if (S.tab.o > 0) {
      const R = [['6-016-1', 'CTI THIAROYE'], ['6-016-2', 'CTI MÉDINA'],
                 ['6-016-5', 'PTS TECHNOPOLE'], ['6-016-6', 'PTS DAKAR RP']];
      g.save(); g.globalAlpha = S.tab.o; g.textAlign = 'center';
      setFont(g, F.m, 17, 500, 3.4); g.fillStyle = C.encre3;
      g.fillText('LES VRAIS CODES DU RÉSEAU SÉNÉGALAIS  ·  TD DU PROF', 1000, 646);
      g.restore();
      S.ln.forEach((s, i) => {
        if (s.o <= 0) return;
        g.save(); g.globalAlpha = s.o; g.translate(s.dx, 0); g.textAlign = 'left';
        const y = 724 + i * 62;
        setFont(g, F.m, 40, 500, 2); g.fillStyle = C.bleu;
        g.fillText(R[i][0], 660, y);
        setFont(g, F.b, 26, 500, .4); g.fillStyle = C.encre;
        g.fillText(R[i][1], 950, y);
        g.restore();
      });
      if (S.ln[3].o > 0) {
        g.save(); g.globalAlpha = S.ln[3].o; g.textAlign = 'center';
        setFont(g, F.h, 42, 700, 0); g.fillStyle = C.rouge;
        g.fillText('seul le dernier chiffre change', 1000, 972);
        g.restore();
      }
    }
    if (S.deux.o > 0) {
      g.save(); g.globalAlpha = S.deux.o; g.textAlign = 'center';
      setFont(g, F.d, 36, 700, 2.6); g.fillStyle = C.encre;
      g.fillText('UN MÊME POINT PEUT PORTER PLUSIEURS CODES', 1000, 330);
      g.restore();
      node(g, 1000, 530, { o: S.deux.o }, { kind: 'CTI', label: 'une seule machine', ps: false, sc: 1.4 });
      const L = [['PLAN NATIONAL', '6-016-1', -330], ['PLAN INTERNATIONAL', 'code UIT-T Q.708', 330]];
      L.forEach(([nm, cd, dx], i) => {
        g.save(); g.globalAlpha = S.deux.o; g.textAlign = 'center';
        flecheD(g, 1000 + dx * .33, 530, 1000 + dx * .72, 530, clamp(S.deux.o * 1.6),
                { color: C.bleu, lw: 3 });
        setFont(g, F.m, 16, 500, 2.8); g.fillStyle = C.encre3;
        g.fillText(nm, 1000 + dx, 492);
        setFont(g, F.d, 38, 700, 2); g.fillStyle = C.bleu;
        g.fillText(cd, 1000 + dx, 544);
        g.restore();
      });
    }
    if (S.ana.o > 0) {
      g.save(); g.globalAlpha = S.ana.o; g.textAlign = 'center';
      setFont(g, F.h, 56, 700, 0); g.fillStyle = C.rouge;
      g.fillText('un surnom au basket, un autre au foot', 1000, 752);
      setFont(g, F.b, 22, 500, .3); g.fillStyle = C.encre3;
      g.fillText('même corps, plusieurs identités selon le plan où il joue', 1000, 800);
      g.restore();
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 08 · LA PILE — 46.458 s ══════════════
   plate Blender « pile » 5.0 → 36.0 s                   */
const CH8 = {
  dur: 46.458, bl: { dir: 'pile', from: 5.0, to: 28.8 },
  setup(tl, S) {
    addCam(tl, S, [[0.6, 3.0, {z: 1.03}], [4.2, 12.0, {z: 1.07, x: -50}], [18.0, 6.0, {x: 60, z: 1.05}], [25.6, 5.0, {y: -90, z: 1.05}], [34.8, 1.6, {x: 0, y: 0, z: 0.97}], [36.8, 6.0, {z: 1.05}]]);
    S.bl = o(); S.tab = o(); S.r = [o({ dx: -18 }), o({ dx: -18 }), o({ dx: -18 }), o({ dx: -18 })];
    S.fin = o({ sc: .94 });
    addHeader(tl, S, '08', 'LA PILE  ·  QUI PARLE À QUI', this.dur);
    tl.to(S.bl, { o: 1, duration: 1.1, ease: EO }, 4.4)
      .to(S.tab, { o: 1, duration: .6, ease: EO }, 25.0)
      .to(S.r[0], { o: 1, dx: 0, duration: .45, ease: EO }, 25.8)
      .to(S.r[1], { o: 1, dx: 0, duration: .45, ease: EO }, 27.0)
      .to(S.r[2], { o: 1, dx: 0, duration: .45, ease: EO }, 28.2)
      .to(S.r[3], { o: 1, dx: 0, duration: .45, ease: EO }, 29.4)
      .to([S.tab, S.r[0], S.r[1], S.r[2], S.r[3]], { o: 0, duration: .6 }, 35.0)
      .to(S.bl, { o: 0, duration: 1.0 }, 35.4)
      .to(S.fin, { o: 1, sc: 1, duration: .8, ease: EB }, 37.0)
      .to(S.fin, { o: 0, duration: .5 }, 45.4);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    page(g, null);
    plate(g, pl, S.bl.o);
    if (S.tab.o > 0) {
      panneau(g, 236, 744, 1180, 316, S.tab.o, 0.93);
      const R = [['0000', 'gestion du réseau', 'reste au niveau 3', C.rouge],
                 ['0001', 'essai du réseau', 'reste au niveau 3', C.rouge],
                 ['0100', 'SSUT', 'téléphonie — niveau 4', C.bleu],
                 ['0110', 'SSUD', 'données — niveau 4', C.bleu]];
      g.save(); g.globalAlpha = S.tab.o; g.textAlign = 'left';
      setFont(g, F.m, 17, 500, 3.4); g.fillStyle = C.encre3;
      g.fillText("L'INDICATEUR DE SERVICE  ·  4 BITS  ·  DCBA", 288, 800);
      g.restore();
      S.r.forEach((s, i) => {
        if (s.o <= 0) return;
        g.save(); g.globalAlpha = s.o; g.translate(s.dx, 0); g.textAlign = 'left';
        const y = 858 + i * 50;
        setFont(g, F.m, 34, 500, 3); g.fillStyle = R[i][3];
        g.fillText(R[i][0], 288, y);
        setFont(g, F.d, 27, 700, 1.8); g.fillStyle = C.encre;
        g.fillText(R[i][1], 512, y);
        setFont(g, F.b, 21, 500, .3); g.fillStyle = C.encre3;
        g.fillText(R[i][2], 800, y);
        g.restore();
      });
    }
    if (S.fin.o > 0) {
      g.save(); g.globalAlpha = S.fin.o; g.textAlign = 'center';
      g.translate(1000, 540); g.scale(S.fin.sc, S.fin.sc); g.translate(-1000, -540);
      setFont(g, F.d, 150, 700, 4); g.fillStyle = C.bleu;
      g.fillText('4 BITS', 1000, 500);
      surligne(g, 762, 414, 476, clamp((S.fin.o - .3) / .7), 96);
      setFont(g, F.h, 62, 700, 0); g.fillStyle = C.encre;
      g.fillText('et tout le monde reçoit son courrier', 1000, 620);
      g.restore();
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 09 · LA FICHE — 55.375 s ══════════════ */
const CH9 = {
  dur: 55.375,
  setup(tl, S) {
    addCam(tl, S, [[0.9, 2.4, {z: 1.045}], [2.4, 16.0, {y: 60, z: 1.07}], [20.0, 14.0, {y: 90, z: 1.06}], [38.4, 1.4, {x: 0, y: 0, z: 0.97}], [39.2, 5.0, {z: 1.05, y: -20}], [45.4, 1.2, {x: 0, y: 0, z: 0.98}], [49.8, 5.5, {z: 1.04}]]);
    S.card = o({ sc: .94 }); S.b = []; for (let i = 0; i < 8; i++) S.b.push(o({ dx: -16 }));
    S.cit = o({ dy: 16 }); S.sig = o({ p: 0 }); S.next = o();
    addHeader(tl, S, '09', 'CE QU\'IL FAUT RETENIR', this.dur);
    tl.to(S.card, { o: 1, sc: 1, duration: .8, ease: EB }, 1.1);
    const T = [2.6, 6.0, 11.0, 15.4, 20.2, 25.0, 29.4, 33.2];
    S.b.forEach((s, i) => tl.to(s, { o: 1, dx: 0, duration: .5, ease: EO }, T[i]));
    tl.to([S.card, ...S.b], { o: 0, duration: .6 }, 38.6)
      .to(S.cit, { o: 1, dy: 0, duration: .8, ease: EO }, 39.4)
      .to(S.cit, { o: 0, duration: .5 }, 45.0)
      .to(S.next, { o: 1, duration: .7, ease: EO }, 45.6)
      .to(S.next, { o: 0, duration: .5 }, 49.6)
      .to(S.sig, { o: 1, duration: .9, ease: EO }, 50.0)
      .to(S.sig, { p: 1, duration: 1.4, ease: EO }, 50.4);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    const B = [
      ['SIGNALER', 'établir  ·  superviser  ·  rompre'],
      ['VOIE PAR VOIE', 'les papiers voyagent avec la parole — et tombent avec elle'],
      ['VOIE COMMUNE = SS7', 'une route à part, des messages étiquetés, 64 kbit/s'],
      ['LE N°6 A ÉCHOUÉ', '2,4 kbit/s ne tombe pas juste dans un intervalle de 64'],
      ['PS  /  PTS', 'un PS ne transite jamais — seul le PTS réachemine'],
      ['TROIS MODES', 'associé · non associé · QUASI-ASSOCIÉ pour la voix'],
      ["L'ADRESSE", '6-016-1 : zone mondiale · zone de signalisation · le point'],
      ["L'INS", '4 bits au niveau 3 — ils aiguillent vers le bon sous-système'],
    ];
    if (S.card.o > 0) {
      fiche(g, 250, 170, 1500, 790, S.card, (gg, x, y, w, h, u) => {
        gg.textAlign = 'left';
        setFont(gg, F.m, 17, 500, 4.2); gg.fillStyle = C.rouge;
        gg.fillText('FICHE DE RÉVISION  ·  ÉPISODE 1', x + 52, y + 58);
        setFont(gg, F.d, 44, 700, 2.2); gg.fillStyle = C.encre;
        gg.fillText('LA ROUTE PARALLÈLE', x + 52, y + 116);
        gg.strokeStyle = 'rgba(28,43,51,.18)'; gg.lineWidth = 1.4;
        gg.beginPath(); gg.moveTo(x + 52, y + 142); gg.lineTo(x + w - 52, y + 142); gg.stroke();
      });
      S.b.forEach((s, i) => {
        if (s.o <= 0) return;
        g.save(); g.globalAlpha = s.o; g.translate(s.dx, 0); g.textAlign = 'left';
        const y = 372 + i * 76;
        g.fillStyle = C.rouge; g.beginPath(); g.arc(320, y - 9, 5.5, 0, 7); g.fill();
        setFont(g, F.d, 26, 700, 2); g.fillStyle = C.encre;
        g.fillText(B[i][0], 348, y);
        setFont(g, F.b, 22, 500, .3); g.fillStyle = C.encre2;
        g.fillText(B[i][1], 348, y + 30);
        g.restore();
      });
    }
    citation(g, 420, 480, ['On commence par les fonctions du SSTM.', 'La prochaine fois.'],
             S.cit, { size: 58, source: 'le prof, fin de séance' });
    if (S.next.o > 0) {
      g.save(); g.globalAlpha = S.next.o; g.textAlign = 'center';
      setFont(g, F.d, 28, 700, 4.4); g.fillStyle = C.rouge;
      g.fillText('ÉPISODE 2', 1000, 436);
      setFont(g, F.h, 76, 700, 0); g.fillStyle = C.encre;
      g.fillText('la trame', 1000, 538);
      setFont(g, F.b, 25, 500, .3); g.fillStyle = C.encre2;
      g.fillText('on ouvre le message — fanion, CRT, et enfin BIR, BIA, NSA, NSR', 1000, 606);
      g.restore();
    }
    signature(g, S.sig, 'UN COURS MIS EN IMAGES PAR', 'Signalisation Sémaphore N°7  ·  Épisode 1  ·  La route parallèle');
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

const CHAPTERS = [CH0, CH1, CH2, CH3, CH4, CH5, CH6, CH7, CH8, CH9];
