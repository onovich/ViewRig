# ViewRig v0.4 GitHub Release Gate

Status: R9 GitHub tag and release gate.

## Decision

GitHub tag and GitHub release creation are PENDING owner approval.

v0.4 RC work does not create:

- git tags
- GitHub releases
- release branches
- GitHub release assets
- npm publications

## Current Safe Default

The repository may keep pushing normal validation commits to `main`. A GitHub release must not be created until the owner approves:

- release version/tag name
- release title
- release notes
- whether the release is a draft or public release
- whether npm packages are published before or after the GitHub release
- whether generated TypeDoc HTML is linked from the release
- whether tarball smoke evidence is attached or linked

## Tag Policy

Until approved, no tag is created for v0.4.

Recommended future tag pattern:

```text
v0.4.0-rc.0
```

This is only a proposed pattern. It is not approved by this document.

## Release Notes Template

Draft release notes live in:

- `docs/ViewRig_v0.4_Release_Notes_Template.md`

The template is a preparation artifact only. Filling it out does not create a release.

## Validation

R9 validation commands:

- `pnpm docs:check`
- `git diff --check`

Architecture self-check: this gate only governs repository release ceremony. It does not change runtime source, package exports, package visibility, npm publishing, adapter behavior, or Sinan ownership.
