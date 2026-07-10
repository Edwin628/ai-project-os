# Backlog

Use this file for tasks that are known but not currently the next action.

## Open Tasks

- 为 release 产物增加 SHA256 校验或签名说明。
- 增加自动化测试覆盖 CLI 参数解析、覆盖策略和 symlink 防护。
- 增加自动化测试覆盖 --agents marker block 的 append/replace/remove 与各 AI 工具 shim 生成；验证各 AI 工具（Claude/Codex/Cursor/Copilot 等）实际加载 shim 的行为。

## Ideas

- 增加 `templates/` 外部模板目录，让 CLI 模板内容更容易维护。
- 增加 `--profile` 参数，支持不同项目管理模板组合。
- 增加 Windows PowerShell 安装入口。
- 在 README 中提示 npm v10 空目录裸 `npm install <pkg>` 的边缘行为，建议使用 `npx` 或在已有项目中安装。

## Deferred

- Notion 同步或展示能力暂不实现，保持本地 Markdown 为主。
