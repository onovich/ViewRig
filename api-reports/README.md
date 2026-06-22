# ViewRig API Reports

These reports are the v0.3 API Extractor public API guard.

Run:

```powershell
pnpm api:report
pnpm api:check
```

Policy:

- Every exported declaration listed in a package report is treated as public draft API.
- API Extractor is the authoritative report generator.
- No `@beta` or `@internal` release tags are required yet.
- Internal helpers should stay out of package `src/index.ts` unless the project intentionally makes them public.
- Report diffs must be reviewed before committing public export changes.

Covered packages:

- `@viewrig/core`
- `@viewrig/testing`
- `@viewrig/adapter-three`
