import { Features, Footer, Hero, InfornicsOSS, Navbar, Stats } from "@/components/home";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden">
      
      <Navbar />

      <Hero />

      <Stats />
      

      <Features />
      

      <InfornicsOSS />
      
      <Footer />
    </div>
  );
}
