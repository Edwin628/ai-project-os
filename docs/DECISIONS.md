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

### 2026-07-11 - Publish to npm official registry

- Decision: 将 ai-project-os 发布到 npm 官方 registry（registry.npmjs.org），支持 `npx ai-project-os@0.3.0`；发布使用 granular access token（勾选 bypass 2FA），发完即吊销。
- Context: 用户全局 registry 是淘宝镜像（registry.npmmirror.com，只读，不能登录/发布）；npm 账号开启 2FA 但未配 TOTP app，OTP 路径走不通。files 白名单只含 bin/install.sh/README，不含项目状态文档（docs/、.project/）以避免泄露本仓库内部状态。
- Consequences: package.json 补充 files/engines/repository/bugs/homepage/author/publishConfig；每次发版需 `--registry https://registry.npmjs.org` + granular token；淘宝镜像会自动同步官方，国内用户走镜像也能安装。
- Supersedes: None

### 2026-07-11 - Add --agents AI tool shims (v0.4.0)

- Decision: init 生成"薄壳指针"shim 文件（默认 `CLAUDE.md` + `AGENTS.md`），用 marker block（`<!-- BEGIN/END ai-project-os -->`）块级管理；规则本体只在 `.project/ai-rules.md` 不复制；`--agents` 可选 claude/codex/cursor/copilot/gemini/cline/windsurf/all/none。
- Context: 不同 AI 工具读不同配置文件（CLAUDE.md/AGENTS.md/.cursor/rules 等），单一 `CLAUDE.md` 不够 general；已有配置文件不能覆盖；规则复制多份会导致 update 同步噩梦。
- Consequences: init 对已有 shim 文件追加 marker block 不覆盖；update 只刷块内；uninstall 只移除块（仅块文件删整文件，有用户内容保留剩余）；config.yaml 加 `agents` 字段；shim 父目录（.cursor/、.github/）不纳入 removable 目录避免误删用户配置。
- Supersedes: None

### 2026-07-11 - Wire ai-rules into Claude Code (CLAUDE.md + SessionStart hook)

- Decision: 本仓库用 `CLAUDE.md` 作正式规则入口（`update --agents claude` 生成，marker block 指向 `.project/ai-rules.md`），`.claude/settings.json` 的 SessionStart hook 只 `printf` 一句提醒读 ai-rules.md，不注入全文。
- Context: 仓库缺 CLAUDE.md/hook，规则是纸面规则，AI 不自动加载导致漏更新 docs；hook 注入全文会浪费上下文，一句提醒 + CLAUDE.md 入口更轻量。
- Consequences: 本仓库 dogfood 升级到 0.4.0 + 加 `agents: [claude]`；新会话启动时 hook 提醒读 ai-rules.md；`.project-os-backups/` 与 `.claude/settings.local.json` 加入 `.gitignore`。
- Supersedes: None

### 2026-07-12 - Add RESEARCH update rule to ai-rules (v0.5.0)

- Decision: 在 `ai-rules.md` 的 Required Updates 与 AI Output Format、`workflow.md`、`prompts/project-os.md` 中为 `docs/RESEARCH/` 增加明确更新触发条件——当产生新的技术发现、外部参考资料或调研结论时写入 RESEARCH。
- Context: RESEARCH 目录此前只有占位 README 一句话，没有任何触发条件，AI 在「项目状态变更」时不会自动维护它，属于规则缺口；用户追问后确认补齐。
- Consequences: RESEARCH 从纯自由区升级为有生命周期的文档；实文件与 `bin/ai-project-os.js` 内置模板同步更新；VERSION 与 package.json bump 到 0.5.0，本仓库 config 同步到 0.5.0；RESEARCH 仍为 protected 文件，`update` 不触碰已有内容；已装项目需 `update` 才能拿到新规则。
- Supersedes: None
