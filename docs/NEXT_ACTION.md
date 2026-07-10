# Next Action

Keep this file limited to the current 1-3 actionable next steps.

## Current Next Steps

1. 在 https://www.npmjs.com/settings/edwin11pg/tokens 吊销曾在对话中暴露的 granular token（`npm_a161…`）。
2. 规划下一个版本（如 v0.4.0）：bump version + 推送 git tag + 用 granular token `npm publish --registry https://registry.npmjs.org`，发完即吊销。

## Blockers

- 无强阻塞；吊销 token 仅能由仓库 owner 在 npmjs.com 网页操作。

## Notes

- 发布走官方 registry（`--registry https://registry.npmjs.org`），全局淘宝镜像只用于下载。
- `npx ai-project-os@<ver> --version` 会被 npx 吞掉 `--version`；实际用子命令（`init` / `--help`）。
