/* XYPHUZ — Showreel 2026
 * A 30-second motion piece rendered live on <canvas> (+ WebGL for the 3D mark).
 * Every frame is a pure function of time t ∈ [0, 30), so the reel can be
 * scrubbed, paused and looped without any hidden state.
 *
 * It's built as one continuous shot — each scene hands off to the next through
 * a match cut: pen → 3D mark → cursor → code → particles → system → packet →
 * ball → app icon → wall of screens → type tunnel → mark.
 */
(function () {
  'use strict';

  const W = 1920, H = 1080, DUR = 30, TAU = Math.PI * 2;
  const M = window.Mark3D;

  const C = {
    bg: '#07070a', ink: '#f3f0e8', dim: '#7c7a88', line: '#26262f', panel: '#0f0f15',
    lime: '#d4ff3a', coral: '#ff4d2e', blue: '#6f8cff', violet: '#a77bff', yellow: '#ffd23a',
  };
  const PAL = [C.lime, C.coral, C.blue, C.violet, C.yellow];
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
    inOutExpo: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
    inCubic: (x) => x * x * x,
    outCubic: (x) => 1 - Math.pow(1 - x, 3),
    inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    outBack: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    outBounce: (x) => {
      const n = 7.5625, d = 2.75;
      if (x < 1 / d) return n * x * x;
      if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
      if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
      return n * (x -= 2.625 / d) * x + 0.984375;
    },
  };
  function hash(a, b = 0) {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const spike = (t, times, k) => times.reduce((m, ti) => (t >= ti ? Math.max(m, Math.exp(-(t - ti) * k)) : m), 0);
  function mixHex(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(lerp(pa >> 16, pb >> 16, t)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t)), bl = Math.round(lerp(pa & 255, pb & 255, t));
    return `rgb(${r},${g},${bl})`;
  }

  /* ---------- drawing helpers ---------- */
  let ctx, canvas, grain, layerCv, layerCtx;
  const font = (px, w = 700) => (ctx.font = `${w} ${px}px ${FD}`);
  const mono = (px, w = 400) => (ctx.font = `${w} ${px}px ${FM}`);
  const serif = (px) => (ctx.font = `italic 400 ${px}px ${FS}`);

  function rrect(x, y, w, h, r, c = ctx) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function dot(x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); }

  function reveal(str, x, y, size, p, align = 'left') {
    if (p <= 0) return;
    const w = ctx.measureText(str).width;
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.save();
    ctx.beginPath(); ctx.rect(x0 - 40, y - size * 1.0, w + 80, size * 1.25); ctx.clip();
    ctx.textAlign = align;
    ctx.fillText(str, x, y + (1 - p) * size * 1.2);
    ctx.restore();
  }
  function glyphs(str, track) {
    const g = []; let x = 0;
    for (const ch of str) { const w = ctx.measureText(ch).width; g.push({ ch, x, w }); x += w + track; }
    return { g, w: x - track };
  }
  const GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+/<>=_';
  function decode(str, p, t) {
    const n = str.length, k = p * (n + 8);
    let o = '';
    for (let i = 0; i < n; i++) {
      const ch = str[i];
      if (ch === ' ' || i < k - 8) o += i < k ? ch : ' ';
      else if (i < k) o += GL[Math.floor(hash(i, Math.floor(t * 30)) * GL.length)];
      else o += ' ';
    }
    return o;
  }
  function label(str, x, y, align = 'left', col = C.lime) {
    mono(18, 700); ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(str, x, y);
  }

  // A full-resolution scratch layer, for masking effects.
  function layer() {
    if (!layerCv) { layerCv = document.createElement('canvas'); layerCtx = layerCv.getContext('2d'); }
    if (layerCv.width !== canvas.width || layerCv.height !== canvas.height) { layerCv.width = canvas.width; layerCv.height = canvas.height; }
    layerCtx.setTransform(1, 0, 0, 1, 0, 0);
    layerCtx.globalCompositeOperation = 'source-over';
    layerCtx.clearRect(0, 0, layerCv.width, layerCv.height);
    return layerCtx;
  }
  function flushLayer(alpha = 1) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.drawImage(layerCv, 0, 0); ctx.restore();
  }

  /* ---------- the signature mark ---------- */
  function glyphXf(c, cx, cy, S) { c.translate(cx, cy); c.scale(S / M.HALF, S / M.HALF); c.translate(-M.CX, -M.CY); }
  const toScreen = (p, cx, cy, S) => [cx + ((p[0] - M.CX) * S) / M.HALF, cy + ((p[1] - M.CY) * S) / M.HALF];

  // Draw the 3D mark (and optional contour field) through WebGL, composited in place.
  function drawMark(o) {
    if (M.ok) {
      const q = Math.min(1, 1600 / canvas.width);
      M.begin(Math.round(canvas.width * q), Math.round(canvas.height * q));
      if (o.contour) M.contour(o.contour);
      M.mark(o);
      ctx.drawImage(M.canvas, 0, 0, W, H);
      return;
    }
    // 2D fallback: stacked-slice extrusion
    const sx = Math.cos(o.ry || 0), dx = Math.sin(o.ry || 0);
    ctx.save(); ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    for (let k = 12; k >= 0; k--) {
      ctx.save(); ctx.translate(o.cx + dx * k * o.thick * o.scale * 0.15, o.cy); ctx.scale(Math.max(0.02, Math.abs(sx)), 1);
      glyphXf(ctx, 0, 0, o.scale); ctx.fillStyle = k ? mixHex('#1a1a20', '#3a3a44', k / 12) : C.lime; ctx.fill(M.path); ctx.restore();
    }
    ctx.restore();
  }

  /* ---------- precomputed assets ---------- */
  const COLS = 145, ROWS = 45, CW = 13.2, LH = 24, X0 = 3;
  let GRID = null;
  const PARTS = [];

  function prepGrid() {
    const snippets = [
      'const scene = timeline.at(t);', 'for (const layer of scene.layers) layer.draw(ctx);', 'return ship(build(test(code)));',
      'await db.tx(async (q) => q.insert(users, row));', 'type Result<T> = { ok: true; value: T } | { ok: false; error: E };',
      'const ease = cubicBezier(.16, 1, .3, 1);', 'if (!cache.has(key)) cache.set(key, await fetch(url));',
      'queue.publish("orders.created", { id, total });', 'fn main() -> Result<(), Box<dyn Error>> {', 'impl Render for Scene { fn draw(&self) {} }',
      'go func() { for msg := range ch { handle(msg) } }()', 'SELECT id, name FROM users WHERE active = true;',
      'kubectl rollout status deploy/api --timeout=60s', 'useEffect(() => spring.start({ y: 0 }), [open]);',
      'const p99 = histogram.quantile(0.99);', 'git commit -m "feat: make it feel alive"', 'while (alive) { learn(); build(); ship(); }',
      'export const router = new Router({ routes, prefetch: true });', 'let v = lerp(a, b, spring(t, 260, 20));',
    ];
    let s = 'export function render(t: number) {  const scene = timeline.at(t);  ';
    for (let i = 0; s.length < COLS * ROWS + 50; i++) s += snippets[Math.floor(hash(i, 90) * snippets.length)] + '  ';

    const oc = document.createElement('canvas'); oc.width = W; oc.height = H;
    const o = oc.getContext('2d');
    o.fillStyle = '#fff'; o.textAlign = 'center';
    o.font = `700 400px ${FD}`;
    const size = Math.min(380, (400 * 1720) / Math.max(o.measureText('SOFTWARE').width, o.measureText('ENGINEER').width));
    o.font = `700 ${size}px ${FD}`;
    o.fillText('SOFTWARE', 960, 540 - 40);
    o.fillText('ENGINEER', 960, 540 + size * 0.72 + 30);
    const d = o.getImageData(0, 0, W, H).data;

    const rowsIn = [], rowsOut = [], runs = [], cells = [];
    for (let r = 0; r < ROWS; r++) {
      let a = '', b = '';
      const rr = [];
      for (let c = 0; c < COLS; c++) {
        const ch = s[r * COLS + c];
        const x = Math.round(X0 + c * CW + CW / 2), y = Math.round(r * LH + 12);
        const inside = d[(y * W + x) * 4 + 3] > 128;
        a += inside ? ch : ' '; b += inside ? ' ' : ch;
        if (inside) { const last = rr[rr.length - 1]; if (last && last[1] === c) last[1] = c + 1; else rr.push([c, c + 1]); }
        if (inside && ch !== ' ') cells.push([X0 + c * CW + CW / 2, r * LH + 12]);
      }
      rowsIn.push(a); rowsOut.push(b); runs.push(rr);
    }
    GRID = { rowsIn, rowsOut, runs };
    PARTS.length = 0;
    for (let i = 0; i < 320; i++) {
      const c = cells[Math.floor(hash(i, 91) * cells.length)];
      PARTS.push({ x: c[0], y: c[1], node: i % 12, d: hash(i, 92) * 0.3, jx: (hash(i, 93) - 0.5) * 30, jy: (hash(i, 94) - 0.5) * 18 });
    }
  }

  function prepGrain() {
    grain = document.createElement('canvas'); grain.width = grain.height = 256;
    const g = grain.getContext('2d'), img = g.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) {
      const v = Math.random() < 0.5 ? 0 : 255;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = Math.random() * 255;
    }
    g.putImageData(img, 0, 0);
  }

  /* ================================================================
   * 00 — SIGNATURE: the pen writes the mark, camera riding the nib
   * ================================================================ */
  const STROKE_T = [[0.3, 1.75], [1.88, 2.72], [2.84, 3.12]];
  const SIGN_S = 380;
  function penAt(lt) {
    const S = M.STROKES;
    for (let i = STROKE_T.length - 1; i >= 0; i--) {
      const [a, b] = STROKE_T[i];
      if (lt >= a) return { p: M.pointAt(S[i], smooth(P(lt, a, b))), down: lt < b, i };
      if (i > 0 && lt >= STROKE_T[i - 1][1]) {
        const from = S[i - 1].pts[S[i - 1].pts.length - 1], to = S[i].pts[0];
        const u = smooth(P(lt, STROKE_T[i - 1][1], a));
        return { p: [lerp(from[0], to[0], u), lerp(from[1], to[1], u)], down: false, i };
      }
    }
    return { p: S[0].pts[0], down: false, i: -1 };
  }
  function signCam(lt) {
    let fx = 0, fy = 0;
    for (let k = 0; k < 5; k++) {
      const q = toScreen(penAt(Math.max(0, lt - k * 0.06)).p, 960, 540, SIGN_S);
      fx += q[0] / 5; fy += q[1] / 5;
    }
    const e = E.inOutCubic(P(lt, 1.6, 3.4));
    return { z: lerp(3.1, 1, e) * (1 + 0.08 * (1 - E.outCubic(P(lt, 0, 1)))), x: lerp(fx, 960, e), y: lerp(fy, 540, e) };
  }

  function sSign(lt, t) {
    const cam = signCam(lt);
    const S = SIGN_S * (1 - 0.035 * E.inOutCubic(P(lt, 3.35, 3.95))); // anticipation before the hit
    const gA = 1 - P(lt, 3.4, 3.9);

    ctx.save();
    ctx.translate(960, 540); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);

    // calligraphy practice sheet
    ctx.globalAlpha = gA;
    ctx.strokeStyle = 'rgba(243,240,232,.07)'; ctx.lineWidth = 1.4 / cam.z;
    ctx.beginPath();
    for (let y = -456; y < 1600; y += 76) { ctx.moveTo(-800, y); ctx.lineTo(2700, y); }
    for (let x = -1600; x < 2800; x += 114) { ctx.moveTo(x, -500); ctx.lineTo(x + 760, 1600); }
    ctx.stroke();
    const top = toScreen([0, 30], 960, 540, S)[1], base = toScreen([0, 656], 960, 540, S)[1];
    ctx.strokeStyle = 'rgba(212,255,58,.22)'; ctx.setLineDash([10 / cam.z, 10 / cam.z]);
    ctx.beginPath(); ctx.moveTo(-800, top); ctx.lineTo(2700, top); ctx.moveTo(-800, base); ctx.lineTo(2700, base); ctx.stroke();
    ctx.setLineDash([]);
    mono(13, 700); ctx.fillStyle = 'rgba(212,255,58,.45)'; ctx.textAlign = 'left';
    ctx.fillText('ASCENDER', 560, top - 8); ctx.fillText('DESCENDER', 560, base - 8);
    ctx.globalAlpha = 1;

    // ink — the real glyph, revealed through a mask of the pen's path
    const L = layer();
    L.setTransform(ctx.getTransform());
    glyphXf(L, 960, 540, S);
    L.lineCap = L.lineJoin = 'round'; L.lineWidth = 78; L.strokeStyle = '#fff';
    M.STROKES.forEach((s, i) => {
      const u = smooth(P(lt, STROKE_T[i][0], STROKE_T[i][1]));
      if (u > 0) { L.beginPath(); M.tracePartial(L, s, u); L.stroke(); }
    });
    L.globalCompositeOperation = 'source-in'; L.fillStyle = C.lime; L.fill(M.path);
    flushLayer();

    // sparks shed by the nib
    ctx.fillStyle = C.lime;
    STROKE_T.forEach(([a, b], i) => {
      for (let k = 0; k <= 40; k++) {
        const tau = a + ((b - a) * k) / 40, age = lt - tau;
        if (age < 0 || age > 0.8) continue;
        const p = toScreen(M.pointAt(M.STROKES[i], smooth((tau - a) / (b - a))), 960, 540, S);
        const vx = (hash(k, i * 7) - 0.5) * 220, vy = -30 - hash(k, i * 7 + 1) * 140;
        ctx.globalAlpha = (1 - age / 0.8) * 0.9;
        const sz = 2.6 * (1 - age / 0.8) + 0.6;
        ctx.fillRect(p[0] + vx * age, p[1] + vy * age + 260 * age * age, sz, sz);
      }
    });
    ctx.globalAlpha = 1;

    const tip = penAt(lt);
    const tp = toScreen(tip.p, 960, 540, S);
    if (tip.down) {
      ctx.fillStyle = C.lime;
      ctx.globalAlpha = 0.18; dot(tp[0], tp[1], 30); ctx.fill();
      ctx.globalAlpha = 0.45; dot(tp[0], tp[1], 13); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; dot(tp[0], tp[1], 4.5); ctx.fill();
    }
    ctx.restore();

    // screen-space instrumentation that rides the nib
    const ia = clamp((cam.z - 1.15) / 1.2) * (tip.i >= 0 ? 1 : P(lt, 0, 0.3));
    if (ia > 0) {
      const sx = 960 + (tp[0] - cam.x) * cam.z, sy = 540 + (tp[1] - cam.y) * cam.z;
      ctx.globalAlpha = ia;
      ctx.strokeStyle = 'rgba(243,240,232,.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke();
      ctx.strokeStyle = C.lime; ctx.lineWidth = 2; ctx.strokeRect(sx - 16, sy - 16, 32, 32);
      mono(15, 500); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
      ctx.fillText(`x ${tip.p[0].toFixed(1)}   y ${tip.p[1].toFixed(1)}`, sx + 30, sy - 30);
      const pr = tip.down ? 0.62 + 0.3 * Math.sin(lt * 11) * Math.sin(lt * 3.7) : 0;
      ctx.fillStyle = 'rgba(243,240,232,.2)'; ctx.fillRect(sx + 30, sy - 20, 120, 4);
      ctx.fillStyle = C.lime; ctx.fillRect(sx + 30, sy - 20, 120 * pr, 4);
      ctx.fillStyle = C.dim; ctx.fillText(`pressure ${pr.toFixed(2)}   stroke ${Math.max(1, tip.i + 1)}/3`, sx + 30, sy + 4);
      ctx.globalAlpha = 1;
    }

    ctx.globalAlpha = P(lt, 0.1, 0.5) * gA; label('[ 00 ]  SIGNATURE', 960, 150, 'center');
    ctx.globalAlpha = E.outCubic(P(lt, 1.0, 1.6)) * (1 - P(lt, 3.3, 3.7));
    serif(48); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.fillText('Every system starts as a sketch.', 960, 975);
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 01 — IDENTITY: the ink inflates into a real 3D object
   * ================================================================ */
  function sIdentity(lt, t) {
    const mv = E.inOutCubic(P(lt, 0.35, 1.4));
    const ex = E.inOutCubic(P(lt, 3.1, 3.85));
    const shrink = E.inOutExpo(P(lt, 3.2, 3.88));
    const cx = lerp(lerp(960, 620, mv), 960, ex);
    const S = lerp(lerp(SIGN_S, 320, mv), 22, shrink);
    const pop = E.outBack(P(lt, 0, 0.55));
    let ry = -0.55 * E.outCubic(P(lt, 0, 1.3)) + 0.9 * E.inOutCubic(P(lt, 1.3, 3.1));
    ry = lerp(ry, Math.PI / 2, ex);
    drawMark({
      cx, cy: 540, scale: S, rx: 0.14 * Math.sin(lt * 1.3) * (1 - ex), ry, rz: 0,
      thick: 0.13 * pop, emit: 1 - E.outCubic(P(lt, 0.05, 0.55)), sweep: lerp(-1.3, 1.5, P(lt, 0.15, 2.8)),
      alpha: 1 - P(lt, 3.85, 3.95),
      contour: { cx, cy: 540, scale: S, time: lt * 1.4, alpha: 0.6 * (1 - P(lt, 2.8, 3.3)), reach: E.outCubic(P(lt, 0, 2.2)) * 7 },
    });

    // the edge-on sliver becomes a text cursor
    const cu = P(lt, 3.72, 3.92);
    if (cu > 0) {
      const w = lerp(6, CW * 3.1, E.outCubic(cu)), h = lerp(44, 22 * 3.1, E.outCubic(cu));
      ctx.globalAlpha = cu; ctx.fillStyle = C.lime; ctx.fillRect(960 - w / 2, 540 - h / 2, w, h); ctx.globalAlpha = 1;
    }

    const wa = 1 - P(lt, 2.95, 3.3);
    if (wa <= 0) return;
    const x0 = 930;
    ctx.globalAlpha = P(lt, 0.5, 0.9) * wa; label('[ 01 ]  HSING-HAN WU, A.K.A.', x0, 405);
    ctx.globalAlpha = 1;
    font(200); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    const { g } = glyphs('XYPHUZ', 8);
    g.forEach((c, i) => {
      const s = E.outBack(P(lt, 0.5 + i * 0.06, 0.95 + i * 0.06)) * (1 - E.inCubic(P(lt, 2.9 + i * 0.03, 3.15 + i * 0.03)));
      if (s <= 0.001) return;
      ctx.save(); ctx.translate(x0 + c.x + c.w / 2, 540); ctx.scale(1, s);
      ctx.fillText(c.ch, -c.w / 2, 70); ctx.restore();
    });

    // "builds ___." slot machine, ticking on the beat
    const words = ['software.', 'systems.', 'motion.', 'products.'];
    const sw = [1.5, 2.0, 2.5];
    let idx = 0; sw.forEach((s) => { if (lt >= s) idx++; });
    const tr = idx ? E.outExpo(P(lt, sw[idx - 1], sw[idx - 1] + 0.32)) : 1;
    ctx.globalAlpha = E.outCubic(P(lt, 0.9, 1.3)) * wa;
    serif(56); ctx.fillStyle = C.ink;
    const pre = 'builds ';
    ctx.fillText(pre, x0, 705);
    const px = x0 + ctx.measureText(pre).width;
    font(54); ctx.fillStyle = C.lime;
    ctx.save(); ctx.beginPath(); ctx.rect(px - 10, 650, 700, 72); ctx.clip();
    if (idx > 0 && tr < 1) ctx.fillText(words[idx - 1], px, 705 - tr * 72);
    ctx.fillText(words[idx], px, 705 + (1 - tr) * 72);
    ctx.restore();
    ctx.globalAlpha = wa;
    mono(17, 500); ctx.fillStyle = C.dim;
    ctx.fillText(decode('ENGINEER · ARCHITECT · MOTION DESIGNER · PRODUCT BUILDER', P(lt, 1.0, 2.0), t), x0, 770);
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 02 — SOFTWARE ENGINEER: typing accelerates until the code itself
   * spells the words
   * ================================================================ */
  const N_CHARS = COLS * ROWS;
  function typed(lt) {
    if (lt < 1.1) return Math.max(0, Math.floor((lt - 0.12) * 21));
    return Math.min(N_CHARS, Math.floor(20 + (N_CHARS - 20) * Math.pow(P(lt, 1.1, 2.45), 2.6)));
  }
  function sEng(lt, t) {
    if (!GRID) return;
    const n = typed(lt);
    const row = Math.min(ROWS - 1, Math.floor(n / COLS)), col = n >= N_CHARS ? COLS : n % COLS;
    const curX = X0 + col * CW, curY = row * LH + 12;
    const e = E.inOutCubic(P(lt, 1.0, 2.4));
    const z = lerp(3.1, 1, e);
    const slowX = X0 + (typed(Math.min(lt, 1.1)) % COLS) * CW;
    const fx = lerp(slowX + CW / 2 - 80 * E.inOutCubic(P(lt, 0, 0.9)), 960, e), fy = lerp(curY, 540, e);

    ctx.save();
    ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-fx, -fy);
    if (z > 1.3) { ctx.fillStyle = 'rgba(212,255,58,.06)'; ctx.fillRect(0, row * LH, W, LH); }
    ctx.textAlign = 'left';
    const lit = P(lt, 1.2, 1.9);
    const pulse = spike(t, [10.5, 11.0, 11.5], 7) * P(lt, 2.4, 2.5);
    const inCol = mixHex('#8a8896', C.lime, lit);
    const outA = (1 - 0.6 * P(lt, 1.9, 2.5)) * (1 - 0.8 * P(lt, 3.1, 3.7));
    if (lit > 0) {
      ctx.fillStyle = `rgba(212,255,58,${0.1 * lit + 0.14 * pulse})`;
      for (let r = 0; r <= row; r++) {
        const len = r < row ? COLS : col;
        for (const [c0, c1] of GRID.runs[r]) if (c0 < len) ctx.fillRect(X0 + c0 * CW, r * LH, (Math.min(c1, len) - c0) * CW, LH);
      }
    }
    for (let r = 0; r <= row; r++) {
      const len = r < row ? COLS : col;
      const y = r * LH + 18;
      mono(22, 500); ctx.globalAlpha = outA; ctx.fillStyle = '#8a8896'; ctx.fillText(GRID.rowsOut[r].slice(0, len), X0, y);
      mono(22, lit > 0 ? 700 : 500); ctx.globalAlpha = 1; ctx.fillStyle = inCol; ctx.fillText(GRID.rowsIn[r].slice(0, len), X0, y);
    }
    if (n < N_CHARS || Math.floor(t * 4) % 2) { ctx.fillStyle = C.lime; ctx.fillRect(curX, row * LH + 1, CW, 22); }
    ctx.restore();

    const rate = ((typed(lt + 0.03) - typed(lt - 0.03)) / 0.06) * 12; // chars/s → words/min
    const ha = P(lt, 0.2, 0.5) * (1 - P(lt, 3.2, 3.5));
    if (ha > 0) {
      ctx.globalAlpha = ha;
      ctx.fillStyle = 'rgba(7,7,10,.8)'; ctx.fillRect(70, 112, 330, 74);
      mono(15, 700); ctx.fillStyle = C.lime; ctx.textAlign = 'left';
      ctx.fillText(`[ 02 ]  WPM ${Math.round(rate).toLocaleString('en-US')}`, 84, 140);
      ctx.fillStyle = C.dim; ctx.fillText(`${n.toLocaleString('en-US')} / ${N_CHARS.toLocaleString('en-US')} chars`, 84, 170);
      ctx.globalAlpha = 1;
    }
  }

  /* ================================================================
   * 03 — SOFTWARE ARCHITECT: the characters fly into a 3D system
   * ================================================================ */
  const LAY = [
    { y: 1.6, n: 'EDGE', nodes: [['CDN', -1.0, 0.5], ['WAF', 0.9, -0.5]] },
    { y: 0.8, n: 'GATEWAY', nodes: [['API Gateway', 0, 0]] },
    { y: 0, n: 'SERVICES', nodes: [['Users', -1.25, 0.45], ['Orders', 0, -0.85], ['Payments', 1.25, 0.3], ['Search', 0.1, 1.0]] },
    { y: -0.8, n: 'DATA', nodes: [['Postgres', -1.0, -0.4], ['Redis', 0.95, 0.6], ['S3', 0.45, -1.1]] },
    { y: -1.6, n: 'STREAM', nodes: [['Kafka', -0.5, 0], ['Workers', 1.0, -0.45]] },
  ];
  const NODES = [];
  LAY.forEach((l, li) => l.nodes.forEach(([lab, x, z]) => NODES.push({ lab, x, y: l.y, z, li })));
  const EDGES = [[0, 2], [1, 2], [2, 3], [2, 4], [2, 5], [2, 6], [3, 7], [3, 8], [4, 7], [4, 10], [5, 7], [5, 10], [6, 8], [6, 9], [7, 10], [10, 11]];
  const DIVE = 9; // the Orders → Kafka edge carries the packet we dive into

  function archCam(lt) {
    const yaw = -0.8 + lt * 0.2, pitch = 0.5;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    return (x, y, z) => {
      const X = x * cy - z * sy, Z = x * sy + z * cy;
      const Y2 = y * cp + Z * sp, Z2 = -y * sp + Z * cp + 8.5;
      const f = 1320 / Z2;
      return [960 + X * f, 420 - Y2 * f, f];
    };
  }
  const packetPos = (lt, e, k) => {
    const [a, b] = EDGES[e], u = fract(lt * 0.7 + k * 0.5 + hash(e, 33));
    const A = NODES[a], B = NODES[b];
    return [lerp(A.x, B.x, u), lerp(A.y, B.y, u), lerp(A.z, B.z, u)];
  };

  function sArch(lt, t) {
    const pr = archCam(lt);
    const dive = E.inExpo(P(lt, 3.3, 3.95));
    const pk = pr(...packetPos(lt, DIVE, 0));

    // the code letters linger for a beat, then dissolve into particles
    const ca = 1 - P(lt, 0, 0.3);
    if (ca > 0 && GRID) {
      mono(22, 500); ctx.textAlign = 'left'; ctx.fillStyle = C.lime; ctx.globalAlpha = ca * 0.85;
      for (let r = 0; r < ROWS; r++) ctx.fillText(GRID.rowsIn[r], X0, r * LH + 18);
      ctx.globalAlpha = 1;
    }

    ctx.save();
    if (dive > 0) { const z = 1 + dive * 40; ctx.translate(pk[0], pk[1]); ctx.scale(z, z); ctx.translate(-pk[0], -pk[1]); }
    ctx.globalAlpha = 1 - dive;

    // title lying on the ground plane, rotating with the camera
    const gp = E.outExpo(P(lt, 0.9, 1.7));
    if (gp > 0) {
      const o = pr(0, -2.4, 0.3), u = pr(1, -2.4, 0.3), v = pr(0, -2.4, -0.7);
      ctx.save();
      ctx.transform((u[0] - o[0]) / 100, (u[1] - o[1]) / 100, (v[0] - o[0]) / 100, (v[1] - o[1]) / 100, o[0], o[1]);
      font(130); ctx.textAlign = 'center';
      ctx.save(); ctx.beginPath(); ctx.rect(-1200, -150, 2400, 300); ctx.clip();
      ctx.fillStyle = 'rgba(243,240,232,.9)'; ctx.fillText('SOFTWARE', 0, -20 + (1 - gp) * 160);
      ctx.fillStyle = C.blue; ctx.fillText('ARCHITECT', 0, 115 + (1 - gp) * 160);
      ctx.restore();
      ctx.restore();
    }

    // layer planes
    for (let li = LAY.length - 1; li >= 0; li--) {
      const a = E.outCubic(P(lt, 0.3 + (4 - li) * 0.07, 0.75 + (4 - li) * 0.07));
      if (a <= 0) continue;
      const y = LAY[li].y, s = 1.95 * a, d = 1.55 * a;
      const q = [pr(-s, y, -d), pr(s, y, -d), pr(s, y, d), pr(-s, y, d)];
      ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
      ctx.fillStyle = 'rgba(111,140,255,.05)'; ctx.fill();
      ctx.strokeStyle = 'rgba(111,140,255,.38)'; ctx.lineWidth = 1.5; ctx.stroke();
      const lp = pr(-1.95, y, -1.55);
      mono(13, 700); ctx.fillStyle = 'rgba(111,140,255,.9)'; ctx.textAlign = 'left';
      ctx.fillText(`L${li}  ${LAY[li].n}`, lp[0] + 10, lp[1] - 8);
    }

    // edges + packets
    ctx.lineWidth = 1.6;
    EDGES.forEach(([a, b], ei) => {
      const A = NODES[a], B = NODES[b];
      const t0 = 1.0 + A.li * 0.13, p = E.inOutCubic(P(lt, t0, t0 + 0.4));
      if (p <= 0) return;
      const pa = pr(A.x, A.y, A.z), pb = pr(lerp(A.x, B.x, p), lerp(A.y, B.y, p), lerp(A.z, B.z, p));
      ctx.strokeStyle = 'rgba(243,240,232,.35)';
      ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
      if (p < 1) return;
      for (let k = 0; k < 2; k++) {
        if (ei === DIVE && k === 0 && dive > 0) continue;
        const col = (ei + k) % 3 === 0 ? C.coral : C.lime;
        for (let j = 4; j >= 0; j--) {
          const [x, y, z] = packetPos(lt - j * 0.025, ei, k), sp = pr(x, y, z);
          ctx.fillStyle = col; ctx.globalAlpha = (1 - dive) * (j ? 0.5 - j * 0.1 : 1);
          dot(sp[0], sp[1], ((j ? 3 : 4.5) * sp[2]) / 135); ctx.fill();
        }
        ctx.globalAlpha = 1 - dive;
      }
    });

    // particles from the code converge on their nodes
    ctx.fillStyle = C.lime;
    PARTS.forEach((p) => {
      const q = E.inOutCubic(P(lt, p.d, p.d + 0.6));
      if (q >= 1) return;
      const nd = NODES[p.node], np = pr(nd.x, nd.y, nd.z);
      const x = lerp(p.x, np[0] + p.jx * (1 - q), q), y = lerp(p.y, np[1] + p.jy * (1 - q), q) - Math.sin(q * Math.PI) * 120;
      ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
    });

    // nodes, far to near
    const order = NODES.map((n, i) => ({ i, p: pr(n.x, n.y, n.z) })).sort((a, b) => a.p[2] - b.p[2]);
    order.forEach(({ i, p }) => {
      const s = E.outBack(P(lt, 0.55 + hash(i, 40) * 0.25, 0.9 + hash(i, 40) * 0.25));
      if (s <= 0) return;
      const k = (p[2] / 150) * s;
      mono(15, 500);
      const w = ctx.measureText(NODES[i].lab).width + 38;
      ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(k, k);
      rrect(-w / 2, -17, w, 34, 9);
      ctx.fillStyle = '#0c0f1d'; ctx.fill();
      ctx.strokeStyle = i === 2 ? C.lime : 'rgba(111,140,255,.85)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = Math.floor(t * 3 + i) % 5 ? C.lime : 'rgba(212,255,58,.3)'; dot(-w / 2 + 14, 0, 4); ctx.fill();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(NODES[i].lab, -w / 2 + 25, 5);
      ctx.restore();
    });
    ctx.restore();
    ctx.globalAlpha = 1;

    ctx.globalAlpha = P(lt, 0.4, 0.8) * (1 - dive);
    label('[ 03 ]  SYSTEMS · 5 LAYERS · 12 SERVICES', 84, 150);
    ctx.globalAlpha = 1;

    // the packet we chase becomes the ball
    if (dive > 0) {
      const e = E.inOutCubic(P(lt, 3.3, 3.95));
      const x = lerp(pk[0], 960, e), y = lerp(pk[1], 540, e), r = lerp(4.5, 34, e);
      ctx.fillStyle = C.lime; ctx.globalAlpha = 0.25; dot(x, y, r * 2.2); ctx.fill();
      ctx.globalAlpha = 1; dot(x, y, r); ctx.fill();
    }
  }

  /* ================================================================
   * 04 — MOTION DESIGNER: animation principles, performed live
   * ================================================================ */
  const FLOOR = 790, BR = 34, TC = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
  let MLAY = null;
  function motionLayout() {
    if (MLAY) return MLAY;
    font(230);
    const { g, w } = glyphs('MOTION', 34);
    const cap = ctx.measureText('M').actualBoundingBoxAscent || 230 * 0.7;
    MLAY = g.map((c) => ({ ...c, cx: 960 - w / 2 + c.x + c.w / 2, top: FLOOR - cap }));
    return MLAY;
  }
  function hop(lt, ta, tb, A, B, h) {
    const dt = tb - ta, u = (lt - ta) / dt;
    return { x: lerp(A[0], B[0], u), y: lerp(A[1], B[1], u) - 4 * h * u * (1 - u), vx: (B[0] - A[0]) / dt, vy: (B[1] - A[1]) / dt - (4 * h * (1 - 2 * u)) / dt };
  }
  function ballAt(lt) {
    const L = motionLayout();
    const cp = (i) => [L[i].cx, L[i].top - BR];
    if (lt < TC[0]) return hop(Math.max(0, lt), 0, TC[0], [960, 540], cp(0), 130);
    for (let i = 0; i < TC.length - 1; i++) if (lt < TC[i + 1]) return hop(lt, TC[i], TC[i + 1], cp(i), cp(i + 1), 230);
    return hop(Math.min(lt, 3.5), 3.0, 3.5, cp(5), [1660, 430], 170);
  }

  function sMotion(lt, t) {
    const L = motionLayout();
    const fl = E.inOutCubic(P(lt, 0, 0.5));
    ctx.fillStyle = 'rgba(243,240,232,.25)'; ctx.fillRect(960 - 820 * fl, FLOOR, 1640 * fl, 2);

    // letters: dormant outlines until the ball brings them to life
    font(230); ctx.textAlign = 'left';
    L.forEach((c, i) => {
      const tau = lt - TC[i];
      ctx.save();
      ctx.translate(c.cx, FLOOR);
      if (tau >= 0) {
        const k = Math.exp(-7 * tau) * Math.cos(17 * tau);
        ctx.scale(1 + 0.2 * k, 1 - 0.3 * k);
        ctx.fillStyle = PAL[i % PAL.length]; ctx.fillText(c.ch, -c.w / 2, 0);
        if (tau < 0.45) {
          ctx.strokeStyle = PAL[i % PAL.length]; ctx.lineWidth = 3; ctx.globalAlpha = 1 - tau / 0.45;
          ctx.beginPath(); ctx.ellipse(0, -(FLOOR - c.top), 30 + tau * 380, (30 + tau * 380) * 0.3, 0, 0, TAU); ctx.stroke();
        }
      } else {
        ctx.globalAlpha = P(lt, 0, 0.4) * 0.5; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeText(c.ch, -c.w / 2, 0);
      }
      ctx.restore();
    });

    // spacing chart: a dot per frame along the arc
    ctx.fillStyle = 'rgba(243,240,232,.55)';
    for (let f = Math.floor((lt - 0.55) * 24); f <= lt * 24; f++) {
      const tf = f / 24;
      if (tf < 0 || tf > 3.5) continue;
      const b = ballAt(tf); ctx.fillRect(b.x - 1.5, b.y - 1.5, 3, 3);
    }
    // onion skins
    ctx.strokeStyle = C.lime; ctx.lineWidth = 2;
    for (let k = 1; k <= 7; k++) {
      const tk = lt - k * 0.045;
      if (tk < 0 || tk > 3.5) continue;
      const b = ballAt(tk);
      ctx.globalAlpha = 0.42 * (1 - k / 8); dot(b.x, b.y, BR); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // the ball, with squash & stretch
    const grow = E.inExpo(P(lt, 3.5, 4.0));
    const b = ballAt(lt);
    let bx = b.x, by = b.y, sx = 1, sy = 1, ang = 0;
    const ci = TC.findIndex((tc) => Math.abs(lt - tc) < 0.07);
    if (ci >= 0) {
      const sq = 1 - 0.4 * Math.pow(1 - Math.abs(lt - TC[ci]) / 0.07, 1.5);
      sy = sq; sx = 1 / Math.pow(sq, 0.7); by = L[ci].top - BR * sq;
    } else {
      const v = Math.hypot(b.vx, b.vy);
      sx = 1 + Math.min(0.35, v / 4200); sy = 1 / Math.sqrt(sx); ang = Math.atan2(b.vy, b.vx);
    }
    if (grow > 0) { const e = E.inOutCubic(P(lt, 3.5, 4.0)); bx = lerp(bx, 960, e); by = lerp(by, 540, e); }
    const br = BR * (1 + grow * 45);
    ctx.save(); ctx.translate(bx, by); ctx.rotate(ang); ctx.scale(sx, sy);
    ctx.fillStyle = C.lime; dot(0, 0, br); ctx.fill();
    ctx.rotate(-ang); ctx.fillStyle = 'rgba(255,255,255,.75)'; dot(-br * 0.35, -br * 0.35, br * 0.22); ctx.fill();
    ctx.restore();

    if (grow > 0.6) return;
    const ua = 1 - P(lt, 3.4, 3.7);
    ctx.globalAlpha = ua;

    // graph editor — the ball's actual y-curve
    const gx = 1250, gy = 120, gw = 570, gh = 230;
    const ga = E.outCubic(P(lt, 0.2, 0.6));
    ctx.save(); ctx.globalAlpha = ga * ua; ctx.translate(0, (1 - ga) * -30);
    rrect(gx, gy, gw, gh, 16); ctx.fillStyle = 'rgba(16,13,22,.92)'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
    mono(13, 700); ctx.fillStyle = C.dim; ctx.textAlign = 'left'; ctx.fillText('ball.position.y', gx + 20, gy + 28);
    ctx.textAlign = 'right'; ctx.fillText(`f ${pad(Math.floor(lt * 24), 3)}`, gx + gw - 20, gy + 28);
    const px = (tt) => gx + 30 + (tt / 3.5) * (gw - 60), py = (y) => gy + 50 + ((y - 300) / 520) * (gh - 70);
    ctx.strokeStyle = 'rgba(243,240,232,.07)'; ctx.lineWidth = 1;
    for (let k = 0; k <= 7; k++) { ctx.beginPath(); ctx.moveTo(px(k * 0.5), gy + 44); ctx.lineTo(px(k * 0.5), gy + gh - 16); ctx.stroke(); }
    const curve = (end) => { ctx.beginPath(); for (let k = 0; k <= 140; k++) { const tt = (k / 140) * end, y = py(ballAt(tt).y); k ? ctx.lineTo(px(tt), y) : ctx.moveTo(px(tt), y); } ctx.stroke(); };
    ctx.setLineDash([3, 6]); ctx.strokeStyle = 'rgba(243,240,232,.22)'; curve(3.5);
    ctx.setLineDash([]); ctx.strokeStyle = C.lime; ctx.lineWidth = 3; curve(Math.min(lt, 3.5));
    TC.forEach((tc, i) => {
      const x = px(tc), y = py(L[i].top - BR);
      ctx.fillStyle = lt >= tc ? C.coral : 'rgba(243,240,232,.3)';
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-5, -5, 10, 10); ctx.restore();
    });
    ctx.fillStyle = C.coral; ctx.fillRect(px(Math.min(lt, 3.5)) - 1, gy + 44, 2, gh - 60);
    ctx.restore();

    ctx.globalAlpha = P(lt, 0.1, 0.4) * ua; label('[ 04 ]  MOTION DESIGN', 120, 170);
    ctx.globalAlpha = E.outCubic(P(lt, 0.25, 0.7)) * ua; serif(64); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    ctx.fillText('Timing is', 120, 250); ctx.fillText('everything.', 120, 318);
    ctx.globalAlpha = ua;

    // DESIGNER drops in with follow-through
    font(76); ctx.textAlign = 'left';
    const dg = glyphs('DESIGNER', 34);
    dg.g.forEach((c, i) => {
      const q = P(lt, 0.7 + i * 0.05, 1.45 + i * 0.05);
      if (q <= 0) return;
      ctx.fillStyle = C.ink;
      ctx.fillText(c.ch, 960 - dg.w / 2 + c.x, 940 - (1 - E.outBounce(q)) * 520);
    });
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 05 — PRODUCT BUILDER: ball → app icon → app → a wall of screens
   * ================================================================ */
  const PX = 780, PY = 170, PW = 360, PH = 740;
  const SX = PX + 12, SY = PY + 12, SW = PW - 24, SH = PH - 24;
  const icon = (r, c) => [SX + 16 + c * 80, SY + 98 + r * 96, 64];
  function miniMark(x, y, s, col) {
    ctx.save(); glyphXf(ctx, x, y, s); ctx.fillStyle = col; ctx.fill(M.path); ctx.restore();
  }

  function phoneUI(lt) {
    rrect(PX, PY, PW, PH, 56); ctx.fillStyle = '#121117'; ctx.fill();
    ctx.strokeStyle = '#34313d'; ctx.lineWidth = 3; ctx.stroke();
    rrect(SX, SY, SW, SH, 44); ctx.fillStyle = '#0b0a0f'; ctx.fill();
    rrect(PX + PW / 2 - 52, PY + 24, 104, 30, 15); ctx.fillStyle = '#000'; ctx.fill();
    mono(15, 700); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText('9:41', SX + 30, SY + 36);

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 4; c++) {
        if (r === 1 && c === 1) continue;
        const i = r * 4 + c, s = E.outBack(P(lt, 0.3 + i * 0.014, 0.6 + i * 0.014));
        if (s <= 0) continue;
        const [x, y, z] = icon(r, c), col = PAL[Math.floor(hash(i, 50) * PAL.length)];
        ctx.save(); ctx.translate(x + z / 2, y + z / 2); ctx.scale(s, s);
        rrect(-z / 2, -z / 2, z, z, 16); ctx.fillStyle = '#1d1b24'; ctx.fill();
        ctx.fillStyle = col; ctx.globalAlpha *= 0.85;
        const k = Math.floor(hash(i, 51) * 3);
        if (k === 0) { dot(0, 0, 12); ctx.fill(); }
        else if (k === 1) ctx.fillRect(-11, -11, 22, 22);
        else { ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(13, 10); ctx.lineTo(-13, 10); ctx.closePath(); ctx.fill(); }
        ctx.restore();
      }
    }
    rrect(SX + 14, SY + SH - 96, SW - 28, 82, 30); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fill();
    return icon(1, 1);
  }

  function appUI(lt, x, y, w, h, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const sp = (d) => (1 - E.outBack(P(lt, d, d + 0.45))) * 50;
    serif(30); ctx.fillStyle = C.dim; ctx.textAlign = 'left'; ctx.fillText('Good morning,', x + 28, y + 86 + sp(1.3));
    font(36); ctx.fillStyle = C.ink; ctx.fillText('Xyphuz', x + 28, y + 128 + sp(1.36));

    // activity rings
    const cy0 = y + 150 + sp(1.45);
    rrect(x + 20, cy0, w - 40, 220, 26); ctx.fillStyle = '#17151d'; ctx.fill();
    const rc = [x + 120, cy0 + 110], vals = [0.92, 0.78, 1.0], cols = [C.lime, C.coral, C.blue], names = ['Ship', 'Build', 'Learn'];
    vals.forEach((v, i) => {
      const r = 76 - i * 22, p = E.outCubic(P(lt, 1.6 + i * 0.12, 2.5 + i * 0.12)) * v;
      ctx.lineCap = 'round'; ctx.lineWidth = 16;
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.beginPath(); ctx.arc(rc[0], rc[1], r, 0, TAU); ctx.stroke();
      if (p > 0) { ctx.strokeStyle = cols[i]; ctx.beginPath(); ctx.arc(rc[0], rc[1], r, -Math.PI / 2, -Math.PI / 2 + TAU * p); ctx.stroke(); }
      mono(14, 700); ctx.fillStyle = cols[i]; ctx.fillText(names[i].toUpperCase(), x + 220, cy0 + 70 + i * 40);
      ctx.fillStyle = C.ink; ctx.fillText(Math.round(p * 100) + '%', x + 220, cy0 + 88 + i * 40);
    });
    ctx.lineCap = 'butt';

    // tasks tick off with a stagger
    ['Design review', 'Deploy v2.4 → prod', 'Animate onboarding'].forEach((s, i) => {
      const ry = y + 400 + i * 66 + sp(1.55 + i * 0.07);
      rrect(x + 20, ry, w - 40, 54, 16); ctx.fillStyle = '#17151d'; ctx.fill();
      const ck = E.outBack(P(lt, 2.15 + i * 0.16, 2.4 + i * 0.16));
      ctx.strokeStyle = ck > 0 ? C.lime : C.dim; ctx.lineWidth = 2; dot(x + 48, ry + 27, 11); ctx.stroke();
      if (ck > 0) {
        ctx.fillStyle = C.lime; dot(x + 48, ry + 27, 11 * Math.min(ck, 1.1)); ctx.fill();
        ctx.strokeStyle = '#0b0a0f'; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(x + 42, ry + 27); ctx.lineTo(x + 46, ry + 32); ctx.lineTo(x + 54, ry + 22); ctx.stroke();
      }
      mono(15, 500); ctx.fillStyle = ck > 0 ? C.dim : C.ink; ctx.fillText(s, x + 72, ry + 32);
      if (ck > 0) { ctx.fillStyle = C.dim; ctx.fillRect(x + 72, ry + 27, ctx.measureText(s).width * Math.min(1, ck), 1.5); }
    });
    rrect(x + 70, y + h - 64, w - 140, 44, 22); ctx.fillStyle = '#1d1b24'; ctx.fill();
    ctx.restore();
  }

  function sProduct(lt, t) {
    const pull = E.inOutCubic(P(lt, 2.7, 3.5));
    const s = lerp(1, 0.105, pull);
    const cellW = 560, cellH = 940;

    // the wall of screens around the hero phone
    let lit = 0;
    if (pull > 0) {
      const wr = (lt - 2.85) * 16;
      const nx = Math.ceil(960 / (cellW * s)) + 1, ny = Math.ceil(540 / (cellH * s)) + 1;
      for (let j = -ny; j <= ny; j++) {
        for (let i = -nx; i <= nx; i++) {
          if (!i && !j) continue;
          const x = 960 + i * cellW * s, y = 540 + j * cellH * s, w = PW * s, h = PH * s;
          if (x + w < 0 || x - w > W || y + h < 0 || y - h > H) continue;
          rrect(x - w / 2, y - h / 2, w, h, 56 * s); ctx.fillStyle = '#16141c'; ctx.fill();
          if (Math.hypot(i, j * 1.7) + hash(i * 31, j) * 1.5 < wr) {
            lit++;
            ctx.fillStyle = PAL[Math.floor(hash(i, j + 99) * 5)]; ctx.globalAlpha = 0.85;
            rrect(x - w / 2 + 12 * s, y - h / 2 + 12 * s, w - 24 * s, h - 24 * s, 44 * s); ctx.fill(); ctx.globalAlpha = 1;
          }
        }
      }
    }

    ctx.save();
    ctx.translate(960, 540); ctx.scale(s, s); ctx.translate(-960, -540);
    ctx.globalAlpha = P(lt, 0.15, 0.45);
    const [hx, hy, hs] = phoneUI(lt);
    ctx.globalAlpha = 1;

    // ball shrinks into the app icon, circle → squircle, then the app opens
    const e = E.inOutExpo(P(lt, 0, 0.55));
    const R = lerp(1500, hs / 2, e);
    const icx = lerp(960, hx + hs / 2, e), icy = lerp(540, hy + hs / 2, e);
    const corner = lerp(R, 16, P(lt, 0.42, 0.6));
    const tap = 1 - 0.1 * Math.sin(Math.PI * P(lt, 0.7, 0.88));
    const op = E.outExpo(P(lt, 0.88, 1.38));
    const rx0 = icx - R * tap, ry0 = icy - R * tap, rw0 = 2 * R * tap;
    const ax = lerp(rx0, SX, op), ay = lerp(ry0, SY, op), aw = lerp(rw0, SW, op), ah = lerp(rw0, SH, op);
    rrect(ax, ay, aw, ah, lerp(corner, 44, op));
    ctx.fillStyle = mixHex(C.lime, '#0b0a0f', P(lt, 1.12, 1.4)); ctx.fill();
    const ms = lerp(hs * 0.36, 150, op) * (1 - P(lt, 1.1, 1.35));
    if (ms > 1 && lt > 0.4) miniMark(ax + aw / 2, ay + ah / 2, ms, '#0b0a0f');
    if (lt > 0.68 && lt < 1.0) {
      const q = P(lt, 0.68, 1.0);
      ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - q)})`; dot(hx + hs / 2, hy + hs / 2, 20 + q * 60); ctx.fill();
    }
    appUI(lt, SX, SY, SW, SH, P(lt, 1.2, 1.4));
    ctx.restore();

    // motion callouts
    const ca = P(lt, 1.7, 2.0) * (1 - P(lt, 2.6, 2.8));
    if (ca > 0) {
      ctx.globalAlpha = ca; ctx.strokeStyle = 'rgba(243,240,232,.4)'; ctx.lineWidth = 1;
      [[[SX + 210, SY + 260], 'spring(stiffness: 260, damping: 20)'], [[SX + 300, SY + 500], 'ease-out 240ms · stagger 160ms']].forEach(([[x, y], str], i) => {
        const lx = 1230, ly = y - 20;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx - 20, ly); ctx.lineTo(lx - 8, ly); ctx.stroke();
        ctx.fillStyle = C.lime; dot(x, y, 4); ctx.fill();
        mono(15, 500); ctx.fillStyle = i ? C.ink : C.lime; ctx.textAlign = 'left'; ctx.fillText(str, lx, ly + 5);
      });
      ctx.globalAlpha = 1;
    }
    const la = P(lt, 1.3, 1.7) * (1 - P(lt, 2.6, 2.8));
    if (la > 0) {
      ctx.globalAlpha = la; label('[ 05 ]  PRODUCT', 140, 400);
      serif(60); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
      ctx.fillText('Idea → interface', 140, 478); ctx.fillText('→ in your hand.', 140, 548);
      ctx.globalAlpha = 1;
    }

    // title over the wall
    const ta = P(lt, 2.95, 3.15);
    if (ta > 0) {
      ctx.fillStyle = 'rgba(7,7,10,.78)'; ctx.fillRect(0, 420, W, 380 * E.outExpo(ta));
      font(150); ctx.fillStyle = C.ink;
      reveal('PRODUCT BUILDER', 960, 600, 150, E.outExpo(P(lt, 3.0, 3.5)), 'center');
      ctx.globalAlpha = P(lt, 3.2, 3.45); serif(44); ctx.textAlign = 'center';
      ctx.fillText('from one person to everyone.', 960, 680);
      mono(15, 700); ctx.fillStyle = C.lime; ctx.fillText(`${lit} SCREENS LIT`, 960, 760);
      ctx.globalAlpha = 1;
    }
  }

  /* ================================================================
   * 06 — MANIFESTO: a typographic tunnel, one word per beat
   * ================================================================ */
  const WORDS = ['DESIGN', 'CODE', 'ANIMATE', 'ARCHITECT', 'SHIP', 'SCALE', 'DELIGHT', 'REPEAT'];
  const WT = [0.5, 1.0, 1.5, 2.0, 2.25, 2.5, 2.75, 3.0];
  const WCOL = [C.lime, C.ink, C.coral, C.ink, C.lime, C.blue, C.ink, C.lime];
  function sManifesto(lt) {
    const roll = Math.sin(lt * 1.3) * 0.12 + lt * 0.05;
    const flash = spike(lt, WT, 10);
    if (flash > 0) { ctx.fillStyle = `rgba(212,255,58,${0.1 * flash})`; ctx.fillRect(-60, -60, W + 120, H + 120); }
    ctx.save(); ctx.translate(960, 540); ctx.rotate(roll);

    // speed lines
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    for (let i = 0; i < 70; i++) {
      const a = hash(i, 120) * TAU, r = fract(lt * (0.9 + hash(i, 121)) + hash(i, 122)) * 1300 + 80;
      ctx.globalAlpha = 0.25 * (r / 1300);
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a) * r * 1.18, Math.sin(a) * r * 1.18); ctx.stroke();
    }
    // tunnel frames
    for (let k = Math.floor((lt - 1.6) / 0.25); k <= Math.ceil((lt + 1.6) / 0.25); k++) {
      const z = 1 + (k * 0.25 - lt) * 5;
      if (z < 0.3 || z > 9) continue;
      ctx.save(); ctx.rotate(k * 0.11);
      ctx.globalAlpha = clamp((9 - z) / 4) * clamp((z - 0.3) / 0.5) * 0.6;
      ctx.strokeStyle = k % 4 === 0 ? C.lime : C.ink; ctx.lineWidth = Math.max(1, 3 / Math.sqrt(z));
      ctx.strokeRect(-1000 / z, -580 / z, 2000 / z, 1160 / z);
      ctx.restore();
    }
    // words fly through the camera plane
    for (let i = WORDS.length - 1; i >= 0; i--) {
      const z = 1 + (WT[i] - lt) * 5;
      if (z < 0.28 || z > 9) continue;
      font(400);
      const base = Math.min(360, (400 * 1450) / ctx.measureText(WORDS[i]).width);
      font(base / z); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = clamp((9 - z) / 3) * (z < 1 ? clamp((z - 0.28) / 0.72) : 1);
      ctx.save(); ctx.rotate(-roll * 0.6 + (i % 2 ? 0.04 : -0.04));
      if (z > 1.6) { ctx.strokeStyle = WCOL[i]; ctx.lineWidth = 2; ctx.strokeText(WORDS[i], 0, 0); }
      else { ctx.fillStyle = WCOL[i]; ctx.fillText(WORDS[i], 0, 0); }
      ctx.restore();
    }
    ctx.restore();
    ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1;
    label('[ 06 ]  MANIFESTO', 960, 150, 'center');
  }

  /* ================================================================
   * 07 — XYPHUZ: the mark returns, fully lit
   * ================================================================ */
  function sOutro(lt, t) {
    const sw = E.outBack(P(lt, 0, 0.9));
    drawMark({
      cx: 960, cy: 390, scale: 215, rx: 0.12 * Math.sin(lt * 0.9), ry: lerp(-1.4, 0, sw) + 0.45 * Math.sin(lt * 1.1),
      thick: 0.13, emit: 0, sweep: lerp(-1.2, 1.4, P(lt, 0.2, 2.6)),
      contour: { cx: 960, cy: 390, scale: 215, time: lt * 1.1, alpha: 0.5, reach: E.outCubic(P(lt, 0, 2.2)) * 9 },
    });
    font(120);
    const tr = lerp(90, 26, E.outExpo(P(lt, 0.3, 1.4)));
    const { g, w } = glyphs('XYPHUZ', tr);
    ctx.globalAlpha = E.outCubic(P(lt, 0.3, 0.7)); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    g.forEach((c) => ctx.fillText(c.ch, 960 - w / 2 + c.x, 755));
    ctx.globalAlpha = 1;
    mono(20, 500); ctx.fillStyle = C.dim; ctx.textAlign = 'center';
    ctx.fillText(decode('SOFTWARE ENGINEER  /  SOFTWARE ARCHITECT  /  MOTION DESIGNER  /  PRODUCT BUILDER', P(lt, 0.6, 1.4), t), 960, 808);
    const ta = E.outCubic(P(lt, 1.1, 1.6));
    ctx.globalAlpha = ta; serif(46); ctx.fillStyle = C.ink;
    ctx.fillText('Let’s build something unforgettable.', 960, 880 + (1 - ta) * 18);
    ctx.globalAlpha = P(lt, 1.4, 1.9); mono(18, 700); ctx.fillStyle = C.lime;
    ctx.fillText('xyphuz.com   ·   github.com/wst24365888', 960, 940);
    ctx.globalAlpha = 1;
  }

  const SCENES = [
    { s: 0, e: 4, id: '00', name: 'SIGNATURE', bg: C.bg, draw: sSign },
    { s: 4, e: 8, id: '01', name: 'IDENTITY', bg: C.bg, draw: sIdentity },
    { s: 8, e: 12, id: '02', name: 'SOFTWARE ENGINEER', bg: '#07080a', draw: sEng },
    { s: 12, e: 16, id: '03', name: 'SOFTWARE ARCHITECT', bg: '#05070f', draw: sArch },
    { s: 16, e: 20, id: '04', name: 'MOTION DESIGNER', bg: '#0a0710', draw: sMotion },
    { s: 20, e: 24, id: '05', name: 'PRODUCT BUILDER', bg: '#0b0a0f', draw: sProduct },
    { s: 24, e: 27, id: '06', name: 'MANIFESTO', bg: C.bg, draw: sManifesto },
    { s: 27, e: 30, id: '07', name: 'XYPHUZ', bg: C.bg, draw: sOutro },
  ];

  /* ---------- global layers ---------- */
  const FLASHES = [[4, 0.9], [24, 0.6], [27, 1]];
  const IMPACTS = [[4, 16], [16.5, 5], [20, 7], [24, 8], [27, 16]];

  function hud(t, sc) {
    ctx.save();
    ctx.globalCompositeOperation = 'difference';
    ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.75; ctx.lineWidth = 2;
    const m = 44, L = 26;
    ctx.beginPath();
    ctx.moveTo(m, m + L); ctx.lineTo(m, m); ctx.lineTo(m + L, m);
    ctx.moveTo(W - m - L, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + L);
    ctx.moveTo(m, H - m - L); ctx.lineTo(m, H - m); ctx.lineTo(m + L, H - m);
    ctx.moveTo(W - m - L, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - L);
    ctx.stroke();
    mono(16, 500);
    ctx.textAlign = 'left'; ctx.fillText('XYPHUZ — SHOWREEL 2026', 84, 88);
    ctx.fillText(`${sc.id} / ${sc.name}`, 84, 1004);
    ctx.globalAlpha = 0.25; ctx.fillRect(84, 1018, 200, 2);
    ctx.globalAlpha = 0.75; ctx.fillRect(84, 1018, 200 * P(t, sc.s, sc.e), 2);
    ctx.textAlign = 'right';
    const tc = `00:00:${pad(Math.floor(t))}:${pad(Math.floor(fract(t) * 24))}`;
    ctx.fillText(tc, W - 84, 88);
    ctx.fillText('1920×1080 · 24 FPS · 120 BPM', W - 84, 1004);
    const tw = ctx.measureText(tc).width;
    ctx.restore();
    if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = '#ff2d2d'; dot(W - 84 - tw - 20, 82, 7); ctx.fill(); }
  }

  function render(t) {
    t = ((t % DUR) + DUR) % DUR;
    const k = canvas.width / W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.lineCap = 'butt'; ctx.setLineDash([]);

    const sc = SCENES.find((s) => t >= s.s && t < s.e) || SCENES[SCENES.length - 1];
    const lt = t - sc.s, d = sc.e - sc.s;
    ctx.fillStyle = sc.bg; ctx.fillRect(0, 0, W, H);

    let sx = 0, sy = 0;
    for (const [ti, a] of IMPACTS) {
      if (t < ti) continue;
      const e = a * Math.exp(-(t - ti) * 7), fr = Math.floor(t * 60);
      sx += (hash(fr, 1) - 0.5) * 2 * e; sy += (hash(fr, 2) - 0.5) * 2 * e;
    }
    const z = (1 + 0.03 * (1 - E.outExpo(P(lt, 0, 0.6)))) * (1 + (0.015 * lt) / d);
    ctx.save();
    ctx.translate(960 + sx, 540 + sy); ctx.scale(z, z); ctx.translate(-960, -540);
    sc.draw(lt, t, d);
    ctx.restore();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.textBaseline = 'alphabetic'; ctx.lineCap = 'butt'; ctx.setLineDash([]);

    for (const [ft, a] of FLASHES) {
      if (t < ft || t > ft + 0.4) continue;
      ctx.globalAlpha = a * Math.pow(1 - P(t, ft, ft + 0.4), 2); ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;

    const vg = ctx.createRadialGradient(960, 540, 420, 960, 540, 1150);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    const pat = ctx.createPattern(grain, 'repeat');
    const fr = Math.floor(t * 24);
    if (pat.setTransform) pat.setTransform(new DOMMatrix().translate(hash(fr, 3) * 256, hash(fr, 4) * 256));
    ctx.globalAlpha = 0.07; ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    hud(t, sc);

    if (t > 29.55) { ctx.globalAlpha = P(t, 29.55, 29.95); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }

  async function ready() {
    const fonts = [`700 100px ${FD}`, `500 20px ${FM}`, `400 20px ${FM}`, `700 20px ${FM}`, `italic 400 40px ${FS}`];
    try {
      await Promise.race([Promise.all(fonts.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 3500))]);
    } catch (e) { /* fall back to system fonts */ }
    MLAY = null;
    prepGrid();
  }

  window.Reel = {
    DUR,
    SCENES: SCENES.map(({ s, e, id, name }) => ({ s, e, id, name })),
    create(cv) {
      canvas = cv; ctx = cv.getContext('2d');
      M.init();
      prepGrain();
      return { render, ready };
    },
  };
})();
