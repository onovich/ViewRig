# ViewRig v0.4 Consumer Smoke Design

Status: R4 consumer tarball smoke design.

## Goal

The consumer smoke proves that the built package artifacts can be consumed from outside the ViewRig workspace before any real npm publication. It validates tarball installation and ESM imports for:

- `@viewrig/core`
- `@viewrig/testing`
- `@viewrig/adapter-three`

This is intentionally different from the existing package dry-run. The package dry-run checks manifest shape and packed file lists. The consumer smoke checks whether a fresh external project can install and execute the packed packages.

## Non-Goals

- no npm publish
- no Changesets version mutation
- no registry credentials
- no GitHub release or tag
- no public `@viewrig/sinan` package
- no generated temp project committed to the repository

## Temp Project Strategy

`scripts/package-consumer-smoke.mjs` uses the operating system temp directory for all generated files. The planned layout is:

```text
<os-temp>/viewrig-consumer-smoke-*/
  tarballs/
    viewrig-core-*.tgz
    viewrig-testing-*.tgz
    viewrig-adapter-three-*.tgz
  consumer/
    package.json
    smoke.mjs
```

The temp project is removed after a passing run unless the script is called with `--keep-temp` for debugging.

## Smoke Steps

1. Require prebuilt `dist/index.js` output for every package.
2. Run `pnpm pack --pack-destination <temp>/tarballs` for each package.
3. Create a standalone ESM consumer package.
4. Install dependencies from local tarballs using `file:../tarballs/*.tgz`.
5. Add `pnpm-workspace.yaml` overrides so transitive ViewRig package dependencies resolve to the same local tarballs.
6. Install `three` using the version range already declared by `@viewrig/adapter-three`.
7. Execute `smoke.mjs`.
8. Import public entrypoints only.
9. Build a real `PerspectiveCamera` from `three`.
10. Apply a `CameraState` through `applyThreeCameraState`.
11. Assert position, quaternion, lens values, and testing helper output.

## Dry-Run Mode

R4 introduces the script with `--dry-run`. Dry-run mode checks the expected package directories and build outputs, prints the planned package list and temp root prefix, and exits without packing, installing, or writing the temp consumer project.

## Validation

R4 validation commands:

- `pnpm build`
- `pnpm package:dry-run`
- `node scripts/package-consumer-smoke.mjs --dry-run`
- `git diff --check`

Architecture self-check: the consumer smoke remains outside package runtime code. It validates public package entrypoints and adapter application of `CameraState`, without adding engine dependencies to core or adding Sinan runtime ownership.
