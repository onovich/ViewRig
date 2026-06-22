import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const outputDir = join("generated-docs", "rc-evidence");
const outputFile = join(outputDir, "ViewRig_v0.4_RC_Evidence_Bundle.generated.md");

const decisionDocs = [
  "docs/ViewRig_v0.4_Release_Decision_Register.md",
  "docs/ViewRig_v0.4_License_Gate.md",
  "docs/ViewRig_v0.4_Package_Visibility_Gate.md",
  "docs/ViewRig_v0.4_Consumer_Smoke.md",
  "docs/ViewRig_v0.4_API_Maturity_Policy.md",
  "docs/ViewRig_v0.4_Changesets_Version_Gate.md",
  "docs/ViewRig_v0.4_Trusted_Publishing_Gate.md",
  "docs/ViewRig_v0.4_GitHub_Release_Gate.md",
  "docs/ViewRig_v0.4_TypeDoc_Publication_Gate.md"
];

const commands = [
  "pnpm install --frozen-lockfile",
  "pnpm build",
  "pnpm typecheck",
  "pnpm test",
  "pnpm --filter @viewrig/adapter-three test",
  "pnpm test:browser",
  "pnpm api:check",
  "pnpm docs:api",
  "pnpm docs:check",
  "pnpm boundary:check",
  "pnpm package:dry-run",
  "pnpm package:consumer-smoke",
  "pnpm changeset:status",
  "pnpm release:dry-run",
  "git diff --check",
  "git status --short --branch"
];

function runGit(args) {
  const result = spawnSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8"
  });

  if (result.status !== 0) {
    return `git ${args.join(" ")} failed`;
  }

  return (result.stdout ?? "").trim();
}

const generatedAt = new Date().toISOString();
const head = runGit(["rev-parse", "--short", "HEAD"]);
const branchStatus = runGit(["status", "--short", "--branch"]);

const markdown = `# ViewRig v0.4 RC Evidence Bundle

Generated at: ${generatedAt}

Git HEAD: ${head}

## Git Status

\`\`\`text
${branchStatus || "(clean)"}
\`\`\`

## Decision Documents

${decisionDocs.map((doc) => `- [ ] ${doc}`).join("\n")}

## Local Validation Commands

${commands.map((command) => `- [ ] \`${command}\``).join("\n")}

## External Evidence

- [ ] Latest GitHub Actions final commit URL
- [ ] \`viewrig-api-docs\` artifact URL
- [ ] Artifact expiry status
- [ ] Owner license decision
- [ ] Owner package visibility decision
- [ ] Owner npm access/provenance decision
- [ ] Owner GitHub release/tag decision

## Non-Release Confirmation

- [ ] No npm publish was run.
- [ ] No Changesets version or publish command was run.
- [ ] No GitHub tag was created.
- [ ] No GitHub release was created.
- [ ] No generated TypeDoc HTML was committed.
- [ ] No public \`@viewrig/sinan\` package or \`packages/sinan\` folder was added.
`;

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, markdown, "utf8");
console.log(`rc evidence bundle written to ${outputFile}`);
