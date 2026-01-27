import {
    CheckCircle2
} from "lucide-react";

export default function InfornicsOSS() {
  return (
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
  )
}
