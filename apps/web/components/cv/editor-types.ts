export type PaperSize = "a4" | "letter" | "legal" | "b5" | "free";
export type Orientation = "portrait" | "landscape";

export interface EditorState {
  paperSize: PaperSize;
  orientation: Orientation;
  /** Horizontal page padding in px (5–80), mirrors the Vue ControlPanel */
  paddingX: number;
  /** Vertical page padding in px (5–80), mirrors the Vue ControlPanel */
  paddingY: number;
  smartFit: boolean;
  compact: boolean;
  fontSize: number;
  lineHeight: number;
  zoom: number;
}

export interface PaperSizeConfig {
  w: number;
  h: number;
  label: string;
  dim: string;
}

export const PAPER_SIZES: Record<PaperSize, PaperSizeConfig> = {
  a4: { w: 210, h: 297, label: "A4", dim: "210 × 297 mm" },
  letter: { w: 215.9, h: 279.4, label: "Letter", dim: "215.9 × 279.4 mm" },
  legal: { w: 215.9, h: 355.6, label: "Legal", dim: "215.9 × 355.6 mm" },
  b5: { w: 176, h: 250, label: "B5", dim: "176 × 250 mm" },
  free: { w: 210, h: 0, label: "自由", dim: "不分页" },
};

export function isFreeSize(size: PaperSize): boolean {
  return size === "free";
}

export function getPaperDim(size: PaperSize, isLandscape: boolean): string {
  if (isFreeSize(size)) return "不分页";
  const config = PAPER_SIZES[size];
  const w = isLandscape ? config.h : config.w;
  const h = isLandscape ? config.w : config.h;
  return `${w} × ${h} mm`;
}

export const PADDING_RANGE = { min: 5, max: 80 } as const;

export const DEFAULT_EDITOR_STATE: EditorState = {
  paperSize: "a4",
  orientation: "portrait",
  paddingX: 32,
  paddingY: 32,
  smartFit: false,
  compact: false,
  fontSize: 13.5,
  lineHeight: 1.58,
  zoom: 100,
};
