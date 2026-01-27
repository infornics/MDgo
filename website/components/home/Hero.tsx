import { Button } from "@/components/ui/button";
import {
    Github
} from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-32 md:pt-48 pb-16 md:pb-24 px-4 md:px-6 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-grid-black/[0.05] dark:bg-grid-white/[0.05] flex items-center justify-center">
          {/* Radial mask for fade out */}
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        </div>

        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-primary/20 blur-[130px] -z-10 rounded-full opacity-30 dark:opacity-20 pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] -z-10 rounded-full opacity-40 animate-pulse pointer-events-none" />

        {/* Floating Markdown Symbols */}
        <div className="absolute top-20 left-10 text-7xl font-black text-foreground/5 -rotate-12 select-none pointer-events-none z-0">
          #
        </div>
        <div className="absolute bottom-40 right-10 text-8xl font-black text-foreground/5 rotate-12 select-none pointer-events-none z-0">
          **
        </div>
        <div className="absolute top-40 right-20 text-6xl font-black text-foreground/5 -rotate-6 select-none pointer-events-none z-0">
          &gt;
        </div>
        <div className="absolute bottom-20 left-20 text-6xl font-black text-foreground/5 rotate-6 select-none pointer-events-none z-0 font-mono">
          `code`
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <Link
            href="https://infornics.com/marketplace"
            target="_blank"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-muted/30 backdrop-blur-sm text-[10px] uppercase tracking-widest font-bold text-primary animate-in fade-in slide-in-from-bottom-2 duration-700 hover:bg-muted/50 transition-colors"
          >
            Built By Infornics
          </Link>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-none md:leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-1000 drop-shadow-sm">
            Write. Preview. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-b from-foreground via-foreground to-foreground/50 pb-2">
              Share with ease.
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 font-medium">
            The premium markdown experience. Real-time rendering, granular
            sharing permissions, and high-fidelity PDF exports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link href="/doc">
              <Button
                size="lg"
                className="h-14 px-10 rounded-full font-bold text-md bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95"
              >
                Start Writing Now
              </Button>
            </Link>
            <Link href="https://github.com/infornics/MDgo" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full font-bold text-md bg-background/50 backdrop-blur-sm border-border hover:bg-muted/80 transition-all"
              >
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating Editor Mockup */}
        <div className="max-w-6xl mx-auto mt-24 relative animate-in fade-in zoom-in duration-1000 delay-500 perspective-1000">
          {/* Glow behind mockup */}
          <div className="absolute -inset-4 bg-linear-to-r from-primary/30 via-blue-500/20 to-primary/30 rounded-[2.5rem] blur-3xl opacity-40 dark:opacity-30" />

          <div className="relative rounded-[1.5rem] md:rounded-[2rem] border border-border/60 bg-card/80 backdrop-blur-md shadow-2xl overflow-hidden aspect-video md:aspect-16/10 transform transition-transform hover:scale-[1.01] duration-700">
            {/* Window Header */}
            <div className="h-12 border-b border-border/40 flex items-center px-6 gap-3 bg-muted/40">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-sm" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-sm" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-sm" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-7 w-64 bg-background/40 rounded-lg flex items-center justify-center border border-white/5">
                  <span className="text-[10px] text-muted-foreground font-medium opacity-70">
                    untitled.md - MDgo
                  </span>
                </div>
              </div>
            </div>

            {/* Editor Content Area */}
            <div className="flex h-full flex-col md:flex-row relative z-10">
              {/* Editor Side (Markdown) */}
              <div className="w-full md:w-1/2 h-full border-b md:border-b-0 md:border-r border-border/40 p-6 md:p-8 bg-background/30 font-mono text-sm overflow-hidden">
                <div className="flex gap-3 mb-4 opacity-50">
                  <div className="w-8 text-right text-muted-foreground select-none">
                    1
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex gap-2">
                      <span className="text-blue-500 font-bold">#</span>
                      <span className="text-foreground">Project Atlas</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mb-4 opacity-70">
                  <div className="w-8 text-right text-muted-foreground select-none">
                    2
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex gap-2">
                      <span className="text-purple-500 font-bold">##</span>
                      <span className="text-foreground/90">Q1 Roadmap</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 opacity-90">
                  <div className="w-8 text-right text-muted-foreground select-none">
                    3
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex gap-2">
                      <span className="text-yellow-500 font-bold">-</span>
                      <span>Launch webv2</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-yellow-500 font-bold">-</span>
                      <span>
                        Optimize{" "}
                        <span className="text-green-500">
                          `rendering_engine`
                        </span>
                      </span>
                    </div>
                    <br />
                    <div className="flex gap-2">
                      <span className="text-muted-foreground font-bold">
                        &gt;
                      </span>
                      <span className="text-muted-foreground italic">
                        Markdown is the future.
                      </span>
                    </div>
                  </div>
                </div>
                {/* Cursor blinks */}
                <div className="flex gap-3 mt-1">
                  <div className="w-8"></div>
                  <div className="w-2 h-5 bg-primary animate-pulse" />
                </div>
              </div>

              {/* Preview Side (Rendered) */}
              <div className="w-full md:w-1/2 h-full p-6 md:p-8 bg-background/5">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h1 className="text-2xl font-bold tracking-tight mb-4 mt-0">
                    Project Atlas
                  </h1>
                  <h2 className="text-lg font-semibold border-b border-border/50 pb-2 mb-4">
                    Q1 Roadmap
                  </h2>
                  <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
                    <li>Launch webv2</li>
                    <li>
                      Optimize{" "}
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground font-mono border border-border/50">
                        rendering_engine
                      </code>
                    </li>
                  </ul>
                  <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground/80">
                    Markdown is the future.
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}
