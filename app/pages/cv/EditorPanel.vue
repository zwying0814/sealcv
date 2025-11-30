<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCustomCss } from '@/composables/useCustomCss'

const containerEl = ref<HTMLDivElement | null>(null)
let editorInstance: any = null
let markdownModel: any = null
let cssModel: any = null
const activeTab = ref<string>('markdown')

interface Props { modelValue?: string }
const props = withDefaults(defineProps<Props>(), { modelValue: '' })
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const { customCss } = useCustomCss()

async function initEditor() {
  if (editorInstance || !containerEl.value) return

  const monaco = await import('monaco-editor/esm/vs/editor/editor.api')
  await import('monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution')
  await import('monaco-editor/esm/vs/basic-languages/css/css.contribution')

  // 创建 Editor 实例（不设置初始 model）
  editorInstance = monaco.editor.create(containerEl.value, {
    theme: 'vs-light',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    wordWrap: 'on',
    renderWhitespace: "selection",
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    fontFamily: 'Consolas, "Noto Sans SC", monospace',
  })

  // 创建 Markdown Model
  markdownModel = monaco.editor.createModel(props.modelValue ?? '', 'markdown')
  markdownModel.onDidChangeContent(() => {
    emit('update:modelValue', markdownModel.getValue())
  })

  // 创建 CSS Model
  cssModel = monaco.editor.createModel(customCss.value ?? '', 'css')
  cssModel.onDidChangeContent(() => {
    customCss.value = cssModel.getValue()
  })

  // 设置初始 Model
  editorInstance.setModel(markdownModel)
}

// 切换 tab 时切换 Model
watch(activeTab, async (tab) => {
  await nextTick()
  if (!editorInstance) return

  if (tab === 'markdown' && markdownModel) {
    editorInstance.setModel(markdownModel)
  } else if (tab === 'css' && cssModel) {
    editorInstance.setModel(cssModel)
  }
})

// 外部更新 markdown 内容时同步到 Model
watch(() => props.modelValue, (v) => {
  if (!markdownModel) return
  if (v !== markdownModel.getValue()) {
    markdownModel.setValue(v ?? '')
  }
})

onMounted(async () => {
  await initEditor()
})

onBeforeUnmount(() => {
  markdownModel?.dispose()
  cssModel?.dispose()
  editorInstance?.dispose()
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
        <div class="absolute left-0 right-2 top-2 bottom-2">
          <div ref="containerEl" class="absolute inset-0"></div>
        </div>
      </div>
    </Tabs>
  </div>
</template>