#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const VERSION = "0.2.0";
const DEFAULT_LANGUAGE = "same-as-user";
const LANGUAGE_PATTERN = /^[A-Za-z][A-Za-z0-9._-]*$/;
const SYSTEM_TEMPLATE_PATHS = [
  ".project/ai-rules.md",
  ".project/workflow.md",
  "prompts/project-os.md",
  "docs/MEETINGS/README.md",
];

const staticTemplates = {
  ".project/ai-rules.md": `# AI Project Rules

## Source of Truth

This GitHub repository is the single source of truth.

Local files are the working copy.
Notion is optional and only used for display or collaboration.

## Language Policy

Keep core rules, file paths, and prompts in English.
Use \`.project/config.yaml\` \`project_os.doc_language\` for project document updates.
The default value is \`same-as-user\`, which means project docs should use the
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
`,
  ".project/project-context.md": `# Project Context

## Project Name

TBD

## Goal

TBD

## Current Stage

TBD

## Notes

This project follows AI Project OS.
GitHub repository is the default project home.
Notion is optional.
`,
  ".project/workflow.md": `# AI Project Workflow

## Daily Workflow

1. Read \`.project/ai-rules.md\`
2. Read \`.project/config.yaml\`
3. Read \`docs/STATUS.md\`
4. Read \`docs/NEXT_ACTION.md\`
5. Continue from the current next action
6. After work that changes project state, update project docs

## Default Command For AI

Please read \`.project/ai-rules.md\` and manage this project according to AI Project OS.

At the end of each meaningful discussion or coding task that changes project state, update:

- docs/STATUS.md
- docs/NEXT_ACTION.md
- docs/BACKLOG.md
- docs/DECISIONS.md
- docs/MEETINGS/YYYY-MM-DD.md
`,
  "prompts/project-os.md": `# AI Project OS Prompt

Please manage this project using AI Project OS.

Rules:

- Treat this GitHub repository as the single source of truth.
- Read \`.project/ai-rules.md\` before making project-level changes.
- Read \`.project/config.yaml\` before updating project docs.
- Use local Markdown files as the default project management layer.
- Treat Notion as optional only.
- Keep docs updated only after meaningful discussions or coding tasks that change project state.
- Use \`.project/config.yaml\` \`project_os.doc_language\` for project document updates.

Update these files when relevant:

- docs/STATUS.md
- docs/NEXT_ACTION.md
- docs/BACKLOG.md
- docs/DECISIONS.md
- docs/MEETINGS/YYYY-MM-DD.md
`,
  "docs/STATUS.md": `# Status

## Current State

TBD

## Current Stage

TBD

## Recently Completed

- TBD

## Active Risks or Blockers

- TBD

## Last Updated

TBD
`,
  "docs/NEXT_ACTION.md": `# Next Action

Keep this file limited to the current 1-3 actionable next steps.

## Current Next Steps

1. TBD

## Blockers

- TBD

## Notes

- Update this file whenever the active next action changes.
`,
  "docs/BACKLOG.md": `# Backlog

Use this file for tasks that are known but not currently the next action.

## Open Tasks

- TBD

## Ideas

- TBD

## Deferred

- TBD
`,
  "docs/DECISIONS.md": `# Decisions

This file is append-only. Do not edit or remove old decisions.

## Decision Log

### YYYY-MM-DD - Decision Title

- Decision: TBD
- Context: TBD
- Consequences: TBD
- Supersedes: None
`,
  "docs/MEETINGS/README.md": `# Meetings

Create or append one meeting note per local date:

\`\`\`text
docs/MEETINGS/YYYY-MM-DD.md
\`\`\`

## Daily Note Template

\`\`\`md
# YYYY-MM-DD

## Summary

- TBD

## Decisions

- TBD

## Action Items

- TBD

## Notes

- TBD
\`\`\`
`,
  "docs/ROADMAP.md": `# Roadmap

## Now

- TBD

## Next

- TBD

## Later

- TBD
`,
  "docs/RESEARCH/README.md": `# Research

Use this directory for project research notes, references, and findings.
`,
};

function buildTemplates(language) {
  return {
    ".project/config.yaml": buildConfig(language),
    ...staticTemplates,
  };
}

function buildConfig(language, existingConfig = "") {
  const unknownLines = collectUnknownConfigLines(existingConfig);
  const preservedConfig = unknownLines.length > 0 ? `${unknownLines.join("\n")}\n` : "";

  return `project_os:
  version: ${JSON.stringify(VERSION)}
  doc_language: ${JSON.stringify(language)}
  managed_files:
${SYSTEM_TEMPLATE_PATHS.map((filePath) => `    - ${filePath}`).join("\n")}
${preservedConfig}`;
}

function collectUnknownConfigLines(configText) {
  if (!configText.trim()) {
    return [];
  }

  const lines = configText.split(/\r?\n/);
  const projectOsIndex = lines.findIndex((line) => line.trim() === "project_os:");
  if (projectOsIndex === -1) {
    return [];
  }

  const unknownLines = [];
  let skippingManagedFiles = false;

  for (const line of lines.slice(projectOsIndex + 1)) {
    if (line !== "" && !/^\s/.test(line)) {
      break;
    }

    const trimmed = line.trim();
    const indent = leadingWhitespaceCount(line);

    if (skippingManagedFiles) {
      if (trimmed === "" || indent > 2) {
        continue;
      }
      skippingManagedFiles = false;
    }

    if (
      indent === 2 &&
      (trimmed.startsWith("version:") ||
        trimmed.startsWith("doc_language:"))
    ) {
      continue;
    }

    if (indent === 2 && trimmed.startsWith("managed_files:")) {
      skippingManagedFiles = true;
      continue;
    }

    if (trimmed !== "") {
      unknownLines.push(line);
    }
  }

  return unknownLines;
}

function leadingWhitespaceCount(value) {
  const match = value.match(/^\s*/);
  return match ? match[0].length : 0;
}

function printHelp() {
  console.log(`AI Project OS ${VERSION}

Usage:
  ai-project-os init [target-dir] [options]
  ai-project-os update [target-dir] [options]

Options:
  --language <value>   Project docs language. Default: ${DEFAULT_LANGUAGE}
  --force              Overwrite existing Project OS files
  --dry-run            Show planned changes without writing files
  --allow-outside-cwd  Allow target directory outside the current working directory
  -h, --help           Show help
  -v, --version        Show version

Examples:
  ai-project-os init
  ai-project-os init . --language same-as-user
  ai-project-os init ./my-project --language zh-CN --dry-run
  ai-project-os update --dry-run
`);
}

function validateLanguage(language) {
  if (!LANGUAGE_PATTERN.test(language)) {
    throw new Error(
      `Invalid language value: ${language}. Use values like same-as-user, zh-CN, or en.`
    );
  }
}

function parseArgs(argv) {
  const args = [...argv];
  const options = {
    command: "init",
    targetDir: ".",
    language: DEFAULT_LANGUAGE,
    languageExplicit: false,
    force: false,
    dryRun: false,
    allowOutsideCwd: false,
  };

  if (args[0] === "init" || args[0] === "update") {
    options.command = args[0];
    args.shift();
  }

  while (args.length > 0) {
    const arg = args.shift();

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--version" || arg === "-v") {
      options.version = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--allow-outside-cwd") {
      options.allowOutsideCwd = true;
    } else if (arg === "--language") {
      const value = args.shift();
      if (!value || value.startsWith("-")) {
        throw new Error("--language requires a value");
      }
      options.language = value;
      options.languageExplicit = true;
    } else if (arg.startsWith("--language=")) {
      options.language = arg.slice("--language=".length);
      options.languageExplicit = true;
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      options.targetDir = arg;
    }
  }

  validateLanguage(options.language);

  return options;
}

function ensureTargetDirectory(targetDir, options) {
  const resolved = path.resolve(process.cwd(), targetDir);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Target directory does not exist: ${resolved}`);
  }

  const stat = fs.statSync(resolved);
  if (!stat.isDirectory()) {
    throw new Error(`Target path is not a directory: ${resolved}`);
  }

  if (fs.lstatSync(resolved).isSymbolicLink()) {
    throw new Error(`Target directory must not be a symlink: ${resolved}`);
  }

  const cwdRealPath = fs.realpathSync(process.cwd());
  const targetRealPath = fs.realpathSync(resolved);

  if (!options.allowOutsideCwd) {
    const relativePath = path.relative(cwdRealPath, targetRealPath);
    const isOutside =
      relativePath === ".." ||
      relativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativePath);

    if (isOutside) {
      throw new Error(
        "Target directory is outside the current working directory. Re-run from the target project or pass --allow-outside-cwd."
      );
    }
  }

  return resolved;
}

function assertNoSymlinkInPath(rootDir, relativePath) {
  const parts = relativePath.split(/[\\/]+/).filter(Boolean);
  let current = rootDir;

  for (const part of parts) {
    current = path.join(current, part);

    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) {
      throw new Error(`Refusing to write through symlink: ${current}`);
    }
  }
}

function writeTemplateFile(rootDir, relativePath, content, options, summary) {
  const targetPath = path.join(rootDir, relativePath);
  const exists = fs.existsSync(targetPath);

  if (exists && !options.force) {
    summary.skipped.push(relativePath);
    return;
  }

  assertNoSymlinkInPath(rootDir, relativePath);

  if (exists) {
    const stat = fs.lstatSync(targetPath);
    if (!stat.isFile()) {
      throw new Error(`Refusing to overwrite non-file path: ${targetPath}`);
    }
  }

  if (options.dryRun) {
    if (exists) {
      summary.overwritten.push(relativePath);
    } else {
      summary.created.push(relativePath);
    }
    return;
  }

  if (exists && options.backupRoot) {
    backupExistingFile(rootDir, relativePath, options.backupRoot, summary);
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const flag = exists ? "w" : "wx";
  fs.writeFileSync(targetPath, content, { encoding: "utf8", flag });

  if (exists) {
    summary.overwritten.push(relativePath);
  } else {
    summary.created.push(relativePath);
  }
}

function mergeConfig(rootDir, options, summary) {
  const relativePath = ".project/config.yaml";
  const targetPath = path.join(rootDir, relativePath);
  assertNoSymlinkInPath(rootDir, relativePath);
  const existingConfig = fs.existsSync(targetPath)
    ? fs.readFileSync(targetPath, "utf8")
    : "";
  const language = options.languageExplicit
    ? options.language
    : readConfigValue(existingConfig, "doc_language") || options.language;
  const nextConfig = buildConfig(language, existingConfig);

  writeTemplateFile(rootDir, relativePath, nextConfig, { ...options, force: true }, summary);
}

function backupExistingFile(rootDir, relativePath, backupRoot, summary) {
  const sourcePath = path.join(rootDir, relativePath);
  const backupPath = path.join(backupRoot, relativePath);
  const backupRootRelativePath = path.relative(rootDir, backupRoot);

  if (
    backupRootRelativePath === ".." ||
    backupRootRelativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(backupRootRelativePath)
  ) {
    throw new Error(`Backup directory is outside target project: ${backupRoot}`);
  }

  assertNoSymlinkInPath(rootDir, backupRootRelativePath);
  assertNoSymlinkInPath(rootDir, path.join(backupRootRelativePath, relativePath));

  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.copyFileSync(sourcePath, backupPath);
  summary.backedUp.push(relativePath);
}

function readConfigValue(configText, key) {
  const pattern = new RegExp(`^\\s*${key}:\\s*(.+?)\\s*$`, "m");
  const match = configText.match(pattern);
  if (!match) {
    return undefined;
  }

  return match[1].replace(/^["']|["']$/g, "");
}

function printList(label, values) {
  if (values.length === 0) {
    return;
  }

  console.log(`\n${label}:`);
  for (const value of values) {
    console.log(`  - ${value}`);
  }
}

function initProject(options) {
  const rootDir = ensureTargetDirectory(options.targetDir, options);
  const templates = buildTemplates(options.language);
  const summary = {
    created: [],
    overwritten: [],
    skipped: [],
    backedUp: [],
  };

  for (const [relativePath, content] of Object.entries(templates)) {
    writeTemplateFile(rootDir, relativePath, content, options, summary);
  }

  const action = options.dryRun ? "Dry run complete" : "AI Project OS initialized";
  console.log(`${action} in ${rootDir}`);
  console.log(`Document language: ${options.language}`);

  printList("Created", summary.created);
  printList("Overwritten", summary.overwritten);
  printList("Skipped existing files", summary.skipped);

  if (summary.skipped.length > 0 && !options.force) {
    console.log("\nRun again with --force to overwrite existing files.");
  }

  console.log("\nNext steps:");
  console.log("  1. Fill in .project/project-context.md");
  console.log("  2. Ask your AI agent to read prompts/project-os.md");
  console.log("  3. Keep docs updated only when project state changes");
}

function updateProject(options) {
  const rootDir = ensureTargetDirectory(options.targetDir, options);
  const templates = buildTemplates(options.language);
  const backupRoot = options.dryRun
    ? undefined
    : path.join(rootDir, ".project-os-backups", timestampForBackup());
  const summary = {
    created: [],
    overwritten: [],
    skipped: [],
    backedUp: [],
  };

  mergeConfig(rootDir, { ...options, backupRoot }, summary);

  for (const relativePath of SYSTEM_TEMPLATE_PATHS) {
    writeTemplateFile(
      rootDir,
      relativePath,
      templates[relativePath],
      { ...options, force: true, backupRoot },
      summary
    );
  }

  const action = options.dryRun ? "Dry run complete" : "AI Project OS updated";
  console.log(`${action} in ${rootDir}`);
  console.log(`Project OS version: ${VERSION}`);

  printList("Created", summary.created);
  printList("Updated", summary.overwritten);
  printList("Backed up", summary.backedUp);
  printList("Skipped", summary.skipped);

  if (summary.backedUp.length > 0) {
    console.log(`\nBackups written to ${backupRoot}`);
  }

  console.log("\nProtected project files were not touched:");
  console.log("  - .project/project-context.md");
  console.log("  - docs/STATUS.md");
  console.log("  - docs/NEXT_ACTION.md");
  console.log("  - docs/BACKLOG.md");
  console.log("  - docs/DECISIONS.md");
  console.log("  - docs/ROADMAP.md");
  console.log("  - docs/RESEARCH/");
  console.log("  - docs/MEETINGS/YYYY-MM-DD.md");
}

function timestampForBackup() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z");
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
      printHelp();
      return;
    }

    if (options.version) {
      console.log(VERSION);
      return;
    }

    if (options.command === "update") {
      updateProject(options);
    } else {
      initProject(options);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error("Run `ai-project-os --help` for usage.");
    process.exitCode = 1;
  }
}

main();
