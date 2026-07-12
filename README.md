# Project OS

This repository is the single source of truth for this project.

## Quick Start

Initialize AI Project OS in any existing project:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.5.0/install.sh | sh
```

Choose a project document language:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.5.0/install.sh | sh -s -- --language zh-CN
```

Preview changes without writing files:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.5.0/install.sh | sh -s -- --dry-run
```

Update Project OS system files in an existing project:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.5.0/install.sh | sh -s -- update --dry-run
```

Apply the update:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.5.0/install.sh | sh -s -- update
```

`update` refreshes only Project OS system files and backs up overwritten files
under `.project-os-backups/`. Project state docs are not touched.

To change the project document language during an update:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.5.0/install.sh | sh -s -- update --language en
```

Preview uninstall:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.5.0/install.sh | sh -s -- uninstall --dry-run
```

Remove AI Project OS files:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.5.0/install.sh | sh -s -- uninstall
```

`uninstall` backs up removed files under `.project-os-backups/`, deletes only
the fixed AI Project OS files, and removes directories only when they are empty.
Files that were not installed by AI Project OS or no longer match the template
are kept by default. Use `--force` only when you want to remove them too.

Force uninstall:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.5.0/install.sh | sh -s -- uninstall --force
```

You can also install and run AI Project OS via npm:

```bash
npx ai-project-os@0.5.0 init --language same-as-user
npx ai-project-os@0.5.0 update --dry-run
npx ai-project-os@0.5.0 uninstall --dry-run
```

Or install it globally:

```bash
npm install -g ai-project-os
ai-project-os init --language same-as-user
```

You can also install directly from GitHub without the npm registry:

```bash
npx github:Edwin628/ai-project-os#v0.5.0 init --language same-as-user
```

## AI tool integration

`init` generates thin "shim" files that point your AI tool at `.project/ai-rules.md`,
so the rules are loaded automatically without copying rule content.

```bash
# default: Claude Code + Codex/OpenAI (CLAUDE.md + AGENTS.md)
npx ai-project-os@0.5.0 init

# choose specific tools
npx ai-project-os@0.5.0 init --agents claude,cursor

# all supported tools
npx ai-project-os@0.5.0 init --agents all

# no AI tool shims
npx ai-project-os@0.5.0 init --agents none
```

Supported tools: `claude` (CLAUDE.md), `codex` (AGENTS.md), `cursor`
(.cursor/rules/ai-project-os.mdc), `copilot` (.github/copilot-instructions.md),
`gemini` (GEMINI.md), `cline` (.clinerules), `windsurf` (.windsurfrules).

If you already have a tool config file, AI Project OS appends a marked block
(`<!-- BEGIN ai-project-os -->` ... `<!-- END ai-project-os -->`) instead of
overwriting; `update` refreshes only the block, `uninstall` removes only the block.

Release note: publish a matching Git tag before sharing a versioned install URL.

## Rules

- GitHub repository is the default project home.
- Local files are the working copy.
- Notion is optional and only used for display/collaboration.
- Every project must maintain:
  - docs/STATUS.md
  - docs/NEXT_ACTION.md
  - docs/BACKLOG.md
  - docs/DECISIONS.md
  - docs/MEETINGS/
- Update project docs only when project state changes:
  - status changes
  - next action changes
  - new tasks appear
  - decisions change
  - meeting notes are created
- Do not update project docs for casual chat, simple explanations, command output,
  or discussions that do not change project state.