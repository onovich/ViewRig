# ViewRig v0.3 CI Workflow

Status: R3 CI API/docs/boundary coverage.

## Scope

The initial CI workflow is `.github/workflows/ci.yml`.

R1 established the minimum reproducible CI base:

- checkout
- pnpm setup
- Node 24 setup
- pnpm cache through `actions/setup-node`
- immutable dependency installation with `pnpm install --frozen-lockfile`

R2 extends the same CI job with:

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`

R3 extends the same CI job with:

- `pnpm api:check`
- `pnpm docs:api`
- `pnpm docs:check`
- `pnpm boundary:check`
- API docs artifact upload from `generated-docs/api/workspace`

Later v0.3 rounds extend this workflow with browser smoke, package dry-run, and release governance checks.

## Local Equivalent

```powershell
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
pnpm test
pnpm api:check
pnpm docs:api
pnpm docs:check
pnpm boundary:check
```

## Policy

- CI does not publish packages.
- CI does not create GitHub releases.
- CI does not create tags.
- Packages remain `private: true`.
- Generated docs, package `dist`, playground `dist`, and browser outputs remain ignored unless a later round explicitly defines an artifact upload policy.
- `generated-docs/` remains ignored by git.
- CI may upload `generated-docs/api/workspace` as the `viewrig-api-docs` artifact for inspection.
- The artifact is not a Pages deployment and is not a release artifact.

## Workflow Review

R1 performs a human YAML review plus local install verification. Automated CI syntax or actionlint validation can be added later if the project adopts an action lint tool.
