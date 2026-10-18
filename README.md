<div align="center">

<img src="./apps/web/public/logo.webp" alt="logo" style="width: 128px; height: 128px;" >

</div>
<div align="center">

# SealCV

SealCV 是一款专注内容本身的现代 Markdown 简历生成器，支持实时预览、纸张感排版、智能一页和多页 PDF 导出。<br />Build your resume, deploy your future 💼✨
</div>


## 主要特色

- 🎯 **实时预览编辑**：内置 Monaco Markdown 编辑器，修改立刻同步到预览 CV 页面，可在独立的 CSS 面板中加载自定义样式美化简历。
- 🧱 **纸张感排版**：内建 A4、A3、自由等多个尺寸，可调边距与智能一页布局，让打印/导出都严谨如印刷稿。
- 📸 **照片与图标支持**：拖拽头像、微调位置； `icon=<iconify>` 语法自动渲染图标，轻松丰富内容表现力。
- 📄 **多页 PDF 导出**：每页使用 SnapDOM + jsPDF 转成高清 Canvas，再打包为兼容多页 PDF，适合投递和归档。
- 💾 **本地持久化**：内容与自定义样式保存在 localStorage，SPA 跳转或刷新也能保持状态。
- 📱 **移动端适配**：手机端使用编辑/预览双 Tab 加底部设置抽屉，平板与桌面端自动切换分栏布局。

## 快速开始

```bash
pnpm install
pnpm web:dev
```

访问 `http://localhost:12800/cv` 即可进入 SealCV 编辑器，拖拽头像、写 Markdown、实时预览并单击导出 PDF。

## 部署指南

1. 生成生产资源：

	```bash
	pnpm web:build
	```
2. 本地预览构建：

	```bash
	pnpm -F ./apps/web start
	```
3. 部署到静态平台（如 Vercel/Netlify）：确保构建命令为 `pnpm web:build`，输出目录为 `apps/web/.next`，并在部署前安装依赖。

## 项目结构

这是一个 pnpm monorepo，业务代码位于 `apps/web/`：

```
apps/web/
  app/            # App Router 页面：首页与 /cv 编辑器
  components/cv/  # 编辑器、预览画布、控制面板等
  components/ui/  # shadcn/ui 组件
  hooks/          # 本地存储、媒体查询等
  lib/            # Markdown 扩展与工具函数
```

## 反馈与贡献

- 使用 Issues 报告 BUG 或提出新功能，欢迎附带可重现示例。
- Fork 后提交 PR，技术栈为 Next.js + TypeScript + Tailwind CSS + shadcn/ui，文档与组件欢迎补充。
- 检查 `apps/web/lib/marked-extensions.ts` 即可添加自己的 Markdown 扩展语法。

## 许可与鸣谢

SealCV 遵循 MIT 协议。感谢下列开源项目与社区的支持：

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [SnapDOM](https://github.com/zumer/snapdom)
- [jsPDF](https://github.com/parallax/jsPDF)

感谢所有开源贡献者与用户的支持 ❤️
