"use client";

import { ThemeToggle } from "@/components/doc";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Github,
  Globe,
  Layout,
  Lock,
  Share2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black italic">
                M
              </span>
            </div>
            <span className="text-xl font-bold tracking-tighter">MDgo</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="https://github.com/infornics/MDgo"
              target="_blank"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/doc">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex text-xs rounded-full group bg-background/50 border-border/50 hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <span className="hidden xs:inline">Open Editor</span>
                <span className="xs:hidden">Launch</span>
                <ArrowRight className="ml-2 h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
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
            <a href="https://github.com/infornics/MDgo" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full font-bold text-md bg-background/50 backdrop-blur-sm border-border hover:bg-muted/80 transition-all"
              >
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </a>
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

      {/* Stats/Badges */}
      <section className="py-12 border-y border-border/40 bg-muted/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-wrap justify-center gap-12 md:gap-32 opacity-80">
          <div className="flex flex-col items-center gap-1 group cursor-default">
            <span className="text-3xl md:text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform duration-300">
              100%
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Open Source
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-default">
            <span className="text-3xl md:text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform duration-300">
              Zero
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Trackers
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-default text-primary">
            <span className="text-3xl md:text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform duration-300">
              Free
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
              Forever
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid (Bento Style) */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative">
        <div className="absolute top-[10%] left-[-20%] w-[600px] h-[600px] bg-primary/5 blur-[150px] -z-10 rounded-full opacity-40 pointer-events-none" />

        <div className="text-center space-y-6 mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            Built for <span className="text-primary">Professionals.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Every tool you need to craft high-quality documents quickly,
            presented in a clean, distraction-free interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 1: Real-time (Span 3 - Full Width) */}
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-yellow-500" />}
            title="Real-time Performance"
            description="Experience zero-latency markdown rendering as you type. Our engine is optimized for speed, handling large documents with ease."
            className="md:col-span-3"
          />

          {/* Row 2: Granular (1) + Optimized (1) + Cloud Sync (1) - 3 Small Cards */}
          <FeatureCard
            icon={<Share2 className="h-8 w-8 text-blue-500" />}
            title="Granular Sharing"
            description="Control who can view or edit your docs. Private links and direct collaborator access."
          />
          <FeatureCard
            icon={<Download className="h-8 w-8 text-green-500" />}
            title="Optimized Exports"
            description="High-fidelity PDF generation that preserves your styling with incredibly small file sizes."
          />
          <FeatureCard
            icon={<Lock className="h-8 w-8 text-red-500" />}
            title="Cloud Sync"
            description="Your documents are securely stored and synced across devices instantly."
          />

          {/* Row 3: Modern Themes (Span 2) + Public Hosting (Span 1) */}
          <FeatureCard
            icon={<Layout className="h-8 w-8 text-purple-500" />}
            title="Modern Themes"
            description="Switch between stunning metallic black and light modes designed for deep focus. Custom themes coming soon."
            className="md:col-span-2"
          />
          <FeatureCard
            icon={<Globe className="h-8 w-8 text-cyan-500" />}
            title="Public Hosting"
            description="Turn any document into a public web page with a single click."
          />
        </div>
      </section>

      {/* Infornics Section */}
      <section className="py-24 px-4 md:px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-linear-to-br from-card/50 to-background border border-border/50 rounded-[3rem] p-8 md:p-16 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-black/[0.03] dark:bg-grid-white/[0.03] -z-10" />

          <div className="h-20 w-20 bg-foreground text-background flex items-center justify-center rounded-2xl mx-auto shadow-2xl rotate-3 hover:rotate-6 transition-transform duration-500">
            <span className="font-black text-3xl italic">I</span>
          </div>
          <h3 className="text-3xl md:text-5xl font-black tracking-tight">
            Infornics Open Source
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            MDgo is a result of our passion for clean tools and efficient
            workflows. We believe in giving back to the community that built the
            web.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 pt-6">
            <div className="flex items-center gap-3 text-sm md:text-base font-semibold">
              <div className="p-1 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              No Trackers
            </div>
            <div className="flex items-center gap-3 text-sm md:text-base font-semibold">
              <div className="p-1 rounded-full bg-blue-500/10">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              </div>
              Free Forever
            </div>
            <div className="flex items-center gap-3 text-sm md:text-base font-semibold">
              <div className="p-1 rounded-full bg-purple-500/10">
                <CheckCircle2 className="h-5 w-5 text-purple-500" />
              </div>
              Collaborative
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/40 bg-muted/10 mx-auto w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-xs italic">
                  M
                </span>
              </div>
              <span className="font-bold tracking-tighter text-lg">MDgo</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs px-4 md:px-0">
              Handcrafted with ❤️ by Infornics. <br />© 2026 MDgo. All rights
              reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/infornics/MDgo"
              target="_blank"
              className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-all hover:scale-110"
            >
              <Github className="h-5 w-5" />
            </a>
            <Link href="/doc">
              <span className="text-sm font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
                Launch App
              </span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string; // Support for grid span classes
}) {
  return (
    <div
      className={`p-8 rounded-[2rem] border border-border bg-card/80 backdrop-blur-md hover:bg-card hover:border-primary/50 transition-all duration-300 group flex flex-col justify-between shadow-sm ${className}`}
    >
      <div>
        <div className="mb-6 p-4 rounded-2xl bg-muted/50 w-fit shadow-inner group-hover:scale-110 group-hover:bg-background transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
