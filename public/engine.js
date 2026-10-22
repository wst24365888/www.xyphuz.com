/* XYPHUZ — GPU engine.
 * WebGL2 renderer for the reel: ~130k particles whose positions are a pure
 * function of time (morphing between precomputed 3D formations stored in float
 * textures), the bevelled 3D signature mesh, all multisampled and depth-sorted,
 * a volumetric background, and an HDR post chain (bloom, chromatic
 * aberration, vignette, grain, filmic tonemap).
 */
(function () {
  'use strict';

  const SIDE = 360, N = SIDE * SIDE;
  let gl = null, ok = false, hdr = false, cv = null, cur = null;
  const PR = {};
  let vaoQuad, vaoEmpty, vaoSprite, spriteBuf, vaoMesh = null, meshCount = 0;
  let msFB = null, sceneFB = null, bloom = [], shapeTex = [];
  let fw = 0, fh = 0;

  const QUAD_VS = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const BG_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform vec3 uTop, uBot, uConeCol; uniform float uCone, uStars, uTime; uniform vec2 uRes;
float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 c = mix(uBot, uTop, vUv.y);
  vec2 g = floor(vUv * vec2(uRes.x / uRes.y, 1.0) * 260.0);
  float s = h(g);
  c += vec3(step(0.9972, s)) * uStars * (0.45 + 0.55 * sin(uTime * 2.5 + s * 60.0));
  float x = (vUv.x - 0.5) * uRes.x / uRes.y, y = 1.0 - vUv.y;
  float w = 0.05 + y * 0.5;
  float cone = smoothstep(w, w * 0.15, abs(x)) * smoothstep(1.15, 0.0, y);
  float shafts = 0.65 + 0.35 * sin(x * 26.0 / (0.3 + y) + uTime * 0.6) * sin(x * 9.0 / (0.3 + y) - uTime * 0.4);
  c += uConeCol * cone * shafts * uCone;
  o = vec4(c, 1.0);
}`;

  const PART_VS = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uPA, uFA, uPB, uFB;
uniform mat4 uVP, uMA, uMB;
uniform float uMix, uSpread, uTurb, uTime, uSignT, uSignMode, uScan, uFail, uFailId, uPull, uSize, uFocal, uFocus, uAperture, uGain, uBurst;
uniform vec3 uPullC, uMouse; uniform float uMouseR, uMouseF;
out vec3 vCol; out float vA; out float vSoft;
const int SIDE = ${SIDE};
float h1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
vec3 pal(float i) {
  if (i < 0.5) return vec3(0.95, 0.93, 0.88);
  if (i < 1.5) return vec3(0.83, 1.0, 0.23);
  if (i < 2.5) return vec3(1.0, 0.30, 0.18);
  if (i < 3.5) return vec3(0.44, 0.55, 1.0);
  if (i < 4.5) return vec3(0.65, 0.48, 1.0);
  return vec3(1.0, 0.80, 0.25);
}
vec3 evalP(vec4 P, vec4 F, mat4 M, float seed, out vec3 col, out float bri) {
  float code = floor(F.w);
  vec3 p = P.xyz;
  col = pal(floor(P.w)); bri = fract(P.w);
  if (code == 1.0) {                       // straight flow A → B
    float u = fract(uTime * (0.2 + seed * 0.45) + seed * 7.13);
    p = mix(P.xyz, F.xyz, u);
    bri *= smoothstep(0.0, 0.08, u) * smoothstep(1.0, 0.85, u);
  } else if (code == 3.0) {                // wafer die, lit once the scan passes
    if (F.x > uScan) { col = F.y > 0.5 ? pal(2.0) : pal(1.0); bri = 0.5 + 0.5 * F.z; }
  } else if (code == 4.0) {                // cloud region cluster
    float id = floor(fract(F.w) * 10.0 + 0.5);
    if (abs(id - uFailId) < 0.5) { col = mix(col, pal(2.0), uFail); bri *= 1.0 + uFail * (0.6 + 0.6 * sin(uTime * 30.0)); }
  } else if (code == 5.0) {                // vehicle on a rectangular overhead loop
    float hx = F.x, hz = F.y, L1 = 2.0 * hx, L2 = 2.0 * hz;
    float u = fract(uTime * 0.05 + fract(F.w)) * 2.0 * (L1 + L2);
    vec2 q;
    if (u < L1) q = vec2(-hx + u, -hz);
    else if (u < L1 + L2) q = vec2(hx, -hz + (u - L1));
    else if (u < 2.0 * L1 + L2) q = vec2(hx - (u - L1 - L2), hz);
    else q = vec2(-hx, hz - (u - 2.0 * L1 - L2));
    p = vec3(q.x, F.z, q.y) + P.xyz;
  } else if (code == 6.0) {                // great-circle arc between regions
    float u = fract(uTime * (0.16 + seed * 0.2) + seed * 5.0);
    vec3 a = normalize(P.xyz), b = normalize(F.xyz);
    float om = acos(clamp(dot(a, b), -1.0, 1.0));
    vec3 d = (sin((1.0 - u) * om) * a + sin(u * om) * b) / max(sin(om), 1e-3);
    p = d * (length(P.xyz) + om * 0.6 * sin(3.14159 * u));
    float ids = fract(F.w) * 100.0 + 0.5;
    float ia = floor(ids / 10.0), ib = floor(mod(ids, 10.0));
    float hit = (abs(ia - uFailId) < 0.5 || abs(ib - uFailId) < 0.5) ? 1.0 : 0.0;
    bri *= mix(1.0, 0.03, hit * uFail) * (1.0 + 0.8 * uFail * (1.0 - hit));
    bri *= smoothstep(0.0, 0.06, u) * smoothstep(1.0, 0.94, u);
  } else if (code == 7.0) {                // warp tunnel
    p.z = mod(P.z + uTime * (10.0 + seed * 8.0), 60.0) - 50.0;
  } else if (code == 8.0) {                // differentially rotating disc
    float r = length(P.xz), a = atan(P.z, P.x) + uTime * (1.4 / (0.5 + r * 0.3));
    p = vec3(cos(a) * r, P.y, sin(a) * r);
  }
  return (M * vec4(p, 1.0)).xyz;
}
void main() {
  int id = gl_VertexID;
  ivec2 tc = ivec2(id % SIDE, id / SIDE);
  vec4 PA = texelFetch(uPA, tc, 0), FA = texelFetch(uFA, tc, 0), PB = texelFetch(uPB, tc, 0), FB = texelFetch(uFB, tc, 0);
  float seed = h1(float(id) * 0.6180339 + 0.1);
  vec3 cA, cB; float bA, bB;
  vec3 a = evalP(PA, FA, uMA, seed, cA, bA);
  vec3 b = evalP(PB, FB, uMB, seed, cB, bB);
  float m = (uSignMode > 0.5 && floor(FB.w) == 2.0)
    ? clamp((uSignT - FB.x + 0.22) / 0.22, 0.0, 1.0)   // land exactly as the nib passes
    : clamp(uMix * (1.0 + uSpread) - seed * uSpread, 0.0, 1.0);
  float e = m * m * (3.0 - 2.0 * m);
  float arc = sin(3.14159 * e);
  vec3 p = mix(a, b, e);
  vec3 q = p * 0.35 + uTime * 0.3;
  p += vec3(sin(q.y * 2.1 + seed * 6.0) + sin(q.z * 1.3), sin(q.z * 1.7 + seed * 4.0) + sin(q.x * 2.3), sin(q.x * 1.9 + seed * 5.0) + sin(q.y * 1.1)) * arc * uTurb;
  p.xy *= 1.0 + arc * uBurst * (0.6 + seed);   // between words: blow outward…
  p.z += arc * uBurst * (3.0 + seed * 9.0);     // …and toward the lens
  p = mix(p, uPullC, clamp(uPull * (0.55 + seed * 0.9), 0.0, 1.0));
  vec3 dm = p - uMouse;                          // the cursor pushes particles away
  float mk = exp(-dot(dm, dm) / (uMouseR * uMouseR)) * uMouseF;
  p += dm / (length(dm) + 0.05) * (mk / (1.0 + mk * 0.4)) * uMouseR * (0.6 + seed * 0.8);
  vec3 col = mix(mix(cA, cB, e) + vec3(0.3) * arc, vec3(0.83, 1.0, 0.23), clamp(mk, 0.0, 0.6));
  float bri = mix(bA, bB, e) * (1.0 + arc * 0.5) * (1.0 + min(mk, 1.0) * 0.8);
  vec4 clip = uVP * vec4(p, 1.0);
  gl_Position = clip;
  float depth = max(clip.w, 0.05);
  float px = uSize * uFocal / depth;
  float coc = abs(depth - uFocus) * uAperture * uFocal / depth;
  float sz = max(px, 1.2) + coc;
  gl_PointSize = min(sz, 56.0);
  float sub = min(px / 1.2, 1.0);
  float energy = pow(max(px, 1.2) / sz, 2.0);
  vA = bri * uGain * sub * sub * energy;
  vSoft = clamp(coc / sz * 1.5, 0.0, 1.0);
  vCol = col;
}`;

  const PART_FS = `#version 300 es
precision highp float;
in vec3 vCol; in float vA; in float vSoft; out vec4 o;
void main() {
  vec2 d = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(d, d);
  if (r2 > 1.0) discard;
  float core = exp(-r2 * 3.5);
  float disc = smoothstep(1.0, 0.7, sqrt(r2)) * 0.85 + 0.15 * smoothstep(1.0, 0.9, sqrt(r2));
  float a = mix(core, disc, vSoft) * vA;
  o = vec4(vCol * a, a);
}`;

  const SPRITE_VS = `#version 300 es
in vec4 aPos; in vec4 aC; uniform mat4 uVP; uniform float uFocal; out vec4 vC;
void main() { vec4 c = uVP * vec4(aPos.xyz, 1.0); gl_Position = c; gl_PointSize = clamp(aPos.w * uFocal / max(c.w, 0.05), 1.0, 256.0); vC = aC; }`;
  const SPRITE_FS = `#version 300 es
precision highp float;
in vec4 vC; out vec4 o;
void main() { vec2 d = gl_PointCoord * 2.0 - 1.0; float r2 = dot(d, d); if (r2 > 1.0) discard;
  float a = (exp(-r2 * 9.0) + exp(-r2 * 2.5) * 0.25) * vC.a; o = vec4(vC.rgb * a, a); }`;

  const MESH_VS = `#version 300 es
in vec3 aPos; in vec3 aN;
uniform mat4 uVP; uniform mat3 uRot; uniform vec3 uMPos, uMScale;
out vec3 vN; out vec3 vW; out float vFace;
void main() {
  vec3 w = uMPos + uRot * (aPos * uMScale);
  vW = w; vN = normalize(uRot * (aN / uMScale)); vFace = smoothstep(0.75, 0.98, abs(aN.z));
  gl_Position = uVP * vec4(w, 1.0);
}`;
  const MESH_FS = `#version 300 es
precision highp float;
in vec3 vN; in vec3 vW; in float vFace; out vec4 o;
uniform vec3 uCam, uColor; uniform float uEmit, uSweep, uAlpha;
vec3 env(vec3 r) {
  vec3 c = mix(vec3(0.008, 0.008, 0.012), vec3(0.10, 0.10, 0.13), smoothstep(-0.2, 1.0, r.y));
  c += vec3(1.0) * smoothstep(0.12, 0.0, abs(r.x - uSweep)) * smoothstep(-0.2, 0.6, r.y) * 5.0;
  c += vec3(1.0, 0.95, 0.9) * pow(max(dot(r, normalize(vec3(-0.6, 0.75, 0.45))), 0.0), 60.0) * 6.0;
  c += vec3(0.6, 0.7, 1.0) * pow(max(dot(r, normalize(vec3(0.8, 0.2, -0.3))), 0.0), 24.0) * 1.2;
  c += uColor * smoothstep(0.05, -0.8, r.y) * 0.9;
  return c;
}
void main() {
  vec3 n = normalize(vN), v = normalize(uCam - vW);
  if (dot(n, v) < 0.0) n = -n;
  vec3 r = reflect(-v, n);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 5.0);
  float dif = max(dot(n, normalize(vec3(0.4, 0.8, 0.6))), 0.0);
  float spec = pow(max(dot(r, normalize(vec3(0.4, 0.8, 0.6))), 0.0), 80.0);
  vec3 enamel = uColor * (0.42 + 0.75 * dif) + env(r) * (0.04 + 0.7 * fres) + vec3(spec) * 1.5;
  vec3 chrome = env(r) * (0.55 + 0.45 * fres) * vec3(0.92, 0.95, 1.0) + uColor * 0.05;
  vec3 col = mix(chrome, enamel, vFace);
  col = mix(col, uColor * 1.6, uEmit);
  o = vec4(col * uAlpha, uAlpha);
}`;

  const DOWN_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uTex; uniform vec2 uTexel; uniform float uPre, uThresh;
vec3 s(vec2 d) { return texture(uTex, vUv + uTexel * d).rgb; }
void main() {
  vec3 c = s(vec2(0)) * 0.125
    + (s(vec2(-2, 2)) + s(vec2(2, 2)) + s(vec2(-2, -2)) + s(vec2(2, -2))) * 0.03125
    + (s(vec2(0, 2)) + s(vec2(-2, 0)) + s(vec2(2, 0)) + s(vec2(0, -2))) * 0.0625
    + (s(vec2(-1, 1)) + s(vec2(1, 1)) + s(vec2(-1, -1)) + s(vec2(1, -1))) * 0.125;
  if (uPre > 0.5) {
    float br = max(c.r, max(c.g, c.b));
    float soft = clamp(br - uThresh + 0.4, 0.0, 0.8); soft = soft * soft / 1.6;
    c *= max(soft, br - uThresh) / max(br, 1e-4);
  }
  o = vec4(c, 1.0);
}`;
  const UP_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uTex; uniform vec2 uTexel;
vec3 s(vec2 d) { return texture(uTex, vUv + uTexel * d).rgb; }
void main() {
  vec3 c = (s(vec2(-1, -1)) + s(vec2(1, -1)) + s(vec2(-1, 1)) + s(vec2(1, 1))
    + 2.0 * (s(vec2(0, -1)) + s(vec2(-1, 0)) + s(vec2(1, 0)) + s(vec2(0, 1))) + 4.0 * s(vec2(0))) / 16.0;
  o = vec4(c, 1.0);
}`;
  const COMP_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uScene, uBloom;
uniform float uBloomAmt, uCA, uVig, uGrain, uTime, uExposure, uFade, uFlash; uniform vec2 uRes;
float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec3 at(vec2 uv) { return texture(uScene, uv).rgb + texture(uBloom, uv).rgb * uBloomAmt; }
void main() {
  vec2 c = vUv - 0.5; float r = dot(c, c);
  vec2 off = c * r * uCA * 0.06;
  vec3 col = vec3(at(vUv - off).r, at(vUv).g, at(vUv + off).b);
  col = 1.0 - exp(-col * uExposure);
  col *= 1.0 - uVig * r * 1.7;
  col += (h(vUv * uRes + fract(uTime * 7.31) * 100.0) - 0.5) * uGrain;
  col = mix(col, vec3(1.0), uFlash);
  col *= 1.0 - uFade;
  o = vec4(max(col, 0.0), 1.0);
}`;

  /* ---------- plumbing ---------- */
  function shader(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.slice(0, 200));
    return s;
  }
  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aPos'); gl.bindAttribLocation(p, 1, 'aC'); gl.bindAttribLocation(p, 1, 'aN');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    p.u = {};
    return p;
  }
  const loc = (n) => (n in cur.u ? cur.u[n] : (cur.u[n] = gl.getUniformLocation(cur, n)));
  const use = (p) => { cur = p; gl.useProgram(p); };
  const f1 = (n, v) => gl.uniform1f(loc(n), v);
  const f2 = (n, a, b) => gl.uniform2f(loc(n), a, b);
  const f3 = (n, v) => gl.uniform3fv(loc(n), v);
  const i1 = (n, v) => gl.uniform1i(loc(n), v);
  const m4 = (n, v) => gl.uniformMatrix4fv(loc(n), false, v);
  const m3 = (n, v) => gl.uniformMatrix3fv(loc(n), false, v);

  function colorTex(w, h) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, hdr ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, hdr ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function target(w, h, depth) {
    const t = colorTex(w, h), f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    let rb = null;
    if (depth) {
      rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
    }
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete');
    return { f, t, rb, w, h };
  }
  function drop(tg) { if (!tg) return; gl.deleteFramebuffer(tg.f); if (tg.t) gl.deleteTexture(tg.t); if (tg.rb) gl.deleteRenderbuffer(tg.rb); if (tg.cb) gl.deleteRenderbuffer(tg.cb); }
  // Multisampled colour + depth: everything 3D is drawn here, then resolved.
  function msTarget(w, h) {
    const samples = Math.min(4, gl.getParameter(gl.MAX_SAMPLES) || 1), f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    const cb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, cb);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, hdr ? gl.RGBA16F : gl.RGBA8, w, h);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, cb);
    const rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, w, h);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('msaa framebuffer incomplete');
    return { f, cb, rb, w, h };
  }

  function resize(w, h) {
    if (w === fw && h === fh) return;
    fw = w; fh = h; cv.width = w; cv.height = h;
    drop(msFB); drop(sceneFB); bloom.forEach(drop); bloom = [];
    msFB = msTarget(w, h);
    sceneFB = target(w, h, false);
    let bw = Math.max(1, w >> 1), bh = Math.max(1, h >> 1);
    for (let i = 0; i < 6; i++) { bloom.push(target(bw, bh, false)); bw = Math.max(1, bw >> 1); bh = Math.max(1, bh >> 1); }
  }

  function init(canvas) {
    cv = canvas;
    gl = cv.getContext('webgl2', { antialias: false, alpha: false, depth: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
    if (!gl) return false;
    try {
      hdr = !!gl.getExtension('EXT_color_buffer_float');
      PR.bg = program(QUAD_VS, BG_FS);
      PR.part = program(PART_VS, PART_FS);
      PR.sprite = program(SPRITE_VS, SPRITE_FS);
      PR.mesh = program(MESH_VS, MESH_FS);
      PR.down = program(QUAD_VS, DOWN_FS);
      PR.up = program(QUAD_VS, UP_FS);
      PR.comp = program(QUAD_VS, COMP_FS);
    } catch (e) { console.warn('Engine:', e); gl = null; return false; }

    vaoQuad = gl.createVertexArray(); gl.bindVertexArray(vaoQuad);
    const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    vaoEmpty = gl.createVertexArray();
    vaoSprite = gl.createVertexArray(); gl.bindVertexArray(vaoSprite);
    spriteBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, spriteBuf);
    gl.bufferData(gl.ARRAY_BUFFER, 64 * 32, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 16);
    gl.bindVertexArray(null);
    ok = true;
    return true;
  }

  function dataTex(data, w, h, internal, format) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.FLOAT, data);
    const filt = internal === gl.R16F ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filt);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filt);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function setShapes(list) {
    const cache = new Map(); // formations may share a behaviour texture
    const tex = (a) => { if (!cache.has(a)) cache.set(a, dataTex(a, SIDE, SIDE, gl.RGBA32F, gl.RGBA)); return cache.get(a); };
    shapeTex = list.map((s) => ({ P: tex(s.P), F: tex(s.F) }));
  }
  function setMesh(m) {
    vaoMesh = gl.createVertexArray(); gl.bindVertexArray(vaoMesh);
    const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, m.pos, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    const nb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, nb); gl.bufferData(gl.ARRAY_BUFFER, m.nrm, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    meshCount = m.idx.length; meshThick = m.thick;
  }
  let meshThick = 0.13;
  const bindTex = (unit, t) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); };

  function fullscreen() { gl.bindVertexArray(vaoQuad); gl.drawArrays(gl.TRIANGLES, 0, 3); }

  /* ---------- one frame ---------- */
  function render(f) {
    if (!ok) return;
    resize(f.width, f.height);
    const focal = (fh / 2) / Math.tan(f.fov / 2);

    gl.bindFramebuffer(gl.FRAMEBUFFER, msFB.f);
    gl.viewport(0, 0, fw, fh);
    gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST);
    gl.depthMask(true); gl.clearDepth(1); gl.clear(gl.DEPTH_BUFFER_BIT);

    use(PR.bg);
    f3('uTop', f.bg.top); f3('uBot', f.bg.bot); f3('uConeCol', f.bg.coneCol || [1, 1, 1]);
    f1('uCone', f.bg.cone || 0); f1('uStars', f.bg.stars || 0); f1('uTime', f.time); f2('uRes', fw, fh);
    fullscreen();

    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    if (f.mark && f.mark.alpha > 0.001 && vaoMesh) {
      const mk = f.mark, kz = Math.max(0.015, mk.thick / meshThick);
      use(PR.mesh);
      m4('uVP', f.vp); m3('uRot', mk.rot); f3('uMPos', mk.pos); f3('uMScale', [mk.scale, mk.scale, mk.scale * kz]);
      f3('uCam', f.eye); f3('uColor', mk.color || [0.83, 1, 0.23]);
      f1('uEmit', mk.emit || 0); f1('uSweep', mk.sweep || 0); f1('uAlpha', mk.alpha);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(true);
      gl.bindVertexArray(vaoMesh);
      gl.drawElements(gl.TRIANGLES, meshCount, gl.UNSIGNED_INT, 0);
    }

    const p = f.particles;
    if (p && shapeTex.length) {
      use(PR.part);
      const A = shapeTex[p.a], B = shapeTex[p.b];
      bindTex(0, A.P); bindTex(1, A.F); bindTex(2, B.P); bindTex(3, B.F);
      i1('uPA', 0); i1('uFA', 1); i1('uPB', 2); i1('uFB', 3);
      m4('uVP', f.vp); m4('uMA', p.ma); m4('uMB', p.mb);
      f1('uMix', p.mix); f1('uSpread', p.spread); f1('uTurb', p.turb); f1('uTime', f.time);
      f1('uSignT', p.signT || 0); f1('uSignMode', p.signMode || 0); f1('uScan', p.scan == null ? 99 : p.scan);
      f1('uFail', p.fail || 0); f1('uFailId', p.failId == null ? -1 : p.failId);
      f1('uPull', p.pull || 0); f3('uPullC', p.pullC || [0, 0, 0]); f1('uBurst', p.burst || 0);
      const mo = f.mouse || { p: [0, 0, 0], r: 1, f: 0 };
      f3('uMouse', mo.p); f1('uMouseR', Math.max(0.01, mo.r)); f1('uMouseF', mo.f);
      f1('uSize', p.size); f1('uFocal', focal); f1('uFocus', f.focus); f1('uAperture', f.aperture); f1('uGain', p.gain);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
      gl.bindVertexArray(vaoEmpty);
      gl.drawArrays(gl.POINTS, 0, N);
    }

    if (f.sprites && f.sprites.length) {
      use(PR.sprite);
      m4('uVP', f.vp); f1('uFocal', focal);
      const data = new Float32Array(f.sprites.flat());
      gl.bindBuffer(gl.ARRAY_BUFFER, spriteBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
      gl.bindVertexArray(vaoSprite);
      gl.drawArrays(gl.POINTS, 0, f.sprites.length);
    }
    gl.depthMask(true); gl.disable(gl.DEPTH_TEST);

    // resolve MSAA into a sampleable texture
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, msFB.f); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sceneFB.f);
    gl.blitFramebuffer(0, 0, fw, fh, 0, 0, fw, fh, gl.COLOR_BUFFER_BIT, gl.NEAREST);

    // bloom: progressive downsample, then tent upsample back up the chain
    gl.disable(gl.BLEND);
    use(PR.down);
    let src = sceneFB;
    bloom.forEach((b, i) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, b.f); gl.viewport(0, 0, b.w, b.h);
      bindTex(0, src.t); i1('uTex', 0); f2('uTexel', 1 / src.w, 1 / src.h);
      f1('uPre', i === 0 ? 1 : 0); f1('uThresh', f.post.threshold);
      fullscreen(); src = b;
    });
    use(PR.up);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    for (let i = bloom.length - 1; i > 0; i--) {
      const s = bloom[i], d = bloom[i - 1];
      gl.bindFramebuffer(gl.FRAMEBUFFER, d.f); gl.viewport(0, 0, d.w, d.h);
      bindTex(0, s.t); i1('uTex', 0); f2('uTexel', 1 / s.w, 1 / s.h);
      fullscreen();
    }
    gl.disable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, fw, fh);
    use(PR.comp);
    bindTex(0, sceneFB.t); i1('uScene', 0); bindTex(1, bloom[0].t); i1('uBloom', 1);
    const q = f.post;
    f1('uBloomAmt', q.bloom); f1('uCA', q.ca); f1('uVig', q.vig); f1('uGrain', q.grain); f1('uTime', f.time);
    f1('uExposure', q.exposure); f1('uFade', q.fade || 0); f1('uFlash', q.flash || 0); f2('uRes', fw, fh);
    fullscreen();
  }

  window.Engine = { SIDE, N, init, setShapes, setMesh, render, get ok() { return ok; }, get hdr() { return hdr; }, get canvas() { return cv; } };
})();
