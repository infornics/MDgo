export default function Stats() {
  return (
    <section className="py-12 border-y border-border/40 bg-muted/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-wrap justify-center gap-12 md:gap-32 opacity-80">
        <div className="flex flex-col items-center gap-1 group cursor-default">
          <span className="text-3xl md:text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform duration-300 font-outfit">
            100%
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Open Source
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 group cursor-default">
          <span className="text-3xl md:text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform duration-300 font-outfit">
            Zero
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Trackers
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 group cursor-default text-primary">
          <span className="text-3xl md:text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform duration-300 font-outfit">
            Free
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
            Forever
          </span>
        </div>
      </div>
    </section>
  );
}
