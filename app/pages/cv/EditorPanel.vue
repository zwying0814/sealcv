<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCustomCss } from '@/composables/useCustomCss'

const markdownEl = ref<HTMLDivElement | null>(null)
const cssEl = ref<HTMLDivElement | null>(null)
let markdownInstance: any
let cssInstance: any
const activeTab = ref<string>('markdown')

interface Props { modelValue?: string }
const props = withDefaults(defineProps<Props>(), { modelValue: '' })
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const { customCss } = useCustomCss()

async function initMarkdownEditor() {
  if (markdownInstance || !markdownEl.value) return
  const monaco = await import('monaco-editor/esm/vs/editor/editor.api')
  await import('monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution')
  markdownInstance = monaco.editor.create(markdownEl.value as HTMLDivElement, {
    value: props.modelValue ?? '',
    language: 'markdown',
    theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    wordWrap: 'on'
  })
  markdownInstance.onDidChangeModelContent(() => {
    const v = markdownInstance.getValue()
    emit('update:modelValue', v)
  })
}

async function initCssEditor() {
  if (cssInstance || !cssEl.value) return
  const monaco = await import('monaco-editor/esm/vs/editor/editor.api')
  await import('monaco-editor/esm/vs/basic-languages/css/css.contribution')
  cssInstance = monaco.editor.create(cssEl.value as HTMLDivElement, {
    value: customCss.value,
    language: 'css',
    theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    wordWrap: 'on'
  })
  cssInstance.onDidChangeModelContent(() => {
    const v = cssInstance.getValue()
    customCss.value = v
  })
}

onMounted(async () => {
  await initMarkdownEditor()
})

watch(activeTab, async (tab) => {
  await nextTick()
  if (tab === 'markdown') {
    await initMarkdownEditor()
    markdownInstance?.layout()
  } else if (tab === 'css') {
    await initCssEditor()
    cssInstance?.layout()
  }
})

watch(() => props.modelValue, (v) => {
  if (!markdownInstance) return
  if (v !== markdownInstance.getValue()) markdownInstance.setValue(v ?? '')
})

onBeforeUnmount(() => {
  if (markdownInstance) markdownInstance.dispose()
  if (cssInstance) cssInstance.dispose()
})
</script>

<template>
  <div class="h-full border rounded-md bg-card overflow-hidden relative flex flex-col">
    <Tabs v-model="activeTab" class="flex flex-col h-full">
      <TabsList class="w-full justify-start rounded-none border-b shrink-0">
        <TabsTrigger value="markdown" class="flex-1">Markdown</TabsTrigger>
        <TabsTrigger value="css" class="flex-1">CSS</TabsTrigger>
      </TabsList>
      <div class="flex-1 relative">
        <div v-show="activeTab === 'markdown'" class="absolute left-0 right-2 top-2 bottom-2">
          <div ref="markdownEl" class="absolute inset-0"></div>
        </div>
        <div v-show="activeTab === 'css'" class="absolute left-0 right-2 top-2 bottom-2">
          <div ref="cssEl" class="absolute inset-0"></div>
        </div>
      </div>
    </Tabs>
  </div>
</template>