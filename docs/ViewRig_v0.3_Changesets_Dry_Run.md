# ViewRig v0.3 Changesets Dry-Run

Status: R7 Changesets dry-run governance.

## Decision

ViewRig v0.3 introduces `@changesets/cli` for release governance dry-runs, but does not run versioning or publishing.

Current safety boundary:

- packages remain `private: true`
- `changeset version` is not run
- `changeset publish` is not run
- `npm publish` is not run
- no release tag is created

## Commands

```powershell
pnpm changeset:dry-run
pnpm release:dry-run
```

`pnpm release:dry-run` now runs:

```powershell
pnpm build
pnpm package:dry-run
pnpm changeset:dry-run
```

## Current Dry-Run Result

With all packages private and no pending changeset files, the Changesets dry-run reports that a release would release no packages. This is expected for v0.3.

## Configuration

Config lives at:

```txt
.changeset/config.json
```

Current policy:

- `baseBranch`: `main`
- `commit`: `false`
- `access`: `restricted`
- no fixed or linked package groups yet

## Release Notes Strategy

During v0.3, release notes remain draft documentation rather than generated package changelogs.

Before real publication, the project should:

1. approve package public/private status changes
2. add one or more real changeset markdown files
3. run `changeset status --verbose`
4. review the release plan
5. run `changeset version` only after maintainer approval
6. publish only from CI with provenance or trusted publishing configured

## CI

CI runs `pnpm changeset:dry-run` as a governance check. It verifies the dry-run boundary without mutating package versions or changelogs.
