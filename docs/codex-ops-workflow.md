<!-- codex-project-ops-workflow: initialized -->
<!-- initialized-at: 2026-06-20 19:23:39 +08:00 -->

# Codex Ops Workflow

Initialization status: initialized
Project: ViewRig
Repository root: D:\LabProjects\Engine\ViewRig
Machine config: `.codex/project-ops-workflow.json`
Skill: project-ops-workflow

Treat this document and `.codex/project-ops-workflow.json` as the source of truth for mechanical project operations.

## Global Wrappers

Run these from the repository root:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\EnvCheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\RestoreDeps.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\InstallDeps.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Build.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Test.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Lint.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Format.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Typecheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StructureCheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Codegen.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\DocsCheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Package.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd
```

## Validate Sequence

docsCheck
structureCheck

The current validation verifies `README.md`, the `docs\ViewRig_*.md` design document entry, and `pnpm boundary:check` for core host-dependency and Sinan adapter boundary rules.

## Dev Server

Start command: ``
Health URL: ``
Ready text: ``
Timeout seconds: 30

## Safety Policy

Do not run destructive clean/reset/deploy commands unless the user explicitly asks.
