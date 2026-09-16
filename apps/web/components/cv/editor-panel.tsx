"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Minus,
} from "lucide-react";

type Monaco = typeof import("monaco-editor");

interface EditorPanelProps {
  markdown: string;
  onChange: (value: string) => void;
  customCss: string;
  onCustomCssChange: (value: string) => void;
  onReady?: () => void;
}

function ToolbarButton({
  icon: Icon,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function EditorPanel({
  markdown,
  onChange,
  customCss,
  onCustomCssChange,
  onReady,
}: EditorPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const mdModelRef = useRef<any>(null);
  const cssModelRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState("markdown");

  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);

  const handleToolbarAction = (kind: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    if (!selection) return;

    const model = editor.getModel();
    if (!model) return;

    const selectedText = model.getValueInRange(selection);
    let insertText = "";

    switch (kind) {
      case "h1":
        insertText = `# ${selectedText || "标题"}`;
        break;
      case "h2":
        insertText = `## ${selectedText || "标题"}`;
        break;
      case "h3":
        insertText = `### ${selectedText || "标题"}`;
        break;
      case "bold":
        insertText = `**${selectedText || "粗体"}**`;
        break;
      case "italic":
        insertText = `*${selectedText || "斜体"}*`;
        break;
      case "link":
        insertText = `[${selectedText || "链接文字"}](#)`;
        break;
      case "ul":
        insertText = `- ${selectedText || "列表项"}`;
        break;
      case "ol":
        insertText = `1. ${selectedText || "列表项"}`;
        break;
      case "quote":
        insertText = `> ${selectedText || "引用文字"}`;
        break;
      case "hr":
        insertText = "\n---\n";
        break;
    }

    editor.executeEdits("", [
      {
        range: selection,
        text: insertText,
        forceMoveMarkers: true,
      },
    ]);

    editor.focus();
  };

  useEffect(() => {
    let disposed = false;

    const initMonaco = async () => {
      // 配置 Monaco Web Worker（使用 Blob URL 方式，兼容 Next.js 环境）
      // @ts-ignore
      self.MonacoEnvironment = {
        getWorker: function (_moduleId: string, _label: string) {
          const workerCode = `
            self.onmessage = function(e) {
              if (e.data && e.data.type === 'initialize') {
                self.postMessage({ type: 'initialized' });
              }
            };
          `;
          const blob = new Blob([workerCode], { type: 'application/javascript' });
          return new Worker(URL.createObjectURL(blob));
        },
      };

      const monaco = await import("monaco-editor");

      // 新版本 Monaco (0.56.0+) 使用统一的语言包入口
      // @ts-expect-error - Monaco ESM contribution paths don't have type declarations
      await import("monaco-editor/basic-languages/monaco.contribution")
      // @ts-expect-error - Monaco ESM contribution paths don't have type declarations
      await import("monaco-editor/language/css/monaco.contribution");

      if (disposed || !containerRef.current) return;

      monacoRef.current = monaco;

      const mdModel = monaco.editor.createModel(markdown, "markdown");
      mdModelRef.current = mdModel;

      const cssModel = monaco.editor.createModel(customCss, "css");
      cssModelRef.current = cssModel;

      const editor = monaco.editor.create(containerRef.current, {
        model: mdModel,
        theme: "vs-light",
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        wordWrap: "on",
        renderWhitespace: "selection",
        quickSuggestions: false,
        suggestOnTriggerCharacters: false,
        fontFamily: 'Consolas, "Noto Sans SC", monospace',
      });

      editorRef.current = editor;

      mdModel.onDidChangeContent(() => {
        const value = mdModel.getValue();
        onChange(value);
        setCharCount(value.replace(/\s/g, "").length);
        setLineCount(value.split("\n").length);
      });

      cssModel.onDidChangeContent(() => {
        onCustomCssChange(cssModel.getValue());
      });

      setCharCount(markdown.replace(/\s/g, "").length);
      setLineCount(markdown.split("\n").length);

      // 编辑器初始化完成，通知父组件
      onReady?.();
    };

    initMonaco();

    return () => {
      disposed = true;
      mdModelRef.current?.dispose();
      cssModelRef.current?.dispose();
      editorRef.current?.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (activeTab === "markdown" && mdModelRef.current) {
      editor.setModel(mdModelRef.current);
    } else if (activeTab === "css" && cssModelRef.current) {
      editor.setModel(cssModelRef.current);
    }
  }, [activeTab]);

  useEffect(() => {
    const model = mdModelRef.current;
    if (!model) return;

    const currentValue = model.getValue();
    if (currentValue !== markdown) {
      model.setValue(markdown);
    }
  }, [markdown]);

  return (
    <div className="flex h-full flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
        <div className="border-b px-4 py-2">
          <TabsList>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
          </TabsList>
        </div>

        {activeTab === "markdown" && (
          <div className="flex items-center gap-1 border-b px-4 py-2">
            <ToolbarButton icon={Heading1} onClick={() => handleToolbarAction("h1")} />
            <ToolbarButton icon={Heading2} onClick={() => handleToolbarAction("h2")} />
            <ToolbarButton icon={Heading3} onClick={() => handleToolbarAction("h3")} />
            <div className="mx-1 h-4 w-px bg-border" />
            <ToolbarButton icon={Bold} onClick={() => handleToolbarAction("bold")} />
            <ToolbarButton icon={Italic} onClick={() => handleToolbarAction("italic")} />
            <ToolbarButton icon={Link} onClick={() => handleToolbarAction("link")} />
            <div className="mx-1 h-4 w-px bg-border" />
            <ToolbarButton icon={List} onClick={() => handleToolbarAction("ul")} />
            <ToolbarButton icon={ListOrdered} onClick={() => handleToolbarAction("ol")} />
            <ToolbarButton icon={Quote} onClick={() => handleToolbarAction("quote")} />
            <ToolbarButton icon={Minus} onClick={() => handleToolbarAction("hr")} />
          </div>
        )}

        <div className="relative flex-1">
          <div ref={containerRef} className="absolute inset-0" />
        </div>
      </Tabs>

      <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
        <span>字数: {charCount}</span>
        <span>行数: {lineCount}</span>
      </div>
    </div>
  );
}
