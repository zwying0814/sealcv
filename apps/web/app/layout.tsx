import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// 使用 Vue 版本相同的字体: Inter (英文) + Noto Sans SC (中文)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SealCV · Markdown Resume Editor",
  description: "专注内容本身的现代 Markdown 简历生成器 — 实时预览、纸张感排版、智能一页、多页 PDF 导出",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className={cn(inter.variable, notoSansSC.variable)}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
