# ViewRig v0.4 License Gate

Status: R2 license gate.

## Decision

License selection is PENDING owner approval.

The repository stays in its current conservative state for v0.4:

- root `package.json` keeps `"license": "UNLICENSED"`
- `@viewrig/core` keeps `"license": "UNLICENSED"`
- `@viewrig/testing` keeps `"license": "UNLICENSED"`
- `@viewrig/adapter-three` keeps `"license": "UNLICENSED"`
- no `LICENSE` file is added by this round
- no package is made publishable because of this gate

## Rationale

Choosing a public license is a product and legal decision, not an implementation detail. The codebase can be technically release-ready while still blocked from public publication until the owner chooses and approves the license.

Keeping `UNLICENSED` is intentionally strict. It prevents accidental public packaging semantics, aligns with the private workspace state, and keeps the npm package dry-run guard meaningful.

## Release Blocker

Public release remains blocked until the owner records a concrete license decision.

Required owner decision:

- approve the license identifier to place in every publishable manifest
- approve whether a root `LICENSE` file should be added
- confirm whether package-level README/license notices need extra wording

## Current Enforcement

`scripts/package-dry-run.mjs` checks that every package manifest remains `UNLICENSED` and fails if the value changes before this gate is resolved. The script also checks repository, bugs, homepage, package files, private package state, and restricted publish access.

## Validation

R2 validation commands:

- `pnpm package:dry-run`
- `pnpm release:dry-run`
- `git diff --check`

Architecture self-check: this gate only documents release eligibility. It does not change core runtime contracts, engine adapter boundaries, package exports, or Sinan ownership.
