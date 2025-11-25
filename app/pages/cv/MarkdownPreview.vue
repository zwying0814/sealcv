<script setup lang="ts">
import { ref, watch, onMounted, onUpdated, computed } from 'vue'
import { marked } from 'marked'
import { useThrottleFn, useElementSize } from '@vueuse/core'
import { registerEqualSplitRowExtension, registerCenterLineExtension, registerIconInlineExtension, registerStrongAdjacencyFix } from '@/lib/markedExtensions'
import '@/assets/css/cv.css'
import PhotoOverlay from '~/pages/cv/PhotoOverlay.vue'

interface Props { markdownText: string, scale?: number, paddingX?: number, paddingY?: number }
const props = withDefaults(defineProps<Props>(), { paddingX: 24, paddingY: 24 })
const emit = defineEmits<{ (e: 'scaleMaxChange', v: number): void }>()
const pageW = 794
const pageH = 1123
const outer = ref<HTMLElement | null>(null)
const { width: outerW } = useElementSize(outer)

const html = ref('')
const pagesHtml = ref<string[]>([])
const initialized = ref(false)
const lastSrc = ref('')
const lastHtml = ref('')

function init() {
  if (initialized.value) return
  registerEqualSplitRowExtension()
  registerCenterLineExtension()
  registerIconInlineExtension()
  registerStrongAdjacencyFix()
  initialized.value = true
}

const renderThrottled = useThrottleFn((src: string) => {
  try {
    init()
    if (src === lastSrc.value) {
      html.value = lastHtml.value
      return
    }
    const out = marked.parse(src)
    lastSrc.value = src
    lastHtml.value = out as string
    html.value = lastHtml.value
    paginate()
  } catch { }
}, 120)

watch(() => props.markdownText, (v) => {
  renderThrottled(v || '')
}, { immediate: true })

onMounted(() => {
  renderThrottled(props.markdownText || '')
})

onUpdated(() => {
  renderThrottled(props.markdownText || '')
})

const localScale = ref<number>(props.scale ?? 1)
watch(() => props.scale, (v) => {
  const s = typeof v === 'number' ? v : 1
  localScale.value = s
})
const maxScale = computed(() => {
  const w = outerW.value || pageW
  return Math.max(0.2, +(w / pageW).toFixed(2))
})
watch(maxScale, (v) => { emit('scaleMaxChange', v) }, { immediate: true })
const finalScale = computed(() => {
  const s = localScale.value
  const m = maxScale.value
  return Math.min(m, Math.max(0.2, s))
})
const previewStyle = computed(() => ({
  width: `${pageW}px`,
  height: `${pageH}px`,
  transform: `scale(${finalScale.value})`,
  transformOrigin: 'top left'
}))

const pageWrapStyle = computed(() => ({
  width: `${Math.round(pageW * finalScale.value)}px`,
  height: `calc(${Math.round(pageH * finalScale.value)}px + 1.5rem)`,
}))
const pageStyle = computed(() => ({
  ...previewStyle.value,
  padding: `${props.paddingY}px ${props.paddingX}px`
}))
function paginate() {
  const measure = document.createElement('div')
  measure.style.position = 'absolute'
  measure.style.visibility = 'hidden'
  measure.style.left = '-99999px'
  measure.style.top = '0'
  measure.style.width = `${pageW - (props.paddingX || 0) * 2}px`
  measure.className = 'cv'
  measure.innerHTML = lastHtml.value
  document.body.appendChild(measure)
  const children = Array.from(measure.children)
  const pages: string[] = []
  let pageStartTop = 0
  let buf: string[] = []
  const pageContentH = pageH - (props.paddingY || 0) * 2
  for (const ch of children) {
    const top = (ch as HTMLElement).offsetTop
    const height = (ch as HTMLElement).offsetHeight
    if (buf.length === 0) pageStartTop = top
    const relBottom = (top - pageStartTop) + height
    if (relBottom <= pageContentH) {
      buf.push((ch as HTMLElement).outerHTML)
    } else {
      if (buf.length) pages.push(buf.join(''))
      buf = [(ch as HTMLElement).outerHTML]
      pageStartTop = top
    }
  }
  if (buf.length) pages.push(buf.join(''))
  document.body.removeChild(measure)
  pagesHtml.value = pages.length ? pages : [lastHtml.value]
}
</script>

<template>
  <div ref="outer"
    class="h-[calc(100dvh-3.75rem)] overflow-y-auto overflow-x-hidden border rounded-md bg-gray-400 px-4 pt-6 flex justify-center"
    aria-live="polite" style="scrollbar-gutter: stable both-edges;">
    <div class="relative shrink-0 mx-auto flex flex-col items-center">
      <div v-for="(page, idx) in pagesHtml" :key="idx" class="shrink-0" :style="pageWrapStyle">
        <div class="pages bg-white shadow-sm relative" :style="pageStyle">
          <div class="cv" v-html="page" />
          <PhotoOverlay v-if="idx === 0" />
        </div>
      </div>
    </div>
  </div>
</template>