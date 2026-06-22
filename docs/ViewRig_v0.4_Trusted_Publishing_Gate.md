# ViewRig v0.4 Trusted Publishing Gate

Status: R8 trusted publishing and provenance gate.

## Decision

Trusted publishing and npm provenance are PENDING owner approval.

v0.4 does not add or configure:

- npm tokens
- repository secrets
- GitHub Actions publish jobs
- OIDC trusted publishing environments
- `npm publish --provenance`
- Changesets publish automation
- package visibility changes

## Current Safe Posture

The repository may run local and CI validation:

- build
- typecheck
- tests
- API checks
- TypeDoc artifact generation
- package dry-run
- tarball consumer smoke
- Changesets dry-run/status

The repository must not run real publication commands until the owner approves the release identity and access model.

## Owner Approval Required

Before trusted publishing is configured, the owner must decide:

- npm organization/scope ownership for `@viewrig`
- whether packages are public or restricted
- package license
- whether GitHub Actions or manual local publishing is the source of truth
- whether provenance is required for every published package
- GitHub environment name and protection rules
- who can approve a release job
- whether Changesets should publish directly or only create release PRs

## Future Implementation Checklist

If approved later, implementation should be done in a separate release-governance round:

- create a dedicated GitHub Actions release workflow
- use GitHub OIDC trusted publishing instead of long-lived npm tokens where possible
- require an environment approval before publish
- keep `contents: read` for validation jobs and grant publish permissions only to the release job
- run `pnpm install --frozen-lockfile`, full validation, package dry-run, and consumer smoke before publish
- publish only after package visibility, license, and Changesets version gates are approved

## Validation

R8 validation commands:

- `pnpm release:dry-run`
- `pnpm docs:check`
- `git diff --check`

Architecture self-check: this gate only records publication identity and provenance policy. It does not change runtime code, package exports, `CameraState`, adapter behavior, or Sinan ownership.
