"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Eye, 
  Heart, 
  MapPin, 
  Palette, 
  Zap,
  ArrowRight,
  Hexagon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const heroImg = PlaceHolderImages.find(img => img.id === "hero-students")!;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(2,128,144,0.15),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent text-sm font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              AI for Social Good · Campus Edition
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-bold leading-[1.1] tracking-tight">
              Where Every<br />
              <span className="gradient-text">Student Belongs</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              InclusiveAI brings assistive technology, mental health support, real-time crisis response, and inclusion-by-design to every campus touchpoint.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8 rounded-full h-14 text-lg">
                  Explore Platform <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary/30 px-8 rounded-full h-14 text-lg">
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-accent/20 blur-3xl rounded-full opacity-30" />
            <div className="relative glass rounded-3xl p-4 border-border/30 overflow-hidden">
              <Image 
                src={heroImg.imageUrl} 
                alt={heroImg.description}
                width={600}
                height={400}
                className="rounded-2xl w-full object-cover aspect-[4/3]"
                data-ai-hint={heroImg.imageHint}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-12 border-y border-border/20 bg-surface-dark/50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold font-headline text-accent">1.3B</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Digitally Excluded</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold font-headline text-teal-300">19%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Students w/ Disability</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold font-headline text-wellness-purple">60%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Mental Health Need</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold font-headline text-safe-green">84%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Faster Crisis Response</div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-headline font-bold">Comprehensive Inclusion Suite</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Four core modules designed to make your campus truly accessible for every individual.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="glass group hover:border-accent/50 transition-all duration-300">
            <CardContent className="p-8 space-y-6">
              <div className="w-14 h-14 bg-access-blue/10 rounded-2xl flex items-center justify-center border border-access-blue/20">
                <Eye className="text-access-blue w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-bold">AccessAssist</h3>
                <p className="text-muted-foreground">Transform any content into your preferred format. Dyslexia mode, real-time transcription, and neurodiverse UX presets.</p>
              </div>
              <Link href="/access-assist" className="inline-flex items-center text-accent font-semibold hover:gap-2 transition-all">
                Launch AccessAssist <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="glass group hover:border-wellness-purple/50 transition-all duration-300">
            <CardContent className="p-8 space-y-6">
              <div className="w-14 h-14 bg-wellness-purple/10 rounded-2xl flex items-center justify-center border border-wellness-purple/20">
                <Heart className="text-wellness-purple w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-bold">WellnessCompanion</h3>
                <p className="text-muted-foreground">Your 24/7 wellbeing partner. Mood tracking, multilingual support, and crisis distress detection with human handoff.</p>
              </div>
              <Link href="/wellness" className="inline-flex items-center text-accent font-semibold hover:gap-2 transition-all">
                Enter Wellness Hub <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="glass group hover:border-crisis-red/50 transition-all duration-300">
            <CardContent className="p-8 space-y-6">
              <div className="w-14 h-14 bg-crisis-red/10 rounded-2xl flex items-center justify-center border border-crisis-red/20">
                <MapPin className="text-crisis-red w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-bold">CrisisRadar</h3>
                <p className="text-muted-foreground">Real-time campus safety. IoT sensor fusion, AI alert drafting, and human-authorized emergency broadcasting.</p>
              </div>
              <Link href="/crisis-radar" className="inline-flex items-center text-accent font-semibold hover:gap-2 transition-all">
                Open Radar Map <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="glass group hover:border-teal-300/50 transition-all duration-300">
            <CardContent className="p-8 space-y-6">
              <div className="w-14 h-14 bg-teal-300/10 rounded-2xl flex items-center justify-center border border-teal-300/20">
                <Palette className="text-teal-300 w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-bold">InclusionDesignKit</h3>
                <p className="text-muted-foreground">Automated WCAG 2.2 audit engine. Real-time contrast checking and prioritized remediation suggestions.</p>
              </div>
              <Link href="/inclusion-kit" className="inline-flex items-center text-accent font-semibold hover:gap-2 transition-all">
                Start Audit <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-surface-dark border-t border-border/20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Hexagon className="text-accent w-8 h-8" />
              <span className="font-headline font-bold text-xl">InclusiveAI</span>
            </Link>
            <p className="text-sm text-muted-foreground">Where No One Is Left Behind. Empowering university communities through advanced AI and accessible design.</p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/access-assist" className="hover:text-accent">AccessAssist</Link></li>
              <li><Link href="/wellness" className="hover:text-accent">WellnessCompanion</Link></li>
              <li><Link href="/crisis-radar" className="hover:text-accent">CrisisRadar</Link></li>
              <li><Link href="/inclusion-kit" className="hover:text-accent">InclusionKit</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-accent">Documentation</Link></li>
              <li><Link href="#" className="hover:text-accent">Open Source</Link></li>
              <li><Link href="#" className="hover:text-accent">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-accent">Accessibility Statement</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Community</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-accent">NGO Partners</Link></li>
              <li><Link href="#" className="hover:text-accent">NSS Network</Link></li>
              <li><Link href="#" className="hover:text-accent">Contributor Guide</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-border/10 flex flex-col md:row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest">
          <span>© 2024 InclusiveAI. Built with ❤️ for Accessibility.</span>
          <span>Powered by Gemini 1.5 Pro & Next.js</span>
        </div>
      </footer>
    </div>
  );
}