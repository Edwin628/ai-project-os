# Next Action

Keep this file limited to the current 1-3 actionable next steps.

## Current Next Steps

1. 在 https://www.npmjs.com/settings/edwin11pg/tokens 吊销曾在对话中暴露的 granular token（`npm_a161…`）。
2. 给 `v0.4.0` 打 git tag 并 push，再用 granular token `npm publish --registry https://registry.npmjs.org`，发完即吊销；之后 `npx ai-project-os@0.4.0 init --dry-run` 端到端验证 `--agents`。

## Blockers

- 无强阻塞；吊销 token 与 npm publish 仅能由仓库 owner 在 npmjs.com 网页 / 终端操作。

## Notes

- 发布走官方 registry（`--registry https://registry.npmjs.org`），全局淘宝镜像只用于下载。
- `npx ai-project-os@<ver> --version` 会被 npx 吞掉 `--version`；实际用子命令（`init` / `--help`）。
- `--agents` 默认 claude,codex；支持 all/none/逗号列表；已有配置文件追加 marker block 不覆盖。
