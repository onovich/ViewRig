# ViewRig v0.4 RC Evidence Bundle

Status: R11 reusable release candidate evidence bundle.

## Purpose

The RC evidence bundle gives the owner and future release operator one place to collect proof that v0.4 is ready for an approval decision. It is not a release by itself and does not publish packages, create tags, or upload public docs.

## Evidence Sources

Decision gates:

- `docs/ViewRig_v0.4_Release_Decision_Register.md`
- `docs/ViewRig_v0.4_License_Gate.md`
- `docs/ViewRig_v0.4_Package_Visibility_Gate.md`
- `docs/ViewRig_v0.4_Consumer_Smoke.md`
- `docs/ViewRig_v0.4_API_Maturity_Policy.md`
- `docs/ViewRig_v0.4_Changesets_Version_Gate.md`
- `docs/ViewRig_v0.4_Trusted_Publishing_Gate.md`
- `docs/ViewRig_v0.4_GitHub_Release_Gate.md`
- `docs/ViewRig_v0.4_TypeDoc_Publication_Gate.md`

Validation commands:

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm --filter @viewrig/adapter-three test`
- `pnpm test:browser`
- `pnpm api:check`
- `pnpm docs:api`
- `pnpm docs:check`
- `pnpm boundary:check`
- `pnpm package:dry-run`
- `pnpm package:consumer-smoke`
- `pnpm changeset:status`
- `pnpm release:dry-run`
- `git diff --check`
- `git status --short --branch`

External evidence to attach before final approval:

- latest GitHub Actions run URL for final commit
- `viewrig-api-docs` artifact URL and expiry status
- owner decisions for license, package visibility, npm access, provenance, versioning, and release tag

## Generated Local Bundle

Run:

```powershell
pnpm rc:evidence
```

The script writes:

```text
generated-docs/rc-evidence/ViewRig_v0.4_RC_Evidence_Bundle.generated.md
```

`generated-docs/` is ignored by git. The generated file is local evidence and should not be committed.

## Final Report Usage

The final v0.4 report should summarize:

- which commands passed locally
- which CI run passed on GitHub
- whether `viewrig-api-docs` exists and has not expired
- which owner decisions remain pending
- explicit confirmation that no npm publish, GitHub tag, GitHub release, or TypeDoc public deployment occurred

## Validation

R11 validation commands:

- `pnpm package:consumer-smoke`
- `pnpm release:dry-run`
- `pnpm docs:check`
- `git diff --check`

Architecture self-check: this bundle collects governance and validation evidence only. It does not alter runtime code, package exports, core engine independence, adapter behavior, or Sinan ownership.
