# ViewRig v0.2 Package Dry-Run

Status: R9 release readiness dry-run.

## Scope

This phase checks package metadata and tarball contents without publishing.

Packages covered:

- `@viewrig/core`
- `@viewrig/testing`
- `@viewrig/adapter-three`

## Commands

```powershell
pnpm build
pnpm package:dry-run
pnpm release:dry-run
```

`pnpm release:dry-run` runs `pnpm build` and then `pnpm package:dry-run`.

## Guardrails

- Packages remain `private: true`.
- `pnpm package:dry-run` rejects `dist/tsconfig.tsbuildinfo`, `src/`, tests, and `node_modules/` in dry-run output.
- Package `files` arrays explicitly include only built JS, declaration files, and sourcemaps under `dist`.
- The workflow does not run `npm publish`, create tags, or create GitHub releases.

## Follow-Up Release Work

Before a real npm release, the project still needs final versioning policy, Changesets adoption, npm provenance or trusted publishing configuration, and a signed release process.
