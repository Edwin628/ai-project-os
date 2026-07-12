# Status

## Current State

已实现 AI Project OS 一键初始化器、升级器和卸载器，可通过 Node CLI 或 versioned install.sh 将项目管理文件注入到已有项目、更新系统托管文件，或安全移除嵌入文件。v0.3.0 与 v0.4.0 均已发布到 npm；本仓库已用 `update --agents claude` 接入 Claude Code 工作流（CLAUDE.md + SessionStart hook）并 dogfood 升级。v0.5.0 为 `docs/RESEARCH/` 补上明确更新触发条件（技术发现/外部参考/调研结论），待发布。

## Current Stage

`v0.5.0` 已开发完成（新增 RESEARCH 更新触发规则，同步 ai-rules/workflow/prompts 及内置模板），待发布到 npm；`v0.4.0`（含 `--agents` AI 工具 shim）已发布。本仓库已接入 Claude Code 工作流，规则从纸面变为自动加载。

## Recently Completed

- 新增 `ai-project-os` npm CLI 入口，支持 `init`、`--language`、`--dry-run`、`--force`。
- 新增 `install.sh`，支持通过 GitHub 版本 tag 一键安装。
- 加固初始化器：默认不覆盖已有文件，限制写入边界，拒绝 symlink 覆盖，并安全写入语言配置。
- 同步 README、workflow 和 research 文档模板。
- 新增 `update` 命令，只更新系统托管文件并保护项目状态文档。
- 初始化配置新增 `project_os.version` 和 `managed_files`。
- `update` 覆盖系统文件前会写入 `.project-os-backups/` 备份，并保留配置中的未知字段。
- 新增 `uninstall` 命令，支持预览、备份、按归属安全删除嵌入文件，并通过 `--force` 强制删除修改过或未归属的固定路径文件。
- 补充 package.json 发布字段（files/engines/repository/bugs/homepage/author/publishConfig）并将 npm 安装说明写入 README。
- 将 `ai-project-os@0.3.0` 发布到 npm 官方 registry，并端到端验证 install / .bin 链接 / npx 路径。
- 实现 `v0.4.0` `--agents` 功能：AGENTS 注册表（claude/codex/cursor/copilot/gemini/cline/windsurf）、marker block 块级 init/update/uninstall、薄壳指针不复制规则；本地 dry-run 全场景测试通过。
- 将 `ai-project-os@0.4.0` 发布到 npm（tag `v0.4.0` + publish），`npx ai-project-os@0.4.0 init --dry-run --agents all` 端到端验证通过。
- 本仓库 dogfood：`update --agents claude` 生成 `CLAUDE.md`（marker block 指向 `.project/ai-rules.md`）+ 升级 config 到 0.4.0；配 `.claude/settings.json` SessionStart hook 提醒读 ai-rules.md；加 `.gitignore`。
- 为 `docs/RESEARCH/` 补充更新触发条件（技术发现/外部参考/调研结论），同步 `.project/ai-rules.md`、`.project/workflow.md`、`prompts/project-os.md` 及 `bin/ai-project-os.js` 内置模板，VERSION 与 package.json bump 到 0.5.0，本仓库 config 同步到 0.5.0。

## Active Risks or Blockers

- 发布用的 npm granular access token（`npm_a161…`）曾在对话中暴露，需在 npmjs.com 吊销。
- SessionStart hook 在新会话尚未验证（本会话启动时 hook 还未配置）。
- npm v10 在无 package.json 的空目录裸 `npm install <pkg>` 有边缘行为（报告成功但文件不落地），需在文档中提示用户使用 `npx` 或在已有项目中安装。
- 公开安装命令仍属于远程代码执行路径，后续发布时应优先使用固定版本、校验和。

## Last Updated

2026-07-12
