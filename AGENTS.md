# AGENTS.md

## 重要指令
- **所有对话必须使用中文**

## 仓库概述
- PingCode 的脚本运行器 (script-guru)
- 混合后端 + Angular 前端架构
- 后端：TypeScript + QuickJS 用于脚本执行
- 前端：`web/` 下的 npm workspaces monorepo（Angular 21）

## 关键命令
| 命令 | 用途 |
|---------|---------|
| `npm run build` | 构建后端 + 所有 Angular 前端 |
| `npm run build-web` | 构建 shared 库 + 所有 Angular 前端 |
| `npm run build-shared` | 仅构建 `@script-guru/shared` 共享库 |
| `npm run test` | 运行 bootstrap 测试脚本 |
| `npm run serve-admin-console` | 启动 admin-console 开发服务器 (端口 3102) |
| `npm run serve-admin` | 启动 admin 开发服务器 (端口 3100) |
| `npm run serve-tiles` | 启动 tiles 开发服务器 (端口 3101) |

## 架构
- 后端入口点：`src/index.ts` → 导出 resolver
- 核心逻辑：`src/resolvers/index.ts` - "greeting" + "run" 解析器
- QuickJS 虚拟机执行用户脚本，提供自定义全局变量：`console`、`wait`、`requestApi`
- 前端 monorepo（`web/`，npm workspaces）：
  - `web/shared/` — Angular 组件库 `@script-guru/shared`（ng-packagr 构建，产物在 `dist/`）
  - `web/admin/` — 完整管理后台（console / snippets / automations / tiles）
  - `web/admin-console/` — 仅脚本控制台的独立应用
  - `web/tiles/` — Tiles 独立应用
- 共享组件通过 `import { CodeEditor } from '@script-guru/shared'` 引用
- 应用清单：`manifest.yaml` - PingCode 应用配置

## 开发说明
- TypeScript 配置：`tsconfig.json`（严格模式，nodenext 模块解析）
- 前端依赖统一在 `web/` 根目录通过 `npm install` 安装（npm workspaces）
- 修改 `web/shared/` 后需运行 `npm run build-shared` 重新构建库
- 测试脚本：`scripts/bootstrap.ts` - 调用 "run" 解析器
- Prettier 配置位于各 Angular 项目的 `package.json`（singleQuote: true, printWidth: 100）
