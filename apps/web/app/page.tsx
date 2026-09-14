import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Layers, Image as ImageIcon, FileOutput, HardDrive } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "实时预览编辑",
    desc: "内置 Markdown 编辑器，修改立刻同步到预览 CV 页面",
  },
  {
    icon: Layers,
    title: "纸张感排版",
    desc: "A4 / Letter / Legal / B5，可调边距与智能一页布局",
  },
  {
    icon: ImageIcon,
    title: "照片与图标",
    desc: "拖拽头像、微调位置，icon 语法自动渲染图标",
  },
  {
    icon: FileOutput,
    title: "多页 PDF 导出",
    desc: "每页高清 Canvas 打包为兼容多页 PDF，适合投递和归档",
  },
  {
    icon: HardDrive,
    title: "本地持久化",
    desc: "内容与自定义样式保存在 localStorage，刷新不丢失",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20 bg-background">
      <div className="flex w-full max-w-2xl flex-col items-center">
        {/* Logo + Title */}
        <Image
          src="/logo.webp"
          alt="SealCV"
          width={96}
          height={96}
          className="mb-5"
          priority
        />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          SealCV
        </h1>
        <p className="mt-2 text-base text-muted-foreground text-center max-w-md">
          专注内容本身的现代 Markdown 简历生成器
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground/80 font-mono">
          Build your resume, deploy your future 💼✨
        </p>

        {/* CTA */}
        <Button
          render={<Link href="/cv" />}
          nativeButton={false}
          size="lg"
          className="mt-10 gap-2"
        >
          <FileText className="h-4 w-4" />
          开始制作简历
          <ArrowRight className="h-4 w-4" />
        </Button>

        {/* Divider */}
        <div className="w-full my-12 border-t border-border" />

        {/* Features */}
        <div className="w-full">
          <div className="text-center mb-6">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Features
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <f.icon className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm text-foreground">
                    {f.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground/60 font-mono">
            SealCV · MIT License
          </p>
        </div>
      </div>
    </main>
  );
}
