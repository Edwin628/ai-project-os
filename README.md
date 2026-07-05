# Project OS

This repository is the single source of truth for this project.

## Quick Start

Initialize AI Project OS in any existing project:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.1.0/install.sh | sh
```

Choose a project document language:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.1.0/install.sh | sh -s -- --language zh-CN
```

Preview changes without writing files:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.1.0/install.sh | sh -s -- --dry-run
```

If this package is available through npm or GitHub npm install, you can also run:

```bash
npx github:Edwin628/ai-project-os#v0.1.0 init --language same-as-user
```

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