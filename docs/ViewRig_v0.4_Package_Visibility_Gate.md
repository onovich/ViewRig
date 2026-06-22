# ViewRig v0.4 Package Visibility Gate

Status: R3 package visibility and npm access gate.

## Decision

Package visibility and npm access are PENDING owner approval.

For v0.4 RC work, the safe default remains:

- root workspace stays `"private": true`
- `@viewrig/core` stays `"private": true`
- `@viewrig/testing` stays `"private": true`
- `@viewrig/adapter-three` stays `"private": true`
- each workspace package keeps `"publishConfig": { "access": "restricted" }`
- no `npm publish`, `changeset publish`, or equivalent publication command is run

## Release Boundary

The package dry-run can inspect package contents and metadata, but it must not imply that packages are public-release approved. A real package visibility change requires the owner to approve all of the following:

- whether the package scope should be public or restricted
- which packages are publishable in the first release
- whether testing utilities should be public, internal, or separately versioned
- npm organization/access policy for `@viewrig`
- how trusted publishing/provenance will be configured

## Current Enforcement

`scripts/package-dry-run.mjs` currently verifies:

- root workspace is private
- every package is private
- every package is ESM-first and side-effect free
- every package exposes `dist/index.js` and `dist/index.d.ts`
- every package keeps `publishConfig.access` set to `restricted`
- expected package files are present in `pnpm pack --dry-run`
- source, test, node_modules, and tsbuildinfo paths are absent from packed output

The guard now describes package privacy as an active release-approval gate rather than a v0.3-only rule.

## Validation

R3 validation commands:

- `pnpm package:dry-run`
- `pnpm release:dry-run`
- `pnpm api:check`

Architecture self-check: this gate only protects package metadata and npm access. It does not change runtime APIs, `CameraState`, adapter behavior, or Sinan package boundaries.
