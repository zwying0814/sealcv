"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { marked } from "marked";
import { Topbar } from "@/components/cv/topbar";
import { EditorPanel } from "@/components/cv/editor-panel";
import { Canvas } from "@/components/cv/canvas";
import { ControlsPanel } from "@/components/cv/controls-panel";
import { DEFAULT_RESUME } from "@/components/cv/default-resume";
import type { EditorState } from "@/components/cv/editor-types";
import { DEFAULT_EDITOR_STATE } from "@/components/cv/editor-types";
import "@/app/cv/editor.css";

marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function ResumeEditor() {
  const [docTitle, setDocTitle] = useState("林清和_高级产品设计师.md");
  const [markdown, setMarkdown] = useState(DEFAULT_RESUME);
  const [renderedHtml, setRenderedHtml] = useState("");
  const [editorState, setEditorState] = useState<EditorState>(DEFAULT_EDITOR_STATE);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderedHtml(marked.parse(markdown) as string);
    }, 60);
    return () => clearTimeout(timer);
  }, [markdown]);

  const charCount = markdown.replace(/\s/g, "").length;
  const lineCount = markdown.split("\n").length;

  const handleStateChange = useCallback((update: Partial<EditorState>) => {
    setEditorState((prev) => ({ ...prev, ...update }));
  }, []);

  const handleUndo = useCallback(() => {
    textareaRef.current?.focus();
    document.execCommand("undo");
  }, []);

  const handlePreview = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);

  const handleExport = useCallback(() => {
    window.print();
  }, []);

  const handleCopyMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1400);
    } catch {
      /* noop */
    }
  }, [markdown]);

  return (
    <div className="grid h-screen w-screen grid-rows-[48px_1fr] overflow-hidden bg-muted/35 print:block print:h-auto print:overflow-visible">
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
            charCount={charCount}
            lineCount={lineCount}
            textareaRef={textareaRef}
          />
        )}
        <Canvas
          renderedHtml={renderedHtml}
          state={editorState}
          canvasRef={canvasRef}
        />
        {!isPreviewMode && (
          <ControlsPanel
            state={editorState}
            onStateChange={handleStateChange}
            onExport={handleExport}
            onCopyMarkdown={handleCopyMarkdown}
            copySuccess={copySuccess}
          />
        )}
      </div>
    </div>
  );
}
