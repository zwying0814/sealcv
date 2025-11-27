export type PaperSizeKey = 'a4' | 'letter' | 'free'

export interface PaperSizeDefinition {
  label: string
  width: number
  height?: number
  description?: string
}

export const PAPER_SIZES: Record<PaperSizeKey, PaperSizeDefinition> = {
  a4: {
    label: 'A4 210 × 297 mm',
    width: 794,
    height: 1123,
    description: '标准 A4 大小'
  },
  letter: {
    label: 'Letter 8.5 × 11 in',
    width: 612,
    height: 792,
    description: '北美信纸'
  },
  free: {
    label: '自由尺寸',
    width: 794,
    description: '宽度与 A4 一致，内容高度自适应'
  },
}
