<div align="center">

<img src="./public/logo.webp" alt="logo" style="width: 128px; height: 128px;" >

</div>
<div align="center">

# SealCV

SealCV is a modern Markdown resume generator focused on the content itself, supporting real-time preview, paper-like layout, and intelligent one-page and multi-page PDF export.<br />Build your resume, deploy your future 💼✨
</div>


## Key Features

- 🎯 **Real-time Preview Editing**: Built-in Markdown editor, modifications are instantly synced to the CV preview page, with support for loading custom CSS to beautify your resume.
- 🧱 **Paper-like Layout**: Built-in A4, A3, and free-form sizes, with adjustable margins and smart single-page layout, ensuring printing and exports are as precise as print-ready documents.
- 📸 **Photo and Icon Support**: Drag-and-drop avatars with fine-tune positioning; `icon=<iconify>` syntax automatically renders icons, effortlessly enriching content expressiveness.
- 📄 **Multi-page PDF Export**: Each page is converted to high-definition Canvas using SnapDOM + jsPDF, then packaged into a compatible multi-page PDF, suitable for submission and archiving.
- 💾 **Local Persistence**: Content and custom styles are stored in localStorage, maintaining state during SPA navigation or refreshes.

## Quick Start

```powershell
pnpm install
pnpm run dev
```

Visit `http://localhost:3000/cv` to enter the SealCV editor, drag to upload your avatar, write Markdown, preview in real time, and export PDF with a single click.

## Deployment Guide

1. Generate production assets:

	```powershell
	pnpm run build
	```
2. Preview the build locally:

	```powershell
	pnpm run preview
	```
3. Deploy to a static platform (e.g., Vercel/Netlify): Ensure the build command is `pnpm run build`, the output directory is `.output`, and install dependencies before deployment.

## Feedback and Contributions

- Report bugs or suggest new features via Issues, and please include reproducible examples.
- Fork and submit a PR. The code style uses Vue 3 + TypeScript + ShadCN UI. Documentation and components are also welcome.
- Check `app/lib/markedExtensions.ts` to add your own Markdown extension syntax.

## License and Acknowledgments

SealCV follows the MIT License. Thanks to the following open-source projects and communities for their support:

- [Vue 3](https://vuejs.org/)
- [Nuxt.js](https://nuxt.com/)
- [shadcn/ui](https://ui.shadcn.com/vue)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [SnapDOM](https://github.com/zumer/snapdom)
- [jsPDF](https://github.com/parallax/jsPDF)

Thanks to all open-source contributors and users for their support ❤️
