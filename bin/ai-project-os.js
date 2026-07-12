#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const VERSION = "0.5.0";
const DEFAULT_LANGUAGE = "same-as-user";
const LANGUAGE_PATTERN = /^[A-Za-z][A-Za-z0-9._-]*$/;
const SYSTEM_TEMPLATE_PATHS = [
  ".project/ai-rules.md",
  ".project/workflow.md",
  "prompts/project-os.md",
  "docs/MEETINGS/README.md",
];
const REMOVABLE_DIRECTORY_PATHS = [
  "docs/RESEARCH",
  "docs/MEETINGS",
  "docs",
  "prompts",
  ".project",
];

const AGENTS = {
  claude: { file: "CLAUDE.md", name: "Claude Code" },
  codex: { file: "AGENTS.md", name: "Codex / OpenAI" },
  cursor: { file: ".cursor/rules/ai-project-os.mdc", name: "Cursor", frontmatter: true },
  copilot: { file: ".github/copilot-instructions.md", name: "GitHub Copilot" },
  gemini: { file: "GEMINI.md", name: "Gemini CLI" },
  cline: { file: ".clinerules", name: "Cline" },
  windsurf: { file: ".windsurfrules", name: "Windsurf" },
};
const DEFAULT_AGENTS = ["claude", "codex"];
const MARKER_BEGIN = "<!-- BEGIN ai-project-os -->";
const MARKER_END = "<!-- END ai-project-os -->";

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
- Add to docs/RESEARCH/ when a new technical finding, external reference, or investigation outcome should be recorded

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
6. RESEARCH note (when a finding or reference should be recorded)
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
- docs/RESEARCH/ (technical findings, references, investigation outcomes)
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
- docs/RESEARCH/ (technical findings, references, investigation outcomes)
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

function buildConfig(language, existingConfig = "", installedFiles = [], agents = DEFAULT_AGENTS) {
  const unknownLines = collectUnknownConfigLines(existingConfig);
  const preservedConfig = unknownLines.length > 0 ? `${unknownLines.join("\n")}\n` : "";
  const installedFilesConfig =
    installedFiles.length > 0
      ? `  installed_files:\n${installedFiles.map((filePath) => `    - ${filePath}`).join("\n")}\n`
      : "";
  const agentsConfig =
    agents.length > 0
      ? `  agents:\n${agents.map((agentId) => `    - ${agentId}`).join("\n")}\n`
      : "";

  return `project_os:
  version: ${JSON.stringify(VERSION)}
  doc_language: ${JSON.stringify(language)}
${agentsConfig}  managed_files:
${SYSTEM_TEMPLATE_PATHS.map((filePath) => `    - ${filePath}`).join("\n")}
${installedFilesConfig}
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

    if (
      indent === 2 &&
      (trimmed.startsWith("managed_files:") ||
        trimmed.startsWith("installed_files:") ||
        trimmed.startsWith("agents:"))
    ) {
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

function parseAgentsList(value) {
  if (value === "none") {
    return [];
  }
  if (value === "all") {
    return Object.keys(AGENTS);
  }
  const ids = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  for (const id of ids) {
    if (!AGENTS[id]) {
      throw new Error(
        `Unknown agent: ${id}. Valid: ${Object.keys(AGENTS).join(", ")}, or all/none.`
      );
    }
  }
  return ids;
}

function shimBlockContent() {
  return "Read and follow the rules in `.project/ai-rules.md` for AI Project OS project management.";
}

function fullAgentBlock() {
  return `${MARKER_BEGIN}\n${shimBlockContent()}\n${MARKER_END}`;
}

function buildAgentShim(agentId) {
  const agent = AGENTS[agentId];
  const block = fullAgentBlock();
  if (agent.frontmatter) {
    return `---\ndescription: AI Project OS rules\nalwaysApply: true\n---\n\n${block}\n`;
  }
  return `${block}\n`;
}

function findBlockRange(content) {
  const beginIdx = content.indexOf(MARKER_BEGIN);
  if (beginIdx === -1) {
    return null;
  }
  const endIdx = content.indexOf(MARKER_END, beginIdx);
  if (endIdx === -1) {
    return null;
  }
  return { begin: beginIdx, end: endIdx + MARKER_END.length };
}

function appendAgentBlock(content) {
  const trimmed = content.replace(/\s+$/, "");
  return `${trimmed}\n\n${fullAgentBlock()}\n`;
}

function replaceAgentBlock(content) {
  const range = findBlockRange(content);
  if (!range) {
    return appendAgentBlock(content);
  }
  return content.slice(0, range.begin) + fullAgentBlock() + content.slice(range.end);
}

function removeAgentBlock(content) {
  const range = findBlockRange(content);
  if (!range) {
    return { remaining: content, removed: false };
  }
  let remaining = content.slice(0, range.begin) + content.slice(range.end);
  remaining = remaining.replace(/\n{3,}/g, "\n\n").replace(/^\s+|\s+$/g, "");
  return { remaining, removed: true };
}

function isBlankContent(content) {
  return content.trim() === "";
}

function writeAgentShim(rootDir, agentId, options, summary) {
  const relativePath = AGENTS[agentId].file;
  const targetPath = path.join(rootDir, relativePath);
  assertNoSymlinkInPath(rootDir, relativePath);
  const exists = fs.existsSync(targetPath);

  if (options.dryRun) {
    if (!exists) {
      summary.created.push(relativePath);
    } else {
      const content = fs.readFileSync(targetPath, "utf8");
      if (findBlockRange(content)) {
        summary.shimRefreshed.push(relativePath);
      } else {
        summary.blockAppended.push(relativePath);
      }
    }
    return;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  if (!exists) {
    fs.writeFileSync(targetPath, buildAgentShim(agentId), { encoding: "utf8", flag: "wx" });
    summary.created.push(relativePath);
    return;
  }

  const existing = fs.readFileSync(targetPath, "utf8");
  if (findBlockRange(existing)) {
    const updated = replaceAgentBlock(existing);
    if (updated !== existing) {
      if (options.backupPrefix) {
        backupExistingFile(rootDir, relativePath, options, summary);
      }
      fs.writeFileSync(targetPath, updated, { encoding: "utf8" });
    }
    summary.shimRefreshed.push(relativePath);
  } else {
    if (options.backupPrefix) {
      backupExistingFile(rootDir, relativePath, options, summary);
    }
    fs.writeFileSync(targetPath, appendAgentBlock(existing), { encoding: "utf8" });
    summary.blockAppended.push(relativePath);
  }
}

function removeAgentShim(rootDir, agentId, options, summary) {
  const relativePath = AGENTS[agentId].file;
  const targetPath = path.join(rootDir, relativePath);
  const stat = lstatIfExists(targetPath);

  if (!stat) {
    summary.shimMissing.push(relativePath);
    return;
  }

  assertNoSymlinkInPath(rootDir, relativePath);

  if (!stat.isFile()) {
    throw new Error(`Refusing to remove non-file path: ${targetPath}`);
  }

  const existing = fs.readFileSync(targetPath, "utf8");
  const { remaining, removed } = removeAgentBlock(existing);

  if (!removed) {
    summary.shimKept.push(relativePath);
    return;
  }

  if (options.dryRun) {
    if (isBlankContent(remaining)) {
      summary.shimRemovedFile.push(relativePath);
    } else {
      summary.shimRemovedBlock.push(relativePath);
    }
    return;
  }

  if (options.backupPrefix) {
    backupExistingFile(rootDir, relativePath, options, summary);
  }

  if (isBlankContent(remaining)) {
    fs.unlinkSync(targetPath);
    summary.shimRemovedFile.push(relativePath);
  } else {
    fs.writeFileSync(targetPath, remaining, { encoding: "utf8" });
    summary.shimRemovedBlock.push(relativePath);
  }
}

function printHelp() {
  console.log(`AI Project OS ${VERSION}

Usage:
  ai-project-os init [target-dir] [options]
  ai-project-os update [target-dir] [options]
  ai-project-os uninstall [target-dir] [options]

Options:
  --language <value>   Project docs language. Default: ${DEFAULT_LANGUAGE}
  --agents <list>      AI tool shims to generate. Default: ${DEFAULT_AGENTS.join(",")}
                       Comma list (claude,codex,cursor,...), all, or none.
                       Supported: ${Object.keys(AGENTS).join(", ")}
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
  ai-project-os uninstall --dry-run
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
    agents: DEFAULT_AGENTS.join(","),
    agentsExplicit: false,
    force: false,
    dryRun: false,
    allowOutsideCwd: false,
  };

  if (args[0] === "init" || args[0] === "update" || args[0] === "uninstall") {
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
    } else if (arg === "--agents") {
      const value = args.shift();
      if (!value || value.startsWith("-")) {
        throw new Error("--agents requires a value");
      }
      options.agents = value;
      options.agentsExplicit = true;
    } else if (arg.startsWith("--agents=")) {
      options.agents = arg.slice("--agents=".length);
      options.agentsExplicit = true;
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
  options.agentsList = parseAgentsList(options.agents);

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

    try {
      if (fs.lstatSync(current).isSymbolicLink()) {
        throw new Error(`Refusing to write through symlink: ${current}`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
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

  if (exists && options.backupPrefix) {
    backupExistingFile(rootDir, relativePath, options, summary);
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
  const configAgents = readConfigList(existingConfig, "agents");
  const agents = options.agentsExplicit
    ? options.agentsList
    : configAgents.length > 0
      ? configAgents
      : DEFAULT_AGENTS;
  const installedFiles = readConfigList(existingConfig, "installed_files");
  const nextConfig = buildConfig(language, existingConfig, installedFiles, agents);

  writeTemplateFile(rootDir, relativePath, nextConfig, { ...options, force: true }, summary);
}

function backupExistingFile(rootDir, relativePath, options, summary) {
  const backupRoot =
    summary.backupRoot || createBackupRoot(rootDir, options.backupPrefix);
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
  fs.copyFileSync(sourcePath, backupPath, fs.constants.COPYFILE_EXCL);
  summary.backupRoot = backupRoot;
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

function readConfigList(configText, key) {
  const lines = configText.split(/\r?\n/);
  const listIndex = lines.findIndex((line) => line.trim() === `${key}:`);
  if (listIndex === -1) {
    return [];
  }

  const values = [];
  for (const line of lines.slice(listIndex + 1)) {
    const trimmed = line.trim();
    const indent = leadingWhitespaceCount(line);

    if (trimmed === "") {
      continue;
    }

    if (indent <= 2) {
      break;
    }

    if (trimmed.startsWith("- ")) {
      values.push(trimmed.slice(2).trim());
    }
  }

  return values;
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
    blockAppended: [],
    shimRefreshed: [],
  };

  for (const [relativePath, content] of Object.entries(templates)) {
    writeTemplateFile(rootDir, relativePath, content, options, summary);
  }

  for (const agentId of options.agentsList) {
    writeAgentShim(rootDir, agentId, options, summary);
  }

  writeInstalledManifest(rootDir, options, summary);

  const action = options.dryRun ? "Dry run complete" : "AI Project OS initialized";
  console.log(`${action} in ${rootDir}`);
  console.log(`Document language: ${options.language}`);
  console.log(`Agent shims: ${options.agentsList.length > 0 ? options.agentsList.join(", ") : "(none)"}`);

  printList("Created", summary.created);
  printList("Overwritten", summary.overwritten);
  printList("Skipped existing files", summary.skipped);
  printList("Appended agent block to", summary.blockAppended);
  printList("Refreshed agent shim", summary.shimRefreshed);

  if (summary.skipped.length > 0 && !options.force) {
    console.log("\nRun again with --force to overwrite existing files.");
  }

  console.log("\nNext steps:");
  console.log("  1. Fill in .project/project-context.md");
  console.log("  2. Ask your AI agent to read prompts/project-os.md");
  console.log("  3. Keep docs updated only when project state changes");
}

function writeInstalledManifest(rootDir, options, summary) {
  const installedFiles = [...summary.created, ...summary.overwritten];
  const configPath = path.join(rootDir, ".project/config.yaml");
  assertNoSymlinkInPath(rootDir, ".project/config.yaml");

  if (
    options.dryRun ||
    installedFiles.length === 0 ||
    !installedFiles.includes(".project/config.yaml")
  ) {
    return;
  }

  const config = buildConfig(options.language, "", installedFiles, options.agentsList);
  fs.writeFileSync(configPath, config, { encoding: "utf8", flag: "w" });
}

function updateProject(options) {
  const rootDir = ensureTargetDirectory(options.targetDir, options);
  const templates = buildTemplates(options.language);
  const backupOptions = options.dryRun ? {} : { backupPrefix: "update" };
  const summary = {
    created: [],
    overwritten: [],
    skipped: [],
    backedUp: [],
    blockAppended: [],
    shimRefreshed: [],
  };

  const configPath = path.join(rootDir, ".project/config.yaml");
  const existingConfig = fs.existsSync(configPath)
    ? fs.readFileSync(configPath, "utf8")
    : "";
  const configAgents = readConfigList(existingConfig, "agents");
  const agentsList = options.agentsExplicit
    ? options.agentsList
    : configAgents.length > 0
      ? configAgents
      : DEFAULT_AGENTS;

  mergeConfig(rootDir, { ...options, ...backupOptions }, summary);

  for (const relativePath of SYSTEM_TEMPLATE_PATHS) {
    writeTemplateFile(
      rootDir,
      relativePath,
      templates[relativePath],
      { ...options, force: true, ...backupOptions },
      summary
    );
  }

  for (const agentId of agentsList) {
    writeAgentShim(rootDir, agentId, { ...options, ...backupOptions }, summary);
  }

  const action = options.dryRun ? "Dry run complete" : "AI Project OS updated";
  console.log(`${action} in ${rootDir}`);
  console.log(`Project OS version: ${VERSION}`);
  console.log(`Agent shims: ${agentsList.length > 0 ? agentsList.join(", ") : "(none)"}`);

  printList("Created", summary.created);
  printList("Updated", summary.overwritten);
  printList("Appended agent block to", summary.blockAppended);
  printList("Refreshed agent shim", summary.shimRefreshed);
  printList("Backed up", summary.backedUp);
  printList("Skipped", summary.skipped);

  if (summary.backedUp.length > 0) {
    console.log(`\nBackups written to ${summary.backupRoot}`);
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

function uninstallProject(options) {
  const rootDir = ensureTargetDirectory(options.targetDir, options);
  const configPath = path.join(rootDir, ".project/config.yaml");
  assertNoSymlinkInPath(rootDir, ".project/config.yaml");
  const existingConfig = fs.existsSync(configPath)
    ? fs.readFileSync(configPath, "utf8")
    : "";
  const language = options.languageExplicit
    ? options.language
    : readConfigValue(existingConfig, "doc_language") || options.language;
  const agentsList = readConfigList(existingConfig, "agents");
  const removableFilePaths = Object.keys(buildTemplates(language));
  const installedFiles = new Set(readConfigList(existingConfig, "installed_files"));
  const removablePathSet = new Set([
    ...removableFilePaths,
    ...REMOVABLE_DIRECTORY_PATHS,
  ]);
  const ownershipTemplates = templatesForOwnership(language, installedFiles, agentsList);
  const backupOptions = options.dryRun ? {} : { backupPrefix: "uninstall" };
  const summary = {
    removed: [],
    missing: [],
    backedUp: [],
    keptDirectories: [],
    removedDirectories: [],
    keptModified: [],
    shimMissing: [],
    shimKept: [],
    shimRemovedFile: [],
    shimRemovedBlock: [],
  };

  for (const relativePath of removableFilePaths) {
    removeProjectFile(
      rootDir,
      relativePath,
      ownershipTemplates[relativePath],
      installedFiles,
      { ...options, ...backupOptions },
      summary
    );
  }

  for (const agentId of agentsList) {
    removeAgentShim(rootDir, agentId, { ...options, ...backupOptions }, summary);
  }

  for (const relativePath of REMOVABLE_DIRECTORY_PATHS) {
    removeDirectoryIfEmpty(rootDir, relativePath, options, summary, removablePathSet);
  }

  const action = options.dryRun ? "Dry run complete" : "AI Project OS uninstalled";
  console.log(`${action} in ${rootDir}`);

  printList("Removed", summary.removed);
  printList("Missing", summary.missing);
  printList("Backed up", summary.backedUp);
  printList("Kept modified or unowned files", summary.keptModified);
  printList("Removed agent shim files", summary.shimRemovedFile);
  printList("Removed agent blocks (kept rest)", summary.shimRemovedBlock);
  printList("Missing agent shims", summary.shimMissing);
  printList("Kept agent shims (no block)", summary.shimKept);
  printList("Removed empty directories", summary.removedDirectories);
  printList("Kept non-empty directories", summary.keptDirectories);

  if (summary.backedUp.length > 0) {
    console.log(`\nBackups written to ${summary.backupRoot}`);
  }
}

function removeProjectFile(rootDir, relativePath, templateContent, installedFiles, options, summary) {
  const targetPath = path.join(rootDir, relativePath);
  const stat = lstatIfExists(targetPath);

  if (!stat) {
    summary.missing.push(relativePath);
    return;
  }

  assertNoSymlinkInPath(rootDir, relativePath);

  if (!stat.isFile()) {
    throw new Error(`Refusing to remove non-file path: ${targetPath}`);
  }

  if (
    !options.force &&
    (!installedFiles.has(relativePath) ||
      !fileMatchesContent(targetPath, templateContent))
  ) {
    summary.keptModified.push(relativePath);
    return;
  }

  if (options.dryRun) {
    summary.removed.push(relativePath);
    return;
  }

  if (options.backupPrefix) {
    backupExistingFile(rootDir, relativePath, options, summary);
  }

  fs.unlinkSync(targetPath);
  summary.removed.push(relativePath);
}

function templatesForOwnership(language, installedFiles, agents = DEFAULT_AGENTS) {
  const templates = buildTemplates(language);
  templates[".project/config.yaml"] = buildConfig(language, "", [...installedFiles], agents);
  return templates;
}

function fileMatchesContent(targetPath, expectedContent) {
  if (expectedContent === undefined) {
    return false;
  }

  return fs.readFileSync(targetPath, "utf8") === expectedContent;
}

function removeDirectoryIfEmpty(rootDir, relativePath, options, summary, removablePathSet) {
  const targetPath = path.join(rootDir, relativePath);
  const stat = lstatIfExists(targetPath);

  if (!stat) {
    return;
  }

  assertNoSymlinkInPath(rootDir, relativePath);

  if (!stat.isDirectory()) {
    summary.keptDirectories.push(relativePath);
    return;
  }

  const remainingEntries = fs.readdirSync(targetPath).filter((entry) => {
    const entryRelativePath = path.posix.join(relativePath, entry);
    if (summary.keptDirectories.includes(entryRelativePath)) {
      return true;
    }

    if (summary.keptModified.includes(entryRelativePath)) {
      return true;
    }

    return !removablePathSet.has(entryRelativePath);
  });

  if (remainingEntries.length > 0) {
    summary.keptDirectories.push(relativePath);
    return;
  }

  if (options.dryRun) {
    summary.removedDirectories.push(relativePath);
    return;
  }

  fs.rmdirSync(targetPath);
  summary.removedDirectories.push(relativePath);
}

function lstatIfExists(targetPath) {
  try {
    return fs.lstatSync(targetPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

function timestampForBackup() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z");
}

function createBackupRoot(rootDir, prefix) {
  const backupParent = path.join(rootDir, ".project-os-backups");
  assertNoSymlinkInPath(rootDir, ".project-os-backups");
  fs.mkdirSync(backupParent, { recursive: true });
  return fs.mkdtempSync(path.join(backupParent, `${prefix}-${timestampForBackup()}-`));
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
    } else if (options.command === "uninstall") {
      uninstallProject(options);
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
