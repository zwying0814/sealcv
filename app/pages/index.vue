<script setup lang="ts">
import { SparklesText } from '@/components/ui/sparkles-text'
import { RainbowButton } from '@/components/ui/rainbow-button'

useSeoMeta({
  title: 'SealCV - 专注内容的简历制作工具',
  description: '一款现代的简历生成器，专注内容本身而无需关注排版，开源免费，具备智能一页、多尺寸纸张、多页 PDF 导出功能',
  ogTitle: 'SealCV - 专注内容的简历制作工具',
  ogDescription: '专注内容本身，开源免费，实时预览，智能一页，多页 PDF 导出。',
  ogType: 'website',
  ogUrl: 'https://cv.zwy.life',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'SealCV - 专注内容的简历制作工具',
  twitterDescription: '专注内容本身，开源免费，实时预览，智能一页，多页 PDF 导出。',
})
useHead({
  htmlAttrs: { lang: 'zh-CN' },
  link: [{ rel: 'canonical', href: 'https://cv.zwy.life' }],
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Hero Section -->
    <section class="relative overflow-hidden py-20 md:py-32">
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]">
      </div>
      <div class="max-w-5xl mx-auto px-4 text-center">
        <SparklesText text="SealCV" class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          :colors="{ first: '#6366f1', second: '#a855f7' }" :sparkles-count="12" />
        <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          一款现代的 Markdown 语法简历制作工具，专注内容本身而无需关注排版，开源免费，具备智能一页、多尺寸纸张、多页 PDF 导出功能
        </p>
        <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Code your resume, ship your career </p>
        <div class="flex flex-wrap justify-center gap-4">
          <RainbowButton :speed="5" class="px-6 py-3 text-base font-semibold rounded-lg">
            <NuxtLink to="/cv" class="flex items-center gap-2">
              ✨ 立即制作简历
            </NuxtLink>
          </RainbowButton>
          <a href="https://github.com/zwying0814/sealcv" target="_blank"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-lg border bg-background hover:bg-accent transition-colors text-base font-medium">
            <svg viewBox="0 0 24 24" fill="currentColor" class="size-5">
              <path
                d="M12 2C6.477 2 2 6.486 2 12.02c0 4.426 2.865 8.18 6.839 9.504.5.095.682-.218.682-.486 0-.24-.009-.876-.014-1.72-2.782.605-3.369-1.343-3.369-1.343-.455-1.16-1.11-1.47-1.11-1.47-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.087 2.91.832.091-.647.35-1.087.636-1.337-2.22-.254-4.555-1.113-4.555-4.951 0-1.094.39-1.988 1.029-2.688-.103-.253-.447-1.274.098-2.656 0 0 .84-.27 2.75 1.026a9.52 9.52 0 0 1 5 0C16.1 6.54 16.94 6.81 16.94 6.81c.545 1.382.201 2.403.099 2.656.64.7 1.028 1.594 1.028 2.688 0 3.848-2.339 4.694-4.566 4.943.359.309.679.92.679 1.855 0 1.338-.012 2.418-.012 2.747 0 .27.18.585.688.485A10.02 10.02 0 0 0 22 12.02C22 6.486 17.523 2 12 2Z" />
            </svg>
            Star on GitHub
          </a>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-muted/40">
      <div class="max-w-5xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">主要特色</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Feature 1 -->
          <div class="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">实时预览</h3>
            <p class="text-muted-foreground text-sm">内置 Markdown 编辑器，修改即在 CV 样式页中反映，支持自定义 CSS。</p>
          </div>
          <!-- Feature 2 -->
          <div class="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">纸张感设计</h3>
            <p class="text-muted-foreground text-sm">内置多种纸张尺寸（A4、A3、自由尺寸等），带间距控制和智能一页布局。</p>
          </div>
          <!-- Feature 3 -->
          <div class="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="10" r="3" />
                <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">照片/图标支持</h3>
            <p class="text-muted-foreground text-sm">拖拽头像，编辑照片位置；支持 icon 语法自动渲染图标与内容。</p>
          </div>
          <!-- Feature 4 -->
          <div class="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M9 15v2" />
                <path d="M12 12v5" />
                <path d="M15 13v4" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">多页 PDF 导出</h3>
            <p class="text-muted-foreground text-sm">按页面分割内容，将每页转成 Canvas 再打包成兼容多页的 PDF 文件。</p>
          </div>
          <!-- Feature 5 -->
          <div class="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">本地持久化</h3>
            <p class="text-muted-foreground text-sm">编辑内容与自定义 CSS 保存在 localStorage 中，SPA 跳转也能保留状态。</p>
          </div>
          <!-- Feature 6 -->
          <div class="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 16 4-4-4-4" />
                <path d="m6 8-4 4 4 4" />
                <path d="m14.5 4-5 16" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">开源可扩展</h3>
            <p class="text-muted-foreground text-sm">基于 Vue 3 + TypeScript + ShadCN UI，可自由扩展 Markdown 语法。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">准备好制作你的简历了吗？</h2>
        <p class="text-muted-foreground mb-8">无需注册，直接开始编辑，所有数据保存在本地浏览器中</p>
        <RainbowButton :speed="5" class="px-8 py-4 text-lg font-semibold rounded-xl">
          <NuxtLink to="/cv" class="flex items-center gap-2">
            🚀 开始制作
          </NuxtLink>
        </RainbowButton>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t py-8">
      <div class="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
        <p class="mb-2">
          Made with ❤️ using
          <a href="https://vuejs.org/" target="_blank" class="underline hover:text-foreground">Vue 3</a>,
          <a href="https://nuxt.com/" target="_blank" class="underline hover:text-foreground">Nuxt.js</a>,
          <a href="https://ui.shadcn.com/" target="_blank" class="underline hover:text-foreground">shadcn/ui</a>
        </p>
        <p>© 2025 SealCV. Open source under MIT License.</p>
      </div>
    </footer>
  </div>
</template>
