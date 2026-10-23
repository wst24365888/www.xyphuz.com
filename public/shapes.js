/* XYPHUZ — particle formations.
 * Each formation fills N particles with a position texture P (xyz + colour)
 * and a behaviour texture F (xyz + code). Codes, read by engine.js:
 *   0 static · 1 flow P→F · 2 signature write-on (F.x = reveal time)
 *   3 wafer die (F.x = scan coordinate, F.y = defect, F.z = shade)
 *   4 cloud region (+id/10) · 5 overhead-transport vehicle (+phase)
 *   6 great-circle arc (+ids/100) · 7 warp tunnel · 8 orbiting disc
 * Colour = palette index + brightness: 0 ink · 1 lime · 2 coral · 3 blue · 4 violet · 5 amber.
 */
(function () {
  'use strict';

  const SIDE = 360, N = SIDE * SIDE, TAU = Math.PI * 2;
  let LETTERS = [], TOOLS = []; // filled while building, for the site's interactions
  const SIGN_SCALE = 2.2;

  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(TAU * r());
  const col = (i, b) => i + Math.min(0.999, Math.max(0.001, b));

  // A formation writes its particles in a fixed shuffled order, so that index
  // ranges never line up between formations and every morph looks organic.
  function formation(seed) {
    const r = rng(seed), P = new Float32Array(N * 4), F = new Float32Array(N * 4);
    const perm = new Uint32Array(N);
    for (let i = 0; i < N; i++) perm[i] = i;
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
    let n = 0;
    const put = (x, y, z, c, fx = 0, fy = 0, fz = 0, code = 0) => {
      if (n >= N) return;
      const k = perm[n++] * 4;
      P[k] = x; P[k + 1] = y; P[k + 2] = z; P[k + 3] = c;
      F[k] = fx; F[k + 1] = fy; F[k + 2] = fz; F[k + 3] = code;
    };
    return { r, P, F, put, left: () => N - n, count: (f) => Math.floor(N * f) };
  }

  function dustInto(s, count, R0 = 6, R1 = 26) {
    const { r, put } = s;
    for (let i = 0; i < count; i++) {
      const d = R0 + Math.pow(r(), 0.7) * (R1 - R0), th = r() * TAU, ph = Math.acos(2 * r() - 1);
      put(d * Math.sin(ph) * Math.cos(th), d * Math.cos(ph) * 0.6, d * Math.sin(ph) * Math.sin(th), col(r() < 0.1 ? 1 : 0, 0.04 + r() * 0.16));
    }
  }

  /* 0 — nebula dust */
  function DUST() {
    const s = formation(1), { r, put } = s;
    const disc = s.count(0.7);
    for (let i = 0; i < disc; i++) {
      const rad = 2.5 + Math.pow(r(), 0.8) * 14, arm = (i % 3) * (TAU / 3), a = arm + rad * 0.35 + gauss(r) * 0.35;
      put(Math.cos(a) * rad, gauss(r) * 0.25 * (1 + rad * 0.08), Math.sin(a) * rad - 3, col(r() < 0.12 ? 1 : r() < 0.05 ? 4 : 0, 0.05 + r() * 0.3));
    }
    dustInto(s, s.left(), 5, 28);
    return s;
  }

  /* 1 — the signature, with a reveal time per particle in true stroke order */
  function SIGN() {
    const M = window.Mark3D, s = formation(2), { r, put } = s;
    const G = 600, R = M.R;
    const c = document.createElement('canvas'); c.width = c.height = G;
    const g = c.getContext('2d');
    g.translate(G / 2, G / 2); g.scale(G / (2 * R) / M.HALF, G / (2 * R) / M.HALF); g.translate(-M.CX, -M.CY);
    g.fillStyle = '#fff'; g.fill(M.path);
    const d = g.getImageData(0, 0, G, G).data;
    // centreline samples tagged with the moment the pen passes them
    const inv = (u) => 0.5 - Math.sin(Math.asin(1 - 2 * u) / 3);
    const samples = [];
    M.STROKES.forEach((st, si) => {
      const [a, b] = M.STROKE_T[si];
      for (let k = 0; k <= 400; k++) {
        const u = k / 400, p = M.pointAt(st, u);
        samples.push([p[0], p[1], a + (b - a) * inv(Math.min(0.9999, Math.max(0.0001, u)))]);
      }
    });
    const pix = [];
    for (let y = 0; y < G; y++) {
      for (let x = 0; x < G; x++) {
        if (d[(y * G + x) * 4 + 3] < 128) continue;
        const sx = M.CX + ((x / G) * 2 * R - R) * M.HALF, sy = M.CY + ((y / G) * 2 * R - R) * M.HALF;
        let best = 1e9, bt = 0;
        for (let k = 0; k < samples.length; k++) {
          const q = samples[k], dd = (q[0] - sx) ** 2 + (q[1] - sy) ** 2;
          if (dd < best) { best = dd; bt = q[2]; }
        }
        pix.push(x, y, bt);
      }
    }
    const np = pix.length / 3;
    for (let i = 0; i < N; i++) {
      const k = Math.floor(r() * np) * 3;
      const gx = ((pix[k] + r()) / G) * 2 * R - R, gy = -(((pix[k + 1] + r()) / G) * 2 * R - R);
      const z = (r() - 0.5) * 0.28;
      put(gx * SIGN_SCALE, gy * SIGN_SCALE, z * SIGN_SCALE, r() < 0.86 ? col(1, 0.35 + r() * 0.5) : col(0, 0.5 + r() * 0.4), pix[k + 2], 0, 0, 2);
    }
    return s;
  }

  /* 2 — accretion halo around the 3D mark */
  function HALO() {
    const s = formation(3), { r, put } = s;
    const n = s.count(0.88);
    for (let i = 0; i < n; i++) {
      const rad = 3.0 + Math.pow(r(), 1.6) * 7.5, arm = (i % 2) * Math.PI, a = arm + Math.log(rad) * 2.4 + gauss(r) * 0.3;
      const inner = 1 - (rad - 3) / 7.5;
      const c = r() < 0.55 * inner + 0.1 ? col(1, 0.25 + 0.6 * inner * r()) : r() < 0.2 ? col(4, 0.15 + r() * 0.3) : col(0, 0.06 + r() * 0.25);
      put(Math.cos(a) * rad, gauss(r) * 0.05 * rad, Math.sin(a) * rad, c, 0, 0, 0, 8);
    }
    dustInto(s, s.left(), 9, 30);
    return s;
  }

  /* 3 — SOFTWARE ENGINEER as volumetric type, inside a rain of code */
  function TEXT() {
    const s = formation(4), { r, put } = s;
    const W = 1600, H = 900;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.textAlign = 'center';
    g.font = '700 270px "Space Grotesk", Arial, sans-serif';
    const lines = ['SOFTWARE', 'ENGINEER'];
    g.fillText(lines[0], W / 2, 400); g.fillText(lines[1], W / 2, 720);
    // where each letter starts, so every particle knows which letter it belongs to
    const starts = lines.map((str) => { const x0 = W / 2 - g.measureText(str).width / 2; return [...str].map((_, i) => x0 + g.measureText(str.slice(0, i)).width); });
    const letterOf = (x, y) => { const li = y < 470 ? 0 : 1, st = starts[li]; let i = 0; while (i < st.length - 1 && x >= st[i + 1]) i++; return li * 8 + i; };
    const d = g.getImageData(0, 0, W, H).data, pix = [], sum = Array.from({ length: 16 }, () => [0, 0, 0]);
    for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
      if (d[(y * W + x) * 4 + 3] <= 127) continue;
      const id = letterOf(x, y);
      pix.push(x, y, id); sum[id][0] += x; sum[id][1] += y; sum[id][2]++;
    }
    const np = pix.length / 3, sc = 13 / W;
    LETTERS = sum.map(([sx, sy, n], i) => ({ ch: lines[i >> 3][i & 7], p: [(sx / n - W / 2) * sc, -(sy / n - 470) * sc, 0] }));
    const nt = s.count(0.76);
    for (let i = 0; i < nt; i++) {
      const k = Math.floor(r() * np) * 3, x = pix[k] + r(), y = pix[k + 1] + r();
      const top = y < 470;
      // F.y = letter id + 1 (bug hunt)
      put((x - W / 2) * sc, -(y - 470) * sc, (r() - 0.5) * 0.55, top ? col(0, 0.35 + r() * 0.45) : col(1, 0.4 + r() * 0.5), 0, pix[k + 2] + 1);
    }
    const nr = s.count(0.2);
    for (let i = 0; i < nr; i++) {
      const x = Math.round((r() * 2 - 1) * 16 / 0.32) * 0.32, z = -12 + r() * 14;
      put(x, 10, z, col(1, 0.1 + r() * 0.35), x, -10, z, 1);
    }
    dustInto(s, s.left());
    return s;
  }

  /* 4 — layered system architecture with live data flows */
  const LAYERS = [
    { y: 1.6, n: 'CLIENTS', nodes: [['Ops Console', -1.0, 0.5], ['Tool Gateway', 0.9, -0.5]] },
    { y: 0.8, n: 'GATEWAY', nodes: [['API Gateway', 0, 0]] },
    { y: 0, n: 'SERVICES', nodes: [['MES', -1.25, 0.45], ['Dispatcher', 0, -0.85], ['Scheduler', 1.25, 0.3], ['SPC', 0.1, 1.0]] },
    { y: -0.8, n: 'DATA', nodes: [['Postgres', -1.0, -0.4], ['Redis', 0.95, 0.6], ['Lakehouse', 0.45, -1.1]] },
    { y: -1.6, n: 'STREAM', nodes: [['Kafka', -0.5, 0], ['Workers', 1.0, -0.45]] },
  ];
  const NODES = [];
  LAYERS.forEach((l, li) => l.nodes.forEach(([lab, x, z]) => NODES.push({ lab, li, p: [x * 2.4, l.y * 2, z * 2.4] })));
  const EDGES = [[0, 2], [1, 2], [2, 3], [2, 4], [2, 5], [2, 6], [3, 7], [3, 8], [4, 7], [4, 10], [5, 7], [5, 10], [6, 8], [6, 9], [7, 10], [10, 11]];

  function ARCH() {
    const s = formation(5), { r, put } = s;
    const np = s.count(0.2);
    for (let i = 0; i < np; i++) {
      const L = LAYERS[i % 5], x = (r() * 2 - 1) * 4.6, z = (r() * 2 - 1) * 3.6;
      const edge = Math.abs(Math.abs(x) - 4.6) < 0.05 || Math.abs(Math.abs(z) - 3.6) < 0.05;
      const alongX = r() < 0.5, gx = alongX ? x : Math.round(x / 0.92) * 0.92, gz = alongX ? Math.round(z / 0.9) * 0.9 : z;
      put(gx, L.y * 2, gz, col(3, edge ? 0.9 : 0.45 + r() * 0.3));
    }
    const nn = s.count(0.26);
    for (let i = 0; i < nn; i++) {
      const nd = NODES[i % NODES.length];
      const hx = 0.55, hy = 0.2, hz = 0.35, f = Math.floor(r() * 6);
      let x = (r() * 2 - 1) * hx, y = (r() * 2 - 1) * hy, z = (r() * 2 - 1) * hz;
      if (f === 0) x = hx; else if (f === 1) x = -hx; else if (f === 2) y = hy; else if (f === 3) y = -hy; else if (f === 4) z = hz; else z = -hz;
      // F.x = node id + 1, so the engine can move a service's particles when it's dragged
      put(nd.p[0] + x, nd.p[1] + y, nd.p[2] + z, nd.li === 1 ? col(1, 0.5 + r() * 0.4) : col(0, 0.35 + r() * 0.4), (i % NODES.length) + 1);
    }
    const ne = s.count(0.4);
    for (let i = 0; i < ne; i++) {
      const ei = i % EDGES.length, [a, b] = EDGES[ei], A = NODES[a].p, B = NODES[b].p;
      const j = () => (r() - 0.5) * 0.05;
      // flows carry both endpoint ids in the code's fraction, so they follow moved services
      put(A[0] + j(), A[1] + j(), A[2] + j(), ei % 3 === 0 ? col(2, 0.45 + r() * 0.45) : col(1, 0.35 + r() * 0.5), B[0] + j(), B[1] + j(), B[2] + j(), 1 + (1 + a * 16 + b) / 1000);
    }
    dustInto(s, s.left());
    return s;
  }

  /* 5 — a 300 mm wafer: dies lit by a scan, a few defects */
  function WAFER() {
    const s = formation(6), { r, put } = s;
    const WR = 4.6, pitch = 0.34, die = 0.29, dies = [];
    const n = Math.ceil(WR / pitch) + 1;
    for (let j = -n; j <= n; j++) {
      for (let i = -n; i <= n; i++) {
        const x = i * pitch, y = j * pitch;
        if (Math.hypot(Math.abs(x) + die / 2, Math.abs(y) + die / 2) < WR - 0.12) dies.push([x, y, r() < 0.035 ? 1 : 0, r()]);
      }
    }
    const nd = s.count(0.82);
    for (let i = 0; i < nd; i++) {
      const D = dies[i % dies.length];
      put(D[0] + (r() - 0.5) * die, D[1] + (r() - 0.5) * die, (r() - 0.5) * 0.03, col(0, 0.12 + r() * 0.1), D[1], D[2], D[3], 3);
    }
    const nr = s.count(0.08);
    for (let i = 0; i < nr; i++) {
      const a = r() * TAU;
      if (Math.abs(a - Math.PI * 1.5) < 0.05) continue;
      const rr = WR + r() * 0.12;
      put(Math.cos(a) * rr, Math.sin(a) * rr, (r() - 0.5) * 0.04, col(0, 0.35 + r() * 0.3));
    }
    dustInto(s, s.left());
    return s;
  }

  /* 6 — the fab floor: tools, overhead transport, events streaming up */
  function FAB() {
    const s = formation(7), { r, put } = s;
    const tools = [];
    for (let rr = 0; rr < 4; rr++) for (let c = 0; c < 6; c++) tools.push([-5.5 + c * 2.2, -3.6 + rr * 2.4, 0.6 + r() * 0.6]);
    TOOLS = tools.map(([cx, cz, h]) => [cx, h, cz]);
    const nt = s.count(0.3);
    for (let i = 0; i < nt; i++) {
      const ti = i % tools.length, [cx, cz, h] = tools[ti], w = 0.65, d = 0.5;
      const f = Math.floor(r() * 5);
      let x = (r() * 2 - 1) * w, y = r() * h, z = (r() * 2 - 1) * d;
      if (f === 0) y = h; else if (f === 1) x = w; else if (f === 2) x = -w; else if (f === 3) z = d; else z = -d;
      const lit = f === 0 && Math.hypot(x, z) < 0.12;
      put(cx + x, y, cz + z, lit ? col(1, 0.95) : col(0, f === 0 ? 0.55 + r() * 0.3 : 0.25 + r() * 0.25), 0, ti + 1); // F.y = tool id + 1
    }
    const ng = s.count(0.12);
    for (let i = 0; i < ng; i++) {
      const along = r() * 2 - 1, k = Math.round((r() * 2 - 1) * 6);
      if (i % 2) put(k, 0, along * 5.5, col(3, 0.3 + r() * 0.15)); else put(along * 7, 0, k * 0.85, col(3, 0.3 + r() * 0.15));
    }
    const HX = 6.6, HZ = 4.6, TY = 1.95;
    const nrail = s.count(0.06);
    for (let i = 0; i < nrail; i++) {
      const u = r() * 2 * (2 * HX + 2 * HZ), off = i % 2 ? 0.12 : -0.12;
      let x, z;
      if (u < 2 * HX) { x = -HX + u; z = -HZ - off; }
      else if (u < 2 * HX + 2 * HZ) { x = HX + off; z = -HZ + (u - 2 * HX); }
      else if (u < 4 * HX + 2 * HZ) { x = HX - (u - 2 * HX - 2 * HZ); z = HZ + off; }
      else { x = -HX - off; z = HZ - (u - 4 * HX - 2 * HZ); }
      put(x, TY, z, col(0, 0.3 + r() * 0.2));
    }
    const nv = s.count(0.07);
    for (let i = 0; i < nv; i++) {
      const v = i % 18, phase = v / 18;
      const x = (r() - 0.5) * 0.4, y = -0.1 - r() * 0.35, z = (r() - 0.5) * 0.4;
      put(x, y, z, y < -0.38 ? col(1, 0.9) : col(0, 0.55 + r() * 0.3), HX, HZ, TY, 5 + phase * 0.999);
    }
    const ns = s.count(0.27);
    for (let i = 0; i < ns; i++) {
      const [cx, cz, h] = tools[Math.floor(r() * tools.length)];
      const x = cx + (r() - 0.5) * 0.3, z = cz + (r() - 0.5) * 0.3;
      put(x, h, z, col(1, 0.5 + r() * 0.49), x, 16, z, 1);
    }
    dustInto(s, s.left());
    return s;
  }

  /* 7 — planet-scale cloud: continents, regions, traffic arcs */
  const REGIONS = [[37, -120], [40, -75], [50, 8], [1, 103], [35, 139], [-33, 151]];
  const ARCS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [2, 4], [3, 5], [5, 4], [1, 3], [0, 2], [2, 5], [0, 3]];
  const GR = 4.4;
  const dirOf = (lat, lon) => { const a = (lat * Math.PI) / 180, b = (lon * Math.PI) / 180; return [Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b)]; };
  function vnoise(x, y, z) {
    const h = (a, b, c) => { const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return v - Math.floor(v); };
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    const L = (a, b, t) => a + (b - a) * t;
    return L(L(L(h(xi, yi, zi), h(xi + 1, yi, zi), u), L(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
      L(L(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), L(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v), w);
  }
  const land = (d) => vnoise(d[0] * 1.7 + 3, d[1] * 1.7, d[2] * 1.7) + 0.5 * vnoise(d[0] * 3.4, d[1] * 3.4 + 7, d[2] * 3.4) + 0.25 * vnoise(d[0] * 7, d[1] * 7, d[2] * 7 + 2);
  function GLOBE() {
    const s = formation(8), { r, put } = s;
    const rnd = () => { const z = 2 * r() - 1, a = r() * TAU, q = Math.sqrt(1 - z * z); return [q * Math.cos(a), z, q * Math.sin(a)]; };
    const sample = []; for (let i = 0; i < 3000; i++) sample.push(land(rnd()));
    sample.sort((a, b) => a - b);
    const th = sample[Math.floor(sample.length * 0.6)];
    const nl = s.count(0.42), no = s.count(0.08);
    let l = 0, o = 0;
    while (l < nl || o < no) {
      const d = rnd(), isLand = land(d) > th;
      if (isLand && l < nl) { l++; put(d[0] * GR, d[1] * GR, d[2] * GR, col(0, 0.25 + r() * 0.35)); }
      else if (!isLand && o < no) { o++; put(d[0] * GR, d[1] * GR, d[2] * GR, col(3, 0.05 + r() * 0.08)); }
    }
    const nreg = s.count(0.1);
    for (let i = 0; i < nreg; i++) {
      const id = i % REGIONS.length, c = dirOf(...REGIONS[id]);
      const d = [c[0] + gauss(r) * 0.05, c[1] + gauss(r) * 0.05, c[2] + gauss(r) * 0.05], L = Math.hypot(...d), h = GR * (1.01 + r() * 0.05);
      put((d[0] / L) * h, (d[1] / L) * h, (d[2] / L) * h, col(1, 0.5 + r() * 0.5), 0, 0, 0, 4 + id / 10);
    }
    const na = s.count(0.3);
    for (let i = 0; i < na; i++) {
      const [ia, ib] = ARCS[i % ARCS.length], A = dirOf(...REGIONS[ia]), B = dirOf(...REGIONS[ib]);
      put(A[0] * GR, A[1] * GR, A[2] * GR, i % 4 === 0 ? col(3, 0.5 + r() * 0.4) : col(1, 0.35 + r() * 0.5), B[0] * GR, B[1] * GR, B[2] * GR, 6 + (ia * 10 + ib) / 100);
    }
    const nat = s.count(0.04);
    for (let i = 0; i < nat; i++) { const d = rnd(), h = GR * (1.06 + r() * 0.08); put(d[0] * h, d[1] * h, d[2] * h, col(3, 0.06 + r() * 0.08)); }
    dustInto(s, s.left(), 10, 30);
    return s;
  }

  /* 8 — warp tunnel */
  function TUNNEL() {
    const s = formation(9), { r, put } = s;
    for (let i = 0; i < N; i++) {
      const rad = 1.8 + Math.pow(r(), 1.5) * 5.5, a = r() * TAU, z = -50 + r() * 60;
      const c = r() < 0.22 ? col(1, 0.6 + r() * 0.39) : r() < 0.06 ? col(2, 0.8) : r() < 0.06 ? col(3, 0.8) : col(0, 0.3 + r() * 0.5);
      put(Math.cos(a) * rad, Math.sin(a) * rad, z, c, 0, 0, 0, 7);
    }
    return s;
  }

  /* 9+ — manifesto words. A fixed slice of particles stays in the warp tunnel
   * across every word (so they share one behaviour texture); the rest
   * re-form each word on the beat. */
  const WORDS = [['DESIGN', 1], ['BUILD', 0], ['SCALE', 2], ['AUTOMATE', 1], ['HARDEN', 3], ['SHIP', 1], ['REPEAT', 0]];
  let WORD_F = null, TUN = null;
  function wordShapes() {
    const rt = rng(77);
    WORD_F = new Float32Array(N * 4); TUN = new Float32Array(N * 4);
    const isTun = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      if (rt() < 0.2) {
        isTun[i] = 1;
        const rad = 2.2 + Math.pow(rt(), 1.5) * 6, a = rt() * TAU;
        TUN[i * 4] = Math.cos(a) * rad; TUN[i * 4 + 1] = Math.sin(a) * rad; TUN[i * 4 + 2] = -50 + rt() * 60;
        TUN[i * 4 + 3] = rt() < 0.3 ? col(1, 0.75 + rt() * 0.24) : col(0, 0.5 + rt() * 0.45);
        WORD_F[i * 4 + 3] = 7;
      }
    }
    return WORDS.map(([word, ci], wi) => {
      const W = 1800, H = 420, c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d');
      g.font = '700 400px "Space Grotesk", Arial, sans-serif';
      const size = Math.min(360, (400 * 1700) / g.measureText(word).width);
      g.font = `700 ${size}px "Space Grotesk", Arial, sans-serif`;
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(word, W / 2, H / 2 + size * 0.04);
      const d = g.getImageData(0, 0, W, H).data, pix = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 127) pix.push(x, y);
      const r = rng(100 + wi), np = pix.length / 2, sc = 14 / W, P = new Float32Array(N * 4);
      for (let i = 0; i < N; i++) {
        const k = i * 4;
        if (isTun[i]) { P[k] = TUN[k]; P[k + 1] = TUN[k + 1]; P[k + 2] = TUN[k + 2]; P[k + 3] = TUN[k + 3]; continue; }
        const q = Math.floor(r() * np) * 2;
        P[k] = (pix[q] + r() - W / 2) * sc; P[k + 1] = -(pix[q + 1] + r() - H / 2) * sc; P[k + 2] = (r() - 0.5) * 0.5;
        P[k + 3] = r() < 0.85 ? col(ci, 0.45 + r() * 0.5) : col(0, 0.6 + r() * 0.35);
      }
      return { P, F: WORD_F };
    });
  }

  window.Shapes = {
    SIDE, N, SIGN_SCALE, NODES, EDGES, LAYERS, REGIONS, GR, dirOf,
    get LETTERS() { return LETTERS; }, get TOOLS() { return TOOLS; },
    IDX: { DUST: 0, SIGN: 1, HALO: 2, TEXT: 3, ARCH: 4, WAFER: 5, FAB: 6, GLOBE: 7, TUNNEL: 8, WORD: 9 },
    WORDS: WORDS.map((w) => w[0]),
    build() { return [DUST(), SIGN(), HALO(), TEXT(), ARCH(), WAFER(), FAB(), GLOBE(), TUNNEL()].map(({ P, F }) => ({ P, F })).concat(wordShapes()); },
  };
})();
