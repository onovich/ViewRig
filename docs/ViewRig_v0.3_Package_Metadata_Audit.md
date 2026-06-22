# ViewRig v0.3 Package Metadata Audit

Status: R8 package metadata, files, and exports audit.

## Scope

This audit covers the release-candidate workspace packages:

- `@viewrig/core`
- `@viewrig/testing`
- `@viewrig/adapter-three`

The audit is a dry-run only. It does not publish packages, create tags, or create GitHub releases.

## Current Decision

The packages remain private and use `license: "UNLICENSED"` until the project owner selects a public license.

No root `LICENSE` file is created in R8 because choosing a public license is a project-owner decision. Public npm publishing is blocked until that decision is made and the package manifests are updated consistently.

## Manifest Policy

Each release-candidate package must keep:

- `private: true`
- `type: "module"`
- `sideEffects: false`
- `types: "./dist/index.d.ts"`
- `exports["."].types: "./dist/index.d.ts"`
- `exports["."].import: "./dist/index.js"`
- `license: "UNLICENSED"`
- `publishConfig.access: "restricted"`
- repository, bugs, homepage, and package description metadata

Each package includes a package-local `README.md` in `files` so `pnpm pack --dry-run` verifies that package consumers would receive minimal package context if publishing is approved later.

## Dry-Run Guard

`pnpm package:dry-run` now validates:

- root workspace metadata
- package release metadata
- package-level README presence
- ESM exports and package-level types
- restricted private publishing posture
- expected tarball contents from `pnpm pack --dry-run`
- absence of source, tests, `node_modules`, and TypeScript build info in package output

CI runs `pnpm package:dry-run` after build, typecheck, tests, API docs, docs check, and boundary checks.

## Public Release Blockers

Before a real public npm release:

- choose and add a real project license
- replace `UNLICENSED` consistently if public publishing is approved
- decide whether package names remain scoped/private, restricted scoped packages, or public packages
- run package dry-run and release dry-run after any manifest change
