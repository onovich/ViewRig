# ViewRig v0.3 TypeDoc Artifact Policy

Status: R6 TypeDoc output and artifact policy.

## Decision

TypeDoc is the v0.3 public API documentation generator. It is used for local inspection and CI artifacts, but not for automatic Pages deployment.

## Entry Points

TypeDoc reads public package entrypoints:

- `packages/core/src/index.ts`
- `packages/testing/src/index.ts`
- `packages/adapter-three/src/index.ts`

Configuration:

- `typedoc.json`
- `tsconfig.typedoc.json`

## Output

Local and CI output path:

```txt
generated-docs/api/workspace
```

`generated-docs/` remains ignored by git. Generated HTML must not be committed.

## CI Artifact

The CI workflow uploads the generated TypeDoc HTML as:

```txt
viewrig-api-docs
```

Artifact source path:

```txt
generated-docs/api/workspace
```

This artifact is for review and debugging only. It is not a GitHub Pages deployment, npm release artifact, or signed release deliverable.

## Local Commands

```powershell
pnpm docs:api
pnpm docs:check
```

## Future Pages Gate

Before enabling Pages deployment, the project should decide:

- target branch or Pages environment
- retention and permissions policy
- whether docs publish on every `main` push or only release candidates
- how docs versioning maps to package versions
- whether API Extractor reports and TypeDoc HTML should be published together

Until that decision is made, CI artifact upload is the only automated docs output.
