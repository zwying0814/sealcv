<script setup lang="ts">
import { ref } from 'vue'
import { usePhoto } from '@/composables/usePhoto'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { ImageUp } from 'lucide-vue-next'

const { photo } = usePhoto()
const fileInput = ref<HTMLInputElement | null>(null)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
    toast.error('只支持 JPG/PNG 图片')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      photo.value.src = e.target.result as string
      // Ensure visible
      if (photo.value.width <= 0) photo.value.width = 15
      if (photo.value.x === undefined) photo.value.x = 80
      if (photo.value.y === undefined) photo.value.y = 5
      
      toast.success('证件照已上传')
    }
  }
  reader.readAsDataURL(file)
  input.value = '' // reset
}

function triggerUpload() {
  fileInput.value?.click()
}
</script>

<template>
  <div class="w-full">
    <Button variant="outline" class="w-full" @click="triggerUpload">
      <ImageUp />
      上传证件照
    </Button>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/jpg"
      class="hidden"
      @change="onFileChange"
    />
  </div>
</template>
