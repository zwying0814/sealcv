export type PaperSize = "a4" | "letter" | "legal" | "b5";
export type Orientation = "portrait" | "landscape";
export type Margin = "none" | "narrow" | "normal" | "wide";

export interface EditorState {
  paperSize: PaperSize;
  orientation: Orientation;
  margin: Margin;
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
};

export const MARGINS: Record<Margin, { v: string; h: string; label: string }> = {
  none: { v: "10mm", h: "12mm", label: "无" },
  narrow: { v: "14mm", h: "16mm", label: "窄" },
  normal: { v: "20mm", h: "18mm", label: "正常" },
  wide: { v: "26mm", h: "24mm", label: "宽" },
};

export const DEFAULT_EDITOR_STATE: EditorState = {
  paperSize: "a4",
  orientation: "portrait",
  margin: "normal",
  smartFit: false,
  compact: false,
  fontSize: 13.5,
  lineHeight: 1.58,
  zoom: 100,
};
