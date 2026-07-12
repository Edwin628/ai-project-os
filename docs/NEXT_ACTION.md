# Next Action

Keep this file limited to the current 1-3 actionable next steps.

## Current Next Steps

1. 将 `ai-project-os@0.5.0` 发布到 npm（官方 registry + granular token），并 `npx ai-project-os@0.5.0 init --dry-run` 端到端验证 RESEARCH 规则已注入。
2. 为 `--agents` marker block 增加 CLI 自动化测试覆盖（append/replace/remove、各 AI 工具 shim 生成），并验证各 AI 工具实际加载 shim 的行为。
3. 在新的 Claude Code 会话验证 SessionStart hook 提醒是否注入（本会话启动时 hook 尚未配置，不触发）。

## Blockers

- 无阻塞。

## Notes

- `v0.5.0` 已开发完成（RESEARCH 更新触发规则），待发布；`v0.4.0` 已发布到 npm。
- 曾暴露的 npm granular token（`npm_a161…`）仍在 npmjs.com 待吊销（仅能网页操作，等用户处理）。
- 发布走官方 registry（`--registry https://registry.npmjs.org`），全局淘宝镜像只用于下载。
- `npx ai-project-os@<ver> --version` 会被 npx 吞掉 `--version`；实际用子命令（`init` / `--help`）。
- `--agents` 默认 claude,codex；支持 all/none/逗号列表；已有配置文件追加 marker block 不覆盖。
