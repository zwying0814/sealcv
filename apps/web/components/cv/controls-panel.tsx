"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Copy, Check, ZoomOut, ZoomIn, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhoto } from "@/hooks/use-photo";
import type { EditorState, PaperSize } from "./editor-types";
import { PAPER_SIZES, isFreeSize, PADDING_RANGE } from "./editor-types";
import React from "react";

interface ControlsPanelProps {
  state: EditorState;
  onStateChange: (update: Partial<EditorState>) => void;
  onExport: () => void;
  onCopyMarkdown: () => void;
  copySuccess: boolean;
  exporting: boolean;
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

/**
 * Numeric input + slider pair. The raw text keeps its own state so typing
 * is not fought by clamping; committed values are clamped to [min, max]
 * and rounded to `precision` decimals (0 → integers).
 */
function NumberControl({
  label,
  value,
  min,
  max,
  step,
  precision = 0,
  unit = "px",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  precision?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const format = (n: number) => String(Number(n.toFixed(precision)));
  const [raw, setRaw] = useState(format(value));
  useEffect(() => {
    setRaw(format(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (v: string | number) => {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(max, Math.max(min, n));
    onChange(precision > 0 ? Number(clamped.toFixed(precision)) : Math.round(clamped));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-foreground flex-1">{label}</span>
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            commit(e.target.value);
          }}
          onBlur={() => commit(raw)}
          className="h-7 w-16 px-1.5 text-right font-mono text-xs"
        />
        <span className="text-[11px] text-muted-foreground w-4">{unit}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => {
          const val = Array.isArray(v) ? (v[0] as number) : (v as number);
          commit(val);
        }}
      />
    </div>
  );
}

export function ControlsPanel({
  state,
  onStateChange,
  onExport,
  onCopyMarkdown,
  copySuccess,
  exporting,
}: ControlsPanelProps) {
  const { photo, setPhoto } = usePhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paperSizeOptions = (Object.keys(PAPER_SIZES) as PaperSize[]).map((k) => ({
    value: k,
    label: PAPER_SIZES[k].label,
    dim: PAPER_SIZES[k].dim,
  }));

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhoto({ ...photo, src: base64 });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <aside className="flex flex-col min-h-0 min-w-0 overflow-hidden border-l bg-background print:hidden">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-5 p-4 pb-8">
          {/* Paper size */}
          <section className="flex flex-col gap-2">
            <SectionLabel>纸张大小</SectionLabel>
            <Select
              value={state.paperSize}
              items={paperSizeOptions}
              onValueChange={(v) => {
                if (v) onStateChange({ paperSize: v });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paperSizeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-[11px] text-muted-foreground">{opt.dim}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              {isFreeSize(state.paperSize)
                ? "自由尺寸，内容不分页"
                : `默认 ${PAPER_SIZES[state.paperSize].label}，${PAPER_SIZES[state.paperSize].dim}`}
            </div>
          </section>

          <Separator />

          {/* Photo upload */}
          <section className="flex flex-col gap-2">
            <SectionLabel>证件照</SectionLabel>
            <Button variant="outline" className="w-full justify-center gap-1.5" onClick={handlePhotoUpload}>
              <Upload className="h-3.5 w-3.5" />
              {photo.src ? "更换照片" : "上传照片"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {photo.src && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-1 truncate">已上传证件照</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setPhoto({ ...photo, src: "" })}
                >
                  移除
                </Button>
              </div>
            )}
          </section>

          <Separator />

          {/* Smart layout */}
          <section className="flex flex-col gap-2">
            <SectionLabel>智能排版</SectionLabel>
            <div className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-2.5 py-2">
              <div>
                <div className="text-[13px] text-foreground leading-tight">智能一页</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {isFreeSize(state.paperSize)
                    ? "自由尺寸模式下不可用"
                    : "强制单页，自动调整块间距/行高容纳内容"}
                </div>
              </div>
              <Switch
                checked={state.smartFit}
                onCheckedChange={(v) => onStateChange({ smartFit: v })}
                disabled={isFreeSize(state.paperSize)}
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

          {/* Margins — px numeric input + slider, ported from Vue */}
          <section className="flex flex-col gap-2">
            <SectionLabel>页边距</SectionLabel>
            <NumberControl
              label="左右边距"
              value={state.paddingX}
              min={PADDING_RANGE.min}
              max={PADDING_RANGE.max}
              step={1}
              onChange={(v) => onStateChange({ paddingX: v })}
            />
            <NumberControl
              label="上下边距"
              value={state.paddingY}
              min={PADDING_RANGE.min}
              max={PADDING_RANGE.max}
              step={1}
              onChange={(v) => onStateChange({ paddingY: v })}
            />
          </section>

          <Separator />

          {/* Line height — input + slider, same pattern as margins */}
          <section className="flex flex-col gap-2">
            <SectionLabel>行高</SectionLabel>
            <NumberControl
              label="倍率"
              value={state.lineHeight}
              min={1.35}
              max={1.85}
              step={0.02}
              precision={2}
              unit=""
              onChange={(v) => onStateChange({ lineHeight: v })}
            />
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
              <span className="font-mono text-xs text-foreground min-w-11 text-center">
                {state.zoom}%
              </span>
            </div>
          </section>

          <div className="mt-auto flex flex-col gap-2 pt-2">
            <Button className="w-full justify-center gap-1.5" onClick={onExport} disabled={exporting}>
              <Download className={cn("h-3.5 w-3.5", exporting && "animate-pulse")} />
              {exporting ? "导出中..." : "导出为 PDF"}
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
