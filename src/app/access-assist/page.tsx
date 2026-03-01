"use client";

import { AppSidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sliders, 
  Wand2, 
  Mic, 
  Hand, 
  MessageCircle, 
  Volume2, 
  Download, 
  Share2,
  Type,
  Maximize,
  Contrast,
  CircleDot
} from "lucide-react";
import { useState } from "react";
import { translateAccessibleContent } from "@/ai/flows/translate-accessible-content";
import { generateImageAltText } from "@/ai/flows/generate-image-alt-text-flow";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AccessAssist() {
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [transformedText, setTransformedText] = useState("");
  const [isTransforming, setIsTransforming] = useState(false);
  
  // A11y Settings State
  const [fontSize, setFontSize] = useState([18]);
  const [letterSpacing, setLetterSpacing] = useState([0.02]);
  const [lineHeight, setLineHeight] = useState([1.75]);
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const handleTransform = async () => {
    if (!inputText.trim()) return;
    setIsTransforming(true);
    try {
      // Simulate/Trigger translation flow as a transformation step
      const result = await translateAccessibleContent({
        content: inputText,
        targetLanguage: "en" // We can add language selection later
      });
      setTransformedText(result.translatedContent);
      toast({ title: "Content Transformed", description: "Your accessibility preferences have been applied." });
    } catch (e) {
      toast({ title: "Transformation Failed", variant: "destructive" });
    } finally {
      setIsTransforming(false);
    }
  };

  return (
    <div className="flex bg-surface-dark min-h-screen">
      <AppSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 glass px-8 flex items-center justify-between border-b border-border/20 shrink-0">
          <h1 className="font-headline font-bold text-xl">AccessAssist</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full border-border/30 h-9">
              Quick Presets
            </Button>
            <Button size="sm" className="rounded-full bg-primary h-9">
              Save Profile
            </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Controls (Left Sticky) */}
          <aside className="w-80 border-r border-border/10 p-6 flex flex-col gap-8 overflow-y-auto">
            <div className="flex items-center gap-2 text-accent font-headline font-bold">
              <Sliders size={18} /> Accessibility Controls
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2"><Type size={14} /> Text Size</Label>
                  <span className="text-xs font-code">{fontSize[0]}px</span>
                </div>
                <Slider value={fontSize} onValueChange={setFontSize} min={12} max={32} step={1} className="py-2" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2"><Maximize size={14} /> Spacing</Label>
                  <span className="text-xs font-code">{letterSpacing[0]}em</span>
                </div>
                <Slider value={letterSpacing} onValueChange={setLetterSpacing} min={0} max={0.3} step={0.01} className="py-2" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2"><Maximize size={14} className="rotate-90" /> Line Height</Label>
                  <span className="text-xs font-code">{lineHeight[0]}x</span>
                </div>
                <Slider value={lineHeight} onValueChange={setLineHeight} min={1.4} max={2.4} step={0.1} className="py-2" />
              </div>

              <div className="pt-4 space-y-4 border-t border-border/10">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dyslexia" className="cursor-pointer">Dyslexia Mode</Label>
                  <Switch id="dyslexia" checked={dyslexiaMode} onCheckedChange={setDyslexiaMode} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast" className="cursor-pointer">High Contrast</Label>
                  <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="syllables" className="cursor-pointer">Syllable Highlighting</Label>
                  <Switch id="syllables" />
                </div>
              </div>
            </div>
          </aside>

          {/* Workspace (Center) */}
          <div className="flex-1 bg-surface-dark/30 overflow-y-auto p-8">
            <Tabs defaultValue="transform" className="space-y-8">
              <TabsList className="bg-surface-dark/50 border border-border/20 p-1 rounded-xl w-fit">
                <TabsTrigger value="transform" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white flex gap-2">
                  <Wand2 size={16} /> Transform
                </TabsTrigger>
                <TabsTrigger value="transcription" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white flex gap-2">
                  <Mic size={16} /> Transcription
                </TabsTrigger>
                <TabsTrigger value="sign" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white flex gap-2">
                  <Hand size={16} /> Sign Language
                </TabsTrigger>
                <TabsTrigger value="ai-help" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white flex gap-2">
                  <MessageCircle size={16} /> Ask AI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transform" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-muted-foreground uppercase text-xs tracking-widest font-bold">Input Source</Label>
                    <Textarea 
                      placeholder="Paste text or URL to transform..." 
                      className="min-h-[300px] glass rounded-2xl p-6 border-border/30 resize-none focus-visible:ring-accent/50"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <Button 
                      className="w-full h-14 rounded-2xl bg-accent text-teal-900 font-bold text-lg hover:bg-accent/90"
                      onClick={handleTransform}
                      disabled={isTransforming}
                    >
                      {isTransforming ? "Transforming..." : "Transform Content"}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-muted-foreground uppercase text-xs tracking-widest font-bold">Transformed View</Label>
                    <div 
                      className={cn(
                        "min-h-[300px] glass rounded-2xl p-6 border-border/30 overflow-y-auto",
                        dyslexiaMode ? "font-serif" : "font-body",
                        highContrast ? "bg-black text-yellow-300" : ""
                      )}
                      style={{
                        fontSize: `${fontSize[0]}px`,
                        letterSpacing: `${letterSpacing[0]}em`,
                        lineHeight: `${lineHeight[0]}`,
                      }}
                    >
                      {transformedText || (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-50">
                          <CircleDot size={48} />
                          <p>Your accessible content will appear here.</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 h-12 rounded-xl gap-2 hover:bg-primary/10 border-border/30"><Volume2 size={18} /> Listen</Button>
                      <Button variant="outline" className="flex-1 h-12 rounded-xl gap-2 hover:bg-primary/10 border-border/30"><Download size={18} /> Export</Button>
                      <Button variant="outline" className="flex-1 h-12 rounded-xl gap-2 hover:bg-primary/10 border-border/30"><Share2 size={18} /> Share</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="transcription">
                <Card className="glass border-border/20">
                  <CardContent className="p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto text-accent animate-pulse">
                      <Mic size={32} />
                    </div>
                    <h2 className="text-2xl font-headline font-bold">Ready to Transcribe</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">InclusiveAI can provide real-time captions for live lectures or meetings with AI-enhanced summaries.</p>
                    <Button className="bg-accent text-teal-900 font-bold px-12 h-12 rounded-full">Start Listening</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}