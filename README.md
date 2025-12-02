<div align="center">

<img src="./public/logo.webp" alt="logo" style="width: 128px; height: 128px;" >

</div>
<div align="center">

# SealCV

SealCV 是一款专注内容本身的现代 Markdown 简历生成器，支持实时预览、纸张感排版、智能一页和多页 PDF 导出。<br />Build your resume, deploy your future 💼✨
</div>


## 主要特色

- 🎯 **实时预览编辑**：内置 Markdown 编辑器，修改立刻同步到预览 CV 页面，可加载自定义 CSS 美化简历。
- 🧱 **纸张感排版**：内建 A4、A3、自由等多个尺寸，可调边距与智能一页布局，让打印/导出都严谨如印刷稿。
- 📸 **照片与图标支持**：拖拽头像、微调位置； `icon=<iconify>` 语法自动渲染图标，轻松丰富内容表现力。
- 📄 **多页 PDF 导出**：每页使用 SnapDOM + jsPDF 转成高清 Canvas，再打包为兼容多页 PDF，适合投递和归档。
- 💾 **本地持久化**：内容与自定义样式保存在 localStorage，SPA 跳转或刷新也能保持状态。

## 快速开始

```powershell
pnpm install
pnpm run dev
```

访问 `http://localhost:3000/cv` 即可进入 SealCV 编辑器，拖拽头像、写 Markdown、实时预览并单击导出 PDF。

## 部署指南

1. 生成生产资源：

	```powershell
	pnpm run build
	```
2. 本地预览构建：

	```powershell
	pnpm run preview
	```
3. 部署到静态平台（如 Vercel/Netlify）：确保命令为 `pnpm run build`，输出目录为 `.output`，并在部署前安装依赖。

## 反馈与贡献

- 使用 Issues 报告 BUG 或提出新功能，欢迎附带可重现示例。
- Fork 后提交 PR，代码风格采用 Vue 3 + TypeScript + ShadCN UI，文档与组件欢迎补充。
- 检查 `app/lib/markedExtensions.ts` 即可添加自己的 Markdown 扩展语法。

## 许可与鸣谢

SealCV 遵循 MIT 协议。感谢下列开源项目与社区的支持：

- [Vue 3](https://vuejs.org/)
- [Nuxt.js](https://nuxt.com/)
- [shadcn/ui](https://ui.shadcn.com/vue)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [SnapDOM](https://github.com/zumer/snapdom)
- [jsPDF](https://github.com/parallax/jsPDF)

感谢所有开源贡献者与用户的支持 ❤️
