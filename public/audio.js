/* XYPHUZ — Showreel score.
 * A 30-second track synthesised live with WebAudio at 120 BPM, locked to the
 * reel's cuts. Events are scheduled a little ahead of the playhead, so the
 * music follows play / pause / seek / loop exactly like the picture does.
 */
(function () {
  'use strict';

  const DUR = 30;
  let ac = null, comp, master, verb, noise, bus = null, cursor = 0, muted = false;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.2;
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.85;
    comp.connect(master); master.connect(ac.destination);

    const len = ac.sampleRate * 2;
    noise = ac.createBuffer(1, len, ac.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    verb = ac.createConvolver();
    const il = Math.floor(ac.sampleRate * 2.6), ir = ac.createBuffer(2, il, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = ir.getChannelData(c);
      for (let i = 0; i < il; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / il, 2.8);
    }
    verb.buffer = ir;
    const vg = ac.createGain(); vg.gain.value = 0.5;
    verb.connect(vg); vg.connect(comp);
    return true;
  }

  // Each play/seek gets a fresh bus; killing the old one silences every voice
  // that was already scheduled on it.
  function newBus() {
    if (!ac) return;
    if (bus) {
      const old = bus;
      old.gain.setTargetAtTime(0, ac.currentTime, 0.015);
      setTimeout(() => { try { old.disconnect(); } catch (e) { /* already gone */ } }, 400);
    }
    bus = ac.createGain();
    bus.connect(comp);
    const send = ac.createGain(); send.gain.value = 0.28;
    bus.connect(send); send.connect(verb);
  }

  /* ---------- voices ---------- */
  function env(g, w, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, w);
    g.gain.exponentialRampToValueAtTime(peak, w + a);
    g.gain.exponentialRampToValueAtTime(0.0001, w + a + dec);
  }
  function osc(type, f, w, end) { const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, w); o.start(w); o.stop(end); return o; }
  function nz(w, end) { const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; s.start(w, Math.random() * 1.5); s.stop(end); return s; }
  function gain() { const g = ac.createGain(); g.gain.value = 0; return g; }
  function filt(type, f, q = 1) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }

  const I = {
    kick(w, a = 1) {
      const o = osc('sine', 160, w, w + 0.5); o.frequency.exponentialRampToValueAtTime(42, w + 0.11);
      const g = gain(); env(g, w, 0.002, a, 0.42); o.connect(g).connect(bus);
      const c = nz(w, w + 0.03), cg = gain(); env(cg, w, 0.001, a * 0.25, 0.015);
      c.connect(filt('highpass', 2000)).connect(cg).connect(bus);
    },
    snare(w, a = 0.4) {
      const n = nz(w, w + 0.3), g = gain(); env(g, w, 0.002, a, 0.2);
      n.connect(filt('bandpass', 1800, 0.8)).connect(g).connect(bus);
      const o = osc('triangle', 220, w, w + 0.15); o.frequency.exponentialRampToValueAtTime(140, w + 0.1);
      const g2 = gain(); env(g2, w, 0.002, a * 0.6, 0.1); o.connect(g2).connect(bus);
    },
    hat(w, a = 0.12, d = 0.04) {
      const n = nz(w, w + d + 0.05), g = gain(); env(g, w, 0.001, a, d);
      n.connect(filt('highpass', 7500)).connect(g).connect(bus);
    },
    bass(w, m, d = 0.2, a = 0.3) {
      const f = mtof(m);
      const o = osc('sawtooth', f, w, w + d + 0.1), sub = osc('sine', f / 2, w, w + d + 0.1);
      const lp = filt('lowpass', 1400, 4);
      lp.frequency.setValueAtTime(1400, w); lp.frequency.exponentialRampToValueAtTime(220, w + d);
      const g = gain(); env(g, w, 0.004, a, d);
      o.connect(lp).connect(g).connect(bus); sub.connect(g);
    },
    pad(w, ms, d, a = 0.04) {
      ms.forEach((m) => [-8, 8].forEach((dt) => {
        const o = osc('sawtooth', mtof(m), w, w + d + 1); o.detune.value = dt;
        const lp = filt('lowpass', 900, 0.5), g = gain();
        g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(a, w + Math.min(0.4, d * 0.3));
        g.gain.setValueAtTime(a, w + d); g.gain.linearRampToValueAtTime(0.0001, w + d + 0.9);
        o.connect(lp).connect(g).connect(bus);
      }));
    },
    pluck(w, m, a = 0.06) {
      const o = osc('square', mtof(m), w, w + 0.3), lp = filt('lowpass', 4000, 2);
      lp.frequency.setValueAtTime(4000, w); lp.frequency.exponentialRampToValueAtTime(300, w + 0.18);
      const g = gain(); env(g, w, 0.002, a, 0.22); o.connect(lp).connect(g).connect(bus);
    },
    blip(w, f, a = 0.05, d = 0.05) {
      const o = osc('sine', f, w, w + d + 0.05), g = gain(); env(g, w, 0.002, a, d); o.connect(g).connect(bus);
    },
    stab(w, ms, a = 0.06) {
      ms.forEach((m) => {
        const o = osc('sawtooth', mtof(m + 12), w, w + 0.4), lp = filt('lowpass', 3500, 1);
        lp.frequency.setValueAtTime(3500, w); lp.frequency.exponentialRampToValueAtTime(600, w + 0.25);
        const g = gain(); env(g, w, 0.003, a, 0.28); o.connect(lp).connect(g).connect(bus);
      });
    },
    riser(w, d, a = 0.2) {
      const n = nz(w, w + d), bp = filt('bandpass', 300, 4);
      bp.frequency.setValueAtTime(300, w); bp.frequency.exponentialRampToValueAtTime(7000, w + d);
      const g = gain();
      g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(a, w + d * 0.95); g.gain.linearRampToValueAtTime(0.0001, w + d);
      n.connect(bp).connect(g).connect(bus);
    },
    whoosh(w, d = 0.45, a = 0.16) {
      const n = nz(w, w + d), bp = filt('bandpass', 5000, 1.5);
      bp.frequency.setValueAtTime(500, w); bp.frequency.exponentialRampToValueAtTime(6000, w + d);
      const g = gain();
      g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(a, w + d * 0.9); g.gain.linearRampToValueAtTime(0.0001, w + d);
      n.connect(bp).connect(g).connect(bus);
    },
    impact(w, a = 1) {
      const o = osc('sine', 110, w, w + 2); o.frequency.exponentialRampToValueAtTime(30, w + 0.8);
      const g = gain(); env(g, w, 0.003, a, 1.8); o.connect(g).connect(bus);
      const n = nz(w, w + 1.3), lp = filt('lowpass', 3000, 0.7);
      lp.frequency.setValueAtTime(3000, w); lp.frequency.exponentialRampToValueAtTime(150, w + 1.2);
      const g2 = gain(); env(g2, w, 0.002, a * 0.5, 1.2); n.connect(lp).connect(g2).connect(bus);
    },
  };

  /* ---------- the score ---------- */
  const S = [];
  const at = (t, f) => S.push([t, f]);

  // 0–3  boot: drone, clock ticks, typing, riser into the drop
  at(0, (w) => I.pad(w, [45, 52, 57], 2.8, 0.035));
  for (let b = 0; b < 6; b++) at(b * 0.5, (w) => I.blip(w, b % 2 ? 1320 : 1760, 0.05, 0.04));
  for (let k = 0; k < 14; k++) at(0.5 + k * 0.075, (w) => I.hat(w, 0.05, 0.015));
  [880, 1108, 1318, 1760].forEach((f, i) => at(1.45 + i * 0.2, (w) => I.blip(w, f, 0.06, 0.08)));
  at(1.0, (w) => I.riser(w, 2.0, 0.2));
  at(3, (w) => I.impact(w, 1));

  // 3–23  groove: Am – F – C – G
  const CH = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]];
  const RT = [45, 41, 48, 43];
  for (let b = 0; b < 10; b++) {
    const t0 = 3 + b * 2, ci = b % 4;
    at(t0, (w) => I.pad(w, CH[ci], 2, 0.03));
    for (let q = 0; q < 4; q++) {
      const tb = t0 + q * 0.5;
      at(tb, (w) => I.kick(w, 1));
      at(tb + 0.25, (w) => I.hat(w, 0.13, 0.05));
      if (q % 2) at(tb, (w) => I.snare(w, 0.36));
    }
    for (let k = 1; k < 8; k += 2) at(t0 + k * 0.25, (w) => I.bass(w, RT[ci] + (k === 7 ? 12 : 0), 0.2, 0.3));
    if (b >= 2) {
      for (let k = 0; k < 16; k++) {
        const n = CH[ci][[0, 1, 2, 1][k % 4]] + 12 + (k >= 8 && b % 2 ? 12 : 0);
        at(t0 + k * 0.125, (w) => I.pluck(w, n, 0.04));
        at(t0 + k * 0.125, (w) => I.hat(w, 0.035, 0.02));
      }
    }
  }
  [7, 11, 15, 19].forEach((t) => { at(t - 0.45, (w) => I.whoosh(w, 0.45, 0.16)); at(t, (w) => I.hat(w, 0.16, 0.6)); });
  at(22.55, (w) => I.whoosh(w, 0.45, 0.2));

  // 23–27  manifesto: a hit on every word, snare roll, riser
  const WT = [23, 23.5, 24, 24.5, 25, 25.25, 25.5, 25.75, 26, 26.25, 26.5, 26.75];
  WT.forEach((t, i) => {
    const ci = i % 4;
    at(t, (w) => I.kick(w, 1));
    at(t, (w) => I.stab(w, CH[ci], 0.055));
    at(t, (w) => I.bass(w, RT[ci], 0.18, 0.3));
  });
  for (let k = 0; k < 16; k++) at(25 + k * 0.125, (w) => I.snare(w, 0.05 + k * 0.018));
  at(25, (w) => I.riser(w, 2, 0.22));

  // 27–30  outro: impact, open chord, falling bell line
  at(27, (w) => I.impact(w, 1));
  at(27, (w) => I.pad(w, [45, 52, 57, 60, 64], 2.0, 0.04));
  [81, 76, 72, 69, 64].forEach((m, i) => at(27.25 + i * 0.25, (w) => I.pluck(w, m, 0.05)));

  /* ---------- transport ---------- */
  window.ReelAudio = {
    get enabled() { return !!ac; },
    get muted() { return muted; },
    async enable() {
      if (!ac && !init()) return false;
      if (ac.state === 'suspended') await ac.resume();
      return true;
    },
    start(abs) {
      if (!ac) return;
      if (ac.state === 'suspended') ac.resume();
      newBus(); cursor = abs;
    },
    stop() { if (ac) newBus(); },
    setMuted(m) {
      muted = m;
      if (master) master.gain.setTargetAtTime(m ? 0 : 0.85, ac.currentTime, 0.03);
    },
    // Schedule everything between the last cursor and a short look-ahead.
    tick(now) {
      if (!ac || !bus) return;
      const ahead = now + 0.12;
      if (cursor < now - 0.25 || cursor > ahead) cursor = now;
      for (let k = Math.floor(cursor / DUR); k <= Math.floor(ahead / DUR); k++) {
        for (const [t, fn] of S) {
          const ta = t + k * DUR;
          if (ta >= cursor && ta < ahead) fn(ac.currentTime + Math.max(0, ta - now) + 0.01);
        }
      }
      cursor = ahead;
    },
  };
})();
