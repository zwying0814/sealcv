import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SealCV · Markdown Resume Editor",
  description: "专注内容本身的现代 Markdown 简历生成器 — 实时预览、纸张感排版、智能一页、多页 PDF 导出",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className={cn(geistMono.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
