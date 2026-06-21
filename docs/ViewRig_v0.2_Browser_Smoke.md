# ViewRig v0.2 Browser Smoke

Status: R5 Playwright browser smoke.

## Scope

- `pnpm test:browser` builds `examples/three-orbit-playground`.
- The example smoke starts a local HTTP server for the built `dist` output.
- Playwright Chromium opens the page, verifies the canvas renders, changes orbit controls, checks pose JSON, toggles the debug overlay, and fails on browser console errors.
- The smoke prefers the Playwright-managed Chromium cache. If that cache is missing, it tries installed system browser channels through Playwright in this order: `msedge`, then `chrome`.

## Commands

```powershell
pnpm exec playwright install chromium
pnpm test:browser
```

The first command is only required when the local Playwright browser cache is missing. CI or a fresh workstation should run it before `pnpm test:browser` if Chromium has not already been installed and no approved system channel is available.

## Fallback

If browser installation is blocked by network or host policy, keep `pnpm test:browser` as the canonical verification command and record the failure output in the release notes. The smoke script can still run against Playwright system channels when Edge or Chrome is installed, and prints the reproducible Chromium install command when no browser path is available.
