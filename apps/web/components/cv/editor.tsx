"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { marked } from "marked";
import { snapdom } from "@zumer/snapdom";
import { jsPDF } from "jspdf";
import { Topbar } from "@/components/cv/topbar";
import { Button } from "@/components/ui/button";
import { EditorPanel } from "@/components/cv/editor-panel";
import { Canvas } from "@/components/cv/canvas";
import { ControlsPanel } from "@/components/cv/controls-panel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { LoadingSkeleton } from "@/components/cv/loading-skeleton";
import { DEFAULT_RESUME } from "@/components/cv/default-resume";
import type { EditorState } from "@/components/cv/editor-types";
import { DEFAULT_EDITOR_STATE } from "@/components/cv/editor-types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { PencilRuler, View, Settings } from "lucide-react";
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
  const [docTitle, setDocTitle] = useState("简历.md");
  const [markdown, setMarkdown] = useState(DEFAULT_RESUME);
  const [renderedHtml, setRenderedHtml] = useState("");
  const [editorState, setEditorState] = useState<EditorState>(DEFAULT_EDITOR_STATE);
  const [copySuccess, setCopySuccess] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [customCss, setCustomCss] = useLocalStorage("cv-custom-css", "");
  const [editorReady, setEditorReady] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  // Below 920px the editor stacks vertically and resizing is disabled.
  // Only one layout is mounted at a time because Canvas and the PDF export
  // rely on document-wide selectors (.cv-pages .cv-resume, .cv-paper, @page).
  const isNarrow = useMediaQuery("(max-width: 920px)");
  // Phones get a tabbed editor/preview layout ported from the Vue version.
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    ensureMarkedExtensions();

    // Load Iconify web component for icon= syntax
    if (!document.querySelector('script[src*="iconify-icon"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdmirror.com/npm/iconify-icon@3.0.3/dist/iconify-icon.min.js';
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
        className={`fixed inset-0 grid h-dvh w-screen grid-rows-[48px_1fr] overflow-hidden bg-muted/35 transition-opacity duration-300 ${!editorReady && 'pointer-events-none'}`}
        style={{ opacity: editorReady ? 1 : 0 }}
      >
        <Topbar
          docTitle={docTitle}
          onDocTitleChange={setDocTitle}
          onExport={handleExport}
        />
        {isNarrow ? (
          isMobile ? (
            /* ── Mobile: editor / preview tabs + settings drawer ── */
            <div className="flex h-full min-h-0 min-w-0 flex-col print:hidden">
              <div className="min-h-0 flex-1 overflow-hidden">
                <div
                  className="h-full p-1"
                  hidden={mobileTab !== "editor"}
                >
                  <EditorPanel
                    markdown={markdown}
                    onChange={setMarkdown}
                    customCss={customCss}
                    onCustomCssChange={setCustomCss}
                    onReady={handleEditorReady}
                  />
                </div>
                <div
                  className="relative h-full"
                  hidden={mobileTab !== "preview"}
                >
                  <Canvas
                    renderedHtml={renderedHtml}
                    state={editorState}
                    customCss={customCss}
                    canvasRef={canvasRef}
                  />

                  <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <Button
                      size="icon"
                      aria-label="打开设置"
                      className="absolute right-4 bottom-4 size-12 rounded-full shadow-lg"
                      onClick={() => setSettingsOpen(true)}
                    >
                      <Settings className="size-5" />
                    </Button>
                    <DrawerContent className="max-h-[85dvh]">
                      <DrawerHeader className="text-left">
                        <DrawerTitle>设置</DrawerTitle>
                      </DrawerHeader>
                      <div className="min-h-0 flex-1 overflow-y-auto">
                        <ControlsPanel
                          state={editorState}
                          onStateChange={handleStateChange}
                          onExport={handleExport}
                          onCopyMarkdown={handleCopyMarkdown}
                          copySuccess={copySuccess}
                          exporting={exporting}
                        />
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              </div>

              <nav className="flex shrink-0 justify-around border-t bg-card px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  className={`flex flex-col items-center gap-1 rounded-lg px-6 py-1.5 transition-colors ${
                    mobileTab === "editor"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileTab("editor")}
                >
                  <PencilRuler className="size-5" />
                  <span className="text-xs font-medium">编辑</span>
                </button>
                <button
                  type="button"
                  className={`flex flex-col items-center gap-1 rounded-lg px-6 py-1.5 transition-colors ${
                    mobileTab === "preview"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileTab("preview")}
                >
                  <View className="size-5" />
                  <span className="text-xs font-medium">预览</span>
                </button>
              </nav>
            </div>
          ) : (
            /* ── Tablet: stacked editor / preview / settings ── */
            <div className="grid h-full min-h-0 min-w-0 grid-cols-1 grid-rows-[auto_1fr_auto] print:block">
              <EditorPanel
                markdown={markdown}
                onChange={setMarkdown}
                customCss={customCss}
                onCustomCssChange={setCustomCss}
                onReady={handleEditorReady}
              />
              <Canvas
                renderedHtml={renderedHtml}
                state={editorState}
                customCss={customCss}
                canvasRef={canvasRef}
              />
              <ControlsPanel
                state={editorState}
                onStateChange={handleStateChange}
                onExport={handleExport}
                onCopyMarkdown={handleCopyMarkdown}
                copySuccess={copySuccess}
                exporting={exporting}
              />
            </div>
          )
        ) : (
          <div className="flex h-full min-h-0 min-w-0 print:hidden">
            <ResizablePanelGroup
              orientation="horizontal"
              className="h-full min-h-0 min-w-0 flex-1"
            >
              <ResizablePanel defaultSize="420px" minSize="280px" className="min-w-0">
                <EditorPanel
                  markdown={markdown}
                  onChange={setMarkdown}
                  customCss={customCss}
                  onCustomCssChange={setCustomCss}
                  onReady={handleEditorReady}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize="52%" minSize="280px" className="min-w-0">
                <Canvas
                  renderedHtml={renderedHtml}
                  state={editorState}
                  customCss={customCss}
                  canvasRef={canvasRef}
                />
              </ResizablePanel>
            </ResizablePanelGroup>

            {/* Fixed-width settings column — never participates in resizing */}
            <div className="flex w-[260px] shrink-0">
              <ControlsPanel
                state={editorState}
                onStateChange={handleStateChange}
                onExport={handleExport}
                onCopyMarkdown={handleCopyMarkdown}
                copySuccess={copySuccess}
                exporting={exporting}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
