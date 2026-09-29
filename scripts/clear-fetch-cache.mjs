// Static export bakes Vendure data into HTML at build time, so every build
// must read the live catalog. Next.js persists build-time fetch responses in
// .next/cache/fetch-cache (revalidate: 1 year for static pages) and reuses
// them on the next build — which froze an empty catalog into the site.
// Drop that cache before each build; the rest of .next/cache is kept.
// Invoked from the `build` script itself, not a `prebuild` hook: .npmrc sets
// ignore-scripts=true, which npm also applies to the project's own pre/post
// scripts, so a prebuild hook silently never ran (2026-09-29).
import {rmSync} from 'node:fs';

rmSync(new URL('../.next/cache/fetch-cache', import.meta.url), {recursive: true, force: true});
