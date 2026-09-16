"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { marked } from "marked";
import { snapdom } from "@zumer/snapdom";
import { jsPDF } from "jspdf";
import { Topbar } from "@/components/cv/topbar";
import { EditorPanel } from "@/components/cv/editor-panel";
import { Canvas } from "@/components/cv/canvas";
import { ControlsPanel } from "@/components/cv/controls-panel";
import { LoadingSkeleton } from "@/components/cv/loading-skeleton";
import { DEFAULT_RESUME } from "@/components/cv/default-resume";
import type { EditorState } from "@/components/cv/editor-types";
import { DEFAULT_EDITOR_STATE } from "@/components/cv/editor-types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  registerEqualSplitRowExtension,
  registerCenterLineExtension,
  registerIconInlineExtension,
  registerStrongAdjacencyFix,
} from "@/lib/marked-extensions";
import "@/app/cv/editor.css";

marked.setOptions({
  breaks: true,
  gfm: true,
});

let markedExtensionsRegistered = false;
function ensureMarkedExtensions() {
  if (markedExtensionsRegistered) return;
  registerEqualSplitRowExtension();
  registerCenterLineExtension();
  registerIconInlineExtension();
  registerStrongAdjacencyFix();
  markedExtensionsRegistered = true;
}

export default function ResumeEditor() {
  const [docTitle, setDocTitle] = useState("林清和_高级产品设计师.md");
  const [markdown, setMarkdown] = useState(DEFAULT_RESUME);
  const [renderedHtml, setRenderedHtml] = useState("");
  const [editorState, setEditorState] = useState<EditorState>(DEFAULT_EDITOR_STATE);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [customCss, setCustomCss] = useLocalStorage("cv-custom-css", "");
  const [editorReady, setEditorReady] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureMarkedExtensions();

    // Load Iconify web component for icon= syntax
    if (!document.querySelector('script[src*="iconify-icon"]')) {
      const script = document.createElement('script');
      script.src = 'https://code.iconify.design/3/3.1.0/iconify.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderedHtml(marked.parse(markdown) as string);
    }, 60);
    return () => clearTimeout(timer);
  }, [markdown]);

  const handleStateChange = useCallback((update: Partial<EditorState>) => {
    setEditorState((prev) => ({ ...prev, ...update }));
  }, []);

  const handleUndo = useCallback(() => {
    // Monaco 编辑器有自己的撤销机制，这里只是保留接口
    document.execCommand("undo");
  }, []);

  const handlePreview = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);

  // PDF export ported from the Vue ControlPanel: snapdom renders every
  // .cv-paper page to a canvas, jsPDF stitches them into one PDF.
  // Falls back to the browser print dialog on failure.
  const handleExport = useCallback(async () => {
    if (exporting) return;
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".cv-pages .cv-paper, .cv-paper.cv-free"),
    );
    if (!nodes.length) {
      window.print();
      return;
    }
    setExporting(true);
    // Neutralize the zoom transform so snapdom captures natural size.
    const wrap = document.querySelector<HTMLElement>(".cv-paper-wrap");
    const prevTransform = wrap?.style.transform ?? "";
    if (wrap) wrap.style.transform = "none";
    try {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const captureScale = Math.min(4, Math.max(2, devicePixelRatio * 2));
      const canvases: HTMLCanvasElement[] = [];
      for (const node of nodes) {
        const canvas = await snapdom.toCanvas(node, {
          embedFonts: true,
          outerTransforms: true,
          outerShadows: false,
          scale: captureScale,
        });
        canvases.push(canvas);
      }
      const pxToPt = (px: number) => (px * 72) / 96;
      const first = canvases[0];
      if (!first) {
        window.print();
        return;
      }
      const initialWidthPt = pxToPt(first.width);
      const initialHeightPt = pxToPt(first.height);
      const orientation = initialWidthPt > initialHeightPt ? "l" : "p";
      const pdf = new jsPDF({
        orientation,
        unit: "pt",
        format: [initialWidthPt, initialHeightPt],
      });
      canvases.forEach((canvas, idx) => {
        if (idx > 0) {
          const wPt = pxToPt(canvas.width);
          const hPt = pxToPt(canvas.height);
          pdf.addPage([wPt, hPt], wPt > hPt ? "l" : "p");
        }
        const widthPt = pxToPt(canvas.width);
        const heightPt = pxToPt(canvas.height);
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, widthPt, heightPt, undefined, "FAST");
      });
      const base = docTitle.replace(/\.md$/i, "").trim() || "sealcv";
      pdf.save(`${base}.pdf`);
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      if (wrap) wrap.style.transform = prevTransform;
      setExporting(false);
    }
  }, [exporting, docTitle]);

  const handleCopyMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1400);
    } catch {
      /* noop */
    }
  }, [markdown]);

  const handleEditorReady = useCallback(() => {
    setEditorReady(true);
  }, []);

  return (
    <>
      {!editorReady && <LoadingSkeleton />}
      <div
        className={`fixed inset-0 grid h-screen w-screen grid-rows-[48px_1fr] overflow-hidden bg-muted/35 transition-opacity duration-300 ${!editorReady && 'pointer-events-none'}`}
        style={{ opacity: editorReady ? 1 : 0 }}
      >
        <Topbar
          docTitle={docTitle}
          onDocTitleChange={setDocTitle}
          onUndo={handleUndo}
          onPreview={handlePreview}
          onExport={handleExport}
          isPreviewMode={isPreviewMode}
        />
        <div
          className="grid h-full min-h-0 min-w-0 grid-cols-[420px_1fr_260px] print:block
          [@media(max-width:1100px)]:grid-cols-[340px_1fr_240px]
          [@media(max-width:920px)]:grid-cols-1 [@media(max-width:920px)]:grid-rows-[auto_1fr_auto]"
          style={isPreviewMode ? { gridTemplateColumns: "0 1fr 0" } : undefined}
        >
          {!isPreviewMode && (
            <EditorPanel
              markdown={markdown}
              onChange={setMarkdown}
              customCss={customCss}
              onCustomCssChange={setCustomCss}
              onReady={handleEditorReady}
            />
          )}
          <Canvas
            renderedHtml={renderedHtml}
            state={editorState}
            customCss={customCss}
            canvasRef={canvasRef}
          />
          {!isPreviewMode && (
            <ControlsPanel
              state={editorState}
              onStateChange={handleStateChange}
              onExport={handleExport}
              onCopyMarkdown={handleCopyMarkdown}
              copySuccess={copySuccess}
              exporting={exporting}
            />
          )}
        </div>
      </div>
    </>
  );
}
