# ViewRig v0.2 API Docs Workflow

日期：2026-06-21  
状态：R3 TypeDoc foundation

## 1. 目标

v0.2 使用 TypeDoc 生成 public API documentation。R3 先覆盖 `@viewrig/core`，R4 再扩展到 `@viewrig/testing` 和 `@viewrig/adapter-three`。

## 2. 命令

```powershell
pnpm docs:api
```

当前配置读取：

```txt
typedoc.json
packages/core/src/index.ts
packages/core/tsconfig.json
```

## 3. 输出策略

TypeDoc HTML 输出到：

```txt
generated-docs/api/core
```

`generated-docs/` 被 `.gitignore` 忽略。生成产物用于本地检查、发布预览或 CI artifact，不进入源码提交。需要提交的是配置、脚本和文档策略，而不是生成后的 HTML。

## 4. 边界

- TypeDoc 只读取 public package entrypoint。
- Core 仍不依赖 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 或宿主 scene graph。
- API docs 不替代 `api-reports/*.api.md`，两者分别承担 documentation 和 public export drift guard。
