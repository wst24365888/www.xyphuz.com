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
      'lot := dispatcher.Next(ctx, tool.ID)', 'if err != nil { return fmt.Errorf("dispatch: %w", err) }',
      'await bus.publish("lot.moved", { lotId, from, to, ts });', 'SELECT tool_id, state FROM equipment WHERE bay = $1 FOR UPDATE;',
      'resource "aws_eks_cluster" "core" { version = "1.31" }', 'kubectl rollout status deploy/mes-api --timeout=120s',
      'func (s *Scheduler) Plan(ctx context.Context, w []Wafer) (Plan, error) {', 'retry.WithBackoff(ctx, 5, 200*time.Millisecond, call)',
      'spc.check(chart, sample).filter(Rule::WesternElectric)', 'outbox.enqueue(tx, event); tx.commit();',
      'replicas: 3  maxSurge: 25%  maxUnavailable: 0', 'circuitBreaker.wrap(() -> recipeService.load(toolId))',
      'p99 := hist.Quantile(0.99)', 'idempotencyKey = sha256(lotId + step + seq)', 'helm upgrade --install mes ./charts/mes -f prod.yaml',
      'consumer.subscribe("equipment.events", groupId = "dispatch")', 'while (alive) { observe(); harden(); ship(); }',
      'terraform plan -out=tfplan && terraform apply tfplan', 'CREATE INDEX CONCURRENTLY idx_lot_step ON lot_history(lot_id, step);',
    ];
    let s = 'func (d *Dispatcher) Next(ctx context.Context, tool ToolID) (*Lot, error) {  ';
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
  const STROKE_T = [[0.3, 1.62], [1.76, 1.96], [2.1, 3.15]];
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
    const words = ['enterprise systems.', 'cloud platforms.', 'fab-scale software.', 'for the long run.'];
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
    ctx.fillText(decode('SOFTWARE ARCHITECT · ENTERPRISE SYSTEMS · CLOUD INFRASTRUCTURE', P(lt, 1.0, 2.0), t), x0, 770);
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
    { y: 1.6, n: 'CLIENTS', nodes: [['Ops Console', -1.0, 0.5], ['Tool Gateway', 0.9, -0.5]] },
    { y: 0.8, n: 'GATEWAY', nodes: [['API Gateway', 0, 0]] },
    { y: 0, n: 'SERVICES', nodes: [['MES', -1.25, 0.45], ['Dispatcher', 0, -0.85], ['Scheduler', 1.25, 0.3], ['SPC', 0.1, 1.0]] },
    { y: -0.8, n: 'DATA', nodes: [['Postgres', -1.0, -0.4], ['Redis', 0.95, 0.6], ['Lakehouse', 0.45, -1.1]] },
    { y: -1.6, n: 'STREAM', nodes: [['Kafka', -0.5, 0], ['Workers', 1.0, -0.45]] },
  ];
  const NODES = [];
  LAY.forEach((l, li) => l.nodes.forEach(([lab, x, z]) => NODES.push({ lab, x, y: l.y, z, li })));
  const EDGES = [[0, 2], [1, 2], [2, 3], [2, 4], [2, 5], [2, 6], [3, 7], [3, 8], [4, 7], [4, 10], [5, 7], [5, 10], [6, 8], [6, 9], [7, 10], [10, 11]];
  const DIVE = 9; // the Dispatcher → Kafka edge carries the packet we dive into

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
   * 04 — ENTERPRISE SYSTEMS: one die → the wafer → the whole fab floor
   * ================================================================ */
  const FAB_BG = '#08080b';
  const WR = 330, DIE = 22, PITCH = 25;
  let DIES = null;
  function prepDies() {
    DIES = [];
    const n = Math.ceil(WR / PITCH) + 1;
    for (let j = -n; j <= n; j++) {
      for (let i = -n; i <= n; i++) {
        const x = i * PITCH - DIE / 2, y = j * PITCH - DIE / 2;
        const fx = Math.max(Math.abs(x), Math.abs(x + DIE)), fy = Math.max(Math.abs(y), Math.abs(y + DIE));
        if (Math.hypot(fx, fy) < WR - 10) DIES.push({ x, y, h: hash(i + 99, j + 99), bad: hash(i + 7, j + 3) < 0.035, hero: !i && !j });
      }
    }
  }

  function wafer(lt, cx, cy, z, squash) {
    const scan = P(lt, 0.45, 1.55), sy = lerp(-WR, WR, scan);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z * squash);
    const g = ctx.createRadialGradient(-90, -110, 20, 0, 0, WR);
    g.addColorStop(0, '#2c2936'); g.addColorStop(1, '#100f15');
    dot(0, 0, WR); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(243,240,232,.35)'; ctx.lineWidth = 1.5 / z; ctx.stroke();
    let done = 0;
    for (const d of DIES) {
      const ok = d.y + DIE / 2 < sy;
      if (ok) done++;
      ctx.fillStyle = d.hero ? C.lime : ok ? (d.bad ? C.coral : `rgba(212,255,58,${0.3 + 0.45 * d.h})`) : '#27242f';
      ctx.fillRect(d.x, d.y, DIE, DIE);
    }
    if (z > 1.5) {
      ctx.strokeStyle = 'rgba(7,7,10,.6)'; ctx.lineWidth = 0.5; ctx.beginPath();
      for (let k = 0; k < 6; k++) { const y = -8 + k * 3.2; ctx.moveTo(-9, y); ctx.lineTo(-9 + 6 + hash(k, 60) * 12, y); }
      for (let k = 0; k < 4; k++) { const x = 2 + k * 2.4; ctx.moveTo(x, -9); ctx.lineTo(x, -9 + 6 + hash(k, 61) * 12); }
      ctx.stroke();
    }
    if (scan > 0 && scan < 1) {
      const w = Math.sqrt(Math.max(0, WR * WR - sy * sy));
      ctx.fillStyle = 'rgba(212,255,58,.14)'; ctx.fillRect(-w, sy - 34, w * 2, 34);
      ctx.fillStyle = C.lime; ctx.fillRect(-w, sy - 1, w * 2, 2);
    }
    ctx.fillStyle = FAB_BG; dot(0, WR, 9); ctx.fill();
    ctx.restore();
    return done;
  }

  // isometric fab floor
  const FC = [1130, 655], ISO = 0.94;
  const iso = (x, y, z) => [FC[0] + (x - y) * 0.866 * ISO, FC[1] + (x + y) * 0.5 * ISO - z * ISO];
  const TOOLS = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) TOOLS.push({ x: -340 + c * 132, y: -250 + r * 150, w: 84, d: 64, h: 36 + hash(c, r + 40) * 34, i: r * 6 + c });
  TOOLS.sort((a, b) => a.x + a.y - (b.x + b.y));
  const TRACK = [[-405, -315], [405, -315], [405, 315], [-405, 315]], TZ = 84;
  const TRACK_LEN = 2 * (810 + 630);
  function trackPt(u) {
    let L = fract(u) * TRACK_LEN;
    for (let i = 0; i < 4; i++) {
      const a = TRACK[i], b = TRACK[(i + 1) % 4], seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L <= seg) return [lerp(a[0], b[0], L / seg), lerp(a[1], b[1], L / seg)];
      L -= seg;
    }
    return TRACK[0];
  }
  function poly(pts, fill) {
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
  }
  function isoBox(x, y, w, d, h, top, left, right) {
    poly([iso(x, y + d, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x, y + d, h)], left);
    poly([iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x + w, y, h)], right);
    poly([iso(x, y, h), iso(x + w, y, h), iso(x + w, y + d, h), iso(x, y + d, h)], top);
  }

  function fabFloor(lt, t) {
    poly([iso(-450, -350, 0), iso(450, -350, 0), iso(450, 350, 0), iso(-450, 350, 0)], '#121119');
    ctx.strokeStyle = 'rgba(243,240,232,.06)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = -450; x <= 450; x += 75) { const a = iso(x, -350, 0), b = iso(x, 350, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    for (let y = -350; y <= 350; y += 70) { const a = iso(-450, y, 0), b = iso(450, y, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    ctx.stroke();

    // tools, back to front, each streaming events upward
    for (const tl of TOOLS) {
      isoBox(tl.x, tl.y, tl.w, tl.d, tl.h, '#45414f', '#1f1d27', '#2e2b37');
      const led = iso(tl.x + tl.w / 2, tl.y + tl.d / 2, tl.h);
      ctx.fillStyle = hash(tl.i, Math.floor(t * 2.5)) < 0.86 ? C.lime : C.yellow;
      dot(led[0], led[1], 3.5); ctx.fill();
    }
    ctx.strokeStyle = C.lime; ctx.lineWidth = 2;
    for (const tl of TOOLS) {
      for (let k = 0; k < 2; k++) {
        const u = fract(lt * 0.85 + hash(tl.i, k * 5 + 1));
        const a = iso(tl.x + tl.w / 2, tl.y + tl.d / 2, tl.h + 10 + u * 520), b = [a[0], a[1] - 26];
        const keep = ctx.globalAlpha;
        ctx.globalAlpha = keep * (1 - u) * 0.85;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.globalAlpha = keep;
      }
    }

    // overhead transport: rails, pillars, vehicles carrying wafer pods
    ctx.strokeStyle = 'rgba(243,240,232,.45)'; ctx.lineWidth = 1.5;
    for (const off of [-6, 6]) {
      ctx.beginPath();
      TRACK.forEach(([x, y], i) => { const p = iso(x + Math.sign(x) * off, y + Math.sign(y) * off, TZ); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.closePath(); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(243,240,232,.12)';
    TRACK.forEach(([x, y]) => { const a = iso(x, y, 0), b = iso(x, y, TZ); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
    for (let k = 0; k < 14; k++) {
      const [x, y] = trackPt(lt * 0.09 + k / 14);
      isoBox(x - 11, y - 11, 22, 22, 14, '#e9e5da', '#9f9b92', '#c4c0b6');
      const p = iso(x, y, TZ - 6); ctx.fillStyle = C.lime; ctx.fillRect(p[0] - 4, p[1] - 2, 8, 6);
    }
  }
  const vehicleScreen = (lt, s) => { const [x, y] = trackPt(lt * 0.09); const p = iso(x, y, TZ); return [FC[0] + (p[0] - FC[0]) * s, FC[1] + (p[1] - FC[1]) * s]; };

  function sFab(lt, t) {
    if (!DIES) prepDies();
    const zIn = lerp(3.4, 1, E.inOutCubic(P(lt, 0, 1.25)));
    const fly = E.inOutCubic(P(lt, 1.55, 2.25));
    const floorIn = E.outCubic(P(lt, 1.35, 2.2));
    const out = E.inOutCubic(P(lt, 3.3, 3.95));
    const fs = lerp(1.6, 1, floorIn);

    ctx.save();
    if (out > 0) { const s = lerp(1, 0.14, out); ctx.translate(lerp(FC[0], 740, out), lerp(FC[1], 925, out)); ctx.scale(s, s); ctx.translate(-FC[0], -FC[1]); }
    if (floorIn > 0) {
      ctx.save(); ctx.globalAlpha = floorIn;
      ctx.translate(FC[0], FC[1]); ctx.scale(fs, fs); ctx.translate(-FC[0], -FC[1]);
      fabFloor(lt, t);
      ctx.restore();
    }
    ctx.restore();

    if (fly < 1) {
      const tg = vehicleScreen(lt, fs);
      const done = wafer(lt, lerp(960, tg[0], fly), lerp(540, tg[1], fly), zIn * lerp(1, 0.03, fly), lerp(1, 0.5, fly));
      const la = P(lt, 0.9, 1.2) * (1 - P(lt, 1.45, 1.6));
      if (la > 0) {
        ctx.globalAlpha = la; mono(15, 700); ctx.textAlign = 'center'; ctx.fillStyle = C.dim;
        ctx.fillText(`WAFER 07 · 300 mm · YIELD MAP · ${done}/${DIES.length} INSPECTED`, 960, 540 + WR + 52);
        ctx.globalAlpha = 1;
      }
    }

    const ta = P(lt, 1.9, 2.3) * (1 - P(lt, 3.2, 3.5));
    if (ta > 0) {
      ctx.globalAlpha = ta; label('[ 04 ]  GIGA-FAB SCALE', 120, 150);
      font(92); ctx.fillStyle = C.ink;
      reveal('ENTERPRISE', 120, 240, 92, E.outExpo(P(lt, 1.9, 2.5)));
      ctx.fillStyle = C.lime; reveal('SYSTEMS', 120, 330, 92, E.outExpo(P(lt, 2.0, 2.6)));
      serif(40); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
      ctx.fillText('for giga-fab semiconductor manufacturing.', 120, 390);
      mono(14, 700); ctx.fillStyle = C.dim; ctx.fillText('MES · DISPATCH · SCHEDULING · SPC · AMHS · 24/7', 120, 432);
      ctx.globalAlpha = 1;
    }
    if (lt < 0.6) { ctx.globalAlpha = P(lt, 0, 0.2) * (1 - P(lt, 0.4, 0.6)); label('[ 04 ]  ONE DIE', 960, 150, 'center'); ctx.globalAlpha = 1; }
  }

  /* ================================================================
   * 05 — CLOUD INFRASTRUCTURE: schedule, autoscale, fail, self-heal
   * ================================================================ */
  const REG = { x: 120, y: 300, w: 1240, h: 520 }, AZW = 400;
  const SCHED = [REG.x + REG.w / 2, REG.y - 4];
  const FAIL = [1, 1], FAIL_T = 2.2;
  const azX = (a) => REG.x + 20 + a * (AZW + 10);
  const nodeRect = (a, n) => [azX(a) + 20, REG.y + 70 + n * 108, AZW - 40, 94];
  const slotRect = (a, n, s) => { const [x, y] = nodeRect(a, n); return [x + 18 + (s % 8) * 40, y + 34 + Math.floor(s / 8) * 30, 26, 22]; };
  let PODS = null;
  function prepPods() {
    PODS = [];
    const used = new Set();
    const place = (a, n) => { for (let s = 0; s < 16; s++) { const k = `${a}-${n}-${s}`; if (!used.has(k)) { used.add(k); return s; } } return -1; };
    const svc = [C.lime, C.blue, C.violet, C.yellow];
    for (let i = 0; i < 30; i++) { const a = i % 3, n = Math.floor(i / 3) % 3; PODS.push({ a, n, s: place(a, n), born: 0.6 + i * 0.022, col: svc[i % 4] }); }
    for (let i = 0; i < 16; i++) { const a = i < 6 ? 2 : i % 3, n = i < 6 ? 3 : i % 3; PODS.push({ a, n, s: place(a, n), born: 1.65 + i * 0.035, col: svc[(i + 1) % 4] }); }
    const targets = [[0, 0], [2, 1], [0, 2], [2, 0], [0, 1], [2, 2], [1, 0], [1, 2]];
    let j = 0;
    PODS.forEach((p) => {
      if (p.a !== FAIL[0] || p.n !== FAIL[1]) return;
      const [a, n] = targets[j % targets.length];
      p.to = [a, n, place(a, n)]; p.move = 2.55 + j * 0.05; j++;
    });
  }
  function podAt(p, lt) {
    if (lt < p.born) return null;
    const q = E.outCubic(P(lt, p.born, p.born + 0.35));
    const h = slotRect(p.a, p.n, p.s);
    let x = lerp(SCHED[0], h[0], q), y = lerp(SCHED[1], h[1], q) - Math.sin(q * Math.PI) * 60, col = p.col;
    const s = E.outBack(P(lt, p.born, p.born + 0.35));
    if (p.to && lt >= FAIL_T) {
      if (lt < p.move) { col = C.coral; x += Math.sin(lt * 90 + p.s) * 2; }
      else {
        const m = E.inOutCubic(P(lt, p.move, p.move + 0.45)), to = slotRect(...p.to);
        x = lerp(h[0], to[0], m); y = lerp(h[1], to[1], m) - Math.sin(m * Math.PI) * 110;
        col = m < 1 ? C.coral : p.col;
      }
    }
    return { x, y, s, col };
  }

  function sCloud(lt, t) {
    if (!PODS) prepPods();
    const push = E.inExpo(P(lt, 3.4, 4.0));
    ctx.save();
    if (push > 0) { const z = 1 + push * 0.9; ctx.translate(740, 560); ctx.scale(z, z); ctx.translate(-740, -560); ctx.globalAlpha = 1 - push; }
    const base = ctx.globalAlpha;

    // on-prem fab feeding the cloud (where the fab floor just shrank to)
    rrect(610, 900, 260, 50, 12); ctx.fillStyle = '#16141c'; ctx.fill(); ctx.strokeStyle = C.lime; ctx.lineWidth = 1.5; ctx.stroke();
    mono(14, 700); ctx.fillStyle = C.lime; ctx.textAlign = 'center'; ctx.fillText('FAB · ON-PREM', 740, 930);
    for (let k = 0; k < 5; k++) {
      const x = 650 + k * 45;
      ctx.strokeStyle = 'rgba(212,255,58,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, 900); ctx.lineTo(x, REG.y + REG.h); ctx.stroke();
      for (let j = 0; j < 2; j++) { const u = fract(lt * 1.6 + k * 0.23 + j * 0.5); ctx.fillStyle = C.lime; ctx.fillRect(x - 2, lerp(900, REG.y + REG.h, u) - 4, 4, 8); }
    }

    // region + availability zones
    const fr = E.outCubic(P(lt, 0, 0.5));
    ctx.globalAlpha = base * fr;
    rrect(REG.x, REG.y, REG.w, REG.h, 22); ctx.strokeStyle = 'rgba(243,240,232,.3)'; ctx.lineWidth = 1.5; ctx.stroke();
    mono(13, 700); ctx.fillStyle = C.dim; ctx.textAlign = 'left'; ctx.fillText('REGION 1', REG.x + 20, REG.y + 28);
    ctx.setLineDash([5, 7]); ctx.strokeStyle = 'rgba(111,140,255,.35)';
    for (let a = 0; a < 3; a++) {
      rrect(azX(a), REG.y + 42, AZW, REG.h - 58, 14); ctx.stroke();
      ctx.fillStyle = C.blue; ctx.fillText(`AZ-${'ABC'[a]}`, azX(a) + 20, REG.y + 62);
    }
    ctx.setLineDash([]);
    ctx.fillStyle = C.ink; dot(SCHED[0], SCHED[1], 6); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = C.dim; ctx.fillText('scheduler', SCHED[0], SCHED[1] - 14);
    ctx.globalAlpha = base;

    // nodes
    for (let a = 0; a < 3; a++) {
      for (let n = 0; n < 4; n++) {
        if (n === 3 && a !== 2) continue;
        const born = n === 3 ? 1.55 : 0.2 + (a * 3 + n) * 0.04;
        const s = E.outBack(P(lt, born, born + 0.4));
        if (s <= 0) continue;
        const [x, y, w, h] = nodeRect(a, n);
        const failed = a === FAIL[0] && n === FAIL[1] && lt >= FAIL_T;
        ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-x - w / 2, -y - h / 2);
        if (failed) ctx.globalAlpha = base * lerp(1, 0.45, P(lt, 3.0, 3.3));
        rrect(x, y, w, h, 12); ctx.fillStyle = failed ? 'rgba(255,77,46,.1)' : '#111019'; ctx.fill();
        ctx.strokeStyle = failed ? C.coral : n === 3 ? C.lime : 'rgba(111,140,255,.55)'; ctx.lineWidth = 1.5; ctx.stroke();
        mono(12, 700); ctx.textAlign = 'left'; ctx.fillStyle = C.dim;
        ctx.fillText(`az-${'abc'[a]}/node-${n + 1}`, x + 18, y + 22);
        ctx.textAlign = 'right';
        if (failed) { ctx.fillStyle = C.coral; ctx.fillText('✗ NotReady', x + w - 16, y + 22); }
        else { ctx.fillStyle = C.lime; ctx.fillText(n === 3 && lt < 1.95 ? 'provisioning…' : '● Ready', x + w - 16, y + 22); }
        ctx.strokeStyle = 'rgba(243,240,232,.08)'; ctx.lineWidth = 1;
        for (let k = 0; k < 16; k++) { const [sx, sy, sw, sh] = slotRect(a, n, k); rrect(sx, sy, sw, sh, 5); ctx.stroke(); }
        ctx.restore();
      }
    }

    // pods
    for (const p of PODS) {
      const st = podAt(p, lt);
      if (!st) continue;
      ctx.save(); ctx.translate(st.x + 13, st.y + 11); ctx.scale(st.s, st.s);
      rrect(-13, -11, 26, 22, 5); ctx.fillStyle = st.col; ctx.fill();
      ctx.restore();
    }

    // title
    ctx.globalAlpha = base * P(lt, 0.1, 0.4); label('[ 05 ]  CLOUD', 120, 150);
    ctx.globalAlpha = base; font(92); ctx.fillStyle = C.ink;
    reveal('CLOUD INFRASTRUCTURE', 120, 258, 92, E.outExpo(P(lt, 0.15, 0.8)));

    // live metrics: traffic climbs, p99 holds through the failure
    const px = 1410, py = 300, pw = 390, ph = 230;
    ctx.globalAlpha = base * E.outCubic(P(lt, 0.3, 0.7));
    rrect(px, py, pw, ph, 16); ctx.fillStyle = '#100f15'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
    mono(13, 700); ctx.textAlign = 'left'; ctx.fillStyle = C.lime; ctx.fillText('requests / s', px + 20, py + 30);
    ctx.fillStyle = C.blue; ctx.fillText('p99 latency', px + 160, py + 30);
    const gx = (tt) => px + 20 + (tt / 4) * (pw - 40), gy = (v) => py + ph - 20 - v * (ph - 70);
    const rps = (tt) => 0.18 + 0.62 * smooth(P(tt, 1.3, 2.1)) + 0.04 * Math.sin(tt * 23) * Math.sin(tt * 7);
    const lat = (tt) => 0.2 + 0.03 * Math.sin(tt * 19) + 0.12 * Math.exp(-Math.pow((tt - 2.35) * 6, 2));
    [[rps, C.lime], [lat, C.blue]].forEach(([f, col]) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let k = 0; k <= 80; k++) { const tt = (k / 80) * Math.min(lt, 4); k ? ctx.lineTo(gx(tt), gy(f(tt))) : ctx.moveTo(gx(tt), gy(f(tt))); }
      ctx.stroke();
    });

    // ops log
    const logs = [
      [0.2, '$ terraform apply', C.dim], [0.5, '✓ region · 3 AZs · 9 nodes', C.lime], [0.8, 'scheduler: placed 30 pods', C.ink],
      [1.5, 'hpa: dispatch 6 → 14 replicas', C.ink], [1.6, 'autoscaler: +1 node in az-c', C.ink], [2.2, '✗ az-b/node-2 NotReady', C.coral],
      [2.5, 'evicting 6 pods → rescheduling', C.ink], [3.0, '✓ healed · zero downtime', C.lime],
    ];
    const ly = 560;
    rrect(px, ly, pw, 260, 16); ctx.fillStyle = '#0c0b10'; ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke();
    mono(14, 500);
    logs.forEach(([tt, s, col], i) => {
      if (lt < tt) return;
      ctx.fillStyle = col; ctx.fillText(s.slice(0, Math.ceil(P(lt, tt, tt + 0.25) * s.length)), px + 20, ly + 36 + i * 28);
    });
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /* ================================================================
   * 06 — MANIFESTO: a typographic tunnel, one word per beat
   * ================================================================ */
  const WORDS = ['DESIGN', 'BUILD', 'SCALE', 'AUTOMATE', 'OBSERVE', 'HARDEN', 'SHIP', 'REPEAT'];
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
    ctx.fillText(decode('SOFTWARE ARCHITECT  /  ENTERPRISE SYSTEMS  /  CLOUD INFRASTRUCTURE', P(lt, 0.6, 1.4), t), 960, 808);
    const ta = E.outCubic(P(lt, 1.1, 1.6));
    ctx.globalAlpha = ta; serif(46); ctx.fillStyle = C.ink;
    ctx.fillText('Started in motion design. Now I build what doesn’t fall over.', 960, 876 + (1 - ta) * 18);
    ctx.globalAlpha = P(lt, 1.4, 1.9); mono(18, 700); ctx.fillStyle = C.lime;
    ctx.fillText('xyphuz.com   ·   github.com/wst24365888', 960, 940);
    ctx.globalAlpha = 1;
  }

  const SCENES = [
    { s: 0, e: 4, id: '00', name: 'SIGNATURE', bg: C.bg, draw: sSign },
    { s: 4, e: 8, id: '01', name: 'IDENTITY', bg: C.bg, draw: sIdentity },
    { s: 8, e: 12, id: '02', name: 'SOFTWARE ENGINEER', bg: '#07080a', draw: sEng },
    { s: 12, e: 16, id: '03', name: 'SOFTWARE ARCHITECT', bg: '#05070f', draw: sArch },
    { s: 16, e: 20, id: '04', name: 'ENTERPRISE SYSTEMS', bg: FAB_BG, draw: sFab },
    { s: 20, e: 24, id: '05', name: 'CLOUD INFRASTRUCTURE', bg: '#07080d', draw: sCloud },
    { s: 24, e: 27, id: '06', name: 'MANIFESTO', bg: C.bg, draw: sManifesto },
    { s: 27, e: 30, id: '07', name: 'XYPHUZ', bg: C.bg, draw: sOutro },
  ];

  /* ---------- global layers ---------- */
  const FLASHES = [[4, 0.9], [24, 0.6], [27, 1]];
  const IMPACTS = [[4, 16], [16, 5], [22.2, 6], [24, 8], [27, 16]];

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
