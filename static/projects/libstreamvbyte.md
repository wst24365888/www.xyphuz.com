---
title: libstreamvbyte
description: A C++ implementation of StreamVByte, with Python bindings.
dateString: 2022
index: -5
link: https://github.com/wst24365888/libstreamvbyte
---

`libstreamvbyte` is a `C++` implementation of StreamVByte, with `Python` bindings using `pybind11`.

StreamVByte is an integer compression technique that use `SIMD` instructions (vectorization) to improve performance. The library is optimized with `SSSE3` intrinsics, which are supported by most `x86_64` processors. It uses `sse2neon` to translate `SSSE3` intrinsics to `NEON` intrinsics for `ARM` processors. The library can also be used with other 32-bit architectures, although it will fall back to scalar implementations in those cases.

With `libstreamvbyte`, you can quickly and efficiently compress integer sequences, reducing the amount of storage space and network bandwidth required. The library is easy to use and integrates seamlessly with `Python` via `pybind11` bindings. Whether you're working with large datasets or building a distributed computing system, `libstreamvbyte` can help you improve performance and reduce the resources needed to handle your data.

Currently supports `Python 3.8+` on Windows, Linux (`manylinux_2_17`, `musllinux_1_1`) and macOS (`universal2`).

## Tech Stack

- C++
- Python
- pybind11
- Intel Intrinsics (SSSE3)
- ARM Intrinsics (NEON)
- CMake
- GitHub Actions
- sse2neon

## Features

- Compress integer sequences.
- Decompress integer sequences.
