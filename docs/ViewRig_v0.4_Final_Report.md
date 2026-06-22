# ViewRig v0.4 Final Report

Status: R16 final local validation report.

## Goal Result

v0.4 PASS for the release-candidate decision gate goal.

ViewRig is now in an owner-approvable and auditable pre-release state. This does not mean public release has happened. The following actions were not performed:

- no npm publish
- no Changesets version
- no Changesets publish
- no package visibility change
- no license change
- no GitHub tag
- no GitHub release
- no TypeDoc public deployment
- no public `@viewrig/sinan`
- no `packages/sinan`

## Delivered Scope

Release governance:

- v0.4 release decision register
- license gate
- package visibility and npm access gate
- Changesets version workflow gate
- trusted publishing/provenance gate
- GitHub tag/release gate
- TypeDoc publication gate
- RC evidence bundle

Consumer readiness:

- tarball consumer smoke script
- `package:consumer-smoke` package script
- CI hook for consumer package smoke
- packaged ESM relative specifiers fixed for Node ESM tarball consumers
- R5 changeset recording the packaged ESM/consumer smoke fix

API/docs governance:

- API maturity policy keeps API reports as the v0.4 gate
- release tags remain deferred until public API maturity is approved
- TypeDoc remains artifact-only
- generated docs remain ignored

Sinan boundary:

- Sinan remains a documentation/contract handoff
- public Sinan adapter package remains deferred
- boundary guard continues to fail `packages/sinan` and `@viewrig/sinan`
- v0.3 Sinan handoff links to the v0.4 feedback gate

## Local Validation Matrix

All required R16 local commands passed:

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm --filter @viewrig/adapter-three test`
- `pnpm test:browser`
- `pnpm api:check`
- `pnpm docs:api`
- `pnpm docs:check`
- `pnpm boundary:check`
- `pnpm package:dry-run`
- `pnpm package:consumer-smoke`
- `pnpm release:dry-run`
- `Validate.cmd`
- `ReleaseDryRun.cmd`
- `git diff --check`
- `git status --short --branch`

Additional buffer validations:

- R13 API/docs buffer passed
- R14 package/consumer/release buffer passed
- R15 decision/Sinan/evidence buffer passed

## Known Non-Blocking Warning

API Extractor 7.58.9 reports that it analyzes with bundled TypeScript 5.9.3 while the project uses TypeScript 6.0.3. API checks complete successfully. This remains a release-engineering follow-up, not a v0.4 blocker.

## Pending Owner Decisions

The following remain pending before any real public release:

- license
- package visibility
- npm access model
- trusted publishing/provenance setup
- first Changesets version workflow
- GitHub tag and release approval
- TypeDoc publication target
- public API release tag policy
- any future Sinan public adapter package

## External CI Evidence

The final report commit must be pushed before latest GitHub Actions and `viewrig-api-docs` artifact status can be verified for that exact commit. Record the post-push CI run and artifact status in the final handoff response.

## Architecture Self-Check

Core remains engine and host independent. `CameraState` remains the central runtime contract. Three.js stays in the adapter/playground/test boundary. Release governance, package smoke, docs, and evidence scripts do not move host dependencies into core and do not change Sinan ownership.
