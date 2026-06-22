# ViewRig v0.4 TypeDoc Publication Gate

Status: R10 TypeDoc publication gate.

## Decision

TypeDoc HTML remains an artifact-only output for v0.4 RC.

The project may run:

```powershell
pnpm docs:api
```

The generated HTML remains under:

```text
generated-docs/api/workspace
```

That directory stays ignored by git and must not be committed.

## Publication Status

Public TypeDoc hosting is DEFERRED.

v0.4 does not add:

- GitHub Pages deployment
- docs site workflow
- TypeDoc release asset upload outside the existing CI artifact
- custom docs domain
- committed generated HTML

## Current Artifact Policy

CI may upload `generated-docs/api/workspace` as the `viewrig-api-docs` artifact. The artifact is for review and release evidence, not a public documentation site.

Before publication, the owner must approve:

- whether TypeDoc should be public
- hosting target
- URL or domain
- release cadence
- whether docs are versioned per tag
- whether API Extractor reports and TypeDoc HTML are published together
- whether private/testing package APIs appear in public docs

## Future Pages Gate

If GitHub Pages is approved later, it should be implemented in a separate gated release task:

- keep validation CI separate from docs deployment
- require owner approval before publishing docs
- never publish from unvalidated commits
- publish generated output from CI artifacts, not committed `generated-docs`
- make generated docs clearly match the package version or tag

## Validation

R10 validation commands:

- `pnpm docs:api`
- `pnpm docs:check`
- `git diff --check`

Architecture self-check: this gate only governs documentation publication. It does not change runtime code, package exports, `CameraState`, adapters, npm publication, or Sinan ownership.
