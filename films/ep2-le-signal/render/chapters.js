/* ============================================================
   ÉPISODE 2 — LE SIGNAL
   ============================================================ */
const o = (i) => Object.assign({ o: 0, dx: 0, dy: 0, sc: 1, p: 0, g: 0, ok: 0 }, i);
const EO = 'power3.out', EIO = 'power2.inOut', EB = 'back.out(1.7)', EX = 'expo.out';

function addHeader(tl, S, dur, at = 0.15) {
  S.hdr = o({ big: 1, rule: 0 });
  tl.to(S.hdr, { o: 1, duration: .45, ease: EO }, at)
    .to(S.hdr, { rule: 1, duration: .55, ease: EX }, at + .15)
    .to(S.hdr, { big: 0, duration: .85, ease: EIO }, at + 2.7)
    .to(S.hdr, { o: 0, duration: .45, ease: 'power2.in' }, dur - .55);
}
function addOutro(tl, S, dur) {
  S.out = o();
  tl.to(S.out, { o: 1, duration: .45, ease: 'power2.in' }, dur - .45);
}
function fadeOut(g, S) {
  if (S.out && S.out.o > 0) { g.save(); g.globalAlpha = S.out.o; g.fillStyle = '#0B1527'; g.fillRect(0, 0, W, H); g.restore(); }
}
/* plate Blender plein cadre, avec fondu */
function plate(g, img, a) {
  if (!img || a <= 0) return;
  g.save(); g.globalAlpha = a; g.drawImage(img, 0, 0, W, H); g.restore();
}
/* compteur de capacité, réutilisé par plusieurs chapitres */
function capacity(g, x, y, val, s, sub) {
  if (!s || s.o <= 0) return;
  g.save(); g.globalAlpha = s.o;
  setFont(g, F.d, 92, 700, 1); g.fillStyle = C.amberL; g.textAlign = 'left';
  g.fillText(String(Math.round(val)), x, y);
  const w = g.measureText(String(Math.round(val))).width;
  setFont(g, F.d, 34, 500, 2); g.fillStyle = C.cream2;
  g.fillText('MHz', x + w + 16, y);
  if (sub) { setFont(g, F.b, 20, 400, .2); g.fillStyle = C.cream3; g.fillText(sub, x, y + 34); }
  g.restore();
}

/* ══════════════ 00 · ACCROCHE — 11.267 s ══════════════ */
const CH0 = {
  dur: 11.267, plate: { dir: 'f8', n: 493, rev: true },
  setup(tl, S) {
    S.ring = o(); S.sat = o(); S.rule = o(); S.tit = o(); S.sub = o();
    tl.to(S.ring, { o: 1, p: 1, duration: 1.6, ease: EX }, .9)
      .to(S.sat, { o: 1, duration: .6, ease: EB }, 1.8)
      .to(S.rule, { p: 1, duration: .5, ease: EX }, 4.9)
      .to(S.tit, { o: 1, duration: .3 }, 5.0)
      .to(S.tit, { p: 1, duration: 1.4, ease: 'none' }, 5.0)
      .to(S.sub, { o: 1, dx: 0, duration: .6, ease: EO }, 6.5)
      .fromTo(S.sub, { dx: -26 }, { dx: 0, duration: .6, ease: EO }, 6.5)
      .to([S.tit, S.sub, S.rule, S.sat, S.ring], { o: 0, duration: .6 }, 10.3);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    bgNight(g);
    if (pl) { g.drawImage(pl, 0, 0, W, H);
      g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .22;
      g.fillStyle = '#5E7FA8'; g.fillRect(0, 0, W, H); g.restore(); }
    const CX = 960, CY = 540, RR = 470;
    if (S.ring.o > 0) {
      g.save(); g.globalAlpha = S.ring.o * .42;
      g.strokeStyle = C.cream2; g.lineWidth = 1.3; g.setLineDash([3, 11]);
      g.beginPath(); g.ellipse(CX, CY, RR * S.ring.p, RR * .30 * S.ring.p, 0, 0, 7); g.stroke();
      g.restore();
    }
    if (S.sat.o > 0) {
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + i * 2.0944 + t * .04;
        g.save(); g.globalAlpha = S.sat.o;
        satellite(g, CX + Math.cos(a) * RR, CY + Math.sin(a) * RR * .30, .95, 1, C.cream, 2);
        g.restore();
      }
    }
    if (S.tit.o > 0 || S.rule.p > 0) {
      const x = 118, y = 846;
      g.save();
      const sc = g.createLinearGradient(0, y - 210, 0, H);
      sc.addColorStop(0, 'rgba(10,18,32,0)'); sc.addColorStop(1, 'rgba(10,18,32,.80)');
      g.globalAlpha = Math.max(S.tit.o, S.rule.p);
      g.fillStyle = sc; g.fillRect(0, y - 210, W, H - y + 210);
      rule(g, x, y - 96, 96, S.rule.p, C.amber, 3);
      g.globalAlpha = S.tit.o;
      setFont(g, F.d, 104, 700, 2); g.fillStyle = C.cream; g.textAlign = 'left';
      typeOn(g, 'LE SIGNAL', x, y, S.tit.p);
      g.globalAlpha = S.sub.o;
      setFont(g, F.m, 21, 400, 6.5); g.fillStyle = C.amberL;
      g.fillText('ÉPISODE 2', x + 4 + S.sub.dx, y + 50);
      g.fillStyle = C.cream3;
      g.fillText('TÉLÉCOMS PAR SATELLITE', x + 252 + S.sub.dx, y + 50);
      g.restore();
    }
    paper(g, .035); grain(g, _frameIdx, .8); vignette(g, .46);
    fadeOut(g, S);
  },
};

/* ══════════════ 01 · LE RÉPÉTEUR — 34.431 s ══════════════
   plate Blender 8.0 → 22.0 s                                   */
const CH1 = {
  dur: 34.431, bl: { dir: 'rep', from: 8.0, to: 22.0 },
  setup(tl, S) {
    S.c = [o({ dy: 18 }), o({ dy: 18 }), o({ dy: 18 })];
    S.bl = o(); S.shift = o({ sc: 1.3 }); S.warn = o({ dy: 20 });
    addHeader(tl, S, this.dur);
    tl.to(S.c[0], { o: 1, dy: 0, duration: .5, ease: EO }, 2.4)
      .to(S.c[1], { o: 1, dy: 0, duration: .5, ease: EO }, 3.3)
      .to(S.c[2], { o: 1, dy: 0, duration: .5, ease: EO }, 4.2)
      .to(S.bl, { o: 1, duration: 1.0, ease: EO }, 7.6)
      .to([S.c[0], S.c[1], S.c[2]], { o: .35, duration: .8 }, 7.6)
      .to(S.shift, { o: 1, sc: 1, duration: .6, ease: EB }, 15.4)
      .to(S.shift, { o: 0, duration: .5 }, 20.6)
      .to(S.bl, { o: 0, duration: 1.0, ease: 'power2.in' }, 21.4)
      .to([S.c[0], S.c[1], S.c[2]], { o: 1, duration: .8 }, 21.8)
      .to(S.warn, { o: 1, dy: 0, duration: .6, ease: EO }, 25.0)
      .to([S.warn, S.c[0], S.c[1], S.c[2]], { o: 0, duration: .5 }, 33.6);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    bgNight(g); grid(g, .035, 72);
    plate(g, pl, S.bl.o);
    const lab = ['IL REÇOIT', 'IL AMPLIFIE', 'IL RENVOIE'];
    const sub = ['la porteuse qui monte', 'elle arrive épuisée', 'vers le sol, décalée'];
    lab.forEach((L, i) => {
      const s = S.c[i]; if (s.o <= 0) return;
      const x = 300 + i * 480, y = 292 + s.dy;
      g.save(); g.globalAlpha = s.o;
      setFont(g, F.m, 17, 500, 3); g.fillStyle = C.amberL; g.textAlign = 'left';
      g.fillText('0' + (i + 1), x, y - 42);
      setFont(g, F.d, 48, 700, 1.6); g.fillStyle = C.cream;
      g.fillText(L, x, y);
      setFont(g, F.b, 20, 400, .2); g.fillStyle = C.cream3;
      g.fillText(sub[i], x, y + 34);
      rule(g, x, y + 56, 110, 1, 'rgba(201,121,42,.6)', 2);
      g.restore();
    });
    if (S.shift.o > 0) {
      g.save(); g.globalAlpha = S.shift.o;
      g.translate(960, 896); g.scale(S.shift.sc, S.shift.sc);
      setFont(g, F.d, 76, 700, 3); g.fillStyle = C.amberL; g.textAlign = 'center';
      g.fillText('— 2225 MHz', 0, 0);
      setFont(g, F.b, 22, 400, .3); g.fillStyle = C.cream2;
      g.fillText('la fréquence de transposition', 0, 42);
      g.restore();
    }
    warn(g, 960, 760, ['S\'il réémettait sur sa fréquence d\'écoute,',
                       'le satellite se rendrait sourd.'], S.warn, { w: 760, align: 'center' });
    header(g, '01', 'LE RÉPÉTEUR', S.hdr);
    paper(g, .045); grain(g, _frameIdx, .9); vignette(g, .5);
    fadeOut(g, S);
  },
};

/* ══════════════ 02 · LE PLAN DE BANDE — 56.081 s ══════════════
   plate Blender 20.0 → 38.0 s                                   */
const CH2 = {
  dur: 56.081, bl: { dir: 'cross', from: 20.0, to: 38.0 },
  setup(tl, S) {
    S.rail = o(); S.seg = [o(), o(), o()]; S.tot = o(); S.bl = o();
    S.trap = o({ sc: 1.25 }); S.t1 = o({ dx: -24 }); S.t2 = o({ dx: -24 }); S.mem = o();
    addHeader(tl, S, this.dur);
    tl.to(S.rail, { o: 1, p: 1, duration: 1.0, ease: EX }, 1.6)
      .to(S.seg[1], { o: 1, p: 1, duration: .8, ease: EB }, 4.2)   // principale 500
      .to(S.seg[0], { o: 1, p: 1, duration: .7, ease: EB }, 7.0)   // début +75
      .to(S.seg[2], { o: 1, p: 1, duration: .7, ease: EB }, 9.4)   // fin +225
      .to(S.tot, { o: 1, duration: .6, ease: EO }, 12.4)
      .to(S.bl, { o: 1, duration: 1.2, ease: EO }, 19.4)
      .to([S.rail, S.seg[0], S.seg[1], S.seg[2], S.tot], { o: 0, duration: 1.0 }, 19.4)
      .to(S.bl, { o: 0, duration: 1.2, ease: 'power2.in' }, 37.2)
      .to(S.t1, { o: 1, dx: 0, duration: .6, ease: EO }, 39.0)
      .to(S.t2, { o: 1, dx: 0, duration: .6, ease: EO }, 41.0)
      .to(S.trap, { o: 1, sc: 1, duration: .8, ease: EB }, 46.6)
      .to(S.mem, { o: 1, p: 1, duration: 1.6, ease: 'none' }, 50.2)
      .to([S.t1, S.t2, S.trap, S.mem], { o: 0, duration: .5 }, 55.5);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    bgNight(g); grid(g, .035, 80);
    plate(g, pl, S.bl.o);

    /* ---- phase 1 : construction 2D des deux bandes ---- */
    const UX = 240, UW = 1440, UY = 360, DY = 640, BH = 56;
    const segs = [
      { a: 5850, b: 5925, col: C.teal,   lab: '+75',  nm: 'DÉBUT' },
      { a: 5925, b: 6425, col: C.cream2, lab: '500',  nm: 'PRINCIPALE' },
      { a: 6425, b: 6650, col: C.amber,  lab: '+225', nm: 'FIN' },
    ];
    const fx = f => UX + (f - 5850) / 800 * UW;
    if (S.rail.o > 0) {
      g.save(); g.globalAlpha = S.rail.o;
      g.strokeStyle = 'rgba(207,198,184,.35)'; g.lineWidth = 1;
      g.strokeRect(UX + .5, UY + .5, UW * S.rail.p, BH);
      g.strokeRect(UX + .5, DY + .5, UW * S.rail.p, BH);
      setFont(g, F.m, 16, 500, 3.4); g.fillStyle = C.cream3; g.textAlign = 'left';
      g.fillText('MONTANTE  ↑  5850 — 6650 MHz', UX, UY - 20);
      g.fillText('DESCENDANTE  ↓  3400 — 4200 MHz', UX, DY - 20);
      g.restore();
    }
    segs.forEach((sg, i) => {
      const s = S.seg[i]; if (s.o <= 0) return;
      const x0 = fx(sg.a), x1 = fx(sg.b), w = (x1 - x0) * s.p;
      g.save(); g.globalAlpha = s.o;
      g.fillStyle = sg.col; g.globalAlpha = s.o * .30;
      g.fillRect(x0, UY + 2, w, BH - 4);
      g.globalAlpha = s.o; g.strokeStyle = sg.col; g.lineWidth = 2;
      g.strokeRect(x0 + .5, UY + .5, w, BH - 1);
      setFont(g, F.m, 19, 500, 1.4); g.fillStyle = sg.col; g.textAlign = 'center';
      g.fillText(sg.lab, x0 + w / 2, UY + 36);
      setFont(g, F.m, 13, 500, 2.2); g.fillStyle = C.cream3;
      g.fillText(sg.nm, x0 + w / 2, UY - 72 + (i === 1 ? 0 : 22));
      // image descendante
      const dmap = [[3625, 3700], [3700, 4200], [3400, 3625]][i];
      const dfx = f => UX + (f - 3400) / 800 * UW;
      const d0 = dfx(dmap[0]), d1 = dfx(dmap[1]), dw = (d1 - d0) * s.p;
      g.globalAlpha = s.o * .30; g.fillStyle = sg.col;
      g.fillRect(d0, DY + 2, dw, BH - 4);
      g.globalAlpha = s.o; g.strokeStyle = sg.col; g.lineWidth = 2;
      g.strokeRect(d0 + .5, DY + .5, dw, BH - 1);
      g.restore();
    });
    if (S.tot.o > 0) {
      g.save(); g.globalAlpha = S.tot.o;
      setFont(g, F.d, 56, 700, 1.4); g.fillStyle = C.cream; g.textAlign = 'center';
      g.fillText('800 MHz dans chaque sens', 960, 846);
      setFont(g, F.b, 21, 400, .3); g.fillStyle = C.cream3;
      g.fillText('500 au départ, puis deux extensions', 960, 884);
      g.restore();
    }

    /* ---- phase 3 : le piège énoncé ---- */
    chip(g, 240, 300 + S.t1.dx * 0, 'BANDE PRINCIPALE  ET  DÉBUT   →   − 2225 MHz', S.t1,
      { color: C.cream2, bg: 'rgba(207,198,184,.10)', size: 24 });
    chip(g, 240, 376, 'FIN DE BANDE   →   − 3025 MHz', S.t2,
      { color: C.amberL, size: 24 });
    if (S.trap.o > 0) {
      g.save(); g.globalAlpha = S.trap.o;
      g.translate(960, 590); g.scale(S.trap.sc, S.trap.sc);
      setFont(g, F.m, 16, 500, 4); g.fillStyle = C.red; g.textAlign = 'center';
      g.fillText('LE PIÈGE', 0, -104);
      setFont(g, F.d, 72, 700, 2.2); g.fillStyle = C.cream;
      g.fillText('LA FIN DE LA MONTANTE', 0, 10);
      g.fillStyle = C.amberL;
      g.fillText('DEVIENT LE BAS DE LA DESCENDANTE', 0, 86);
      g.restore();
    }
    if (S.mem.o > 0) {
      g.save(); g.globalAlpha = S.mem.o;
      setFont(g, F.b, 27, 400, .3); g.fillStyle = C.cream2; g.textAlign = 'center';
      typeOn(g, 'les deux extrêmes se croisent', 960, 790, S.mem.p, 'center');
      g.restore();
    }
    header(g, '02', 'LE PLAN DE BANDE C', S.hdr);
    paper(g, .045); grain(g, _frameIdx, .9); vignette(g, .5);
    fadeOut(g, S);
  },
};

/* ══════════════ 03 · LA POLARISATION — 37.604 s ══════════════
   plate Blender 8.0 → 26.0 s                                    */
const CH3 = {
  dur: 37.604, bl: { dir: 'polar', from: 8.0, to: 26.0 },
  setup(tl, S) {
    S.intro = o(); S.bl = o(); S.r = o({ dx: -26 }); S.l = o({ dx: -26 });
    S.orth = o({ sc: 1.25 }); S.cap = o(); S.capv = { v: 800 };
    addHeader(tl, S, this.dur);
    tl.to(S.intro, { o: 1, p: 1, duration: 1.4, ease: 'none' }, 1.8)
      .to(S.bl, { o: 1, duration: 1.1, ease: EO }, 7.4)
      .to(S.intro, { o: 0, duration: .8 }, 7.4)
      .to(S.r, { o: 1, dx: 0, duration: .6, ease: EO }, 10.4)
      .to(S.l, { o: 1, dx: 0, duration: .6, ease: EO }, 11.6)
      .to(S.orth, { o: 1, sc: 1, duration: .7, ease: EB }, 16.8)
      .to([S.r, S.l, S.orth], { o: 0, duration: .7 }, 24.4)
      .to(S.bl, { o: 0, duration: 1.1, ease: 'power2.in' }, 25.0)
      .to(S.cap, { o: 1, duration: .6, ease: EO }, 28.4)
      .to(S.capv, { v: 1600, duration: 1.6, ease: EIO }, 30.6)
      .to(S.cap, { o: 0, duration: .5 }, 36.8);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t, pl) {
    bgNight(g); grid(g, .03, 90);
    plate(g, pl, S.bl.o);
    if (S.intro.o > 0) {
      g.save(); g.globalAlpha = S.intro.o;
      setFont(g, F.d, 60, 600, 1.4); g.fillStyle = C.cream; g.textAlign = 'center';
      typeOn(g, 'le champ électrique ne reste pas droit', 960, 520, S.intro.p, 'center');
      g.globalAlpha = S.intro.o * clamp((S.intro.p - .6) / .4);
      setFont(g, F.b, 26, 400, .3); g.fillStyle = C.amberL;
      g.fillText('il tourne en avançant, comme un tire-bouchon', 960, 580);
      g.restore();
    }
    // les sens de rotation sont déjà écrits dans la plate Blender ; on ne les redit pas.
    // à la place : ce que la plate ne montre pas, la conséquence.
    chip(g, 1072, 250, 'une antenne à droite ne voit pas la gauche', S.r,
      { color: C.cream2, size: 23 });
    chip(g, 1072, 316, 'deux signaux · une seule fréquence', S.l,
      { color: C.amberL, bg: 'rgba(201,121,42,.14)', size: 23 });
    if (S.orth.o > 0) {
      g.save(); g.globalAlpha = S.orth.o;
      g.translate(960, 886); g.scale(S.orth.sc, S.orth.sc);
      const TXT = 'ORTHOGONALES  —  ELLES S\'IGNORENT';
      setFont(g, F.d, 44, 700, 2); g.textAlign = 'center';
      const tw = g.measureText(TXT).width;
      const sc = g.createLinearGradient(-tw / 2 - 90, 0, tw / 2 + 90, 0);
      sc.addColorStop(0, 'rgba(8,14,24,0)'); sc.addColorStop(.18, 'rgba(8,14,24,.80)');
      sc.addColorStop(.82, 'rgba(8,14,24,.80)'); sc.addColorStop(1, 'rgba(8,14,24,0)');
      g.fillStyle = sc; g.fillRect(-tw / 2 - 90, -42, tw + 180, 60);
      g.fillStyle = C.cream; g.fillText(TXT, 0, 0);
      g.restore();
    }
    if (S.cap.o > 0) {
      g.save(); g.globalAlpha = S.cap.o;
      setFont(g, F.b, 28, 400, .3); g.fillStyle = C.cream2; g.textAlign = 'center';
      g.fillText('deux canaux sur une seule fréquence', 960, 430);
      g.restore();
      capacity(g, 790, 580, S.capv.v, S.cap, null);
      g.save(); g.globalAlpha = S.cap.o * clamp((S.capv.v - 900) / 500);
      setFont(g, F.d, 44, 600, 2); g.fillStyle = C.amberL; g.textAlign = 'center';
      g.fillText('× 2', 960, 680);
      g.restore();
    }
    header(g, '03', 'LA POLARISATION', S.hdr);
    paper(g, .045); grain(g, _frameIdx, .9); vignette(g, .5);
    fadeOut(g, S);
  },
};

/* ══════════════ 04 · LE BRUIT DU CIEL — 30.116 s ══════════════ */
const CH4 = {
  dur: 30.116,
  setup(tl, S) {
    S.ax = o(); S.cur = o(); S.gal = o(); S.h2o = o(); S.o2 = o();
    S.win = o(); S.m4 = o({ dy: -30 }); S.m6 = o({ dy: -30 }); S.note = o();
    addHeader(tl, S, this.dur);
    tl.to(S.ax, { o: 1, p: 1, duration: 1.0, ease: EX }, 1.2)
      .to(S.cur, { o: 1, p: 1, duration: 2.6, ease: 'power1.inOut' }, 2.4)
      .to(S.gal, { o: 1, duration: .6, ease: EO }, 4.6)
      .to(S.h2o, { o: 1, duration: .6, ease: EO }, 9.6)
      .to(S.o2, { o: 1, duration: .6, ease: EO }, 11.4)
      .to(S.win, { o: 1, p: 1, duration: 1.2, ease: EX }, 15.4)
      .to(S.m6, { o: 1, dy: 0, duration: .6, ease: EB }, 19.2)
      .to(S.m4, { o: 1, dy: 0, duration: .6, ease: EB }, 20.0)
      .to(S.note, { o: 1, p: 1, duration: 1.4, ease: 'none' }, 23.8)
      .to([S.ax, S.cur, S.gal, S.h2o, S.o2, S.win, S.m4, S.m6, S.note], { o: 0, duration: .5 }, 29.6);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    bgNight(g); grid(g, .028, 96);
    const X0 = 240, X1 = 1700, Y0 = 820, Y1 = 280;
    // axe log 0.3 → 100 GHz
    const lx = f => X0 + (Math.log10(f) - Math.log10(0.3)) / (Math.log10(100) - Math.log10(0.3)) * (X1 - X0);
    const ly = k => Y0 - Math.min(k, 300) / 300 * (Y0 - Y1);
    // courbe de bruit : galactique en bas, pics eau/oxygène en haut
    const noise = f => 2.7 + 180 * Math.pow(0.3 / f, 2.4)
      + 120 * Math.exp(-Math.pow((f - 22) / 4.2, 2))
      + 260 * Math.exp(-Math.pow((f - 60) / 7.0, 2))
      + 14 * Math.pow(Math.max(f - 10, 0) / 20, 1.6);
    if (S.ax.o > 0) {
      g.save(); g.globalAlpha = S.ax.o;
      g.strokeStyle = 'rgba(207,198,184,.5)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(X0, Y0); g.lineTo(X0 + (X1 - X0) * S.ax.p, Y0); g.stroke();
      g.beginPath(); g.moveTo(X0, Y0); g.lineTo(X0, Y0 - (Y0 - Y1) * S.ax.p); g.stroke();
      setFont(g, F.m, 15, 500, 2.6); g.fillStyle = C.cream3; g.textAlign = 'center';
      [0.3, 1, 3, 10, 30, 100].forEach(f => {
        g.globalAlpha = S.ax.o * .8;
        g.fillText(f < 1 ? '0,3' : String(f), lx(f), Y0 + 30);
        g.globalAlpha = S.ax.o * .25;
        g.beginPath(); g.moveTo(lx(f), Y0); g.lineTo(lx(f), Y0 - 8); g.stroke();
      });
      g.globalAlpha = S.ax.o; g.textAlign = 'right';
      g.fillText('FRÉQUENCE  (GHz)  →', X1, Y0 + 62);
      g.save(); g.translate(X0 - 34, (Y0 + Y1) / 2); g.rotate(-Math.PI / 2);
      g.textAlign = 'center'; g.fillText('BRUIT DU CIEL  →', 0, 0); g.restore();
      g.restore();
    }
    if (S.win.o > 0) {
      const a = lx(1), b = lx(10), bw = (b - a) * S.win.p;
      g.save(); g.globalAlpha = S.win.o;
      const gr = g.createLinearGradient(0, Y0, 0, Y1 - 10);
      gr.addColorStop(0, 'rgba(201,121,42,.34)');
      gr.addColorStop(.45, 'rgba(201,121,42,.13)');
      gr.addColorStop(1, 'rgba(201,121,42,0)');
      g.fillStyle = gr; g.fillRect(a, Y1 - 10, bw, Y0 - Y1 + 10);
      g.strokeStyle = 'rgba(201,121,42,.45)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(a, Y0); g.lineTo(a, Y1 + 40); g.stroke();
      if (S.win.p > .98) { g.beginPath(); g.moveTo(b, Y0); g.lineTo(b, Y1 + 40); g.stroke(); }
      g.restore();
      g.save(); g.globalAlpha = S.win.o;
      setFont(g, F.d, 40, 700, 2.4); g.fillStyle = C.amberL; g.textAlign = 'center';
      g.fillText('LA FENÊTRE', (lx(1) + lx(10)) / 2, Y1 - 26);
      g.restore();
    }
    if (S.cur.o > 0) {
      g.save(); g.globalAlpha = S.cur.o;
      g.strokeStyle = C.cream; g.lineWidth = 3; g.lineCap = 'round';
      glow(g, 'rgba(243,236,224,.45)', 12, () => {
        g.beginPath();
        const N = 420;
        for (let i = 0; i <= N * S.cur.p; i++) {
          const f = Math.pow(10, Math.log10(0.3) + (i / N) * (Math.log10(100) - Math.log10(0.3)));
          i ? g.lineTo(lx(f), ly(noise(f))) : g.moveTo(lx(f), ly(noise(f)));
        }
        g.stroke();
      });
      g.restore();
    }
    const tag = (s, f, txt, col, dy) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o;
      setFont(g, F.m, 17, 500, 2); g.fillStyle = col; g.textAlign = 'center';
      g.fillText(txt, lx(f), ly(noise(f)) + dy);
      g.restore();
    };
    if (S.gal.o > 0) {
      g.save(); g.globalAlpha = S.gal.o;
      setFont(g, F.m, 17, 500, 2); g.fillStyle = C.cream3; g.textAlign = 'left';
      g.fillText('FOND GALACTIQUE', X0 + 22, Y1 + 52);
      g.strokeStyle = 'rgba(207,198,184,.35)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(X0 + 22, Y1 + 66); g.lineTo(X0 + 22, ly(noise(0.33)) - 10); g.stroke();
      g.restore();
    }
    tag(S.h2o, 22, 'EAU  22 GHz', C.tealL, -24);
    tag(S.o2, 60, 'OXYGÈNE  60 GHz', C.tealL, -24);
    [[S.m4, 4, '4 GHz', 'DESCENDANTE', C.tealL], [S.m6, 6, '6 GHz', 'MONTANTE', C.amberL]]
      .forEach(([s, f, a, b, col]) => {
        if (s.o <= 0) return;
        g.save(); g.globalAlpha = s.o;
        g.strokeStyle = col; g.lineWidth = 2;
        g.beginPath(); g.moveTo(lx(f), Y0); g.lineTo(lx(f), ly(noise(f)) + s.dy); g.stroke();
        g.fillStyle = col; g.beginPath(); g.arc(lx(f), ly(noise(f)) + s.dy, 5, 0, 7); g.fill();
        const off = f < 5 ? -132 : 132;
        g.globalAlpha = s.o * .55;
        g.beginPath(); g.moveTo(lx(f), Y0 + 6); g.lineTo(lx(f), Y0 + 54);
        g.lineTo(lx(f) + off, Y0 + 54); g.stroke();
        g.globalAlpha = s.o;
        g.fillStyle = col;
        setFont(g, F.d, 32, 700, 1.4); g.textAlign = 'center';
        g.fillText(a, lx(f) + off, Y0 + 96);
        setFont(g, F.m, 14, 500, 2); g.fillStyle = C.cream3;
        g.fillText(b, lx(f) + off, Y0 + 122);
        g.restore();
      });
    if (S.note.o > 0) {
      g.save(); g.globalAlpha = S.note.o;
      setFont(g, F.b, 26, 400, .3); g.fillStyle = C.cream2; g.textAlign = 'center';
      typeOn(g, 'la descendante prend le bas de la fenêtre : c\'est elle qui arrive la plus faible',
        960, 1000, S.note.p, 'center');
      g.restore();
    }
    header(g, '04', 'POURQUOI 6 ET 4 GHz', S.hdr);
    paper(g, .045); grain(g, _frameIdx, .9); vignette(g, .5);
    fadeOut(g, S);
  },
};

/* ══════════════ 05 · LES FAISCEAUX — 32.676 s ══════════════ */
const CH5 = {
  dur: 32.676,
  setup(tl, S) {
    S.globe = o(); S.b = [o(), o(), o(), o()];
    S.reuse = o(); S.cap = o(); S.capv = { v: 800 };
    addHeader(tl, S, this.dur);
    tl.to(S.globe, { o: 1, duration: .9, ease: EO }, 1.0)
      .to(S.b[0], { o: 1, p: 1, duration: 1.0, ease: EO }, 3.4)
      .to(S.b[1], { o: 1, p: 1, duration: 1.0, ease: EO }, 7.0)
      .to(S.b[2], { o: 1, p: 1, duration: 1.0, ease: EO }, 10.6)
      .to(S.b[3], { o: 1, p: 1, duration: 1.0, ease: EO }, 14.2)
      .to(S.reuse, { o: 1, duration: .7, ease: EO }, 18.6)
      .to(S.cap, { o: 1, duration: .6, ease: EO }, 24.2)
      .to(S.capv, { v: 3500, duration: 2.2, ease: EIO }, 25.4)
      .to([S.globe, S.b[0], S.b[1], S.b[2], S.b[3], S.reuse, S.cap], { o: 0, duration: .5 }, 32.1);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    bgNight(g); grid(g, .03, 90);
    const CX = 700, CY = 560, R = 250;
    if (S.globe.o > 0) { g.save(); g.globalAlpha = S.globe.o; globe(g, CX, CY, R, t * .16); g.restore(); }
    const wedge = (a0, a1, alpha, col, rr) => {
      g.save(); g.beginPath(); g.arc(CX, CY, R, 0, 7); g.clip();
      g.globalAlpha = alpha; g.fillStyle = col;
      g.beginPath(); g.moveTo(CX, CY); g.arc(CX, CY, R * rr, a0, a1); g.closePath(); g.fill();
      g.restore();
    };
    // GLOBAL
    if (S.b[0].o > 0) { g.save(); g.globalAlpha = S.b[0].o;
      wedge(0, 7, .15 * S.b[0].p, C.amber, 1.02); g.restore(); }
    // HEMI
    if (S.b[1].o > 0) { g.save(); g.globalAlpha = S.b[1].o;
      wedge(-Math.PI / 2, Math.PI / 2, .17 * S.b[1].p, C.amberL, 1.02);
      g.globalAlpha = S.b[1].o * .5; g.strokeStyle = C.cream2; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(CX, CY - R); g.lineTo(CX, CY + R); g.stroke(); g.restore(); }
    // ZONES
    if (S.b[2].o > 0) { g.save();
      for (let i = 0; i < 4; i++) {
        const a0 = -Math.PI / 2 + i * Math.PI / 2, a1 = a0 + Math.PI / 2;
        g.globalAlpha = S.b[2].o;
        wedge(a0 + .04, a1 - .04, .20 * S.b[2].p, i % 2 ? C.teal : C.amber, 1.02);
      }
      g.restore(); }
    // SPOTS
    if (S.b[3].o > 0) {
      [[-0.9, .42], [1.5, .36]].forEach(([a, rr], i) => {
        const x = CX + Math.cos(a) * R * .48, y = CY + Math.sin(a) * R * .48;
        g.save(); g.globalAlpha = S.b[3].o * S.b[3].p;
        g.beginPath(); g.arc(CX, CY, R, 0, 7); g.clip();
        const gr = g.createRadialGradient(x, y, 2, x, y, R * rr);
        gr.addColorStop(0, 'rgba(255,214,150,.85)'); gr.addColorStop(1, 'rgba(201,121,42,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, R * rr, 0, 7); g.fill();
        g.restore();
      });
    }
    const names = [['GLOBAL', 'tout ce qu\'il voit'], ['HÉMISPHÉRIQUE', 'une moitié chacun'],
                   ['ZONE', 'découpé par continent'], ['SPOT', 'étroit et puissant']];
    names.forEach((n, i) => {
      const s = S.b[i]; if (s.o <= 0) return;
      const y = 300 + i * 112;
      g.save(); g.globalAlpha = s.o;
      g.fillStyle = i === 3 ? C.amberL : C.cream;
      setFont(g, F.d, 42, 700, 1.8); g.textAlign = 'left';
      g.fillText(n[0], 1160, y);
      setFont(g, F.b, 20, 400, .2); g.fillStyle = C.cream3;
      g.fillText(n[1], 1160, y + 30);
      g.restore();
    });
    if (S.reuse.o > 0) {
      g.save(); g.globalAlpha = S.reuse.o;
      setFont(g, F.b, 25, 400, .3); g.fillStyle = C.cream2; g.textAlign = 'left';
      g.fillText('deux zones qui ne se touchent pas', 1160, 790);
      g.fillStyle = C.amberL;
      g.fillText('réutilisent la même fréquence', 1160, 826);
      g.restore();
    }
    capacity(g, 1160, 940, S.capv.v, S.cap, '800 → 1600 → 3500 avec la bande Ku');
    header(g, '05', 'LES FAISCEAUX', S.hdr);
    paper(g, .045); grain(g, _frameIdx, .9); vignette(g, .5);
    fadeOut(g, S);
  },
};

/* ══════════════ 06 · INTELSAT — 44.118 s ══════════════ */
const CH6 = {
  dur: 44.118,
  setup(tl, S) {
    S.bars = o(); S.hi = o(); S.spin = o(); S.tri = o(); S.reg = o(); S.apr = o();
    S.part = { a: 1, b: 0, c: 0 };
    addHeader(tl, S, this.dur);
    tl.to(S.bars, { o: 1, p: 1, duration: 3.4, ease: EO }, 1.4)
      .to(S.hi, { o: 1, duration: .8, ease: EO }, 11.0)
      .to(S.part, { a: 0, duration: .8, ease: 'power2.in' }, 19.0)
      .to(S.part, { b: 1, duration: .8, ease: 'power2.out' }, 19.5)
      .to(S.spin, { o: 1, duration: .7, ease: EO }, 20.2)
      .to(S.tri, { o: 1, duration: .7, ease: EO }, 23.4)
      .to(S.part, { b: 0, duration: .8, ease: 'power2.in' }, 31.2)
      .to(S.part, { c: 1, duration: .8, ease: 'power2.out' }, 31.7)
      .to(S.reg, { o: 1, duration: .8, ease: EO }, 32.4)
      .to(S.apr, { o: 1, sc: 1, duration: .7, ease: EB }, 38.0)
      .to([S.reg, S.apr], { o: 0, duration: .5 }, 43.6);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    bgNight(g); grid(g, .03, 90);
    /* ---- A : la frise I → IX ---- */
    if (S.part.a > .01) {
      g.save(); g.globalAlpha = S.part.a;
      const data = [['I', 50, '1,5'], ['II', 125, '3'], ['III', 450, '5'], ['IV', 480, '7'],
                    ['IV-A', 800, '7'], ['V', 2200, '7'], ['V-A', 2250, '7'], ['VI', 3300, '10'],
                    ['VII', 2432, '10,9'], ['VIII', 2550, '10'], ['IX', 3456, '13']];
      const BX = 220, BW = 1480, Y0 = 760, HMAX = 420;
      data.forEach((d, i) => {
        const u = clamp(S.bars.p * data.length - i);
        if (u <= 0) return;
        const w = BW / data.length - 18;
        const x = BX + i * (BW / data.length);
        const h = d[1] / 3500 * HMAX * eOutC(u);
        const hot = (d[0] === 'IV-A' || d[0] === 'V') && S.hi.o > .3;
        g.save(); g.globalAlpha = S.part.a * S.bars.o;
        g.fillStyle = hot ? C.amber : 'rgba(143,176,214,.45)';
        g.fillRect(x, Y0 - h, w, h);
        g.strokeStyle = hot ? C.amberL : 'rgba(207,198,184,.35)'; g.lineWidth = 1;
        g.strokeRect(x + .5, Y0 - h + .5, w, h);
        setFont(g, F.d, 26, 700, 1); g.fillStyle = hot ? C.amberL : C.cream; g.textAlign = 'center';
        g.fillText(d[0], x + w / 2, Y0 + 32);
        setFont(g, F.m, 14, 400, 1); g.fillStyle = C.cream3;
        g.fillText(d[2] + ' ans', x + w / 2, Y0 + 56);
        if (u > .9) { setFont(g, F.m, 15, 500, .6); g.fillStyle = hot ? C.amberL : C.cream2;
          g.fillText(String(d[1]), x + w / 2, Y0 - h - 12); }
        g.restore();
      });
      g.globalAlpha = S.part.a * S.bars.o;
      g.strokeStyle = 'rgba(207,198,184,.4)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(BX, Y0 + .5); g.lineTo(BX + BW, Y0 + .5); g.stroke();
      setFont(g, F.m, 16, 500, 3); g.fillStyle = C.cream3; g.textAlign = 'left';
      g.fillText('BANDE TOTALE (MHz)  ·  DURÉE DE VIE', BX, 300);
      if (S.hi.o > 0) {
        g.globalAlpha = S.part.a * S.hi.o;
        setFont(g, F.b, 23, 400, .3); g.fillStyle = C.amberL; g.textAlign = 'left';
        g.fillText('IV-A : réutilisation par l\'espace      V : réutilisation par la polarisation', BX, 880);
      }
      g.restore();
    }
    /* ---- B : rotation vs triaxiale ---- */
    if (S.part.b > .01) {
      g.save(); g.globalAlpha = S.part.b;
      // cylindrique qui tourne
      if (S.spin.o > 0) {
        const x = 560, y = 540;
        g.save(); g.globalAlpha = S.part.b * S.spin.o;
        g.translate(x, y);
        g.strokeStyle = C.cream2; g.lineWidth = 2.4;
        g.beginPath(); g.ellipse(0, -90, 100, 26, 0, 0, 7); g.stroke();
        g.beginPath(); g.moveTo(-100, -90); g.lineTo(-100, 90); g.moveTo(100, -90); g.lineTo(100, 90); g.stroke();
        g.beginPath(); g.ellipse(0, 90, 100, 26, 0, 0, 7); g.stroke();
        for (let i = 0; i < 10; i++) {
          const a = i * Math.PI / 5 + t * 2.4;
          const cz = Math.cos(a); if (cz < 0) continue;
          g.globalAlpha = S.part.b * S.spin.o * cz * .6;
          g.beginPath(); g.moveTo(Math.sin(a) * 100, -90); g.lineTo(Math.sin(a) * 100, 90); g.stroke();
        }
        g.globalAlpha = S.part.b * S.spin.o;
        setFont(g, F.d, 44, 700, 1.8); g.fillStyle = C.cream; g.textAlign = 'center';
        g.fillText('ROTATION', 0, 200);
        setFont(g, F.b, 21, 400, .2); g.fillStyle = C.cream3;
        g.fillText('tout le corps tourne, comme une toupie', 0, 236);
        g.restore();
      }
      // triaxiale
      if (S.tri.o > 0) {
        const x = 1360, y = 540;
        g.save(); g.globalAlpha = S.part.b * S.tri.o;
        satellite(g, x, y, 3.4, 1, C.cream, 2.4);
        g.strokeStyle = C.amberL; g.lineWidth = 1.6; g.setLineDash([3, 6]);
        const sun = Math.sin(t * .9) * 10;
        g.beginPath(); g.moveTo(x - 150, y - 60 + sun); g.lineTo(x + 150, y - 60 - sun); g.stroke();
        g.setLineDash([]);
        setFont(g, F.d, 44, 700, 1.8); g.fillStyle = C.cream; g.textAlign = 'center';
        g.fillText('TRIAXIALE', x, y + 200);
        setFont(g, F.b, 21, 400, .2); g.fillStyle = C.cream3;
        g.fillText('le corps est fixe, les panneaux suivent le Soleil', x, y + 236);
        g.restore();
      }
      g.restore();
    }
    /* ---- C : les régions ---- */
    if (S.part.c > .01) {
      g.save(); g.globalAlpha = S.part.c;
      const regions = [['AOR', 'ATLANTIQUE', -0.55], ['IOR', 'INDIEN', 0.5], ['POR', 'PACIFIQUE', 1.9]];
      const CX = 860, CY = 560, R = 250;
      if (S.reg.o > 0) {
        g.save(); g.globalAlpha = S.part.c * S.reg.o;
        globe(g, CX, CY, R, 0.4);
        regions.forEach(([ab, nm, a], i) => {
          const x = CX + Math.cos(a) * R * 1.75, y = CY + Math.sin(a) * R * 1.0;
          g.save(); g.globalAlpha = S.part.c * S.reg.o;
          g.strokeStyle = C.cream2; g.lineWidth = 1; g.globalAlpha *= .5;
          g.beginPath(); g.moveTo(CX + Math.cos(a) * R, CY + Math.sin(a) * R * .6); g.lineTo(x, y); g.stroke();
          g.globalAlpha /= .5;
          satellite(g, CX + Math.cos(a) * R * 1.35, CY + Math.sin(a) * R * .8, .85, 1, C.cream, 2);
          setFont(g, F.d, 34, 700, 2); g.fillStyle = C.cream; g.textAlign = 'center';
          g.fillText(ab, x, y);
          setFont(g, F.m, 14, 500, 2); g.fillStyle = C.cream3;
          g.fillText(nm, x, y + 24);
          g.restore();
        });
        g.restore();
      }
      if (S.apr.o > 0) {
        g.save(); g.globalAlpha = S.part.c * S.apr.o;
        const x = CX + Math.cos(1.15) * R * 1.75, y = CY + Math.sin(1.15) * R * 1.0;
        g.translate(x, y); g.scale(S.apr.sc, S.apr.sc);
        setFont(g, F.d, 34, 700, 2); g.fillStyle = C.amberL; g.textAlign = 'center';
        g.fillText('APR', 0, 0);
        setFont(g, F.m, 14, 500, 2);
        g.fillText('ASIE-PACIFIQUE', 0, 24);
        setFont(g, F.b, 18, 400, .2); g.fillStyle = C.cream3;
        g.fillText('ajoutée : le trafic débordait', 0, 52);
        g.restore();
      }
      g.restore();
    }
    header(g, '06', 'INTELSAT, I À IX', S.hdr);
    paper(g, .045); grain(g, _frameIdx, .9); vignette(g, .5);
    fadeOut(g, S);
  },
};

/* ══════════════ 07 · LA VSAT — 31.788 s ══════════════ */
const CH7 = {
  dur: 31.788,
  setup(tl, S) {
    S.big = o(); S.small = o(); S.star = o(); S.mesh = o();
    S.av = o(); S.apps = [o(), o(), o(), o()]; S.gt = o({ sc: 1.25 });
    addHeader(tl, S, this.dur);
    tl.to(S.big, { o: 1, duration: .7, ease: EB }, 1.6)
      .to(S.small, { o: 1, duration: .7, ease: EB }, 3.6)
      .to(S.star, { o: 1, p: 1, duration: 1.4, ease: EO }, 8.4)
      .to(S.mesh, { o: 1, p: 1, duration: 1.4, ease: EO }, 12.6)
      .to(S.av, { o: 1, duration: .7, ease: EB }, 16.4)
      .to(S.apps, { o: 1, duration: .5, stagger: .45, ease: EO }, 19.6)
      .to(S.gt, { o: 1, sc: 1, duration: .8, ease: EB }, 26.0)
      .to([S.big, S.small, S.star, S.mesh, S.av, ...S.apps, S.gt], { o: 0, duration: .5 }, 31.3);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    bgNight(g); grid(g, .03, 90);
    const GY = 560;
    if (S.big.o > 0) {
      g.save(); g.globalAlpha = S.big.o;
      groundStation(g, 330, GY, 4.6, 0.25, 1, C.cream2, 0);
      setFont(g, F.d, 34, 700, 1.6); g.fillStyle = C.cream2; g.textAlign = 'center';
      g.fillText('STATION TERRIENNE', 330, GY + 70);
      setFont(g, F.b, 19, 400, .2); g.fillStyle = C.cream3;
      g.fillText('grande, fixe', 330, GY + 100);
      g.restore();
    }
    if (S.small.o > 0) {
      g.save(); g.globalAlpha = S.small.o;
      groundStation(g, 700, GY, 1.5, 0.25, 1, C.amberL, 0);
      setFont(g, F.d, 34, 700, 1.6); g.fillStyle = C.amberL; g.textAlign = 'center';
      g.fillText('VSAT', 700, GY + 70);
      setFont(g, F.b, 19, 400, .2); g.fillStyle = C.cream3;
      g.fillText('< 4 m, souvent < 2 m', 700, GY + 100);
      g.restore();
    }
    const topo = (cx, cy, s, kind, lab) => {
      if (s.o <= 0) return;
      const R = 110, N = 6;
      const pts = Array.from({ length: N }, (_, i) => {
        const a = -Math.PI / 2 + i * 2 * Math.PI / N;
        return [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
      });
      g.save(); g.globalAlpha = s.o;
      g.strokeStyle = kind === 'star' ? C.amberL : C.tealL; g.lineWidth = 1.4;
      let k = 0;
      if (kind === 'star') {
        pts.forEach(([x, y]) => { if (clamp(s.p * N - k++) > .2) {
          g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); } });
        g.fillStyle = C.amberL; g.beginPath(); g.arc(cx, cy, 9, 0, 7); g.fill();
      } else {
        const pairs = [];
        for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) pairs.push([i, j]);
        pairs.forEach(([i, j]) => { if (clamp(s.p * pairs.length - k++) > .2) {
          g.globalAlpha = s.o * .55;
          g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[j][0], pts[j][1]); g.stroke(); } });
        g.globalAlpha = s.o;
      }
      pts.forEach(([x, y]) => { g.fillStyle = C.cream; g.beginPath(); g.arc(x, y, 5.5, 0, 7); g.fill(); });
      setFont(g, F.d, 32, 700, 1.8); g.fillStyle = C.cream; g.textAlign = 'center';
      g.fillText(lab, cx, cy + R + 56);
      g.restore();
    };
    topo(1180, 450, S.star, 'star', 'EN ÉTOILE');
    topo(1600, 450, S.mesh, 'mesh', 'EN MAILLAGE');
    if (S.av.o > 0) {
      g.save(); g.globalAlpha = S.av.o;
      setFont(g, F.d, 78, 700, 1); g.fillStyle = C.green; g.textAlign = 'left';
      g.fillText('99,99 %', 250, 830);
      setFont(g, F.b, 22, 400, .2); g.fillStyle = C.cream3;
      g.fillText('de disponibilité', 250, 866);
      g.restore();
    }
    ['VISIOCONFÉRENCE', 'TÉLÉMÉDECINE', 'TRANSFERT DE FICHIERS', 'TÉLÉDÉTECTION']
      .forEach((a, i) => {
        const s = S.apps[i]; if (s.o <= 0) return;
        g.save(); g.globalAlpha = s.o;
        setFont(g, F.m, 19, 500, 2.4); g.fillStyle = C.cream2; g.textAlign = 'left';
        g.fillStyle = C.amberL; g.fillText('·', 700, 790 + i * 42);
        g.fillStyle = C.cream2; g.fillText(a, 724, 790 + i * 42);
        g.restore();
      });
    if (S.gt.o > 0) {
      g.save(); g.globalAlpha = S.gt.o;
      g.translate(1500, 830); g.scale(S.gt.sc, S.gt.sc);
      setFont(g, F.d, 52, 700, 2); g.fillStyle = C.amberL; g.textAlign = 'center';
      g.fillText('FACTEUR DE MÉRITE', 0, 0);
      setFont(g, F.b, 21, 400, .2); g.fillStyle = C.cream3;
      g.fillText('ce qui mesure sa qualité d\'écoute', 0, 36);
      g.restore();
    }
    header(g, '07', 'LA VSAT', S.hdr);
    paper(g, .045); grain(g, _frameIdx, .9); vignette(g, .5);
    fadeOut(g, S);
  },
};

/* ══════════════ 08 · LES DEUX CHIFFRES — 37.761 s ══════════════ */
const CH8 = {
  dur: 37.761,
  setup(tl, S) {
    S.f1 = o(); S.d1 = o(); S.n1 = o({ sc: 1.25 });
    S.f2 = o(); S.d2 = o(); S.n2 = o({ sc: 1.25 });
    addHeader(tl, S, this.dur);
    tl.to(S.f1, { o: 1, p: 1, duration: 1.6, ease: 'none' }, 4.2)
      .to(S.d1, { o: 1, dx: 0, duration: .7, ease: EO }, 8.6)
      .fromTo(S.d1, { dx: -26 }, { dx: 0, duration: .7, ease: EO }, 8.6)
      .to(S.n1, { o: 1, sc: 1, duration: .7, ease: EB }, 13.6)
      .to([S.f1, S.d1, S.n1], { o: 0, duration: .7 }, 18.4)
      .to(S.f2, { o: 1, p: 1, duration: 1.6, ease: 'none' }, 20.4)
      .to(S.d2, { o: 1, dx: 0, duration: .7, ease: EO }, 25.0)
      .fromTo(S.d2, { dx: -26 }, { dx: 0, duration: .7, ease: EO }, 25.0)
      .to(S.n2, { o: 1, sc: 1, duration: .7, ease: EB }, 29.8)
      .to([S.f2, S.d2, S.n2], { o: 0, duration: .5 }, 37.2);
    addOutro(tl, S, this.dur);
  },
  draw(g, S, t) {
    bgNight(g); grid(g, .028, 96);
    const card = (s, d, n, num, formula, plain, big, unit, tag) => {
      if (s.o <= 0) return;
      g.save(); g.globalAlpha = s.o;
      setFont(g, F.m, 17, 500, 4); g.fillStyle = C.amberL; g.textAlign = 'center';
      g.fillText(num, 960, 326);
      setFont(g, F.d, 108, 700, 4); g.fillStyle = C.cream;
      typeOn(g, formula, 960, 470, s.p, 'center');
      g.restore();
      if (d.o > 0) {
        g.save(); g.globalAlpha = d.o;
        setFont(g, F.b, 30, 400, .3); g.fillStyle = C.cream2; g.textAlign = 'center';
        g.fillText(plain, 960 + d.dx, 580);
        g.restore();
      }
      if (n.o > 0) {
        g.save(); g.globalAlpha = n.o;
        g.translate(960, 760); g.scale(n.sc, n.sc);
        setFont(g, F.d, 108, 700, 1); g.fillStyle = C.amberL; g.textAlign = 'center';
        const w = g.measureText(big).width;
        g.fillText(big, -40, 0);
        setFont(g, F.d, 38, 500, 2); g.fillStyle = C.cream2;
        g.fillText(unit, -40 + w / 2 + 50, 0);
        setFont(g, F.m, 18, 400, 2.4); g.fillStyle = C.cream3;
        g.fillText(tag, 0, 52);
        g.restore();
      }
    };
    card(S.f1, S.d1, S.n1, 'AFFAIBLISSEMENT EN ESPACE LIBRE',
      'A = 22 + 20 log (D / λ)',
      'plus c\'est loin, plus c\'est haut en fréquence — plus ça s\'affaiblit',
      '≈ 200', 'dB', 'SUR 36 000 km');
    card(S.f2, S.d2, S.n2, 'FACTEUR DE MÉRITE',
      'G/T = G − 10 log T',
      'un bon gain, un récepteur froid : on entend le presque inaudible',
      '≈ 40', 'dB/K', 'UNE BONNE VSAT');
    header(g, '08', 'LES DEUX CHIFFRES', S.hdr);
    paper(g, .045); grain(g, _frameIdx, .9); vignette(g, .5);
    fadeOut(g, S);
  },
};

/* ══════════════ 09 · LA FICHE — 35.453 s ══════════════ */
const CH9 = {
  dur: 35.453,
  setup(tl, S) {
    S.card = o({ dy: 60 });
    S.row = [o({ dx: -24 }), o({ dx: -24 }), o({ dx: -24 }), o({ dx: -24 }), o({ dx: -24 })];
    S.pause = o(); S.end = o(); S.sub = o(); S.rule = o();
    tl.to(S.card, { o: 1, dy: 0, duration: .9, ease: EO }, .9)
      .to(S.row[0], { o: 1, dx: 0, duration: .5, ease: EO }, 3.0)
      .to(S.row[1], { o: 1, dx: 0, duration: .5, ease: EO }, 9.6)
      .to(S.row[2], { o: 1, dx: 0, duration: .5, ease: EO }, 13.0)
      .to(S.row[3], { o: 1, dx: 0, duration: .5, ease: EO }, 16.4)
      .to(S.row[4], { o: 1, dx: 0, duration: .5, ease: EO }, 19.6)
      .to(S.pause, { o: 1, duration: .5, ease: EB }, 22.6)
      .to([S.card, ...S.row, S.pause], { o: 0, duration: .9, ease: 'power2.in' }, 26.2)
      .to(S.rule, { p: 1, duration: .5, ease: EX }, 28.0)
      .to(S.end, { o: 1, p: 1, duration: 1.5, ease: 'none' }, 28.1)
      .to(S.sub, { o: 1, duration: .7, ease: EO }, 29.9)
      .to([S.end, S.sub, S.rule], { o: 0, duration: .9 }, 34.2);
  },
  draw(g, S, t) {
    bgNight(g); grid(g, .03, 90);
    if (S.card.o > 0) {
      const CW = 1420, CH_ = 760, CXx = (W - CW) / 2, CYy = 150;
      card(g, CXx, CYy, CW, CH_, S.card, (gg, w) => {
        setFont(gg, F.m, 16, 500, 4.4); gg.fillStyle = '#6B6054'; gg.textAlign = 'left';
        gg.fillText('FICHE DE RÉVISION  ·  ÉPISODE 2', 56, 62);
        setFont(gg, F.d, 56, 700, 1.6); gg.fillStyle = C.night;
        gg.fillText('CE QU\'IL FAUT RETENIR', 56, 126);
        gg.strokeStyle = 'rgba(19,36,60,.18)'; gg.lineWidth = 1;
        gg.beginPath(); gg.moveTo(56, 152); gg.lineTo(w - 56, 152); gg.stroke();
      });
      const rows = [
        ['LE RÉPÉTEUR', 'reçoit · amplifie · décale de − 2225 MHz · renvoie'],
        ['LE PIÈGE', 'la fin de bande montante descend de − 3025 et file tout en bas'],
        ['LA POLARISATION', 'RHCP et LHCP s\'ignorent : deux canaux sur une fréquence, × 2'],
        ['6 ET 4 GHz', 'la fenêtre où le ciel est le plus silencieux'],
        ['LA VSAT', '< 4 m, étoile ou maillage, 99,99 % — jugée au facteur de mérite'],
      ];
      rows.forEach((r, i) => {
        const s = S.row[i]; if (s.o <= 0) return;
        const y = 150 + 230 + i * 108 + S.card.dy;
        g.save(); g.globalAlpha = S.card.o * s.o; g.translate(s.dx, 0);
        g.fillStyle = C.amber; g.beginPath(); g.arc(CXx + 72, y - 14, 5, 0, 7); g.fill();
        setFont(g, F.d, 34, 700, 1.6); g.fillStyle = C.night; g.textAlign = 'left';
        g.fillText(r[0], CXx + 98, y - 4);
        setFont(g, F.b, 22, 400, .2); g.fillStyle = '#5B5245';
        g.fillText(r[1], CXx + 98, y + 32);
        g.restore();
      });
      if (S.pause.o > 0) {
        g.save(); g.globalAlpha = S.card.o * S.pause.o;
        setFont(g, F.m, 17, 500, 3.4); g.fillStyle = '#8A7F70'; g.textAlign = 'right';
        g.fillText('METS EN PAUSE  ·  TOUT EST LÀ', (W + 1420) / 2 - 56, 150 + 760 - 44 + S.card.dy);
        g.restore();
      }
    }
    if (S.end.o > 0 || S.rule.p > 0) {
      g.save();
      g.globalAlpha = Math.max(S.end.o, S.rule.p) * .8;
      g.fillStyle = 'rgba(9,16,29,.86)'; g.fillRect(0, 0, W, H);
      g.globalAlpha = 1;
      rule(g, 960 - 60, 452, 120, S.rule.p, C.amber, 3);
      g.globalAlpha = S.end.o;
      setFont(g, F.d, 76, 700, 2.4); g.fillStyle = C.cream; g.textAlign = 'center';
      typeOn(g, 'UNE CONVERSATION DANS UN CREUX DE BRUIT', 960, 560, S.end.p, 'center');
      g.globalAlpha = S.sub.o;
      setFont(g, F.d, 48, 500, 2); g.fillStyle = C.amberL;
      g.fillText('à 36 000 kilomètres', 960, 636);
      setFont(g, F.m, 19, 400, 6); g.fillStyle = C.cream3;
      g.fillText('TÉLÉCOMS PAR SATELLITE  ·  ÉPISODE 2  ·  LE SIGNAL', 960, 716);
      g.restore();
    }
    paper(g, .04); grain(g, _frameIdx, .85); vignette(g, .5);
    const fo = clamp((t - 34.5) / .9);
    if (fo > 0) { g.save(); g.globalAlpha = fo; g.fillStyle = '#05080E'; g.fillRect(0, 0, W, H); g.restore(); }
  },
};

const CHAPTERS = [CH0, CH1, CH2, CH3, CH4, CH5, CH6, CH7, CH8, CH9];
