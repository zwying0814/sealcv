<script setup lang="ts">
import Navbar from './Navbar.vue'
import EditorPanel from './EditorPanel.vue'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { ref, computed, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import MarkdownPreview from './MarkdownPreview.vue'
import ControlPanel from './ControlPanel.vue'
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'

definePageMeta({
  layout: 'main'
})
useHead({
  title: 'SealCV - CV 编辑器',
  script: [
    {
      src: 'https://code.iconify.design/iconify-icon/3.0.2/iconify-icon.min.js',
      async: true,
    },
  ],
})
const groupRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(groupRef)
const minSizePercent = computed(() => {
  const w = width.value || 1
  const pct = (200 / w) * 100
  return Math.min(100, Math.max(1, pct))
})
const markdownText = ref<string>('')
const previewScale = ref<number>(1)
const previewScaleArr = ref<number[]>([previewScale.value])
const maxScale = ref<number>(2)
const paddingX = ref<number>(24)
const paddingY = ref<number>(24)
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
</script>

<template>
  <Navbar />
  <div class="px-1 pb-1">
    <div class="flex gap-1">
      <div class="flex-1 min-h-[calc(100dvh-3.75rem)]">
        <ResizablePanelGroup direction="horizontal" ref="groupRef">
          <ResizablePanel :default-size="35" :min-size="minSizePercent" class="overflow-hidden">
            <EditorPanel v-model="markdownText" />
          </ResizablePanel>
          <ResizableHandle class="mx-0.5 w-0" />
          <ResizablePanel :default-size="65" :min-size="minSizePercent" class="overflow-hidden">
            <MarkdownPreview :markdownText="markdownText" :scale="previewScale" :paddingX="paddingX" :paddingY="paddingY" @scaleMaxChange="maxScale = $event" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <aside class="w-64 min-h-[calc(100dvh-3.75rem)] border rounded-md bg-card">
        <ControlPanel v-model:scale="previewScale" :maxScale="maxScale" v-model:paddingX="paddingX" v-model:paddingY="paddingY" />
      </aside>
    </div>
  </div>
  <Toaster position="top-center" :closeButton="true" closeButtonPosition="top-right" richColors/>
</template>