# AI Project Rules

## Source of Truth

This GitHub repository is the single source of truth.

Local files are the working copy.
Notion is optional and only used for display or collaboration.

## Language Policy

Keep core rules, file paths, and prompts in English.
Use `.project/config.yaml` `project_os.doc_language` for project document updates.
The default value is `same-as-user`, which means project docs should use the
user's current conversation language.

## Required Updates

After every meaningful discussion or coding task that changes project state:

- Update docs/STATUS.md
- Update docs/NEXT_ACTION.md
- Update docs/BACKLOG.md if new tasks appear
- Update docs/DECISIONS.md if decisions change
- Create or append today's docs/MEETINGS/YYYY-MM-DD.md

Project state changes include new tasks, completed tasks, changed decisions,
new risks, meeting notes, or changed next actions.

Do not update project docs for casual chat, simple explanations, command output,
or discussions that do not change project state.

## Working Principles

- Never lose project context.
- Never overwrite history.
- Always keep NEXT_ACTION actionable.
- Keep NEXT_ACTION limited to the current 1-3 actionable next steps.
- Keep STATUS concise.
- Keep DECISIONS append-only.
- If a decision changes, append a new decision that supersedes the old one.
- Keep MEETINGS chronological.
- Use local date and time for meeting notes unless the user specifies otherwise.
- Read existing project docs before updating them.
- Never write secrets, credentials, API keys, tokens, or private personal data into project docs.

## AI Output Format

When asked to update project docs, output changes for:

1. STATUS.md
2. NEXT_ACTION.md
3. BACKLOG.md
4. DECISIONS.md
5. MEETING note
