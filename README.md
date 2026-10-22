# www.xyphuz.com

A 30-second motion-graphics showreel for **Xyphuz** — software architect building enterprise systems at giga-fab scale and the cloud infrastructure under them.

No framework, no video file. The reel runs on a small WebGL2 engine (`public/engine.js`): about 130,000 particles whose positions are a pure function of time, morphing between nine precomputed 3D formations (`public/shapes.js`), a raymarched SDF of the hand-drawn signature (`public/mark3d.js`) sharing the depth buffer, and an HDR post chain with bloom, depth-of-field bokeh, chromatic aberration and grain. `public/reel.js` directs the camera and timing and draws the typography overlay; the soundtrack is synthesised with WebAudio (`public/audio.js`) on the same 120 BPM grid, so play, pause, seek and loop stay in sync.

It plays as one continuous shot: the particles write the signature in its real two-stroke order, it solidifies into a 3D mark inside an accretion halo, the halo collapses and detonates into volumetric type, reassembles into a live system architecture, dives into a packet that lands as a die on a wafer, pulls out to a fab floor whose event streams rise into a planet-scale cloud that fails over and heals, warps through the manifesto, and comes home to the signature.

Append `?t=12.5` to the URL to open paused on any frame.

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
