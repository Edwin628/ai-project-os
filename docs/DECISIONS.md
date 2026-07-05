# Decisions

This file is append-only. Do not edit or remove old decisions.

## Decision Log

### 2026-07-05 - Provide a one-command initializer

- Decision: 将 AI Project OS 做成可注入到已有项目的一键初始化器，而不是要求用户复制整个仓库。
- Context: 目标项目本身可能已经是 Git 项目，直接复制仓库不够优雅，也容易混入无关 Git 历史或模板源码。
- Consequences: 新增 Node CLI、`install.sh` 和 versioned install URL；后续发布时需要维护版本 tag，并优先使用固定版本安装路径。
- Supersedes: None

### 2026-07-05 - Add Project OS update path

- Decision: 新增 `update` 命令，让已初始化项目可以升级 Project OS 系统文件。
- Context: 旧项目初始化后会持有模板拷贝，后续 Project OS 更新不会自动同步。
- Consequences: 初始化配置记录 `project_os.version` 和 `managed_files`；`update` 只覆盖系统托管文件，项目状态文档不被触碰；覆盖前会写入 `.project-os-backups/` 备份。
- Supersedes: None

### 2026-07-06 - Add Project OS uninstall path

- Decision: 新增 `uninstall` 命令，让用户可以一键移除 AI Project OS 嵌入文件。
- Context: 项目可能只是临时试用 Project OS，或后续不再希望保留 `.project/`、`docs/`、`prompts/` 中的管理文件。
- Consequences: 初始化时记录 `installed_files`；默认卸载只删除已归属且未修改的文件，并先备份；修改过或未归属的同名文件默认保留，`--force` 才删除。
- Supersedes: None
