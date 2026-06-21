# ViewRig v0.2 Release Notes Draft

Status: R10 release notes draft, not a published release.

## Highlights

- Added public API report checks for `@viewrig/core`, `@viewrig/testing`, and `@viewrig/adapter-three`.
- Added TypeDoc generation for the workspace public entrypoints.
- Added Playwright browser smoke for `examples/three-orbit-playground`.
- Added Vite bundler smoke for the playground with a documented lightweight fallback.
- Added real Three integration smoke for `@viewrig/adapter-three`.
- Documented the v0.2 debug renderer boundary and deferred public `@viewrig/debug-three`.
- Added package dry-run validation for tarball contents without publishing.

## Package Status

The following packages are validated by API reports and package dry-run checks:

- `@viewrig/core`
- `@viewrig/testing`
- `@viewrig/adapter-three`

All packages remain `private: true` for v0.2. This draft does not authorize npm publication.

## Verification Commands

```powershell
pnpm install --frozen-lockfile
pnpm api:check
pnpm docs:api
pnpm typecheck
pnpm test
pnpm test:browser
pnpm release:dry-run
```

Project wrapper validation:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd
```

## Deferred Release Work

- Real npm package publication.
- Changesets-based versioning and changelog generation.
- npm provenance or trusted publishing.
- GitHub release tags and release artifacts.
- Public support policy for `@viewrig/debug-three`.
- Public Sinan adapter package.
