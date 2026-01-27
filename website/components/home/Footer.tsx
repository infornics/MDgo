import {
    Github
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
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
  )
}
