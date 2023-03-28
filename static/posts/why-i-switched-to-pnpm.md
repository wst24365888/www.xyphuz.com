---
title: Why I switched to pnpm?
description: The reason why pnpm is an awesome alternative to npm/yarn!
date: 2022-10-17
tags: ["pnpm"]
---

## What is `pnpm`?

*A `node` package manager, an awesome alternative to `npm`/`yarn`!*


## Why `pnpm`

- Fast
- Save Disk Space
- Strict


## How fast `pnpm` is?

For most of the actions, `pnpm` is about 2x fast than `npm`/`yarn`!

![](https://i.imgur.com/WgViGrM.png)

![](https://pnpm.io/img/benchmarks/alotta-files.svg)


### Why is `pnpm` so fast?

There is no blocking stages of installation in `pnpm`.

> *Each dependency has its own stages and the next stage starts as soon as possible.*

For other pms:

![](data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM6eGw9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjE2Ny41OTUwNSAxNzc3IDY5MC4xMTk4IDMxNC4zOTYiIHdpZHRoPSI2OTAuMTE5OCIgaGVpZ2h0PSIzMTQuMzk2Ij4KICA8ZGVmcz4KICAgIDxtYXJrZXIgb3JpZW50PSJhdXRvIiBvdmVyZmxvdz0idmlzaWJsZSIgbWFya2VyVW5pdHM9InN0cm9rZVdpZHRoIiBpZD0iRmlsbGVkQXJyb3dfTWFya2VyIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHZpZXdCb3g9Ii0xIC00IDEwIDgiIG1hcmtlcldpZHRoPSIxMCIgbWFya2VySGVpZ2h0PSI4IiBjb2xvcj0iYmxhY2siPgogICAgICA8Zz4KICAgICAgICA8cGF0aCBkPSJNIDggMCBMIDAgLTMgTCAwIDMgWiIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICAgIDwvZz4KICAgIDwvbWFya2VyPgogIDwvZGVmcz4KICA8ZyBpZD0iQ2FudmFzXzEiIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZpbGw9Im5vbmUiIHN0cm9rZS1vcGFjaXR5PSIxIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSI+CiAgICA8dGl0bGU+Q2FudmFzIDE8L3RpdGxlPgogICAgPHJlY3QgZmlsbD0id2hpdGUiIHg9IjE2Ny41OTUwNSIgeT0iMTc3NyIgd2lkdGg9IjY5MC4xMTk4IiBoZWlnaHQ9IjMxNC4zOTYiLz4KICAgIDxnIGlkPSJDYW52YXNfMV9MYXllcl8xIj4KICAgICAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogICAgICA8ZyBpZD0iR3JhcGhpY18xMjAiPgogICAgICAgIDx0ZXh0IHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3OS4wOTUwNSAyMDQwLjk0OCkiIGZpbGw9ImJsYWNrIj4KICAgICAgICAgIDx0c3BhbiBmb250LWZhbWlseT0iSGVsdmV0aWNhIE5ldWUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9ImJsYWNrIiB4PSI4NTI2NTEzZS0xOSIgeT0iMTUiPlBhY2thZ2UgaW5zdGFsbGF0aW9uIHByb2dyZXNzOjwvdHNwYW4+CiAgICAgICAgPC90ZXh0PgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzExOSI+CiAgICAgICAgPHJlY3QgeD0iMTc0LjA5NTA1IiB5PSIyMDY0LjM5NiIgd2lkdGg9Ijg5LjUiIGhlaWdodD0iMjIiIGZpbGw9IiM2MGQ5MzYiLz4KICAgICAgICA8dGV4dCB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNzkuMDk1MDUgMjA2Ni4xNzIpIiBmaWxsPSJ3aGl0ZSI+CiAgICAgICAgICA8dHNwYW4gZm9udC1mYW1pbHk9IkhlbHZldGljYSBOZXVlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgeD0iNC43OSIgeT0iMTUiPlJlc29sdmluZzwvdHNwYW4+CiAgICAgICAgPC90ZXh0PgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzExOCI+CiAgICAgICAgPHJlY3QgeD0iMjYzLjU5NTA1IiB5PSIyMDY0LjM5NiIgd2lkdGg9Ijg5LjUiIGhlaWdodD0iMjIiIGZpbGw9IiMwMGEyZmYiLz4KICAgICAgICA8dGV4dCB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNjguNTk1MDUgMjA2Ni4xNzIpIiBmaWxsPSJ3aGl0ZSI+CiAgICAgICAgICA8dHNwYW4gZm9udC1mYW1pbHk9IkhlbHZldGljYSBOZXVlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgeD0iOC43ODIiIHk9IjE1Ij5GZXRjaGluZzwvdHNwYW4+CiAgICAgICAgPC90ZXh0PgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzExNyI+CiAgICAgICAgPHJlY3QgeD0iMzUzLjA5NTA1IiB5PSIyMDY0LjM5NiIgd2lkdGg9Ijg5LjUiIGhlaWdodD0iMjIiIGZpbGw9IiNmZWFlMDAiLz4KICAgICAgICA8dGV4dCB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNTguMDk1MDUgMjA2Ni4xNzIpIiBmaWxsPSJ3aGl0ZSI+CiAgICAgICAgICA8dHNwYW4gZm9udC1mYW1pbHk9IkhlbHZldGljYSBOZXVlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgeD0iMTQuMTEiIHk9IjE1Ij5MaW5raW5nPC90c3Bhbj4KICAgICAgICA8L3RleHQ+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTgyIj4KICAgICAgICA8cmVjdCB4PSIxNzQuMDk1MDUiIHk9IjE4MTUuNDQ4IiB3aWR0aD0iODIuMTI1OTIiIGhlaWdodD0iMjIiIGZpbGw9IiM2MGQ5MzYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xODEiPgogICAgICAgIDxyZWN0IHg9IjQ1My45OTM2IiB5PSIxODE1LjQ0OCIgd2lkdGg9IjEwMC41NjIzNSIgaGVpZ2h0PSIyMiIgZmlsbD0iIzAwYTJmZiIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE4MCI+CiAgICAgICAgPHJlY3QgeD0iNzUwLjY1MjUiIHk9IjE4MTUuNDQ4IiB3aWR0aD0iNDguNjA1MTM0IiBoZWlnaHQ9IjIyIiBmaWxsPSIjZmVhZTAwIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTc5Ij4KICAgICAgICA8cmVjdCB4PSIxNzQuMDk1MDUiIHk9IjE4NDIuNDQ4IiB3aWR0aD0iNDEuMDYyOTYiIGhlaWdodD0iMjIiIGZpbGw9IiM2MGQ5MzYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNzgiPgogICAgICAgIDxyZWN0IHg9IjQ1My45OTM2IiB5PSIxODQyLjQ0OCIgd2lkdGg9IjY4LjI1NTAyIiBoZWlnaHQ9IjIyIiBmaWxsPSIjMDBhMmZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTc3Ij4KICAgICAgICA8cmVjdCB4PSIyNTYuMjIwOTciIHk9IjE4NjkuNDQ4IiB3aWR0aD0iNDguNjA1MTM0IiBoZWlnaHQ9IjIyIiBmaWxsPSIjNjBkOTM2Ii8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTc2Ij4KICAgICAgICA8cmVjdCB4PSIyNTYuMjIwOTciIHk9IjE4OTYuNDQ4IiB3aWR0aD0iODIuMTI1OTIiIGhlaWdodD0iMjIiIGZpbGw9IiM2MGQ5MzYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNzUiPgogICAgICAgIDxyZWN0IHg9IjMwNC44MjYxIiB5PSIxOTIzLjQ0OCIgd2lkdGg9IjU4LjY2MTM3IiBoZWlnaHQ9IjIyIiBmaWxsPSIjNjBkOTM2Ii8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTc0Ij4KICAgICAgICA8cmVjdCB4PSIzNDAuMDIyOTIiIHk9IjE5NTAuNDQ4IiB3aWR0aD0iODIuMTI1OTIiIGhlaWdodD0iMjIiIGZpbGw9IiM2MGQ5MzYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNzMiPgogICAgICAgIDxyZWN0IHg9IjM2My40ODc0NyIgeT0iMTk3Ny40NDgiIHdpZHRoPSI0MS4wNjI5NiIgaGVpZ2h0PSIyMiIgZmlsbD0iIzYwZDkzNiIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE3MiI+CiAgICAgICAgPHJlY3QgeD0iMzYzLjQ4NzQ3IiB5PSIyMDA0LjQ0OCIgd2lkdGg9IjkwLjUwNjExIiBoZWlnaHQ9IjIyIiBmaWxsPSIjNjBkOTM2Ii8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTcxIj4KICAgICAgICA8cmVjdCB4PSI0NTMuOTkzNiIgeT0iMTg2OS40NDgiIHdpZHRoPSIxOTAuMjMwNDQiIGhlaWdodD0iMjIiIGZpbGw9IiMwMGEyZmYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNzAiPgogICAgICAgIDxyZWN0IHg9IjQ1My45OTM2IiB5PSIxODk2LjQ0OCIgd2lkdGg9IjI5Ni42NTg5MiIgaGVpZ2h0PSIyMiIgZmlsbD0iIzAwYTJmZiIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE2OSI+CiAgICAgICAgPHJlY3QgeD0iNDUzLjk5MzYiIHk9IjE5MjMuMzMzNiIgd2lkdGg9IjE1OC4zODU3IiBoZWlnaHQ9IjIyIiBmaWxsPSIjMDBhMmZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTY4Ij4KICAgICAgICA8cmVjdCB4PSI0NTMuOTkzNiIgeT0iMTk1MC4yMTkyIiB3aWR0aD0iMTUwLjAwNTUiIGhlaWdodD0iMjIiIGZpbGw9IiMwMGEyZmYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNjciPgogICAgICAgIDxyZWN0IHg9IjQ1My45OTM2IiB5PSIxOTc3LjMzMzYiIHdpZHRoPSIyNDkuNzI5ODMiIGhlaWdodD0iMjIiIGZpbGw9IiMwMGEyZmYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNjYiPgogICAgICAgIDxyZWN0IHg9IjQ1My45OTM2IiB5PSIyMDA0LjQ0OCIgd2lkdGg9IjE1MC4wMDU1IiBoZWlnaHQ9IjIyIiBmaWxsPSIjMDBhMmZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkxpbmVfMTY1Ij4KICAgICAgICA8cGF0aCBkPSJNIDQ1My45OTM2IDE4MDEuNDQ4IEwgNDU0LjExOCAxODQxLjIzNzUgTCA0NTMuOTkzNiAxOTEwLjU0MSBMIDQ1NC4xMTggMjAzNS43NSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtZGFzaGFycmF5PSI0LjAsNC4wIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNjQiPgogICAgICAgIDxyZWN0IHg9Ijc1MC42NTI1IiB5PSIxODQyLjQ0OCIgd2lkdGg9IjMyLjI2Mzc1MyIgaGVpZ2h0PSIyMiIgZmlsbD0iI2ZlYWUwMCIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE2MyI+CiAgICAgICAgPHJlY3QgeD0iNzUwLjY1MjUiIHk9IjE4NjkuNDQ4IiB3aWR0aD0iNjguMjU1MDIiIGhlaWdodD0iMjIiIGZpbGw9IiNmZWFlMDAiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNjIiPgogICAgICAgIDxyZWN0IHg9Ijc1MC42NTI1IiB5PSIxODk2LjQ0OCIgd2lkdGg9IjEwMC41NjIzNSIgaGVpZ2h0PSIyMiIgZmlsbD0iI2ZlYWUwMCIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE2MSI+CiAgICAgICAgPHJlY3QgeD0iNzUwLjY1MjUiIHk9IjE5MjIuOTkwNCIgd2lkdGg9IjQ3Ljc2NzExNSIgaGVpZ2h0PSIyMiIgZmlsbD0iI2ZlYWUwMCIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE2MCI+CiAgICAgICAgPHJlY3QgeD0iNzUwLjY1MjUiIHk9IjE5NTAuMjE5MiIgd2lkdGg9IjEwMC41NjIzNSIgaGVpZ2h0PSIyMiIgZmlsbD0iI2ZlYWUwMCIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE1OSI+CiAgICAgICAgPHJlY3QgeD0iNzUwLjY1MjUiIHk9IjE5NzcuNDQ4IiB3aWR0aD0iNTguNjYxMzciIGhlaWdodD0iMjIiIGZpbGw9IiNmZWFlMDAiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNTgiPgogICAgICAgIDxyZWN0IHg9Ijc1MC42NTI1IiB5PSIyMDAzLjk5MDQiIHdpZHRoPSI1OC42NjEzNyIgaGVpZ2h0PSIyMiIgZmlsbD0iI2ZlYWUwMCIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJMaW5lXzE1NyI+CiAgICAgICAgPHBhdGggZD0iTSA3NTAuNjUyNSAxODAxLjQ0OCBMIDc1MC43NzY5IDE4NDEuNDkxNSBMIDc1MC42NTI1IDE5MTEuMjM3MyBMIDc1MC43NzY5IDIwMzYuNzUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLWRhc2hhcnJheT0iNC4wLDQuMCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkxpbmVfMTU2Ij4KICAgICAgICA8cGF0aCBkPSJNIDE3My45NzA2NiAxODAxLjQ0OCBMIDE3NC4wOTUwNSAxODQxLjU3NyBMIDE3My45NzA2NiAxOTExLjQ3MTQgTCAxNzMuMDk1MDUgMjAzOC4yNSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtZGFzaGFycmF5PSI0LjAsNC4wIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iTGluZV8xNTUiPgogICAgICAgIDxwYXRoIGQ9Ik0gODUxLjIxNDkgMTgwMS40NDggTCA4NTEuMzM5MiAxODQxLjA3IEwgODUxLjIxNDkgMTkxMC4wODE3IEwgODUyLjIxNDkgMjAzNiIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtZGFzaGFycmF5PSI0LjAsNC4wIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNTQiPgogICAgICAgIDx0ZXh0IHRyYW5zZm9ybT0idHJhbnNsYXRlKDMwOS41OTYzIDE3ODcpIiBmaWxsPSJibGFjayI+CiAgICAgICAgICA8dHNwYW4gZm9udC1mYW1pbHk9IkhlbHZldGljYSBOZXVlIiBmb250LXNpemU9IjE2IiBmaWxsPSJibGFjayIgeD0iMzE5NzQ0MjNlLTIwIiB5PSIxNSI+MTwvdHNwYW4+CiAgICAgICAgPC90ZXh0PgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJMaW5lXzE1MyI+CiAgICAgICAgPGxpbmUgeDE9IjE3My45OTQ4OCIgeTE9IjE4MDkuMjY0IiB4Mj0iNDQ0LjExNzgiIHkyPSIxODA5LjE5MjUiIG1hcmtlci1lbmQ9InVybCgjRmlsbGVkQXJyb3dfTWFya2VyKSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iTGluZV8xNTIiPgogICAgICAgIDxsaW5lIHgxPSI0NTYuMDg4NjMiIHkxPSIxODA5LjQ0OCIgeDI9Ijc0MC43NzgxIiB5Mj0iMTgwOS42ODkyIiBtYXJrZXItZW5kPSJ1cmwoI0ZpbGxlZEFycm93X01hcmtlcikiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkxpbmVfMTUxIj4KICAgICAgICA8bGluZSB4MT0iNzUwLjY3NjYiIHkxPSIxODA5LjIxNzUiIHgyPSI4NDEuMzM5MSIgeTI9IjE4MDkuMTg5MyIgbWFya2VyLWVuZD0idXJsKCNGaWxsZWRBcnJvd19NYXJrZXIpIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE1MCI+CiAgICAgICAgPHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjA5LjEwMTE1IDE3ODcpIiBmaWxsPSJibGFjayI+CiAgICAgICAgICA8dHNwYW4gZm9udC1mYW1pbHk9IkhlbHZldGljYSBOZXVlIiBmb250LXNpemU9IjE2IiBmaWxsPSJibGFjayIgeD0iMzE5NzQ0MjNlLTIwIiB5PSIxNSI+MjwvdHNwYW4+CiAgICAgICAgPC90ZXh0PgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE0OSI+CiAgICAgICAgPHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzkzLjczODggMTc4NykiIGZpbGw9ImJsYWNrIj4KICAgICAgICAgIDx0c3BhbiBmb250LWZhbWlseT0iSGVsdmV0aWNhIE5ldWUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9ImJsYWNrIiB4PSI2LjY4Mzg3NyIgeT0iMTUiPjM8L3RzcGFuPgogICAgICAgIDwvdGV4dD4KICAgICAgPC9nPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==)

For `pnpm`:

![](data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bD0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHZpZXdCb3g9IjEzNS4wOTUwNSAxNDA3IDU3NC4zNDg3IDMxNC4zOTYiIHdpZHRoPSI1NzQuMzQ4NyIgaGVpZ2h0PSIzMTQuMzk2Ij4KICA8ZGVmcz4KICAgIDxtYXJrZXIgb3JpZW50PSJhdXRvIiBvdmVyZmxvdz0idmlzaWJsZSIgbWFya2VyVW5pdHM9InN0cm9rZVdpZHRoIiBpZD0iRmlsbGVkQXJyb3dfTWFya2VyIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHZpZXdCb3g9Ii0xIC00IDEwIDgiIG1hcmtlcldpZHRoPSIxMCIgbWFya2VySGVpZ2h0PSI4IiBjb2xvcj0iYmxhY2siPgogICAgICA8Zz4KICAgICAgICA8cGF0aCBkPSJNIDggMCBMIDAgLTMgTCAwIDMgWiIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICAgIDwvZz4KICAgIDwvbWFya2VyPgogIDwvZGVmcz4KICA8ZyBpZD0iQ2FudmFzXzEiIHN0cm9rZS1vcGFjaXR5PSIxIiBmaWxsPSJub25lIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIHN0cm9rZT0ibm9uZSI+CiAgICA8dGl0bGU+Q2FudmFzIDE8L3RpdGxlPgogICAgPHJlY3QgZmlsbD0id2hpdGUiIHg9IjEzNS4wOTUwNSIgeT0iMTQwNyIgd2lkdGg9IjU3NC4zNDg3IiBoZWlnaHQ9IjMxNC4zOTYiLz4KICAgIDxnIGlkPSJDYW52YXNfMV9MYXllcl8xIj4KICAgICAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNDgiPgogICAgICAgIDxyZWN0IHg9IjE0MS41OTUwNSIgeT0iMTQ0NS40NDgiIHdpZHRoPSI4Mi4xMjU5MiIgaGVpZ2h0PSIyMiIgZmlsbD0iIzYwZDkzNiIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE0NyI+CiAgICAgICAgPHJlY3QgeD0iMjIzLjcyMDk3IiB5PSIxNDQ1LjQ0OCIgd2lkdGg9IjEwMC41NjIzNSIgaGVpZ2h0PSIyMiIgZmlsbD0iIzAwYTJmZiIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE0NiI+CiAgICAgICAgPHJlY3QgeD0iNTA3LjM5MDYiIHk9IjE0NDUuNDQ4IiB3aWR0aD0iNDguNjA1MTM0IiBoZWlnaHQ9IjIyIiBmaWxsPSIjZmVhZTAwIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTQ1Ij4KICAgICAgICA8cmVjdCB4PSIxNDEuNTk1MDUiIHk9IjE0NzIuNDQ4IiB3aWR0aD0iNDEuMDYyOTYiIGhlaWdodD0iMjIiIGZpbGw9IiM2MGQ5MzYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNDQiPgogICAgICAgIDxyZWN0IHg9IjE4Mi42NTgiIHk9IjE0NzIuNDQ4IiB3aWR0aD0iNjguMjU1MDIiIGhlaWdodD0iMjIiIGZpbGw9IiMwMGEyZmYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNDMiPgogICAgICAgIDxyZWN0IHg9IjIyMy43MjA5NyIgeT0iMTQ5OS40NDgiIHdpZHRoPSI0OC42MDUxMzQiIGhlaWdodD0iMjIiIGZpbGw9IiM2MGQ5MzYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNDIiPgogICAgICAgIDxyZWN0IHg9IjIyMy43MjA5NyIgeT0iMTUyNi40NDgiIHdpZHRoPSI4Mi4xMjU5MiIgaGVpZ2h0PSIyMiIgZmlsbD0iIzYwZDkzNiIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzE0MSI+CiAgICAgICAgPHJlY3QgeD0iMjcyLjMyNjEiIHk9IjE1NTMuNDQ4IiB3aWR0aD0iNTguNjYxMzciIGhlaWdodD0iMjIiIGZpbGw9IiM2MGQ5MzYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xNDAiPgogICAgICAgIDxyZWN0IHg9IjMwNy41MjI5MiIgeT0iMTU4MC40NDgiIHdpZHRoPSI4Mi4xMjU5MiIgaGVpZ2h0PSIyMiIgZmlsbD0iIzYwZDkzNiIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzEzOSI+CiAgICAgICAgPHJlY3QgeD0iMzMwLjk4NzQ3IiB5PSIxNjA3LjQ0OCIgd2lkdGg9IjQxLjA2Mjk2IiBoZWlnaHQ9IjIyIiBmaWxsPSIjNjBkOTM2Ii8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTM4Ij4KICAgICAgICA8cmVjdCB4PSIzMzAuOTg3NDciIHk9IjE2MzQuNDQ4IiB3aWR0aD0iODkuNSIgaGVpZ2h0PSIyMiIgZmlsbD0iIzYwZDkzNiIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzEzNyI+CiAgICAgICAgPHJlY3QgeD0iMjcyLjMyNjEiIHk9IjE0OTkuNDQ4IiB3aWR0aD0iMTkwLjIzMDQ0IiBoZWlnaHQ9IjIyIiBmaWxsPSIjMDBhMmZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTM2Ij4KICAgICAgICA8cmVjdCB4PSIzMDUuODQ2OSIgeT0iMTUyNi40NDgiIHdpZHRoPSIyOTYuNjU4OTIiIGhlaWdodD0iMjIiIGZpbGw9IiMwMGEyZmYiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xMzUiPgogICAgICAgIDxyZWN0IHg9IjMzMC45ODc0NyIgeT0iMTU1My40NDgiIHdpZHRoPSIxNTguMzg1NyIgaGVpZ2h0PSIyMiIgZmlsbD0iIzAwYTJmZiIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzEzNCI+CiAgICAgICAgPHJlY3QgeD0iMzg5LjY0ODg0IiB5PSIxNTgwLjQ0OCIgd2lkdGg9IjE1MC4wMDU1IiBoZWlnaHQ9IjIyIiBmaWxsPSIjMDBhMmZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTMzIj4KICAgICAgICA8cmVjdCB4PSIzNzIuMDUwNDMiIHk9IjE2MDcuNDQ4IiB3aWR0aD0iMjQ5LjcyOTgzIiBoZWlnaHQ9IjIyIiBmaWxsPSIjMDBhMmZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTMyIj4KICAgICAgICA8cmVjdCB4PSI0MjAuNDkzNiIgeT0iMTYzNC40NDgiIHdpZHRoPSIxNTEuMDA1NSIgaGVpZ2h0PSIyMiIgZmlsbD0iIzAwYTJmZiIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzEzMCI+CiAgICAgICAgPHJlY3QgeD0iNTA3LjM5MDYiIHk9IjE0NzIuNDQ4IiB3aWR0aD0iMzIuMjYzNzUzIiBoZWlnaHQ9IjIyIiBmaWxsPSIjZmVhZTAwIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTI5Ij4KICAgICAgICA8cmVjdCB4PSI1MDcuMzkwNiIgeT0iMTQ5OS40NDgiIHdpZHRoPSI2OC4yNTUwMiIgaGVpZ2h0PSIyMiIgZmlsbD0iI2ZlYWUwMCIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzEyOCI+CiAgICAgICAgPHJlY3QgeD0iNjAyLjUwNTgiIHk9IjE1MjYuNDQ4IiB3aWR0aD0iMTAwLjU2MjM1IiBoZWlnaHQ9IjIyIiBmaWxsPSIjZmVhZTAwIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTI3Ij4KICAgICAgICA8cmVjdCB4PSI1MDcuMzkwNiIgeT0iMTU1My40NDgiIHdpZHRoPSI0Ny43NjcxMTUiIGhlaWdodD0iMjIiIGZpbGw9IiNmZWFlMDAiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xMjYiPgogICAgICAgIDxyZWN0IHg9IjUzOS42NTQzNCIgeT0iMTU4MC40NDgiIHdpZHRoPSIxMDAuNTYyMzUiIGhlaWdodD0iMjIiIGZpbGw9IiNmZWFlMDAiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xMjUiPgogICAgICAgIDxyZWN0IHg9IjYyMS43ODAyNiIgeT0iMTYwNy40NDgiIHdpZHRoPSI1OC42NjEzNyIgaGVpZ2h0PSIyMiIgZmlsbD0iI2ZlYWUwMCIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzEyNCI+CiAgICAgICAgPHJlY3QgeD0iNTcxLjQ5OTEiIHk9IjE2MzQuNDQ4IiB3aWR0aD0iNTguNjYxMzciIGhlaWdodD0iMjIiIGZpbGw9IiNmZWFlMDAiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iTGluZV8xMjMiPgogICAgICAgIDxwYXRoIGQ9Ik0gNTA3LjM5MDYgMTQzMS40NDggTCA1MDcuNTE1IDE0NzEuNDkxNSBMIDUwNy4zOTA2IDE1NDEuMjM3MyBMIDUwNi41MTUgMTY2Ni43NSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtZGFzaGFycmF5PSI0LjAsNC4wIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iTGluZV8xMjIiPgogICAgICAgIDxwYXRoIGQ9Ik0gMTQxLjQ3MDY2IDE0MzEuNDQ4IEwgMTQxLjU5NTA1IDE0NzEuOTIxIEwgMTQxLjQ3MDY2IDE1NDIuNDE0NiBMIDE0MC41OTUwNSAxNjY2Ljc1IiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1kYXNoYXJyYXk9IjQuMCw0LjAiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJMaW5lXzEyMSI+CiAgICAgICAgPHBhdGggZD0iTSA3MDIuOTQzOCAxNDMxLjQ0OCBMIDcwMy4wNjgxNSAxNDcxLjA3IEwgNzAyLjk0MzggMTU0MC4wODE3IEwgNzAzLjA2ODE1IDE2NjcuMjUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLWRhc2hhcnJheT0iNC4wLDQuMCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTE2Ij4KICAgICAgICA8dGV4dCB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNzcuMDk2MyAxNDE3KSIgZmlsbD0iYmxhY2siPgogICAgICAgICAgPHRzcGFuIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EgTmV1ZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iYmxhY2siIHg9IjMxOTc0NDIzZS0yMCIgeT0iMTUiPjE8L3RzcGFuPgogICAgICAgIDwvdGV4dD4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iTGluZV8xMTUiPgogICAgICAgIDxsaW5lIHgxPSIxNDEuNDk0NTMiIHkxPSIxNDM5LjIxNDUiIHgyPSI0MTEuNDk0OTgiIHkyPSIxNDM5LjcyNDYiIG1hcmtlci1lbmQ9InVybCgjRmlsbGVkQXJyb3dfTWFya2VyKSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iTGluZV8xMTQiPgogICAgICAgIDxsaW5lIHgxPSI0MjMuNTg4NjMiIHkxPSIxNDM5LjQ0OCIgeDI9IjQ5Ny41MTYyNiIgeTI9IjE0MzkuNjY4MiIgbWFya2VyLWVuZD0idXJsKCNGaWxsZWRBcnJvd19NYXJrZXIpIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJMaW5lXzExMyI+CiAgICAgICAgPGxpbmUgeDE9IjUwNy40MTQ3IiB5MT0iMTQzOS4yMTc2IiB4Mj0iNjkzLjA2ODIiIHkyPSIxNDM5LjIyNjgiIG1hcmtlci1lbmQ9InVybCgjRmlsbGVkQXJyb3dfTWFya2VyKSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xMTIiPgogICAgICAgIDx0ZXh0IHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ2MC4yMDM2IDE0MTcpIiBmaWxsPSJibGFjayI+CiAgICAgICAgICA8dHNwYW4gZm9udC1mYW1pbHk9IkhlbHZldGljYSBOZXVlIiBmb250LXNpemU9IjE2IiBmaWxsPSJibGFjayIgeD0iMzE5NzQ0MjNlLTIwIiB5PSIxNSI+MjwvdHNwYW4+CiAgICAgICAgPC90ZXh0PgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJHcmFwaGljXzExMSI+CiAgICAgICAgPHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTk5LjgyMzk2IDE0MTcpIiBmaWxsPSJibGFjayI+CiAgICAgICAgICA8dHNwYW4gZm9udC1mYW1pbHk9IkhlbHZldGljYSBOZXVlIiBmb250LXNpemU9IjE2IiBmaWxsPSJibGFjayIgeD0iNi42ODM4NzciIHk9IjE1Ij4zPC90c3Bhbj4KICAgICAgICA8L3RleHQ+CiAgICAgIDwvZz4KICAgICAgPGcgaWQ9IkdyYXBoaWNfMTg2Ij4KICAgICAgICA8dGV4dCB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNDYuNTk1MDUgMTY3MC45NDgpIiBmaWxsPSJibGFjayI+CiAgICAgICAgICA8dHNwYW4gZm9udC1mYW1pbHk9IkhlbHZldGljYSBOZXVlIiBmb250LXNpemU9IjE2IiBmaWxsPSJibGFjayIgeD0iODUyNjUxM2UtMTkiIHk9IjE1Ij5QYWNrYWdlIGluc3RhbGxhdGlvbiBwcm9ncmVzczo8L3RzcGFuPgogICAgICAgIDwvdGV4dD4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xODUiPgogICAgICAgIDxyZWN0IHg9IjE0MS41OTUwNSIgeT0iMTY5NC4zOTYiIHdpZHRoPSI4OS41IiBoZWlnaHQ9IjIyIiBmaWxsPSIjNjBkOTM2Ii8+CiAgICAgICAgPHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTQ2LjU5NTA1IDE2OTYuMTcyKSIgZmlsbD0id2hpdGUiPgogICAgICAgICAgPHRzcGFuIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EgTmV1ZSIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHg9IjQuNzkiIHk9IjE1Ij5SZXNvbHZpbmc8L3RzcGFuPgogICAgICAgIDwvdGV4dD4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xODQiPgogICAgICAgIDxyZWN0IHg9IjIzMS4wOTUwNSIgeT0iMTY5NC4zOTYiIHdpZHRoPSI4OS41IiBoZWlnaHQ9IjIyIiBmaWxsPSIjMDBhMmZmIi8+CiAgICAgICAgPHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjM2LjA5NTA1IDE2OTYuMTcyKSIgZmlsbD0id2hpdGUiPgogICAgICAgICAgPHRzcGFuIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EgTmV1ZSIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHg9IjguNzgyIiB5PSIxNSI+RmV0Y2hpbmc8L3RzcGFuPgogICAgICAgIDwvdGV4dD4KICAgICAgPC9nPgogICAgICA8ZyBpZD0iR3JhcGhpY18xODMiPgogICAgICAgIDxyZWN0IHg9IjMyMC41OTUwNSIgeT0iMTY5NC4zOTYiIHdpZHRoPSI4OS41IiBoZWlnaHQ9IjIyIiBmaWxsPSIjZmVhZTAwIi8+CiAgICAgICAgPHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzI1LjU5NTA1IDE2OTYuMTcyKSIgZmlsbD0id2hpdGUiPgogICAgICAgICAgPHRzcGFuIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EgTmV1ZSIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHg9IjE0LjExIiB5PSIxNSI+TGlua2luZzwvdHNwYW4+CiAgICAgICAgPC90ZXh0PgogICAgICA8L2c+CiAgICAgIDxnIGlkPSJMaW5lXzE4OCI+CiAgICAgICAgPHBhdGggZD0iTSA0MjEuMzY5MiAxNDMxLjQ0OCBMIDQyMS40OTM2IDE0NzEuNDkxNSBMIDQyMS4zNjkyIDE1NDEuMjM3MyBMIDQyMC40OTM2IDE2NjYuNzUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLWRhc2hhcnJheT0iNC4wLDQuMCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=)


## What About Disk Space?

You may have seen some memes about `node_modules` size.

![](https://preview.redd.it/fw31b02wfkez.png?auto=webp&s=0c679cd431ea56eed2e49d3f79ef8e522e9f6c45)

![](https://i.imgur.com/4h0Ptg7.png)

![](https://i.imgur.com/UI5aIYW.png)

Disk space is a big problem for `npm`/`yarn` users.

And this is the slogan from `pnpm`:

> Saving disk space and boosting installation speed

So, why `pnpm` saves disk space?

Before this, let's talk about `node_modules` structure in `npm`/`yarn`.


### Dependency (`node_modules`) Structure of `npm`/`yarn`

Before `npm v3`, you can see if you have multiple packages that depend on the same package, it will be installed multiple times.

```bash {4,7,10,13}
node_modules
├── A@1.0.0
│   └── node_modules
│       └── B@1.0.0             <-- B HERE
│       └── C@1.0.0
│            └── node_modules
│                └── B@1.0.0    <-- B HERE
├── C@1.0.0
│   └── node_modules
│       └── B@1.0.0             <-- B HERE
└── D@1.0.0
    └── node_modules
        └── B@1.0.0             <-- B HERE
```

That seems to be quite a waste of disk space, right?

So, **flat** `node_modules` structure is used in 
`npm` (after `v3`) and `yarn`.

Now, let's say we want to import `A`, which requires `B v1.0`.

![](https://i.imgur.com/Ap9S8LQ.png)

Then, we want to import another module `C`. 

`C` requires `B v2.0`, but at another version than `A`, which requires `B v1.0`.

However, since `B v1.0` is already a top-level dep, we cannot install `B v2.0` as a top level dependency. 

`npm v3` handles this by defaulting to `npm v2` behavior and nesting the new, different, module `B` version dependency under the module that requires it -- in this case, module `C`.

![](https://imgur.com/ZP8Adf2.png)

After that, we want to import `D` which requires `B v1.0`.

![](https://imgur.com/0TBMouq.png)

So, what if we manually upgrade `A`?

![](https://imgur.com/zn03cBh.png)

What happened if we make a clean install with same `package.json`?

![](https://imgur.com/LpwtSO6.png)

Same dependencies but not same directory structure, which is ***non-deterministic***.

That's bad, right?


### Dependency (`node_modules`) Structure of `pnpm`

Let's create two directories and run `npm add express` in one of them and `pnpm add express` in the other one. 

Here's the top of what you get in the `npm` directory's `node_modules`:

```bash
.
├── .bin
├── accepts
├── array-flatten
├── body-parser
├── bytes
├── content-disposition
├── content-type
├── cookie
├── cookie-signature
├── debug
├── depd
├── destroy
├── ee-first
├── encodeurl
├── escape-html
├── etag
├── express
├── finalhandler
├── forwarded
├── fresh
├── http-errors
├── iconv-lite
├── inherits
├── ipaddr.js
├── media-typer
├── merge-descriptors
├── methods
├── mime
├── mime-db
├── mime-types
├── ms
├── negotiator
├── on-finished
├── parseurl
├── path-to-regexp
├── proxy-addr
├── qs
├── range-parser
├── raw-body
├── safe-buffer
├── send
├── serve-static
├── setprototypeof
├── statuses
├── type-is
├── unpipe
├── utils-merge
└── vary
```

Since it's flat, users have access to all the dependencies, **including those they are not installed**.

> *It's dangerous to have access to those dependencies that you're not installing.*

That's not good.

Here is what `pnpm` version looks like:

```bash
.
└── .modules.yaml
└── .pnpm
└── express
```

You'll find that `express` is a symlink to 
`node_modules/.pnpm/express@4.17.1/node_modules/express`.

```bash {19,23-24,26-27,36-37}
.
├── .modules.yaml
├── .pnpm
│   ├── accepts@1.3.7
│   ├── array-flatten@1.1.1
│   ├── body-parser@1.19.0
│   ├── bytes@3.1.0
│   ├── content-disposition@0.5.3
│   ├── content-type@1.0.4
│   ├── cookie-signature@1.0.6
│   ├── cookie@0.4.0
│   ├── debug@2.6.9
│   ├── depd@1.1.2
│   ├── destroy@1.0.4
│   ├── ee-first@1.1.1
│   ├── encodeurl@1.0.2
│   ├── escape-html@1.0.3
│   ├── etag@1.8.1
│   ├── express@4.17.1  <-- LOCATED HERE
│   ├── finalhandler@1.1.2
│   ├── forwarded@0.1.2
│   ├── fresh@0.5.2
│   ├── http-errors@1.7.2  <-- NOTE
│   ├── http-errors@1.7.3  <-- NOTE
│   ├── iconv-lite@0.4.24
│   ├── inherits@2.0.3  <-- NOTE
│   ├── inherits@2.0.4  <-- NOTE
│   ├── ipaddr.js@1.9.1
│   ├── lock.yaml
│   ├── media-typer@0.3.0
│   ├── merge-descriptors@1.0.1
│   ├── methods@1.1.2
│   ├── mime-db@1.44.0
│   ├── mime-types@2.1.27
│   ├── mime@1.6.0
│   ├── ms@2.0.0  <-- NOTE
│   ├── ms@2.1.1  <-- NOTE
│   ├── negotiator@0.6.2
│   ├── node_modules
│   ├── on-finished@2.3.0
│   ├── parseurl@1.3.3
│   ├── path-to-regexp@0.1.7
│   ├── proxy-addr@2.0.6
│   ├── qs@6.7.0
│   ├── range-parser@1.2.1
│   ├── raw-body@2.4.0
│   ├── safe-buffer@5.1.2
│   ├── safer-buffer@2.1.2
│   ├── send@0.17.1
│   ├── serve-static@1.14.1
│   ├── setprototypeof@1.1.1
│   ├── statuses@1.5.0
│   ├── toidentifier@1.0.0
│   ├── type-is@1.6.18
│   ├── unpipe@1.0.0
│   ├── utils-merge@1.0.1
│   └── vary@1.1.2
└── express
```

Structure inside `.pnpm` is ***truly*** flat.

```bash {11-17}
.
├── .modules.yaml
├── .pnpm
│   ├── accepts@1.3.7
│   ...
│   ├── express@4.17.1
│   ├   └── node_modules
│   ├       ├── accepts
│   ├       ...
│   ├       ├── etag
│   ├       ├── express <-- SYMLINK TO HERE
│   ├       │   ├── History.md
│   ├       │   ├── LICENSE
│   ├       │   ├── Readme.md
│   ├       │   ├── index.js
│   ├       │   ├── lib
│   ├       │   └── package.json
│   ├       ├── finalhandler
│   ├       ...
│   ├       └── vary
│   ├── finalhandler@1.1.2
│   ...
│   └── vary@1.1.2
└── express
```

You might ask: still, where is the `node_modules`! 

> *The second trick of `pnpm`'s `node_modules` structure is that the dependencies of packages are on the same directory level on which the real location of the dependent package.*

So, we can see that dependencies of express are not in `.pnpm/express@4.17.1/node_modules/express/node_modules/` but in `.pnpm/express@4.17.1/node_modules/`:

```bash {7-38}
.
├── .modules.yaml
├── .pnpm
│   ├── accepts@1.3.7
│   ...
│   ├── express@4.17.1
│   │   └── node_modules
│   │       ├── accepts
│   │       ├── array-flatten
│   │       ├── body-parser
│   │       ├── content-disposition
│   │       ├── content-type
│   │       ├── cookie
│   │       ├── cookie-signature
│   │       ├── debug
│   │       ├── depd
│   │       ├── encodeurl
│   │       ├── escape-html
│   │       ├── etag
│   │       ├── express  <-- What WE'VE SAW
│   │       ├── finalhandler
│   │       ├── fresh
│   │       ├── merge-descriptors
│   │       ├── methods
│   │       ├── on-finished
│   │       ├── parseurl
│   │       ├── path-to-regexp
│   │       ├── proxy-addr
│   │       ├── qs
│   │       ├── range-parser
│   │       ├── safe-buffer
│   │       ├── send
│   │       ├── serve-static
│   │       ├── setprototypeof
│   │       ├── statuses
│   │       ├── type-is
│   │       ├── utils-merge
│   │       └── vary
│   ├── finalhandler@1.1.2
│   ...
│   └── vary@1.1.2
└── express
```


#### Symlinked `node_modules` Structure

Let's say you install `foo@1.0.0` that depends on `bar@1.0.0`. `pnpm` will ***hard link*** both packages to `node_modules` like this:

```bash {5,8}
node_modules
└── .pnpm
    ├── bar@1.0.0
    │   └── node_modules
    │       └── bar -> <store>/bar
    └── foo@1.0.0
        └── node_modules
            └── foo -> <store>/foo
```

Then, `bar` is going to be symlinked to the `foo@1.0.0/node_modules` folder.

```diff-bash
	node_modules
	└── .pnpm
	    ├── bar@1.0.0
	    │   └── node_modules
	    │       └── bar -> <store>/bar
	    └── foo@1.0.0
	        └── node_modules
	            └── foo -> <store>/foo
+	            └── bar -> ../../bar@1.0.0/node_modules/bar
```

Then `foo` is going to be symlinked into the root `node_modules` folder because `foo` is a dependency of the project.

```diff-bash
    node_modules
+   ├── foo -> ./.pnpm/foo@1.0.0/node_modules/foo
    └── .pnpm
        ├── bar@1.0.0
        │   └── node_modules
        │       └── bar -> <store>/bar
        └── foo@1.0.0
            └── node_modules
                └── foo -> <store>/foo
                └── bar -> ../../bar@1.0.0/node_modules/bar
```

Finally, `foo` can be reached by user.

And, ***only*** `foo` can be reached!

## Trade-off of Switching to `pnpm`

`pnpm` supports almost everything you've used in `npm` and `yarn`!

![](https://i.imgur.com/oxDgjEd.png)

```bash
# Manage dependencies
pnpm add <pkg>
pnpm install
pnpm update
pnpm remove
pnpm link
pnpm unlink
pnpm import
pnpm rebuild
pnpm prune
pnpm fetch
pnpm install-test
pnpm patch <pkg>
pnpm patch-commit <path>
# Review dependencies
pnpm audit
pnpm list
pnpm outdated
pnpm why
# Run scripts
pnpm run
pnpm test
pnpm exec
pnpm dlx
pnpm create
pnpm start
# Manage environments
pnpm env <cmd>
# Misc.
pnpm publish
pnpm pack
pnpm -r, --recursive
pnpm server
pnpm store
pnpm root
pnpm bin
pnpm setup
pnpm init
pnpm deploy
```

And yeah, `pnpm` can even use to manage node version!

```bash
pnpm env use --global lts
pnpm env use --global lateset
```

Btw, `node 18.x` is going to be lts version soon!

![](https://i.imgur.com/DHXrOU0.png)


## References

- <https://pnpm.io/>
- <https://pnpm.io/blog/2020/05/27/flat-node-modules-is-not-the-only-way>
- <https://github.com/zkochan/comparing-node-modules>
- <http://man.hubwiz.com/docset/npm.docset/Contents/Resources/Documents/how-npm-works/npm3.html>