/* XYPHUZ — signature mark.
 * The hand-drawn monogram as a Path2D, its pen-stroke centrelines in the
 * order it is actually written, and a bevelled 3D mesh extruded from the exact
 * path at load time (drawn by engine.js).
 */
(function () {
  'use strict';

  const D = 'M 311.287 656.583 C 305.789 654.087 302.377 648.694 297.881 635.393 C 292.17 618.497 290.784 606.159 290.828 572.624 C 290.85 556.147 291.476 535.557 292.219 526.869 C 294.016 505.873 299.316 452.842 302.721 421.785 C 306.177 390.259 306.189 388.965 303.012 388.114 C 301.664 387.752 299.306 387.45 297.773 387.442 C 292.433 387.414 276.536 382.816 267.879 378.797 C 263.081 376.569 255.112 371.479 250.149 367.471 C 245.19 363.468 240.575 360.192 239.893 360.192 C 239.21 360.192 231.257 367.879 222.218 377.275 C 204.443 395.751 165.01 431.959 159.637 434.737 C 157.815 435.679 154.291 436.45 151.805 436.45 C 140.044 436.45 132.374 426.339 135.455 414.895 C 136.503 411.005 139.08 408.202 153.799 394.942 C 188.254 363.902 216.133 335 216.133 330.321 C 216.133 329.124 214.412 324.137 212.308 319.239 C 204.987 302.194 203.796 295.652 203.8 272.496 C 203.804 249.815 205.823 232.965 211.346 209.512 C 213.573 200.054 214.035 196.428 213.127 195.52 C 211.87 194.263 206.982 197.458 178.733 217.998 C 168.277 225.601 166.293 226.628 161.303 227.029 C 156.714 227.397 154.985 227.009 151.959 224.932 C 143.993 219.465 141.513 212.263 144.712 203.885 C 146.357 199.578 148.445 197.636 163.046 186.833 C 198.311 160.743 219.971 148.018 236.885 143.454 C 247.718 140.532 253.952 140.987 259.339 145.096 C 267.183 151.08 268.394 159.768 262.836 170.184 C 255.558 183.823 246.857 207.713 243.419 223.498 C 236.703 254.334 236.135 295.588 242.409 296.778 C 245.561 297.376 288.487 237.876 311.013 201.686 C 322.844 182.679 364.082 101.333 372.039 81.308 C 388.2 40.637 391.867 32.776 396.11 29.705 C 400.374 26.619 409.55 26.144 414.403 28.758 C 418.883 31.172 423.118 38.616 423.118 44.078 C 423.118 46.116 419.958 57.41 416.096 69.176 C 409.539 89.154 388.184 159.022 380.757 184.8 C 374.351 207.033 367.526 236.984 360.401 274.13 C 347.773 339.965 346.846 345.126 347.468 346.133 C 348.838 348.349 353.817 346.726 369.28 339.021 C 394.616 326.397 415.959 311.184 428.553 296.772 L 433.042 291.635 L 434.046 276.074 C 435.786 249.097 438.394 232.588 445.451 203.864 C 455.721 162.067 466.194 138.023 481.831 120.345 C 487.939 113.44 493.997 110.657 503.074 110.587 C 515.444 110.492 522.284 115.341 528.256 128.44 C 532.26 137.22 533.441 147.147 532.028 160.141 C 528.953 188.432 521.901 210.287 504.74 244.717 C 492.093 270.092 483.472 284.536 472.944 297.99 L 464.847 311.299 L 465.997 327.336 C 467.977 354.93 471.287 365.751 476.358 386.283 C 480.499 403.05 484.97 413.402 493.89 426.88 C 509.568 450.57 524.383 462.308 542.406 465.318 C 552.553 467.013 557.727 473.703 556.871 484.024 C 556.469 488.873 555.74 490.564 552.701 493.699 C 548.388 498.15 542.77 499.954 536.21 498.996 C 516.376 496.099 495.897 484.109 480.419 466.329 C 471.06 455.579 459.167 437.727 453.661 426.167 C 446.09 410.267 439.4 384.085 435.768 356.139 C 434.153 343.709 433.59 341.673 431.772 341.673 C 431.21 341.673 427.744 343.885 424.07 346.59 C 402.543 362.437 367.955 379.551 348.147 384.155 C 343.942 385.132 342.12 386.14 341.504 387.826 C 341.037 389.105 339.841 397.994 338.846 407.581 C 337.851 417.168 335.801 436.532 334.29 450.612 C 328.077 508.504 325.978 534.711 325.383 561.813 C 324.592 597.83 325.772 609.986 331.756 627.463 C 336.528 641.401 336.644 644.341 332.673 650.851 C 330.334 654.686 323.159 658.638 318.536 658.638 C 317.038 658.638 313.776 657.714 311.287 656.583 Z M 310.402 352.294 C 310.683 351.545 312.351 343.089 314.108 333.502 C 315.865 323.916 320.537 299.2 324.491 278.578 C 329.821 250.781 331.361 240.779 330.446 239.904 C 328.897 238.425 327.852 239.724 310.793 264.326 C 303.522 274.811 289.789 293.765 280.275 306.446 C 270.761 319.126 262.977 330.44 262.977 331.587 C 262.977 333.977 272.781 342.319 280.575 346.561 C 290.252 351.828 309.207 355.471 310.402 352.294 Z M 477.317 241.132 C 490.74 213.531 502.231 185.451 504.919 160.508 C 506.494 145.895 503.127 138.992 490.478 159.178 C 476.524 184.326 470.29 205.054 464.147 235.824 C 462.188 253.188 465.059 258.892 477.317 241.132 Z';
  // Glyph space: centred on the mark, 1 unit = half its height, y down (SVG).
  const CX = 346, CY = 342.5, HALF = 316.5, R = 1.2;
  const path = new Path2D(D);

  // Pen centrelines in SVG coordinates, in writing order.
  const RAW = [
    // 1 — hook, down the leg, along the bottom curve, up and round the loop, out the tail
    [[152, 214], [180, 195], [212, 172], [240, 152], [256, 156], [252, 180], [237, 215], [226, 250], [224, 290], [230, 322], [248, 347], [272, 363], [302, 371], [340, 368], [370, 358], [398, 344], [420, 325], [438, 306], [447, 272], [452, 240], [458, 205], [470, 170], [485, 140], [499, 123], [512, 124], [519, 145], [516, 182], [504, 220], [488, 256], [472, 292], [466, 330], [472, 375], [487, 415], [510, 447], [535, 470], [549, 484]],
    // 2 — from the bottom-left tip, up through the junction to the peak, then down the long slash
    [[146, 426], [175, 400], [200, 375], [222, 351], [240, 326], [258, 297], [280, 266], [300, 238], [322, 205], [345, 160], [368, 108], [388, 62], [402, 38], [414, 36], [410, 62], [398, 110], [384, 160], [370, 215], [355, 280], [344, 345], [336, 400], [325, 470], [312, 540], [308, 590], [312, 630], [318, 652]],
  ];

  // Catmull-Rom → dense polyline with cumulative arc length.
  function densify(pts, seg = 10) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < seg; k++) {
        const t = k / seg, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(pts[pts.length - 1]);
    const len = [0];
    for (let i = 1; i < out.length; i++) len.push(len[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
    return { pts: out, len, total: len[len.length - 1] };
  }
  const STROKES = RAW.map((s) => densify(s));

  function pointAt(s, u) {
    const L = u * s.total;
    let i = 1;
    while (i < s.len.length - 1 && s.len[i] < L) i++;
    const a = s.pts[i - 1], b = s.pts[i], seg = s.len[i] - s.len[i - 1] || 1;
    const f = Math.min(1, Math.max(0, (L - s.len[i - 1]) / seg));
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  }
  function tracePartial(c, s, u) {
    if (u <= 0) return;
    const L = u * s.total;
    c.moveTo(s.pts[0][0], s.pts[0][1]);
    for (let i = 1; i < s.pts.length; i++) {
      if (s.len[i] >= L) { const p = pointAt(s, u); c.lineTo(p[0], p[1]); return; }
      c.lineTo(s.pts[i][0], s.pts[i][1]);
    }
  }

  /* ---------- extruded mesh ----------
   * The SVG path is flattened into rings, the caps are triangulated (earcut,
   * after mapbox/earcut), and the sides are swept with a rounded bevel profile
   * so the edges catch light smoothly.
   */
  function parseRings() {
    const tok = D.match(/[MCLZ]|-?\d*\.?\d+(?:e-?\d+)?/g);
    const rings = [];
    let ring = null, i = 0, x = 0, y = 0;
    const num = () => parseFloat(tok[i++]);
    const push = (px, py) => {
      const q = [(px - CX) / HALF, -(py - CY) / HALF], l = ring[ring.length - 1];
      if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) > 1e-4) ring.push(q);
    };
    while (i < tok.length) {
      const c = tok[i++];
      if (c === 'M') { ring = []; rings.push(ring); x = num(); y = num(); push(x, y); }
      else if (c === 'L') { x = num(); y = num(); push(x, y); }
      else if (c === 'C') {
        const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
        for (let k = 1; k <= 12; k++) {
          const t = k / 12, u = 1 - t;
          push(u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3);
        }
        x = x3; y = y3;
      } else if (c === 'Z') {
        const f = ring[0], l = ring[ring.length - 1];
        if (Math.hypot(f[0] - l[0], f[1] - l[1]) < 1e-4) ring.pop();
      }
    }
    const area = (r) => r.reduce((s, p, k) => { const q = r[(k + 1) % r.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
    rings.sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
    rings.forEach((r, k) => { if ((area(r) > 0) !== (k === 0)) r.reverse(); }); // outer CCW, holes CW
    return rings;
  }

  // Outward (away from the solid) vertex normals, with a capped miter length.
  function ringNormals(r) {
    const n = r.length, out = [];
    for (let k = 0; k < n; k++) {
      const a = r[(k - 1 + n) % n], b = r[k], c = r[(k + 1) % n];
      const e1 = norm2([b[1] - a[1], -(b[0] - a[0])]), e2 = norm2([c[1] - b[1], -(c[0] - b[0])]);
      const m = norm2([e1[0] + e2[0], e1[1] + e2[1]]);
      out.push([m[0], m[1], Math.min(2, 1 / Math.max(0.3, m[0] * e1[0] + m[1] * e1[1]))]);
    }
    return out;
  }
  function norm2(v) { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }

  function buildMesh(h = 0.13, b = 0.03, K = 6) {
    const rings = parseRings();
    const pos = [], nrm = [], idx = [];
    const vert = (x, y, z, nx, ny, nz) => { pos.push(x, y, z); nrm.push(nx, ny, nz); return pos.length / 3 - 1; };

    // bevel + side profile: rows of (inset, z, normal-xy weight, normal-z)
    const prof = [];
    for (let j = 0; j <= K; j++) { const th = (j / K) * Math.PI / 2; prof.push([b * (1 - Math.sin(th)), h - b * (1 - Math.cos(th)), Math.sin(th), Math.cos(th)]); }
    for (let j = K; j >= 0; j--) { const th = (j / K) * Math.PI / 2; prof.push([b * (1 - Math.sin(th)), -(h - b * (1 - Math.cos(th))), Math.sin(th), -Math.cos(th)]); }

    const capRings = [];
    rings.forEach((r) => {
      const N = ringNormals(r), n = r.length, base = pos.length / 3;
      prof.forEach(([inset, z, sxy, sz]) => {
        for (let k = 0; k < n; k++) {
          const [nx, ny, m] = N[k], d = inset * m;
          const l = Math.hypot(nx * sxy, ny * sxy, sz) || 1;
          vert(r[k][0] - nx * d, r[k][1] - ny * d, z, (nx * sxy) / l, (ny * sxy) / l, sz / l);
        }
      });
      for (let row = 0; row < prof.length - 1; row++) {
        for (let k = 0; k < n; k++) {
          const a = base + row * n + k, c = base + row * n + ((k + 1) % n), d = a + n, e = c + n;
          idx.push(a, c, e, a, e, d);
        }
      }
      capRings.push(r.map((p, k) => [p[0] - N[k][0] * b * N[k][2], p[1] - N[k][1] * b * N[k][2]]));
    });

    // caps
    const flat = [], holes = [];
    capRings.forEach((r, k) => { if (k) holes.push(flat.length / 2); r.forEach((p) => flat.push(p[0], p[1])); });
    const tris = earcut(flat, holes);
    [1, -1].forEach((s) => {
      const base = pos.length / 3;
      for (let k = 0; k < flat.length; k += 2) vert(flat[k], flat[k + 1], s * h, 0, 0, s);
      for (let k = 0; k < tris.length; k += 3) {
        if (s > 0) idx.push(base + tris[k], base + tris[k + 1], base + tris[k + 2]);
        else idx.push(base + tris[k], base + tris[k + 2], base + tris[k + 1]);
      }
    });
    return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), idx: new Uint32Array(idx), thick: h };
  }

  /* earcut — polygon-with-holes triangulation (after mapbox/earcut, ISC) */
  function earcut(data, holeIndices) {
    const hasHoles = holeIndices && holeIndices.length;
    const outerLen = hasHoles ? holeIndices[0] * 2 : data.length;
    let outerNode = linkedList(data, 0, outerLen, true);
    const triangles = [];
    if (!outerNode || outerNode.next === outerNode.prev) return triangles;
    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode);
    earcutLinked(outerNode, triangles, 0);
    return triangles;
  }
  function linkedList(data, start, end, clockwise) {
    let last;
    if (clockwise === signedArea(data, start, end) > 0) for (let i = start; i < end; i += 2) last = insertNode(i, data[i], data[i + 1], last);
    else for (let i = end - 2; i >= start; i -= 2) last = insertNode(i, data[i], data[i + 1], last);
    if (last && equals(last, last.next)) { removeNode(last); last = last.next; }
    return last;
  }
  function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;
    let p = start, again;
    do {
      again = false;
      if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
        removeNode(p); p = end = p.prev;
        if (p === p.next) break;
        again = true;
      } else p = p.next;
    } while (again || p !== end);
    return end;
  }
  function earcutLinked(ear, triangles, pass) {
    if (!ear) return;
    let stop = ear;
    while (ear.prev !== ear.next) {
      const prev = ear.prev, next = ear.next;
      if (isEar(ear)) {
        triangles.push(prev.i / 2, ear.i / 2, next.i / 2);
        removeNode(ear);
        ear = next.next; stop = next.next;
        continue;
      }
      ear = next;
      if (ear === stop) {
        if (!pass) earcutLinked(filterPoints(ear), triangles, 1);
        else if (pass === 1) earcutLinked(cureLocalIntersections(filterPoints(ear), triangles), triangles, 2);
        else if (pass === 2) splitEarcut(ear, triangles);
        break;
      }
    }
  }
  function isEar(ear) {
    const a = ear.prev, b = ear, c = ear.next;
    if (area(a, b, c) >= 0) return false;
    let p = ear.next.next;
    while (p !== ear.prev) {
      if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
      p = p.next;
    }
    return true;
  }
  function cureLocalIntersections(start, triangles) {
    let p = start;
    do {
      const a = p.prev, b = p.next.next;
      if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
        triangles.push(a.i / 2, p.i / 2, b.i / 2);
        removeNode(p); removeNode(p.next);
        p = start = b;
      }
      p = p.next;
    } while (p !== start);
    return filterPoints(p);
  }
  function splitEarcut(start, triangles) {
    let a = start;
    do {
      let b = a.next.next;
      while (b !== a.prev) {
        if (a.i !== b.i && isValidDiagonal(a, b)) {
          let c = splitPolygon(a, b);
          a = filterPoints(a, a.next); c = filterPoints(c, c.next);
          earcutLinked(a, triangles, 0); earcutLinked(c, triangles, 0);
          return;
        }
        b = b.next;
      }
      a = a.next;
    } while (a !== start);
  }
  function eliminateHoles(data, holeIndices, outerNode) {
    const queue = [];
    for (let i = 0; i < holeIndices.length; i++) {
      const start = holeIndices[i] * 2, end = i < holeIndices.length - 1 ? holeIndices[i + 1] * 2 : data.length;
      const list = linkedList(data, start, end, false);
      if (list === list.next) list.steiner = true;
      queue.push(getLeftmost(list));
    }
    queue.sort((a, b) => a.x - b.x);
    for (const h of queue) outerNode = eliminateHole(h, outerNode);
    return outerNode;
  }
  function eliminateHole(hole, outerNode) {
    const bridge = findHoleBridge(hole, outerNode);
    if (!bridge) return outerNode;
    const bridgeReverse = splitPolygon(bridge, hole);
    filterPoints(bridgeReverse, bridgeReverse.next);
    return filterPoints(bridge, bridge.next);
  }
  function findHoleBridge(hole, outerNode) {
    let p = outerNode, qx = -Infinity, m;
    const hx = hole.x, hy = hole.y;
    do {
      if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
        const x = p.x + ((hy - p.y) * (p.next.x - p.x)) / (p.next.y - p.y);
        if (x <= hx && x > qx) { qx = x; m = p.x < p.next.x ? p : p.next; if (x === hx) return m; }
      }
      p = p.next;
    } while (p !== outerNode);
    if (!m) return null;
    const stop = m, mx = m.x, my = m.y;
    let tanMin = Infinity;
    p = m;
    do {
      if (hx >= p.x && p.x >= mx && hx !== p.x && pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
        const tan = Math.abs(hy - p.y) / (hx - p.x);
        if (locallyInside(p, hole) && (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) { m = p; tanMin = tan; }
      }
      p = p.next;
    } while (p !== stop);
    return m;
  }
  const sectorContainsSector = (m, p) => area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
  function getLeftmost(start) {
    let p = start, l = start;
    do { if (p.x < l.x || (p.x === l.x && p.y < l.y)) l = p; p = p.next; } while (p !== start);
    return l;
  }
  const pointInTriangle = (ax, ay, bx, by, cx, cy, px, py) =>
    (cx - px) * (ay - py) >= (ax - px) * (cy - py) && (ax - px) * (by - py) >= (bx - px) * (ay - py) && (bx - px) * (cy - py) >= (cx - px) * (by - py);
  const isValidDiagonal = (a, b) => a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) &&
    ((locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && (area(a.prev, a, b.prev) || area(a, b.prev, b))) ||
      (equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0));
  const area = (p, q, r) => (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  const equals = (a, b) => a.x === b.x && a.y === b.y;
  const sgn = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);
  const onSegment = (p, q, r) => q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
  function intersects(p1, q1, p2, q2) {
    const o1 = sgn(area(p1, q1, p2)), o2 = sgn(area(p1, q1, q2)), o3 = sgn(area(p2, q2, p1)), o4 = sgn(area(p2, q2, q1));
    if (o1 !== o2 && o3 !== o4) return true;
    return (o1 === 0 && onSegment(p1, p2, q1)) || (o2 === 0 && onSegment(p1, q2, q1)) || (o3 === 0 && onSegment(p2, p1, q2)) || (o4 === 0 && onSegment(p2, q1, q2));
  }
  function intersectsPolygon(a, b) {
    let p = a;
    do {
      if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b)) return true;
      p = p.next;
    } while (p !== a);
    return false;
  }
  const locallyInside = (a, b) => (area(a.prev, a, a.next) < 0 ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0);
  function middleInside(a, b) {
    let p = a, inside = false;
    const px = (a.x + b.x) / 2, py = (a.y + b.y) / 2;
    do {
      if (p.y > py !== p.next.y > py && p.next.y !== p.y && px < ((p.next.x - p.x) * (py - p.y)) / (p.next.y - p.y) + p.x) inside = !inside;
      p = p.next;
    } while (p !== a);
    return inside;
  }
  function splitPolygon(a, b) {
    const a2 = node(a.i, a.x, a.y), b2 = node(b.i, b.x, b.y), an = a.next, bp = b.prev;
    a.next = b; b.prev = a; a2.next = an; an.prev = a2; b2.next = a2; a2.prev = b2; bp.next = b2; b2.prev = bp;
    return b2;
  }
  function insertNode(i, x, y, last) {
    const p = node(i, x, y);
    if (!last) { p.prev = p; p.next = p; } else { p.next = last.next; p.prev = last; last.next.prev = p; last.next = p; }
    return p;
  }
  function removeNode(p) { p.next.prev = p.prev; p.prev.next = p.next; }
  const node = (i, x, y) => ({ i, x, y, prev: null, next: null, steiner: false });
  function signedArea(data, start, end) {
    let sum = 0;
    for (let i = start, j = end - 2; i < end; i += 2) { sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]); j = i; }
    return sum;
  }

  // Pen timing (seconds into the reel) for each stroke, shared by the particle
  // write-on and the camera that rides the nib.
  const STROKE_T = [[0.3, 1.9], [2.05, 3.15]];

  window.Mark3D = { CX, CY, HALF, R, path, STROKES, STROKE_T, pointAt, tracePartial, buildMesh };
})();
