<script setup lang="ts">
import Navbar from './Navbar.vue'
import EditorPanel from './EditorPanel.vue'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { ref, computed, watch } from 'vue'
import { useElementSize, useLocalStorage, useMediaQuery } from '@vueuse/core'
import { PencilRuler, View, Settings } from 'lucide-vue-next'
import MarkdownPreview from './MarkdownPreview.vue'
import ControlPanel from './ControlPanel.vue'
import type { PaperSizeKey } from '@/lib/paperSizes'
import { defaultResumeContent } from '@/lib/defaultContent'
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

definePageMeta({
  layout: 'main'
})
useSeoMeta({
  title: '简历编辑器 - SealCV',
  description: '使用 SealCV 在线编辑器制作专业简历，实时 Markdown 预览，支持多种纸张尺寸和 PDF 导出。',
  ogTitle: '简历编辑器 - SealCV',
  ogDescription: '在线制作专业简历，实时预览，一键导出 PDF。',
  robots: 'noindex, nofollow',
})
useHead({
  htmlAttrs: { lang: 'zh-CN' },
  script: [
    {
      src: 'https://code.iconify.design/iconify-icon/3.0.2/iconify-icon.min.js',
      async: true,
    },
  ],
})

// 响应式检测
const isMobile = useMediaQuery('(max-width: 768px)')
const mobileTab = ref<'editor' | 'preview'>('editor')
const drawerOpen = ref(false)

const groupRef = ref(null)
const { width } = useElementSize(groupRef)
const minSizePercent = computed(() => {
  const w = width.value || 1
  const pct = (200 / w) * 100
  return Math.min(100, Math.max(1, pct))
})
const markdownText = useLocalStorage<string>('cv-editor-content', defaultResumeContent)
const previewScale = ref<number>(1)
const previewScaleArr = ref<number[]>([previewScale.value])
const maxScale = ref<number>(2)
const paddingX = ref<number>(32)
const paddingY = ref<number>(32)
const paperSize = ref<PaperSizeKey>('a4')
const smartOnePage = ref<boolean>(false)
watch(previewScale, (v) => {
  previewScaleArr.value = [v]
})
watch(previewScaleArr, (v) => {
  const s = Array.isArray(v) ? (v[0] ?? 1) : 1
  previewScale.value = s
})
watch(maxScale, (m) => {
  previewScale.value = Math.min(m, Math.max(0.2, previewScale.value))
})
watch(paperSize, (size) => {
  if (size === 'free') smartOnePage.value = false
})
</script>

<template>
  <Navbar />

  <!-- 桌面端布局 -->
  <div v-if="!isMobile" class="px-1 pb-1">
    <div class="flex gap-1">
      <div class="flex-1 min-h-[calc(100dvh-3.75rem)]">
        <ResizablePanelGroup direction="horizontal" ref="groupRef">
          <ResizablePanel :default-size="35" :min-size="minSizePercent" class="overflow-hidden">
            <EditorPanel v-model="markdownText" />
          </ResizablePanel>
          <ResizableHandle class="mx-0.5 w-0" />
          <ResizablePanel :default-size="65" :min-size="minSizePercent" class="overflow-hidden">
            <MarkdownPreview :markdownText="markdownText" :scale="previewScale" :paddingX="paddingX"
              :paddingY="paddingY" :paperSize="paperSize" :smartOnePage="smartOnePage"
              @scaleMaxChange="maxScale = $event" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <aside class="w-64 min-h-[calc(100dvh-3.75rem)] border rounded-md bg-card">
        <ControlPanel v-model:scale="previewScale" :maxScale="maxScale" v-model:paddingX="paddingX"
          v-model:paddingY="paddingY" v-model:paperSize="paperSize" v-model:smartOnePage="smartOnePage" />
      </aside>
    </div>
  </div>

  <!-- 移动端布局 -->
  <div v-else class="flex flex-col h-[calc(100dvh-3.5rem)]">
    <!-- 内容区域 -->
    <div class="flex-1 overflow-hidden">
      <!-- 编辑器面板 -->
      <div v-show="mobileTab === 'editor'" class="h-full p-1">
        <EditorPanel v-model="markdownText" />
      </div>
      <!-- 预览面板 -->
      <div v-show="mobileTab === 'preview'" class="h-full relative">
        <MarkdownPreview :markdownText="markdownText" :scale="previewScale" :paddingX="paddingX" :paddingY="paddingY"
          :paperSize="paperSize" :smartOnePage="smartOnePage" @scaleMaxChange="maxScale = $event" />

        <!-- 设置 Drawer -->
        <Drawer v-model:open="drawerOpen">
          <DrawerTrigger as-child>
            <button
              class="absolute bottom-4 right-4 size-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
              aria-label="打开设置">
              <Settings class="size-5" />
            </button>
          </DrawerTrigger>
          <DrawerContent class="max-h-[85dvh]">
            <DrawerHeader class="text-left">
              <DrawerTitle>设置</DrawerTitle>
            </DrawerHeader>
            <div class="overflow-y-auto px-4 pb-6">
              <ControlPanel v-model:scale="previewScale" :maxScale="maxScale" v-model:paddingX="paddingX"
                v-model:paddingY="paddingY" v-model:paperSize="paperSize" v-model:smartOnePage="smartOnePage" />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <nav class="shrink-0 border-t bg-card px-2 py-2 flex justify-around items-center safe-area-pb">
      <button class="flex flex-col items-center gap-1 px-6 py-1.5 rounded-lg transition-colors"
        :class="mobileTab === 'editor' ? 'text-primary bg-primary/10' : 'text-muted-foreground'"
        @click="mobileTab = 'editor'">
        <PencilRuler class="size-5" />
        <span class="text-xs font-medium">编辑</span>
      </button>
      <button class="flex flex-col items-center gap-1 px-6 py-1.5 rounded-lg transition-colors"
        :class="mobileTab === 'preview' ? 'text-primary bg-primary/10' : 'text-muted-foreground'"
        @click="mobileTab = 'preview'">
       <View class="size-5"/>
        <span class="text-xs font-medium">预览</span>
      </button>
    </nav>
  </div>

  <Toaster position="top-center" :closeButton="true" closeButtonPosition="top-right" richColors />
</template>

<style scoped>
.safe-area-pb {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}
</style>