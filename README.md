# www.xyphuz.com

A 30-second motion-graphics showreel for **Xyphuz** — software architect building enterprise systems at giga-fab scale and the cloud infrastructure under them.

No framework, no video file: the reel is drawn live on a `<canvas>` (`public/reel.js`) as a pure function of time, and the soundtrack is synthesised with WebAudio (`public/audio.js`) on the same 120 BPM grid, so play, pause, seek and loop all stay in sync.

It plays as one continuous shot of match cuts: a pen writes the signature, which inflates into a 3D mark, turns edge-on into a cursor, types code that spells *software engineer*, bursts into a 3D system architecture, dives into a packet that lands as a die on a wafer, pulls out to a fab floor streaming events into a self-healing cloud cluster, then a type tunnel, and back to the mark.

The 3D mark (`public/mark3d.js`) is the hand-drawn signature turned into a signed distance field at load time and raymarched in WebGL2 as a bevelled extrusion; the same field draws the topographic contour lines around it.

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
