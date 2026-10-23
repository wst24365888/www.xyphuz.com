/* XYPHUZ — Showreel 2026
 * Timeline + direction for the GPU engine, and a crisp 2D overlay for type.
 *
 * render(t): the 30-second reel. Every frame is a pure function of t, so it
 * scrubs, pauses and replays with no state. One continuous shot: particles
 * write the signature in its real stroke order → a 3D mark inside an accretion
 * halo → volumetric type → a live system architecture → a packet that lands as
 * a die on a wafer → the fab floor → a planet-scale cloud that fails over and
 * heals → a manifesto the particles spell word by word → the signature again.
 *
 * renderHome(state): what the reel becomes once it ends — the same world, now
 * interactive: re-form the particles into each role, orbit, push them around.
 *
 * Layout is responsive: the overlay works in a virtual space whose short side
 * is ~1080 units, and the 3D camera pulls back on narrow screens so every
 * subject still fits.
 */
(function () {
  'use strict';

  const DUR = 30, TAU = Math.PI * 2;
  const MK = window.Mark3D, SH = window.Shapes, EN = window.Engine, I = SH.IDX;

  // Virtual overlay space, recomputed every frame from the canvas size.
  let W = 1920, H = 1080, PORT = false, M = 84, TOP = 150, FRAME = 1, SCALE = 1;

  const C = { ink: '#f3f0e8', dim: '#8a8896', line: '#26262f', lime: '#d4ff3a', coral: '#ff4d2e', blue: '#6f8cff', yellow: '#ffd23a' };
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
  };
  const orbit = (yaw, pitch, d, c = [0, 0, 0]) => [c[0] + Math.sin(yaw) * Math.cos(pitch) * d, c[1] + Math.sin(pitch) * d, c[2] + Math.cos(yaw) * Math.cos(pitch) * d];

  /* ---------- overlay helpers ---------- */
  let ctx, ov, glc, glOK = false, VP = null;
  const font = (px, w = 700) => (ctx.font = `${w} ${px}px ${FD}`);
  const mono = (px, w = 400) => (ctx.font = `${w} ${px}px ${FM}`);
  const serif = (px) => (ctx.font = `italic 400 ${px}px ${FS}`);
  // Set a font, shrinking it until `str` fits in maxW.
  function fit(set, px, str, maxW) { set(px); const w = ctx.measureText(str).width; if (w > maxW) set((px * maxW) / w); return w > maxW ? (px * maxW) / w : px; }
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
    if (w <= 0 || a <= 0 || x < -50 || x > W + 50 || y < -50 || y > H + 50) return;
    ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(243,240,232,.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.lineTo(x + dx + 8, y + dy); ctx.stroke();
    ctx.fillStyle = C.lime; dot(x, y, 2.5); ctx.fill();
    mono(PORT ? 20 : 13, 700); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(text, x + dx + 12, y + dy + 4);
    ctx.globalAlpha = 1;
  }

  /* ---------- frame description ---------- */
  // `shift` moves the image in NDC without changing perspective (to make room for UI).
  function camera(f, eye, target, fov, roll = 0, shift = [0, 0]) {
    eye = L3(target, eye, FRAME);
    let up = [0, 1, 0];
    if (roll) {
      const fw = norm(sub(target, eye)), c = Math.cos(roll), s = Math.sin(roll), k = cross(fw, up), d = dot3(fw, up);
      up = [up[0] * c + k[0] * s + fw[0] * d * (1 - c), up[1] * c + k[1] * s + fw[1] * d * (1 - c), up[2] * c + k[2] * s + fw[2] * d * (1 - c)];
    }
    const fy = (fov * Math.PI) / 180;
    f.vp = M4.mul(M4.t(shift[0], shift[1], 0), M4.mul(M4.persp(fy, W / H, 0.05, 400), M4.look(eye, target, up)));
    f.eye = eye; f.target = target; f.up = up; f.fov = fy; f.shift = shift;
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
  function layout() {
    const ow = ov.width, oh = ov.height, land = ow >= oh;
    SCALE = land ? Math.min(ow / 1920, oh / 1080) : ow / 1080;
    W = ow / SCALE; H = oh / SCALE; PORT = !land;
    M = PORT ? 64 : 84; TOP = PORT ? 270 : 150;
    FRAME = Math.max(1, ((16 / 9) / (ow / oh)) * 0.8);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ow, oh);
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  }
  function submit(f) {
    // a pulled-back camera packs the same particles into less screen: keep density even
    f.particles.size *= Math.sqrt(FRAME); f.particles.gain /= Math.pow(FRAME, 0.9);
    f.sprites.forEach((s) => { s[3] *= FRAME; });
    if (glOK) {
      const q = Math.min(1, 1920 / Math.max(ov.width, ov.height));
      f.width = Math.max(2, Math.round(ov.width * q)); f.height = Math.max(2, Math.round(ov.height * q));
      EN.render(f);
    } else {
      mono(20, 500); ctx.fillStyle = C.dim; ctx.textAlign = 'center';
      ctx.fillText('This site is rendered live on the GPU and needs WebGL2.', W / 2, H / 2);
    }
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
    const an = 1 - 0.035 * Math.sin(Math.PI * P(lt, 3.3, 3.98)); // anticipation, back to rest by the cut
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
      mono(PORT ? 22 : 15, 500); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
      const lx = sx + 32 + (PORT && sx > W * 0.5 ? -420 : 0);
      ctx.fillText(`x ${tip.p[0].toFixed(1)}   y ${tip.p[1].toFixed(1)}`, lx, sy - 36);
      ctx.fillStyle = C.dim; ctx.fillText(`stroke ${Math.min(2, Math.max(1, tip.i + 1))}/2   particles ${Math.round(SH.N * P(lt, 0.3, 3.15)).toLocaleString('en-US')}`, lx, sy - 8);
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = P(lt, 0.1, 0.5) * (1 - P(lt, 3.4, 3.8)); label('[ 00 ]  SIGNATURE', W / 2, TOP, 'center');
    ctx.globalAlpha = E.outCubic(P(lt, 1.0, 1.6)) * (1 - P(lt, 3.3, 3.7));
    fit(serif, 48, 'Every system starts as a sketch.', W - 2 * M); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.fillText('Every system starts as a sketch.', W / 2, H - (PORT ? 200 : 105));
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 01 — IDENTITY: the ink solidifies; the rest becomes a halo
   * ================================================================ */
  const HALO_M = M4.mul(M4.rx(1.18), M4.rz(0.25));
  function sIdentity(lt, t, f) {
    const mv = E.inOutCubic(P(lt, 0.3, 1.5)), ex = E.inOutCubic(P(lt, 3.0, 3.8)), off = mv * (1 - ex);
    const ang = lerp(0, -0.35, mv) + lt * 0.04, dist = lerp(10.5, 11.5, mv) - 3 * ex;
    camera(f, [Math.sin(ang) * dist, 0.8, Math.cos(ang) * dist], [0, 0, 0], 35, 0, PORT ? [0, 0.3 * off] : [-0.42 * off, 0]);
    f.aperture = 0.03;
    const pop = E.outBack(P(lt, 0, 0.55));
    const ry = -0.5 * E.outCubic(P(lt, 0, 1.3)) + 0.85 * E.inOutCubic(P(lt, 1.3, 3.1)) + E.inExpo(P(lt, 3.1, 3.9)) * TAU * 1.5;
    const sc = SH.SIGN_SCALE * (1 - 0.97 * E.inExpo(P(lt, 3.3, 3.95)));
    f.mark = {
      pos: [0, 0, 0], rot: M4.m3(M4.mul(M4.ry(ry), M4.rx(0.12 * Math.sin(lt * 1.3)))), scale: sc,
      thick: 0.13 * pop, emit: 1 - E.outCubic(P(lt, 0.05, 0.6)), sweep: lerp(-1.3, 1.5, P(lt, 0.15, 2.8)), alpha: E.outCubic(P(lt, 0, 0.45)), color: LIME,
    };
    Object.assign(f.particles, { a: I.SIGN, b: I.HALO, mix: E.outCubic(P(lt, 0, 1.5)), spread: 0.5, turb: 1.6, mb: HALO_M, pull: E.inExpo(P(lt, 3.2, 3.95)), gain: lerp(0.22, 0.9, E.outCubic(P(lt, 0, 1.2))) });
    f.bg.cone = 0.9 * (1 - ex); f.bg.coneCol = [0.22, 0.26, 0.14];
    f.post.bloom = 1.0;

    const wa = 1 - P(lt, 2.95, 3.3);
    if (wa <= 0) return;
    const x0 = PORT ? M : W * 0.484, cy = PORT ? H * 0.66 : H / 2;
    ctx.globalAlpha = P(lt, 1.0, 1.3) * wa; label('[ 01 ]  HSING-HAN WU, A.K.A.', x0, cy - 135); ctx.globalAlpha = 1;
    const fs = fit(font, 200, 'XYPHUZ', W - x0 - M);
    font(fs); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    glyphs('XYPHUZ', 8).g.forEach((c, i) => {
      const s = E.outBack(P(lt, 1.0 + i * 0.06, 1.45 + i * 0.06)) * (1 - E.inCubic(P(lt, 2.9 + i * 0.03, 3.15 + i * 0.03)));
      if (s <= 0.001) return;
      ctx.save(); ctx.translate(x0 + c.x + c.w / 2, cy); ctx.scale(1, s); ctx.fillText(c.ch, -c.w / 2, fs * 0.35); ctx.restore();
    });
    const words = ['enterprise systems.', 'cloud platforms.', 'fab-scale software.', 'for the long run.'];
    const sw = [1.5, 2.0, 2.5];
    let idx = 0; sw.forEach((s) => { if (lt >= s) idx++; });
    const tr = idx ? E.outExpo(P(lt, sw[idx - 1], sw[idx - 1] + 0.32)) : 1;
    const ly = cy + 165;
    ctx.globalAlpha = E.outCubic(P(lt, 1.3, 1.6)) * wa;
    serif(56); ctx.fillStyle = C.ink; ctx.fillText('builds ', x0, ly);
    const px = x0 + ctx.measureText('builds ').width;
    font(54); ctx.fillStyle = C.lime;
    ctx.save(); ctx.beginPath(); ctx.rect(px - 10, ly - 55, W, 72); ctx.clip();
    if (idx > 0 && tr < 1) ctx.fillText(words[idx - 1], px, ly - tr * 72);
    ctx.fillText(words[idx], px, ly + (1 - tr) * 72);
    ctx.restore();
    ctx.globalAlpha = wa;
    const roles = 'SOFTWARE ARCHITECT · ENTERPRISE SYSTEMS · CLOUD INFRASTRUCTURE';
    fit((p) => mono(p, 500), 17, roles, W - x0 - M); ctx.fillStyle = C.dim;
    ctx.fillText(decode(roles, P(lt, 1.0, 2.0), t), x0, ly + 65);
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
    const lines = [
      [0.9, '$ go test ./... -race'],
      [1.5, 'ok   dispatch     0.84s   coverage 92.1%'],
      [1.9, 'ok   scheduler    1.12s   coverage 89.4%'],
      [2.3, '$ make release  →  v2.4.0'],
    ];
    ctx.globalAlpha = P(lt, 0.8, 1.1) * (1 - P(lt, 3.4, 3.7));
    label('[ 02 ]  CODE', M, TOP);
    mono(PORT ? 22 : 16, 500); ctx.textAlign = 'left';
    const lh = PORT ? 38 : 28, y0 = H - (PORT ? 330 : 220);
    lines.forEach(([tt, s], i) => {
      if (lt < tt) return;
      ctx.fillStyle = s[0] === '$' ? C.ink : C.lime;
      ctx.fillText(s.slice(0, Math.ceil(P(lt, tt, tt + 0.3) * s.length)), M, y0 + i * lh);
    });
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 03 — SOFTWARE ARCHITECT: type reassembles into a live system
   * ================================================================ */
  function archPins(a) {
    SH.NODES.forEach((n, i) => pin(n.p, n.lab, a * (0.6 + 0.4 * hash(i, 9)), i === 2 ? C.lime : C.ink));
    SH.LAYERS.forEach((l, li) => pin([-4.6, l.y * 2, 3.6], `L${li}  ${l.n}`, a * 0.8, C.blue, -10, 12));
  }
  // The architecture's last beat glides to a front-on view — exactly the
  // camera the wafer chapter opens on, so the cut between them is invisible.
  const WAFER_EYE = [0, 0.6, 12];
  function sArch(lt, t, f) {
    const yaw = -0.9 + lt * 0.22, pitch = 0.5, g = E.inOutCubic(P(lt, 2.6, 4.0));
    camera(f, L3(orbit(yaw, pitch, 13.5), WAFER_EYE, g), L3([0, -0.3, 0], [0, 0, 0], g), 38);
    f.aperture = 0.03;
    Object.assign(f.particles, { a: I.TEXT, b: I.ARCH, mix: E.inOutCubic(P(lt, 0, 1.5)), spread: 0.9, turb: 0.9, size: 0.015 });

    archPins(P(lt, 1.2, 1.6) * (1 - P(lt, 2.9, 3.2)));
    const ta = P(lt, 0.9, 1.2) * (1 - P(lt, 3.0, 3.3));
    if (ta > 0) {
      ctx.globalAlpha = ta; label('[ 03 ]  SYSTEMS', M, TOP);
      const fs = fit(font, 110, 'ARCHITECT', W - 2 * M);
      ctx.fillStyle = C.ink; reveal('SOFTWARE', M, H - (PORT ? 330 : 200), fs, E.outExpo(P(lt, 0.9, 1.5)));
      ctx.fillStyle = C.blue; reveal('ARCHITECT', M, H - (PORT ? 225 : 95), fs, E.outExpo(P(lt, 1.0, 1.6)));
      ctx.globalAlpha = 1;
    }
  }

  /* ================================================================
   * 04 — ENTERPRISE SYSTEMS: a die → the wafer → the fab floor
   * ================================================================ */
  const WAFER_TILT = -0.95;
  const fabEye = (lt) => orbit(0.75 + (lt - 2) * 0.12, 0.58, 12, [-1.2, 0.6, 0]);
  function titleBlock(lt, t0, kicker, a, b, colB, line, tags) {
    const ta = P(lt, t0, t0 + 0.3);
    ctx.globalAlpha *= ta;
    label(kicker, M, TOP);
    const fs = fit(font, 96, a.length > b.length ? a : b, W - 2 * M);
    ctx.fillStyle = C.ink; reveal(a, M, TOP + 100, fs, E.outExpo(P(lt, t0, t0 + 0.6)));
    ctx.fillStyle = colB; reveal(b, M, TOP + 100 + fs * 0.98, fs, E.outExpo(P(lt, t0 + 0.1, t0 + 0.7)));
    let y = TOP + 100 + fs * 0.98 + 60;
    if (line) { fit(serif, 40, line, W - 2 * M); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(line, M, y); y += 40; }
    if (tags) { fit((p) => mono(p, 700), 14, tags, W - 2 * M); ctx.fillStyle = C.dim; ctx.fillText(tags, M, y); }
    ctx.globalAlpha = 1;
  }
  function sFab(lt, t, f) {
    if (lt < 2.0) {
      const tilt = E.inOutCubic(P(lt, 1.2, 2.0));
      camera(f, [0, WAFER_EYE[1] * (1 - E.inOutCubic(P(lt, 0, 0.8))) + 3 * tilt, lerp(WAFER_EYE[2], 10.5, E.inOutCubic(P(lt, 0, 1.3)))], [0, 0, 0], 38);
      Object.assign(f.particles, { a: I.ARCH, b: I.WAFER, mix: E.inOutCubic(P(lt, 0, 1.0)), spread: 0.5, turb: 1.0, mb: M4.rx(WAFER_TILT * E.inOutCubic(P(lt, 1.2, 2.0))), scan: lerp(5, -5, P(lt, 0.7, 1.8)) });
    } else {
      const e2 = E.inOutCubic(P(lt, 2.0, 3.0)), rise = E.inOutCubic(P(lt, 3.3, 4.0));
      // start exactly where the wafer half left the camera (eye, target and lens)
      const eye = L3([0, 3, 10.5], fabEye(lt), e2);
      eye[1] += rise * 12;
      camera(f, eye, [-1.2 * e2, 0.6 * e2 + rise * 11, 0], lerp(38, 40, e2), 0, PORT ? [0, -0.12 * e2] : [0, 0]);
      Object.assign(f.particles, { a: I.WAFER, b: I.FAB, ma: M4.rx(WAFER_TILT), mix: e2, spread: 0.8, turb: 1.2, scan: -5, gain: lerp(1, 1.8, e2) });
    }
    f.aperture = 0.03;

    const wl = P(lt, 0.9, 1.2) * (1 - P(lt, 1.8, 2.0));
    if (wl > 0) {
      const s = `WAFER 07  ·  300 mm  ·  YIELD MAP  ·  ${Math.round(P(lt, 0.7, 1.8) * 100)}% INSPECTED`;
      ctx.globalAlpha = wl; fit((p) => mono(p, 700), PORT ? 22 : 15, s, W - 2 * M); ctx.textAlign = 'center'; ctx.fillStyle = C.dim;
      ctx.fillText(s, W / 2, H - (PORT ? 200 : 90));
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = 1 - P(lt, 3.4, 3.7);
    if (lt > 2.4) titleBlock(lt, 2.4, '[ 04 ]  GIGA-FAB SCALE', 'ENTERPRISE', 'SYSTEMS', C.lime, 'for giga-fab semiconductor manufacturing.', 'MES · DISPATCH · SCHEDULING · SPC · AMHS · 24/7');
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 05 — CLOUD INFRASTRUCTURE: the planet, failover, healing
   * ================================================================ */
  const FAIL_ID = 2;
  function regionPins(spin, eye, a, fail) {
    SH.REGIONS.forEach((rg, i) => {
      const d = SH.dirOf(...rg), p = M4.apply(spin, [d[0] * SH.GR * 1.04, d[1] * SH.GR * 1.04, d[2] * SH.GR * 1.04]);
      const facing = dot3(norm(p), norm(sub(eye, p)));
      const down = i === FAIL_ID && fail > 0.5;
      pin(p, down ? `region-${i + 1}  ✗ DOWN` : `region-${i + 1}`, a * clamp(facing * 3), down ? C.coral : C.ink);
    });
  }
  function sCloud(lt, t, f) {
    const cen = PORT ? [0, 0, 0] : [-3.6, 0, 0];
    const start = fabEye(4); start[1] += 12;
    const a = 0.3 + lt * 0.1, e = E.inOutCubic(P(lt, 0, 1.5));
    const push = E.inExpo(P(lt, 3.4, 4.0));
    const eye = L3(L3(start, orbit(a, 0.18, 19.5, cen), e), [0, 0, 5 / FRAME], push);
    camera(f, eye, L3([0, 11.6, 0], cen, e), 38, 0, PORT ? [0, -0.18 * e] : [0, 0]);
    f.aperture = 0.01;
    const spin = M4.ry(0.6 + lt * 0.22);
    const fail = P(lt, 2.2, 2.35) * (1 - P(lt, 3.0, 3.4));
    Object.assign(f.particles, { a: I.FAB, b: I.GLOBE, mix: E.inOutCubic(P(lt, 0, 1.4)), spread: 0.9, turb: 1.3, mb: spin, fail, failId: FAIL_ID });
    f.bg.stars = 0.5;

    regionPins(spin, f.eye, P(lt, 1.3, 1.6) * (1 - push), fail);
    ctx.globalAlpha = 1 - push;
    if (lt > 0.4) titleBlock(lt, 0.4, '[ 05 ]  CLOUD', 'CLOUD', 'INFRASTRUCTURE', C.blue);
    const logs = [
      [0.9, '$ terraform apply  ·  6 regions', C.dim], [1.3, '✓ mesh up  ·  12 routes', C.lime], [1.8, 'p99 38 ms  ·  error rate 0.00%', C.ink],
      [2.2, '✗ region-3 unreachable', C.coral], [2.45, '↻ failover → region-2, region-5', C.ink], [3.0, '✓ recovered  ·  zero downtime', C.lime],
    ];
    ctx.globalAlpha = 1 - push; mono(PORT ? 22 : 15, 500); ctx.textAlign = 'left';
    const lh = PORT ? 40 : 30, y0 = H - (PORT ? 420 : 280);
    logs.forEach(([tt, s, col], i) => {
      if (lt < tt) return;
      ctx.fillStyle = col; ctx.fillText(s.slice(0, Math.ceil(P(lt, tt, tt + 0.25) * s.length)), M, y0 + i * lh);
    });
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 06 — MANIFESTO: every particle re-forms each word, on the beat
   * ================================================================ */
  const WT = [0.5, 1.0, 1.5, 2.0, 2.25, 2.5, 2.75];
  const SUBS = ['systems before syntax.', 'the boring parts, done well.', 'from one tool to the whole fab.', 'humans out of the loop.', 'fail over, never fall over.', 'small, every day.', 'forever.'];
  const WCOL = [C.lime, C.ink, C.coral, C.lime, C.blue, C.lime, C.ink];
  function sManifesto(lt, t, f) {
    let i = 0; WT.forEach((w, k) => { if (lt >= w - 0.0001) i = k; });
    const landed = lt >= WT[0];
    const tgt = landed ? Math.min(i + 1, WT.length - 1) : 0;
    const win = tgt > 0 ? Math.min(0.32, (WT[tgt] - WT[tgt - 1]) * 0.85) : 0.45;
    const from = landed ? I.WORD + i : I.GLOBE, to = I.WORD + tgt;
    const mix = tgt === i && landed ? 1 : E.inOutCubic(P(lt, WT[tgt] - win, WT[tgt]));
    const hit = WT.reduce((m, w) => (lt >= w ? Math.max(m, Math.exp(-(lt - w) * 9)) : m), 0);

    const dolly = lerp(17, 12.5, E.inOutCubic(P(lt, 0, 3))) - hit * 0.8;
    const roll = Math.sin(lt * 1.7) * 0.06 + (i % 2 ? 0.03 : -0.03) * hit;
    camera(f, [Math.sin(lt * 0.6) * 1.2, Math.cos(lt * 0.5) * 0.5, dolly], [0, 0, 0], 42 - hit * 7, roll);
    f.aperture = 0.012;
    Object.assign(f.particles, {
      a: from, b: to, ma: landed ? M4.id() : M4.ry(0.6 + 4 * 0.22), mix, spread: 0.45, turb: 1.4, burst: 1.1,
      size: 0.016, gain: lerp(1.2, 1.5, hit),
    });
    f.post.ca = 1.4 + hit * 6; f.post.bloom = 0.95 + hit * 0.6; f.post.threshold = 0.62;

    label('[ 06 ]  MANIFESTO', W / 2, TOP, 'center');
    if (!landed) return;
    const wl = lt - WT[i];
    const s = SUBS[i], ta = E.outCubic(P(wl, 0.04, 0.16)) * (tgt !== i ? 1 - P(lt, WT[tgt] - win, WT[tgt] - win + 0.08) : 1);
    const y = PORT ? H * 0.62 : H * 0.73;
    ctx.globalAlpha = ta;
    fit(serif, 46, s, W - 2 * M); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.fillText(s.slice(0, Math.ceil(P(wl, 0.04, 0.2) * s.length)), W / 2, y);
    mono(PORT ? 22 : 16, 700); ctx.fillStyle = WCOL[i];
    ctx.fillText(`${pad(i + 1)} / ${pad(WT.length)}   ${SH.WORDS[i]}`, W / 2, y + 60);
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 07 — XYPHUZ: the particles come home (and hand over to the site)
   * ================================================================ */
  const signSway = (c) => 0.45 * Math.sin(c * 1.1) - 0.3;
  // `lk` lets the mark turn toward the visitor's cursor on the site.
  // `lk` turns it toward the cursor and `r` is the visitor's own spin, on the site.
  const signR = (c, lk = [0, 0], r = null) => M4.mul(M4.ry(signSway(c) + lk[0] * 0.3 + (r ? r.y : 0)), M4.rx(-lk[1] * 0.2 + (r ? r.x : 0)));
  const signM = (c, lk, r) => M4.mul(M4.mul(M4.t(0, 1.05, 0), signR(c, lk, r)), M4.s(0.8));
  const signMark = (c, alpha, lk, r) => ({ pos: [0, 1.05, 0], rot: M4.m3(signR(c, lk, r)), scale: SH.SIGN_SCALE * 0.8, thick: 0.13, emit: 0, sweep: 1.4 - 2.6 * fract((c - 3) / 7) + (lk ? lk[0] * 0.6 : 0) + (r ? r.y * 0.5 : 0), alpha, color: LIME });
  function sOutro(lt, t, f) {
    const pz = PORT ? 0.72 : 1; // phones: closer on the mark, it's the hero of the last shot
    camera(f, [Math.sin(lt * 0.15) * 1.2 * pz, 0.5, 11.5 * pz], [0, 0.5, 0], 35, 0, PORT ? [0, 0.22] : [0, 0]);
    f.aperture = 0.025;
    Object.assign(f.particles, { a: I.WORD + WT.length - 1, b: I.SIGN, mix: E.inOutCubic(P(lt, 0, 1.3)), spread: 0.8, turb: 1.4, mb: M4.mul(signM(lt), M4.s(1.04)), gain: lerp(1, 0.16, P(lt, 0.6, 1.6)) });
    f.mark = signMark(lt, E.outCubic(P(lt, 0.9, 1.6)));
    f.mark.sweep = lerp(-1.2, 1.4, P(lt, 1.0, 2.8));
    f.bg.cone = 0.7; f.bg.coneCol = [0.2, 0.24, 0.13];

    const out = 1 - P(lt, 2.45, 2.9); // the site's own UI takes over from here
    const y0 = PORT ? H * 0.64 : H * 0.755;
    const tr = lerp(80, 24, E.outExpo(P(lt, 0.5, 1.6)));
    font(110); let gl = glyphs('XYPHUZ', tr);
    if (gl.w > W - 2 * M) { font((110 * (W - 2 * M)) / gl.w); gl = glyphs('XYPHUZ', (tr * (W - 2 * M)) / gl.w); }
    ctx.globalAlpha = E.outCubic(P(lt, 0.5, 0.9)) * out; ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    gl.g.forEach((c) => ctx.fillText(c.ch, W / 2 - gl.w / 2 + c.x, y0));
    ctx.globalAlpha = out;
    const roles = 'SOFTWARE ARCHITECT  /  ENTERPRISE SYSTEMS  /  CLOUD INFRASTRUCTURE';
    fit((p) => mono(p, 500), PORT ? 24 : 19, roles, W - 2 * M); ctx.fillStyle = C.dim; ctx.textAlign = 'center';
    ctx.fillText(decode(roles, P(lt, 0.8, 1.6), t), W / 2, y0 + 47);
    const ta = E.outCubic(P(lt, 1.2, 1.7)), line = 'Started in motion design. Now I build what doesn’t fall over.';
    ctx.globalAlpha = ta * out; fit(serif, 40, line, W - 2 * M); ctx.fillStyle = C.ink;
    ctx.fillText(line, W / 2, y0 + 100 + (1 - ta) * 16);
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

  function corners(a) {
    const m = PORT ? 28 : 44, L = PORT ? 40 : 26;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = PORT ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(m, m + L); ctx.lineTo(m, m); ctx.lineTo(m + L, m);
    ctx.moveTo(W - m - L, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + L);
    ctx.moveTo(m, H - m - L); ctx.lineTo(m, H - m); ctx.lineTo(m + L, H - m);
    ctx.moveTo(W - m - L, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - L);
    ctx.stroke(); ctx.restore();
  }
  function hud(t, sc) {
    corners(1);
    ctx.save();
    mono(PORT ? 22 : 16, 500); ctx.fillStyle = 'rgba(255,255,255,.7)';
    const y = H - (PORT ? 90 : 60);
    ctx.textAlign = 'left'; ctx.fillText(`${sc.id} / ${sc.name}`, M, y);
    ctx.textAlign = 'right';
    const tc = `00:00:${pad(Math.floor(t))}:${pad(Math.floor(fract(t) * 24))}`;
    ctx.fillText(tc, W - M, y);
    const tw = ctx.measureText(tc).width;
    if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = '#ff2d2d'; dot(W - M - tw - 20, y - 6, 7); ctx.fill(); }
    ctx.restore();
  }

  const FLASHES = [];

  // Every cut is a hand-off: for the first moments of a chapter the camera,
  // exposure and lens glide in from the previous chapter's last frame, so the
  // particles — already continuous between formations — never jump on screen.
  const BLEND = 0.75;
  let sink = null;
  function silently(fn) {
    if (!sink) sink = document.createElement('canvas').getContext('2d');
    const keep = ctx; ctx = sink;
    try { fn(); } finally { ctx = keep; }
  }
  function setView(f, eye, target, up, fy, shift) {
    f.vp = M4.mul(M4.t(shift[0], shift[1], 0), M4.mul(M4.persp(fy, W / H, 0.05, 400), M4.look(eye, target, up)));
    f.eye = eye; f.target = target; f.up = up; f.fov = fy; f.shift = shift;
    f.focus = Math.hypot(...sub(target, eye));
    VP = f.vp;
  }
  function blend(a, b, k) {
    setView(b, L3(a.eye, b.eye, k), L3(a.target, b.target, k), norm(L3(a.up, b.up, k)), lerp(a.fov, b.fov, k), [lerp(a.shift[0], b.shift[0], k), lerp(a.shift[1], b.shift[1], k)]);
    b.aperture = lerp(a.aperture, b.aperture, k);
    for (const key of ['gain', 'size']) b.particles[key] = lerp(a.particles[key], b.particles[key], k);
    for (const key of ['bloom', 'threshold', 'ca', 'vig', 'exposure']) b.post[key] = lerp(a.post[key], b.post[key], k);
    for (const key of ['cone', 'stars']) b.bg[key] = lerp(a.bg[key] || 0, b.bg[key] || 0, k);
    b.bg.coneCol = L3(a.bg.coneCol, b.bg.coneCol, k);
  }

  function render(t) {
    t = clamp(t, 0, DUR - 1e-4);
    layout();
    const sc = SCENES.find((s) => t >= s.s && t < s.e) || SCENES[SCENES.length - 1];
    const idx = SCENES.indexOf(sc), lt = t - sc.s;
    let pf = null;
    if (idx > 0 && lt < BLEND) {
      const pv = SCENES[idx - 1];
      pf = base(t);
      silently(() => pv.draw(pv.e - pv.s - 1e-3, pv.e - 1e-3, pf));
    }
    const f = base(t);
    sc.draw(lt, t, f);
    if (pf) blend(pf, f, E.inOutCubic(lt / BLEND));
    for (const [ft, a] of FLASHES) if (t >= ft && t < ft + 0.4) f.post.flash = Math.max(f.post.flash, a * Math.pow(1 - P(t, ft, ft + 0.4), 2));
    submit(f);
    ctx.globalAlpha = 1;
    hud(t, sc);
  }

  /* ================================================================
   * HOME — the reel's last frame, made interactive
   * ================================================================ */
  // The first entry matches the outro's final camera exactly, so the handoff is seamless.
  const HOME = [
    { id: 'xyphuz', shape: I.SIGN, target: [0, 0.5, 0], yaw: 0.045, pitch: 0, dist: 11.51, fov: 35, gain: 0.16, mark: true, springYaw: true },
    { id: 'engineer', shape: I.TEXT, target: [0, 0.2, 0], yaw: -0.15, pitch: 0.08, dist: 15.5, fov: 40, gain: 1.5 },
    { id: 'architect', shape: I.ARCH, target: [0, -0.3, 0], yaw: -0.55, pitch: 0.5, dist: 16.5, fov: 38, gain: 1.0 },
    { id: 'enterprise', shape: I.FAB, target: [0, 0.3, 0.4], yaw: 0.55, pitch: 0.82, dist: 17.5, fov: 40, gain: 1.9 },
    { id: 'cloud', shape: I.GLOBE, target: [0, 0, 0], yaw: 0.3, pitch: 0.18, dist: 20, fov: 38, gain: 1.0 },
  ];
  const GATE = { shape: I.DUST, target: [0, 0, -3], yaw: 0, pitch: 0.12, dist: 16, fov: 40, gain: 1.15 };
  const NODE_INFO = {
    'Ops Console': 'where people see and steer the fab', 'Tool Gateway': 'speaks to every machine on the floor',
    'API Gateway': 'one front door — authenticated, rate-limited', MES: 'the source of truth for every lot and step',
    Dispatcher: 'decides what runs where, in milliseconds', Scheduler: 'plans hours ahead so tools never idle',
    SPC: 'catches drift before it becomes scrap', Postgres: 'transactions that must never be wrong',
    Redis: 'hot state at memory speed', Lakehouse: 'years of history, still queryable',
    Kafka: 'every event, ordered and replayable', Workers: 'scale out when the floor gets busy',
  };
  const BUGS = [
    'race condition in dispatch retry', 'off-by-one in lot pagination', 'null lot id from tool gateway', 'N+1 query in SPC chart',
    'timezone bug in shift report', 'memory leak in event consumer', 'flaky test: scheduler preemption', 'unhandled promise in recipe sync',
    'stale cache after recipe update', 'deadlock in equipment state machine',
  ];
  const near = (pts, mx, my, r) => {
    let best = -1, bd = r;
    pts.forEach((q, i) => { if (!q) return; const d = Math.hypot(q[0] - mx, q[1] - my); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick1 = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ================================================================
   * The site's chapters each hand you a job from that role:
   *   00 sign the mark yourself · 01 hunt the bug · 02 scale the bottleneck
   *   03 dispatch the idle tool · 04 break a region and watch it heal
   * ================================================================ */
  let SEC = -1, ENTER = 0, NOW = 0, MXV = 0, MYV = 0, PD = null, HOVER = null, LASTEYE = null;
  const LOG = [];
  function log(text, col = C.ink) { LOG.push({ t: NOW, text, col }); if (LOG.length > 4) LOG.shift(); }
  let SOUND = []; // sounds the page should play this frame
  const sfx = (k, a) => SOUND.push([k, a]);

  // ---- 00 · sign it yourself ----
  const SIGN_STILL = M4.mul(M4.t(0, 1.05, 0), M4.s(0.8));
  const invS = (u) => 0.5 - Math.sin(Math.asin(1 - 2 * clamp(u, 1e-4, 1 - 1e-4)) / 3);
  let TPTS = null;
  const tracePts = () => TPTS || (TPTS = MK.STROKES.map((s) => s.pts.map((p) => M4.apply(SIGN_STILL, toWorld(p)))));
  const TR = { on: false, s: 0, k: 0, active: false, unwrite: -9, done: -9, last: 0 };
  function traceT() {
    if (!TR.on) return 4;
    if (TR.s >= 2) return 4;
    const n = tracePts()[TR.s].length, [a, b] = MK.STROKE_T[TR.s];
    return a + (b - a) * invS(TR.k / (n - 1));
  }
  const nibWorld = () => tracePts()[Math.min(TR.s, 1)][TR.s >= 2 ? tracePts()[1].length - 1 : TR.k];
  const traceTarget = () => (!TR.on || TR.s >= 2 ? tracePts()[0][0] : tracePts()[TR.s][TR.k]);

  // ---- 01 · bug hunt ----
  const BG = { id: -1, at: 0, next: 0, fixed: 0, escaped: 0, ttf: [], okId: -1, okAt: -9, badId: -1, badAt: -9 };
  // ---- 02 · bottleneck ----
  const LD = { heat: new Float32Array(12), hot: [], next: 0, scale: new Array(12).fill(1), okId: -1, okAt: -9, rps: 12000, sel: -1 };
  const LOADABLE = [3, 4, 5, 6, 7, 8, 10, 11];
  // ---- 03 · dispatch ----
  const FB = { state: new Array(24).fill(0), idleAt: new Array(24).fill(0), next: 0, done: 0, idleSum: 0, okId: -1, okAt: -9, carriers: [], lot: 427 };
  // ---- 04 · cloud ----
  const CL = { rot: { y: 0.6, x: 0, vy: 0, vx: 0 }, fail: -1, failAt: -99 };
  // drag anywhere to orbit the camera; it drifts back to the chapter's framing once you let go
  const OB = { yaw: 0, pitch: 0, vy: 0, vp: 0, at: -99 };
  function stepOrbit(dt) {
    if (PD && PD.mode === 'orbit') return;
    OB.yaw += OB.vy * dt; OB.pitch += OB.vp * dt;
    const damp = Math.exp(-dt * 3.5); OB.vy *= damp; OB.vp *= damp;
    const back = NOW - OB.at > 2.5 ? 1 - Math.exp(-dt * 1.6) : 0;
    OB.yaw = clamp(OB.yaw * (1 - back), -1.1, 1.1); OB.pitch = clamp(OB.pitch * (1 - back), -0.6, 0.6);
  }

  function enterSection(k) {
    LOG.length = 0;
    if (k === 0) { TR.on = false; TR.active = false; }
    if (k === 1) { BG.id = -1; BG.next = NOW + 1.2; }
    if (k === 2) { LD.hot = []; LD.next = NOW + 1.6; }
    if (k === 3) { FB.next = NOW + 0.8; }
  }

  function step(k, dt) {
    if (k === 1) {
      if (BG.id < 0 && NOW >= BG.next) {
        let id; do { id = Math.floor(Math.random() * 16); } while (id === BG.okId);
        BG.id = id; BG.at = NOW; BG.msg = pick1(BUGS);
        log(`✗ ${BG.msg}`, C.coral); sfx('bug');
      }
      if (BG.id >= 0 && NOW - BG.at > 7) {
        BG.escaped++; log('✗ escaped to production — rolled back', C.coral); sfx('wrong');
        BG.id = -1; BG.next = NOW + 1.2;
      }
    }
    if (k === 2) {
      LD.rps = Math.min(64000, LD.rps + dt * 900);
      if (!LD.hot.length && NOW >= LD.next) {
        const pool = LOADABLE.slice().sort((a, b) => LD.scale[a] - LD.scale[b] || Math.random() - 0.5);
        const id = pool[Math.floor(Math.random() * 3)];
        LD.hot.push({ id, at: NOW, cascaded: false });
        log(`▲ ${SH.NODES[id].lab} saturated — p99 climbing`, C.coral); sfx('hot');
      }
      LD.hot.forEach((h) => {
        if (h.cascaded || NOW - h.at < 6 || LD.hot.length > 1) return;
        const nb = SH.EDGES.filter(([a, b]) => a === h.id || b === h.id).map(([a, b]) => (a === h.id ? b : a)).filter((n) => LOADABLE.includes(n) && !LD.hot.some((x) => x.id === n));
        h.cascaded = true;
        if (nb.length) { const id = pick1(nb); LD.hot.push({ id, at: NOW, cascaded: true }); log(`✗ timeouts cascading → ${SH.NODES[id].lab}`, C.coral); sfx('hot'); }
      });
      for (let i = 0; i < 12; i++) {
        const tgt = LD.hot.some((h) => h.id === i) ? 1 : 0;
        LD.heat[i] += (tgt - LD.heat[i]) * Math.min(1, dt * (tgt ? 1.4 : 5));
      }
    }
    if (k === 3) {
      const idle = FB.state.filter((s) => s === 1).length;
      if (NOW >= FB.next && idle < 4) {
        const busy = FB.state.map((s, i) => (s === 0 ? i : -1)).filter((i) => i >= 0);
        const i = pick1(busy);
        FB.state[i] = 1; FB.idleAt[i] = NOW; sfx('idle');
        FB.next = NOW + rnd(0.9, 2.2);
      }
      FB.carriers = FB.carriers.filter((c) => {
        if (NOW - c.t0 < 0.75) return true;
        FB.state[c.tool] = 0; FB.okId = c.tool; FB.okAt = NOW; sfx('land');
        return false;
      });
    }
    if (k === 4) {
      const r = CL.rot;
      if (!(PD && PD.mode === 'spin')) {
        r.y += (r.vy + 0.22 * (HOVER && HOVER.kind === 'region' ? 0.06 : 1)) * dt;
        r.vy *= Math.exp(-dt * 1.4);
        r.vx += (-r.x * 14 - r.vx * 5) * dt; r.x += r.vx * dt;
      }
    }
  }

  // world → screen for the current section's interactive things
  function targets(k) {
    if (k === 1) return SH.LETTERS.map((l) => l.p);
    if (k === 2) return SH.NODES.map((n) => n.p);
    if (k === 3) return SH.TOOLS;
    if (k === 4) { const m = cloudM(); return SH.REGIONS.map((rg) => { const d = SH.dirOf(...rg); return M4.apply(m, [d[0] * SH.GR, d[1] * SH.GR, d[2] * SH.GR]); }); }
    return [];
  }
  const cloudM = () => M4.mul(M4.ry(CL.rot.y), M4.rx(CL.rot.x));
  function hitTest(k, eye) {
    const R = PORT ? 120 : 72;
    if (k === 0) {
      const q = project(TR.active ? nibWorld() : traceTarget());
      return Math.hypot(q[0] - MXV, q[1] - MYV) < R * 1.3 ? { kind: 'trace' } : null;
    }
    const pts = targets(k).map((p) => {
      if (k === 4 && dot3(norm(p), norm(sub(eye, p))) < 0.15) return null;
      const q = project(p); return q[2] > 0 ? q : null;
    });
    const i = near(pts, MXV, MYV, k === 1 ? R * 0.9 : R);
    return i < 0 ? null : { kind: ['', 'letter', 'node', 'tool', 'region'][k], i };
  }

  /* ---------- pointer (the page forwards events here) ---------- */
  function pointerDown(ndc, t) {
    NOW = t; [MXV, MYV] = [(ndc[0] * 0.5 + 0.5) * W, (0.5 - ndc[1] * 0.5) * H];
    // touch has no hover: test what's under the finger right now
    if (VP && LASTEYE && SEC >= 0) HOVER = hitTest(SEC, LASTEYE);
    PD = { x: MXV, y: MYV, d: 0, hit: HOVER, mode: 'click', last: ndc, t };
    if (SEC === 0 && HOVER && HOVER.kind === 'trace') {
      if (!TR.on || TR.s >= 2) { Object.assign(TR, { on: true, s: 0, k: 0, unwrite: t, done: -9 }); log('✎ trace it — two strokes, in order', C.lime); }
      TR.active = true; PD.mode = 'trace'; TR.last = t; sfx('grab');
    } else if (SEC === 4 && !(HOVER && HOVER.kind === 'region')) PD.mode = 'spin';
    return flush();
  }
  function pointerMove(ndc, t) {
    NOW = t;
    const px = (ndc[0] * 0.5 + 0.5) * W, py = (0.5 - ndc[1] * 0.5) * H;
    if (PD) {
      PD.d += Math.hypot(px - MXV, py - MYV);
      if (PD.mode === 'spin') {
        const dx = ndc[0] - PD.last[0], dy = ndc[1] - PD.last[1], dt = Math.max(1e-3, t - PD.t), r = CL.rot;
        r.y += dx * 2.6; r.x = clamp(r.x - dy * 1.8, -0.9, 0.9);
        r.vy = lerp(r.vy, (dx * 2.6) / dt, 0.4); r.vx = lerp(r.vx, (-dy * 1.8) / dt, 0.4);
      }
      if (PD.mode === 'click' && PD.d > 14) { PD.mode = 'orbit'; HOVER = null; }
      if (PD.mode === 'orbit') {
        const dx = ndc[0] - PD.last[0], dy = ndc[1] - PD.last[1], dt = Math.max(1e-3, t - PD.t);
        OB.yaw = clamp(OB.yaw - dx * 1.6, -1.1, 1.1); OB.pitch = clamp(OB.pitch - dy * 0.9, -0.6, 0.6);
        OB.vy = lerp(OB.vy, (-dx * 1.6) / dt, 0.4); OB.vp = lerp(OB.vp, (-dy * 0.9) / dt, 0.4); OB.at = t;
      }
      if (PD.mode === 'trace' && TR.active) traceMove(px, py, t);
      PD.last = ndc; PD.t = t;
    }
    MXV = px; MYV = py;
    return flush();
  }
  function traceMove(px, py, t) {
    const pts = tracePts()[TR.s], tol = PORT ? 95 : 58;
    let best = -1, bd = tol;
    for (let i = TR.k; i < Math.min(pts.length, TR.k + 45); i++) {
      const q = project(pts[i]); const d = Math.hypot(q[0] - px, q[1] - py);
      if (d < bd) { bd = d; best = i; }
    }
    if (best > TR.k) {
      const level = clamp((best - TR.k) / Math.max(0.016, t - TR.last) / 120);
      TR.k = best; TR.last = t; sfx('pen', level);
    }
    if (TR.k >= pts.length - 2) {
      TR.s++; TR.k = 0; TR.active = false;
      if (TR.s >= 2) { TR.done = t; log('✓ signed — in the order I write it', C.lime); sfx('signed'); }
      else { log('✓ stroke one — now the second, from the bottom-left', C.ink); sfx('stroke'); }
    }
  }
  function pointerUp(t) {
    NOW = t;
    const p = PD; PD = null;
    if (!p) return flush();
    if (p.mode === 'trace') { TR.active = false; return flush(); }
    if (p.mode === 'orbit') { OB.vy = clamp(OB.vy, -4, 4); OB.vp = clamp(OB.vp, -2, 2); OB.at = t; return flush(); }
    if (p.mode === 'spin') { const r = CL.rot; r.vy = clamp(r.vy, -9, 9); r.vx = clamp(r.vx, -5, 5); if (Math.abs(r.vy) > 1) sfx('fling', clamp(Math.abs(r.vy) / 6)); return flush(); }
    if (p.d > 14) return flush();
    const h = p.hit;
    if (SEC === 1 && h) {
      if (h.i === BG.id) {
        const ttf = t - BG.at; BG.ttf.push(ttf); BG.fixed++; BG.okId = h.i; BG.okAt = t; BG.id = -1; BG.next = t + rnd(0.8, 1.6);
        log(`✓ fixed in ${ttf.toFixed(1)} s — all tests green`, C.lime); sfx('fixed');
      } else { BG.badId = h.i; BG.badAt = t; sfx('wrong'); }
    }
    if (SEC === 2 && h) {
      const k = LD.hot.findIndex((x) => x.id === h.i);
      if (k >= 0) {
        LD.hot.splice(k, 1); LD.scale[h.i]++; LD.okId = h.i; LD.okAt = t;
        if (!LD.hot.length) LD.next = t + rnd(2.2, 3.6);
        log(`✓ ${SH.NODES[h.i].lab} scaled ×${LD.scale[h.i]} — p99 back to ${Math.round(rnd(36, 48))} ms`, C.lime); sfx('scale');
      } else LD.sel = LD.sel === h.i ? -1 : h.i;
    }
    if (SEC === 3 && h && FB.state[h.i] === 1) {
      const idle = t - FB.idleAt[h.i];
      FB.state[h.i] = 2; FB.done++; FB.idleSum += idle; FB.carriers.push({ tool: h.i, t0: t });
      log(`→ LOT A0${FB.lot++} dispatched to EQ-${pad(h.i + 1)} · was idle ${idle.toFixed(1)} s`, C.lime); sfx('dispatch');
    }
    if (SEC === 4 && h) { CL.fail = h.i; CL.failAt = t; sfx('fail'); }
    return flush();
  }
  function flush() { const s = SOUND; SOUND = []; return s; }

  function drawLog(score) {
    const x = PORT ? M : W - M - 500, y0 = PORT ? TOP + 30 : H - 200, lh = PORT ? 40 : 28;
    if (score) { mono(PORT ? 20 : 13, 700); ctx.fillStyle = C.dim; ctx.textAlign = 'left'; ctx.fillText(score, x, y0 - lh); }
    mono(PORT ? 24 : 15, 600); ctx.textAlign = 'left';
    LOG.forEach((l, k) => {
      const age = NOW - l.t;
      ctx.globalAlpha = 1 - P(age, 7, 8);
      ctx.fillStyle = l.col; ctx.fillText(l.text.slice(0, Math.ceil(P(age, 0, 0.3) * l.text.length)), x, y0 + k * lh);
    });
    ctx.globalAlpha = 1;
  }
  function badge(p, text, col) {
    const [x, y, w] = project(p);
    if (w <= 0) return;
    mono(PORT ? 22 : 13, 700); const tw = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(7,7,10,.78)'; ctx.fillRect(x + 16, y - 30, tw + 16, PORT ? 32 : 22);
    ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(text, x + 24, y - (PORT ? 8 : 14));
  }

  function nodeCard(i, a) {
    const n = SH.NODES[i], [x, y] = project(n.p);
    ctx.globalAlpha = a;
    const left = x > W - 560, tx = left ? x - 50 : x + 50;
    ctx.textAlign = left ? 'right' : 'left';
    serif(PORT ? 34 : 26); const dw = ctx.measureText(NODE_INFO[n.lab] || '').width;
    font(PORT ? 52 : 38); const pw = Math.max(dw, ctx.measureText(n.lab).width) + 44, ph = PORT ? 150 : 112;
    ctx.fillStyle = 'rgba(7,7,10,.74)';
    ctx.beginPath(); (ctx.roundRect ? ctx.roundRect(left ? tx - pw + 22 : tx - 22, y - (PORT ? 72 : 58), pw, ph, 14) : ctx.rect(left ? tx - pw + 22 : tx - 22, y - (PORT ? 72 : 58), pw, ph)); ctx.fill();
    mono(PORT ? 22 : 14, 700); ctx.fillStyle = C.lime; ctx.fillText(`L${n.li} · ${SH.LAYERS[n.li].n}`, tx, y - 34);
    font(PORT ? 52 : 38); ctx.fillStyle = C.ink; ctx.fillText(n.lab, tx, y + 4);
    serif(PORT ? 34 : 26); ctx.fillStyle = 'rgba(243,240,232,.8)'; ctx.fillText(NODE_INFO[n.lab] || '', tx, y + (PORT ? 48 : 36));
    ctx.globalAlpha = 1;
  }

  /* st: { cur, prev, since, clock, now, dt, mouse (NDC), look, ui, flash, gate, still, cursor, dir }
   * Returns { sounds: [[kind, amount]] }. */
  function renderHome(st) {
    layout();
    NOW = st.now || NOW;
    const c = st.clock, dt = Math.min(0.05, st.dt || 0.016);
    if (!st.gate && st.cur !== SEC) { SEC = st.cur; ENTER = NOW; enterSection(SEC); }
    if (!st.gate) { step(SEC, dt); stepOrbit(dt); }
    [MXV, MYV] = [(st.mouse[0] * 0.5 + 0.5) * W, (0.5 - st.mouse[1] * 0.5) * H];

    const A = st.gate ? GATE : HOME[st.prev], B = st.gate ? GATE : HOME[st.cur];
    const e = E.inOutCubic(P(st.since, 0, 1.4)), arc = Math.sin(Math.PI * e);
    const swoop = st.still ? 0 : arc, lk = st.look || [0, 0];
    const ob = st.gate ? [0, 0] : [OB.yaw, OB.pitch];
    const yaw = lerp(A.yaw, B.yaw, e) + (st.still ? 0 : lk[0] * 0.08) + swoop * 0.7 * (st.dir || 1) + ob[0];
    const pitch = clamp(lerp(A.pitch, B.pitch, e) + lk[1] * 0.04 + swoop * 0.12 + ob[1], -0.35, 1.25);
    const tgt = L3(A.target, B.target, e);
    const shift = st.gate ? [0, 0] : PORT ? [0, 0.22 + 0.14 * st.ui] : [0.3 * st.ui, 0.02 * st.ui];
    const f = base(c);
    const pz = PORT && !st.gate ? lerp(A.mark ? 0.72 : 1, B.mark ? 0.72 : 1, e) : 1;
    camera(f, orbit(yaw, pitch, lerp(A.dist, B.dist, e) * pz * (1 + swoop * 0.15), tgt), tgt, lerp(A.fov, B.fov, e), 0, shift);
    f.aperture = 0.01; // keep what you can click in focus

    // the signature settles from the film's sway to still, so it can be traced
    const settle = 1 - P(c, 3, 5.5);
    const signHome = M4.mul(M4.mul(M4.t(0, 1.05, 0), M4.ry(signSway(c) * settle)), M4.s(0.8 * 1.04));
    const form = (h) => (h.shape === I.SIGN ? signHome : h.shape === I.GLOBE ? cloudM() : h.shape === I.DUST ? M4.ry(c * 0.03) : M4.id());
    Object.assign(f.particles, { a: A.shape, b: B.shape, ma: form(A), mb: form(B), mix: P(st.since, 0, 1.4), spread: 0.8, turb: 1.4, burst: st.still ? 0 : 0.5, gain: lerp(A.gain, B.gain, e) });

    // section effects on the current formation
    const hot = new Float32Array(24), ok = new Float32Array(24);
    if (!st.gate && B.id === 'xyphuz' && TR.on) {
      const u = NOW - TR.unwrite;
      if (u < 0.55) Object.assign(f.particles, { a: I.SIGN, ma: signHome, b: I.DUST, mb: M4.ry(c * 0.03), mix: P(u, 0, 0.5), turb: 1.6, gain: lerp(0.16, 0.9, P(u, 0, 0.4)) });
      else Object.assign(f.particles, { a: I.DUST, ma: M4.ry(c * 0.03), b: I.SIGN, mb: M4.mul(SIGN_STILL, M4.s(1.04)), signMode: 1, signT: traceT(), turb: 0.4, gain: lerp(0.9, 0.22, P(traceT(), 0.3, 3.2)) * (TR.s >= 2 ? lerp(1, 0.73, P(NOW - TR.done, 0, 1)) : 1) });
      if (TR.s < 2 && u > 0.4) { const nw = nibWorld(); f.sprites = [[nw[0], nw[1], nw[2] + 0.15, 0.5, LIME[0] * 3, LIME[1] * 3, LIME[2] * 3, TR.active ? 1 : 0.6]]; }
    }
    if (B.id === 'engineer') {
      if (BG.id >= 0) hot[BG.id] = 1;
      if (BG.badId >= 0) hot[BG.badId] = Math.max(hot[BG.badId], 0.6 * (1 - P(NOW - BG.badAt, 0, 0.5)));
      if (BG.okId >= 0) ok[BG.okId] = 1 - P(NOW - BG.okAt, 0, 1.2);
    }
    if (B.id === 'architect') {
      for (let i = 0; i < 12; i++) hot[i] = LD.heat[i];
      if (LD.okId >= 0) ok[LD.okId] = 1 - P(NOW - LD.okAt, 0, 1.2);
    }
    if (B.id === 'enterprise') {
      FB.state.forEach((s, i) => { if (s === 1) hot[i] = 0.5 + 0.5 * P(NOW - FB.idleAt[i], 0, 6); });
      if (FB.okId >= 0) ok[FB.okId] = 1 - P(NOW - FB.okAt, 0, 1);
      f.particles.scan = -5;
      // lots in flight: a carrier drops from the overhead track onto the tool
      f.sprites = FB.carriers.map((cr) => {
        const tp = SH.TOOLS[cr.tool], u = E.inOutCubic(P(NOW - cr.t0, 0, 0.75));
        const from = [clamp(tp[0], -6.6, 6.6), 1.95, tp[2] < 0 ? -4.6 : 4.6];
        return [lerp(from[0], tp[0], u), lerp(from[1], tp[1] + 0.2, u) + Math.sin(Math.PI * u) * 1.2, lerp(from[2], tp[2], u), 0.45, LIME[0] * 3, LIME[1] * 3, LIME[2] * 3, 1];
      });
    }
    if (A.shape === I.FAB) f.particles.scan = -5;
    const fail = CL.fail >= 0 ? P(NOW - CL.failAt, 0, 0.2) * (1 - P(NOW - CL.failAt, 3.4, 3.9)) : 0;
    if (B.shape === I.GLOBE || A.shape === I.GLOBE) Object.assign(f.particles, { fail, failId: CL.fail });
    f.particles.hot = hot; f.particles.ok = ok;

    const markOn = B.mark && !(TR.on && TR.s < 2);
    const markA = (A.mark ? 1 - P(st.since, 0, 0.5) : 0) + (B.mark ? P(st.since, 0.6, 1.4) : 0);
    let ma = A.mark && B.mark ? 1 : markA;
    if (B.id === 'xyphuz' && TR.on) ma = TR.s >= 2 ? E.outCubic(P(NOW - TR.done, 0.4, 1.3)) : 1 - P(NOW - TR.unwrite, 0, 0.3);
    if (markA > 0.001 && !st.gate && (markOn || ma > 0.001)) {
      f.mark = signMark(c, Math.min(1, ma));
      f.mark.rot = M4.m3(M4.ry(signSway(c) * settle));
    }
    f.bg.cone = (A.mark ? 1 - e : 0) * 0.7 + (B.mark ? e : 0) * 0.7; f.bg.coneCol = [0.2, 0.24, 0.13];
    f.bg.stars = 0.4;
    f.post.flash = Math.max(st.flash || 0, B.id === 'xyphuz' && TR.s >= 2 ? 0.25 * Math.pow(1 - P(NOW - TR.done, 0, 0.5), 2) : 0);
    f.post.ca = 1 + swoop * 3;
    submit(f);

    if (st.gate) return { sounds: flush() };
    const settled = P(st.since, 1.2, 1.8) * st.ui;
    LASTEYE = settled > 0.5 ? f.eye : null;
    HOVER = settled > 0.5 && !(PD && PD.mode === 'orbit') ? hitTest(SEC, f.eye) : null;
    let hint = '';

    if (B.id === 'xyphuz' && settled > 0) {
      if (!TR.on || TR.s >= 2 || !TR.active) {
        // where to put the pen next
        const p = project(TR.on && TR.s < 2 ? nibWorld() : traceTarget());
        const pulse = 0.5 + 0.5 * Math.sin(NOW * 5);
        ctx.globalAlpha = settled * (TR.s >= 2 ? P(NOW - TR.done, 2.5, 3.2) : 1);
        ctx.strokeStyle = C.lime; ctx.lineWidth = 2; dot(p[0], p[1], 14 + pulse * 10); ctx.stroke();
        ctx.fillStyle = C.lime; dot(p[0], p[1], 5); ctx.fill();
        mono(PORT ? 22 : 13, 700); ctx.textAlign = 'left';
        ctx.fillText(!TR.on || TR.s >= 2 ? (TR.s >= 2 ? 'SIGN AGAIN' : 'START HERE') : TR.k ? 'CONTINUE' : 'STROKE TWO', p[0] + 30, p[1] + 5);
        ctx.globalAlpha = 1;
      }
      if (TR.on && TR.s < 2) {
        // a faint dotted guide along the rest of the stroke
        const pts = tracePts()[TR.s];
        ctx.fillStyle = 'rgba(212,255,58,.45)';
        for (let i = TR.k + 3; i < pts.length; i += 3) { const q = project(pts[i]); dot(q[0], q[1], PORT ? 3 : 2); ctx.fill(); }
      }
      if (TR.s >= 2) {
        const a = P(NOW - TR.done, 0.6, 1.2) * (1 - P(NOW - TR.done, 4.5, 5.2));
        if (a > 0) {
          ctx.globalAlpha = a; fit(serif, 46, 'Signed — in the order I write it.', W * 0.5);
          ctx.fillStyle = C.ink; ctx.textAlign = 'center';
          const q = project([0, -1.3, 0]); ctx.fillText('Signed — in the order I write it.', q[0], q[1] + 40); ctx.globalAlpha = 1;
        }
      }
      hint = TR.active ? 'follow the line' : HOVER ? 'drag to sign' : TR.on && TR.s < 2 ? 'pick up where you left off' : 'sign it — start at the dot';
      drawLog('');
    }
    if (B.id === 'engineer' && settled > 0) {
      if (BG.id >= 0) badge(SH.LETTERS[BG.id].p, `BUG · ${(7 - (NOW - BG.at)).toFixed(1)} s`, C.coral);
      const mttr = BG.ttf.length ? (BG.ttf.reduce((a, b) => a + b, 0) / BG.ttf.length).toFixed(1) + ' s' : '—';
      drawLog(`FIXED ${BG.fixed} · ESCAPED ${BG.escaped} · MEAN TIME TO FIX ${mttr}`);
      hint = HOVER ? (HOVER.i === BG.id ? 'click to fix' : 'not this one') : BG.id >= 0 ? 'find the glitching letter' : 'tests green — wait for it';
    }
    if (B.id === 'architect' && settled > 0) {
      const mx = Math.max(...LD.heat);
      SH.NODES.forEach((n, i) => {
        const h = LD.heat[i] > 0.3;
        pin(n.p, LD.scale[i] > 1 ? `${n.lab} ×${LD.scale[i]}` : n.lab, settled * (h ? 1 : 0.55 + 0.4 * hash(i, 9)), h ? C.coral : LD.scale[i] > 1 ? C.lime : C.ink);
      });
      LD.hot.forEach((x) => badge(SH.NODES[x.id].p, `SATURATED · ${Math.round(LD.heat[x.id] * 100)}%`, C.coral));
      if (LD.sel >= 0) nodeCard(LD.sel, settled);
      drawLog(`${Math.round(LD.rps / 100) / 10}k req/s · p99 ${Math.round(38 + mx * 820)} ms · errors ${(mx * 3.8).toFixed(1)}%`);
      hint = HOVER ? (LD.hot.some((x) => x.id === HOVER.i) ? 'click to scale out' : 'click for details') : LD.hot.length ? 'click the hot service' : 'traffic rising…';
    }
    if (B.id === 'enterprise' && settled > 0) {
      FB.state.forEach((s, i) => { if (s === 1) badge(SH.TOOLS[i], `EQ-${pad(i + 1)} IDLE ${(NOW - FB.idleAt[i]).toFixed(1)} s`, NOW - FB.idleAt[i] > 3 ? C.coral : C.yellow); });
      const util = 100 * (1 - FB.state.filter((s) => s === 1).length / 24);
      drawLog(`UTILIZATION ${util.toFixed(0)}% · DISPATCHED ${FB.done} · AVG IDLE ${FB.done ? (FB.idleSum / FB.done).toFixed(1) : '—'} s`);
      hint = HOVER ? (FB.state[HOVER.i] === 1 ? 'click to dispatch a lot' : 'running') : 'dispatch the idle tools';
    }
    if (B.id === 'cloud' && settled > 0) {
      const m = cloudM();
      regionPins(m, f.eye, settled, 0);
      const pts = targets(4).map((p) => (dot3(norm(p), norm(sub(f.eye, p))) > 0.15 ? project(p) : null));
      if (fail > 0.5 && pts[CL.fail]) { const q = pts[CL.fail]; mono(PORT ? 22 : 14, 700); ctx.fillStyle = C.coral; ctx.textAlign = 'left'; ctx.fillText('✗ DOWN', q[0] + 26, q[1] + 22); }
      if (CL.fail >= 0 && NOW - CL.failAt < 6.2) failLog(CL.fail, NOW - CL.failAt);
      hint = HOVER ? `click to take region-${HOVER.i + 1} down` : PD && PD.mode === 'spin' ? 'let go to fling' : 'spin the planet · click a region';
    }

    if (PD && PD.mode === 'orbit') hint = 'orbiting';
    corners(0.6 * st.ui);
    const drawn = !!(st.cursor && st.ui > 0.5 && hint);
    if (drawn) {
      const live = HOVER || (PD && PD.mode !== 'click');
      const r = PD ? 20 : 14 + (HOVER ? 8 : 0);
      ctx.strokeStyle = live ? C.lime : 'rgba(243,240,232,.85)'; ctx.lineWidth = 2;
      dot(MXV, MYV, r); ctx.stroke();
      ctx.fillStyle = C.lime; dot(MXV, MYV, 3); ctx.fill();
      mono(13, 700); ctx.fillStyle = live ? C.lime : 'rgba(243,240,232,.8)'; ctx.textAlign = 'left';
      ctx.fillText(hint.toUpperCase(), MXV + r + 12, MYV + 4);
    }
    return { sounds: flush(), hover: !!HOVER, cursor: drawn };
  }

  function failLog(id, age) {
    const lines = [
      [0, `✗ region-${id + 1} unreachable`, C.coral],
      [0.35, '↻ rerouting traffic to healthy regions', C.ink],
      [0.8, '✓ p99 holding · error budget intact', C.dim],
      [3.5, `✓ region-${id + 1} recovered · zero downtime`, C.lime],
    ];
    const x = PORT ? M : W - M - 470, y0 = PORT ? TOP + 40 : H - 300;
    mono(PORT ? 24 : 15, 600); ctx.textAlign = 'left';
    lines.forEach(([tt, str, col], k) => {
      if (age < tt) return;
      ctx.globalAlpha = 1 - P(age, 5.6, 6.2);
      ctx.fillStyle = col; ctx.fillText(str.slice(0, Math.ceil(P(age, tt, tt + 0.25) * str.length)), x, y0 + k * (PORT ? 40 : 28));
    });
    ctx.globalAlpha = 1;
  }

  async function ready() {
    const fonts = [`700 100px ${FD}`, `500 20px ${FM}`, `400 20px ${FM}`, `700 20px ${FM}`, `italic 400 40px ${FS}`];
    try { await Promise.race([Promise.all(fonts.map((x) => document.fonts.load(x))), new Promise((r) => setTimeout(r, 3500))]); } catch (e) { /* system fonts */ }
    if (!glOK) return;
    EN.setMesh(MK.buildMesh());
    EN.setShapes(SH.build());
  }

  window.Reel = {
    DUR,
    SCENES: SCENES.map(({ s, e, id, name }) => ({ s, e, id, name })),
    HOME: HOME.map((h) => h.id),
    get gl() { return glOK; },
    create(glCanvas, overlay) {
      glc = glCanvas; ov = overlay; ctx = ov.getContext('2d');
      glOK = EN.init(glc);
      return { render, renderHome, ready, pointerDown, pointerMove, pointerUp, get debug() {
        // screen (CSS px) helpers for automated checks
        const css = (q) => [(q[0] * SCALE * window.innerWidth) / ov.width, (q[1] * SCALE * window.innerWidth) / ov.width];
        return { TR, BG, LD, FB, CL, OB, HOVER, eye: LASTEYE, guide: (k) => tracePts()[k].map((p) => css(project(p))), at: (p) => css(project(p)) };
      } };
    },
  };
})();
