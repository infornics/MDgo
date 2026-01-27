import { ReactNode } from "react";

export default function FeatureCard({
    icon,
    title,
    description,
    className,
  }: {
    icon: ReactNode;
    title: string;
    description: string;
    className?: string;
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