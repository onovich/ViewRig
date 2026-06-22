# ViewRig v0.4 API Maturity Policy

Status: R6 API maturity and release-tag policy.

## Decision

ViewRig v0.4 keeps API Extractor release-tag warnings suppressed for the RC gate.

Current policy:

- committed API reports remain the authoritative public surface review artifact
- `@alpha`, `@beta`, `@public`, and `@internal` tags are not required for v0.4 RC
- `ae-missing-release-tag` remains suppressed in package API Extractor configs
- no large public API rename or tag-only churn is introduced in v0.4
- public API maturity labels are deferred until the owner approves a public package release track

## Rationale

The project is still blocked on license, package visibility, npm access, and release publication decisions. Requiring release tags now would create broad annotation churn before the actual public stability level is approved.

The stronger v0.4 gate is therefore:

- API Extractor must pass
- API reports must be committed when public exports change
- tarball consumer smoke must prove exported runtime entrypoints work from a fresh external project
- API docs may be generated as artifacts, but publication remains separately gated

## Current API Tooling

The active API report command is:

```powershell
pnpm api:check
```

The active docs generation command is:

```powershell
pnpm docs:api
```

Committed API reports:

- `api-reports/core.api.md`
- `api-reports/testing.api.md`
- `api-reports/adapter-three.api.md`

Generated TypeDoc HTML remains under `generated-docs/api/workspace` and is ignored by git.

## Future Public Release Gate

Before real public publication, the owner should decide:

- whether package APIs are `@alpha`, `@beta`, or `@public`
- whether internal exported testing utilities stay public
- whether adapter package APIs should be versioned separately from core
- whether API Extractor missing-release-tag warnings should become warnings or errors

## Validation

R6 validation commands:

- `pnpm api:check`
- `pnpm docs:api`
- `pnpm docs:check`
- `pnpm test`

Architecture self-check: this policy changes API governance only. Core remains engine independent; adapter-three remains a thin `CameraState` application layer; Sinan remains a docs/contract handoff.
