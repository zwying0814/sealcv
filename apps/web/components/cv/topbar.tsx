"use client";

import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Undo2, Maximize2, Minimize2, Download } from "lucide-react";

interface TopbarProps {
  docTitle: string;
  onDocTitleChange: (title: string) => void;
  onUndo: () => void;
  onPreview: () => void;
  onExport: () => void;
  isPreviewMode: boolean;
}

export function Topbar({
  docTitle,
  onDocTitleChange,
  onUndo,
  onPreview,
  onExport,
  isPreviewMode,
}: TopbarProps) {
  return (
    <header className="flex h-12 items-center gap-6 border-b bg-background px-5 print:hidden">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image src="/logo.webp" alt="SealCV" width={24} height={24} className="rounded-md" />
        <span className="font-semibold text-[15px] tracking-tight">SealCV</span>
      </Link>

      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-border">/</span>
        <Input
          value={docTitle}
          onChange={(e) => onDocTitleChange(e.target.value)}
          spellCheck={false}
          className="h-7 min-w-[200px] border-transparent bg-transparent px-2 text-sm text-foreground shadow-none placeholder:text-muted-foreground hover:bg-muted/50 focus-visible:bg-background focus-visible:border-border"
        />
      </span>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          className="gap-1.5"
        >
          <Undo2 className="h-3.5 w-3.5" />
          撤销
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          className="gap-1.5"
        >
          {isPreviewMode ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
          {isPreviewMode ? "编辑" : "预览"}
        </Button>
        <Button size="sm" onClick={onExport} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          导出 PDF
        </Button>
      </div>
    </header>
  );
}
