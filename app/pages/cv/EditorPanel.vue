<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
const el = ref<HTMLDivElement | null>(null)
let instance: any
interface Props { modelValue?: string }
const props = withDefaults(defineProps<Props>(), { modelValue: '' })
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const storage = useLocalStorage<string>('cv-editor-content', props.modelValue ?? '# Markdown\n\n')
onMounted(async () => {
  const monaco = await import('monaco-editor/esm/vs/editor/editor.api')
  await import('monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution')
  instance = monaco.editor.create(el.value as HTMLDivElement, {
    value: storage.value,
    language: 'markdown',
    theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    // lineNumbers: 'off',
    wordWrap: 'on'
  })
  emit('update:modelValue', storage.value)
  instance.onDidChangeModelContent(() => {
    const v = instance.getValue()
    storage.value = v
    emit('update:modelValue', v)
  })
})
watch(() => props.modelValue, (v) => {
  if (!instance) return
  if (v !== instance.getValue()) instance.setValue(v ?? '')
  storage.value = v ?? ''
})
onBeforeUnmount(() => {
  if (instance) instance.dispose()
})
</script>

<template>
    <div class="h-full border rounded-md bg-card overflow-hidden relative">
      <div ref="el" class="absolute left-0 right-2 top-4 bottom-2"></div>
    </div>
</template>