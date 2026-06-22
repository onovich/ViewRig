# ViewRig v0.3 CI Workflow

Status: R1 CI skeleton.

## Scope

The initial CI workflow is `.github/workflows/ci.yml`.

R1 establishes the minimum reproducible CI base:

- checkout
- pnpm setup
- Node 24 setup
- pnpm cache through `actions/setup-node`
- immutable dependency installation with `pnpm install --frozen-lockfile`

Later v0.3 rounds extend this workflow with build, typecheck, unit tests, API/docs checks, browser smoke, package dry-run, and release governance checks.

## Local Equivalent

```powershell
pnpm install --frozen-lockfile
```

## Policy

- CI does not publish packages.
- CI does not create GitHub releases.
- CI does not create tags.
- Packages remain `private: true`.
- Generated docs, package `dist`, playground `dist`, and browser outputs remain ignored unless a later round explicitly defines an artifact upload policy.

## Workflow Review

R1 performs a human YAML review plus local install verification. Automated CI syntax or actionlint validation can be added later if the project adopts an action lint tool.
