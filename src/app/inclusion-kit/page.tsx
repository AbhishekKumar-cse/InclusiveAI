
"use client";

import { AppSidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Search, 
  BarChart3, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Eye,
  ExternalLink,
  Copy
} from "lucide-react";
import { useState } from "react";
import { generateWcagFixSuggestions } from "@/ai/flows/ai-wcag-fix-suggestions";

export default function InclusionKit() {
  const [url, setUrl] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);

  const startAudit = () => {
    if (!url) return;
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
    }, 2500);
  };

  return (
    <div className="flex bg-surface-dark min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-8">
        <header className="mb-12 space-y-2">
          <h1 className="text-4xl font-headline font-bold">InclusionDesignKit</h1>
          <p className="text-muted-foreground">Automated WCAG 2.2 auditing and remediation tools.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Audit Score Card */}
          <Card className="lg:col-span-1 glass flex flex-col items-center justify-center p-12 space-y-6 text-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle 
                  cx="96" cy="96" r="88" 
                  fill="none" stroke="currentColor" 
                  strokeWidth="12" className="text-surface-dark" 
                />
                <circle 
                  cx="96" cy="96" r="88" 
                  fill="none" stroke="currentColor" 
                  strokeWidth="12" 
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - 0.67)}`}
                  className="text-accent transition-all duration-1000" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold font-headline">67</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">WCAG Score</span>
              </div>
            </div>
            <div className="space-y-2">
              <Badge className="bg-accent text-teal-900 font-bold">Target: 95+ (AAA)</Badge>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock size={12} /> Last scan: 2 days ago
              </p>
            </div>
          </Card>

          {/* Audit Trigger */}
          <Card className="lg:col-span-2 glass flex flex-col justify-center">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="text-accent" /> Run New Audit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Enter URL to Scan</label>
                <div className="flex gap-2">
                  <Input 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://campus.edu/course-catalog" 
                    className="bg-surface-dark/50 border-border/30 rounded-xl h-12"
                  />
                  <Button 
                    onClick={startAudit}
                    disabled={isAuditing}
                    className="bg-primary hover:bg-primary/90 rounded-xl px-8 h-12"
                  >
                    {isAuditing ? "Scanning..." : "Start Audit"}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border/10 bg-surface-dark/30">
                  <p className="text-xs font-bold uppercase mb-1">Crawl Depth</p>
                  <p className="text-sm text-muted-foreground">Up to 50 pages</p>
                </div>
                <div className="p-4 rounded-xl border border-border/10 bg-surface-dark/30">
                  <p className="text-xs font-bold uppercase mb-1">Standard</p>
                  <p className="text-sm text-muted-foreground">WCAG 2.2 AA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Results */}
        {auditComplete && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass border-crisis-red/30">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <AlertCircle className="text-crisis-red mb-2" />
                  <span className="text-2xl font-bold">23</span>
                  <span className="text-[10px] uppercase text-muted-foreground">Critical Issues</span>
                </CardContent>
              </Card>
              <Card className="glass border-crisis-orange/30">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <AlertCircle className="text-crisis-orange mb-2" />
                  <span className="text-2xl font-bold">41</span>
                  <span className="text-[10px] uppercase text-muted-foreground">Serious Issues</span>
                </CardContent>
              </Card>
              <Card className="glass border-crisis-yellow/30">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <AlertCircle className="text-crisis-yellow mb-2" />
                  <span className="text-2xl font-bold">19</span>
                  <span className="text-[10px] uppercase text-muted-foreground">Moderate Issues</span>
                </CardContent>
              </Card>
              <Card className="glass border-safe-green/30">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <CheckCircle2 className="text-safe-green mb-2" />
                  <span className="text-2xl font-bold">6</span>
                  <span className="text-[10px] uppercase text-muted-foreground">Minor Issues</span>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-headline font-bold flex items-center gap-2">
                <Zap className="text-accent" /> Fix Queue
              </h3>
              <div className="space-y-4">
                {[
                  { 
                    type: "Alt Text Missing", 
                    severity: "Critical", 
                    page: "/library/catalog", 
                    desc: "Hero banner image has no alternative text. Screen reader users cannot understand this content.",
                    code: '<img src="hero.jpg" class="hero-banner">',
                    fix: '<img src="hero.jpg" class="hero-banner" alt="Students collaborating around a table in the library">'
                  },
                  { 
                    type: "Low Contrast Ratio", 
                    severity: "Serious", 
                    page: "/course-catalog/it-101", 
                    desc: "Text color has insufficient contrast with background (3.1:1). WCAG requires 4.5:1.",
                    code: '<span style="color: #94A3B8">Next Lesson</span>',
                    fix: '<span style="color: #F0FFF4">Next Lesson</span>'
                  }
                ].map((issue, i) => (
                  <Card key={i} className="glass border-border/20 overflow-hidden">
                    <CardHeader className="bg-surface-dark/40 py-4 flex flex-row justify-between items-center">
                      <div className="flex items-center gap-4">
                        <Badge variant="destructive" className="bg-crisis-red/20 text-crisis-red border-crisis-red/30">{issue.severity}</Badge>
                        <CardTitle className="text-base">{issue.type}</CardTitle>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><ExternalLink size={12} /> {issue.page}</span>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <p className="text-sm leading-relaxed">{issue.desc}</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">Current Code</p>
                          <code className="block p-3 rounded-lg bg-surface-dark text-xs border border-border/10 font-code overflow-x-auto">
                            {issue.code}
                          </code>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase text-accent">Recommended Fix (AI Generated)</p>
                          <div className="relative group">
                            <code className="block p-3 pr-10 rounded-lg bg-accent/5 text-xs border border-accent/20 font-code text-accent overflow-x-auto">
                              {issue.fix}
                            </code>
                            <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8 text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">Ignore</Button>
                        <Button variant="outline" size="sm" className="border-accent/30 text-accent">Mark as Resolved</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
