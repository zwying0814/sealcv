<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import { marked } from 'marked'
import { useThrottleFn, useElementSize } from '@vueuse/core'
import { registerEqualSplitRowExtension, registerCenterLineExtension, registerIconInlineExtension, registerStrongAdjacencyFix } from '@/lib/markedExtensions'
import '@/assets/cv.css'
import PhotoOverlay from '~/pages/cv/PhotoOverlay.vue'
import { useCustomCss } from '@/composables/useCustomCss'
import { PAPER_SIZES } from '@/lib/paperSizes'
import type { PaperSizeKey } from '@/lib/paperSizes'

interface Props {
  markdownText: string
  scale?: number
  paddingX?: number
  paddingY?: number
  paperSize?: PaperSizeKey
  smartOnePage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  paddingX: 24,
  paddingY: 24,
  paperSize: 'a4',
  smartOnePage: false,
})
const emit = defineEmits<{ (e: 'scaleMaxChange', v: number): void }>()

const { customCss } = useCustomCss()

const outer = ref<HTMLElement | null>(null)
const { width: outerW } = useElementSize(outer)
const activePaperSize = computed(() => PAPER_SIZES[props.paperSize ?? 'a4'])
const pageWidth = computed(() => activePaperSize.value.width)

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

function render(src: string) {
  try {
    init()
    if (src === lastSrc.value) {
      html.value = lastHtml.value
      paginate()
      return
    }
    const out = marked.parse(src)
    lastSrc.value = src
    lastHtml.value = out as string
    html.value = lastHtml.value
    paginate()
  } catch {
    /* ignore */
  }
}

const renderThrottled = useThrottleFn(render, 120, true, true)

watch(() => props.markdownText, (v) => {
  renderThrottled(v || '')
}, { immediate: true })

onMounted(() => {
  // 立即执行一次渲染，确保首次挂载时有内容
  render(props.markdownText || '')
})

const localScale = ref<number>(props.scale ?? 1)
watch(() => props.scale, (v) => {
  const s = typeof v === 'number' ? v : 1
  localScale.value = s
})

const maxScale = computed(() => {
  const w = outerW.value || pageWidth.value
  return Math.max(0.2, +(w / pageWidth.value).toFixed(2))
})
watch(maxScale, (v) => emit('scaleMaxChange', v), { immediate: true })
const finalScale = computed(() => {
  const s = localScale.value
  const m = maxScale.value
  return Math.min(m, Math.max(0.2, s))
})

const previewStyle = computed(() => {
  const dims = activePaperSize.value
  return {
    width: `${pageWidth.value}px`,
    height: dims.height ? `${dims.height}px` : 'auto',
    transform: `scale(${finalScale.value})`,
    transformOrigin: 'top left',
  }
})

const pageWrapStyle = computed(() => {
  const dims = activePaperSize.value
  return {
    width: `${Math.round(pageWidth.value * finalScale.value)}px`,
    height: dims.height ? `calc(${Math.round(dims.height * finalScale.value)}px + 1.5rem)` : 'auto',
  }
})
const pageStyle = computed(() => ({
  ...previewStyle.value,
  padding: `${props.paddingY}px ${props.paddingX}px`,
}))

let smartCleanup: (() => void) | null = null
function clearSmartAdjustments() {
  if (smartCleanup) {
    smartCleanup()
    smartCleanup = null
  }
}

function paginate() {
  if (!lastHtml.value) {
    pagesHtml.value = []
    clearSmartAdjustments()
    return
  }
  const dims = activePaperSize.value
  const forceSinglePage = !dims.height || (props.smartOnePage && props.paperSize !== 'free')
  if (forceSinglePage) {
    pagesHtml.value = [lastHtml.value]
    return
  }
  clearSmartAdjustments()
  const measure = document.createElement('div')
  measure.style.position = 'absolute'
  measure.style.visibility = 'hidden'
  measure.style.left = '-99999px'
  measure.style.top = '0'
  const innerWidth = Math.max(0, dims.width - (props.paddingX || 0) * 2)
  measure.style.width = `${innerWidth}px`
  measure.className = 'cv'
  measure.innerHTML = lastHtml.value
  document.body.appendChild(measure)
  const children = Array.from(measure.children)
  const pages: string[] = []
  let pageStartTop = 0
  let buf: string[] = []
  const pageContentH = Math.max(0, (dims.height ?? 0) - (props.paddingY || 0) * 2)
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

watch(() => [props.paddingX, props.paddingY], () => paginate())
watch(() => props.paperSize, () => paginate())
watch(() => props.smartOnePage, () => paginate())

function scheduleSmartLayout() {
  clearSmartAdjustments()
  if (!props.smartOnePage || props.paperSize === 'free') return
  nextTick(() => {
    requestAnimationFrame(() => applySmartLayout())
  })
}

function applySmartLayout() {
  if (!props.smartOnePage || props.paperSize === 'free') return
  const dims = activePaperSize.value
  if (!dims.height) return
  const pageEl = outer.value?.querySelector('.pages .cv') as HTMLElement | null
  if (!pageEl) return
  const available = Math.max(0, dims.height - (props.paddingY || 0) * 2)
  if (!available) return
  const contentHeight = pageEl.scrollHeight
  if (!contentHeight) return
  const blocks = Array.from(pageEl.children).filter((node): node is HTMLElement => node instanceof HTMLElement)
  if (!blocks.length) return
  const delta = available - contentHeight
  if (Math.abs(delta) < 2) return
  const cleanupTasks: Array<() => void> = []
  pageEl.classList.add('smart-one-page')
  cleanupTasks.push(() => pageEl.classList.remove('smart-one-page'))
  if (delta >= 0) {
    const per = delta / blocks.length
    blocks.forEach((el) => {
      const prevBottom = el.style.marginBottom
      cleanupTasks.push(() => { el.style.marginBottom = prevBottom })
      const style = getComputedStyle(el)
      const marginBottom = parseFloat(style.marginBottom || '0')
      el.style.marginBottom = `${Math.max(0, marginBottom + per)}px`
    })
  } else {
    const ratio = available / contentHeight
    blocks.forEach((el) => {
      const prevBottom = el.style.marginBottom
      const prevLine = el.style.lineHeight
      cleanupTasks.push(() => {
        el.style.marginBottom = prevBottom
        el.style.lineHeight = prevLine
      })
      const style = getComputedStyle(el)
      const marginBottom = parseFloat(style.marginBottom || '0')
      const lineHeight = parseFloat(style.lineHeight || '0')
      if (marginBottom) {
        el.style.marginBottom = `${Math.max(2, marginBottom * ratio)}px`
      }
      if (isFinite(lineHeight) && lineHeight > 0) {
        el.style.lineHeight = `${Math.max(14, lineHeight * ratio)}px`
      }
    })
  }
  smartCleanup = () => {
    cleanupTasks.forEach((fn) => fn())
  }
}

watch([pagesHtml, () => props.smartOnePage, () => props.paperSize, () => props.paddingY], () => {
  if (props.smartOnePage && props.paperSize !== 'free') {
    scheduleSmartLayout()
  } else {
    clearSmartAdjustments()
  }
}, { deep: true })

onBeforeUnmount(() => {
  clearSmartAdjustments()
})
</script>

<template>
  <div
    ref="outer"
    class="h-[calc(100dvh-3.75rem)] overflow-y-auto overflow-x-hidden border rounded-md bg-input px-4 pt-6 flex justify-center"
    aria-live="polite"
    style="scrollbar-gutter: stable both-edges;"
  >
    <component :is="'style'" v-if="customCss">{{ customCss }}</component>
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
