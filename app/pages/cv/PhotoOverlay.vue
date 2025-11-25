<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePhoto } from '@/composables/usePhoto'

const { photo } = usePhoto()
const isSelected = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

// Dragging state
let isDragging = false
let startX = 0
let startY = 0
let startLeft = 0
let startTop = 0

// Resizing state
let isResizing = false
let resizeHandle = ''
let startWidth = 0
let startHeight = 0 // Not used for width-based aspect ratio, but good to have
let aspectRatio = 1
let startBottomPct = 0
let imageAspectRatio = 1
let parentWidth = 0
let parentHeight = 0

function onMouseDown(e: MouseEvent) {
  if (!isSelected.value) {
    isSelected.value = true
    return
  }
  e.preventDefault()
  e.stopPropagation()
  
  isDragging = true
  startX = e.clientX
  startY = e.clientY
  startLeft = photo.value.x
  startTop = photo.value.y
  
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onResizeStart(e: MouseEvent, handle: string) {
  e.preventDefault()
  e.stopPropagation()
  
  isResizing = true
  resizeHandle = handle
  startX = e.clientX
  startY = e.clientY
  startWidth = photo.value.width
  startLeft = photo.value.x
  startTop = photo.value.y
  
  if (wrapperRef.value && wrapperRef.value.parentElement) {
    const rect = wrapperRef.value.getBoundingClientRect()
    const parentRect = wrapperRef.value.parentElement.getBoundingClientRect()
    parentWidth = parentRect.width
    parentHeight = parentRect.height
    imageAspectRatio = rect.width / rect.height
    startBottomPct = startTop + (rect.height / parentHeight) * 100
  }
  
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeUp)
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging || !wrapperRef.value) return
  
  const parent = wrapperRef.value.parentElement
  if (!parent) return
  const parentRect = parent.getBoundingClientRect()
  
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  
  const dxPct = (dx / parentRect.width) * 100
  const dyPct = (dy / parentRect.height) * 100
  
  photo.value.x = Math.max(0, Math.min(100 - photo.value.width, startLeft + dxPct))
  photo.value.y = Math.max(0, Math.min(100, startTop + dyPct))
}

function onMouseUp() {
  isDragging = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

function onResizeMove(e: MouseEvent) {
  if (!isResizing || !wrapperRef.value) return
  
  const parent = wrapperRef.value.parentElement
  if (!parent) return
  const parentRect = parent.getBoundingClientRect()
  
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  
  const dxPct = (dx / parentRect.width) * 100
  const dyPct = (dy / parentRect.height) * 100
  
  if (resizeHandle.includes('right')) {
    photo.value.width = Math.max(5, Math.min(100 - startLeft, startWidth + dxPct))
  } else if (resizeHandle.includes('left')) {
    const newWidth = Math.max(5, Math.min(startLeft + startWidth, startWidth - dxPct))
    const newLeft = startLeft + (startWidth - newWidth)
    if (newLeft >= 0) {
        photo.value.width = newWidth
        photo.value.x = newLeft
    }
  }
  
  if (resizeHandle === 'top-left') {
    // Calculate new height based on new width and aspect ratio
    const currentWidthPct = photo.value.width
    const currentWidthPx = (currentWidthPct / 100) * parentWidth
    const newHeightPx = currentWidthPx / imageAspectRatio
    const newHeightPct = (newHeightPx / parentHeight) * 100
    
    // Update Y so that Bottom stays at startBottomPct
    photo.value.y = startBottomPct - newHeightPct
  }
}

function onResizeUp() {
  isResizing = false
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeUp)
}

function remove() {
  photo.value.src = ''
}

// Click outside to deselect
function onWindowClick(e: MouseEvent) {
  if (isSelected.value && wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isSelected.value = false
  }
}

onMounted(() => {
  window.addEventListener('mousedown', onWindowClick)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', onWindowClick)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeUp)
})
</script>

<template>
  <div
    v-if="photo.src"
    ref="wrapperRef"
    class="absolute select-none"
    :style="{
      left: `${photo.x}%`,
      top: `${photo.y}%`,
      width: `${photo.width}%`,
      zIndex: 50
    }"
    @mousedown="onMouseDown"
  >
    <img
      :src="photo.src"
      class="w-full h-auto block rounded-sm shadow-sm cursor-move"
      :class="{ 'ring-2 ring-blue-500': isSelected }"
      draggable="false"
    />
    
    <template v-if="isSelected">
      <!-- Delete Button -->
      <button
        class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-50 shadow-sm"
        @click.stop="remove"
      >
        ✕
      </button>
      
      <!-- Anchors -->
      <div
        class="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nwse-resize z-50"
        @mousedown.stop="onResizeStart($event, 'top-left')"
      ></div>
      <div
        class="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nesw-resize z-50"
        @mousedown.stop="onResizeStart($event, 'bottom-left')"
      ></div>
      <div
        class="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nwse-resize z-50"
        @mousedown.stop="onResizeStart($event, 'bottom-right')"
      ></div>
    </template>
  </div>
</template>
