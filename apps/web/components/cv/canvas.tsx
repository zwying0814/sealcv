"use client";

import { useEffect, useRef, useState } from "react";
import type { EditorState } from "./editor-types";
import { PAPER_SIZES, isFreeSize } from "./editor-types";
import { cn } from "@/lib/utils";
import { PhotoOverlay } from "./photo-overlay";

interface CanvasProps {
  renderedHtml: string;
  state: EditorState;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  customCss?: string;
}

const MM_TO_PX = 3.7795;
const PAGE_GAP_PX = 24;

/**
 * Block-aware pagination (ported from the Vue MarkdownPreview):
 * measure every top-level block's offsetTop/offsetHeight inside a hidden
 * container of the exact content width, then greedily pack blocks into
 * pages so a block is never sliced across a page boundary.
 */
function paginateHtml(
  measureEl: HTMLElement,
  fallbackHtml: string,
  pageContentH: number,
): string[] {
  const article = measureEl.querySelector<HTMLElement>(".cv-resume");
  if (!article) return [fallbackHtml];
  const children = Array.from(article.children) as HTMLElement[];
  if (!children.length) return [article.innerHTML];

  const pages: string[] = [];
  let buf: string[] = [];
  let pageStartTop = 0;
  for (const ch of children) {
    const top = ch.offsetTop;
    const height = ch.offsetHeight;
    if (buf.length === 0) pageStartTop = top;
    const relBottom = top - pageStartTop + height;
    if (relBottom <= pageContentH) {
      buf.push(ch.outerHTML);
    } else {
      if (buf.length) pages.push(buf.join(""));
      buf = [ch.outerHTML];
      pageStartTop = top;
    }
  }
  if (buf.length) pages.push(buf.join(""));
  return pages.length ? pages : [fallbackHtml];
}

export function Canvas({ renderedHtml, state, customCss, canvasRef }: CanvasProps) {
  const paperWrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const smartCleanupRef = useRef<(() => void) | null>(null);

  // Per-page HTML blocks (paginated mode); null = not paginated / fallback.
  const [pages, setPages] = useState<string[] | null>(null);

  const size = PAPER_SIZES[state.paperSize];
  const paperWmm = size.w;
  const paperHmm = size.h;
  const freeMode = isFreeSize(state.paperSize);

  // px-based page padding, same model as the Vue ControlPanel (5–80px)
  const paddingX = state.paddingX;
  const paddingY = state.paddingY;
  const paddingCss = `${paddingY}px ${paddingX}px`;
  const paperWpx = paperWmm * MM_TO_PX;
  const paperHpx = paperHmm * MM_TO_PX;
  const contentWpx = Math.max(0, paperWpx - 2 * paddingX);
  const contentHpx = Math.max(0, paperHpx - 2 * paddingY);

  const displayPages = pages && pages.length ? pages : [renderedHtml];
  const pageCount = freeMode ? 1 : displayPages.length;

  const typographyStyle: React.CSSProperties = {
    fontSize: `${state.fontSize}px`,
    lineHeight: state.lineHeight,
  };

  // ── Measure block offsets & pack them into pages ────────────────
  // Runs after the DOM commit, so offsetTop/offsetHeight reflect the
  // current typography / compact styles applied inline on the article.
  // Smart one-page forces a single page (adjusted afterwards by the
  // smart-layout effect), mirroring Vue's forceSinglePage.
  useEffect(() => {
    if (freeMode) {
      setPages(null);
      return;
    }
    if (state.smartFit) {
      setPages([renderedHtml]);
      return;
    }
    const el = measureRef.current;
    if (!el) return;
    if (!renderedHtml.trim()) {
      setPages([""]);
      return;
    }
    setPages(paginateHtml(el, renderedHtml, contentHpx));
  }, [
    renderedHtml,
    contentHpx,
    freeMode,
    state.smartFit,
    state.fontSize,
    state.lineHeight,
    state.compact,
    state.paperSize,
    paddingX,
    paddingY,
  ]);

  // ── Smart one-page layout (ported from Vue applySmartLayout) ────
  // Expand block margins to fill leftover space, or shrink margins &
  // line heights proportionally when content overflows.
  useEffect(() => {
    const clearSmart = () => {
      smartCleanupRef.current?.();
      smartCleanupRef.current = null;
    };
    if (freeMode || !state.smartFit) {
      clearSmart();
      return;
    }
    const raf = requestAnimationFrame(() => {
      clearSmart();
      const pageEl = document.querySelector<HTMLElement>(".cv-pages .cv-resume");
      if (!pageEl) return;
      const available = contentHpx;
      if (!available) return;
      const contentHeight = pageEl.scrollHeight;
      if (!contentHeight) return;
      const blocks = Array.from(pageEl.children).filter(
        (n): n is HTMLElement => n instanceof HTMLElement,
      );
      if (!blocks.length) return;
      const delta = available - contentHeight;
      if (Math.abs(delta) < 2) return;
      const tasks: Array<() => void> = [];
      if (delta >= 0) {
        const per = delta / blocks.length;
        blocks.forEach((el) => {
          const prevBottom = el.style.marginBottom;
          tasks.push(() => {
            el.style.marginBottom = prevBottom;
          });
          const marginBottom = parseFloat(getComputedStyle(el).marginBottom || "0");
          el.style.marginBottom = `${Math.max(0, marginBottom + per)}px`;
        });
      } else {
        const ratio = available / contentHeight;
        blocks.forEach((el) => {
          const prevBottom = el.style.marginBottom;
          const prevLine = el.style.lineHeight;
          tasks.push(() => {
            el.style.marginBottom = prevBottom;
            el.style.lineHeight = prevLine;
          });
          const style = getComputedStyle(el);
          const marginBottom = parseFloat(style.marginBottom || "0");
          const lineHeight = parseFloat(style.lineHeight || "0");
          if (marginBottom) {
            el.style.marginBottom = `${Math.max(2, marginBottom * ratio)}px`;
          }
          if (isFinite(lineHeight) && lineHeight > 0) {
            el.style.lineHeight = `${Math.max(14, lineHeight * ratio)}px`;
          }
        });
      }
      smartCleanupRef.current = () => tasks.forEach((fn) => fn());
    });
    return () => {
      cancelAnimationFrame(raf);
      clearSmart();
    };
  }, [
    freeMode,
    state.smartFit,
    pageCount,
    contentHpx,
    renderedHtml,
    state.fontSize,
    state.lineHeight,
    state.compact,
    paddingX,
    paddingY,
  ]);

  // ── Zoom ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvasEl = canvasRef.current;
    const wrapEl = paperWrapRef.current;
    if (!canvasEl || !wrapEl) return;

    const update = () => {
      const canvasRect = canvasEl.getBoundingClientRect();
      const paperPx = paperWmm * MM_TO_PX;
      const available = canvasRect.width - 80;
      const autoScale = Math.min(1, available / paperPx);
      const scale = autoScale * (state.zoom / 100);
      wrapEl.style.transform = `scale(${scale.toFixed(3)})`;
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [paperWmm, state.zoom, canvasRef]);

  // ── Dynamic @page size injection for printing ───────────────────
  useEffect(() => {
    const STYLE_ID = "cv-page-style";
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

    if (freeMode) {
      el?.remove();
      return;
    }

    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = `@page { size: ${paperWmm}mm ${paperHmm}mm; margin: 0; }`;
    return () => { el?.remove(); };
  }, [paperWmm, paperHmm, freeMode]);

  return (
    <section
      className="cv-canvas bg-muted relative min-w-0 overflow-auto flex justify-center p-[32px_24px_72px] print:bg-white print:p-0 print:overflow-visible"
      ref={canvasRef}
    >
      {/* Inject user custom CSS into preview */}
      {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
      {/* Scaled wrapper */}
      <div
        className="cv-paper-wrap origin-top shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)]"
        ref={paperWrapRef}
      >
        {freeMode ? (
          /* ── Free size: single continuous page ─────────────────── */
          <div
            className="cv-paper cv-free relative rounded-xs bg-background print:shadow-none"
            style={{
              width: `${paperWmm}mm`,
              minHeight: "auto",
              boxShadow:
                "0 1px 2px hsl(var(--foreground)/0.06), 0 8px 24px -6px hsl(var(--foreground)/0.12)",
            }}
          >
            <div style={{ padding: paddingCss }}>
              <article
                className={cn("cv-resume", state.compact && "is-compact")}
                style={typographyStyle}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
            <PhotoOverlay />
          </div>
        ) : (
          /* ── Paginated: one paper per packed page (block-aware) ── */
          <div
            className="cv-pages flex flex-col items-center print:gap-0!"
            style={{ gap: `${PAGE_GAP_PX}px` }}
          >
            {displayPages.map((pageHtml, i) => (
              <div
                key={i}
                className="cv-paper relative overflow-hidden rounded-xs bg-background print:rounded-none print:shadow-none"
                style={{
                  width: `${paperWmm}mm`,
                  height: `${paperHmm}mm`,
                  padding: paddingCss,
                  boxSizing: "border-box",
                  boxShadow:
                    "0 1px 2px hsl(var(--foreground)/0.06), 0 8px 24px -6px hsl(var(--foreground)/0.12)",
                }}
              >
                <article
                  className={cn("cv-resume", state.compact && "is-compact")}
                  style={typographyStyle}
                  dangerouslySetInnerHTML={{ __html: pageHtml }}
                />
                {i === 0 && <PhotoOverlay />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden measurement container — same content width as a page */}
      <div
        ref={measureRef}
        className="cv-measure"
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: `${contentWpx}px`,
          visibility: "hidden",
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <article
          className={cn("cv-resume", state.compact && "is-compact")}
          style={typographyStyle}
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </section>
  );
}
