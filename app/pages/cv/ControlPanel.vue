<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { InputGroup, InputGroupAddon, InputGroupText } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PhotoUploadButton from './PhotoUploadButton.vue'
import { PAPER_SIZES } from '@/lib/paperSizes'
import type { PaperSizeKey } from '@/lib/paperSizes'

interface Props { scale: number, maxScale: number, paddingX: number, paddingY: number, paperSize: PaperSizeKey, smartOnePage: boolean }
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:scale', v: number): void
  (e: 'update:paddingX', v: number): void
  (e: 'update:paddingY', v: number): void
  (e: 'update:paperSize', v: PaperSizeKey): void
  (e: 'update:smartOnePage', v: boolean): void
}>()

const scaleArr = ref<number[]>([props.scale])
watch(() => props.scale, (v) => { scaleArr.value = [v] })
watch(scaleArr, (v) => { const s = Array.isArray(v) ? (v[0] ?? 1) : 1; emit('update:scale', s) })

const x = ref<number>(props.paddingX ?? 24)
const y = ref<number>(props.paddingY ?? 24)
const xArr = ref<number[]>([x.value])
const yArr = ref<number[]>([y.value])
watch(() => props.paddingX, (v) => { x.value = Number(v ?? 24) })
watch(() => props.paddingY, (v) => { y.value = Number(v ?? 24) })
watch(x, (v) => { xArr.value = [v]; emit('update:paddingX', Math.min(80, Math.max(5, Number(v) || 0))) })
watch(y, (v) => { yArr.value = [v]; emit('update:paddingY', Math.min(80, Math.max(5, Number(v) || 0))) })
watch(xArr, (v) => { const s = Array.isArray(v) ? (v[0] ?? 24) : 24; x.value = Math.min(80, Math.max(5, s)) })
watch(yArr, (v) => { const s = Array.isArray(v) ? (v[0] ?? 24) : 24; y.value = Math.min(80, Math.max(5, s)) })

const paperSize = ref<PaperSizeKey>(props.paperSize ?? 'a4')
const paperSizeKeys = Object.keys(PAPER_SIZES) as PaperSizeKey[]
watch(() => props.paperSize, (v) => { paperSize.value = v ?? 'a4' })
watch(paperSize, (v) => emit('update:paperSize', v))

function toggleSmartOnePage() {
  if (paperSize.value === 'free') return
  emit('update:smartOnePage', !props.smartOnePage)
}
</script>

<template>
  <div class="p-2 space-y-3">
    <div>
      <PhotoUploadButton />
    </div>
    <div class="space-y-1">
      <div class="text-xs font-medium uppercase tracking-wide text-muted-foreground">纸张尺寸</div>
      <Select v-model="paperSize" class="w-full">
        <SelectTrigger size="sm" class="w-full">
          <SelectValue placeholder="选择纸张" />
        </SelectTrigger>
        <SelectContent class="w-full">
          <SelectItem v-for="key in paperSizeKeys" :key="key" :value="key">
            <SelectItemText>
              <div class="font-medium">{{ PAPER_SIZES[key].label }}</div>
              <div class="text-[11px] text-muted-foreground">{{ PAPER_SIZES[key].description }}</div>
            </SelectItemText>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <Button variant="secondary" size="sm" class="w-full" :disabled="paperSize === 'free'" :data-active="props.smartOnePage"
      :class="props.smartOnePage ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''" @click="toggleSmartOnePage">
      {{ props.smartOnePage ? '取消智能一页' : '智能一页' }}
    </Button>
    <div class="text-sm">缩放 {{ Math.round((scaleArr[0] ?? 1) * 100) }}%</div>
    <div class="flex items-center gap-2">
      <Button size="sm" variant="outline"
        @click="emit('update:scale', Math.max(0.2, +(((scaleArr[0] ?? 1) - 0.1).toFixed(2))))">-</Button>
      <Slider v-model="scaleArr" :min="0.2" :max="props.maxScale" :step="0.01" class="flex-1" />
      <Button size="sm" variant="outline"
        @click="emit('update:scale', Math.min(props.maxScale, +(((scaleArr[0] ?? 1) + 0.1).toFixed(2))))">+</Button>
    </div>

    <div class="space-y-2">
      <InputGroup>
         <InputGroupInput class="ps-1!" v-model.number="x" />
        <InputGroupAddon>
          <InputGroupText>左右边距</InputGroupText>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          px / 像素
        </InputGroupAddon>
      </InputGroup>
      <div class="mt-2">
        <Slider v-model="xArr" :min="5" :max="80" :step="1" />
      </div>
    </div>

    <div class="space-y-2">
    
      <InputGroup>
        <InputGroupInput class="ps-1!" v-model.number="y" />
        <InputGroupAddon>
          <InputGroupText>上下边距</InputGroupText>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          px / 像素
        </InputGroupAddon>
      </InputGroup>
      <div class="mt-2">
        <Slider v-model="yArr" :min="5" :max="80" :step="1" />
      </div>
    </div>
  </div>
</template>