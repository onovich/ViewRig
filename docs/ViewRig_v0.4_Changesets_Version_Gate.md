# ViewRig v0.4 Changesets Version Gate

Status: R7 Changesets version workflow gate.

## Decision

Changesets status and dry-run commands are APPROVED for v0.4 RC validation.

Mutating version and publication commands remain PENDING owner approval:

- do not run `changeset version`
- do not run `changeset publish`
- do not run `pnpm changeset version`
- do not run `pnpm changeset publish`
- do not remove `private: true`
- do not publish any package to npm

## Current Commands

Read-only status:

```powershell
pnpm changeset:status
```

Dry-run governance check:

```powershell
pnpm changeset:dry-run
```

Release dry-run:

```powershell
pnpm release:dry-run
```

## Current Pending Changeset

R5 added `.changeset/r5-consumer-smoke-esm.md` to record the packaged ESM and consumer smoke fix as a future patch-level package change.

Because all packages remain private, Changesets can report planned patch bumps while still reporting that a release would publish no packages. That is the expected v0.4 RC posture.

## Owner Approval Required

Before a real version workflow is run, the owner must approve:

- first public or restricted version numbers
- package visibility and npm access
- license
- whether the R5 changeset should be included in the first versioned release
- whether private package state should change before versioning
- whether Changesets should create release PRs or be run manually

## Validation

R7 validation commands:

- `pnpm changeset:dry-run`
- `pnpm release:dry-run`
- `git diff --check`

Architecture self-check: this gate only governs release workflow. It does not change runtime APIs, package exports, core engine independence, adapter behavior, or Sinan ownership.
