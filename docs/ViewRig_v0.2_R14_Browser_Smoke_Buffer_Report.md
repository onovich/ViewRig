# ViewRig v0.2 R14 Browser Smoke Buffer Report

Status: R14 browser smoke buffer audit passed.

## Scope

R14 checked:

- Playwright browser launch on this Windows host.
- Default Vite playground build.
- Browser smoke against built Vite output.
- Explicit lightweight fallback build and smoke.

## Result

No browser smoke issue remains open for v0.2.

## Evidence

Default command:

```powershell
pnpm test:browser
```

Result:

```txt
three-orbit-playground vite build passed
three-orbit-playground browser smoke passed (system-msedge, vite)
```

Fallback command:

```powershell
$env:VIEWRIG_PLAYGROUND_LIGHTWEIGHT_BUILD='1'
pnpm --dir examples/three-orbit-playground build
pnpm --dir examples/three-orbit-playground smoke
Remove-Item Env:\VIEWRIG_PLAYGROUND_LIGHTWEIGHT_BUILD
```

Result:

```txt
three-orbit-playground lightweight build passed (env-fallback)
three-orbit-playground browser smoke passed (system-msedge, lightweight)
```

Final default smoke was run again after fallback and passed with Vite output.

## Notes

The local Playwright-managed Chromium cache is not required on this host because the smoke can launch the installed Edge channel through Playwright. Fresh CI should still prefer installing Playwright Chromium with:

```powershell
pnpm exec playwright install chromium
```
