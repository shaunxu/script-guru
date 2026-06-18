# AGENTS.md

## 重要指令
- **所有对话必须使用中文**

## 仓库概述
- PingCode 的脚本运行器 (script-guru)
- 混合后端 + Angular 前端架构
- 后端：TypeScript + QuickJS 用于脚本执行
- 前端：位于 `web/hello-world/` 的 Angular 21 应用

## 关键命令
| 命令 | 用途 |
|---------|---------|
| `npm run build` | 构建后端 + Angular 前端 |
| `npm run build-web` | 仅构建 Angular 前端 |
| `npm run test` | 运行 bootstrap 测试脚本 |
| `npm run serve` | 启动 Angular 开发服务器 |

## 架构
- 后端入口点：`src/index.ts` → 导出 resolver
- 核心逻辑：`src/resolvers/index.ts` - "greeting" + "run" 解析器
- QuickJS 虚拟机执行用户脚本，提供自定义全局变量：`console`、`wait`、`requestApi`
- 前端：`web/hello-world/`（Angular 应用构建到 `web/hello-world/dist`）
- 应用清单：`manifest.yaml` - PingCode 应用配置

## 开发说明
- TypeScript 配置：`tsconfig.json`（严格模式，nodenext 模块解析）
- 测试脚本：`scripts/bootstrap.ts` - 调用 "run" 解析器
- Prettier 配置位于 `web/hello-world/package.json`（singleQuote: true, printWidth: 100）
