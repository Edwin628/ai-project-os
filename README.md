# Project OS

This repository is the single source of truth for this project.

## Quick Start

Initialize AI Project OS in any existing project:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.3.0/install.sh | sh
```

Choose a project document language:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.3.0/install.sh | sh -s -- --language zh-CN
```

Preview changes without writing files:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.3.0/install.sh | sh -s -- --dry-run
```

Update Project OS system files in an existing project:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.3.0/install.sh | sh -s -- update --dry-run
```

Apply the update:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.3.0/install.sh | sh -s -- update
```

`update` refreshes only Project OS system files and backs up overwritten files
under `.project-os-backups/`. Project state docs are not touched.

To change the project document language during an update:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.3.0/install.sh | sh -s -- update --language en
```

Preview uninstall:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.3.0/install.sh | sh -s -- uninstall --dry-run
```

Remove AI Project OS files:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.3.0/install.sh | sh -s -- uninstall
```

`uninstall` backs up removed files under `.project-os-backups/`, deletes only
the fixed AI Project OS files, and removes directories only when they are empty.
Files that were not installed by AI Project OS or no longer match the template
are kept by default. Use `--force` only when you want to remove them too.

Force uninstall:

```bash
curl -fsSL https://raw.githubusercontent.com/Edwin628/ai-project-os/v0.3.0/install.sh | sh -s -- uninstall --force
```

If this package is available through npm or GitHub npm install, you can also run:

```bash
npx github:Edwin628/ai-project-os#v0.3.0 init --language same-as-user
npx github:Edwin628/ai-project-os#v0.3.0 update --dry-run
npx github:Edwin628/ai-project-os#v0.3.0 uninstall --dry-run
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