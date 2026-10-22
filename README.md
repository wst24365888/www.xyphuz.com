# www.xyphuz.com

A 30-second motion-graphics showreel for **Xyphuz** — software engineer, software architect, motion designer, product builder.

No framework, no video file: the reel is drawn live on a `<canvas>` (`public/reel.js`) as a pure function of time, and the soundtrack is synthesised with WebAudio (`public/audio.js`) on the same 120 BPM grid, so play, pause, seek and loop all stay in sync.

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
