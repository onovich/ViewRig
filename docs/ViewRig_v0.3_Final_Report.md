# ViewRig v0.3 Final Report

Date: 2026-06-22
Status: PASS
Branch: `main`
Final commit: R16 final report commit

## 1. Goal Result

- Total rounds: 16
- Main rounds: R1-R12
- Buffer rounds: R13-R15
- Final validation: R16
- Unfinished v0.3 scope items: none
- Remote branch: `origin/main`

v0.3 moves ViewRig from local release readiness to reproducible CI, auditable release governance, guarded API/docs output, stricter package dry-runs, stronger Three/browser smoke coverage, and a Sinan POC handoff package.

## 2. Key Deliverables

CI:

- Added `.github/workflows/ci.yml`.
- CI covers frozen install, build, typecheck, unit tests, explicit adapter-three smoke, API checks, TypeDoc generation, docs guard, boundary check, package dry-run, Changesets dry-run, Playwright Chromium install/cache, browser smoke, and API docs artifact upload.

Browser smoke:

- Playwright browser policy is documented.
- Playground smoke validates local HTTP, canvas rendering, pose JSON, debug overlay state, visible canvas changes, failed requests, HTTP errors, page errors, and console errors.

API governance:

- Replaced the lightweight API report script with official API Extractor.
- Added package API Extractor configs and official API reports.
- Documented the API Extractor TypeScript version warning as non-blocking release engineering follow-up.

TypeDoc/docs:

- TypeDoc generates `generated-docs/api/workspace`.
- CI uploads `viewrig-api-docs` as an inspection artifact.
- Docs remain ignored by git and are not deployed to Pages by default.

Changesets/release governance:

- Added Changesets dry-run config and script.
- `pnpm release:dry-run` now runs build, package dry-run, and Changesets dry-run.
- No real npm publish, GitHub release, tag, or package visibility change was performed.

Package metadata:

- Added release metadata for root and package manifests.
- Packages remain `private: true`, `UNLICENSED`, and `publishConfig.access: "restricted"`.
- Package dry-run validates metadata, exports, package-level types, package README files, tarball contents, and forbidden output tokens.

Three adapter:

- Real Three integration smoke now covers perspective, orthographic, projection matrix changes, projection updates, and missing optional lens fields.
- `@viewrig/core` remains free of Three imports.

Sinan handoff:

- Added Sinan POC-2 / POC-3 handoff checklist with fixture expectations, validation categories, rollback, source-of-truth boundaries, and stop conditions.
- No public `@viewrig/sinan` package or `packages/sinan` folder was added.

## 3. Validation Result

- `pnpm install --frozen-lockfile`: PASS
- `pnpm api:check`: PASS
- `pnpm docs:api`: PASS
- `pnpm docs:check`: PASS
- `pnpm build`: PASS
- `pnpm typecheck`: PASS
- `pnpm test`: PASS, 56 files / 115 tests
- `pnpm test:browser`: PASS, `playwright-chromium`, `vite`
- `pnpm --filter @viewrig/adapter-three test`: PASS, 2 files / 4 tests
- `pnpm package:dry-run`: PASS for core, testing, adapter-three
- `pnpm release:dry-run`: PASS
- `Validate.cmd`: PASS
- `ReleaseDryRun.cmd`: PASS
- `git diff --check`: PASS
- `git status --short --branch`: clean before writing this report

Known non-blocking warning:

- API Extractor 7.58.9 uses bundled TypeScript 5.9.3 while the project uses TypeScript 6.0.3. API checks complete successfully.

## 4. Architecture Confirmation

- `@viewrig/core` remains engine and host independent.
- `CameraState` remains the runtime output contract.
- `@viewrig/adapter-three` only applies `CameraState` to a structural Three-compatible camera.
- Browser/playground code remains outside core.
- Sinan remains source of truth for CameraShot JSON, CameraShotPlayer, DirectorCameraSystem, timeline, preview, scrub, restore, save, and undo.
- Generated outputs remain ignored: `generated-docs/`, package `dist/`, playground `dist/`, and `node_modules/`.

## 5. Remaining Release-Level Work

These items are intentionally outside v0.3 dry-run scope and require owner approval before a real public release:

- choose and add a real project license
- decide package visibility and npm access policy
- configure npm trusted publishing or provenance
- approve Changesets version workflow
- approve GitHub tag/release process
- decide whether TypeDoc remains an inspection artifact or becomes published documentation
- inspect actual GitHub Actions artifacts on the target release commit

## 6. Conclusion

ViewRig v0.3 can be marked PASS for release engineering and CI hardening. The project is ready for internal release-candidate dry-runs and Sinan handoff, but not for real npm publish or public package visibility changes.
