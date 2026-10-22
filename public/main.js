(function () {
  'use strict';

  /* The site has three modes:
   *   gate  — a living particle field and an invitation (unlocks audio)
   *   intro — the 30-second film, full-bleed
   *   site  — the film's last frame, made interactive
   */
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement, stage = $('stage');
  const reel = Reel.create($('gl'), $('ov'));
  const audio = window.ReelAudio, DUR = Reel.DUR;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const query = new URLSearchParams(location.search);
  const now = () => performance.now();

  const SECTIONS = [
    {
      nav: 'Xyphuz', kicker: '[ 00 ]  Hsing-Han Wu',
      title: 'Software architect <em>with a motion designer’s eye.</em>',
      body: 'I build enterprise systems for giga-fab semiconductor manufacturing, and the cloud infrastructure underneath them. I started out in motion and frontend design — which is why this whole site is a film.',
      tags: ['Software architecture', 'Enterprise systems', 'Cloud infrastructure'],
    },
    {
      nav: 'Engineer', kicker: '[ 01 ]  Software engineer',
      title: 'Code that <em>holds up.</em>',
      body: 'Tested, observable and boring in the best way — so the interesting parts can be bold. Every system I ship is meant to be read, operated and changed by the next person.',
      tags: ['Testing', 'CI / CD', 'Observability', 'Performance', 'Code review'],
    },
    {
      nav: 'Architect', kicker: '[ 02 ]  Software architect',
      title: 'Systems that scale, <em>by design.</em>',
      body: 'Clear boundaries, event-driven services and data that stays consistent under load. Architecture is the set of decisions that are expensive to change — I make them on purpose.',
      tags: ['Distributed systems', 'Event-driven', 'Domain-driven design', 'API design'],
    },
    {
      nav: 'Enterprise', kicker: '[ 03 ]  Enterprise systems',
      title: 'Software at <em>giga-fab scale.</em>',
      body: 'Manufacturing systems for semiconductor fabs that never stop: dispatching, scheduling, equipment integration and process control — running 24/7, where downtime is not an option.',
      tags: ['MES', 'Dispatching', 'Scheduling', 'SPC', 'AMHS'],
    },
    {
      nav: 'Cloud', kicker: '[ 04 ]  Cloud infrastructure',
      title: 'Infrastructure that <em>heals itself.</em>',
      body: 'Multi-region platforms, codified end to end and observed everywhere — designed to fail over instead of fall over.',
      tags: ['Kubernetes', 'Infrastructure as code', 'Multi-region', 'SRE'],
    },
  ];

  const st = {
    mode: 'gate', ready: false,
    t0: 0, paused: false, pauseT: 0,
    cur: 0, prev: 0, switchAt: -1e9, homeAt: 0,
    yaw: 0, pitch: 0, vy: 0, vp: 0, mx: 0, my: 0, lastMove: -1e9, force: 0, kick: 0, ui: 0, flashAt: -1e9,
    drag: null,
  };

  /* ---------- sizing ---------- */
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), ov = $('ov');
    ov.width = Math.max(2, Math.round(window.innerWidth * dpr));
    ov.height = Math.max(2, Math.round(window.innerHeight * dpr));
  }
  window.addEventListener('resize', resize);
  resize();

  function setMode(m) {
    st.mode = m;
    root.classList.remove('mode-gate', 'mode-intro', 'mode-site');
    root.classList.add('mode-' + m);
  }

  /* ---------- sound ---------- */
  function syncSound() {
    const on = audio.enabled && !audio.muted;
    $('sound').setAttribute('aria-pressed', String(on));
    $('sound').querySelector('.lbl').textContent = on ? 'Sound on' : 'Sound off';
  }
  async function toggleSound() {
    if (!audio.enabled) {
      if (!(await audio.enable())) return;
      audio.setMuted(false);
      if (st.mode === 'intro' && !st.paused) audio.start(introT());
    } else audio.setMuted(!audio.muted);
    if (st.mode === 'site') audio.ambient(!audio.muted);
    syncSound();
  }

  /* ---------- film ---------- */
  const introT = () => (st.paused ? st.pauseT : (now() - st.t0) / 1000);
  async function startIntro(withSound) {
    audio.ambient(false);
    if (withSound && (await audio.enable())) audio.setMuted(false);
    setMode('intro');
    st.t0 = now(); st.paused = false;
    if (audio.enabled && !audio.muted) audio.start(0);
    syncSound();
  }
  function pauseIntro(p) {
    if (st.mode !== 'intro' || p === st.paused) return;
    if (p) { st.pauseT = introT(); st.paused = true; audio.stop(); }
    else { st.t0 = now() - st.pauseT * 1000; st.paused = false; if (audio.enabled && !audio.muted) audio.start(st.pauseT); }
  }
  setInterval(() => { if (st.mode === 'intro' && !st.paused) audio.tick(introT()); }, 25);

  /* ---------- site ---------- */
  const nav = $('nav');
  SECTIONS.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span class="n">${String(i).padStart(2, '0')}</span>${s.nav}`;
    b.addEventListener('click', () => go(i));
    b.addEventListener('mouseenter', () => audio.ui('hover'));
    nav.appendChild(b);
  });
  function paint(i, instant) {
    [...nav.children].forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    nav.children[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: instant ? 'auto' : 'smooth' });
    const p = $('panel'), s = SECTIONS[i];
    const fill = () => {
      $('p-kicker').textContent = s.kicker; $('p-title').innerHTML = s.title; $('p-body').textContent = s.body;
      $('p-tags').innerHTML = s.tags.map((t) => `<li>${t}</li>`).join('');
      p.classList.remove('swap');
    };
    if (instant) { fill(); return; }
    p.classList.add('swap'); setTimeout(fill, 180);
  }
  function go(i) {
    i = (i + SECTIONS.length) % SECTIONS.length;
    if (st.mode !== 'site' || i === st.cur) return;
    st.prev = st.cur; st.cur = i; st.switchAt = now();
    st.yaw *= 0.3; st.pitch *= 0.3; st.vy = st.vp = 0;
    audio.ui('click');
    paint(i);
  }
  function enterSite(cut) {
    setMode('site');
    audio.stop();
    if (audio.enabled && !audio.muted) audio.ambient(true);
    st.homeAt = now(); st.prev = st.cur = 0; st.switchAt = now() - 1e5;
    st.yaw = st.pitch = st.vy = st.vp = 0; st.ui = cut ? 1 : 0;
    if (cut) st.flashAt = now();
    paint(0, true);
    syncSound();
  }

  /* ---------- pointer: orbit, push, scatter ---------- */
  stage.addEventListener('pointermove', (e) => {
    st.mx = (e.clientX / window.innerWidth) * 2 - 1; st.my = 1 - (e.clientY / window.innerHeight) * 2;
    if (e.pointerType === 'mouse' || st.drag) st.lastMove = now();
    if (!st.drag) return;
    const dx = e.clientX - st.drag.x, dy = e.clientY - st.drag.y;
    st.drag.x = e.clientX; st.drag.y = e.clientY; st.drag.d += Math.abs(dx) + Math.abs(dy);
    st.vy = -dx * 0.005; st.vp = dy * 0.004;
    st.yaw += st.vy; st.pitch += st.vp;
  });
  stage.addEventListener('pointerdown', (e) => {
    if (st.mode !== 'site' && st.mode !== 'gate') return;
    st.drag = { x: e.clientX, y: e.clientY, d: 0 };
    st.mx = (e.clientX / window.innerWidth) * 2 - 1; st.my = 1 - (e.clientY / window.innerHeight) * 2;
    stage.setPointerCapture(e.pointerId); stage.classList.add('dragging');
  });
  const endDrag = () => {
    if (!st.drag) return;
    if (st.drag.d < 8) { st.kick = 1; st.lastMove = now(); audio.ui('scatter'); }
    st.drag = null; stage.classList.remove('dragging');
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  /* ---------- controls ---------- */
  $('enter-sound').addEventListener('click', () => startIntro(true));
  $('enter-quiet').addEventListener('click', () => startIntro(false));
  $('enter-site').addEventListener('click', () => enterSite(true));
  $('skip').addEventListener('click', () => enterSite(true));
  $('replay').addEventListener('click', () => startIntro(audio.enabled && !audio.muted));
  $('sound').addEventListener('click', toggleSound);
  $('brand').addEventListener('click', () => go(0));
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'm') toggleSound();
    if (st.mode === 'intro') {
      if (k === ' ') { e.preventDefault(); pauseIntro(!st.paused); }
      else if (k === 'escape') enterSite(true);
    } else if (st.mode === 'site') {
      if (k === 'arrowright') go(st.cur + 1);
      else if (k === 'arrowleft') go(st.cur - 1);
      else if (/^[1-5]$/.test(k)) go(+k - 1);
      else if (k === 'r') startIntro(audio.enabled && !audio.muted);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pauseIntro(true); audio.ambient(false); }
    else if (st.mode === 'site' && audio.enabled && !audio.muted) audio.ambient(true);
  });

  /* ---------- loop ---------- */
  function frame() {
    requestAnimationFrame(frame);
    if (!st.ready) return;
    const n = now();
    if (st.mode === 'intro') {
      const t = introT();
      if (t >= DUR) enterSite(false);
      else { reel.render(t); $('progress-fill').style.width = (t / DUR) * 100 + '%'; return; }
    }
    if (!st.drag) {
      st.yaw += st.vy; st.pitch += st.vp; st.vy *= 0.92; st.vp *= 0.92;
      st.pitch *= 0.985; // drift back toward each section's framing
    }
    st.ui += ((st.mode === 'site' ? 1 : 0) - st.ui) * 0.045;
    const target = n - st.lastMove < 1200 ? 0.9 : 0;
    st.force += (target - st.force) * 0.08;
    st.kick *= 0.9;
    const fl = Math.max(0, 1 - (n - st.flashAt) / 380);
    reel.renderHome({
      gate: st.mode === 'gate', cur: st.cur, prev: st.prev,
      since: (n - st.switchAt) / 1000, clock: st.mode === 'gate' ? n / 1000 : 3 + (n - st.homeAt) / 1000,
      yaw: st.yaw, pitch: st.pitch, mouse: [st.mx, st.my], force: st.force + st.kick * 2.4, ui: st.ui,
      flash: 0.8 * fl * fl, still: reduced,
    });
  }

  /* ---------- boot ---------- */
  setMode('gate');
  syncSound();
  ['enter-sound', 'enter-quiet'].forEach((id) => ($(id).disabled = true));
  reel.ready().then(() => {
    st.ready = true;
    root.classList.add('ready');
    ['enter-sound', 'enter-quiet'].forEach((id) => ($(id).disabled = false));
    const still = parseFloat(query.get('t'));
    if (!isNaN(still)) { setMode('intro'); st.paused = true; st.pauseT = still; }
    else if (query.has('site') || reduced) enterSite(true);
  });
  requestAnimationFrame(frame);
})();
