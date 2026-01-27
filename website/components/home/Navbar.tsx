import { ThemeToggle } from "@/components/doc";
import { Button } from "@/components/ui/button";
import { icons } from "@/public/icons";
import {
    ArrowRight,
    Github
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";


export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
          <Image src={icons.logo} alt="MDgo" width={500} height={500} className="w-auto h-7" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="https://github.com/infornics/MDgo"
              target="_blank"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Link>
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
  )
}
