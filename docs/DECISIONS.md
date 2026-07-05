# Decisions

This file is append-only. Do not edit or remove old decisions.

## Decision Log

### 2026-07-05 - Provide a one-command initializer

- Decision: 将 AI Project OS 做成可注入到已有项目的一键初始化器，而不是要求用户复制整个仓库。
- Context: 目标项目本身可能已经是 Git 项目，直接复制仓库不够优雅，也容易混入无关 Git 历史或模板源码。
- Consequences: 新增 Node CLI、`install.sh` 和 versioned install URL；后续发布时需要维护版本 tag，并优先使用固定版本安装路径。
- Supersedes: None
