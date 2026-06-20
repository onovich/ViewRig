<!-- codex-project-git-workflow: initialized -->
<!-- initialized-at: 2026-06-20 19:23:39 +08:00 -->

# Codex Git Workflow

Initialization status: initialized
Project: ViewRig
Repository root: D:\LabProjects\Engine\ViewRig
Machine config: `.codex/project-git-workflow.json`
Skill: project-git-workflow

Treat this document and the machine config as the source of truth for this repository's Codex git workflow. Do not replace them with generic defaults unless the user explicitly asks to reinitialize or update the policy.

## Global Wrappers

Run these from the repository root:

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Validate.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Commit.cmd -Message "commit message" -Paths path\to\file,other\file
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "commit message" -Paths path\to\file,other\file
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Push.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Stash.cmd -StashMessage "reason"
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\StashPop.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Ignore.cmd -Pattern build-output/
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\DiscardPaths.cmd -ConfirmDangerous -Paths path\to\file
```

## Status

```powershell
git -c safe.directory=D:/LabProjects/Engine/ViewRig status --short --branch
```

## Validation

No validation commands are configured for git commits yet because this repository currently contains design documents rather than a runnable package. Revisit this once the TypeScript workspace exists.

## Staging Policy

all changes

Inspect status before staging. Preserve unrelated user changes unless the user explicitly asks to include them.

## Commit

Use the global wrapper's built-in git commit after staging according to policy. Prefer concise conventional commit messages unless the user specifies another message.

## Push

```powershell
git -c safe.directory=D:/LabProjects/Engine/ViewRig push -u origin HEAD
```

## Docs And TODO

Keep `README.md` and `docs/ViewRig_视角_设计文档.md` aligned when project positioning changes.

## Safety And Branch Policy

Do not force-push. Do not run destructive git commands unless the user explicitly asks for the specific operation.
