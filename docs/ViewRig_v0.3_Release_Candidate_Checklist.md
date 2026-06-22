# ViewRig v0.3 Release Candidate Checklist

Status: R12 release candidate audit.

Audited after commit `e6f2d4b` (`v0.3: add sinan poc handoff checklist`).

This checklist is a dry-run release readiness record. It does not create a tag, GitHub release, npm package, or public package version.

## Local Validation

R12 validation passed:

- `pnpm release:dry-run`
- `pnpm api:check`
- `pnpm docs:api`

Previously hardened v0.3 checks also passed during their rounds:

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm --filter @viewrig/adapter-three test`
- `pnpm test:browser`
- `pnpm docs:check`
- `pnpm boundary:check`
- `Validate.cmd`
- `git diff --check`

## CI Readiness

The GitHub Actions workflow covers:

- dependency installation with `pnpm install --frozen-lockfile`
- build
- typecheck
- unit tests
- explicit Three adapter integration smoke
- API Extractor check
- TypeDoc generation
- docs guard
- boundary check
- package dry-run
- Changesets dry-run
- Playwright Chromium cache and install
- browser smoke
- API docs artifact upload as `viewrig-api-docs`

CI does not publish, tag, or create GitHub releases.

## Package Readiness

Package dry-run covers:

- `@viewrig/core`
- `@viewrig/testing`
- `@viewrig/adapter-three`

Current package posture:

- packages remain `private: true`
- packages use `license: "UNLICENSED"`
- package metadata includes repository, bugs, homepage, description, package-level `types`, ESM exports, and package README files
- `publishConfig.access` remains `restricted`
- tarball dry-run rejects source, tests, `node_modules`, and TypeScript build info

Public package publishing is intentionally blocked until the project owner selects a public license and publishing policy.

## API And Docs Readiness

API governance covers:

- official API Extractor report generation and checks
- API reports for core, testing, and adapter-three
- TypeDoc HTML generation into `generated-docs/api/workspace`
- CI artifact upload for docs inspection

Known non-blocking warning:

- API Extractor 7.58.9 uses bundled TypeScript 5.9.3 while the project uses TypeScript 6.0.3. The check exits successfully, but this remains a release engineering follow-up.

## Smoke Readiness

Three adapter smoke covers:

- real `PerspectiveCamera`
- real `OrthographicCamera`
- projection updates
- projection matrix changes
- missing optional lens fields preserving existing clip planes

Playground browser smoke covers:

- built local HTTP app
- canvas dimensions and nonblank pixels
- orbit control interaction
- pose JSON shape and deterministic values
- debug overlay state and visible canvas difference
- console errors, page errors, failed requests, and HTTP 4xx/5xx responses

## Sinan Handoff Readiness

The Sinan handoff package covers:

- POC-2 Follow / Orbit fixture expectations
- POC-3 CameraShot fixture expectations
- validation commands and Sinan-side validation categories
- failure rollback
- source-of-truth boundaries
- stop conditions

ViewRig still does not add `@viewrig/sinan`, `packages/sinan`, Sinan schema ownership, CameraShotPlayer ownership, or DirectorCameraSystem ownership.

## Release Blockers Before Public Publishing

These are not v0.3 dry-run blockers, but they block a real public release:

- choose and add a real project license
- decide whether scoped packages stay private/restricted or become public
- configure npm trusted publishing or provenance
- approve real versioning and Changesets version workflow
- approve creating tags and GitHub releases
- run actual CI on the target release commit and inspect artifacts
- decide whether TypeDoc should remain an inspection artifact or become published documentation

## RC Conclusion

v0.3 is release-candidate ready for dry-run validation and internal handoff. It is not approved for real npm publish, real GitHub release, or public package visibility changes.
