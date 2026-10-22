(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const canvas = $('reel'), stage = $('stage'), player = $('player');
  const reel = Reel.create($('gl'), canvas);
  const audio = window.ReelAudio;
  const DUR = Reel.DUR;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const fmt = (t) => '00:' + String(Math.floor(t)).padStart(2, '0');

  /* ---------- transport ---------- */
  const st = { playing: false, startPerf: 0, startAbs: 0, dirty: true, ready: false };
  const now = () => performance.now();
  const abs = () => (st.playing ? st.startAbs + (now() - st.startPerf) / 1000 : st.startAbs);
  const cur = () => ((abs() % DUR) + DUR) % DUR;

  function play() {
    if (st.playing) return;
    st.startPerf = now(); st.playing = true;
    audio.start(st.startAbs);
    sync();
  }
  function pause() {
    if (!st.playing) return;
    st.startAbs = abs(); st.playing = false;
    audio.stop();
    st.dirty = true; sync();
  }
  const toggle = () => (st.playing ? pause() : play());
  function seek(t) {
    st.startAbs = clamp(t, 0, DUR - 0.001); st.startPerf = now();
    if (st.playing) audio.start(st.startAbs);
    st.dirty = true;
  }

  setInterval(() => { if (st.playing) audio.tick(abs()); }, 25);

  /* ---------- canvas sizing ---------- */
  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    st.dirty = true;
  }
  new ResizeObserver(resize).observe(canvas);

  /* ---------- UI ---------- */
  const chapters = $('chapters'), ticks = $('ticks');
  Reel.SCENES.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.i = i;
    b.innerHTML = `<span class="n">${s.id}</span><span class="t">${s.name}</span><span class="ts">${fmt(s.s)}</span><span class="bar"><i></i></span>`;
    b.addEventListener('click', () => { seek(s.s + 0.001); play(); });
    chapters.appendChild(b);
    if (i) { const k = document.createElement('i'); k.style.left = (s.s / DUR) * 100 + '%'; ticks.appendChild(k); }
  });
  const chapterBtns = [...chapters.children];

  function sync() {
    player.classList.toggle('paused', !st.playing);
    $('play').setAttribute('aria-label', st.playing ? 'Pause' : 'Play');
    player.classList.toggle('muted', !audio.enabled || audio.muted);
    $('mute').setAttribute('aria-label', !audio.enabled || audio.muted ? 'Unmute' : 'Mute');
  }

  let lastSec = -1, lastCh = -1;
  function updateUI(t) {
    const p = (t / DUR) * 100;
    $('fill').style.width = p + '%';
    $('head').style.left = p + '%';
    const sec = Math.floor(t);
    if (sec !== lastSec) { lastSec = sec; $('time').textContent = fmt(t); $('scrub').setAttribute('aria-valuenow', sec); }
    const ci = Reel.SCENES.findIndex((s) => t >= s.s && t < s.e);
    if (ci !== lastCh) { chapterBtns.forEach((b, i) => b.classList.toggle('on', i === ci)); lastCh = ci; }
    const s = Reel.SCENES[ci];
    if (s) chapterBtns[ci].style.setProperty('--p', (t - s.s) / (s.e - s.s));
  }

  function frame() {
    if (st.ready && (st.playing || st.dirty)) {
      const t = cur();
      reel.render(t);
      updateUI(t);
      st.dirty = false;
    }
    requestAnimationFrame(frame);
  }

  /* ---------- controls ---------- */
  $('play').addEventListener('click', toggle);
  $('bigplay').addEventListener('click', play);
  stage.addEventListener('click', (e) => { if (e.target === canvas) toggle(); });

  $('sound').addEventListener('click', async () => {
    const ok = await audio.enable();
    if (!ok) return;
    audio.setMuted(false);
    player.classList.add('sound-on');
    if (st.playing) pause();
    seek(0); play();
  });
  $('mute').addEventListener('click', async () => {
    if (!audio.enabled) { $('sound').click(); return; }
    audio.setMuted(!audio.muted); sync();
  });

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (player.requestFullscreen) player.requestFullscreen();
  }
  $('fs').addEventListener('click', fullscreen);

  // scrubber
  const scrub = $('scrub');
  let wasPlaying = false, dragging = false;
  const seekFromEvent = (e) => {
    const r = scrub.getBoundingClientRect();
    seek(clamp((e.clientX - r.left) / r.width, 0, 1) * DUR);
  };
  scrub.addEventListener('pointerdown', (e) => {
    dragging = true; wasPlaying = st.playing; pause();
    scrub.setPointerCapture(e.pointerId); seekFromEvent(e);
  });
  scrub.addEventListener('pointermove', (e) => { if (dragging) seekFromEvent(e); });
  const endDrag = () => { if (!dragging) return; dragging = false; if (wasPlaying) play(); };
  scrub.addEventListener('pointerup', endDrag);
  scrub.addEventListener('pointercancel', endDrag);

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') { e.preventDefault(); toggle(); }
    else if (k === 'arrowleft' || k === 'j') { e.preventDefault(); seek(cur() - 2); }
    else if (k === 'arrowright' || k === 'l') { e.preventDefault(); seek(cur() + 2); }
    else if (k === 'm') $('mute').click();
    else if (k === 'f') fullscreen();
    else if (k === 'r') { seek(0); play(); }
    else if (/^[1-8]$/.test(k)) { seek(Reel.SCENES[+k - 1].s + 0.001); play(); }
  });

  // auto-hide controls in fullscreen
  let idle;
  player.addEventListener('pointermove', () => {
    player.classList.remove('idle'); clearTimeout(idle);
    idle = setTimeout(() => player.classList.add('idle'), 2200);
  });

  /* ---------- boot ---------- */
  // ?t=12.5 opens paused on that frame (handy for sharing a specific shot).
  const still = parseFloat(new URLSearchParams(location.search).get('t'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  sync();
  reel.ready().then(() => {
    st.ready = true;
    document.documentElement.classList.add('ready');
    if (!isNaN(still)) seek(still);
    else if (reduced) seek(28.6);
    else { seek(0); play(); }
  });
  requestAnimationFrame(frame);
})();
