
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hexagon } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 group-hover:border-accent/50 transition-colors">
            <Hexagon className="text-accent w-6 h-6" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">InclusiveAI</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/access-assist" className="text-sm font-medium hover:text-accent transition-colors">AccessAssist</Link>
          <Link href="/wellness" className="text-sm font-medium hover:text-accent transition-colors">Wellness</Link>
          <Link href="/crisis-radar" className="text-sm font-medium hover:text-accent transition-colors">CrisisRadar</Link>
          <Link href="/inclusion-kit" className="text-sm font-medium hover:text-accent transition-colors">DesignKit</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-foreground hover:text-accent">Login</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
