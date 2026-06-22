# ViewRig v0.4 Release Notes Template

Status: R9 draft template only. No GitHub release has been created.

## Release

Tag: `TBD`

Title: `ViewRig v0.4.0-rc.0`

Publication status: draft until owner approval.

## Summary

ViewRig v0.4 moves the project from internal release readiness toward owner-approvable release candidate governance. It adds explicit release decision gates, tarball consumer smoke validation, package publication safeguards, and reusable evidence documentation.

## Highlights

- Release decision register for license, visibility, npm access, provenance, Changesets, GitHub release, TypeDoc publication, and Sinan adapter boundaries.
- Package tarball consumer smoke for `@viewrig/core`, `@viewrig/testing`, and `@viewrig/adapter-three`.
- CI hook for consumer package smoke.
- Packaged ESM import specifiers fixed for Node ESM consumers.
- API maturity policy keeps API reports as the current gate and defers release tags until public API maturity is approved.
- Changesets status and dry-run workflow documented without running version or publish commands.
- Trusted publishing/provenance gate documented without adding secrets or publish jobs.

## Validation Evidence

Attach or link final v0.4 evidence before release:

- final validation report
- CI run URL
- `viewrig-api-docs` artifact URL
- package dry-run output
- package consumer smoke output
- release dry-run output
- boundary check output

## Not Included

- no npm publish
- no package visibility change
- no license change
- no generated TypeDoc HTML committed to git
- no public `@viewrig/sinan` package
- no `packages/sinan`

## Owner Checklist

- approve license
- approve package visibility and npm access
- approve Changesets version workflow
- approve trusted publishing/provenance setup
- approve GitHub tag and release title
- approve release notes
- approve TypeDoc publication target, if any
