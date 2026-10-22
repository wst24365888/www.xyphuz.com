/* XYPHUZ — Showreel 2026
 * A 30-second motion piece rendered live on <canvas>.
 * Every frame is a pure function of time t ∈ [0, 30), so the reel can be
 * scrubbed, paused and looped without any hidden state.
 */
(function () {
  'use strict';

  const W = 1920, H = 1080, DUR = 30, TAU = Math.PI * 2;

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
  const E = {
    outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    inExpo: (x) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
    inOutExpo: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
    outCubic: (x) => 1 - Math.pow(1 - x, 3),
    inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    outBack: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    outElastic: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (TAU / 3)) + 1),
  };
  function hash(a, b = 0) {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const spike = (t, times, k) => times.reduce((m, ti) => (t >= ti ? Math.max(m, Math.exp(-(t - ti) * k)) : m), 0);

  /* ---------- drawing helpers ---------- */
  let ctx, canvas, grain;
  const font = (px, w = 700) => (ctx.font = `${w} ${px}px ${FD}`);
  const mono = (px, w = 400) => (ctx.font = `${w} ${px}px ${FM}`);
  const serif = (px) => (ctx.font = `italic 400 ${px}px ${FS}`);

  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function dot(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }

  // Text slides up from behind a mask.
  function reveal(str, x, y, size, p, align = 'left') {
    if (p <= 0) return;
    const w = ctx.measureText(str).width;
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0 - 40, y - size * 1.0, w + 80, size * 1.25);
    ctx.clip();
    ctx.textAlign = align;
    ctx.fillText(str, x, y + (1 - p) * size * 1.2);
    ctx.restore();
  }

  // Lay out characters with manual tracking; returns positions relative to x=0.
  function glyphs(str, track) {
    const g = []; let x = 0;
    for (const ch of str) { const w = ctx.measureText(ch).width; g.push({ ch, x, w }); x += w + track; }
    return { g, w: x - track };
  }

  const GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+/<>=_';
  // "Decoding" text: settled chars, then a band of scrambled glyphs, then blanks.
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

  function drawSliced(fn, y0, y1, n, amt, seed) {
    if (amt < 0.5) { fn(); return; }
    const h = (y1 - y0) / n;
    for (let i = 0; i < n; i++) {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, y0 + i * h, W, h + 1); ctx.clip();
      ctx.translate((hash(i, seed) - 0.5) * 2 * amt * (0.3 + hash(i, seed + 7)), 0);
      fn();
      ctx.restore();
    }
  }

  function label(str, x, y, align = 'left', col = C.lime) {
    mono(18, 700); ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(str, x, y);
  }

  /* ---------- precomputed assets ---------- */
  let NAME = [];
  const ROWS = [];
  let CODE = [], CODE_TOTAL = 0;
  const SHAPES = [];
  const SHAPE_N = 180;

  function prepName() {
    const oc = document.createElement('canvas'); oc.width = W; oc.height = H;
    const o = oc.getContext('2d');
    o.font = `700 300px ${FD}`; o.textAlign = 'center'; o.fillStyle = '#fff';
    o.fillText('XYPHUZ', 960, 640);
    const d = o.getImageData(0, 0, W, H).data;
    NAME = [];
    let i = 0;
    for (let y = 380; y < 700; y += 6) {
      for (let x = 200; x < 1720; x += 6) {
        if (d[(y * W + x) * 4 + 3] > 128) {
          const a = hash(i, 1) * TAU, r = 650 + hash(i, 2) * 900;
          NAME.push({
            tx: x, ty: y,
            sx: 960 + Math.cos(a) * r, sy: 540 + Math.sin(a) * r * 0.7,
            d: hash(i, 3) * 0.35 + ((x - 560) / 800) * 0.35,
            s: 1.6 + hash(i, 4) * 2.4, lime: hash(i, 5) < 0.1, ph: hash(i, 6) * TAU,
          });
          i++;
        }
      }
    }
  }

  function prepRows() {
    const HEX = '0123456789abcdef';
    for (let i = 0; i < 26; i++) {
      let s = '';
      for (let j = 0; j < 170; j++) s += hash(i * 999 + j, 7) < 0.14 ? ' ' : HEX[Math.floor(hash(i, j) * 16)];
      ROWS.push(s);
    }
  }

  function prepCode() {
    const src = [
      'export function render(t: number) {',
      '  const scene = timeline.at(t);',
      '  const ease = cubicBezier(.16, 1, .3, 1);',
      '',
      '  for (const layer of scene.layers) {',
      '    layer.transform(ease(scene.progress));',
      '    layer.draw(ctx);',
      '  }',
      '',
      '  return ship(scene); // zero excuses',
      '}',
    ];
    const re = /(\/\/.*$)|\b(export|function|const|for|of|return)\b|\b(number)\b|(\d*\.?\d+)|([A-Za-z_]\w*)(?=\()|([A-Za-z_]\w*)|(\s+)|(.)/g;
    CODE = src.map((line) => {
      const toks = []; let m;
      re.lastIndex = 0;
      while ((m = re.exec(line))) {
        const c = m[1] ? C.dim : m[2] ? C.violet : m[3] ? C.yellow : m[4] ? C.coral : m[5] ? C.lime : m[6] ? C.ink : m[7] ? C.ink : '#a8a6b3';
        toks.push({ s: m[0], c });
      }
      return toks;
    });
    CODE_TOTAL = src.reduce((a, l) => a + l.length + 1, 0);
  }

  // Shapes sampled by ray-casting from the centre, so every shape has the
  // same angular parameterisation and morphs line up point-for-point.
  function polyRadius(verts, th) {
    const dx = Math.cos(th), dy = Math.sin(th);
    let best = Infinity;
    for (let i = 0; i < verts.length; i++) {
      const [ax, ay] = verts[i], [bx, by] = verts[(i + 1) % verts.length];
      const ex = bx - ax, ey = by - ay;
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const tt = (ax * ey - ay * ex) / den;
      const u = (ax * dy - ay * dx) / den;
      if (tt > 0 && u >= 0 && u <= 1) best = Math.min(best, tt);
    }
    return best === Infinity ? 1 : best;
  }
  const regular = (k, R, rot = -Math.PI / 2) => Array.from({ length: k }, (_, i) => [Math.cos(rot + (i / k) * TAU) * R, Math.sin(rot + (i / k) * TAU) * R]);
  const star = (k, R, r) => Array.from({ length: k * 2 }, (_, i) => { const a = -Math.PI / 2 + (i / (k * 2)) * TAU, rr = i % 2 ? r : R; return [Math.cos(a) * rr, Math.sin(a) * rr]; });

  function prepShapes() {
    const polys = [null, regular(3, 1.25), regular(4, 1.12, -Math.PI / 4), star(5, 1.25, 0.52), regular(6, 1.05), star(12, 1.18, 0.78), regular(4, 1.15), null];
    for (const poly of polys) {
      const pts = new Float32Array(SHAPE_N * 2);
      for (let i = 0; i < SHAPE_N; i++) {
        const th = -Math.PI / 2 + (i / SHAPE_N) * TAU;
        const r = poly ? polyRadius(poly, th) : 1;
        pts[i * 2] = Math.cos(th) * r; pts[i * 2 + 1] = Math.sin(th) * r;
      }
      SHAPES.push(pts);
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
   * SCENES — each draws in a 1920×1080 virtual space; lt = local time
   * ================================================================ */

  /* 00 — BOOT */
  function sBoot(lt, t) {
    const cx = 960, cy = 540;
    const collapse = E.inExpo(P(lt, 2.4, 2.75));
    const fade = 1 - P(lt, 2.35, 2.65);

    // beat rings
    ctx.strokeStyle = C.lime; ctx.lineWidth = 2;
    for (let b = 0; b < 6; b++) {
      const q = P(lt, b * 0.5, b * 0.5 + 0.9);
      if (q <= 0 || q >= 1) continue;
      ctx.globalAlpha = (1 - q) * 0.45 * fade;
      dot(cx, cy, 10 + E.outCubic(q) * 170); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const half = E.inOutExpo(P(lt, 0.35, 1.1)) * 720 * (1 - collapse);
    if (half < 8) {
      const s = E.outBack(P(lt, 0, 0.35)) * (1 - P(lt, 2.7, 2.8));
      ctx.fillStyle = C.lime; dot(cx, cy, 9 * s); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(243,240,232,.22)';
      ctx.fillRect(cx - half, cy - 1, half * 2, 2);
      for (let i = -14; i <= 14; i++) {
        const x = cx + i * 50;
        if (Math.abs(x - cx) > half) continue;
        ctx.fillRect(x - 1, cy + 12, 2, i % 5 === 0 ? 18 : 8);
      }
      const pr = E.inOutCubic(P(lt, 1.2, 2.3));
      ctx.fillStyle = C.lime;
      ctx.fillRect(cx - half, cy - 2, half * 2 * pr, 4);
      const hx = cx - half + half * 2 * pr;
      ctx.globalAlpha = 0.35; dot(hx, cy, 14); ctx.fill(); ctx.globalAlpha = 1;
    }

    // terminal
    ctx.globalAlpha = fade;
    mono(26, 500); ctx.textAlign = 'left';
    const x0 = cx - 720, y0 = cy - 64;
    const prompt = '~/xyphuz $ ';
    ctx.fillStyle = C.dim; ctx.fillText(prompt, x0, y0);
    const pw = ctx.measureText(prompt).width;
    const cmd = 'reel render --fps 24 --bpm 120 --vibe max';
    const n = Math.floor(P(lt, 0.45, 1.5) * cmd.length);
    ctx.fillStyle = C.ink; ctx.fillText(cmd.slice(0, n), x0 + pw, y0);
    const cw = ctx.measureText('M').width;
    if (n < cmd.length || Math.floor(t * 4) % 2) { ctx.fillStyle = C.lime; ctx.fillRect(x0 + pw + n * cw + 2, y0 - 24, cw, 30); }

    const pr = Math.round(E.inOutCubic(P(lt, 1.2, 2.3)) * 100);
    if (lt > 1.15) {
      ctx.textAlign = 'right'; ctx.fillStyle = C.lime; font(64, 700);
      ctx.fillText(pad(pr, 3) + '%', cx + 720, y0 + 6);
    }

    const outs = ['load    engineer.core', 'link    architect.graph', 'compile motion.curves', 'ship    product.build'];
    mono(20, 400); ctx.textAlign = 'left';
    outs.forEach((s, i) => {
      const a = P(lt, 1.45 + i * 0.2, 1.6 + i * 0.2);
      if (a <= 0) return;
      ctx.globalAlpha = a * fade;
      const y = cy + 82 + i * 34;
      ctx.fillStyle = C.lime; ctx.fillText('✓', x0, y);
      ctx.fillStyle = C.dim; ctx.fillText(s, x0 + 34, y);
      ctx.fillStyle = 'rgba(243,240,232,.35)'; ctx.textAlign = 'right';
      ctx.fillText((12 + hash(i, 40) * 80).toFixed(0) + 'ms', cx - 220, y); ctx.textAlign = 'left';
    });
    ctx.globalAlpha = 1;

    // iris punch-through into the title
    const ir = E.inExpo(P(lt, 2.62, 3.0)) * 1250;
    if (ir > 0) { ctx.fillStyle = C.ink; dot(cx, cy, ir); ctx.fill(); }
  }

  /* 01 — IDENTITY */
  function ring(cx, cy, r, lt, a) {
    const n = 144, shown = Math.floor(n * E.outCubic(P(lt, 0, 1.4)));
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(lt * 0.12);
    ctx.strokeStyle = C.ink; ctx.globalAlpha = a; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < shown; i++) {
      const an = (i / n) * TAU, L = i % 12 === 0 ? 26 : i % 3 === 0 ? 12 : 6;
      const c = Math.cos(an), s = Math.sin(an);
      ctx.moveTo(c * r, s * r); ctx.lineTo(c * (r + L), s * (r + L));
    }
    ctx.stroke();
    ctx.rotate(-lt * 0.4);
    ctx.strokeStyle = C.lime; ctx.globalAlpha = a * 2; ctx.lineWidth = 3;
    const g = E.outCubic(P(lt, 0.3, 1.4));
    ctx.beginPath(); ctx.arc(0, 0, r - 30, 0, TAU * 0.2 * g); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r - 30, Math.PI, Math.PI + TAU * 0.07 * g); ctx.stroke();
    ctx.globalAlpha = a; ctx.lineWidth = 1; ctx.strokeStyle = C.ink;
    ctx.setLineDash([2, 10]); ctx.beginPath(); ctx.arc(0, 0, r + 70, 0, TAU * g); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }

  function sName(lt, t) {
    const cx = 960;
    const ex = P(lt, 3.35, 3.95), exE = E.inExpo(ex);
    ring(cx, 540, 430, lt, 0.2 * (1 - ex));

    const solid = E.outCubic(P(lt, 1.1, 1.55));
    // particles
    for (const pass of [false, true]) {
      ctx.fillStyle = pass ? C.lime : C.ink;
      ctx.globalAlpha = clamp(lerp(1, 0.16, solid) + exE);
      for (const p of NAME) {
        if (p.lime !== pass) continue;
        const q = E.outExpo(P(lt, p.d, p.d + 1.0));
        if (q <= 0) continue;
        const dx = p.sx - p.tx, dy = p.sy - p.ty, an = (1 - q) * 2.2;
        const c = Math.cos(an), s = Math.sin(an);
        let x = p.tx + (dx * c - dy * s) * (1 - q), y = p.ty + (dx * s + dy * c) * (1 - q);
        x += Math.sin(t * 6 + p.ph) * 1.4 * solid;
        if (exE > 0) { x += (p.tx - 960) * exE * 1.6 + (hash(p.tx, p.ty) - 0.5) * 900 * exE; y += (p.ty - 540) * exE * 2.4; }
        ctx.fillRect(x, y, p.s, p.s);
      }
    }
    ctx.globalAlpha = 1;

    // solid wordmark with chromatic split + glitch slicing
    if (solid > 0 && ex < 1) {
      const sp = spike(t, [4.5, 5.25, 6.0, 6.5], 12);
      const ab = 26 * (1 - E.outExpo(P(lt, 1.1, 2.2))) + 16 * sp;
      font(300);
      ctx.textAlign = 'center';
      drawSliced(() => {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = solid * (1 - ex);
        ctx.fillStyle = '#ff1f4b'; ctx.fillText('XYPHUZ', cx - ab, 640);
        ctx.fillStyle = '#1fff9a'; ctx.fillText('XYPHUZ', cx, 640);
        ctx.fillStyle = '#2f6bff'; ctx.fillText('XYPHUZ', cx + ab, 640);
      }, 400, 660, 14, exE * 300 + sp * 40, Math.floor(t * 12));
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }

    // brackets
    const bk = E.outExpo(P(lt, 0.9, 1.6)) * (1 - ex);
    if (bk > 0) {
      ctx.strokeStyle = C.lime; ctx.lineWidth = 4; ctx.globalAlpha = bk;
      const bx = lerp(900, 640, bk);
      for (const sgn of [-1, 1]) {
        const x = cx + sgn * bx;
        ctx.beginPath(); ctx.moveTo(x - sgn * 30, 400); ctx.lineTo(x, 400); ctx.lineTo(x, 680); ctx.lineTo(x - sgn * 30, 680); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    ctx.globalAlpha = P(lt, 0.6, 1.0) * (1 - ex);
    label('[ 01 ]  HELLO, WORLD — I AM', cx, 360, 'center');
    ctx.globalAlpha = 1 - ex;
    mono(24, 500); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.fillText(decode('SOFTWARE ENGINEER  /  ARCHITECT  /  MOTION DESIGNER  /  PRODUCT BUILDER', P(lt, 1.4, 2.4), t), cx, 740);
    ctx.globalAlpha = E.outCubic(P(lt, 2.1, 2.6)) * (1 - ex);
    serif(40); ctx.fillStyle = C.dim;
    ctx.fillText('a.k.a. Hsing-Han Wu', cx, 805 + (1 - P(lt, 2.1, 2.6)) * 20);
    ctx.globalAlpha = 1;
  }

  /* 02 — SOFTWARE ENGINEER */
  function sEng(lt, t) {
    // data stream
    mono(20); ctx.textAlign = 'left'; ctx.fillStyle = C.ink; ctx.globalAlpha = 0.055;
    ROWS.forEach((s, i) => {
      const sp = 4 + hash(i, 9) * 14, dir = i % 2 ? 1 : -1;
      const off = ((Math.floor(lt * sp * dir) % s.length) + s.length) % s.length;
      ctx.fillText((s.slice(off) + s.slice(0, off)).slice(0, 150), 0, 30 + i * 42);
    });
    ctx.globalAlpha = 1;

    // editor
    const px = 120 - (1 - E.outExpo(P(lt, 0, 0.8))) * 1100, py = 210, pw = 880, ph = 620;
    ctx.fillStyle = C.panel; rrect(px, py, pw, ph, 20); ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
    [C.coral, C.yellow, C.lime].forEach((c, i) => { ctx.fillStyle = c; dot(px + 36 + i * 26, py + 34, 7); ctx.fill(); });
    mono(18); ctx.fillStyle = C.dim; ctx.fillText('timeline.ts', px + 130, py + 40);
    ctx.fillStyle = C.line; ctx.fillRect(px, py + 64, pw, 2);

    mono(25);
    const cw = ctx.measureText('M').width, lh = 42, x0 = px + 90, y0 = py + 120;
    let budget = Math.floor(P(lt, 0.3, 2.5) * CODE_TOTAL);
    let cur = null;
    CODE.forEach((toks, li) => {
      if (budget <= 0) return;
      const y = y0 + li * lh;
      const len = toks.reduce((a, k) => a + k.s.length, 0);
      if (budget <= len + 1 && !cur) cur = { li, col: Math.min(budget, len), y };
      ctx.textAlign = 'right'; ctx.fillStyle = C.dim; ctx.globalAlpha = 0.5;
      ctx.fillText(String(li + 1), px + 60, y);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
      let col = 0, rem = budget;
      for (const k of toks) {
        if (rem <= 0) break;
        const s = k.s.slice(0, rem);
        ctx.fillStyle = k.c; ctx.fillText(s, x0 + col * cw, y);
        col += s.length; rem -= s.length;
      }
      budget -= len + 1;
    });
    if (!cur) cur = { col: 1, y: y0 + (CODE.length - 1) * lh };
    ctx.fillStyle = 'rgba(212,255,58,.06)'; ctx.fillRect(px + 2, cur.y - 30, pw - 4, 42);
    if (lt < 2.5 || Math.floor(t * 4) % 2) { ctx.fillStyle = C.lime; ctx.fillRect(x0 + cur.col * cw + 2, cur.y - 25, 3, 32); }

    const sb = E.outExpo(P(lt, 2.55, 3.0));
    if (sb > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(px, py + ph - 60, pw, 60); ctx.clip();
      ctx.translate(0, (1 - sb) * 60);
      ctx.fillStyle = 'rgba(212,255,58,.12)'; ctx.fillRect(px, py + ph - 60, pw, 60);
      mono(18, 700); ctx.fillStyle = C.lime;
      ctx.fillText('✓ 248 tests passed    ● build 1.18s    ● 0 warnings', px + 30, py + ph - 24);
      ctx.restore();
    }

    // headline
    const X = 1080;
    ctx.globalAlpha = P(lt, 0.1, 0.4); label('[ 02 ]  CRAFT', X, 330); ctx.globalAlpha = 1;
    font(140); ctx.fillStyle = C.ink;
    reveal('SOFTWARE', X, 480, 140, E.outExpo(P(lt, 0.15, 0.9)));
    ctx.fillStyle = C.lime;
    reveal('ENGINEER', X, 625, 140, E.outExpo(P(lt, 0.3, 1.05)));
    ctx.globalAlpha = P(lt, 0.9, 1.4);
    serif(46); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    ctx.fillText('clean code. fast systems. no excuses.', X, 705);
    ctx.globalAlpha = 1;

    const chips = ['TypeScript', 'Rust', 'Go', 'Python', 'Svelte', 'React', 'WebGL', 'Kubernetes'];
    mono(19, 500);
    let cx = X, cy = 760;
    chips.forEach((c, i) => {
      const w = ctx.measureText(c).width + 40;
      if (cx + w > 1820) { cx = X; cy += 60; }
      const s = E.outBack(P(lt, 1.3 + i * 0.08, 1.7 + i * 0.08));
      if (s > 0) {
        ctx.save(); ctx.translate(cx + w / 2, cy + 22); ctx.scale(s, s);
        rrect(-w / 2, -22, w, 44, 22);
        ctx.strokeStyle = i === 0 ? C.lime : 'rgba(243,240,232,.35)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = i === 0 ? C.lime : C.ink; ctx.textAlign = 'center'; ctx.fillText(c, 0, 7);
        ctx.restore();
      }
      cx += w + 14;
    });
  }

  /* 03 — SOFTWARE ARCHITECT */
  const NODES = [
    { l: 'Client', x: 860, y: 540, L: 0 },
    { l: 'Edge / CDN', x: 1080, y: 390, L: 1 },
    { l: 'API Gateway', x: 1080, y: 690, L: 1 },
    { l: 'Auth', x: 1310, y: 300, L: 2 },
    { l: 'Users', x: 1310, y: 540, L: 2 },
    { l: 'Orders', x: 1310, y: 780, L: 2 },
    { l: 'Redis', x: 1540, y: 300, L: 3 },
    { l: 'Postgres', x: 1540, y: 540, L: 3 },
    { l: 'Kafka', x: 1540, y: 780, L: 3 },
    { l: 'Analytics', x: 1750, y: 420, L: 4 },
    { l: 'Workers', x: 1750, y: 780, L: 4 },
  ];
  const EDGES = [[0, 1], [0, 2], [1, 3], [2, 4], [2, 5], [3, 6], [4, 7], [4, 6], [5, 7], [5, 8], [7, 9], [8, 10]];
  const nodeT = (i) => 0.3 + NODES[i].L * 0.28 + hash(i, 30) * 0.12;

  function bez(a, b, u) {
    const x0 = a.x + 85, y0 = a.y, x3 = b.x - 85, y3 = b.y, mx = (x0 + x3) / 2;
    const v = 1 - u;
    return [v * v * v * x0 + 3 * v * v * u * mx + 3 * v * u * u * mx + u * u * u * x3,
            v * v * v * y0 + 3 * v * v * u * y0 + 3 * v * u * u * y3 + u * u * u * y3];
  }

  function sArch(lt, t) {
    // dot grid
    ctx.fillStyle = 'rgba(111,140,255,.16)';
    for (let x = 24; x < W; x += 48) for (let y = 24; y < H; y += 48) ctx.fillRect(x - 1, y - 1, 2, 2);

    // left column
    ctx.globalAlpha = P(lt, 0.1, 0.4); label('[ 03 ]  SYSTEMS', 120, 330); ctx.globalAlpha = 1;
    font(100); ctx.fillStyle = C.ink;
    reveal('SOFTWARE', 120, 450, 100, E.outExpo(P(lt, 0.1, 0.85)));
    ctx.fillStyle = C.blue;
    reveal('ARCHITECT', 120, 555, 100, E.outExpo(P(lt, 0.25, 1.0)));
    ctx.globalAlpha = P(lt, 0.8, 1.3); serif(40); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    ctx.fillText('systems that scale, by design.', 120, 625);
    ctx.globalAlpha = 1;

    const m = E.outExpo(P(lt, 1.2, 2.8));
    const stats = [
      ['P99 LATENCY', Math.round(lerp(480, 42, m)) + 'ms'],
      ['THROUGHPUT', Math.round(lerp(0, 120, m)) + 'k rps'],
      ['UPTIME', lerp(90, 99.99, m).toFixed(2) + '%'],
    ];
    stats.forEach(([k, v], i) => {
      const a = P(lt, 1.1 + i * 0.12, 1.4 + i * 0.12);
      if (a <= 0) return;
      ctx.globalAlpha = a;
      const y = 710 + i * 92;
      ctx.fillStyle = C.line; ctx.fillRect(120, y - 26, 560, 1);
      mono(15, 700); ctx.fillStyle = C.dim; ctx.textAlign = 'left'; ctx.fillText(k, 120, y);
      font(46); ctx.fillStyle = i === 2 ? C.lime : C.ink; ctx.fillText(v, 120, y + 50);
    });
    ctx.globalAlpha = 1;

    // graph with a zoom-out reveal
    ctx.save();
    const z = lerp(1.45, 1, E.inOutCubic(P(lt, 0, 1.7)));
    ctx.translate(860, 540); ctx.scale(z, z); ctx.translate(-860 - P(lt, 0, 4) * 20, -540);

    ctx.lineWidth = 2;
    EDGES.forEach(([a, b]) => {
      const e0 = nodeT(a) + 0.3, pr = E.inOutCubic(P(lt, e0, e0 + 0.45));
      if (pr <= 0) return;
      ctx.strokeStyle = 'rgba(111,140,255,.55)';
      ctx.beginPath();
      const steps = Math.ceil(30 * pr);
      for (let k = 0; k <= steps; k++) {
        const [x, y] = bez(NODES[a], NODES[b], Math.min(k / 30, pr));
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    });

    ctx.globalCompositeOperation = 'lighter';
    EDGES.forEach(([a, b], ei) => {
      const live = P(lt, nodeT(a) + 0.75, nodeT(a) + 0.9);
      if (live <= 0) return;
      for (let k = 0; k < 3; k++) {
        const u = fract(lt * (0.55 + hash(ei, 33) * 0.4) + k / 3 + hash(ei, 34));
        const [x, y] = bez(NODES[a], NODES[b], u);
        const col = (ei + k) % 4 === 0 ? C.coral : C.lime;
        ctx.fillStyle = col; ctx.globalAlpha = 0.2 * live; dot(x, y, 12); ctx.fill();
        ctx.globalAlpha = live; dot(x, y, 4); ctx.fill();
      }
    });
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

    NODES.forEach((n, i) => {
      const s = E.outBack(P(lt, nodeT(i), nodeT(i) + 0.45));
      if (s <= 0) return;
      ctx.save(); ctx.translate(n.x, n.y); ctx.scale(s, s);
      rrect(-85, -30, 170, 60, 14);
      ctx.fillStyle = '#0d1020'; ctx.fill();
      ctx.strokeStyle = i === 0 ? C.lime : 'rgba(111,140,255,.8)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = Math.floor(t * 3 + i) % 5 ? C.lime : 'rgba(212,255,58,.3)';
      dot(-64, 0, 5); ctx.fill();
      mono(17, 500); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(n.l, -50, 6);
      ctx.restore();
    });
    ctx.restore();
  }

  /* 04 — MOTION DESIGNER */
  const MCOL = [C.lime, C.coral, C.blue, C.violet, C.yellow, C.lime, C.coral, C.blue];
  function morphAt(lt) {
    const k = Math.max(0, (lt - 0.2) / 0.5);
    const i = Math.floor(k), f = fract(k);
    const m = E.inOutExpo(clamp(f / 0.6));
    const a = SHAPES[i % SHAPES.length], b = SHAPES[(i + 1) % SHAPES.length];
    return { a, b, m, rot: lt * 0.6 + (i + m) * (Math.PI / 6), sc: 1 + 0.1 * Math.sin(m * Math.PI), i };
  }
  function shapePath(cx, cy, R, mo) {
    const c = Math.cos(mo.rot), s = Math.sin(mo.rot), r = R * mo.sc;
    ctx.beginPath();
    for (let j = 0; j < SHAPE_N; j++) {
      const x = lerp(mo.a[j * 2], mo.b[j * 2], mo.m), y = lerp(mo.a[j * 2 + 1], mo.b[j * 2 + 1], mo.m);
      const px = cx + (x * c - y * s) * r, py = cy + (x * s + y * c) * r;
      j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  }
  function mixHex(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(lerp(pa >> 16, pb >> 16, t)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t)), bl = Math.round(lerp(pa & 255, pb & 255, t));
    return `rgb(${r},${g},${bl})`;
  }

  function sMotion(lt, t) {
    // title — per-letter elastic drop with a travelling gradient
    font(118);
    const str = 'MOTION DESIGNER';
    const { g, w } = glyphs(str, 6);
    const gr = ctx.createLinearGradient(960 - w / 2, 0, 960 + w / 2, 0);
    const sh = fract(lt * 0.35);
    gr.addColorStop(0, C.ink); gr.addColorStop(clamp(0.35 + sh * 0.2), C.ink);
    gr.addColorStop(clamp(0.5 + sh * 0.2), C.lime); gr.addColorStop(clamp(0.75 + sh * 0.2), C.violet); gr.addColorStop(1, C.coral);
    ctx.fillStyle = gr; ctx.textAlign = 'left';
    g.forEach((c, i) => {
      const q = P(lt, 0.03 * i, 0.03 * i + 1.0);
      if (q <= 0) return;
      const y = 235 - (1 - E.outElastic(q)) * 260;
      ctx.save(); ctx.translate(960 - w / 2 + c.x + c.w / 2, y); ctx.rotate((1 - E.outElastic(q)) * (hash(i, 50) - 0.5) * 1.2);
      ctx.fillText(c.ch, -c.w / 2, 0); ctx.restore();
    });
    ctx.globalAlpha = P(lt, 0, 0.3); label('[ 04 ]  KINETICS', 960, 112, 'center'); ctx.globalAlpha = 1;

    // morph with motion trail
    const cx = 960, cy = 600, R = 175;
    const intro = E.outBack(P(lt, 0, 0.4));
    const mo = morphAt(lt);
    for (let j = 6; j >= 1; j--) {
      const mj = morphAt(Math.max(0, lt - j * 0.035));
      shapePath(cx, cy, R * intro, mj);
      ctx.strokeStyle = MCOL[mj.i % MCOL.length]; ctx.globalAlpha = 0.4 * (1 - j / 7); ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    shapePath(cx, cy, R * intro, mo);
    const col = mixHex(MCOL[mo.i % MCOL.length], MCOL[(mo.i + 1) % MCOL.length], mo.m);
    const gg = ctx.createRadialGradient(cx - 60, cy - 80, 10, cx, cy, R * 1.3);
    gg.addColorStop(0, '#ffffff'); gg.addColorStop(0.25, col); gg.addColorStop(1, col);
    ctx.fillStyle = gg; ctx.fill();
    // orbit
    ctx.strokeStyle = 'rgba(243,240,232,.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, 300, 90, -0.25, 0, TAU); ctx.stroke();
    for (let k = 0; k < 3; k++) {
      const a = lt * 1.6 + (k * TAU) / 3;
      const ox = Math.cos(a) * 300, oy = Math.sin(a) * 90, cr = Math.cos(-0.25), sr = Math.sin(-0.25);
      ctx.fillStyle = PAL[k + 1]; dot(cx + ox * cr - oy * sr, cy + ox * sr + oy * cr, 8); ctx.fill();
    }

    easingPanel(120, 520, 400, 320, lt);
    torus(1640, 640, lt, E.outCubic(P(lt, 0.3, 1.0)));
    mono(15); ctx.fillStyle = C.dim; ctx.textAlign = 'center'; ctx.globalAlpha = P(lt, 0.8, 1.2);
    ctx.fillText('particles · 3D · shaders', 1640, 860); ctx.globalAlpha = 1;
    keyframes(640, 905, 640, lt);
  }

  function easingPanel(x, y, w, h, lt) {
    const a = E.outCubic(P(lt, 0.2, 0.6));
    ctx.save(); ctx.globalAlpha = a; ctx.translate((1 - a) * -60, 0);
    rrect(x, y, w, h, 18); ctx.fillStyle = '#120e1a'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
    const pd = 36, gx = x + pd, gy = y + pd, gw = w - pd * 2, gh = h - pd * 2 - 34;
    ctx.strokeStyle = 'rgba(243,240,232,.07)'; ctx.lineWidth = 1;
    for (let k = 0; k <= 4; k++) {
      ctx.beginPath(); ctx.moveTo(gx + (k / 4) * gw, gy); ctx.lineTo(gx + (k / 4) * gw, gy + gh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx, gy + (k / 4) * gh); ctx.lineTo(gx + gw, gy + (k / 4) * gh); ctx.stroke();
    }
    const B = (u, p1, p2) => 3 * p1 * u * (1 - u) * (1 - u) + 3 * p2 * u * u * (1 - u) + u * u * u;
    const map = (u, v) => [gx + u * gw, gy + gh - v * gh];
    ctx.strokeStyle = C.coral; ctx.lineWidth = 2;
    let [ax, ay] = map(0, 0), [bx, by] = map(0.16, 1);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = C.coral; dot(bx, by, 7); ctx.fill();
    [ax, ay] = map(1, 1); [bx, by] = map(0.3, 1);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); dot(bx, by, 7); ctx.fill();

    const dp = E.outCubic(P(lt, 0.3, 1.1));
    ctx.strokeStyle = C.lime; ctx.lineWidth = 4; ctx.beginPath();
    for (let k = 0; k <= Math.ceil(60 * dp); k++) {
      const u = Math.min(1, k / 60);
      const [px, py] = map(B(u, 0.16, 0.3), B(u, 1, 1));
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();

    const u = fract(lt / 1.3);
    const [px, py] = map(B(u, 0.16, 0.3), B(u, 1, 1));
    ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(243,240,232,.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, gy + gh); ctx.moveTo(px, py); ctx.lineTo(gx, py); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; dot(px, py, 8); ctx.fill();

    const ty = gy + gh + 30;
    ctx.fillStyle = 'rgba(243,240,232,.12)'; ctx.fillRect(gx, ty - 1, gw, 2);
    ctx.fillStyle = 'rgba(243,240,232,.35)'; dot(gx + u * gw, ty, 6); ctx.fill();
    ctx.fillStyle = C.lime; dot(gx + B(u, 1, 1) * gw, ty, 9); ctx.fill();
    mono(15); ctx.fillStyle = C.dim; ctx.textAlign = 'left';
    ctx.fillText('cubic-bezier(.16, 1, .3, 1)', x, y + h + 30);
    ctx.restore();
  }

  function torus(cx, cy, lt, alpha) {
    if (alpha <= 0) return;
    const R = 150, r = 58, nu = 32, nv = 12;
    const ax = lt * 0.9 + 0.6, ay = lt * 0.7;
    const ca = Math.cos(ax), sa = Math.sin(ax), cb = Math.cos(ay), sb = Math.sin(ay);
    ctx.globalCompositeOperation = 'lighter';
    for (let u = 0; u < nu; u++) {
      const U = (u / nu) * TAU;
      for (let v = 0; v < nv; v++) {
        const V = (v / nv) * TAU + lt * 1.5;
        const x = (R + r * Math.cos(V)) * Math.cos(U), y = (R + r * Math.cos(V)) * Math.sin(U), z = r * Math.sin(V);
        const y2 = y * ca - z * sa, z2 = y * sa + z * ca;
        const x3 = x * cb + z2 * sb, z3 = -x * sb + z2 * cb;
        const f = 700 / (700 + z3), depth = clamp((z3 + 210) / 420);
        ctx.fillStyle = depth < 0.5 ? C.lime : C.violet;
        ctx.globalAlpha = alpha * (1 - depth * 0.75);
        const s = 3.4 * f;
        ctx.fillRect(cx + x3 * f - s / 2, cy + y2 * f - s / 2, s, s);
      }
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }

  function keyframes(x, y, w, lt) {
    const a = P(lt, 0.4, 0.8);
    if (a <= 0) return;
    ctx.globalAlpha = a;
    const rows = ['position', 'scale', 'rotate', 'opacity'];
    const ph = x + (lt / 4) * w;
    mono(13);
    rows.forEach((r, ri) => {
      const yy = y + ri * 22;
      ctx.fillStyle = C.dim; ctx.textAlign = 'right'; ctx.fillText(r, x - 14, yy + 4);
      ctx.fillStyle = 'rgba(243,240,232,.1)'; ctx.fillRect(x, yy, w, 1);
      for (let k = 0; k < 7; k++) {
        const kx = x + ((k + 0.5 + (hash(ri, k + 60) - 0.5) * 0.6) / 7) * w;
        ctx.fillStyle = kx < ph ? PAL[ri] : 'rgba(243,240,232,.3)';
        ctx.save(); ctx.translate(kx, yy); ctx.rotate(Math.PI / 4); ctx.fillRect(-5, -5, 10, 10); ctx.restore();
      }
    });
    ctx.fillStyle = C.coral; ctx.fillRect(ph - 1, y - 16, 2, 3 * 22 + 26);
    ctx.beginPath(); ctx.moveTo(ph - 7, y - 22); ctx.lineTo(ph + 7, y - 22); ctx.lineTo(ph, y - 12); ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* 05 — PRODUCT BUILDER */
  const WIRE = 'rgba(243,240,232,.32)';
  function paint(fill, col) {
    if (fill) { ctx.fillStyle = col; ctx.fill(); } else { ctx.strokeStyle = WIRE; ctx.lineWidth = 2; ctx.stroke(); }
  }
  function phone(x, y, w, h, fill, mrr) {
    rrect(x, y, w, h, 46);
    if (fill) { ctx.fillStyle = '#15131a'; ctx.fill(); ctx.strokeStyle = '#2e2b36'; ctx.lineWidth = 3; ctx.stroke(); }
    else { ctx.setLineDash([8, 8]); paint(false); ctx.setLineDash([]); }
    rrect(x + w / 2 - 50, y + 16, 100, 26, 13); paint(fill, '#000');
    dot(x + 46, y + 92, 20); paint(fill, C.coral);
    if (fill) { font(24); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText('Hey, Xyphuz', x + 78, y + 100); }
    else { rrect(x + 78, y + 85, 140, 14, 7); paint(false); }
    rrect(x + 22, y + 132, w - 44, 190, 24);
    if (fill) {
      const g = ctx.createLinearGradient(x, y + 132, x + w, y + 322);
      g.addColorStop(0, C.lime); g.addColorStop(1, '#3ddc84'); ctx.fillStyle = g; ctx.fill();
      mono(14, 700); ctx.fillStyle = '#0b0b0b'; ctx.textAlign = 'left'; ctx.fillText('MONTHLY REVENUE', x + 46, y + 172);
      font(54); ctx.fillText('$' + mrr + 'k', x + 44, y + 234);
      ctx.strokeStyle = '#0b0b0b'; ctx.lineWidth = 3; ctx.beginPath();
      for (let k = 0; k < 12; k++) { const px = x + 46 + k * 21, py = y + 292 - k * 3.5 - hash(k, 70) * 18; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    } else paint(false);
    for (let i = 0; i < 4; i++) {
      const ry = y + 350 + i * 72;
      dot(x + 48, ry + 22, 18); paint(fill, PAL[i]);
      rrect(x + 80, ry + 10, 120 + hash(i, 71) * 80, 12, 6); paint(fill, '#3a3742');
      rrect(x + 80, ry + 30, 70 + hash(i, 72) * 60, 10, 5); paint(fill, '#26242c');
    }
    rrect(x + 22, y + h - 76, w - 44, 54, 27); paint(fill, '#211f28');
    for (let k = 0; k < 4; k++) { dot(x + 70 + k * ((w - 140) / 3), y + h - 49, 7); paint(fill, k === 0 ? C.lime : '#55525e'); }
  }
  function card(x, y, w, h, fill, title, lt, kind) {
    rrect(x, y, w, h, 24);
    if (fill) { ctx.fillStyle = '#15131a'; ctx.fill(); ctx.strokeStyle = '#2e2b36'; ctx.lineWidth = 2; ctx.stroke(); }
    else { ctx.setLineDash([8, 8]); paint(false); ctx.setLineDash([]); }
    if (fill) { mono(15, 700); ctx.fillStyle = C.dim; ctx.textAlign = 'left'; ctx.fillText(title, x + 30, y + 46); }
    else { rrect(x + 30, y + 32, 160, 14, 7); paint(false); }
    const ax = x + 30, ay = y + 80, aw = w - 60, ah = h - 110;
    if (kind === 'line') {
      const N = 28, pts = [];
      for (let i = 0; i < N; i++) pts.push([ax + (i / (N - 1)) * aw, ay + ah - (0.12 + 0.72 * Math.pow(i / (N - 1), 1.6) + (hash(i, 73) - 0.5) * 0.14) * ah]);
      if (!fill) {
        ctx.setLineDash([6, 8]); ctx.strokeStyle = WIRE; ctx.lineWidth = 2;
        ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke(); ctx.setLineDash([]);
        return;
      }
      const pr = E.inOutCubic(P(lt, 1.6, 2.7)), n = pr * (N - 1);
      if (pr <= 0) return;
      const vis = pts.slice(0, Math.floor(n) + 1);
      const f = n - Math.floor(n), nx = pts[Math.min(N - 1, Math.floor(n) + 1)];
      const end = [lerp(vis[vis.length - 1][0], nx[0], f), lerp(vis[vis.length - 1][1], nx[1], f)];
      vis.push(end);
      const g = ctx.createLinearGradient(0, ay, 0, ay + ah);
      g.addColorStop(0, 'rgba(255,77,46,.35)'); g.addColorStop(1, 'rgba(255,77,46,0)');
      ctx.beginPath(); vis.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.lineTo(end[0], ay + ah); ctx.lineTo(ax, ay + ah); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); vis.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.strokeStyle = C.coral; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = C.coral; dot(end[0], end[1], 7); ctx.fill();
      ctx.globalAlpha = 0.3; dot(end[0], end[1], 7 + fract(lt * 2) * 16); ctx.fill(); ctx.globalAlpha = 1;
      font(40); ctx.fillStyle = C.ink; ctx.textAlign = 'right';
      ctx.fillText((pr * 1.2).toFixed(1) + 'M', x + w - 30, y + 54);
    } else {
      const N = 10, bw = aw / N - 12;
      for (let i = 0; i < N; i++) {
        const hh = (0.25 + 0.65 * (i / (N - 1)) + (hash(i, 74) - 0.5) * 0.2) * ah;
        const s = fill ? E.outBack(P(lt, 1.8 + i * 0.05, 2.2 + i * 0.05)) : 1;
        const bx = ax + i * (aw / N) + 6;
        rrect(bx, ay + ah - hh * s, bw, Math.max(1, hh * s), 6);
        if (fill) { ctx.fillStyle = i === N - 1 ? C.lime : '#3a3742'; ctx.fill(); }
        else { ctx.setLineDash([6, 6]); paint(false); ctx.setLineDash([]); }
      }
    }
  }

  function sProduct(lt, t) {
    // stepper
    const steps = ['IDEA', 'DESIGN', 'BUILD', 'SHIP'];
    const act = Math.min(3, Math.floor(P(lt, 0, 2.6) * 4));
    ctx.globalAlpha = P(lt, 0, 0.3);
    steps.forEach((s, i) => {
      const x = 1000 + i * 260, y = 135;
      if (i < 3) {
        ctx.fillStyle = 'rgba(243,240,232,.15)'; ctx.fillRect(x + 20, y - 1, 220, 2);
        ctx.fillStyle = C.coral; ctx.fillRect(x + 20, y - 1, 220 * clamp(P(lt, 0, 2.6) * 4 - i), 2);
      }
      dot(x, y, 14);
      if (i < act) { ctx.fillStyle = C.coral; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x - 1, y + 5); ctx.lineTo(x + 7, y - 5); ctx.stroke(); }
      else if (i === act) { ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.stroke(); ctx.globalAlpha = 0.4 * (1 - fract(lt * 2)); dot(x, y, 14 + fract(lt * 2) * 14); ctx.stroke(); ctx.globalAlpha = 1; }
      else { ctx.strokeStyle = 'rgba(243,240,232,.3)'; ctx.lineWidth = 2; ctx.stroke(); }
      mono(15, 700); ctx.fillStyle = i <= act ? C.ink : C.dim; ctx.textAlign = 'center'; ctx.fillText(s, x, y + 44);
    });
    ctx.globalAlpha = 1;

    // left column
    ctx.globalAlpha = P(lt, 0.1, 0.4); label('[ 05 ]  0 → 1 → ∞', 120, 330); ctx.globalAlpha = 1;
    font(120); ctx.fillStyle = C.ink;
    reveal('PRODUCT', 120, 455, 120, E.outExpo(P(lt, 0.1, 0.85)));
    ctx.fillStyle = C.coral;
    reveal('BUILDER', 120, 575, 120, E.outExpo(P(lt, 0.25, 1.0)));
    ctx.globalAlpha = P(lt, 0.8, 1.3); serif(42); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    ctx.fillText('from napkin sketch to a million users.', 120, 650);
    ctx.globalAlpha = 1;

    const k = E.outExpo(P(lt, 1.5, 2.8));
    const users = Math.round(1204883 * k), mrr = Math.round(284 * k);
    [[users.toLocaleString('en-US'), 'USERS', 120], ['$' + mrr + 'k', 'MRR', 470], [String(Math.round(72 * k)), 'NPS', 690]].forEach(([v, l, x], i) => {
      const a = P(lt, 1.5 + i * 0.1, 1.8 + i * 0.1);
      if (a <= 0) return;
      ctx.globalAlpha = a; font(54); ctx.fillStyle = i === 0 ? C.coral : C.ink; ctx.textAlign = 'left'; ctx.fillText(v, x, 770);
      mono(15, 700); ctx.fillStyle = C.dim; ctx.fillText(l, x, 805);
    });
    ctx.globalAlpha = 1;

    // UI: wireframe → filled, revealed by a scanning line
    const top = 190, bot = 890;
    const wire = E.outCubic(P(lt, 0.1, 0.9));
    const f = E.inOutCubic(P(lt, 1.0, 1.9));
    const sy = lerp(top - 10, bot + 10, f);
    const ui = (fill) => {
      phone(950, 200, 330, 680, fill, mrr);
      card(1340, 200, 460, 330, fill, 'ACTIVE USERS', lt, 'line');
      card(1340, 550, 460, 330, fill, 'SHIPS / WEEK', lt, 'bars');
    };
    ctx.save(); ctx.beginPath(); ctx.rect(900, sy, 960, H); ctx.clip();
    ctx.globalAlpha = wire; ctx.translate(0, (1 - wire) * 30); ui(false); ctx.restore();
    if (f > 0) { ctx.save(); ctx.beginPath(); ctx.rect(900, 0, 960, sy); ctx.clip(); ui(true); ctx.restore(); }
    if (f > 0 && f < 1) {
      ctx.fillStyle = C.lime; ctx.fillRect(920, sy - 1, 900, 3);
      ctx.globalAlpha = 0.18; ctx.fillRect(920, sy - 18, 900, 18); ctx.globalAlpha = 1;
    }

    // SHIPPED stamp + confetti
    const st = P(lt, 2.7, 3.0);
    if (st > 0) {
      const dt = lt - 2.7;
      for (let i = 0; i < 110; i++) {
        const a = -Math.PI / 2 + (hash(i, 80) - 0.5) * 2.6, sp = 600 + hash(i, 81) * 900;
        const x = 1115 + Math.cos(a) * sp * dt, y = 540 + Math.sin(a) * sp * dt + 1500 * dt * dt;
        ctx.save(); ctx.translate(x, y); ctx.rotate(dt * (hash(i, 82) - 0.5) * 20);
        ctx.fillStyle = PAL[i % PAL.length]; ctx.fillRect(-6, -3, 12, 6); ctx.restore();
      }
      const sc = 1 + 1.6 * (1 - E.outExpo(st));
      ctx.save(); ctx.translate(1115, 540); ctx.rotate(-0.16); ctx.scale(sc, sc); ctx.globalAlpha = P(lt, 2.7, 2.8);
      rrect(-220, -72, 440, 144, 18); ctx.fillStyle = 'rgba(12,9,8,.88)'; ctx.fill();
      ctx.strokeStyle = C.coral; ctx.lineWidth = 8; ctx.stroke();
      font(92); ctx.fillStyle = C.coral; ctx.textAlign = 'center'; ctx.fillText('SHIPPED', 0, 33);
      ctx.restore();
    }
  }

  /* 06 — MANIFESTO (beat-synced word montage) */
  const WORDS = ['DESIGN', 'CODE', 'ANIMATE', 'ARCHITECT', 'SHIP', 'SCALE', 'ITERATE', 'DELIGHT', 'BUILD', 'LEARN', 'LEAD', 'REPEAT'];
  const WT = [0, 0.5, 1, 1.5, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75];
  function sMontage(lt) {
    let i = 0;
    for (let k = 0; k < WT.length; k++) if (lt >= WT[k]) i = k;
    const wl = lt - WT[i], word = WORDS[i], st = i % 4;
    const bgc = [C.lime, C.bg, C.coral, C.blue][st], fg = [C.bg, C.ink, C.bg, C.ink][st];
    ctx.fillStyle = bgc; ctx.fillRect(-60, -60, W + 120, H + 120);

    if (st === 2) {
      mono(22, 700); ctx.fillStyle = 'rgba(7,7,10,.35)'; ctx.textAlign = 'left';
      const band = (word + '  ✦  ').repeat(30);
      for (let r = 0; r < 3; r++) ctx.fillText(band, -((wl * 600 + r * 140) % 400), 270 + r * 270);
    }

    font(400);
    const size = Math.min(430, (400 * 1700) / ctx.measureText(word).width);
    const punch = 1 + 0.14 * (1 - E.outExpo(P(wl, 0, 0.22)));
    ctx.save(); ctx.translate(960, 540); ctx.scale(punch, punch);
    if (st === 2) ctx.rotate(-0.07);
    font(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = fg; ctx.strokeStyle = fg;
    if (st === 1) {
      for (let j = -3; j <= 3; j++) {
        const y = j * size * 0.84 - wl * 160;
        if (j === 0) { ctx.globalAlpha = 1; ctx.fillText(word, 0, y); }
        else { ctx.globalAlpha = 0.55 - Math.abs(j) * 0.12; ctx.lineWidth = 2; ctx.strokeText(word, 0, y); }
      }
      ctx.globalAlpha = 1;
    } else if (st === 3) {
      const { g, w } = glyphs(word, 0);
      ctx.textAlign = 'left';
      g.forEach((c, li) => {
        const q = E.outExpo(P(wl, li * 0.018, li * 0.018 + 0.2));
        ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + c.x - 10, -size * 0.6, c.w + 20, size * 1.2); ctx.clip();
        ctx.fillText(c.ch, -w / 2 + c.x, (1 - q) * size); ctx.restore();
      });
    } else {
      ctx.fillText(word, 0, 0);
    }
    ctx.restore();
    ctx.textBaseline = 'alphabetic';

    mono(18, 700); ctx.fillStyle = fg; ctx.textAlign = 'center';
    ctx.fillText(`${pad(i + 1)} / ${WORDS.length}`, 960, 1004);
    ctx.fillText('[ 06 ]  MANIFESTO', 960, 160);
  }

  /* 07 — OUTRO */
  function sOutro(lt, t) {
    const cx = 960, cy = 400, s = 78;
    const p1 = E.inOutExpo(P(lt, 0.05, 0.5)), p2 = E.inOutExpo(P(lt, 0.18, 0.63));
    ctx.lineCap = 'square'; ctx.lineWidth = 24;
    ctx.strokeStyle = C.lime;
    ctx.beginPath(); ctx.moveTo(cx - s, cy - s); ctx.lineTo(lerp(cx - s, cx + s, p1), lerp(cy - s, cy + s, p1)); if (p1 > 0) ctx.stroke();
    ctx.strokeStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(cx + s, cy - s); ctx.lineTo(lerp(cx + s, cx - s, p2), lerp(cy - s, cy + s, p2)); if (p2 > 0) ctx.stroke();
    ctx.lineCap = 'butt';
    const rp = E.outCubic(P(lt, 0.2, 1.1));
    ctx.strokeStyle = 'rgba(243,240,232,.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 150, -Math.PI / 2 + lt * 0.3, -Math.PI / 2 + lt * 0.3 + TAU * rp); ctx.stroke();
    ctx.fillStyle = C.lime; ctx.globalAlpha = rp;
    const ea = -Math.PI / 2 + lt * 0.3 + TAU * rp; dot(cx + Math.cos(ea) * 150, cy + Math.sin(ea) * 150, 6); ctx.fill();
    ctx.globalAlpha = 1;

    font(130);
    const tr = lerp(90, 24, E.outExpo(P(lt, 0.3, 1.4)));
    const { g, w } = glyphs('XYPHUZ', tr);
    ctx.globalAlpha = E.outCubic(P(lt, 0.3, 0.7)); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    g.forEach((c) => ctx.fillText(c.ch, cx - w / 2 + c.x, 655));
    ctx.globalAlpha = 1;

    mono(22, 500); ctx.fillStyle = C.dim; ctx.textAlign = 'center';
    ctx.fillText(decode('SOFTWARE ENGINEER  /  SOFTWARE ARCHITECT  /  MOTION DESIGNER  /  PRODUCT BUILDER', P(lt, 0.7, 1.5), t), cx, 718);

    const ta = E.outCubic(P(lt, 1.2, 1.7));
    ctx.globalAlpha = ta; serif(50); ctx.fillStyle = C.ink;
    ctx.fillText('Let’s build something unforgettable.', cx, 805 + (1 - ta) * 20);
    ctx.globalAlpha = P(lt, 1.5, 2.0); mono(20, 700); ctx.fillStyle = C.lime;
    ctx.fillText('xyphuz.com   ·   github.com/wst24365888', cx, 875);
    ctx.globalAlpha = 1;
  }

  const SCENES = [
    { s: 0, e: 3, id: '00', name: 'BOOT', bg: C.bg, draw: sBoot },
    { s: 3, e: 7, id: '01', name: 'IDENTITY', bg: C.bg, draw: sName },
    { s: 7, e: 11, id: '02', name: 'SOFTWARE ENGINEER', bg: '#07080a', draw: sEng },
    { s: 11, e: 15, id: '03', name: 'SOFTWARE ARCHITECT', bg: '#05070f', draw: sArch },
    { s: 15, e: 19, id: '04', name: 'MOTION DESIGNER', bg: '#0a0710', draw: sMotion },
    { s: 19, e: 23, id: '05', name: 'PRODUCT BUILDER', bg: '#0c0908', draw: sProduct },
    { s: 23, e: 27, id: '06', name: 'MANIFESTO', bg: C.bg, draw: sMontage },
    { s: 27, e: 30, id: '07', name: 'XYPHUZ', bg: C.bg, draw: sOutro },
  ];

  /* ---------- global layers ---------- */
  const FLASHES = [[3, 1], [7, 0.55], [15, 0.55], [23, 0.8], [27, 1]];
  const WIPES = [[11, [C.ink, C.lime, C.blue]], [19, [C.ink, C.yellow, C.coral]]];
  const IMPACTS = [[3, 16], [23, 7], [27, 16]];

  function wipe(t, at, cols) {
    const sk = 320;
    for (let j = cols.length - 1; j >= 0; j--) {
      const lead = E.inOutCubic(P(t, at - 0.38 - j * 0.06, at - j * 0.06));
      const trail = E.inOutCubic(P(t, at + j * 0.06, at + 0.38 + j * 0.06));
      if (lead <= 0 || trail >= 1) continue;
      const xL = -sk + lead * (W + 2 * sk), xT = -sk + trail * (W + 2 * sk);
      ctx.fillStyle = cols[j];
      ctx.beginPath(); ctx.moveTo(xT + sk, 0); ctx.lineTo(xL + sk, 0); ctx.lineTo(xL, H); ctx.lineTo(xT, H); ctx.closePath(); ctx.fill();
    }
  }

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
    const z = (1 + 0.035 * (1 - E.outExpo(P(lt, 0, 0.6)))) * (1 + (0.02 * lt) / d);
    ctx.save();
    ctx.translate(960 + sx, 540 + sy); ctx.scale(z, z); ctx.translate(-960, -540);
    sc.draw(lt, t, d);
    ctx.restore();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.textBaseline = 'alphabetic'; ctx.lineCap = 'butt'; ctx.setLineDash([]);

    for (const [at, cols] of WIPES) if (Math.abs(t - at) < 0.6) wipe(t, at, cols);
    for (const [ft, a] of FLASHES) {
      if (t < ft || t > ft + 0.4) continue;
      ctx.globalAlpha = a * Math.pow(1 - P(t, ft, ft + 0.4), 2); ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;

    // vignette + film grain
    const vg = ctx.createRadialGradient(960, 540, 420, 960, 540, 1150);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    const pat = ctx.createPattern(grain, 'repeat');
    const fr = Math.floor(t * 24);
    if (pat.setTransform) pat.setTransform(new DOMMatrix().translate(hash(fr, 3) * 256, hash(fr, 4) * 256));
    ctx.globalAlpha = 0.07; ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;

    hud(t, sc);

    // loop seam: fade to black at the very end
    if (t > 29.55) { ctx.globalAlpha = P(t, 29.55, 29.95); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }

  async function ready() {
    const fonts = [`700 100px ${FD}`, `500 20px ${FM}`, `400 20px ${FM}`, `700 20px ${FM}`, `italic 400 40px ${FS}`];
    try {
      await Promise.race([Promise.all(fonts.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 3500))]);
    } catch (e) { /* fall back to system fonts */ }
    prepName();
  }

  window.Reel = {
    DUR,
    SCENES: SCENES.map(({ s, e, id, name }) => ({ s, e, id, name })),
    create(cv) {
      canvas = cv; ctx = cv.getContext('2d');
      prepRows(); prepCode(); prepShapes(); prepGrain();
      return { render, ready };
    },
  };
})();
