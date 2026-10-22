/* XYPHUZ — signature mark.
 * The hand-drawn monogram as a Path2D, its pen-stroke centrelines (for
 * write-on animation), and a WebGL2 renderer that turns it into a real 3D
 * object: a signed distance field is built from the glyph at load time and
 * raymarched as a bevelled extrusion with studio lighting. The same field also
 * drives topographic contour lines radiating out of the signature.
 */
(function () {
  'use strict';

  const D = 'M 311.287 656.583 C 305.789 654.087 302.377 648.694 297.881 635.393 C 292.17 618.497 290.784 606.159 290.828 572.624 C 290.85 556.147 291.476 535.557 292.219 526.869 C 294.016 505.873 299.316 452.842 302.721 421.785 C 306.177 390.259 306.189 388.965 303.012 388.114 C 301.664 387.752 299.306 387.45 297.773 387.442 C 292.433 387.414 276.536 382.816 267.879 378.797 C 263.081 376.569 255.112 371.479 250.149 367.471 C 245.19 363.468 240.575 360.192 239.893 360.192 C 239.21 360.192 231.257 367.879 222.218 377.275 C 204.443 395.751 165.01 431.959 159.637 434.737 C 157.815 435.679 154.291 436.45 151.805 436.45 C 140.044 436.45 132.374 426.339 135.455 414.895 C 136.503 411.005 139.08 408.202 153.799 394.942 C 188.254 363.902 216.133 335 216.133 330.321 C 216.133 329.124 214.412 324.137 212.308 319.239 C 204.987 302.194 203.796 295.652 203.8 272.496 C 203.804 249.815 205.823 232.965 211.346 209.512 C 213.573 200.054 214.035 196.428 213.127 195.52 C 211.87 194.263 206.982 197.458 178.733 217.998 C 168.277 225.601 166.293 226.628 161.303 227.029 C 156.714 227.397 154.985 227.009 151.959 224.932 C 143.993 219.465 141.513 212.263 144.712 203.885 C 146.357 199.578 148.445 197.636 163.046 186.833 C 198.311 160.743 219.971 148.018 236.885 143.454 C 247.718 140.532 253.952 140.987 259.339 145.096 C 267.183 151.08 268.394 159.768 262.836 170.184 C 255.558 183.823 246.857 207.713 243.419 223.498 C 236.703 254.334 236.135 295.588 242.409 296.778 C 245.561 297.376 288.487 237.876 311.013 201.686 C 322.844 182.679 364.082 101.333 372.039 81.308 C 388.2 40.637 391.867 32.776 396.11 29.705 C 400.374 26.619 409.55 26.144 414.403 28.758 C 418.883 31.172 423.118 38.616 423.118 44.078 C 423.118 46.116 419.958 57.41 416.096 69.176 C 409.539 89.154 388.184 159.022 380.757 184.8 C 374.351 207.033 367.526 236.984 360.401 274.13 C 347.773 339.965 346.846 345.126 347.468 346.133 C 348.838 348.349 353.817 346.726 369.28 339.021 C 394.616 326.397 415.959 311.184 428.553 296.772 L 433.042 291.635 L 434.046 276.074 C 435.786 249.097 438.394 232.588 445.451 203.864 C 455.721 162.067 466.194 138.023 481.831 120.345 C 487.939 113.44 493.997 110.657 503.074 110.587 C 515.444 110.492 522.284 115.341 528.256 128.44 C 532.26 137.22 533.441 147.147 532.028 160.141 C 528.953 188.432 521.901 210.287 504.74 244.717 C 492.093 270.092 483.472 284.536 472.944 297.99 L 464.847 311.299 L 465.997 327.336 C 467.977 354.93 471.287 365.751 476.358 386.283 C 480.499 403.05 484.97 413.402 493.89 426.88 C 509.568 450.57 524.383 462.308 542.406 465.318 C 552.553 467.013 557.727 473.703 556.871 484.024 C 556.469 488.873 555.74 490.564 552.701 493.699 C 548.388 498.15 542.77 499.954 536.21 498.996 C 516.376 496.099 495.897 484.109 480.419 466.329 C 471.06 455.579 459.167 437.727 453.661 426.167 C 446.09 410.267 439.4 384.085 435.768 356.139 C 434.153 343.709 433.59 341.673 431.772 341.673 C 431.21 341.673 427.744 343.885 424.07 346.59 C 402.543 362.437 367.955 379.551 348.147 384.155 C 343.942 385.132 342.12 386.14 341.504 387.826 C 341.037 389.105 339.841 397.994 338.846 407.581 C 337.851 417.168 335.801 436.532 334.29 450.612 C 328.077 508.504 325.978 534.711 325.383 561.813 C 324.592 597.83 325.772 609.986 331.756 627.463 C 336.528 641.401 336.644 644.341 332.673 650.851 C 330.334 654.686 323.159 658.638 318.536 658.638 C 317.038 658.638 313.776 657.714 311.287 656.583 Z M 310.402 352.294 C 310.683 351.545 312.351 343.089 314.108 333.502 C 315.865 323.916 320.537 299.2 324.491 278.578 C 329.821 250.781 331.361 240.779 330.446 239.904 C 328.897 238.425 327.852 239.724 310.793 264.326 C 303.522 274.811 289.789 293.765 280.275 306.446 C 270.761 319.126 262.977 330.44 262.977 331.587 C 262.977 333.977 272.781 342.319 280.575 346.561 C 290.252 351.828 309.207 355.471 310.402 352.294 Z M 477.317 241.132 C 490.74 213.531 502.231 185.451 504.919 160.508 C 506.494 145.895 503.127 138.992 490.478 159.178 C 476.524 184.326 470.29 205.054 464.147 235.824 C 462.188 253.188 465.059 258.892 477.317 241.132 Z';
  // Glyph space: centred on the mark, 1 unit = half its height, y down (SVG).
  const CX = 346, CY = 342.5, HALF = 316.5, R = 1.2;
  const path = new Path2D(D);

  // Pen centrelines in SVG coordinates, in writing order.
  const RAW = [
    [[152, 214], [180, 195], [212, 172], [240, 152], [256, 156], [252, 180], [237, 215], [226, 250], [224, 290], [230, 322], [248, 347], [272, 363], [302, 371], [340, 368], [370, 358], [398, 344], [420, 325], [438, 306], [447, 272], [452, 240], [458, 205], [470, 170], [485, 140], [499, 123], [512, 124], [519, 145], [516, 182], [504, 220], [488, 256], [472, 292], [466, 330], [472, 375], [487, 415], [510, 447], [535, 470], [549, 484]],
    [[244, 306], [268, 282], [295, 248], [320, 210], [345, 160], [368, 108], [388, 62], [402, 38], [414, 36], [410, 62], [398, 110], [384, 160], [370, 215], [355, 280], [344, 345], [336, 400], [325, 470], [312, 540], [308, 590], [312, 630], [318, 652]],
    [[146, 426], [175, 400], [200, 375], [222, 351], [234, 338]],
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

  /* ---------- signed distance field ---------- */
  const INF = 1e20;
  function edt1d(f, n, d, v, z) {
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
  }
  function edt(grid, N) {
    const f = new Float64Array(N), d = new Float64Array(N), v = new Int32Array(N), z = new Float64Array(N + 1);
    for (let x = 0; x < N; x++) {
      for (let y = 0; y < N; y++) f[y] = grid[y * N + x];
      edt1d(f, N, d, v, z);
      for (let y = 0; y < N; y++) grid[y * N + x] = d[y];
    }
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) f[x] = grid[y * N + x];
      edt1d(f, N, d, v, z);
      for (let x = 0; x < N; x++) grid[y * N + x] = d[x];
    }
  }
  function buildSDF(N) {
    const c = document.createElement('canvas'); c.width = c.height = N;
    const g = c.getContext('2d');
    g.translate(N / 2, N / 2); g.scale(N / (2 * R) / HALF, N / (2 * R) / HALF); g.translate(-CX, -CY);
    g.fillStyle = '#fff'; g.fill(path);
    const a = g.getImageData(0, 0, N, N).data;
    const gin = new Float64Array(N * N), gout = new Float64Array(N * N);
    for (let i = 0; i < N * N; i++) { const inside = a[i * 4 + 3] > 127; gin[i] = inside ? 0 : INF; gout[i] = inside ? INF : 0; }
    edt(gin, N); edt(gout, N);
    const out = new Float32Array(N * N), px = (2 * R) / N;
    for (let i = 0; i < N * N; i++) out[i] = (gin[i] > 0 ? Math.sqrt(gin[i]) - 0.5 : -(Math.sqrt(gout[i]) - 0.5)) * px;
    return out;
  }

  /* ---------- WebGL ---------- */
  const VS = `#version 300 es
in vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;
  const FS = `#version 300 es
precision highp float;
uniform sampler2D uSdf;
uniform vec2 uRes, uCenter;
uniform float uScale, uThick, uBevel, uEmit, uTime, uSweep, uMode, uAlpha, uReach;
uniform mat3 uRot;
uniform vec3 uColor;
out vec4 outColor;
const float R = ${R.toFixed(2)};
const float CAM = 7.0;

float sd2(vec2 p) {
  vec2 uv = vec2(p.x, -p.y) / (2.0 * R) + 0.5;
  vec2 q = clamp(uv, 0.002, 0.998);
  return texture(uSdf, q).r + length(uv - q) * 2.0 * R;
}
float map(vec3 p) {
  float d = sd2(p.xy) + uBevel;
  vec2 w = vec2(d, abs(p.z) - uThick);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - uBevel;
}
vec3 calcNormal(vec3 p) {
  const vec2 k = vec2(1.0, -1.0); const float h = 0.0016;
  return normalize(k.xyy * map(p + k.xyy * h) + k.yyx * map(p + k.yyx * h) + k.yxy * map(p + k.yxy * h) + k.xxx * map(p + k.xxx * h));
}
vec3 env(vec3 r) {
  float sky = r.y * 0.5 + 0.5;
  vec3 c = mix(vec3(0.012, 0.012, 0.018), vec3(0.11, 0.11, 0.13), smoothstep(0.25, 1.0, sky));
  c += vec3(1.0) * smoothstep(0.16, 0.0, abs(r.x - uSweep)) * smoothstep(-0.3, 0.5, r.y) * 1.8;
  c += vec3(1.0, 0.95, 0.9) * pow(max(dot(r, normalize(vec3(-0.6, 0.7, 0.45))), 0.0), 38.0) * 2.2;
  c += uColor * smoothstep(0.05, -0.8, r.y) * 0.4;
  return c;
}
void main() {
  vec2 s = vec2(gl_FragCoord.x / uRes.x * 1920.0, (1.0 - gl_FragCoord.y / uRes.y) * 1080.0);
  vec2 g = (s - uCenter) / uScale; g.y = -g.y;

  if (uMode > 0.5) {
    float d = sd2(g);
    if (d < 0.0) { outColor = vec4(0.0); return; }
    float f = d * 9.0 - uTime;
    float w = fwidth(f);
    float e = abs(fract(f + 0.5) - 0.5);
    float line = 1.0 - smoothstep(0.0, w * 1.3, e);
    float major = mod(floor(f + 0.5), 4.0) < 0.5 ? 1.0 : 0.38;
    float reach = 1.0 - smoothstep(uReach - 0.4, uReach, d);
    float front = exp(-abs(d - uReach + 0.15) * 7.0) * step(d, uReach);
    float a = (line * major * exp(-d * 0.75) * reach + front * 0.6) * uAlpha;
    outColor = vec4(uColor * a, a);
    return;
  }

  vec3 ro = vec3(0.0, 0.0, CAM);
  vec3 rd = normalize(vec3(g, 0.0) - ro);
  mat3 it = transpose(uRot);
  vec3 o = it * ro, dir = it * rd;
  vec3 bmax = vec3(0.95, 1.25, uThick + uBevel + 0.03);
  vec3 inv = 1.0 / dir;
  vec3 t0 = (-bmax - o) * inv, t1 = (bmax - o) * inv;
  vec3 tmn = min(t0, t1), tmx = max(t0, t1);
  float tn = max(max(tmn.x, tmn.y), tmn.z), tf = min(min(tmx.x, tmx.y), tmx.z);
  if (tn > tf || tf < 0.0) { outColor = vec4(0.0); return; }
  float t = max(tn, 0.0), hit = -1.0;
  for (int i = 0; i < 120; i++) {
    float h = map(o + dir * t);
    if (h < 0.0005) { hit = t; break; }
    t += h * 0.85;
    if (t > tf) break;
  }
  if (hit < 0.0) { outColor = vec4(0.0); return; }
  vec3 p = o + dir * hit;
  vec3 n = calcNormal(p);
  vec3 nw = uRot * n;
  vec3 r = reflect(rd, nw);
  float face = smoothstep(0.72, 0.97, abs(n.z));
  float fres = pow(1.0 - max(dot(nw, -rd), 0.0), 4.0);
  float dif = max(dot(nw, normalize(vec3(0.5, 0.6, 0.8))), 0.0);
  float ao = clamp(map(p + n * 0.04) / 0.04, 0.0, 1.0) * 0.45 + 0.55;
  vec3 enamel = uColor * (0.55 + 0.6 * dif) + env(r) * (0.05 + 0.55 * fres);
  vec3 chrome = env(r) * (0.6 + 0.4 * fres) * vec3(0.9, 0.93, 1.0) + uColor * 0.05;
  vec3 col = mix(chrome, enamel, face) * ao;
  col = col / (1.0 + col * 0.3);
  col = mix(col, uColor, uEmit);
  outColor = vec4(col, 1.0) * uAlpha;
}`;

  let gl = null, prog, U = {}, canvas, ok = false;

  function init() {
    canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) return;
    const sh = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) { console.warn('Mark3D:', e); gl = null; return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['uSdf', 'uRes', 'uCenter', 'uScale', 'uThick', 'uBevel', 'uEmit', 'uTime', 'uSweep', 'uMode', 'uAlpha', 'uReach', 'uRot', 'uColor']
      .forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

    const N = 512, data = buildSDF(N);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, N, N, 0, gl.RED, gl.FLOAT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U.uSdf, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    ok = true;
  }

  function rot(rx, ry, rz) {
    const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
    // R = Ry * Rx * Rz, column-major
    const m = [
      cy * cz + sy * sx * sz, cx * sz, -sy * cz + cy * sx * sz,
      -cy * sz + sy * sx * cz, cx * cz, sy * sz + cy * sx * cz,
      sy * cx, -sx, cy * cx,
    ];
    return new Float32Array(m);
  }
  const hex3 = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };

  function setCommon(o) {
    gl.uniform2f(U.uCenter, o.cx, o.cy);
    gl.uniform1f(U.uScale, o.scale);
    gl.uniform1f(U.uAlpha, o.alpha == null ? 1 : o.alpha);
    gl.uniform3fv(U.uColor, hex3(o.color || '#d4ff3a'));
  }

  window.Mark3D = {
    CX, CY, HALF, path, STROKES, pointAt, tracePartial,
    get ok() { return ok; },
    get canvas() { return canvas; },
    init() { if (!gl && !ok) init(); return ok; },
    // Start a frame at the given backing-store size.
    begin(w, h) {
      if (!ok) return;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.uRes, w, h);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    },
    contour(o) {
      if (!ok) return;
      setCommon(o);
      gl.uniform1f(U.uMode, 1); gl.uniform1f(U.uTime, o.time || 0); gl.uniform1f(U.uReach, o.reach == null ? 99 : o.reach);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    mark(o) {
      if (!ok) return;
      setCommon(o);
      const th = Math.max(0.002, o.thick);
      gl.uniform1f(U.uMode, 0);
      gl.uniform1f(U.uThick, th);
      gl.uniform1f(U.uBevel, Math.min(0.028, th * 0.6));
      gl.uniform1f(U.uEmit, o.emit || 0);
      gl.uniform1f(U.uSweep, o.sweep == null ? 0.3 : o.sweep);
      gl.uniformMatrix3fv(U.uRot, false, rot(o.rx || 0, o.ry || 0, o.rz || 0));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
})();
