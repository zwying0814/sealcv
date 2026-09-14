"use client";

import { useRef } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, Type, Heading1, Heading2, Heading3, Bold, Italic, List, ListOrdered, Quote, Minus } from "lucide-react";

interface EditorPanelProps {
  markdown: string;
  onChange: (value: string) => void;
  charCount: number;
  lineCount: number;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

type MarkdownKind =
  | "heading"
  | "h2"
  | "h3"
  | "bold"
  | "italic"
  | "link"
  | "ul"
  | "ol"
  | "quote"
  | "hr";

function insertMarkdown(
  ta: HTMLTextAreaElement,
  kind: MarkdownKind,
  onChange: (value: string) => void
) {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = ta.value.slice(start, end);
  let before = "",
    after = "",
    insert = "";

  switch (kind) {
    case "heading": before = "# "; break;
    case "h2": before = "## "; break;
    case "h3": before = "### "; break;
    case "bold": before = "**"; after = "**"; break;
    case "italic": before = "_"; after = "_"; break;
    case "link": before = "["; after = "](#)"; break;
    case "ul": before = "- "; break;
    case "ol": before = "1. "; break;
    case "quote": before = "> "; break;
    case "hr": insert = "\n---\n"; break;
  }

  let newValue: string;
  let cursorPos: number;

  if (insert) {
    newValue = ta.value.slice(0, start) + insert + ta.value.slice(end);
    cursorPos = start + insert.length;
  } else {
    const wrapped = before + (selected || "文本") + after;
    newValue = ta.value.slice(0, start) + wrapped + ta.value.slice(end);
    cursorPos = start + before.length + (selected || "文本").length;
  }

  onChange(newValue);

  requestAnimationFrame(() => {
    ta.focus();
    ta.setSelectionRange(cursorPos, cursorPos);
  });
}

const TOOLBAR_ITEMS: { kind: MarkdownKind; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { kind: "heading", icon: Heading1, label: "一级标题" },
  { kind: "h2", icon: Heading2, label: "二级标题" },
  { kind: "h3", icon: Heading3, label: "三级标题" },
];

const TOOLBAR_ITEMS_2: { kind: MarkdownKind; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { kind: "bold", icon: Bold, label: "粗体" },
  { kind: "italic", icon: Italic, label: "斜体" },
  { kind: "link", icon: Link, label: "链接" },
];

const TOOLBAR_ITEMS_3: { kind: MarkdownKind; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { kind: "ul", icon: List, label: "无序列表" },
  { kind: "ol", icon: ListOrdered, label: "有序列表" },
  { kind: "quote", icon: Quote, label: "引用" },
  { kind: "hr", icon: Minus, label: "分隔线" },
];

export function EditorPanel({
  markdown,
  onChange,
  charCount,
  lineCount,
  textareaRef,
}: EditorPanelProps) {
  const handleToolbarClick = (kind: MarkdownKind) => {
    const ta = textareaRef.current;
    if (ta) {
      insertMarkdown(ta, kind, onChange);
    }
  };

  const ToolbarButton = ({
    kind,
    icon: Icon,
    label,
  }: {
    kind: MarkdownKind;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }) => (
    <Tooltip>
      <TooltipTrigger
        className="inline-grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => handleToolbarClick(kind)}
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="sr-only">{label}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );

  return (
    <aside className="flex flex-col min-h-0 min-w-0 overflow-hidden border-r bg-background print:hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b min-h-10">
        <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>resume.md</span>
        </span>
        <span className="flex gap-3 font-mono text-[11px] text-muted-foreground">
          <span>
            字数 <span className="text-foreground">{charCount.toLocaleString()}</span>
          </span>
          <span>·</span>
          <span>
            行数 <span className="text-foreground">{lineCount}</span>
          </span>
        </span>
      </div>

      <TooltipProvider delay={200}>
        <div className="flex items-center gap-0.5 px-3 py-1.5 border-b">
          {TOOLBAR_ITEMS.map((item) => (
            <ToolbarButton key={item.kind} {...item} />
          ))}
          <Separator orientation="vertical" className="mx-1 h-4" />
          {TOOLBAR_ITEMS_2.map((item) => (
            <ToolbarButton key={item.kind} {...item} />
          ))}
          <Separator orientation="vertical" className="mx-1 h-4" />
          {TOOLBAR_ITEMS_3.map((item) => (
            <ToolbarButton key={item.kind} {...item} />
          ))}
        </div>
      </TooltipProvider>

      <textarea
        ref={textareaRef}
        className="flex-1 w-full min-h-0 border-0 bg-transparent p-4 pb-12 font-mono text-[13px] leading-[1.65] text-foreground resize-none tab-[2] outline-none placeholder:text-muted-foreground"
        value={markdown}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder={"# 姓名\n**职位 · 城市**\n\n## 工作经历\n..."}
      />
    </aside>
  );
}
