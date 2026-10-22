# www.xyphuz.com

The site is a film. **Xyphuz** — software architect building enterprise systems at giga-fab scale and the cloud infrastructure under them.

Visitors pass an entry gate (which unlocks audio), watch a 30-second full-bleed, live-rendered film, and when it ends its last frame *becomes the site*: the same 3D world, now interactive. Switch between roles and ~130k particles re-form into each one; drag to orbit, move to push particles, click to scatter. Every layout — the camera framing, the overlay typography and the UI — adapts from ultra-wide desktop down to portrait phones.

No framework, no video file. The reel runs on a small WebGL2 engine (`public/engine.js`): about 130,000 particles whose positions are a pure function of time, morphing between nine precomputed 3D formations (`public/shapes.js`), a bevelled 3D mesh extruded from the hand-drawn signature path (`public/mark3d.js`), all multisampled, and an HDR post chain with bloom, depth-of-field bokeh, chromatic aberration and grain. `public/reel.js` directs the camera and timing and draws the typography overlay; the soundtrack is synthesised with WebAudio (`public/audio.js`) on the same 120 BPM grid, so play, pause, seek and loop stay in sync.

It plays as one continuous shot: the particles write the signature in its real two-stroke order, it solidifies into a 3D mark inside an accretion halo, the halo collapses and detonates into volumetric type, reassembles into a live system architecture, dives into a packet that lands as a die on a wafer, pulls out to a fab floor whose event streams rise into a planet-scale cloud that fails over and heals, spells out a manifesto word by word, and comes home to the signature.

Append `?t=12.5` to open the film paused on any frame, or `?site` to jump straight to the interactive site. Visitors who prefer reduced motion skip the film automatically.

## Run locally

Any static server works:

```bash
npx serve public
```

## Deploy

Pushing to `main` builds an `nginx` image (`Dockerfile`, serving `public/` on port 3000) and restarts it on the VPS via `.github/workflows/deploy.yaml`.

## Contact

- HSING-HAN, WU (Xyphuz) — xyphuzwu@gmail.com
- <https://github.com/wst24365888>
