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

/* ══════════════ 00 · L'ACCROCHE — 21.542 s ══════════════ */
const CH0 = {
  dur: 21.542,
  setup(tl, S) {
    const T = i => L(0, i);                      // repères mesurés dans la voix
    addCam(tl, S, [[0.6,2.4,{z:1.05}],[8.2,5.6,{x:-60,z:1.065}],
                   [13.9,1.0,{x:0,y:0,z:0.99}],[14.6,6.5,{z:1.05}]]);
    S.rap = o(); S.bits = o(); S.tit = o({ dy: 26 }); S.sous = o(); S.pied = o();
    tl.to(S.rap, { o: 1, p: 1, duration: 1.6, ease: 'none' }, T(0) - 0.3)
      .to(S.bits, { o: 1, p: 1, duration: 2.4, ease: EX }, T(3) - 0.4)
      .to([S.rap, S.bits], { o: 0, duration: .6 }, T(4) - 0.3)
      .to(S.tit, { o: 1, dy: 0, duration: .8, ease: EO }, T(4) + 0.1)
      .to(S.sous, { o: 1, p: 1, duration: 1.2, ease: 'none' }, T(5) - 0.2)
      .to(S.pied, { o: 1, duration: .6, ease: EO }, T(5) + 2.2);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.rap.o > 0) {
      g.save(); g.globalAlpha = S.rap.o; g.textAlign = 'center';
      setFont(g, F.m, 18, 500, 5); g.fillStyle = C.encre3;
      g.fillText('ÉPISODE 1  ·  ON A CONSTRUIT LA ROUTE', 1000, 330);
      g.restore();
      trait(g, 300, 392, 1700, 392, S.rap.p, { color: C.bleu, lw: 5, amp: 2, dash: [18, 14] });
      g.save(); g.globalAlpha = S.rap.o * clamp(S.rap.p * 2 - 1); g.textAlign = 'center';
      setFont(g, F.h, 54, 700, 0); g.fillStyle = C.encre;
      g.fillText("aujourd'hui, on ouvre ce qui roule", 1000, 486);
      g.restore();
    }
    if (S.bits.o > 0) {
      const b = '01111110 10110100 00101101 11010011 01111110';
      g.save(); g.globalAlpha = S.bits.o; g.textAlign = 'center';
      setFont(g, F.m, 40, 500, 2.4); g.fillStyle = C.encre2;
      const n = Math.floor(b.length * S.bits.p);
      g.fillText(b.slice(0, n), 1000, 640);
      g.globalAlpha = S.bits.o * clamp(S.bits.p * 2 - 1);
      setFont(g, F.b, 24, 500, .3); g.fillStyle = C.rouge;
      g.fillText('il doit arriver intact  —  une erreur ici, et deux abonnés sont coupés', 1000, 706);
      g.restore();
    }
    if (S.tit.o > 0) {
      g.save(); g.globalAlpha = S.tit.o; g.textAlign = 'center';
      g.translate(0, S.tit.dy);
      setFont(g, F.m, 20, 500, 7); g.fillStyle = C.encre3;
      g.fillText('SIGNALISATION  SÉMAPHORE  N°7', 1000, 404);
      setFont(g, F.d, 150, 700, 3); g.fillStyle = C.encre;
      g.fillText('LA TRAME', 1000, 554);
      surligne(g, 648, 440, 706, clamp((S.tit.o - .4) / .6), 124, 'rgba(242,193,78,.46)');
      g.restore();
    }
    if (S.sous.o > 0) {
      g.save(); g.globalAlpha = S.sous.o; g.textAlign = 'center';
      setFont(g, F.d, 30, 700, 5); g.fillStyle = C.rouge;
      g.fillText('ÉPISODE 2', 1000, 636);
      setFont(g, F.h, 66, 700, 0); g.fillStyle = C.encre;
      typeOn(g, 'du bit à la conversation', 1000, 716, S.sous.p, 'center');
      g.restore();
    }
    if (S.pied.o > 0) {
      g.save(); g.globalAlpha = S.pied.o; g.textAlign = 'center';
      setFont(g, F.b, 20, 400, .4); g.fillStyle = C.encre3;
      g.fillText('séances 02 et 03  ·  le SSTM en entier, et l\'entrée dans le niveau 4', 1000, 812);
      g.restore();
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 01 · DE LA LIGNE AU CANAL — 64.625 s ══════════════ */
const CH1 = {
  dur: 64.625,
  setup(tl, S) {
    addCam(tl, S, [[1.0,2.4,{z:1.05}],[4.0,8.0,{x:-70,z:1.065}],
                   [13.0,1.4,{x:0,y:0,z:0.99}],[14.0,9.0,{z:1.05,y:30}],
                   [26.0,2.0,{x:0,y:-40,z:1.02}],[28.0,10.0,{z:1.06,y:20}],
                   [40.0,1.6,{x:0,y:0,z:0.99}],[41.0,8.0,{z:1.05}],
                   [50.0,10.0,{y:70,z:1.065}]]);
    S.def = o(); S.cit = o({ dy: 16 });
    S.e = [o({ dy: 18 }), o({ dy: 18 }), o({ dy: 18 })];
    S.form = o({ sc: .9 }); S.aux = o({ dy: 16 }); S.cinq = o(); S.li = [];
    for (let i = 0; i < 5; i++) S.li.push(o({ dx: -16 }));
    addHeader(tl, S, '01', 'DE LA LIGNE AU CANAL', this.dur);
    const T = i => L(1, i);                      // repères mesurés dans la voix
    // L0-L2 · la définition      L4-L6 · la citation du prof
    tl.to(S.def, { o: 1, p: 1, duration: 1.4, ease: 'none' }, T(0) - 0.3)
      .to(S.cit, { o: 1, dy: 0, duration: .7, ease: EO }, T(4) - 0.6)
      .to([S.def, S.cit], { o: 0, duration: .6 }, T(7) - 0.5)
    // L7-L10 · les trois étapes, chacune sur sa phrase
      .to(S.e[0], { o: 1, dy: 0, duration: .6, ease: EO }, T(7) + 0.2)
      .to(S.e[1], { o: 1, dy: 0, duration: .6, ease: EO }, T(8) + 0.1)
      .to(S.e[2], { o: 1, dy: 0, duration: .6, ease: EO }, T(10) + 0.1)
      .to([S.e[0], S.e[1], S.e[2]], { o: 0, duration: .6 }, T(11) - 0.5)
    // L11 · « formule à graver »
      .to(S.form, { o: 1, sc: 1, duration: .8, ease: EB }, T(11) - 0.1)
      .to(S.form, { o: 0, duration: .6 }, T(13) - 0.9)
    // L13-L15 · où vit le terminal : une ressource partagée
      .to(S.aux, { o: 1, dy: 0, duration: .7, ease: EO }, T(13) - 0.5)
      .to(S.aux, { o: 0, duration: .6 }, this.dur - 1.1);
    // L'annonce « les cinq fonctions » a été retirée d'ici : elle arrivait
    // AVANT que la voix n'en parle, et le chapitre 02 enchaînait sur autre
    // chose pendant qu'il les énumérait. Elles sont maintenant dans le 02,
    // posées une par une sur ses mots.
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.def.o > 0) {
      g.save(); g.globalAlpha = S.def.o; g.textAlign = 'center';
      setFont(g, F.m, 18, 500, 5); g.fillStyle = C.rouge;
      g.fillText('NIVEAU 1  ·  LA COUCHE PHYSIQUE', 1000, 318);
      setFont(g, F.d, 64, 700, 2); g.fillStyle = C.encre;
      g.fillText('LA LIAISON SÉMAPHORE DE DONNÉES', 1000, 400);
      setFont(g, F.h, 54, 700, 0); g.fillStyle = C.bleu;
      typeOn(g, 'transporter des bits, dans les deux sens, à 64 kbit/s',
             1000, 478, S.def.p, 'center');
      g.restore();
    }
    citation(g, 330, 588, ['La liaison sémaphore de données, avant de devenir une liaison',
                           "sémaphore de données, c'est d'abord une liaison de données.",
                           "C'est quand on décide d'envoyer la signalisation dessus",
                           "qu'on l'appelle une liaison sémaphore de données."],
             S.cit, { size: 40, source: 'le prof' });
    const ET = [['UN INTERVALLE DE TEMPS', 'une liaison de données comme une autre', C.encre2],
                ['SEMI-PERMANENTE', 'figée en mode données — on loue au mois, on ne prend pas un taxi', C.or],
                ['SÉMAPHORE', 'le jour où on branche un terminal sémaphore à chaque bout', C.bleu]];
    S.e.forEach((s, i) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o; g.translate(0, s.dy); g.textAlign = 'left';
      const y = 360 + i * 150;
      setFont(g, F.d, 54, 700, 0); g.fillStyle = ET[i][2];
      g.fillText(String(i + 1), 330, y + 10);
      setFont(g, F.d, 34, 700, 2.2); g.fillStyle = C.encre;
      g.fillText(ET[i][0], 420, y - 8);
      setFont(g, F.b, 22, 500, .3); g.fillStyle = C.encre2;
      g.fillText(ET[i][1], 420, y + 26);
      g.restore();
      if (i < 2 && s.o > .5) flecheD(g, 352, y + 34, 352, y + 108, clamp((s.o - .5) * 2),
                                    { color: C.encre3, lw: 2 });
    });
    if (S.form.o > 0) {
      fiche(g, 250, 390, 1500, 290, S.form, (gg, x, y, w, h, u) => {
        gg.textAlign = 'center';
        setFont(gg, F.m, 17, 500, 4.4); gg.fillStyle = C.rouge;
        gg.fillText('FORMULE À GRAVER', x + w / 2, y + 60);
        setFont(gg, F.d, 46, 700, 1.6); gg.fillStyle = C.encre;
        gg.fillText('CANAL SÉMAPHORE  =  TS  +  LSD  +  TS', x + w / 2, y + 150);
        setFont(gg, F.b, 23, 500, .3); gg.fillStyle = C.encre2;
        gg.fillText('terminal sémaphore  +  liaison sémaphore de données  +  terminal sémaphore',
                    x + w / 2, y + 206);
      });
      surligne(g, 486, 506, 1030, clamp((S.form.o - .3) / .7), 56);
    }
    citation(g, 330, 420, ["Tout ce qui est dans l'unité de raccordement des abonnés, ce sont",
                           'des ressources affectées individuellement à chaque abonné.',
                           'Mais la signalisation téléphonique sert à tous ceux qui veulent',
                           "appeler. Donc on la met dans l'auxiliaire."],
             S.aux, { size: 40, source: 'le prof' });
    if (S.aux.o > 0) {
      g.save(); g.globalAlpha = S.aux.o; g.textAlign = 'center';
      setFont(g, F.h, 56, 700, 0); g.fillStyle = C.bleu;
      g.fillText('le terminal vit dans les AUX  —  une ressource partagée', 1000, 790);
      g.restore();
    }
    if (S.cinq.o > 0) {
      g.save(); g.globalAlpha = S.cinq.o; g.textAlign = 'center';
      setFont(g, F.d, 36, 700, 2.6); g.fillStyle = C.encre;
      g.fillText('NIVEAU 2  ·  LES CINQ FONCTIONS DU CANAL', 1000, 300);
      g.restore();
      const L = ['DÉLIMITER  —  trouver le début et la fin de chaque trame',
                 "DÉTECTER L'ERREUR  —  le contrôle de trame",
                 'CORRIGER  —  faire retransmettre',
                 'SUPERVISER  —  le canal est-il encore digne de confiance ?',
                 'ALIGNER  —  mettre les deux terminaux en phase au démarrage'];
      S.li.forEach((s, i) => {
        if (s.o <= 0) return;
        g.save(); g.globalAlpha = s.o; g.translate(s.dx, 0); g.textAlign = 'left';
        const y = 410 + i * 84;
        g.fillStyle = C.bleu; g.beginPath(); g.arc(352, y - 9, 16, 0, 7); g.fill();
        setFont(g, F.d, 20, 700, 0); g.fillStyle = '#FBF7EC'; g.textAlign = 'center';
        g.fillText(String(i + 1), 352, y - 2);
        setFont(g, F.b, 27, 500, .3); g.fillStyle = C.encre; g.textAlign = 'left';
        g.fillText(L[i], 396, y);
        g.restore();
      });
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 02 · ANATOMIE DE LA TRAME — 47.292 s ══════════════
   plate Blender « trame » 9.5 → 23.5 s                               */
const CH2 = {
  dur: 47.292, bl: { dir: 'trame', from: 8.8, to: 22.8 },
  setup(tl, S) {
    const T = i => L(2, i), F_ = i => LE(2, i);   // repères mesurés dans la voix
    addCam(tl, S, [[0.8,2.4,{z:1.05}],[2.0,6.2,{y:-40,z:1.06}],
                   [8.4,1.0,{x:0,y:0,z:0.99}],[8.9,13.4,{z:1.06,x:-40}],
                   [22.6,1.2,{x:0,y:0,z:0.99}],[23.4,7.6,{z:1.05,y:20}],
                   [31.2,1.2,{x:0,y:0,z:0.99}],[32.0,13.4,{z:1.05}]]);
    S.colis = o(); S.bl = o(); S.cit = o({ dy: 16 }); S.pie = o(); S.ord = o(); S.c = [];
    S.ftit = o(); S.f = [];
    for (let i = 0; i < 5; i++) S.f.push(o({ dy: 22 }));
    for (let i = 0; i < 6; i++) S.c.push(o({ dy: 20 }));
    S.pas = o({ sc: 1.4 });
    addHeader(tl, S, '02', 'ANATOMIE DE LA TRAME', this.dur);
    // L0 · il énumère les cinq fonctions : elles arrivent une par une, sur ses mots
    tl.to(S.ftit, { o: 1, duration: .5, ease: EO }, T(0) - 0.3);
    S.f.forEach((s, i) => tl.to(s, { o: 1, dy: 0, duration: .45, ease: EB },
                                T(0) + 0.8 + i * ((F_(0) - T(0) - 1.1) / 5)));
    // L1 · « tout ça tient dans une seule chose : la trame »
    tl.to([S.ftit, ...S.f], { o: 0, duration: .5 }, T(1) + 0.7)
      .to(S.bl, { o: 1, duration: .9, ease: EO }, 8.8)
    // L4 · le colis — exactement quand il en parle, plus treize secondes avant
      .to(S.bl, { o: 0, duration: 1.0 }, T(4) + 0.1)
      .to(S.colis, { o: 1, p: 1, duration: 1.2, ease: EX }, T(4) + 0.8)
      .to(S.colis, { o: 0, duration: .6 }, F_(4) - 0.5)
    // L5 · « et maintenant, le piège »
      .to(S.pie, { o: 1, duration: .5, ease: EO }, T(5) + 0.2)
    // L6-L7 · la citation reste affichée tant qu'il la lit
      .to(S.cit, { o: 1, dy: 0, duration: .7, ease: EO }, T(6) - 0.6)
      .to([S.cit, S.pie], { o: 0, duration: .6 }, F_(7) + 0.3)
    // L8 · il récite l'ordre des six champs : ils se posent sur ses mots
      .to(S.ord, { o: 1, duration: .5, ease: EO }, T(8) - 0.4);
    S.c.forEach((s, i) => tl.to(s, { o: 1, dy: 0, duration: .4, ease: EB },
                                T(8) + 0.15 + i * ((F_(8) - T(8) - 0.7) / 6)));
    // L9 · « ne les inverse pas »
    tl.to(S.pas, { o: 1, sc: 1, duration: .5, ease: EB }, T(9))
      .to([S.ord, S.pas, ...S.c], { o: 0, duration: .5 }, 46.3);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    page(g, null);
    plate(g, pl, S.bl.o);
    if (S.ftit.o > 0 || S.f.some(x => x.o > 0)) {
      const FN = ['DÉLIMITER', "DÉTECTER L'ERREUR", 'LA CORRIGER', 'SUPERVISER', 'ALIGNER'];
      const WD = [300, 400, 310, 330, 270];
      const CO = [C.bleu, C.rouge, C.vert, C.encre2, C.or];
      if (S.ftit.o > 0) {
        g.save(); g.globalAlpha = S.ftit.o; g.textAlign = 'center';
        setFont(g, F.m, 20, 500, 5); g.fillStyle = C.encre3;
        g.fillText('LE NIVEAU 2  ·  CINQ FONCTIONS', 1000, 436);
        g.restore();
      }
      const GA = 16, TOT = WD.reduce((a, b) => a + b, 0) + GA * 4;
      let fx = 1000 - TOT / 2;
      S.f.forEach((st, i) => {
        if (st.o > 0) boite(g, fx + WD[i] / 2, 566 + st.dy, WD[i], 92, FN[i], null, st.o,
                            { color: CO[i], ts: 23 });
        fx += WD[i] + GA;
      });
    }
    if (S.colis.o > 0) {
      g.save(); g.globalAlpha = S.colis.o; g.textAlign = 'center';
      setFont(g, F.h, 60, 700, 0); g.fillStyle = C.encre;
      typeOn(g, 'une trame, c\'est un colis', 1000, 420, clamp(S.colis.p * 2), 'center');
      g.restore();
      const u2 = clamp(S.colis.p * 2 - 1);
      if (u2 > 0) {
        g.save(); g.globalAlpha = S.colis.o * u2;
        g.fillStyle = 'rgba(216,205,184,.70)';
        rr(g, 640, 490, 720, 190, 8); g.fill();
        g.strokeStyle = C.encre2; g.lineWidth = 2.6; g.stroke();
        g.fillStyle = 'rgba(31,95,139,.16)'; rr(g, 790, 530, 420, 110, 6); g.fill();
        g.strokeStyle = C.bleu; g.lineWidth = 2.4; g.stroke();
        g.textAlign = 'center';
        setFont(g, F.d, 26, 700, 2); g.fillStyle = C.bleu;
        g.fillText('LE CADEAU', 1000, 578);
        setFont(g, F.b, 18, 500, .3); g.fillStyle = C.encre3;
        g.fillText('le message', 1000, 606);
        setFont(g, F.b, 21, 500, .3); g.fillStyle = C.encre2;
        g.fillText("le carton et le ruban ne font pas partie du cadeau — mais il arrive entier", 1000, 730);
        g.restore();
      }
    }
    citation(g, 330, 470, ["Détection d'erreur, c'est à la fin de la trame.",
                           "Correction d'erreur, c'est au début de la trame."],
             S.cit, { size: 54, source: 'le prof' });
    if (S.pie.o > 0) {
      g.save(); g.globalAlpha = S.pie.o; g.textAlign = 'center';
      setFont(g, F.m, 18, 500, 5); g.fillStyle = C.rouge;
      g.fillText('LE PIÈGE QUI COÛTE DES POINTS À TOUT LE MONDE', 1000, 350);
      g.restore();
    }
    if (S.ord.o > 0) {
      const NM = [['FANION', C.or], ['CORRECTION', C.bleu], ['INL', C.vert],
                  ['INFORMATION', C.encre2], ['DÉTECTION', C.rouge], ['FANION', C.or]];
      const WD = [150, 280, 130, 420, 280, 150];
      const GA = 14;
      const TOT = WD.reduce((a, b) => a + b, 0) + GA * 5;
      let x = 1000 - TOT / 2;
      S.c.forEach((s, i) => {
        if (s.o > 0) {
          g.save(); g.globalAlpha = s.o; g.translate(0, s.dy); g.textAlign = 'center';
          g.fillStyle = i === 3 ? 'rgba(216,205,184,.6)' : 'rgba(255,255,255,.5)';
          rr(g, x, 470, WD[i], 110, 6); g.fill();
          g.strokeStyle = NM[i][1]; g.lineWidth = 2.8; g.stroke();
          setFont(g, F.d, i === 1 || i === 4 ? 21 : 23, 700, 1.2); g.fillStyle = C.encre;
          g.fillText(NM[i][0], x + WD[i] / 2, 532);
          g.restore();
        }
        x += WD[i] + GA;
      });
      g.save(); g.globalAlpha = S.ord.o; g.textAlign = 'center';
      setFont(g, F.b, 21, 500, .3); g.fillStyle = C.bleu;
      g.fillText('AU DÉBUT', 1000 - TOT / 2 + 150 + 14 + 140, 626);
      g.fillStyle = C.rouge;
      g.fillText('À LA FIN', 1000 + TOT / 2 - 150 - 14 - 140, 626);
      g.restore();
      if (S.pas.o > 0) {
        g.save(); g.globalAlpha = S.pas.o; g.textAlign = 'center';
        g.translate(1000, 740); g.scale(S.pas.sc, S.pas.sc); g.translate(-1000, -740);
        setFont(g, F.h, 66, 700, 0); g.fillStyle = C.rouge;
        g.fillText('ne les inverse pas.', 1000, 740);
        g.restore();
      }
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 03 · TROIS TYPES, UN SEUL OCTET — 52.042 s ══════════════ */
const CH3 = {
  dur: 52.042,
  setup(tl, S) {
    const T = i => L(3, i);                      // repères mesurés dans la voix
    addCam(tl, S, [[0.8,2.4,{z:1.06}],[2.0,7.0,{y:-30,z:1.065}],
                   [11.6,1.4,{x:0,y:0,z:0.99}],[12.6,7.6,{z:1.05,y:40}],
                   [20.4,7.0,{y:60,z:1.06}],[27.6,7.4,{y:80,z:1.065}],
                   [35.2,1.2,{x:0,y:0,z:0.99}],[36.0,13.0,{z:1.05}]]);
    S.oct = o(); S.ign = o(); S.T = [o({ dx: -20 }), o({ dx: -20 }), o({ dx: -20 })];
    S.cit = o({ dy: 16 }); S.post = o({ sc: .9 });
    addHeader(tl, S, '03', "L'INDICATEUR DE LONGUEUR", this.dur);
    tl.to(S.oct, { o: 1, p: 1, duration: 1.1, ease: EX }, T(0) + 0.3)
      .to(S.ign, { o: 1, duration: .6, ease: EO }, T(1) - 0.3)
    // L3, L5, L7 · chaque type apparaît quand il l'annonce
      .to(S.T[0], { o: 1, dx: 0, duration: .5, ease: EO }, T(3) - 0.3)
      .to(S.T[1], { o: 1, dx: 0, duration: .5, ease: EO }, T(5) - 0.3)
      .to(S.T[2], { o: 1, dx: 0, duration: .5, ease: EO }, T(7) - 0.3)
      .to([S.oct, S.ign, S.T[0], S.T[1], S.T[2]], { o: 0, duration: .6 }, T(9) - 0.4)
    // L9-L10 · les 6 bits lus sur 8     L11 · la réponse du prof
      .to(S.post, { o: 1, sc: 1, duration: .6, ease: EB }, T(9) + 0.2)
      .to(S.cit, { o: 1, dy: 0, duration: .7, ease: EO }, T(11) - 0.4)
      .to([S.cit, S.post], { o: 0, duration: .5 }, T(12) + 1.4);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.oct.o > 0) {
      g.save(); g.globalAlpha = S.oct.o; g.textAlign = 'center';
      setFont(g, F.m, 17, 500, 4.4); g.fillStyle = C.encre3;
      g.fillText("UN OCTET  ·  8 BITS  ·  MAIS ON N'EN LIT QUE 6", 1000, 268);
      g.restore();
      bitRow(g, 700, 300, '11101110', S.oct.p, { bw: 74, bh: 86, gap: 7, mark: [2,3,4,5,6,7] });
    }
    if (S.ign.o > 0) {
      g.save(); g.globalAlpha = S.ign.o; g.textAlign = 'center';
      g.strokeStyle = C.rouge; g.lineWidth = 3; g.lineCap = 'round';
      for (const i of [0, 1]) {
        const bx = 700 + i * 81;
        g.beginPath(); g.moveTo(bx + 14, 314); g.lineTo(bx + 60, 372);
        g.moveTo(bx + 60, 314); g.lineTo(bx + 14, 372); g.stroke();
      }
      setFont(g, F.b, 20, 500, .3); g.fillStyle = C.rouge;
      g.fillText('réservés', 781, 424);
      setFont(g, F.h, 44, 700, 0); g.fillStyle = C.encre;
      g.fillText('101110  =  46  →  la partie variable fait 46 octets', 1120, 424);
      g.restore();
    }
    const TY = [['TSR', 'INL = 0', 'TRAME DE REMPLISSAGE',
                 "elle ne porte rien — elle garde le canal éveillé", C.encre3],
                ['TSE', 'INL = 1 ou 2', "TRAME D'ÉTAT",
                 'elle annonce l\'état du canal — elle ne sort jamais du niveau 2', C.or],
                ['TSM', 'INL > 2', 'TRAME DE MESSAGE',
                 "la seule qui porte de l'information utile, la seule qui monte au niveau 4", C.bleu]];
    S.T.forEach((s, i) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o; g.translate(s.dx, 0); g.textAlign = 'left';
      const y = 520 + i * 150;
      g.fillStyle = i === 2 ? 'rgba(31,95,139,.10)' : 'rgba(255,255,255,.45)';
      rr(g, 300, y - 54, 1400, 124, 8); g.fill();
      g.strokeStyle = TY[i][4]; g.lineWidth = 2.6; g.stroke();
      setFont(g, F.d, 44, 700, 2); g.fillStyle = TY[i][4];
      g.fillText(TY[i][0], 340, y + 2);
      setFont(g, F.m, 24, 500, 2); g.fillStyle = C.encre;
      g.fillText(TY[i][1], 490, y - 8);
      setFont(g, F.d, 22, 700, 1.6); g.fillStyle = C.encre2;
      g.fillText(TY[i][2], 490, y + 22);
      setFont(g, F.b, 21, 500, .3); g.fillStyle = C.encre3;
      g.fillText(TY[i][3], 820, y + 6);
      g.restore();
    });
    citation(g, 420, 560, ["Quand ils faisaient la norme, je n'étais pas là."],
             S.cit, { size: 62, source: 'le prof, sur les 2 bits inutilisés' });
    postit(g, 1140, 300, 560, 'À RETENIR',
           ['0  →  remplissage (TSR)', '1 ou 2  →  état (TSE)', '> 2  →  message (TSM)'], S.post);
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 04 · LE FANION ET LE BOURRAGE — 50.708 s ══════════════ */
const CH4 = {
  dur: 50.708,
  setup(tl, S) {
    const T = i => L(4, i);                      // repères mesurés dans la voix
    addCam(tl, S, [[0.8,2.4,{z:1.06}],[2.0,8.0,{z:1.065,y:-20}],
                   [13.4,1.2,{x:0,y:0,z:0.99}],[14.2,9.4,{z:1.05,y:30}],
                   [23.8,1.2,{x:0,y:0,z:0.99}],[24.6,12.8,{z:1.06,y:40}],
                   [37.6,1.2,{x:0,y:0,z:0.99}],[38.4,11.0,{z:1.05}]]);
    S.fan = o(); S.hex = o({ sc: 1.4 }); S.dan = o(); S.src = o(); S.stu = o();
    S.ins = o({ sc: 1.6 }); S.res = o(); S.perte = o({ dx: -20 });
    addHeader(tl, S, '04', 'LE FANION ET LE BOURRAGE', this.dur);
    // L1-L2 · le motif, puis 7E quand il le dit
    tl.to(S.fan, { o: 1, p: 1, duration: 1.2, ease: EX }, T(1) - 0.6)
      .to(S.hex, { o: 1, sc: 1, duration: .5, ease: EB }, T(3) - 0.9)
    // L5-L6 · le problème
      .to([S.fan, S.hex], { o: 0, duration: .6 }, T(5) - 0.5)
      .to(S.dan, { o: 1, duration: .6, ease: EO }, T(5) + 0.1)
      .to(S.src, { o: 1, p: 1, duration: 1.0, ease: EX }, T(6) - 0.3)
    // L7-L8 · la parade, le compteur, le zéro forcé
      .to(S.stu, { o: 1, p: 1, duration: 1.2, ease: EX }, T(7) - 0.4)
      .to(S.ins, { o: 1, sc: 1, duration: .5, ease: EB }, T(8) - 0.3)
    // L10 · le résultat
      .to(S.res, { o: 1, duration: .6, ease: EO }, T(10) - 0.4)
      .to([S.dan, S.src, S.stu, S.ins, S.res], { o: 0, duration: .6 }, T(11) - 0.5)
    // L11-L12 · la configuration interdite, la perte d'alignement
      .to(S.perte, { o: 1, dx: 0, duration: .7, ease: EO }, T(11) + 0.2)
      .to(S.perte, { o: 0, duration: .5 }, this.dur - 0.9);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.fan.o > 0) {
      g.save(); g.globalAlpha = S.fan.o; g.textAlign = 'center';
      setFont(g, F.m, 17, 500, 4.4); g.fillStyle = C.encre3;
      g.fillText('UN MOTIF UNIQUE DE 8 BITS', 1000, 320);
      g.restore();
      bitRow(g, 684, 354, '01111110', S.fan.p, { bw: 76, bh: 92, gap: 8, mark: [1,2,3,4,5,6] });
      g.save(); g.globalAlpha = S.fan.o * clamp(S.fan.p * 2 - 1); g.textAlign = 'center';
      setFont(g, F.b, 22, 500, .3); g.fillStyle = C.or;
      g.fillText('six 1 encadrés par deux 0', 1000, 492);
      g.restore();
    }
    if (S.hex.o > 0) {
      g.save(); g.globalAlpha = S.hex.o; g.textAlign = 'center';
      g.translate(1000, 620); g.scale(S.hex.sc, S.hex.sc); g.translate(-1000, -620);
      setFont(g, F.d, 92, 700, 4); g.fillStyle = C.encre;
      g.fillText('FANION  =  7E', 1000, 620);
      surligne(g, 1178, 550, 190, clamp((S.hex.o - .3) / .7), 84);
      setFont(g, F.h, 46, 700, 0); g.fillStyle = C.bleu;
      g.fillText('un drapeau planté en bord de terrain', 1000, 700);
      g.restore();
    }
    if (S.dan.o > 0) {
      g.save(); g.globalAlpha = S.dan.o; g.textAlign = 'center';
      setFont(g, F.h, 50, 700, 0); g.fillStyle = C.rouge;
      g.fillText('…et si les données ressemblent au fanion ?', 1000, 300);
      g.restore();
    }
    if (S.src.o > 0) {
      g.save(); g.globalAlpha = S.src.o; g.textAlign = 'left';
      setFont(g, F.m, 17, 500, 3.4); g.fillStyle = C.encre3;
      g.fillText('À ÉMETTRE  ·  SIX 1 D\'AFFILÉE, DANGER', 420, 390);
      g.restore();
      bitRow(g, 420, 414, '1011111100', S.src.p, { bw: 58, bh: 70, gap: 6, mark: [2,3,4,5,6,7] });
    }
    if (S.stu.o > 0) {
      g.save(); g.globalAlpha = S.stu.o; g.textAlign = 'left';
      setFont(g, F.m, 17, 500, 3.4); g.fillStyle = C.vert;
      g.fillText('ÉMIS  ·  UN 0 INSÉRÉ APRÈS LE CINQUIÈME 1', 420, 584);
      g.restore();
      bitRow(g, 420, 608, '10111110100', S.stu.p, { bw: 58, bh: 70, gap: 6, mark: [7] });
      if (S.ins.o > 0) {
        g.save(); g.globalAlpha = S.ins.o; g.textAlign = 'center';
        const bx = 420 + 7 * 64 + 29;
        flecheD(g, bx, 740, bx, 694, clamp(S.ins.o * 1.5), { color: C.or, lw: 3 });
        setFont(g, F.h, 42, 700, 0); g.fillStyle = C.or;
        g.fillText('le zéro de transparence', bx + 40, 788);
        g.restore();
      }
    }
    if (S.res.o > 0) {
      g.save(); g.globalAlpha = S.res.o; g.textAlign = 'center';
      setFont(g, F.b, 26, 500, .3); g.fillStyle = C.encre;
      g.fillText('à la réception on enlève ce zéro  —  plus aucune donnée ne peut ressembler à un fanion',
                 1000, 880);
      g.restore();
    }
    if (S.perte.o > 0) {
      g.save(); g.globalAlpha = S.perte.o; g.translate(S.perte.dx, 0); g.textAlign = 'center';
      setFont(g, F.d, 38, 700, 2.6); g.fillStyle = C.rouge;
      g.fillText('ET SI LE RÉCEPTEUR VOIT QUAND MÊME SIX 1 ?', 1000, 360);
      g.restore();
      const ET = [['CONFIGURATION INTERDITE', 'elle ne peut pas exister dans les données'],
                  ["PERTE D'ALIGNEMENT", 'le récepteur la déclare'],
                  ['IL JETTE TOUT', 'depuis le dernier fanion'],
                  ['ET IL REPART', 'proprement, au fanion suivant']];
      ET.forEach(([a, b], i) => {
        const u = clamp(S.perte.o * 5 - i * 1.1); if (u <= 0) return;
        g.save(); g.globalAlpha = u; g.textAlign = 'center';
        const x = 320 + i * 455;
        boite(g, x + 160, 540, 320, 118, a.length > 20 ? '' : a, null, u,
              { color: i === 0 ? C.rouge : C.encre2 });
        setFont(g, F.d, a.length > 20 ? 19 : 23, 700, 1.4); g.fillStyle = C.encre;
        if (a.length > 20) g.fillText(a, x + 160, 536);
        setFont(g, F.b, 17, 500, .3); g.fillStyle = C.encre3;
        g.fillText(b, x + 160, 566);
        g.restore();
        if (i < 3) flecheD(g, x + 330, 540, x + 440, 540, clamp(u * 1.6), { color: C.encre3, lw: 2.2 });
      });
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 05 · LE CONTRÔLE DE TRAME — 54.958 s ══════════════ */
const CH5 = {
  dur: 54.958,
  setup(tl, S) {
    const T = i => L(5, i);                      // repères mesurés dans la voix
    addCam(tl, S, [[0.8,2.4,{z:1.05}],[2.0,9.6,{z:1.065,y:-20}],
                   [11.8,1.2,{x:0,y:0,z:0.99}],[12.6,10.8,{z:1.06,y:30}],
                   [23.6,1.2,{x:0,y:0,z:0.99}],[24.4,16.8,{z:1.05,y:20}],
                   [41.4,1.2,{x:0,y:0,z:0.99}],[42.2,11.6,{z:1.05}]]);
    S.tete = o(); S.A = o({ dx: -24 }); S.B = o({ dx: 24 }); S.cmp = o({ sc: 1.4 });
    S.cit = o({ dy: 16 }); S.pol = o({ sc: .92 }); S.note = o();
    addHeader(tl, S, '05', 'DÉTECTION  ·  LE CONTRÔLE DE TRAME', this.dur);
    tl.to(S.tete, { o: 1, p: 1, duration: 1.3, ease: 'none' }, T(0) + 0.3)
    // L3 · l'émetteur   L4 · le récepteur   L5 · même reste / reste différent
      .to(S.A, { o: 1, dx: 0, duration: .6, ease: EO }, T(3) - 0.4)
      .to(S.B, { o: 1, dx: 0, duration: .6, ease: EO }, T(4) - 0.4)
      .to(S.cmp, { o: 1, sc: 1, duration: .5, ease: EB }, T(5) - 0.3)
      .to([S.tete, S.A, S.B, S.cmp], { o: 0, duration: .6 }, T(6) - 0.5)
    // L6-L8 · la citation du prof, affichée tant qu'il la lit
      .to(S.cit, { o: 1, dy: 0, duration: .7, ease: EO }, T(6) - 0.4)
      .to(S.cit, { o: 0, duration: .6 }, T(10) - 0.9)
    // L10 · le vrai polynôme   L11 · la consigne d'examen
      .to(S.pol, { o: 1, sc: 1, duration: .8, ease: EB }, T(10) - 0.5)
      .to(S.note, { o: 1, duration: .6, ease: EO }, T(11) - 0.4)
      .to([S.pol, S.note], { o: 0, duration: .5 }, this.dur - 1.0);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.tete.o > 0) {
      g.save(); g.globalAlpha = S.tete.o; g.textAlign = 'center';
      setFont(g, F.m, 18, 500, 5); g.fillStyle = C.rouge;
      g.fillText('16 BITS  ·  JUSTE AVANT LE FANION DE FIN', 1000, 300);
      setFont(g, F.h, 56, 700, 0); g.fillStyle = C.encre;
      typeOn(g, 'le principe : une division de polynômes', 1000, 376, S.tete.p, 'center');
      g.restore();
    }
    const cote = (s, x, titre, l1, l2, col) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o; g.translate(s.dx, 0); g.textAlign = 'center';
      g.fillStyle = 'rgba(255,255,255,.5)'; rr(g, x - 300, 440, 600, 290, 10); g.fill();
      g.strokeStyle = col; g.lineWidth = 2.6; g.stroke();
      setFont(g, F.d, 30, 700, 2.4); g.fillStyle = col;
      g.fillText(titre, x, 496);
      setFont(g, F.b, 23, 500, .3); g.fillStyle = C.encre;
      g.fillText(l1, x, 566);
      g.fillText(l2, x, 606);
      setFont(g, F.m, 30, 500, 2); g.fillStyle = C.encre;
      g.fillText('÷  diviseur commun', x, 680);
      g.restore();
    };
    cote(S.A, 630, "À L'ÉMISSION", 'je divise mes données', 'je colle le reste en fin de trame', C.bleu);
    cote(S.B, 1370, 'À LA RÉCEPTION', 'je refais le même calcul', 'sur ce que j\'ai reçu', C.vert);
    if (S.cmp.o > 0) {
      g.save(); g.globalAlpha = S.cmp.o; g.textAlign = 'center';
      g.translate(1000, 820); g.scale(S.cmp.sc, S.cmp.sc); g.translate(-1000, -820);
      setFont(g, F.h, 50, 700, 0); g.fillStyle = C.vert;
      g.fillText('même reste  →  la trame est intacte', 1000, 806);
      g.fillStyle = C.rouge;
      g.fillText('reste différent  →  elle est rejetée', 1000, 866);
      g.restore();
    }
    citation(g, 330, 446, ['Le diviseur commun, c\'est comme les nombres aléatoires du réseau GSM.',
                           "C'est généré, mais une fois qu'on veut l'utiliser, on le partage",
                           "avec l'autre avant de lancer la session.",
                           'Les deux font le calcul, puis comparent la réponse.'],
             S.cit, { size: 40, source: 'le prof' });
    if (S.pol.o > 0) {
      fiche(g, 300, 330, 1400, 330, S.pol, (gg, x, y, w, h, u) => {
        gg.textAlign = 'center';
        setFont(gg, F.m, 17, 500, 4.2); gg.fillStyle = C.rouge;
        gg.fillText('LE POLYNÔME GÉNÉRATEUR  ·  LA VRAIE NORME', x + w / 2, y + 62);
        setFont(gg, F.d, 68, 700, 2); gg.fillStyle = C.encre;
        gg.fillText('G(X)  =  X¹⁶ + X¹² + X⁵ + 1', x + w / 2, y + 170);
        setFont(gg, F.b, 22, 500, .3); gg.fillStyle = C.encre2;
        gg.fillText('CRC-CCITT  ·  recommandation Q.703', x + w / 2, y + 230);
      });
    }
    if (S.note.o > 0) {
      g.save(); g.globalAlpha = S.note.o; g.textAlign = 'center';
      setFont(g, F.h, 48, 700, 0); g.fillStyle = C.bleu;
      g.fillText("garde l'exemple du tableau pour comprendre,", 1000, 740);
      g.fillStyle = C.rouge;
      g.fillText("connais celui-là pour l'examen", 1000, 800);
      g.restore();
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 06 · BIR, BIA, NSA, NSR — 73.417 s ══════════════
   plate Blender « tampons » 33.0 → 49.0 s                          */
const CH6 = {
  dur: 73.417, bl: { dir: 'tampons', from: 34.6, to: 50.6 },
  setup(tl, S) {
    const T = i => L(6, i);                     // repères mesurés dans la voix
    addCam(tl, S, [[0.8,2.4,{z:1.05}],[2.0,7.0,{z:1.065,y:-20}],
                   [9.6,1.4,{x:0,y:0,z:0.99}],[10.4,23.0,{z:1.05,y:30}],
                   [33.8,1.0,{x:0,y:0,z:0.99}],[34.6,15.4,{z:1.05,x:-40}],
                   [50.2,1.2,{x:0,y:0,z:0.99}],[51.0,16.4,{z:1.05,y:20}],
                   [67.8,5.0,{y:60,z:1.065}]]);
    S.tete = o(); S.f = [o({ dy: 18 }), o({ dy: 18 }), o({ dy: 18 }), o({ dy: 18 })];
    S.bl = o(); S.reg = o(); S.r1 = o({ dx: -20 }); S.r2 = o({ dx: -20 });
    S.fin = o({ sc: 1.3 });
    addHeader(tl, S, '06', 'CORRECTION  ·  BIR, BIA, NSA, NSR', this.dur);
    tl.to(S.tete, { o: 1, p: 1, duration: 1.3, ease: 'none' }, T(0) + 0.4);
    // L3 NSA · L4 NSR · L6 BIA puis BIR
    [T(3) - 0.4, T(4) - 0.4, T(6) - 0.3, T(6) + 2.6].forEach((a, i) =>
      tl.to(S.f[i], { o: 1, dy: 0, duration: .5, ease: EO }, a));
    // L8-L11 · les colis et les tampons, pendant qu'il raconte l'image
    tl.to([S.tete, ...S.f], { o: 0, duration: .6 }, T(7) - 0.4)
      .to(S.bl, { o: 1, duration: 1.0, ease: EO }, 34.6)
      .to(S.bl, { o: 0, duration: 1.0 }, T(12) - 0.2)
    // L12-L14 · la règle d'or
      .to(S.reg, { o: 1, duration: .5, ease: EO }, T(12) + 0.4)
      .to(S.r1, { o: 1, dx: 0, duration: .5, ease: EO }, T(13) - 0.4)
      .to(S.r2, { o: 1, dx: 0, duration: .5, ease: EO }, T(14) - 0.4)
      .to([S.reg, S.r1, S.r2], { o: 0, duration: .6 }, T(16) - 0.5)
    // L16 · « le bit qui bascule, c'est le signal d'erreur »
      .to(S.fin, { o: 1, sc: 1, duration: .7, ease: EB }, T(16) - 0.1)
      .to(S.fin, { o: 0, duration: .5 }, this.dur - 0.9);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    page(g, null);
    plate(g, pl, S.bl.o);
    if (S.tete.o > 0) {
      g.save(); g.globalAlpha = S.tete.o; g.textAlign = 'center';
      setFont(g, F.h, 58, 700, 0); g.fillStyle = C.encre;
      typeOn(g, 'corriger, ici, ça veut dire une seule chose :', 1000, 310, clamp(S.tete.p * 2), 'center');
      g.globalAlpha = S.tete.o * clamp(S.tete.p * 2 - 1);
      setFont(g, F.d, 48, 700, 2.4); g.fillStyle = C.rouge;
      g.fillText('FAIRE RETRANSMETTRE LA TRAME', 1000, 382);
      g.restore();
    }
    const FD = [['NSA', '7 bits', "le numéro de la trame que JE t'envoie", C.bleu],
                ['NSR', '7 bits', "la dernière que j'ai BIEN reçue de toi  ·  c'est l'accusé", C.vert],
                ['BIA', '1 bit', 'le tampon de couleur que je pose', C.or],
                ['BIR', '1 bit', "l'écho de ton tampon  ·  OK ou problème", C.rouge]];
    S.f.forEach((s, i) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o; g.translate(0, s.dy); g.textAlign = 'left';
      const y = 500 + i * 118;
      g.fillStyle = 'rgba(255,255,255,.45)'; rr(g, 300, y - 46, 1400, 96, 8); g.fill();
      g.strokeStyle = FD[i][3]; g.lineWidth = 2.6; g.stroke();
      setFont(g, F.d, 42, 700, 2.4); g.fillStyle = FD[i][3];
      g.fillText(FD[i][0], 344, y + 4);
      setFont(g, F.m, 21, 500, 2); g.fillStyle = C.encre2;
      g.fillText(FD[i][1], 492, y + 2);
      setFont(g, F.b, 24, 500, .3); g.fillStyle = C.encre;
      g.fillText(FD[i][2], 640, y + 4);
      g.restore();
    });
    if (S.reg.o > 0) {
      g.save(); g.globalAlpha = S.reg.o; g.textAlign = 'center';
      setFont(g, F.d, 40, 700, 3); g.fillStyle = C.encre;
      g.fillText("LA RÈGLE D'OR", 1000, 330);
      surligne(g, 788, 294, 424, clamp(S.reg.o * 1.4), 48);
      g.restore();
    }
    const regle = (s, y, cond, txt, col, fond) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o; g.translate(s.dx, 0); g.textAlign = 'left';
      g.fillStyle = fond; rr(g, 300, y - 58, 1400, 122, 10); g.fill();
      g.strokeStyle = col; g.lineWidth = 2.8; g.stroke();
      setFont(g, F.d, 40, 700, 2); g.fillStyle = col;
      g.fillText(cond, 350, y - 6);
      setFont(g, F.h, 46, 700, 0); g.fillStyle = C.encre;
      g.fillText(txt, 350, y + 44);
      g.restore();
    };
    regle(S.r1, 480, 'BIR  =  BIA', 'même couleur — tout va bien, continue', C.vert, 'rgba(74,124,89,.10)');
    regle(S.r2, 650, 'BIR  ≠  BIA', 'couleur différente — reprends à NSR + 1', C.rouge, 'rgba(200,65,43,.10)');
    if (S.r2.o > 0) {
      g.save(); g.globalAlpha = S.r2.o; g.textAlign = 'center';
      setFont(g, F.b, 25, 500, .3); g.fillStyle = C.encre2;
      g.fillText('et quand tu retransmets, tu bascules ta propre couleur pour vous resynchroniser',
                 1000, 800);
      g.restore();
    }
    if (S.fin.o > 0) {
      g.save(); g.globalAlpha = S.fin.o; g.textAlign = 'center';
      g.translate(1000, 540); g.scale(S.fin.sc, S.fin.sc); g.translate(-1000, -540);
      setFont(g, F.h, 72, 700, 0); g.fillStyle = C.encre;
      g.fillText('le bit qui bascule,', 1000, 500);
      setFont(g, F.d, 76, 700, 2.4); g.fillStyle = C.rouge;
      g.fillText("C'EST LE SIGNAL D'ERREUR", 1000, 600);
      g.restore();
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 07 · BASE OU CYCLIQUE — 72.875 s ══════════════ */
const CH7 = {
  dur: 72.875,
  setup(tl, S) {
    const T = i => L(7, i);                     // repères mesurés dans la voix
    addCam(tl, S, [[0.8,2.4,{z:1.05}],[2.0,18.6,{z:1.06,y:-20}],
                   [21.0,1.0,{x:0,y:0,z:0.99}],[21.8,14.0,{z:1.05,y:20}],
                   [36.0,1.0,{x:0,y:0,z:0.99}],[36.8,11.4,{z:1.05,y:30}],
                   [48.2,1.0,{x:0,y:0,z:0.99}],[49.0,16.6,{z:1.05,y:40}],
                   [65.8,6.0,{y:-30,z:1.04}]]);
    S.M = [o({ dx: -24 }), o({ dx: 24 })];
    S.td = o({ sc: 1.3 });
    S.c1 = o(); S.u1 = { v: 0 }; S.c1b = o();
    S.c2 = o(); S.u2 = { v: 0 }; S.rx1 = o(); S.c2b = o();
    S.c3 = o(); S.u3 = { v: 0 }; S.rx2 = o(); S.c3b = o();
    S.fin = o();
    addHeader(tl, S, '07', 'BASE OU CYCLIQUE  ·  LE TD', this.dur);
    // L1 la base · L3 la cyclique
    tl.to(S.M[0], { o: 1, dx: 0, duration: .6, ease: EO }, T(1) - 0.4)
      .to(S.M[1], { o: 1, dx: 0, duration: .6, ease: EO }, T(3) - 0.4)
      .to(S.M, { o: 0, duration: .6 }, T(6) - 0.5)
    // L6 · « maintenant le TD du prof »
      .to(S.td, { o: 1, sc: 1, duration: .6, ease: EB }, T(6) + 0.1)
    // L7-L8 · premier cas, base puis cyclique
      .to(S.c1, { o: 1, duration: .5, ease: EO }, T(7) - 0.4)
      .to(S.u1, { v: 1, duration: 2.6, ease: 'none' }, T(7) + 0.2)
      .to(S.c1b, { o: 1, duration: .5, ease: EO }, T(8) - 0.4)
      .to([S.c1, S.c1b], { o: 0, duration: .5 }, T(9) - 0.5)
    // L9-L11 · deuxième cas en méthode de base
      .to(S.c2, { o: 1, duration: .5, ease: EO }, T(9) + 0.3)
      .to(S.u2, { v: 1, duration: 2.6, ease: 'none' }, T(10) - 0.2)
      .to(S.rx1, { o: 1, duration: .5, ease: EO }, T(11) - 0.3)
      .to(S.c2b, { o: 1, duration: .5, ease: EO }, T(11) + 3.4)
      .to([S.c2, S.rx1, S.c2b], { o: 0, duration: .5 }, T(12) - 0.5)
    // L12-L16 · le même cas en cyclique : onze retransmissions
      .to(S.c3, { o: 1, duration: .5, ease: EO }, T(12) + 0.2)
      .to(S.u3, { v: 1, duration: 3.0, ease: 'none' }, T(13) - 0.2)
      .to(S.rx2, { o: 1, duration: .5, ease: EO }, T(14) - 0.3)
      .to(S.c3b, { o: 1, duration: .5, ease: EO }, T(16) - 0.5)
      .to([S.td, S.c3, S.rx2, S.c3b], { o: 0, duration: .5 }, T(17) - 0.5)
    // L17-L18 · les deux sont du Go-Back-N
      .to(S.fin, { o: 1, duration: .7, ease: EO }, T(17) - 0.1)
      .to(S.fin, { o: 0, duration: .5 }, this.dur - 0.9);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    const MET = [['MÉTHODE DE BASE', 'support terrestre', 'aller-retour  <  30 ms',
                  'on accuse CHAQUE trame', C.vert, 620],
                 ['MÉTHODE CYCLIQUE', 'satellite, long délai', 'aller-retour  jusqu\'à  500 ms',
                  'on envoie en rafale, on accuse par FENÊTRE', C.or, 1380]];
    S.M.forEach((s, i) => {
      if (s.o <= 0) return;
      const [nm, a, b, c, col, x] = MET[i];
      g.save(); g.globalAlpha = s.o; g.translate(s.dx, 0); g.textAlign = 'center';
      g.fillStyle = 'rgba(255,255,255,.5)'; rr(g, x - 330, 380, 660, 330, 10); g.fill();
      g.strokeStyle = col; g.lineWidth = 2.8; g.stroke();
      setFont(g, F.d, 32, 700, 2.4); g.fillStyle = col;
      g.fillText(nm, x, 442);
      setFont(g, F.b, 23, 500, .3); g.fillStyle = C.encre3;
      g.fillText(a, x, 494);
      setFont(g, F.m, 26, 500, 1.4); g.fillStyle = C.encre;
      g.fillText(b, x, 560);
      setFont(g, F.h, 38, 700, 0); g.fillStyle = C.encre;
      g.fillText(c, x, 640);
      g.restore();
    });
    if (S.td.o > 0) {
      g.save(); g.globalAlpha = S.td.o; g.textAlign = 'center';
      g.translate(1000, 262); g.scale(S.td.sc, S.td.sc); g.translate(-1000, -262);
      setFont(g, F.d, 34, 700, 3); g.fillStyle = C.encre;
      g.fillText('LE TD DU PROF  ·  20 TRAMES', 1000, 262);
      surligne(g, 706, 226, 588, clamp(S.td.o * 1.4), 46);
      g.restore();
    }
    const X20 = 1000 - (20 * 71 - 7) / 2;
    const bloc = (s, y, titre, col) => {
      g.save(); g.globalAlpha = s.o; g.textAlign = 'left';
      setFont(g, F.m, 17, 500, 3.2); g.fillStyle = col;
      g.fillText(titre, X20, y - 16);
      g.restore();
    };
    const bilan = (s, y, txt, col) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o; g.textAlign = 'center';
      setFont(g, F.h, 48, 700, 0); g.fillStyle = col;
      g.fillText(txt, 1000, y);
      g.restore();
    };
    if (S.c1.o > 0) {                               // cas 1 : aucune erreur
      g.save(); g.globalAlpha = S.c1.o; g.textAlign = 'center';
      setFont(g, F.d, 30, 700, 2.4); g.fillStyle = C.vert;
      g.fillText('CAS 1  ·  AUCUNE ERREUR', 1000, 380);
      g.restore();
      bloc(S.c1, 470, 'BASE  ·  20 TRAMES, 20 ACCUSÉS, 0 RETRANSMISSION', C.vert);
      trames(g, X20, 470, 20, S.u1.v, () => 'ok');
      bloc(S.c1, 620, 'CYCLIQUE  ·  20 TRAMES, 1 SEUL ACCUSÉ, 0 RETRANSMISSION', C.or);
      trames(g, X20, 620, 20, S.u1.v, () => 'ok');
      bilan(S.c1b, 770, 'les deux marchent  —  seul le nombre d\'accusés change', C.encre);
    }
    if (S.c2.o > 0) {                               // cas 2 · base
      g.save(); g.globalAlpha = S.c2.o; g.textAlign = 'center';
      setFont(g, F.d, 30, 700, 2.4); g.fillStyle = C.rouge;
      g.fillText('CAS 2  ·  ERREUR À LA 10ᵉ  —  MÉTHODE DE BASE', 1000, 380);
      g.restore();
      bloc(S.c2, 470, '1ᵉʳ PASSAGE  ·  ON ACCUSE CHAQUE TRAME, DONC ON S\'ARRÊTE TOUT DE SUITE', C.encre3);
      trames(g, X20, 470, 10, S.u2.v, i => i < 9 ? 'ok' : 'err');
      if (S.rx1.o > 0) {
        bloc(S.rx1, 620, 'APRÈS L\'ACCUSÉ NÉGATIF  ·  NSR = 9, BIR BASCULÉ  →  ON REPREND À 10', C.or);
        trames(g, X20 + 9 * 71, 620, 11, S.rx1.o, i => i === 0 ? 'retx' : 'ok');
      }
      bilan(S.c2b, 780, '1 seule trame retransmise', C.vert);
    }
    if (S.c3.o > 0) {                               // cas 2 · cyclique
      g.save(); g.globalAlpha = S.c3.o; g.textAlign = 'center';
      setFont(g, F.d, 30, 700, 2.4); g.fillStyle = C.rouge;
      g.fillText('CAS 2  ·  ERREUR À LA 10ᵉ  —  MÉTHODE CYCLIQUE, FENÊTRE 20', 1000, 380);
      g.restore();
      bloc(S.c3, 470, 'RAFALE  ·  LES 20 SONT DÉJÀ PARTIES AVANT LE MOINDRE ACCUSÉ', C.encre3);
      trames(g, X20, 470, 20, S.u3.v, i => i < 9 ? 'ok' : (i === 9 ? 'err' : 'rej'));
      if (S.c3.o > .9 && S.u3.v > .98) {
        g.save(); g.globalAlpha = S.c3.o; g.textAlign = 'center';
        setFont(g, F.b, 22, 500, .3); g.fillStyle = C.encre3;
        g.fillText('les 11 → 20 arrivent HORS SÉQUENCE  —  et SS7 ne sait pas les garder',
                   1000, 574);
        g.restore();
      }
      if (S.rx2.o > 0) {
        bloc(S.rx2, 660, 'RETRANSMISSION  ·  TOUT LE RESTE DE LA FENÊTRE REPASSE', C.or);
        trames(g, X20 + 9 * 71, 660, 11, S.rx2.o, () => 'retx');
      }
      bilan(S.c3b, 810, '11 trames retransmises  —  de la 10 à la 20', C.rouge);
    }
    if (S.fin.o > 0) {
      g.save(); g.globalAlpha = S.fin.o; g.textAlign = 'center';
      setFont(g, F.d, 34, 700, 2.4); g.fillStyle = C.encre;
      g.fillText('LES DEUX SONT DU GO-BACK-N', 1000, 440);
      setFont(g, F.h, 52, 700, 0); g.fillStyle = C.bleu;
      g.fillText('ce qui change, c\'est le nombre de trames', 1000, 536);
      g.fillText('en vol au moment de l\'erreur', 1000, 600);
      g.restore();
      postit(g, 640, 680, 720, 'ERREUR FRÉQUENTE',
             ['Croire que la cyclique ne retransmet', 'que la trame erronée. Faux :',
              'elle retransmet toute la fenêtre.'], { o: S.fin.o, sc: 1 });
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 08 · SUPERVISION ET ALIGNEMENT — 52.958 s ══════════════ */
const CH8 = {
  dur: 52.958,
  setup(tl, S) {
    const T = i => L(8, i);                     // repères mesurés dans la voix
    addCam(tl, S, [[0.8,2.4,{z:1.06}],[2.0,7.6,{z:1.065,y:-20}],
                   [10.0,1.0,{x:0,y:0,z:0.99}],[10.8,11.2,{z:1.05,y:30}],
                   [22.4,1.0,{x:0,y:0,z:0.99}],[23.0,7.2,{z:1.06}],
                   [30.4,1.0,{x:0,y:0,z:0.99}],[31.2,13.0,{z:1.05,y:20}],
                   [44.4,7.0,{y:60,z:1.06}]]);
    S.seuil = o({ sc: 1.3 }); S.cit = o({ dy: 16 }); S.pan = o(); S.cnt = { v: 0 };
    S.et = []; for (let i = 0; i < 6; i++) S.et.push(o({ dy: 14 }));
    S.tsr = o();
    addHeader(tl, S, '08', 'SUPERVISION ET ALIGNEMENT', this.dur);
    // L1 · le seuil de quatre pour mille
    tl.to(S.seuil, { o: 1, sc: 1, duration: .7, ease: EB }, T(1) - 0.5)
      .to(S.seuil, { o: 0, duration: .6 }, T(3) - 0.5)
    // L3-L5 · la citation du prof sur le compteur
      .to(S.cit, { o: 1, dy: 0, duration: .7, ease: EO }, T(3) - 0.4)
      .to(S.cit, { o: 0, duration: .6 }, T(6) - 0.5)
    // L6-L7 · le compteur-décompteur, le panier qui se vide
      .to(S.pan, { o: 1, duration: .6, ease: EO }, T(6) + 0.1)
      .to(S.cnt, { v: 1, duration: 5.0, ease: 'none' }, T(6) + 0.9)
      .to(S.pan, { o: 0, duration: .6 }, T(8) - 0.4);
    // L9-L10 · les six états, trois par phrase, dans l'ordre où il les cite
    [T(9) + 1.6, T(9) + 2.8, T(9) + 4.0,
     T(10) + 0.9, T(10) + 2.1, T(10) + 3.3].forEach((a, i) =>
      tl.to(S.et[i], { o: 1, dy: 0, duration: .45, ease: EO }, a));
    // L11 · les trames de remplissage
    tl.to(S.tsr, { o: 1, duration: .6, ease: EO }, T(11) - 0.3)
      .to([...S.et, S.tsr], { o: 0, duration: .5 }, this.dur - 0.9);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    if (S.seuil.o > 0) {
      g.save(); g.globalAlpha = S.seuil.o; g.textAlign = 'center';
      g.translate(1000, 520); g.scale(S.seuil.sc, S.seuil.sc); g.translate(-1000, -520);
      setFont(g, F.m, 18, 500, 5); g.fillStyle = C.encre3;
      g.fillText('LE SEUIL FATIDIQUE DU TAUX D\'ERREUR', 1000, 400);
      setFont(g, F.d, 150, 700, 3); g.fillStyle = C.rouge;
      g.fillText('4 · 10⁻³', 1000, 540);
      surligne(g, 790, 430, 420, clamp((S.seuil.o - .3) / .7), 124, 'rgba(242,193,78,.42)');
      setFont(g, F.h, 54, 700, 0); g.fillStyle = C.encre;
      g.fillText('au-delà, le canal est déclaré inapte', 1000, 640);
      g.restore();
    }
    citation(g, 330, 440, ["Si j'ai un compteur qui ne fait qu'incrémenter, même si la deuxième",
                           "erreur est dans trois jours et la troisième dans trois mois,",
                           "j'aurai trois erreurs. Donc tôt ou tard il condamne le canal."],
             S.cit, { size: 42, source: 'le prof' });
    if (S.pan.o > 0) {
      g.save(); g.globalAlpha = S.pan.o; g.textAlign = 'center';
      setFont(g, F.d, 36, 700, 2.6); g.fillStyle = C.encre;
      g.fillText('LE COMPTEUR-DÉCOMPTEUR', 1000, 330);
      g.restore();
      boite(g, 640, 470, 460, 120, 'UNE ERREUR', '+ 1', S.pan.o, { color: C.rouge, ts: 30 });
      boite(g, 1360, 470, 560, 120, '256 TRAMES CORRECTES', '− 1', S.pan.o, { color: C.vert, ts: 26 });
      // le panier
      const PW = 760, PX = 1000 - PW / 2, PY = 600;
      g.save(); g.globalAlpha = S.pan.o;
      g.fillStyle = 'rgba(255,255,255,.5)'; rr(g, PX, PY, PW, 86, 8); g.fill();
      g.strokeStyle = C.encre2; g.lineWidth = 2.6; g.stroke();
      const lvl = (Math.sin(S.cnt.v * 9) * .5 + .5) * .55 + .12;
      g.fillStyle = 'rgba(200,65,43,.35)';
      rr(g, PX + 4, PY + 4, (PW - 8) * lvl, 78, 6); g.fill();
      g.textAlign = 'center';
      setFont(g, F.d, 24, 700, 2); g.fillStyle = C.encre;
      g.fillText('LE PANIER', 1000, PY + 52);
      setFont(g, F.h, 46, 700, 0); g.fillStyle = C.bleu;
      g.fillText('un panier qui se vide tout seul', 1000, PY + 150);
      g.restore();
    }
    const ET = [['HORS SERVICE', 'ETHS'], ['NON ALIGNÉ', 'ETAP'], ['ALIGNÉ', 'ETAN'],
                ['PÉRIODE PROBATOIRE', ''], ['ALIGNÉ PRÊT', 'TSR'], ['EN SERVICE', 'TSM']];
    if (S.et[0].o > 0) {
      g.save(); g.globalAlpha = S.et[0].o; g.textAlign = 'center';
      setFont(g, F.d, 34, 700, 2.6); g.fillStyle = C.encre;
      g.fillText("L'ALIGNEMENT INITIAL  ·  SIX ÉTATS, CODÉS SUR 3 BITS", 1000, 330);
      g.restore();
    }
    const POS = i => {                       // rangée 2 parcourue de droite à gauche
      const row = i < 3 ? 0 : 1, col = i < 3 ? i : 5 - i;
      return [400 + col * 400, 470 + row * 160, row, col];
    };
    S.et.forEach((s, i) => {
      if (s.o <= 0) return;
      const [x, y] = POS(i);
      etat(g, x, y + s.dy, ET[i][0], ET[i][1], s,
           { color: i === 5 ? C.vert : C.bleu, w: 348, h: 76 });
      if (i < 5 && s.o > .6) {
        const u = clamp((s.o - .6) * 2.5);
        const [nx, ny] = POS(i + 1);
        if (i === 2) flecheD(g, x, y + 46 + s.dy, nx, ny - 46, u, { color: C.encre3, lw: 2.2 });
        else if (i < 2) flecheD(g, x + 180, y + s.dy, nx - 180, ny, u, { color: C.encre3, lw: 2.2 });
        else flecheD(g, x - 180, y + s.dy, nx + 180, ny, u, { color: C.encre3, lw: 2.2 });
      }
    });
    if (S.tsr.o > 0) {
      g.save(); g.globalAlpha = S.tsr.o; g.textAlign = 'center';
      setFont(g, F.h, 50, 700, 0); g.fillStyle = C.bleu;
      g.fillText("en service et rien à dire ? on envoie des trames de remplissage", 1000, 790);
      setFont(g, F.b, 23, 500, .3); g.fillStyle = C.encre3;
      g.fillText('pour que les deux terminaux restent éveillés', 1000, 834);
      g.restore();
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 09 · LE NIVEAU TROIS — 66.958 s ══════════════ */
const CH9 = {
  dur: 66.958,
  setup(tl, S) {
    const T = i => L(9, i);                     // repères mesurés dans la voix
    addCam(tl, S, [[0.8,2.4,{z:1.05}],[2.0,7.4,{z:1.06,y:-20}],
                   [9.6,1.0,{x:0,y:0,z:0.99}],[10.4,9.0,{z:1.05,y:20}],
                   [19.6,1.0,{x:0,y:0,z:0.99}],[20.4,16.0,{z:1.05,y:40}],
                   [36.6,1.0,{x:0,y:0,z:0.99}],[37.4,5.6,{z:1.05}],
                   [43.2,1.0,{x:0,y:0,z:0.99}],[44.0,14.0,{z:1.05,y:30}],
                   [58.4,7.0,{y:60,z:1.06}]]);
    S.cit0 = o({ dy: 16 }); S.G = [o({ dy: 18 }), o({ dy: 18 }), o({ dy: 18 })];
    S.cit = o({ dy: 16 }); S.flo = o(); S.ch = []; for (let i = 0; i < 5; i++) S.ch.push(o({ dy: 16 }));
    S.et1 = o(); S.et2 = o();
    addHeader(tl, S, '09', 'LE NIVEAU 3  ·  ORIENTER LES MESSAGES', this.dur);
    // L1-L2 · les deux groupes de fonctions
    tl.to(S.cit0, { o: 1, dy: 0, duration: .7, ease: EO }, T(1) - 0.5)
      .to(S.cit0, { o: 0, duration: .6 }, T(3) - 0.4);
    // L4 acheminement · L5 discrimination · L10 distribution
    [T(4) - 0.4, T(5) - 0.4, T(10) - 0.4].forEach((a, i) =>
      tl.to(S.G[i], { o: 1, dy: 0, duration: .5, ease: EO }, a));
    // L6-L9 · la citation puis l'arbre de décision
    tl.to(S.cit, { o: 1, dy: 0, duration: .7, ease: EO }, T(6) - 0.4)
      .to(S.flo, { o: 1, duration: .6, ease: EO }, T(8) - 0.5)
      .to([S.cit, S.flo], { o: 0, duration: .6 }, T(10) - 0.6)
      .to([S.G[0], S.G[1], S.G[2]], { o: 0, duration: .5 }, T(11) - 0.5);
    // L11-L13, L15 · les champs, chacun sur sa mention
    [T(11) + 1.6, T(12) + 0.3, T(12) + 2.6, T(13) - 0.2, T(15) - 0.3].forEach((a, i) =>
      tl.to(S.ch[i], { o: 1, dy: 0, duration: .45, ease: EO }, a));
    // L14 · l'étiquette d'acheminement   L15 · l'étiquette téléphonique
    tl.to(S.et1, { o: 1, duration: .6, ease: EO }, T(14) + 1.4)
      .to(S.et2, { o: 1, duration: .6, ease: EO }, T(15) + 1.4)
      .to([...S.ch, S.et1, S.et2], { o: 0, duration: .5 }, this.dur - 0.9);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    citation(g, 330, 470, ['Le niveau trois assume deux groupes de fonctions :',
                           "l'orientation des messages, et la gestion du réseau sémaphore."],
             S.cit0, { size: 48, source: 'le prof, ouverture de séance' });
    const GE = [['ACHEMINEMENT', "À L'ÉMISSION", 'je choisis par quel canal partir', C.bleu, 400],
                ['DISCRIMINATION', 'À LA RÉCEPTION', 'ce message est-il pour moi ?', C.rouge, 1000],
                ['DISTRIBUTION', 'APRÈS DISCRIMINATION', "je lis l'INS, je livre au bon SSU", C.vert, 1600]];
    S.G.forEach((s, i) => {
      if (s.o <= 0) return;
      const [nm, mo, sub, col, x] = GE[i];
      g.save(); g.globalAlpha = s.o; g.translate(0, s.dy); g.textAlign = 'center';
      g.fillStyle = 'rgba(255,255,255,.5)'; rr(g, x - 275, 330, 550, 180, 10); g.fill();
      g.strokeStyle = col; g.lineWidth = 2.8; g.stroke();
      setFont(g, F.m, 15, 500, 3); g.fillStyle = col;
      g.fillText(mo, x, 376);
      setFont(g, F.d, 32, 700, 2.2); g.fillStyle = C.encre;
      g.fillText(nm, x, 426);
      setFont(g, F.b, 21, 500, .3); g.fillStyle = C.encre3;
      g.fillText(sub, x, 466);
      g.restore();
    });
    citation(g, 330, 596, ['Quand je reçois un message, la première action, c\'est la discrimination.',
                           'Je compare le numéro du champ CPD avec mon numéro de point sémaphore.',
                           "Si ça correspond, c'est mon message, distribution. Si ça ne correspond",
                           'pas : si je suis un PS, poubelle ; si je suis un PTS, acheminement.'],
             S.cit, { size: 36, source: 'le prof' });
    if (S.flo.o > 0) {
      g.save(); g.globalAlpha = S.flo.o; g.textAlign = 'center';
      const Y = 860;
      boite(g, 420, Y, 300, 92, 'CPD = mon PS ?', null, S.flo.o, { color: C.rouge, ts: 24 });
      boite(g, 980, Y - 62, 300, 86, 'DISTRIBUTION', 'je livre au bon SSU', S.flo.o, { color: C.vert, ts: 22 });
      boite(g, 980, Y + 74, 300, 86, 'PS ou PTS ?', null, S.flo.o, { color: C.encre2, ts: 23 });
      boite(g, 1530, Y + 14, 300, 80, 'PS → POUBELLE', null, S.flo.o, { color: C.rouge, ts: 21 });
      boite(g, 1530, Y + 128, 330, 80, 'PTS → ACHEMINEMENT', null, S.flo.o, { color: C.bleu, ts: 19 });
      flecheD(g, 572, Y, 828, Y - 62, clamp(S.flo.o * 1.5), { color: C.vert, lw: 2.4 });
      flecheD(g, 572, Y, 828, Y + 74, clamp(S.flo.o * 1.5), { color: C.encre3, lw: 2.4 });
      flecheD(g, 1132, Y + 74, 1378, Y + 14, clamp(S.flo.o * 1.5), { color: C.rouge, lw: 2.2 });
      flecheD(g, 1132, Y + 74, 1363, Y + 128, clamp(S.flo.o * 1.5), { color: C.bleu, lw: 2.2 });
      // les réponses, portées par les flèches et non par les boîtes
      g.font = `600 21px ${F.m}`;
      g.fillStyle = C.vert;   g.fillText('OUI', 700, Y - 44);
      g.fillStyle = C.encre3; g.fillText('NON', 700, Y + 92);
      g.font = `600 19px ${F.m}`;
      g.fillStyle = C.rouge;  g.fillText('PS',  1258, Y + 28);
      g.fillStyle = C.bleu;   g.fillText('PTS', 1248, Y + 126);
      g.restore();
    }
    const CHS = [['SIO', 'octet de service', 250, C.or],
                 ['CPD', '14 bits', 300, C.rouge],
                 ['CPO', '14 bits', 300, C.bleu],
                 ['SCS', '4 bits', 210, C.vert],
                 ['CIC', 'circuit téléphonique', 330, C.encre2]];
    if (S.ch[0].o > 0) {
      let x = 1000 - (250 + 300 + 300 + 210 + 330 + 4 * 12) / 2;
      S.ch.forEach((s, i) => {
        if (s.o > 0) {
          g.save(); g.translate(0, s.dy); g.restore();
          champ(g, x, 460 + s.dy, CHS[i][2], 110, CHS[i][0], CHS[i][1], s.o, CHS[i][3]);
        }
        x += CHS[i][2] + 12;
      });
      g.save(); g.globalAlpha = S.ch[0].o; g.textAlign = 'center';
      setFont(g, F.m, 17, 500, 3.4); g.fillStyle = C.encre3;
      g.fillText('LA TRAME AU NIVEAU 3  ·  APRÈS L\'INL', 1000, 410);
      g.restore();
    }
    const X0 = 1000 - (250 + 300 + 300 + 210 + 330 + 48) / 2;
    if (S.et1.o > 0) {
      const a = X0, b = X0 + 250 + 300 + 300 + 210 + 36;
      g.save(); g.globalAlpha = S.et1.o; g.textAlign = 'center';
      g.strokeStyle = C.bleu; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(a, 592); g.lineTo(a, 614); g.lineTo(b, 614); g.lineTo(b, 592); g.stroke();
      setFont(g, F.d, 28, 700, 2.2); g.fillStyle = C.bleu;
      g.fillText("ÉTIQUETTE D'ACHEMINEMENT  ·  32 BITS", (a + b) / 2, 664);
      g.restore();
    }
    if (S.et2.o > 0) {
      const a = X0, b = X0 + 250 + 300 + 300 + 210 + 330 + 48;
      g.save(); g.globalAlpha = S.et2.o; g.textAlign = 'center';
      g.strokeStyle = C.rouge; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(a, 700); g.lineTo(a, 722); g.lineTo(b, 722); g.lineTo(b, 700); g.stroke();
      setFont(g, F.d, 28, 700, 2.2); g.fillStyle = C.rouge;
      g.fillText('ÉTIQUETTE TÉLÉPHONIQUE  ·  + LE CIC', (a + b) / 2, 772);
      g.restore();
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 10 · LE MIA ET L'APPEL — 66.625 s ══════════════
   plate Blender « appel » 34.0 → 48.0 s                           */
const CH10 = {
  // La voix met 21 s à dérouler les six messages, le plan 3D en dure 14 :
  // la fenêtre est étirée pour que chaque flèche arrive sur son nom.
  dur: 66.625, bl: { dir: 'appel', from: 37.2, to: 57.5 },
  setup(tl, S) {
    const T = i => L(10, i);                    // repères mesurés dans la voix
    addCam(tl, S, [[0.8,2.4,{z:1.05}],[2.0,8.4,{z:1.06,y:-20}],
                   [10.8,1.0,{x:0,y:0,z:0.99}],[11.6,5.0,{z:1.05}],
                   [16.8,1.0,{x:0,y:0,z:0.99}],[17.6,4.2,{z:1.04,y:10}],
                   [22.0,1.0,{x:0,y:0,z:0.99}],[22.8,13.6,{z:1.05,y:20}],
                   [36.6,1.0,{x:0,y:0,z:0.99}],[37.4,21.4,{z:1.05,x:-30}],
                   [59.0,1.0,{x:0,y:0,z:0.99}],[59.8,6.4,{z:1.05}]]);
    S.tete = o(); S.ref = o({ sc: .94 }); S.cit = o({ dy: 16 }); S.bl = o();
    S.rec = o(); S.m = []; for (let i = 0; i < 6; i++) S.m.push(o({ dy: 16 }));
    addHeader(tl, S, '10', "LE NIVEAU 4  ·  LE MIA ET L'APPEL", this.dur);
    tl.to(S.tete, { o: 1, p: 1, duration: 1.4, ease: 'none' }, T(0) + 0.4)
      .to(S.tete, { o: 0, duration: .6 }, T(3) - 0.4)
    // L3-L4 · le réflexe : lire l'indicateur de service
      .to(S.ref, { o: 1, sc: 1, duration: .7, ease: EB }, T(3) + 0.1)
      .to(S.ref, { o: 0, duration: .6 }, T(5) - 0.4)
    // L6-L9 · la citation du prof sur le MIA
      .to(S.cit, { o: 1, dy: 0, duration: .7, ease: EO }, T(6) - 0.5)
      .to(S.cit, { o: 0, duration: .6 }, T(10) - 0.5)
    // L11-L16 · l'appel se déroule, flèche par flèche
      .to(S.bl, { o: 1, duration: 1.0, ease: EO }, 37.0)
      .to(S.bl, { o: 0, duration: 1.0 }, T(17) - 0.5)
    // L17-L18 · le récapitulatif des six messages
      .to(S.rec, { o: 1, duration: .5, ease: EO }, T(17) - 0.3);
    S.m.forEach((s, i) => tl.to(s, { o: 1, dy: 0, duration: .35, ease: EB },
                                T(17) + 0.1 + i * .55));
    tl.to([S.rec, ...S.m], { o: 0, duration: .5 }, this.dur - 0.9);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    page(g, null);
    plate(g, pl, S.bl.o, 92, 0.11);
    if (S.tete.o > 0) {
      g.save(); g.globalAlpha = S.tete.o; g.textAlign = 'center';
      setFont(g, F.m, 18, 500, 5); g.fillStyle = C.rouge;
      g.fillText('NIVEAU 4  ·  LE SOUS-SYSTÈME UTILISATEUR', 1000, 330);
      setFont(g, F.h, 58, 700, 0); g.fillStyle = C.encre;
      typeOn(g, "c'est là, et seulement là,", 1000, 430, clamp(S.tete.p * 2), 'center');
      typeOn(g, "qu'apparaît le vrai message de signalisation", 1000, 506,
             clamp(S.tete.p * 2 - 1), 'center');
      g.globalAlpha = S.tete.o * clamp(S.tete.p * 3 - 2);
      setFont(g, F.b, 24, 500, .3); g.fillStyle = C.encre2;
      g.fillText('tout ce qu\'on a vu avant servait à le transporter intact', 1000, 580);
      g.restore();
    }
    if (S.ref.o > 0) {
      fiche(g, 320, 370, 1360, 300, S.ref, (gg, x, y, w, h, u) => {
        gg.textAlign = 'center';
        setFont(gg, F.m, 17, 500, 4.2); gg.fillStyle = C.rouge;
        gg.fillText('LE RÉFLEXE AVANT DE DÉCODER', x + w / 2, y + 60);
        setFont(gg, F.d, 38, 700, 2); gg.fillStyle = C.encre;
        gg.fillText("on lit l'INS  —  il dit quelle norme ouvrir", x + w / 2, y + 140);
        setFont(gg, F.m, 26, 500, 1.6); gg.fillStyle = C.bleu;
        gg.fillText('SSUT → Q.723        SSUR → Q.763', x + w / 2, y + 220);
      });
    }
    citation(g, 330, 470, ["C'est le premier message qu'on envoie vers le commutateur distant,",
                           'qui comporte les premiers chiffres composés. Si vous êtes rapide,',
                           "il transporte tous les chiffres. Sinon, il y a des messages",
                           "subséquents d'adresse qui complètent."],
             S.cit, { size: 38, source: 'le prof, sur le MIA' });
    if (S.cit.o > 0) {
      g.save(); g.globalAlpha = S.cit.o; g.textAlign = 'center';
      setFont(g, F.d, 40, 700, 2.6); g.fillStyle = C.bleu;
      g.fillText("MIA  ·  MESSAGE INITIAL D'ADRESSE", 1000, 350);
      g.restore();
    }
    if (S.rec.o > 0) {
      g.save(); g.globalAlpha = S.rec.o; g.textAlign = 'center';
      setFont(g, F.d, 34, 700, 2.6); g.fillStyle = C.encre;
      g.fillText("SIX MESSAGES, ET L'APPEL EST BOUCLÉ", 1000, 330);
      surligne(g, 648, 294, 706, clamp(S.rec.o * 1.4), 46);
      g.restore();
      const M = [['MIA', "message initial d'adresse", C.bleu],
                 ['MSS', "message subséquent d'adresse", C.bleu],
                 ['ACO', 'adresse complète', C.vert],
                 ['RAT', 'réponse avec taxation', C.vert],
                 ['FIN', 'le demandeur raccroche  ·  prioritaire', C.rouge],
                 ['LIG', 'libération de garde', C.rouge]];
      S.m.forEach((s, i) => {
        if (s.o <= 0) return;
        g.save(); g.globalAlpha = s.o; g.translate(0, s.dy); g.textAlign = 'left';
        const y = 430 + i * 88;
        g.fillStyle = 'rgba(255,255,255,.5)'; rr(g, 420, y - 34, 1160, 72, 8); g.fill();
        g.strokeStyle = M[i][2]; g.lineWidth = 2.4; g.stroke();
        setFont(g, F.d, 34, 700, 2.4); g.fillStyle = M[i][2];
        g.fillText(M[i][0], 460, y + 10);
        setFont(g, F.b, 24, 500, .3); g.fillStyle = C.encre;
        g.fillText(M[i][1], 600, y + 10);
        g.restore();
      });
    }
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

/* ══════════════ 11 · LA FICHE — 78.000 s ══════════════ */
const CH11 = {
  dur: 78.000,
  setup(tl, S) {
    const Q = i => L(11, i);                    // repères mesurés dans la voix
    addCam(tl, S, [[0.9,2.4,{z:1.04}],[2.4,26.0,{y:70,z:1.06}],
                   [29.0,26.0,{y:150,z:1.065}],[56.4,1.2,{x:0,y:0,z:0.98}],
                   [57.4,9.0,{z:1.05}],[66.8,1.2,{x:0,y:0,z:0.99}],[68.0,8.0,{z:1.04}]]);
    S.card = o({ sc: .94 }); S.b = []; for (let i = 0; i < 10; i++) S.b.push(o({ dx: -16 }));
    S.fin = o(); S.sig = o({ p: 0 });
    addHeader(tl, S, '11', "CE QU'IL FAUT RETENIR", this.dur);
    tl.to(S.card, { o: 1, sc: 1, duration: .7, ease: EB }, Q(0) + 0.2);
    // chaque ligne de la fiche se pose quand il la récite
    const TB = [Q(0) + 0.4, Q(1) - 0.3, Q(3) - 0.3, Q(4) - 0.3, Q(5) - 0.3,
                Q(6) - 0.3, Q(7) - 0.3, Q(8) - 0.3, Q(10) - 0.3, Q(12) - 0.3];
    S.b.forEach((s, i) => tl.to(s, { o: 1, dx: 0, duration: .45, ease: EO }, TB[i]));
    // L13-L14 · niveau 3 et niveau 4      L15-L16 · la signature
    tl.to([S.card, ...S.b], { o: 0, duration: .6 }, Q(13) - 0.5)
      .to(S.fin, { o: 1, duration: .7, ease: EO }, Q(13) - 0.1)
      .to(S.fin, { o: 0, duration: .5 }, Q(15) - 0.3)
      .to(S.sig, { o: 1, duration: .9, ease: EO }, Q(15) + 0.1)
      .to(S.sig, { p: 1, duration: 1.4, ease: EO }, Q(15) + 0.5);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    page(g, null);
    const B = [
      ['NIVEAU 1  ·  LA LSD', '64 kbit/s, bidirectionnelle, semi-permanente'],
      ['LE CANAL SÉMAPHORE', 'TS + LSD + TS — et le TS vit dans les AUX, ressource partagée'],
      ['LA TRAME', 'fanion · correction · INL · information · détection · fanion'],
      ['LE PIÈGE', 'détection à la FIN, correction au DÉBUT'],
      ["L'INL", '0 → TSR remplissage   ·   1 ou 2 → TSE état   ·   > 2 → TSM message'],
      ['LE FANION', '7E = 01111110 — bourrage : un 0 inséré après cinq 1'],
      ['LE CRT', 'division par un diviseur commun — même reste, trame intacte'],
      ['LA CORRECTION', 'BIR = BIA → ça roule   ·   BIR ≠ BIA → reprendre à NSR + 1'],
      ['BASE OU CYCLIQUE', 'erreur à la 10ᵉ : 1 retransmission en base, 11 en cyclique'],
      ['NIVEAUX 3 ET 4', "étiquette d'acheminement 32 bits  ·  le MIA ouvre, la LIG ferme"],
    ];
    if (S.card.o > 0) {
      fiche(g, 220, 150, 1560, 850, S.card, (gg, x, y, w, h, u) => {
        gg.textAlign = 'left';
        setFont(gg, F.m, 17, 500, 4.2); gg.fillStyle = C.rouge;
        gg.fillText('FICHE DE RÉVISION  ·  ÉPISODE 2', x + 52, y + 56);
        setFont(gg, F.d, 44, 700, 2.2); gg.fillStyle = C.encre;
        gg.fillText('LA TRAME', x + 52, y + 112);
        gg.strokeStyle = 'rgba(28,43,51,.18)'; gg.lineWidth = 1.4;
        gg.beginPath(); gg.moveTo(x + 52, y + 138); gg.lineTo(x + w - 52, y + 138); gg.stroke();
      });
      S.b.forEach((s, i) => {
        if (s.o <= 0) return;
        g.save(); g.globalAlpha = s.o; g.translate(s.dx, 0); g.textAlign = 'left';
        const y = 338 + i * 68;
        g.fillStyle = C.rouge; g.beginPath(); g.arc(290, y - 8, 5, 0, 7); g.fill();
        setFont(g, F.d, 24, 700, 2); g.fillStyle = C.encre;
        g.fillText(B[i][0], 316, y);
        setFont(g, F.b, 21, 500, .3); g.fillStyle = C.encre2;
        g.fillText(B[i][1], 316, y + 28);
        g.restore();
      });
    }
    if (S.fin.o > 0) {
      g.save(); g.globalAlpha = S.fin.o; g.textAlign = 'center';
      setFont(g, F.h, 70, 700, 0); g.fillStyle = C.encre;
      g.fillText('tu as la chaîne complète,', 1000, 470);
      setFont(g, F.d, 76, 700, 2.4); g.fillStyle = C.bleu;
      g.fillText('DU BIT À LA CONVERSATION', 1000, 580);
      setFont(g, F.h, 58, 700, 0); g.fillStyle = C.rouge;
      g.fillText('révise bien.', 1000, 686);
      g.restore();
    }
    signature(g, S.sig, 'UN COURS MIS EN IMAGES PAR',
              'Signalisation Sémaphore N°7  ·  Épisode 2  ·  La trame');
    if (S.hdr) entete(g, S.num, S.titre, S.hdr);
    fadeOut(g, S);
  },
};

const CHAPTERS = [CH0, CH1, CH2, CH3, CH4, CH5, CH6, CH7, CH8, CH9, CH10, CH11];
