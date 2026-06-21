# ViewRig v0.2 Changesets And Provenance Plan

Status: R10 release process design, not active publication automation.

## Current Decision

ViewRig v0.2 keeps the repository in dry-run release mode:

- Packages remain `private: true`.
- `pnpm release:dry-run` validates build output and package contents.
- No npm publish, GitHub release, or tag is created by this phase.

Changesets is deferred as an active dependency until the project is ready to make packages public. The release process is designed here so adoption has a clear path without changing package visibility during v0.2.

## Proposed Changesets Workflow

When publication is approved:

1. Install `@changesets/cli` as a workspace dev dependency.
2. Add `.changeset/config.json` with public package access and changelog policy.
3. Keep package release groups explicit: core, testing, adapter-three.
4. Require `pnpm api:check`, `pnpm docs:api`, `pnpm test`, `pnpm test:browser`, and `pnpm release:dry-run` before versioning.
5. Run Changesets versioning only after package `private` flags and npm access policy are intentionally changed.
6. Publish from CI, not a local workstation.

## Provenance / Trusted Publishing Steps

Before npm publication:

1. Create or select an npm organization/package scope for `@viewrig`.
2. Configure npm trusted publishing for the GitHub Actions release workflow, or enable provenance with `npm publish --provenance`.
3. Protect the release branch and require CI validation.
4. Ensure the workflow uses a pinned Node/pnpm setup and immutable lockfile install.
5. Confirm `pnpm pack --dry-run` output contains only intended artifacts.
6. Publish with package access policy explicitly reviewed.

## Release Gates

A real release should require:

- API report check passes with reviewed intentional changes.
- TypeDoc generation passes.
- Unit and browser smoke tests pass.
- Three adapter integration smoke passes.
- Package dry-run passes.
- Boundary checks pass for core host dependency policy, Sinan adapter scope, and debug renderer scope.
- Release notes are generated from accepted Changesets and reviewed by a maintainer.
