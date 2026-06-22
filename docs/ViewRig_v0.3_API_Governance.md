# ViewRig v0.3 API Governance

Status: R5 API Extractor formalized.

## Decision

ViewRig v0.3 adopts `@microsoft/api-extractor` as the authoritative public API report tool.

The previous lightweight TypeScript source scanner has been removed from active scripts. Public API reports are now generated from built declaration entrypoints:

- `packages/core/dist/index.d.ts`
- `packages/testing/dist/index.d.ts`
- `packages/adapter-three/dist/index.d.ts`

## Commands

```powershell
pnpm api:report
pnpm api:check
```

Both commands run `pnpm build` first so declaration files are fresh before API Extractor reads them.

## Reports

Committed reports remain in:

- `api-reports/core.api.md`
- `api-reports/testing.api.md`
- `api-reports/adapter-three.api.md`

Temporary API Extractor report output goes under `generated-docs/api-extractor`, which is ignored by git.

## Current Policy

- Report diffs must be reviewed before committing public export changes.
- Public release tags such as `@alpha`, `@beta`, and `@public` are not required yet.
- `ae-missing-release-tag` is suppressed during v0.3.
- Internal helpers should not be exported from package `src/index.ts` unless intentionally made public.

## Compatibility Note

API Extractor 7.58.9 currently analyzes with bundled TypeScript 5.9.3 while this project uses TypeScript 6.0.3. The check passes, but the version warning is tracked as a release-governance risk. Upgrade API Extractor when a newer version bundles or supports the project TypeScript version.

## Migration Boundary

This round does not change public API shape intentionally. It changes the report generator and report format. Future API changes should update reports with `pnpm api:report` and include a review note in the commit.
