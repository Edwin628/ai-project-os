# Status

## Current State

已实现 AI Project OS 一键初始化器、升级器和卸载器，可通过 Node CLI 或 versioned install.sh 将项目管理文件注入到已有项目、更新系统托管文件，或安全移除嵌入文件。

## Current Stage

`v0.3.0` 功能开发完成，等待提交、发布版本 tag 并进行公开 URL 验证。

## Recently Completed

- 新增 `ai-project-os` npm CLI 入口，支持 `init`、`--language`、`--dry-run`、`--force`。
- 新增 `install.sh`，支持通过 GitHub 版本 tag 一键安装。
- 加固初始化器：默认不覆盖已有文件，限制写入边界，拒绝 symlink 覆盖，并安全写入语言配置。
- 同步 README、workflow 和 research 文档模板。
- 新增 `update` 命令，只更新系统托管文件并保护项目状态文档。
- 初始化配置新增 `project_os.version` 和 `managed_files`。
- `update` 覆盖系统文件前会写入 `.project-os-backups/` 备份，并保留配置中的未知字段。
- 新增 `uninstall` 命令，支持预览、备份、按归属安全删除嵌入文件，并通过 `--force` 强制删除修改过或未归属的固定路径文件。

## Active Risks or Blockers

- 需要创建并推送 `v0.3.0` Git tag，否则 README 中的 versioned install URL 暂不可用。
- 公开安装命令仍属于远程代码执行路径，后续发布时应优先使用固定版本、校验和或正式 npm 包。

## Last Updated

2026-07-06
