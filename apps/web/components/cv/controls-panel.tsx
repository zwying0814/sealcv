"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Download, Copy, Check, ZoomOut, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorState, PaperSize, Orientation, Margin } from "./editor-types";
import { PAPER_SIZES, MARGINS } from "./editor-types";

interface ControlsPanelProps {
  state: EditorState;
  onStateChange: (update: Partial<EditorState>) => void;
  onExport: () => void;
  onCopyMarkdown: () => void;
  copySuccess: boolean;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
      {children}
    </div>
  );
}

function SegmentedButton<T extends string>({
  value,
  label,
  selected,
  onClick,
}: {
  value: T;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-sm px-2 py-1.5 text-xs transition-colors",
        selected
          ? "bg-background text-foreground font-medium shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function SegmentedGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-0.5 rounded-md bg-muted/50 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => (
        <SegmentedButton
          key={opt.value}
          value={opt.value}
          label={opt.label}
          selected={value === opt.value}
          onClick={() => onChange(opt.value)}
        />
      ))}
    </div>
  );
}

export function ControlsPanel({
  state,
  onStateChange,
  onExport,
  onCopyMarkdown,
  copySuccess,
}: ControlsPanelProps) {
  const paperSizeOptions = (Object.keys(PAPER_SIZES) as PaperSize[]).map((k) => ({
    value: k,
    label: PAPER_SIZES[k].label,
  }));

  const marginOptions = (Object.keys(MARGINS) as Margin[]).map((k) => ({
    value: k,
    label: MARGINS[k].label,
  }));

  return (
    <aside className="flex flex-col min-h-0 min-w-0 overflow-hidden border-l bg-background print:hidden">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-5 p-4 pb-8">
          {/* Paper size */}
          <section className="flex flex-col gap-2">
            <SectionLabel>纸张大小</SectionLabel>
            <SegmentedGroup
              value={state.paperSize}
              options={paperSizeOptions}
              onChange={(v) => onStateChange({ paperSize: v })}
            />
            <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              默认 A4，210 × 297 mm
            </div>
          </section>

          <Separator />

          {/* Orientation */}
          <section className="flex flex-col gap-2">
            <SectionLabel>方向</SectionLabel>
            <SegmentedGroup
              value={state.orientation}
              options={[
                { value: "portrait" as Orientation, label: "纵向" },
                { value: "landscape" as Orientation, label: "横向" },
              ]}
              onChange={(v) => onStateChange({ orientation: v })}
            />
          </section>

          <Separator />

          {/* Smart layout */}
          <section className="flex flex-col gap-2">
            <SectionLabel>智能排版</SectionLabel>
            <div className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-2.5 py-2">
              <div>
                <div className="text-[13px] text-foreground leading-tight">智能一页</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">自动缩放内容至单页</div>
              </div>
              <Switch
                checked={state.smartFit}
                onCheckedChange={(v) => onStateChange({ smartFit: v })}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-2.5 py-2">
              <div>
                <div className="text-[13px] text-foreground leading-tight">紧凑段落</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">缩减段落间距 20%</div>
              </div>
              <Switch
                checked={state.compact}
                onCheckedChange={(v) => onStateChange({ compact: v })}
              />
            </div>
          </section>

          <Separator />

          {/* Margins */}
          <section className="flex flex-col gap-2">
            <SectionLabel>页边距</SectionLabel>
            <SegmentedGroup
              value={state.margin}
              options={marginOptions}
              onChange={(v) => onStateChange({ margin: v })}
            />
          </section>

          <Separator />

          {/* Font size + line height */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[13px] text-foreground">正文字号</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {state.fontSize.toFixed(1)} px
                </span>
              </div>
              <Slider
                min={11}
                max={17}
                step={0.5}
                value={[state.fontSize]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? (v[0] as number) : (v as number);
                  onStateChange({ fontSize: val });
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[13px] text-foreground">行高</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {state.lineHeight.toFixed(2)}
                </span>
              </div>
              <Slider
                min={1.35}
                max={1.85}
                step={0.02}
                value={[state.lineHeight]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? (v[0] as number) : (v as number);
                  onStateChange({ lineHeight: val });
                }}
              />
            </div>
          </section>

          <Separator />

          {/* Zoom */}
          <section className="flex flex-col gap-2">
            <SectionLabel>缩放</SectionLabel>
            <div className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onStateChange({ zoom: Math.max(50, state.zoom - 10) })}
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <Slider
                min={50}
                max={150}
                step={5}
                value={[state.zoom]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? (v[0] as number) : (v as number);
                  onStateChange({ zoom: val });
                }}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onStateChange({ zoom: Math.min(150, state.zoom + 10) })}
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <span className="font-mono text-xs text-foreground min-w-[44px] text-center">
                {state.zoom}%
              </span>
            </div>
          </section>

          <div className="mt-auto flex flex-col gap-2 pt-2">
            <Button className="w-full justify-center gap-1.5" onClick={onExport}>
              <Download className="h-3.5 w-3.5" />
              导出为 PDF
            </Button>
            <Button variant="outline" className="w-full justify-center gap-1.5" onClick={onCopyMarkdown}>
              {copySuccess ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  复制 Markdown
                </>
              )}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
