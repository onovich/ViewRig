# ViewRig v0.4 Release Decision Register

Status: R1 release decision register for owner-approvable RC gates.

## Purpose

This register turns the remaining v0.3 release-level risks into explicit v0.4 decisions. It does not approve a public release by itself. Until the owner approves a row, the repository keeps the safest current posture:

- workspace and packages stay private
- license stays `UNLICENSED`
- `publishConfig.access` stays `restricted`
- release commands remain dry-run only
- no npm publish, GitHub tag, GitHub release, or generated TypeDoc publication is performed

## Status Values

- APPROVED: owner or project policy has approved the action for v0.4.
- PENDING: a real owner or external-service decision is still required.
- REJECTED: explicitly out of v0.4 scope.
- DEFERRED: valid future work, but not required for this v0.4 RC gate.

## Decision Table

| Area | Status | Current safe default | Required approval before change | Evidence source |
| --- | --- | --- | --- | --- |
| License selection | PENDING | Root and package metadata remain `UNLICENSED`; no LICENSE file is added. | Owner chooses a concrete license and accepts its legal/commercial impact. | `package.json`, package manifests, v0.3 final report. |
| Package visibility | PENDING | Root workspace and packages remain private. | Owner approves making any package public or publishable. | v0.3 package metadata audit. |
| npm access mode | PENDING | `publishConfig.access` remains `restricted`; publish commands are not run. | Owner approves public vs restricted package access and package scope policy. | v0.3 package metadata audit. |
| Trusted publishing and provenance | PENDING | No secrets, npm tokens, or OIDC publishing setup are added. | Owner approves npm trusted publishing setup and repository environment policy. | v0.2 provenance plan and v0.3 release checklist. |
| Changesets version workflow | PENDING | `changeset:dry-run` is allowed; `changeset version` and `changeset publish` are not run. | Owner approves first real version bump and publish workflow. | v0.3 Changesets dry-run notes. |
| GitHub tag and release | PENDING | No tag and no GitHub release are created. | Owner approves release name, tag, notes, and publication timing. | v0.3 release candidate checklist. |
| TypeDoc publication | DEFERRED | TypeDoc HTML remains a generated local/CI artifact ignored by git. | Owner approves public docs hosting target and update cadence. | v0.3 TypeDoc artifact policy. |
| Consumer tarball smoke | APPROVED | Local temporary install/import smoke is allowed against packed artifacts only. | Approval is only needed if the smoke starts publishing or using external credentials. | v0.4 goal guide. |
| RC evidence bundle | APPROVED | A local documentation bundle may collect command output and gate status. | Approval is only needed for external publication. | v0.4 goal guide. |
| Sinan public adapter | DEFERRED | Sinan remains a docs/contract handoff; no public `@viewrig/sinan` package or `packages/sinan` is added. | Owner and Sinan-side architecture approval for a future adapter package. | v0.3 Sinan POC handoff. |

## v0.4 Decision Boundary

v0.4 can reach PASS when every required release gate is either approved, safely deferred, or documented as pending with a conservative default. PASS for this goal means the project is owner-approvable and auditable; it does not mean public release, npm publication, or GitHub release has happened.

## Round 1 Validation

Required validation for this register:

- `git diff --check`
- `pnpm docs:check`

Architecture self-check: this document changes release governance only. It does not alter `CameraState`, runtime packages, engine adapters, or the Sinan handoff boundary.
