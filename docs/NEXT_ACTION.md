# Next Action

Keep this file limited to the current 1-3 actionable next steps.

## Current Next Steps

1. 为 `--agents` marker block 增加 CLI 自动化测试覆盖（append/replace/remove、各 AI 工具 shim 生成），并验证各 AI 工具（Claude/Codex/Cursor 等）实际加载 shim 的行为。
2. 吊销曾暴露的 npm granular token（`npm_a161…`，仅能在 npmjs.com 网页操作）。

## Blockers

- 无阻塞。

## Notes

- `v0.4.0` 已发布到 npm（`ai-project-os@0.4.0`），npx 端到端验证通过（`--agents all` 生成 7 个 shim）。
- 发布走官方 registry（`--registry https://registry.npmjs.org`），全局淘宝镜像只用于下载。
- `npx ai-project-os@<ver> --version` 会被 npx 吞掉 `--version`；实际用子命令（`init` / `--help`）。
- `--agents` 默认 claude,codex；支持 all/none/逗号列表；已有配置文件追加 marker block 不覆盖。
