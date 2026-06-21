# ViewRig v0.2 Playground Bundler Smoke

Status: R7 playground bundler smoke.

## Scope

- `examples/three-orbit-playground` builds with Vite by default.
- The build writes `dist/viewrig-build.json` so smoke can tell whether it is testing `vite` or `lightweight` output.
- Browser smoke verifies that Vite output replaced the source module entry and emitted a bundled JavaScript asset before opening the page.
- The lightweight copy build remains available as an explicit fallback.

## Commands

```powershell
pnpm test:browser
```

Fallback path:

```powershell
$env:VIEWRIG_PLAYGROUND_LIGHTWEIGHT_BUILD='1'
pnpm --dir examples/three-orbit-playground build
pnpm --dir examples/three-orbit-playground smoke
Remove-Item Env:\VIEWRIG_PLAYGROUND_LIGHTWEIGHT_BUILD
```

The fallback is for local diagnosis or constrained hosts. Release validation should prefer the default Vite build path.
