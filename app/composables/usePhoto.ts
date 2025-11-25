import { useStorage } from '@vueuse/core'

export interface PhotoState {
  src: string
  x: number
  y: number
  width: number
}

export const usePhoto = () => {
  const photo = useStorage<PhotoState>('cv-photo-storage', {
    src: '',
    x: 80, // default position
    y: 5,
    width: 15,
  })

  return { photo }
}
