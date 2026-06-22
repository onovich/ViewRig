# ViewRig v0.3 Playground Smoke

Status: R10 browser smoke hardening.

## Scope

`pnpm test:browser` builds `examples/three-orbit-playground`, serves the built `dist` folder over local HTTP, and runs a Playwright smoke against the rendered page.

The smoke validates:

- required source and built files
- Vite bundle replacement or documented lightweight fallback
- real local HTTP response success
- canvas dimensions and nonblank rendered pixels
- orbit controls changing pose JSON
- pose JSON shape and deterministic camera/target values
- debug overlay state text
- visible canvas pixel difference between debug overlay off and on
- browser console errors, page errors, failed requests, and HTTP 4xx/5xx responses

## Commands

```powershell
pnpm exec playwright install chromium
pnpm test:browser
```

The Chromium install command is required on fresh machines or CI runners without an approved browser cache. The smoke prefers Playwright-managed Chromium and falls back to approved system channels only for local resilience.

## CI Policy

CI caches Playwright browsers, installs Playwright-managed Chromium with dependencies, and then runs `pnpm test:browser`.

The smoke does not publish artifacts and does not require public network access after dependencies and browser binaries are installed.
