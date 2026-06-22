# ViewRig v0.4 Consumer Smoke

Status: R5 package consumer smoke implementation and CI hook.

## Decision

`package:consumer-smoke` is the v0.4 gate for proving that packed ViewRig artifacts can be consumed from a temporary project outside the monorepo.

The smoke remains local and non-publishing:

- packages are built from the workspace
- packages are packed into local `.tgz` files
- a generated temp project installs those tarballs through `file:` dependencies
- ViewRig transitive dependencies are pinned back to those tarballs through `pnpm-workspace.yaml` overrides
- `three` is installed as the consumer-side engine dependency
- no npm publish, token, registry write, tag, or GitHub release is involved

## Coverage

The smoke imports public package entrypoints:

- `@viewrig/core`
- `@viewrig/testing`
- `@viewrig/adapter-three`

It then creates a real `PerspectiveCamera` from `three`, evaluates a fixed ViewRig pose, applies it through `applyThreeCameraState`, and asserts the resulting camera position, quaternion, field of view, and clip planes.

## Why Overrides Are Required

The packed packages can carry normal package-version dependencies for internal ViewRig packages. In an unpublished RC state, resolving `@viewrig/core@0.0.0` from the public registry is expected to fail. The generated consumer workspace uses `pnpm-workspace.yaml` overrides so every ViewRig package dependency resolves to the local tarball produced by the current build.

This keeps the smoke faithful to external consumption while avoiding any dependency on unpublished registry state.

## Commands

```powershell
pnpm build
pnpm package:consumer-smoke
```

Debugging option:

```powershell
node scripts/package-consumer-smoke.mjs --keep-temp
```

## CI Hook

The CI workflow runs `pnpm package:consumer-smoke` after `pnpm package:dry-run` and before `pnpm changeset:dry-run`. This keeps packed artifact consumption close to the release dry-run checks while still separate from real publication.

## Validation

R5 validation commands:

- `pnpm package:consumer-smoke`
- `pnpm package:dry-run`
- `pnpm release:dry-run`
- `pnpm docs:check`

Architecture self-check: the smoke validates tarball consumption and adapter application only. Core remains independent from Three.js, DOM, React, browser hosts, and Sinan runtime ownership.
