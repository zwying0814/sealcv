"use client";

import { useEffect, useRef } from "react";
import type { EditorState } from "./editor-types";
import { PAPER_SIZES, MARGINS } from "./editor-types";
import { cn } from "@/lib/utils";

interface CanvasProps {
  renderedHtml: string;
  state: EditorState;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function Canvas({ renderedHtml, state, canvasRef }: CanvasProps) {
  const paperWrapRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const paperPadRef = useRef<HTMLDivElement>(null);

  const size = PAPER_SIZES[state.paperSize];
  const isLandscape = state.orientation === "landscape";
  const paperWmm = isLandscape ? size.h : size.w;
  const paperHmm = isLandscape ? size.w : size.h;
  const margin = MARGINS[state.margin];

  // Apply zoom + smart fit
  useEffect(() => {
    const canvasEl = canvasRef.current;
    const wrapEl = paperWrapRef.current;
    const paperEl = paperRef.current;
    const padEl = paperPadRef.current;
    if (!canvasEl || !wrapEl || !paperEl || !padEl) return;

    const update = () => {
      const canvasRect = canvasEl.getBoundingClientRect();
      const paperPx = paperWmm * 3.7795; // mm → px at 96dpi
      const available = canvasRect.width - 80;
      const autoScale = Math.min(1, available / paperPx);
      const scale = autoScale * (state.zoom / 100);

      paperEl.style.width = `${paperWmm}mm`;
      paperEl.style.minHeight = `${paperHmm}mm`;
      padEl.style.padding = `${margin.v} ${margin.h}`;
      wrapEl.style.transform = `scale(${scale.toFixed(3)})`;

      // Smart fit
      if (!state.smartFit) {
        paperEl.classList.remove("smart-fit");
        padEl.style.transform = "";
        padEl.style.height = "";
        return;
      }

      const paperH = paperEl.getBoundingClientRect().height / scale;
      const contentH = padEl.scrollHeight;

      if (contentH > paperH - 2) {
        const fitScale = (paperH - 2) / contentH;
        padEl.style.transform = `scale(${fitScale.toFixed(3)})`;
        padEl.style.height = `${(100 / fitScale).toFixed(2)}%`;
        paperEl.classList.add("smart-fit");
      } else {
        padEl.style.transform = "";
        padEl.style.height = "";
        paperEl.classList.remove("smart-fit");
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [paperWmm, paperHmm, margin.v, margin.h, state.zoom, state.smartFit, renderedHtml, canvasRef]);

  // Apply resume typography
  useEffect(() => {
    const padEl = paperPadRef.current;
    if (!padEl) return;
    const resumeEl = padEl.querySelector<HTMLElement>(".cv-resume");
    if (resumeEl) {
      resumeEl.style.fontSize = `${state.fontSize}px`;
      resumeEl.style.lineHeight = String(state.lineHeight);
    }
  }, [state.fontSize, state.lineHeight, renderedHtml]);

  const statusText = `第 1 页 · ${size.label}${isLandscape ? " · 横向" : ""} · ${size.dim}`;

  return (
    <section
      className="cv-canvas bg-muted relative min-w-0 overflow-auto flex justify-center p-[32px_24px_72px] print:bg-white print:p-0 print:overflow-visible"
      ref={canvasRef}
    >
      <div
        className="cv-paper-wrap origin-top shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)]"
        ref={paperWrapRef}
      >
        <div
          className="cv-paper relative rounded-[2px] bg-background print:shadow-none print:w-auto print:min-h-auto"
          style={{
            boxShadow:
              "0 1px 2px hsl(var(--foreground)/0.06), 0 8px 24px -6px hsl(var(--foreground)/0.12)",
          }}
          ref={paperRef}
        >
          <div className="origin-top-left" ref={paperPadRef}>
            <article
              className={cn("cv-resume", state.compact && "is-compact")}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        </div>
      </div>
      <div className="absolute left-1/2 bottom-[18px] -translate-x-1/2 inline-flex items-center gap-3 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap pointer-events-none shadow-[0_1px_2px_hsl(var(--foreground)/0.04),0_1px_3px_hsl(var(--foreground)/0.06)] print:hidden">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        <span>{statusText}</span>
      </div>
    </section>
  );
}
