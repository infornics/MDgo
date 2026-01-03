"use client";

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
    <div className="min-h-screen bg-[#050505] text-foreground font-sans selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
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

          <Link href="/doc">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-xs px-6 rounded-full group"
            >
              Open Editor
              <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-primary/20 blur-[120px] -z-10 rounded-full opacity-20" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-[#222] blur-[100px] -z-10 rounded-full opacity-30 animate-pulse" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Link
            href="https://infornics.com/marketplace"
            target="_blank"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest font-bold text-primary animate-in fade-in slide-in-from-bottom-2 duration-700"
          >
            Built By Infornics
          </Link>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Write. Preview. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
              Share with ease.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            The premium markdown experience. Real-time rendering, granular
            sharing permissions, and high-fidelity PDF exports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link href="/doc">
              <Button
                size="lg"
                className="h-12 px-10 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95"
              >
                Start Writing Now
              </Button>
            </Link>
            <a href="https://github.com/infornics/MDgo" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-xl font-bold text-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>

        {/* Floating Editor Mockup */}
        <div className="max-w-6xl mx-auto mt-24 relative animate-in fade-in zoom-in duration-1000 delay-500">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-white/5 to-primary/20 rounded-[2rem] blur-2xl opacity-50" />
          <div className="relative rounded-[1.5rem] border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden aspect-[16/9]">
            {/* Window Header */}
            <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-[#111]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-5 w-40 bg-white/5 rounded-md" />
              </div>
            </div>
            {/* Editor Content Area */}
            <div className="flex h-full">
              <div className="w-1/2 h-full border-r border-white/5 p-6 space-y-4">
                <div className="h-6 w-3/4 bg-primary/10 rounded-md" />
                <div className="h-4 w-full bg-white/5 rounded-sm" />
                <div className="h-4 w-5/6 bg-white/5 rounded-sm" />
                <div className="h-32 w-full bg-white/5 rounded-sm" />
                <div className="h-4 w-full bg-white/5 rounded-sm" />
              </div>
              <div className="w-1/2 h-full p-6 space-y-6">
                <div className="h-10 w-1/2 bg-white/10 rounded-md" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-white/5 rounded-sm" />
                  <div className="h-4 w-full bg-white/5 rounded-sm" />
                  <div className="h-4 w-2/3 bg-white/5 rounded-sm" />
                </div>
                <div className="h-40 w-full bg-white/[0.02] border border-white/5 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Badges */}
      <section className="py-12 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              Open Source
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              Cloud Powered
            </span>
          </div>
          <div className="flex items-center gap-2 text-primary brightness-125">
            <span className="text-lg font-black tracking-tighter uppercase italic">
              By Infornics
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl md:text-5xl font-black">
            Built for Professionals.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every tool you need to craft high-quality documents quickly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-yellow-500" />}
            title="Real-time Performance"
            description="Experience zero-latency markdown rendering as you type. Smooth, fast, and optimized."
          />
          <FeatureCard
            icon={<Share2 className="h-6 w-6 text-blue-500" />}
            title="Granular Sharing"
            description="Control who can view or edit your docs. Private links and direct collaborator access."
          />
          <FeatureCard
            icon={<Download className="h-6 w-6 text-green-500" />}
            title="Optimized Exports"
            description="High-fidelity PDF generation that preserves your styling with incredibly small file sizes."
          />
          <FeatureCard
            icon={<Layout className="h-6 w-6 text-purple-500" />}
            title="Modern Themes"
            description="Switch between stunning metallic black and light modes designed for deep focus."
          />
          <FeatureCard
            icon={<Lock className="h-6 w-6 text-red-500" />}
            title="Cloud Sync"
            description="Your documents are securely stored and synced across devices instantly."
          />
          <FeatureCard
            icon={<Globe className="h-6 w-6 text-cyan-500" />}
            title="Public Hosting"
            description="Turn any document into a public web page with a single click. No hosting needed."
          />
        </div>
      </section>

      {/* Infornics Section */}
      <section className="py-24 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10 rounded-full" />

        <div className="max-w-4xl mx-auto bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-[3rem] p-12 text-center space-y-8">
          <div className="h-16 w-16 bg-white flex items-center justify-center rounded-2xl mx-auto shadow-xl">
            <span className="text-black font-black text-2xl italic">I</span>
          </div>
          <h3 className="text-3xl font-black">Infornics Open Source</h3>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            MDgo is a result of our passion for clean tools and efficient
            workflows. We believe in giving back to the community that built the
            web.
          </p>
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" /> No Trackers
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Free Forever
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Collaborative
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-[10px] italic">
                  M
                </span>
              </div>
              <span className="font-bold tracking-tighter">MDgo</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Handcrafted with ❤️ by Infornics. <br />© 2026 MDgo. All rights
              reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/infornics/MDgo"
              target="_blank"
              className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all"
            >
              <Github className="h-5 w-5" />
            </a>
            <Link href="/doc">
              <span className="text-sm font-bold text-primary hover:underline underline-offset-4 cursor-pointer">
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all group">
      <div className="mb-6 p-4 rounded-2xl bg-white/[0.05] w-fit shadow-inner group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-extrabold mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
