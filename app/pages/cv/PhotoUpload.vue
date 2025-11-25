<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useTimeoutFn, useIntervalFn } from '@vueuse/core'
import { toast } from 'vue-sonner'

const inputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const props = defineProps({ 
  targetSelector: { type: String, default: '.cv' }, 
  initialWidth: { type: Number, default: 150 }, 
  initialX: { type: Number, default: 20 }, 
  initialY: { type: Number, default: 20 },
  storageKey: { type: String, default: 'photo_upload_data' }
})

interface PhotoData {
  src: string
  left: number
  top: number
  width: number
}

// 直接使用 localStorage 而不用 useStorage，以避免序列化问题
function savePhotoData(data: PhotoData | null) {
  if (data === null) {
    localStorage.removeItem(props.storageKey)
  } else {
    localStorage.setItem(props.storageKey, JSON.stringify(data))
  }
}

function getPhotoData(): PhotoData | null {
  try {
    const data = localStorage.getItem(props.storageKey)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function restorePhoto(container: HTMLElement) {
  // 页面加载时恢复保存的证件照
  const savedPhoto = getPhotoData()
  if (savedPhoto?.src) {
    // 使用短延迟确保 DOM 事件循环完成
    useTimeoutFn(() => {
      insertImage(savedPhoto.src, container)
      // 恢复位置和大小
      const wrapper = document.querySelector('.uploaded-photo-wrapper') as HTMLElement | null
      if (wrapper) {
        wrapper.style.left = `${savedPhoto.left}%`
        wrapper.style.top = `${savedPhoto.top}%`
        wrapper.style.width = `${savedPhoto.width}%`
      }
    }, 50)
  }
}

// 使用 useIntervalFn 监控容器，一旦发现就立即停止
let restored = false
const { pause: pauseContainerCheck } = useIntervalFn(() => {
  if (restored) return
  const container = document.querySelector(props.targetSelector) as HTMLElement | null
  if (container) {
    restored = true
    pauseContainerCheck()
    containerRef.value = container
    restorePhoto(container)
  }
}, 100, { immediate: true, immediateCallback: true })

onMounted(() => {
  // 组件挂载时也尝试一次
  const container = document.querySelector(props.targetSelector) as HTMLElement | null
  if (container && !restored) {
    restored = true
    pauseContainerCheck()
    containerRef.value = container
    restorePhoto(container)
  }
})

function onChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const allowed = ['image/jpg','image/jpeg', 'image/png']
  if (!allowed.includes(file.type)) {
    // alert('只支持 JPG/PNG 图片')
    toast.error('只支持 JPG/PNG 图片')
    input.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    const data = reader.result as string
    insertImage(data)
    input.value = ''
  }
  reader.readAsDataURL(file)
}

function openPicker() {
  inputRef.value?.click()
}

function parsePercentage(value: string | null): number {
  if (!value) return 0
  return value.endsWith('%') ? Number(value.slice(0, -1)) : 0
}

function insertImage(src: string, providedContainer?: HTMLElement) {
  const container = providedContainer || (document.querySelector(props.targetSelector) as HTMLElement | null)
  if (!container) {
    toast.error(`未找到目标容器：${props.targetSelector}`)
    return
  }
  // ensure container can be used as positioning context
  const st = getComputedStyle(container)
  if (st.position === 'static' || !st.position) container.style.position = 'relative'

  // 状态管理
  let isSelected = false
  let dragging: { startX: number; startY: number; startLeftPct: number; startTopPct: number; containerWidth: number; containerHeight: number; curW: number } | null = null
  let resizing: { startX: number; startY: number; startWidthPct: number; startLeftPct: number; startTopPct: number; containerWidth: number; containerHeight: number; handle: string } | null = null
  let lastLeft = 0
  let lastTop = 0
  let lastWidth = 0

  const wrapper = document.createElement('div')
  wrapper.className = 'uploaded-photo-wrapper'
  Object.assign(wrapper.style, {
    position: 'absolute',
    left: '0%',
    top: '0%',
    width: '20%',
    cursor: 'default',
    userSelect: 'none',
    zIndex: '9999',
    touchAction: 'none'
  })

  const img = document.createElement('img')
  img.src = src
  img.alt = '证件照'
  Object.assign(img.style, { width: '100%', height: 'auto', display: 'block', borderRadius: '4px' })
  wrapper.appendChild(img)

  // 创建选中状态的样式层
  const selectionBox = document.createElement('div')
  Object.assign(selectionBox.style, {
    position: 'absolute',
    inset: '0',
    border: '2px solid #3b82f6',
    borderRadius: '4px',
    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
    display: 'none',
    pointerEvents: 'none'
  })
  wrapper.appendChild(selectionBox)

  // 创建 4 个锚点（四个角）
  const anchors: Record<string, HTMLElement> = {}
  const anchorPositions = [
    { name: 'top-left', top: '-4px', left: '-4px', cursor: 'nwse-resize' },
    { name: 'top-right', top: '-4px', right: '-4px', cursor: 'nesw-resize' },
    { name: 'bottom-left', bottom: '-4px', left: '-4px', cursor: 'nesw-resize' },
    { name: 'bottom-right', bottom: '-4px', right: '-4px', cursor: 'nwse-resize' }
  ]

  anchorPositions.forEach((pos) => {
    const anchor = document.createElement('div')
    Object.assign(anchor.style, {
      position: 'absolute',
      width: '8px',
      height: '8px',
      backgroundColor: '#3b82f6',
      border: '1px solid white',
      borderRadius: '50%',
      cursor: pos.cursor,
      display: 'none',
      zIndex: '10001',
      ...(pos.top && { top: pos.top }),
      ...(pos.bottom && { bottom: pos.bottom }),
      ...(pos.left && { left: pos.left }),
      ...(pos.right && { right: pos.right })
    })
    anchors[pos.name] = anchor
    wrapper.appendChild(anchor)
  })

  // 删除按钮
  const deleteBtn = document.createElement('button')
  deleteBtn.innerHTML = '✕'
  Object.assign(deleteBtn.style, {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: '10002',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0'
  })
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    wrapper.remove()
    savePhotoData(null)
    toast.success('证件照已删除')
  })
  wrapper.appendChild(deleteBtn)

  // 设置和取消选中状态的函数
  function setSelected(selected: boolean) {
    isSelected = selected
    selectionBox.style.display = selected ? 'block' : 'none'
    deleteBtn.style.display = selected ? 'flex' : 'none'
    Object.values(anchors).forEach(anchor => {
      anchor.style.display = selected ? 'block' : 'none'
    })
    wrapper.style.cursor = selected ? 'default' : 'default'
  }

  // 图片点击选中
  img.addEventListener('pointerdown', (ev) => {
    if (!isSelected) {
      ev.stopPropagation()
      setSelected(true)
    } else {
      // 如果已选中，允许事件冒泡到 wrapper 进行拖动
      // 不阻止事件
    }
  })

  function parsePct(value: string | null) {
    if (!value) return 0
    return value.endsWith('%') ? Number(value.slice(0, -1)) : 0
  }

  // 图片拖动（仅在选中时）
  wrapper.addEventListener('pointerdown', (ev) => {
    // 如果点击的是删除按钮或锚点，不处理拖动
    if ((ev.target as HTMLElement) === deleteBtn) return
    if (Object.values(anchors).includes(ev.target as HTMLElement)) return
    
    if (!isSelected) {
      setSelected(true)
      return
    }
    
    // 选中状态下开始拖动
    ev.preventDefault()
    wrapper.setPointerCapture(ev.pointerId)
    wrapper.style.willChange = 'transform'
    const rect = container.getBoundingClientRect()
    const leftPct = parsePct(wrapper.style.left)
    const topPct = parsePct(wrapper.style.top)
    const curW = parsePct(wrapper.style.width)
    lastLeft = leftPct
    lastTop = topPct
    dragging = { startX: ev.clientX, startY: ev.clientY, startLeftPct: leftPct, startTopPct: topPct, containerWidth: rect.width, containerHeight: rect.height, curW }
  })

  // 合并的 pointermove 事件处理
  wrapper.addEventListener('pointermove', (ev) => {
    if (dragging) {
      const dxPct = ((ev.clientX - dragging.startX) / dragging.containerWidth) * 100
      const dyPct = ((ev.clientY - dragging.startY) / dragging.containerHeight) * 100
      const newLeft = Math.min(100 - dragging.curW, Math.max(0, dragging.startLeftPct + dxPct))
      const newTop = Math.max(0, Math.min(100, dragging.startTopPct + dyPct))
      
      if (Math.abs(newLeft - lastLeft) > 0.01 || Math.abs(newTop - lastTop) > 0.01) {
        wrapper.style.left = `${newLeft}%`
        wrapper.style.top = `${newTop}%`
        lastLeft = newLeft
        lastTop = newTop
      }
    }
    
    if (resizing) {
      const deltaXPct = ((ev.clientX - resizing.startX) / resizing.containerWidth) * 100
      const deltaYPct = ((ev.clientY - resizing.startY) / resizing.containerHeight) * 100
      
      // 根据不同的锚点处理缩放和位置
      if (resizing.handle === 'top-left') {
        // 左上：宽度减少，left增加，top增加
        const newW = Math.max(6, resizing.startWidthPct - deltaXPct)
        const newLeft = Math.max(0, resizing.startLeftPct + deltaXPct)
        const newTop = Math.max(0, resizing.startTopPct + deltaYPct)
        if (Math.abs(newW - lastWidth) > 0.01) {
          wrapper.style.width = `${newW}%`
          lastWidth = newW
        }
        if (Math.abs(newLeft - lastLeft) > 0.01) {
          wrapper.style.left = `${newLeft}%`
          lastLeft = newLeft
        }
        if (Math.abs(newTop - lastTop) > 0.01) {
          wrapper.style.top = `${newTop}%`
          lastTop = newTop
        }
      } else if (resizing.handle === 'top-right') {
        // 右上：宽度增加，top增加
        const newW = Math.max(6, Math.min(100, resizing.startWidthPct + deltaXPct))
        const newTop = Math.max(0, resizing.startTopPct + deltaYPct)
        if (Math.abs(newW - lastWidth) > 0.01) {
          wrapper.style.width = `${newW}%`
          lastWidth = newW
        }
        if (Math.abs(newTop - lastTop) > 0.01) {
          wrapper.style.top = `${newTop}%`
          lastTop = newTop
        }
      } else if (resizing.handle === 'bottom-left') {
        // 左下：宽度减少，left增加
        const newW = Math.max(6, resizing.startWidthPct - deltaXPct)
        const newLeft = Math.max(0, resizing.startLeftPct + deltaXPct)
        if (Math.abs(newW - lastWidth) > 0.01) {
          wrapper.style.width = `${newW}%`
          lastWidth = newW
        }
        if (Math.abs(newLeft - lastLeft) > 0.01) {
          wrapper.style.left = `${newLeft}%`
          lastLeft = newLeft
        }
      } else if (resizing.handle === 'bottom-right') {
        // 右下：宽度增加
        const newW = Math.max(6, Math.min(100, resizing.startWidthPct + deltaXPct))
        if (Math.abs(newW - lastWidth) > 0.01) {
          wrapper.style.width = `${newW}%`
          lastWidth = newW
        }
      }
    }
  })

  // 合并的 pointerup 事件处理
  wrapper.addEventListener('pointerup', (ev) => {
    if (dragging) {
      wrapper.style.willChange = 'auto'
      try { wrapper.releasePointerCapture(ev.pointerId) } catch {}
      dragging = null
      const leftPct = parsePercentage(wrapper.style.left)
      const topPct = parsePercentage(wrapper.style.top)
      const widthPct = parsePercentage(wrapper.style.width)
      savePhotoData({ src, left: leftPct, top: topPct, width: widthPct })
    }
    
    if (resizing) {
      wrapper.style.willChange = 'auto'
      try {
        const anchor = anchors[resizing.handle]
        if (anchor) {
          anchor.releasePointerCapture(ev.pointerId)
        }
      } catch {}
      resizing = null
      const leftPct = parsePercentage(wrapper.style.left)
      const topPct = parsePercentage(wrapper.style.top)
      const widthPct = parsePercentage(wrapper.style.width)
      savePhotoData({ src, left: leftPct, top: topPct, width: widthPct })
    }
  })

  // 锚点拖动调整大小
  Object.entries(anchors).forEach(([handle, anchor]) => {
    anchor.addEventListener('pointerdown', (ev) => {
      ev.stopPropagation()
      anchor.setPointerCapture(ev.pointerId)
      const rect = container.getBoundingClientRect()
      const wPct = parsePct(wrapper.style.width)
      const leftPct = parsePct(wrapper.style.left)
      const topPct = parsePct(wrapper.style.top)
      lastWidth = wPct
      lastLeft = leftPct
      lastTop = topPct
      resizing = { startX: ev.clientX, startY: ev.clientY, startWidthPct: wPct, startLeftPct: leftPct, startTopPct: topPct, containerWidth: rect.width, containerHeight: rect.height, handle }
      wrapper.style.willChange = 'width, height, left, top'
    })
  })

  // 点击容器空白处取消选中
  document.addEventListener('pointerdown', (ev) => {
    if (isSelected && !wrapper.contains(ev.target as HTMLElement)) {
      setSelected(false)
    }
  }, true)

  // 初始化位置
  const cW = container.clientWidth || 1
  const cH = container.clientHeight || 1
  const leftPct = Math.max(0, Math.min(100, (props.initialX / cW) * 100))
  const topPct = Math.max(0, Math.min(100, (props.initialY / cH) * 100))
  const widthPct = Math.max(6, Math.min(100, (props.initialWidth / cW) * 100))
  wrapper.style.left = `${leftPct}%`
  wrapper.style.top = `${topPct}%`
  wrapper.style.width = `${widthPct}%`

  container.appendChild(wrapper)
  
  // 初次上传时保存
  savePhotoData({ src, left: leftPct, top: topPct, width: widthPct })
  toast.success('证件照已保存')
}
</script>

<template>
  <div class="inline-flex items-center gap-3">
    <button @click="openPicker" class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">上传证件照</button>
    <input ref="inputRef" class="hidden" type="file" accept=".jpg,.jpeg,.png" @change="onChange" />
  </div>
</template>

<style scoped>
.uploaded-photo-wrapper img { 
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  cursor: pointer;
}

.uploaded-photo-wrapper {
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

.uploaded-photo-wrapper img:hover {
  filter: brightness(0.95);
  transition: filter 0.2s;
}
</style>
