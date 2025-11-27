import { useLocalStorage } from '@vueuse/core'

export const useCustomCss = () => {
  const customCss = useLocalStorage<string>('cv-custom-css', '')
  return { customCss }
}
