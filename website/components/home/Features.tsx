import { FeatureCard } from "@/partials";
import { Download, Globe, Layout, Lock, Share2, Zap } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative">
      <div className="absolute top-[10%] left-[-20%] w-[600px] h-[600px] bg-primary/5 blur-[150px] -z-10 rounded-full opacity-40 pointer-events-none" />

      <div className="text-center space-y-6 mb-16 md:mb-24">
        <p className="text-4xl md:text-6xl font-black tracking-tight font-outfit">
          Built for <span className="text-primary">Professionals.</span>
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          Every tool you need to craft high-quality documents quickly, presented
          in a clean, distraction-free interface.
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
  );
}
