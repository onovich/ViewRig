# ViewRig v0.3 CI Workflow

Status: R9 CI Three adapter smoke.

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

R4 extends the same CI job with:

- Playwright browser cache at `~/.cache/ms-playwright`
- `pnpm exec playwright install --with-deps chromium`
- `pnpm test:browser`

R6 formalizes `viewrig-api-docs` as a CI inspection artifact. It is not a Pages deployment or release artifact.

R7 adds:

- `pnpm changeset:dry-run`

R8 adds:

- `pnpm package:dry-run`

R9 adds:

- `pnpm --filter @viewrig/adapter-three test`

Later v0.3 rounds extend this workflow with release candidate audit checks.

## Local Equivalent

```powershell
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @viewrig/adapter-three test
pnpm api:check
pnpm docs:api
pnpm docs:check
pnpm boundary:check
pnpm package:dry-run
pnpm changeset:dry-run
pnpm exec playwright install chromium
pnpm test:browser
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

## Browser Policy

CI installs Playwright-managed Chromium with browser dependencies:

```bash
pnpm exec playwright install --with-deps chromium
```

Local Windows smoke can still use the installed Edge or Chrome channel if the Playwright Chromium cache is missing. CI should prefer Playwright-managed Chromium so browser smoke does not depend on a preinstalled runner browser.

## Workflow Review

R1 performs a human YAML review plus local install verification. Automated CI syntax or actionlint validation can be added later if the project adopts an action lint tool.
