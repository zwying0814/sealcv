# SealCV

一款现代的简历生成器，具备实时 Markdown 编辑、智能一页和多页 PDF 导出功能。

A modern resume generator with real-time Markdown editing, smart one-page and multi-page PDF export features.

## 主要特色

- **实时预览**：内置 Markdown 编辑器，修改即在 CV 样式页中反映，支持自定义 CSS。
- **纸张感设计**：内置多种纸张尺寸（A4、A3、自由尺寸等），带间距控制和智能一页布局，方便打印与导出。
- **照片/图标支持**：拖拽头像，编辑照片位置；支持 `icon=<iconify>` 语法自动渲染图标与内容。
- **多页 PDF 导出**：按页面分割内容，使用 SnapDOM + jsPDF 将每页转成 Canvas 再打包成兼容多页的 PDF 文件。
- **本地持久化**：编辑内容与自定义 CSS 保存在 localStorage 中，SPA 跳转也能保留状态。

## 快速开始

```powershell
pnpm install
pnpm run dev
```

## 部署

1. 构建（生成生产静态资源）：
	 ```powershell
	 pnpm run build
	 ```
2. 启动服务（用于预览）：
	 ```powershell
	 pnpm run preview
	 ```
3. 若部署到静态站点（如 Vercel/Netlify），确保部署命令为 `pnpm run build`，输出目录默认为 `.output`，且部署前安装依赖即可。

## 反馈与贡献

- 使用 Issues 报告 BUG 或提出新功能。
- 欢迎 Fork 后提交 PR，代码风格基于 Vue 3 + TypeScript + ShadCN UI。
- 参考 `app/lib/markedExtensions.ts` 可扩展 Markdown 语法。

## 许可与感谢

保留 MIT/其他许可说明（如果已有可替换）。本项目借助 [Vue 3](https://vuejs.org/)、[Nuxt.js](https://nuxt.com)、[shadcn/ui](https://ui.shadcn.com/vue)、[Monaco Editor](https://microsoft.github.io/monaco-editor/)、[SnapDOM](https://github.com/zumer/snapdom) 与 [jsPDF](https://github.com/parallax/jsPDF)。
