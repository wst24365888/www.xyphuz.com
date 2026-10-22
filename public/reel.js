/* XYPHUZ — Showreel 2026
 * Timeline + direction for the GPU engine, and a crisp 2D overlay for type.
 * Every frame is a pure function of time t ∈ [0, 30): camera, particle
 * formation morphs, the raymarched mark, post-processing and typography are
 * all derived from t, so the reel scrubs, pauses and loops with no state.
 *
 * One continuous shot: ~130k particles write the signature in its real stroke
 * order → it solidifies into a raymarched 3D mark inside an accretion halo →
 * the halo collapses and detonates into volumetric type → a live system
 * architecture → a dive into one packet that lands as a die on a wafer → the
 * fab floor → event streams rise into a planet-scale cloud that fails over and
 * heals → warp → the signature again.
 */
(function () {
  'use strict';

  const W = 1920, H = 1080, DUR = 30, TAU = Math.PI * 2;
  const MK = window.Mark3D, SH = window.Shapes, EN = window.Engine, I = SH.IDX;

  const C = { ink: '#f3f0e8', dim: '#8a8896', line: '#26262f', lime: '#d4ff3a', coral: '#ff4d2e', blue: '#6f8cff' };
  const LIME = [0.83, 1, 0.23];
  const FD = '"Space Grotesk", "Helvetica Neue", Arial, sans-serif';
  const FM = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
  const FS = '"Instrument Serif", Georgia, serif';

  /* ---------- math ---------- */
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const P = (t, a, b) => clamp((t - a) / (b - a));
  const fract = (x) => x - Math.floor(x);
  const smooth = (x) => x * x * (3 - 2 * x);
  const E = {
    outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    inExpo: (x) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
    inCubic: (x) => x * x * x,
    outCubic: (x) => 1 - Math.pow(1 - x, 3),
    inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    outBack: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  function hash(a, b = 0) {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const L3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  /* ---------- mat4 (column-major) ---------- */
  const M4 = {
    id: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    mul(a, b) {
      const o = new Float32Array(16);
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
        let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s;
      }
      return o;
    },
    persp(fy, asp, n, f) { const t = 1 / Math.tan(fy / 2), nf = 1 / (n - f); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]); },
    look(e, c, up) {
      const z = norm(sub(e, c)), x = norm(cross(up, z)), y = cross(z, x);
      return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot3(x, e), -dot3(y, e), -dot3(z, e), 1]);
    },
    rx(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); },
    ry(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); },
    rz(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); },
    t(x, y, z) { const m = M4.id(); m[12] = x; m[13] = y; m[14] = z; return m; },
    s(k) { const m = M4.id(); m[0] = m[5] = m[10] = k; return m; },
    m3: (m) => new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]),
    apply: (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]],
    inv(m) {
      const o = new Float32Array(16);
      const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = m;
      const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11;
      const b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30;
      const b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      const d = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
      o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * d; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * d;
      o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * d; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * d;
      o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * d; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * d;
      o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * d; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * d;
      o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * d; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * d;
      o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * d; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * d;
      o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * d; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * d;
      o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * d; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * d;
      return o;
    },
  };
  const orbit = (yaw, pitch, d, c = [0, 0, 0]) => [c[0] + Math.sin(yaw) * Math.cos(pitch) * d, c[1] + Math.sin(pitch) * d, c[2] + Math.cos(yaw) * Math.cos(pitch) * d];

  /* ---------- overlay helpers ---------- */
  let ctx, ov, glc, glOK = false, VP = null;
  const font = (px, w = 700) => (ctx.font = `${w} ${px}px ${FD}`);
  const mono = (px, w = 400) => (ctx.font = `${w} ${px}px ${FM}`);
  const serif = (px) => (ctx.font = `italic 400 ${px}px ${FS}`);
  function dot(x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); }
  function reveal(str, x, y, size, p, align = 'left') {
    if (p <= 0) return;
    const w = ctx.measureText(str).width, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 40, y - size, w + 80, size * 1.25); ctx.clip();
    ctx.textAlign = align; ctx.fillText(str, x, y + (1 - p) * size * 1.2); ctx.restore();
  }
  function glyphs(str, track) {
    const g = []; let x = 0;
    for (const ch of str) { const w = ctx.measureText(ch).width; g.push({ ch, x, w }); x += w + track; }
    return { g, w: x - track };
  }
  const GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+/<>=_';
  function decode(str, p, t) {
    const n = str.length, k = p * (n + 8); let o = '';
    for (let i = 0; i < n; i++) {
      const ch = str[i];
      if (ch === ' ' || i < k - 8) o += i < k ? ch : ' ';
      else if (i < k) o += GL[Math.floor(hash(i, Math.floor(t * 30)) * GL.length)];
      else o += ' ';
    }
    return o;
  }
  function label(str, x, y, align = 'left', col = C.lime) { mono(18, 700); ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(str, x, y); }
  function project(p) {
    const v = VP, x = v[0] * p[0] + v[4] * p[1] + v[8] * p[2] + v[12], y = v[1] * p[0] + v[5] * p[1] + v[9] * p[2] + v[13], w = v[3] * p[0] + v[7] * p[1] + v[11] * p[2] + v[15];
    return [(x / w * 0.5 + 0.5) * W, (1 - (y / w * 0.5 + 0.5)) * H, w];
  }
  // A label pinned to a 3D point, with a leader tick.
  function pin(p, text, a, col = C.ink, dx = 14, dy = -14) {
    const [x, y, w] = project(p);
    if (w <= 0 || a <= 0) return;
    ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(243,240,232,.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.lineTo(x + dx + 8, y + dy); ctx.stroke();
    ctx.fillStyle = C.lime; dot(x, y, 2.5); ctx.fill();
    mono(13, 700); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(text, x + dx + 12, y + dy + 4);
    ctx.globalAlpha = 1;
  }

  /* ---------- frame description ---------- */
  function camera(f, eye, target, fov, roll = 0) {
    let up = [0, 1, 0];
    if (roll) {
      const fw = norm(sub(target, eye)), c = Math.cos(roll), s = Math.sin(roll), k = cross(fw, up), d = dot3(fw, up);
      up = [up[0] * c + k[0] * s + fw[0] * d * (1 - c), up[1] * c + k[1] * s + fw[1] * d * (1 - c), up[2] * c + k[2] * s + fw[2] * d * (1 - c)];
    }
    const fy = (fov * Math.PI) / 180;
    f.vp = M4.mul(M4.persp(fy, W / H, 0.05, 300), M4.look(eye, target, up));
    f.invVP = M4.inv(f.vp); f.eye = eye; f.fov = fy;
    f.focus = Math.hypot(...sub(target, eye));
    VP = f.vp;
  }
  function base(t) {
    return {
      time: t, aperture: 0.02, mark: null, sprites: [],
      bg: { top: [0.018, 0.018, 0.026], bot: [0.003, 0.003, 0.006], stars: 0.3, cone: 0, coneCol: [0.85, 1, 0.55] },
      particles: { a: I.DUST, b: I.DUST, mix: 0, spread: 0.6, turb: 0.8, ma: M4.id(), mb: M4.id(), size: 0.016, gain: 1 },
      post: { bloom: 0.9, threshold: 0.55, ca: 1.0, vig: 0.55, grain: 0.055, exposure: 1.15, fade: 0, flash: 0 },
    };
  }

  /* ================================================================
   * 00 — SIGNATURE: particles write the mark, the camera rides the nib
   * ================================================================ */
  function penAt(lt) {
    const S = MK.STROKES, T = MK.STROKE_T;
    for (let i = T.length - 1; i >= 0; i--) {
      const [a, b] = T[i];
      if (lt >= a) return { p: MK.pointAt(S[i], smooth(P(lt, a, b))), down: lt < b, i };
      if (i > 0 && lt >= T[i - 1][1]) {
        const from = S[i - 1].pts[S[i - 1].pts.length - 1], to = S[i].pts[0], u = smooth(P(lt, T[i - 1][1], a));
        return { p: [lerp(from[0], to[0], u), lerp(from[1], to[1], u)], down: false, i };
      }
    }
    return { p: S[0].pts[0], down: false, i: -1 };
  }
  const toWorld = (p) => [((p[0] - MK.CX) / MK.HALF) * SH.SIGN_SCALE, (-(p[1] - MK.CY) / MK.HALF) * SH.SIGN_SCALE, 0];

  function sSign(lt, t, f) {
    let pw = [0, 0, 0];
    for (let k = 0; k < 6; k++) { const q = toWorld(penAt(Math.max(0, lt - k * 0.06)).p); pw = [pw[0] + q[0] / 6, pw[1] + q[1] / 6, 0]; }
    const e = E.inOutCubic(P(lt, 1.6, 3.6));
    const tgt = L3(pw, [0, 0, 0], e), dist = lerp(3.2, 10.5, e), ang = lerp(0.42, 0, e);
    camera(f, [tgt[0] + Math.sin(ang) * dist, tgt[1] + 0.35 * (1 - e), Math.cos(ang) * dist], tgt, 35);
    f.aperture = lerp(0.07, 0.035, e);
    const an = 1 - 0.035 * E.inOutCubic(P(lt, 3.35, 3.95));
    Object.assign(f.particles, { a: I.DUST, b: I.SIGN, signMode: 1, signT: lt, turb: 0.35, ma: M4.ry(lt * 0.05), mb: M4.s(an), gain: lerp(1.0, 0.22, P(lt, 0.3, 3.2)) });
    f.bg.stars = 0.4;
    const tip = penAt(lt), tw = toWorld(tip.p);
    if (tip.down) f.sprites = [[tw[0], tw[1], 0.15, 0.55, LIME[0] * 3, LIME[1] * 3, LIME[2] * 3, 1], [tw[0], tw[1], 0.16, 0.1, 8, 8, 8, 1]];

    // instrumentation riding the nib
    const ia = clamp(3.2 / (dist / 3.2) - 1.1) * P(lt, 0.2, 0.4);
    if (ia > 0 && tip.i >= 0) {
      const [sx, sy] = project(tw);
      ctx.globalAlpha = ia;
      ctx.strokeStyle = 'rgba(243,240,232,.22)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke();
      ctx.strokeStyle = C.lime; ctx.lineWidth = 2; ctx.strokeRect(sx - 18, sy - 18, 36, 36);
      mono(15, 500); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
      ctx.fillText(`x ${tip.p[0].toFixed(1)}   y ${tip.p[1].toFixed(1)}`, sx + 32, sy - 32);
      ctx.fillStyle = C.dim; ctx.fillText(`stroke ${Math.min(2, Math.max(1, tip.i + 1))}/2   particles ${Math.round(SH.N * P(lt, 0.3, 3.15)).toLocaleString('en-US')}`, sx + 32, sy - 8);
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = P(lt, 0.1, 0.5) * (1 - P(lt, 3.4, 3.8)); label('[ 00 ]  SIGNATURE', 960, 150, 'center');
    ctx.globalAlpha = E.outCubic(P(lt, 1.0, 1.6)) * (1 - P(lt, 3.3, 3.7));
    serif(48); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('Every system starts as a sketch.', 960, 975);
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 01 — IDENTITY: the ink solidifies; the rest becomes a halo
   * ================================================================ */
  const HALO_M = M4.mul(M4.rx(1.18), M4.rz(0.25));
  function sIdentity(lt, t, f) {
    const mv = E.inOutCubic(P(lt, 0.3, 1.5)), ex = E.inOutCubic(P(lt, 3.0, 3.8));
    const tgt = [lerp(0, 2.5, mv) * (1 - ex), 0, 0];
    const ang = lerp(0, -0.35, mv) + lt * 0.04, dist = lerp(10.5, 11.5, mv) - 3 * ex;
    camera(f, [tgt[0] + Math.sin(ang) * dist, 0.8, Math.cos(ang) * dist], tgt, 35);
    f.aperture = 0.03;
    const pop = E.outBack(P(lt, 0, 0.55));
    const ry = -0.5 * E.outCubic(P(lt, 0, 1.3)) + 0.85 * E.inOutCubic(P(lt, 1.3, 3.1)) + E.inExpo(P(lt, 3.1, 3.9)) * TAU * 1.5;
    const sc = SH.SIGN_SCALE * (1 - 0.97 * E.inExpo(P(lt, 3.3, 3.95)));
    f.mark = {
      pos: [0, 0, 0], rot: M4.m3(M4.mul(M4.ry(ry), M4.rx(0.12 * Math.sin(lt * 1.3)))), scale: sc,
      thick: 0.13 * pop, emit: 1 - E.outCubic(P(lt, 0.05, 0.6)), sweep: lerp(-1.3, 1.5, P(lt, 0.15, 2.8)), alpha: 1, color: LIME,
    };
    Object.assign(f.particles, { a: I.SIGN, b: I.HALO, mix: E.outCubic(P(lt, 0, 1.5)), spread: 0.5, turb: 1.6, mb: HALO_M, pull: E.inExpo(P(lt, 3.2, 3.95)), gain: lerp(0.22, 0.9, E.outCubic(P(lt, 0, 1.2))) });
    f.bg.cone = 0.9 * (1 - ex); f.bg.coneCol = [0.22, 0.26, 0.14];
    f.post.bloom = 1.0;

    const wa = 1 - P(lt, 2.95, 3.3);
    if (wa <= 0) return;
    const x0 = 930;
    ctx.globalAlpha = P(lt, 1.0, 1.3) * wa; label('[ 01 ]  HSING-HAN WU, A.K.A.', x0, 405); ctx.globalAlpha = 1;
    font(200); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    glyphs('XYPHUZ', 8).g.forEach((c, i) => {
      const s = E.outBack(P(lt, 1.0 + i * 0.06, 1.45 + i * 0.06)) * (1 - E.inCubic(P(lt, 2.9 + i * 0.03, 3.15 + i * 0.03)));
      if (s <= 0.001) return;
      ctx.save(); ctx.translate(x0 + c.x + c.w / 2, 540); ctx.scale(1, s); ctx.fillText(c.ch, -c.w / 2, 70); ctx.restore();
    });
    const words = ['enterprise systems.', 'cloud platforms.', 'fab-scale software.', 'for the long run.'];
    const sw = [1.5, 2.0, 2.5];
    let idx = 0; sw.forEach((s) => { if (lt >= s) idx++; });
    const tr = idx ? E.outExpo(P(lt, sw[idx - 1], sw[idx - 1] + 0.32)) : 1;
    ctx.globalAlpha = E.outCubic(P(lt, 1.3, 1.6)) * wa;
    serif(56); ctx.fillStyle = C.ink; ctx.fillText('builds ', x0, 705);
    const px = x0 + ctx.measureText('builds ').width;
    font(54); ctx.fillStyle = C.lime;
    ctx.save(); ctx.beginPath(); ctx.rect(px - 10, 650, 760, 72); ctx.clip();
    if (idx > 0 && tr < 1) ctx.fillText(words[idx - 1], px, 705 - tr * 72);
    ctx.fillText(words[idx], px, 705 + (1 - tr) * 72);
    ctx.restore();
    ctx.globalAlpha = wa; mono(17, 500); ctx.fillStyle = C.dim;
    ctx.fillText(decode('SOFTWARE ARCHITECT · ENTERPRISE SYSTEMS · CLOUD INFRASTRUCTURE', P(lt, 1.0, 2.0), t), x0, 770);
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 02 — SOFTWARE ENGINEER: singularity → volumetric type in code rain
   * ================================================================ */
  function sEng(lt, t, f) {
    const d = lerp(2.0, 15, E.inOutCubic(P(lt, 0.05, 2.6))) + lt * 0.25;
    const ang = lerp(0.55, -0.15, E.inOutCubic(P(lt, 0, 3.4)));
    camera(f, [Math.sin(ang) * d, lerp(0.4, 1.3, P(lt, 0, 3)), Math.cos(ang) * d], [0, 0.2, 0], 40);
    f.aperture = 0.035;
    Object.assign(f.particles, { a: I.HALO, b: I.TEXT, mix: E.inOutCubic(P(lt, 0.05, 1.4)), spread: 0.7, turb: 1.2, ma: HALO_M, pull: 1 - E.outCubic(P(lt, 0, 0.75)), size: 0.016, gain: 1.5 });
    f.post.flash = 0.5 * Math.pow(1 - P(lt, 0, 0.35), 2);
    const lines = [
      [0.9, '$ go test ./... -race'],
      [1.5, 'ok   dispatch     0.84s   coverage 92.1%'],
      [1.9, 'ok   scheduler    1.12s   coverage 89.4%'],
      [2.3, '$ make release  →  v2.4.0'],
    ];
    ctx.globalAlpha = P(lt, 0.8, 1.1) * (1 - P(lt, 3.4, 3.7));
    label('[ 02 ]  CODE', 84, 150);
    mono(16, 500); ctx.textAlign = 'left';
    lines.forEach(([tt, s], i) => {
      if (lt < tt) return;
      ctx.fillStyle = s[0] === '$' ? C.ink : C.lime;
      ctx.fillText(s.slice(0, Math.ceil(P(lt, tt, tt + 0.3) * s.length)), 84, 860 + i * 28);
    });
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 03 — SOFTWARE ARCHITECT: type reassembles into a live system
   * ================================================================ */
  function sArch(lt, t, f) {
    const yaw = -0.9 + lt * 0.22, pitch = 0.5;
    let eye = orbit(yaw, pitch, 13.5), tgt = [0, -0.3, 0];
    const A = SH.NODES[4].p, B = SH.NODES[10].p, mid = L3(A, B, 0.5);
    const dv = E.inOutCubic(P(lt, 2.8, 3.8)), rush = E.inCubic(P(lt, 3.0, 3.98));
    tgt = L3(tgt, mid, dv);
    const away = norm(sub(eye, mid));
    eye = L3(eye, [mid[0] + away[0] * 0.4, mid[1] + away[1] * 0.4, mid[2] + away[2] * 0.4], rush);
    camera(f, eye, tgt, 38);
    f.aperture = lerp(0.03, 0.09, rush);
    Object.assign(f.particles, { a: I.TEXT, b: I.ARCH, mix: E.inOutCubic(P(lt, 0, 1.5)), spread: 0.9, turb: 0.9, size: 0.015 });
    f.post.ca = 1 + rush * 4;

    const la = P(lt, 1.2, 1.6) * (1 - P(lt, 2.9, 3.2));
    SH.NODES.forEach((n, i) => pin(n.p, n.lab, la * (0.6 + 0.4 * hash(i, 9)), i === 2 ? C.lime : C.ink));
    SH.LAYERS.forEach((l, li) => pin([-4.6, l.y * 2, 3.6], `L${li}  ${l.n}`, la * 0.8, C.blue, -10, 12));
    const ta = P(lt, 0.9, 1.2) * (1 - P(lt, 3.0, 3.3));
    if (ta > 0) {
      ctx.globalAlpha = ta; label('[ 03 ]  SYSTEMS', 84, 150);
      font(110); ctx.fillStyle = C.ink; reveal('SOFTWARE', 84, 880, 110, E.outExpo(P(lt, 0.9, 1.5)));
      ctx.fillStyle = C.blue; reveal('ARCHITECT', 84, 985, 110, E.outExpo(P(lt, 1.0, 1.6)));
      ctx.globalAlpha = 1;
    }
  }

  /* ================================================================
   * 04 — ENTERPRISE SYSTEMS: a die → the wafer → the fab floor
   * ================================================================ */
  const WAFER_TILT = -0.95;
  const fabEye = (lt) => orbit(0.75 + (lt - 2) * 0.12, 0.58, 12, [-1.2, 0.6, 0]);
  function sFab(lt, t, f) {
    if (lt < 2.0) {
      const d = lerp(2.4, 11, E.inOutCubic(P(lt, 0, 1.3)));
      camera(f, [0, lerp(0, 3, E.inOutCubic(P(lt, 1.2, 2.0))), d], [0, 0, 0], 38);
      Object.assign(f.particles, { a: I.ARCH, b: I.WAFER, mix: E.inOutCubic(P(lt, 0, 1.0)), spread: 0.5, turb: 1.0, mb: M4.rx(WAFER_TILT * E.inOutCubic(P(lt, 1.2, 2.0))), scan: lerp(5, -5, P(lt, 0.7, 1.8)) });
    } else {
      const e2 = E.inOutCubic(P(lt, 2.0, 3.0)), rise = E.inOutCubic(P(lt, 3.3, 4.0));
      const eye = L3([0, 3, 11], fabEye(lt), e2);
      eye[1] += rise * 12;
      camera(f, eye, [-1.2 * e2, 0.6 + rise * 11, 0], 40);
      Object.assign(f.particles, { a: I.WAFER, b: I.FAB, ma: M4.rx(WAFER_TILT), mix: e2, spread: 0.8, turb: 1.2, scan: -5, gain: lerp(1, 1.8, e2) });
    }
    f.aperture = 0.03;
    f.post.flash = 0.45 * Math.pow(1 - P(lt, 0, 0.3), 2);

    const wl = P(lt, 0.9, 1.2) * (1 - P(lt, 1.8, 2.0));
    if (wl > 0) {
      ctx.globalAlpha = wl; mono(15, 700); ctx.textAlign = 'center'; ctx.fillStyle = C.dim;
      ctx.fillText(`WAFER 07  ·  300 mm  ·  YIELD MAP  ·  ${Math.round(P(lt, 0.7, 1.8) * 100)}% INSPECTED`, 960, 990);
      ctx.globalAlpha = 1;
    }
    if (lt < 0.8) { ctx.globalAlpha = P(lt, 0.1, 0.3) * (1 - P(lt, 0.6, 0.8)); label('[ 04 ]  ONE DIE', 960, 150, 'center'); ctx.globalAlpha = 1; }
    const ta = P(lt, 2.4, 2.7) * (1 - P(lt, 3.4, 3.7));
    if (ta > 0) {
      ctx.globalAlpha = ta; label('[ 04 ]  GIGA-FAB SCALE', 84, 150);
      font(96); ctx.fillStyle = C.ink; reveal('ENTERPRISE', 84, 250, 96, E.outExpo(P(lt, 2.4, 3.0)));
      ctx.fillStyle = C.lime; reveal('SYSTEMS', 84, 345, 96, E.outExpo(P(lt, 2.5, 3.1)));
      serif(40); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText('for giga-fab semiconductor manufacturing.', 84, 405);
      mono(14, 700); ctx.fillStyle = C.dim; ctx.fillText('MES · DISPATCH · SCHEDULING · SPC · AMHS · 24/7', 84, 445);
      ctx.globalAlpha = 1;
    }
  }

  /* ================================================================
   * 05 — CLOUD INFRASTRUCTURE: the planet, failover, healing
   * ================================================================ */
  const FAIL_ID = 2;
  function sCloud(lt, t, f) {
    const start = fabEye(4); start[1] += 12;
    const a = 0.3 + lt * 0.1, e = E.inOutCubic(P(lt, 0, 1.5));
    const push = E.inExpo(P(lt, 3.4, 4.0));
    const eye = L3(L3(start, orbit(a, 0.18, 19.5, [-3.6, 0, 0]), e), [0, 0, 5], push);
    camera(f, eye, L3([0, 11.6, 0], [-3.6, 0, 0], e), 38);
    f.aperture = 0.01;
    const spin = M4.ry(0.6 + lt * 0.22);
    const fail = P(lt, 2.2, 2.35) * (1 - P(lt, 3.0, 3.4));
    Object.assign(f.particles, { a: I.FAB, b: I.GLOBE, mix: E.inOutCubic(P(lt, 0, 1.4)), spread: 0.9, turb: 1.3, mb: spin, fail, failId: FAIL_ID });
    f.bg.stars = 0.5;

    const ra = P(lt, 1.3, 1.6) * (1 - push);
    SH.REGIONS.forEach((rg, i) => {
      const d = SH.dirOf(...rg), p = M4.apply(spin, [d[0] * SH.GR * 1.04, d[1] * SH.GR * 1.04, d[2] * SH.GR * 1.04]);
      const facing = dot3(norm(p), norm(sub(eye, p)));
      const down = i === FAIL_ID && fail > 0.5;
      pin(p, down ? `region-${i + 1}  ✗ DOWN` : `region-${i + 1}`, ra * clamp(facing * 3), down ? C.coral : C.ink);
    });
    const ta = 1 - push;
    ctx.globalAlpha = P(lt, 0.4, 0.7) * ta; label('[ 05 ]  CLOUD', 84, 150);
    font(96); ctx.fillStyle = C.ink; reveal('CLOUD', 84, 250, 96, E.outExpo(P(lt, 0.4, 1.0)) * ta);
    ctx.fillStyle = C.blue; reveal('INFRASTRUCTURE', 84, 345, 96, E.outExpo(P(lt, 0.5, 1.1)) * ta);
    ctx.globalAlpha = 1;
    const logs = [
      [0.9, '$ terraform apply  ·  6 regions', C.dim], [1.3, '✓ mesh up  ·  12 routes', C.lime], [1.8, 'p99 38 ms  ·  error rate 0.00%', C.ink],
      [2.2, '✗ region-3 unreachable', C.coral], [2.45, '↻ failover → region-2, region-5', C.ink], [3.0, '✓ recovered  ·  zero downtime', C.lime],
    ];
    ctx.globalAlpha = ta; mono(15, 500); ctx.textAlign = 'left';
    logs.forEach(([tt, s, col], i) => {
      if (lt < tt) return;
      ctx.fillStyle = col; ctx.fillText(s.slice(0, Math.ceil(P(lt, tt, tt + 0.25) * s.length)), 84, 800 + i * 30);
    });
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 06 — MANIFESTO: warp, one word per beat
   * ================================================================ */
  const WORDS = ['DESIGN', 'BUILD', 'SCALE', 'AUTOMATE', 'OBSERVE', 'HARDEN', 'SHIP', 'REPEAT'];
  const WT = [0, 0.5, 1.0, 1.5, 2.0, 2.25, 2.5, 2.75];
  function sManifesto(lt, t, f) {
    const roll = lt * 0.35 + Math.sin(lt * 1.3) * 0.15;
    camera(f, [0, 0, 6], [0, 0, -10], lerp(50, 78, E.inCubic(P(lt, 0, 3))), roll);
    f.aperture = 0.004;
    Object.assign(f.particles, { a: I.GLOBE, b: I.TUNNEL, ma: M4.ry(0.6 + 4 * 0.22), mix: E.inOutCubic(P(lt, 0, 0.7)), spread: 0.6, turb: 2.2, size: 0.028, gain: 2.2 });
    f.post.ca = 3.5; f.post.bloom = 1.2;
    f.post.flash = 0.4 * Math.pow(1 - P(lt, 0, 0.3), 2);

    let i = 0; WT.forEach((w, k) => { if (lt >= w) i = k; });
    const wl = lt - WT[i], word = WORDS[i];
    font(400);
    const size = Math.min(330, (400 * 1500) / ctx.measureText(word).width);
    const punch = 1 + 0.18 * (1 - E.outExpo(P(wl, 0, 0.25)));
    const gl = 18 * (1 - E.outExpo(P(wl, 0, 0.2)));
    ctx.save(); ctx.translate(960, 560); ctx.rotate(-roll * 0.25); ctx.scale(punch, punch);
    font(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,40,80,.85)'; ctx.fillText(word, -gl, 0);
    ctx.fillStyle = 'rgba(40,220,255,.85)'; ctx.fillText(word, gl, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = i % 3 === 0 ? C.lime : C.ink; ctx.fillText(word, 0, 0);
    ctx.restore();
    ctx.textBaseline = 'alphabetic';
    label('[ 06 ]  MANIFESTO', 960, 150, 'center');
    mono(18, 700); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(`${pad(i + 1)} / ${WORDS.length}`, 960, 940);
  }

  /* ================================================================
   * 07 — XYPHUZ: the particles come home
   * ================================================================ */
  function sOutro(lt, t, f) {
    camera(f, [Math.sin(lt * 0.15) * 1.2, 0.5, 11.5], [0, 0.5, 0], 35);
    f.aperture = 0.025;
    const sway = 0.45 * Math.sin(lt * 1.1) - 0.3;
    const m = M4.mul(M4.mul(M4.t(0, 1.05, 0), M4.ry(sway)), M4.s(0.8));
    Object.assign(f.particles, { a: I.TUNNEL, b: I.SIGN, mix: E.inOutCubic(P(lt, 0, 1.3)), spread: 0.8, turb: 1.4, mb: M4.mul(m, M4.s(1.04)), gain: lerp(1, 0.16, P(lt, 0.6, 1.6)) });
    f.mark = { pos: [0, 1.05, 0], rot: M4.m3(M4.ry(sway)), scale: SH.SIGN_SCALE * 0.8, thick: 0.13, emit: 0, sweep: lerp(-1.2, 1.4, P(lt, 1.0, 2.8)), alpha: E.outCubic(P(lt, 0.9, 1.6)), color: LIME };
    f.bg.cone = 0.7; f.bg.coneCol = [0.2, 0.24, 0.13];
    f.post.flash = 0.75 * Math.pow(1 - P(lt, 0, 0.35), 2);
    f.post.fade = P(lt, 2.55, 2.95);

    font(110);
    const tr = lerp(80, 24, E.outExpo(P(lt, 0.5, 1.6)));
    const { g, w } = glyphs('XYPHUZ', tr);
    ctx.globalAlpha = E.outCubic(P(lt, 0.5, 0.9)) * (1 - f.post.fade); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    g.forEach((c) => ctx.fillText(c.ch, 960 - w / 2 + c.x, 815));
    ctx.globalAlpha = 1 - f.post.fade;
    mono(19, 500); ctx.fillStyle = C.dim; ctx.textAlign = 'center';
    ctx.fillText(decode('SOFTWARE ARCHITECT  /  ENTERPRISE SYSTEMS  /  CLOUD INFRASTRUCTURE', P(lt, 0.8, 1.6), t), 960, 862);
    const ta = E.outCubic(P(lt, 1.2, 1.7));
    ctx.globalAlpha = ta * (1 - f.post.fade); serif(40); ctx.fillStyle = C.ink;
    ctx.fillText('Started in motion design. Now I build what doesn’t fall over.', 960, 915 + (1 - ta) * 16);
    ctx.globalAlpha = P(lt, 1.5, 2.0) * (1 - f.post.fade); mono(17, 700); ctx.fillStyle = C.lime;
    ctx.fillText('xyphuz.com   ·   github.com/wst24365888', 960, 962);
    ctx.globalAlpha = 1;
  }

  const SCENES = [
    { s: 0, e: 4, id: '00', name: 'SIGNATURE', draw: sSign },
    { s: 4, e: 8, id: '01', name: 'IDENTITY', draw: sIdentity },
    { s: 8, e: 12, id: '02', name: 'SOFTWARE ENGINEER', draw: sEng },
    { s: 12, e: 16, id: '03', name: 'SOFTWARE ARCHITECT', draw: sArch },
    { s: 16, e: 20, id: '04', name: 'ENTERPRISE SYSTEMS', draw: sFab },
    { s: 20, e: 24, id: '05', name: 'CLOUD INFRASTRUCTURE', draw: sCloud },
    { s: 24, e: 27, id: '06', name: 'MANIFESTO', draw: sManifesto },
    { s: 27, e: 30, id: '07', name: 'XYPHUZ', draw: sOutro },
  ];

  function hud(t, sc) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
    const m = 44, L = 26;
    ctx.beginPath();
    ctx.moveTo(m, m + L); ctx.lineTo(m, m); ctx.lineTo(m + L, m);
    ctx.moveTo(W - m - L, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + L);
    ctx.moveTo(m, H - m - L); ctx.lineTo(m, H - m); ctx.lineTo(m + L, H - m);
    ctx.moveTo(W - m - L, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - L);
    ctx.stroke();
    mono(16, 500);
    ctx.textAlign = 'left'; ctx.fillText('XYPHUZ — SHOWREEL 2026', 84, 88);
    ctx.fillText(`${sc.id} / ${sc.name}`, 84, 1030);
    ctx.textAlign = 'right';
    const tc = `00:00:${pad(Math.floor(t))}:${pad(Math.floor(fract(t) * 24))}`;
    ctx.fillText(tc, W - 84, 88);
    ctx.fillText(`${SH.N.toLocaleString('en-US')} PARTICLES · WEBGL2 · 120 BPM`, W - 84, 1030);
    const tw = ctx.measureText(tc).width;
    if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = '#ff2d2d'; dot(W - 84 - tw - 20, 82, 7); ctx.fill(); }
    ctx.restore();
  }

  const FLASHES = [[4, 0.85]];

  function render(t) {
    t = ((t % DUR) + DUR) % DUR;
    const sc = SCENES.find((s) => t >= s.s && t < s.e) || SCENES[SCENES.length - 1];
    const lt = t - sc.s;
    const k = ov.width / W;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.width, ov.height);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

    const f = base(t);
    sc.draw(lt, t, f);
    for (const [ft, a] of FLASHES) if (t >= ft && t < ft + 0.4) f.post.flash = Math.max(f.post.flash, a * Math.pow(1 - P(t, ft, ft + 0.4), 2));
    if (glOK) {
      const q = Math.min(1, 1920 / ov.width);
      f.width = Math.max(2, Math.round(ov.width * q)); f.height = Math.max(2, Math.round(ov.height * q));
      EN.render(f);
    } else {
      mono(20, 500); ctx.fillStyle = C.dim; ctx.textAlign = 'center';
      ctx.fillText('This reel is rendered live on the GPU and needs WebGL2.', 960, 540);
    }
    ctx.globalAlpha = 1;
    hud(t, sc);
  }

  async function ready() {
    const fonts = [`700 100px ${FD}`, `500 20px ${FM}`, `400 20px ${FM}`, `700 20px ${FM}`, `italic 400 40px ${FS}`];
    try { await Promise.race([Promise.all(fonts.map((x) => document.fonts.load(x))), new Promise((r) => setTimeout(r, 3500))]); } catch (e) { /* system fonts */ }
    if (!glOK) return;
    EN.setSDF(MK.buildSDF(512), 512);
    EN.setShapes(SH.build());
  }

  window.Reel = {
    DUR,
    SCENES: SCENES.map(({ s, e, id, name }) => ({ s, e, id, name })),
    create(glCanvas, overlay) {
      glc = glCanvas; ov = overlay; ctx = ov.getContext('2d');
      glOK = EN.init(glc);
      return { render, ready };
    },
  };
})();
