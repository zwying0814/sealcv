"use client";

import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TopbarProps {
  docTitle: string;
  onDocTitleChange: (title: string) => void;
  onExport: () => void;
}

export function Topbar({
  docTitle,
  onDocTitleChange,
  onExport,
}: TopbarProps) {
  return (
    <header className="flex h-12 items-center gap-3 border-b bg-background px-3 print:hidden sm:gap-6 sm:px-5">
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <Image src="/logo.webp" alt="SealCV" width={24} height={24} className="rounded-md" />
        <span className="hidden font-semibold text-[15px] tracking-tight sm:inline">SealCV</span>
      </Link>

      <span className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground sm:flex-none">
        <span className="hidden text-border sm:inline">/</span>
        <Input
          value={docTitle}
          onChange={(e) => onDocTitleChange(e.target.value)}
          spellCheck={false}
          className="h-7 min-w-0 border-transparent bg-transparent px-2 text-sm text-foreground shadow-none placeholder:text-muted-foreground hover:bg-muted/50 focus-visible:border-border focus-visible:bg-background sm:min-w-[200px]"
        />
      </span>

      <div className="hidden flex-1 sm:block" />

      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" onClick={onExport} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">导出 PDF</span>
          <span className="sm:hidden">导出</span>
        </Button>
      </div>
    </header>
  );
}
