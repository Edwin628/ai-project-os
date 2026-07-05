# Next Action

Keep this file limited to the current 1-3 actionable next steps.

## Current Next Steps

1. 检查本次 `v0.3.0` uninstall 能力变更，并提交代码。
2. 提交完成后创建并推送 `v0.3.0` Git tag。
3. 在干净项目目录中测试公开 `init` / `update` / `uninstall` URL。

## Blockers

- 版本化安装 URL 依赖 GitHub 上存在 `v0.3.0` tag。

## Notes

- 默认安装路径保持版本化；`main` 只用于开发测试。
- 发布后需要验证 `curl ... | sh -s -- uninstall --dry-run` 和真实卸载路径。
