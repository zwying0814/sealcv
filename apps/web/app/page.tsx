import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Code2,
  Eye,
  FileOutput,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Layers,
  Palette,
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "实时预览编辑",
    desc: "内置 Monaco 编辑器，Markdown 修改即时反映到纸张预览，所见即所得。",
  },
  {
    icon: Layers,
    title: "纸张感排版",
    desc: "A4 / Letter / Legal / B5 与自由尺寸，边距、字号、行高自由调节。",
  },
  {
    icon: ImageIcon,
    title: "照片与图标",
    desc: "一键上传证件照并拖动定位，icon 语法自动渲染图标行。",
  },
  {
    icon: FileOutput,
    title: "多页 PDF 导出",
    desc: "逐页高清渲染后拼装为多页 PDF，打印与投递都保持一致。",
  },
  {
    icon: Palette,
    title: "自定义 CSS",
    desc: "独立的 CSS 编辑面板与主题变量，随时把简历调成你的风格。",
  },
  {
    icon: HardDrive,
    title: "本地持久化",
    desc: "内容与样式保存在 localStorage，刷新、跳转都不会丢失。",
  },
];

const steps = [
  { icon: Code2, title: "写 Markdown", desc: "标题、列表、时间线，用最熟悉的语法组织经历。" },
  { icon: Eye, title: "实时调整", desc: "拖动分隔条对照预览，微调边距与排版细节。" },
  { icon: FileOutput, title: "导出 PDF", desc: "一键生成多页高清 PDF，直接投递。" },
];

const highlights = ["无需注册", "数据保存在本地", "MIT 开源"];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.webp" alt="SealCV" width={24} height={24} className="rounded-md" />
            <span className="font-semibold tracking-tight">SealCV</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <a
              href="#features"
              className="hidden rounded-md px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground sm:inline-block"
            >
              功能特性
            </a>
            <a
              href="#workflow"
              className="hidden rounded-md px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground sm:inline-block"
            >
              使用流程
            </a>
            <Button
              render={<Link href="/cv" />}
              nativeButton={false}
              size="sm"
              className="ml-2 gap-1.5"
            >
              打开编辑器
              <ArrowRight className="size-3.5" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Decorative backdrop */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-72 left-1/2 h-[36rem] w-[56rem] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-400/10" />
            <div className="absolute -top-32 left-[8%] h-[22rem] w-[22rem] rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-400/10" />
            <div className="absolute -top-24 right-[6%] h-[20rem] w-[20rem] rounded-full bg-sky-400/15 blur-3xl dark:bg-sky-400/10" />
            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_60%_45%_at_50%_0%,#000_55%,transparent_100%)]" />
          </div>

          <div className="mx-auto w-full max-w-5xl px-6 pt-20 pb-14 text-center sm:pt-28">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <Sparkles className="size-3.5 text-indigo-500" />
                Markdown 驱动 · 开源免费
              </span>
            </div>

            <Image
              src="/logo.webp"
              alt="SealCV"
              width={72}
              height={72}
              priority
              className="mx-auto mt-8 rounded-2xl shadow-sm animate-in fade-in zoom-in-95 duration-700"
            />

            <h1 className="mt-6 text-5xl font-extrabold tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-700 sm:text-6xl">
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400">
                SealCV
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
              专注内容本身的现代 Markdown 简历生成器。
            </p>
            <p className="mx-auto mt-1 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
              写完即所见，一键导出专业 PDF。
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground/70">
              Build your resume, deploy your future 💼✨
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                render={<Link href="/cv" />}
                nativeButton={false}
                className="h-11 w-full gap-2 rounded-xl px-6 text-sm shadow-sm sm:w-auto"
              >
                <FileText className="size-4" />
                开始制作简历
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                render={<a href="#features" />}
                nativeButton={false}
                className="h-11 w-full gap-2 rounded-xl px-5 text-sm sm:w-auto"
              >
                <Eye className="size-4" />
                了解特性
              </Button>
            </div>

            <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Product mockup */}
          <div className="mx-auto w-full max-w-4xl px-6 pb-20">
            <div className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-black/[0.06] animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5">
                <div className="flex gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-full bg-red-400/70" />
                  <span className="size-2.5 rounded-full bg-amber-400/70" />
                  <span className="size-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">简历.md</span>
                <span className="ml-auto hidden items-center gap-1 rounded-md border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  已保存
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Fake editor */}
                <div className="border-b bg-background p-4 font-mono text-[11px] leading-6 md:border-b-0 md:border-r">
                  <div className="flex gap-3">
                    <div className="select-none text-right text-muted-foreground/40">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden whitespace-pre text-foreground/80">
                      <div><span className="text-violet-500">#</span> 阿卷</div>
                      <div className="h-6" />
                      <div><span className="text-sky-500">icon=</span>ri:mail-fill 邮箱: zaj@example.com</div>
                      <div><span className="text-sky-500">icon=</span>ri:phone-fill 电话: 138-0000-0000</div>
                      <div className="h-6" />
                      <div><span className="text-violet-500">##</span> 教育背景</div>
                      <div><span className="text-amber-600">**</span>2023.09 - 2026.06<span className="text-amber-600">**</span></div>
                      <div>~ <span className="text-amber-600">**</span>南京师范大学<span className="text-amber-600">**</span></div>
                      <div className="h-6" />
                      <div><span className="text-violet-500">##</span> 工作经历</div>
                      <div><span className="text-emerald-600">-</span> 负责核心产品前端开发</div>
                      <div><span className="text-emerald-600">-</span> 优化页面性能与体验</div>
                    </div>
                  </div>
                </div>

                {/* Fake paper */}
                <div className="flex justify-center bg-muted/40 p-5 md:p-6">
                  <div className="w-full max-w-[240px] rounded-sm bg-white px-4 py-5 shadow-md">
                    <div className="text-center text-[13px] font-bold tracking-wide text-neutral-900">阿卷</div>
                    <div className="mx-auto mt-1 h-px w-10 bg-neutral-300" />
                    <div className="mt-2 space-y-1 text-center text-[6px] text-neutral-500">
                      <div>zaj@example.com · 138-0000-0000</div>
                    </div>
                    <div className="mt-4 text-[8px] font-semibold text-neutral-800">教育背景</div>
                    <div className="mt-1 h-px w-full bg-neutral-200" />
                    <div className="mt-1.5 space-y-1">
                      <div className="flex justify-between text-[6px]">
                        <span className="font-medium text-neutral-700">南京师范大学</span>
                        <span className="text-neutral-400">2023.09 - 2026.06</span>
                      </div>
                      <div className="h-1 w-[85%] rounded-full bg-neutral-200" />
                      <div className="h-1 w-[70%] rounded-full bg-neutral-200" />
                    </div>
                    <div className="mt-3 text-[8px] font-semibold text-neutral-800">工作经历</div>
                    <div className="mt-1 h-px w-full bg-neutral-200" />
                    <div className="mt-1.5 space-y-1">
                      <div className="flex justify-between text-[6px]">
                        <span className="font-medium text-neutral-700">某科技有限公司</span>
                        <span className="text-neutral-400">2025.07 - 至今</span>
                      </div>
                      {[90, 76, 82, 64].map((w, i) => (
                        <div key={i} className="h-1 rounded-full bg-neutral-200" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features ─────────────────────────────────────────── */}
        <section id="features" className="scroll-mt-20 border-t bg-muted/30 py-20">
          <div className="mx-auto w-full max-w-5xl px-6">
            <div className="mx-auto max-w-xl text-center">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Features
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">主要特色</h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                把排版交给工具，把注意力留给内容。
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 transition-colors group-hover:bg-indigo-500/15 dark:text-indigo-400">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Workflow ─────────────────────────────────────────── */}
        <section id="workflow" className="scroll-mt-20 border-t py-20">
          <div className="mx-auto w-full max-w-5xl px-6">
            <div className="mx-auto max-w-xl text-center">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Workflow
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">三步完成简历</h2>
            </div>

            <div className="relative mt-12 grid gap-6 sm:grid-cols-3">
              <div
                aria-hidden
                className="absolute top-6 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent sm:block"
              />
              {steps.map((step, i) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-full border bg-background shadow-sm">
                    <step.icon className="size-5 text-foreground/80" />
                  </div>
                  <div className="mt-4 font-mono text-[11px] text-muted-foreground">
                    0{i + 1}
                  </div>
                  <h3 className="mt-1 text-[15px] font-semibold">{step.title}</h3>
                  <p className="mt-1.5 max-w-[15rem] text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ──────────────────────────────────────────────── */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto w-full max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              准备好制作你的简历了吗？
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              无需注册，直接开始编辑，所有数据都保存在你自己的浏览器里。
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                render={<Link href="/cv" />}
                nativeButton={false}
                className="h-11 gap-2 rounded-xl px-7 text-sm shadow-sm"
              >
                <Sparkles className="size-4" />
                开始制作
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.webp" alt="" width={16} height={16} className="rounded" />
            <span>© 2025 SealCV · MIT License</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Next.js
            </a>
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              shadcn/ui
            </a>
            <Link href="/cv" className="transition-colors hover:text-foreground">
              编辑器
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
