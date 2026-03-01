"use client";

import { AppSidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  User, 
  Building2,
  Phone,
  Info
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { chatWithWellnessBot } from "@/ai/flows/wellness-bot-chat-with-distress-detection-flow";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function WellnessPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: "Hi! I'm WellnessBot, your 24/7 wellbeing companion. I'm here to listen, support, and connect you with resources. What's on your mind today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize session ID once
  useEffect(() => {
    if (user && !sessionId) {
      setSessionId(`wellness-${user.uid}-${Date.now()}`);
    }
  }, [user, sessionId]);

  // Sync session to Firestore
  useEffect(() => {
    if (user && db && sessionId && messages.length > 1) {
      const sessionRef = doc(db, "chatSessions", sessionId);
      setDocumentNonBlocking(sessionRef, {
        id: sessionId,
        userId: user.uid,
        module: "wellness",
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || new Date().toISOString()
        })),
        riskLevel: riskLevel > 70 ? "high" : riskLevel > 30 ? "medium" : "low",
        humanHandoffTriggered: riskLevel >= 71,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  }, [user, db, sessionId, messages, riskLevel]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    const userMsgObj = { role: 'user', content: userMessage, timestamp: new Date().toISOString() };
    const historyForAi = [...messages];
    setMessages(prev => [...prev, userMsgObj]);

    try {
      const response = await chatWithWellnessBot({
        message: userMessage,
        chatHistory: historyForAi.map(m => ({ role: m.role, content: m.content })),
        userLanguage: "en"
      });

      const assistantMsgObj = { 
        role: 'assistant', 
        content: response.aiResponse, 
        timestamp: new Date().toISOString(),
        riskScore: response.newRiskScore,
        flaggedForReview: response.flaggedForReview
      };
      
      setMessages(prev => [...prev, assistantMsgObj]);
      setRiskLevel(response.newRiskScore);

      // Log Mood entry for significant distress
      if (user && db && response.newRiskScore > 30) {
        const moodLogId = `log-${Date.now()}`;
        const moodLogRef = doc(db, "users", user.uid, "moodLogs", moodLogId);
        setDocumentNonBlocking(moodLogRef, {
          id: moodLogId,
          userId: user.uid,
          date: new Date().toISOString().split('T')[0],
          moodScore: response.newRiskScore > 70 ? 1 : 3,
          moodEmoji: response.newRiskScore > 70 ? '😢' : '😐',
          note: userMessage,
          aiNudgeSent: true,
          nudgeContent: response.aiResponse,
          timestamp: new Date().toISOString()
        }, { merge: true });
      }

      if (response.humanHandoffTriggered) {
        toast({
          title: "Safety Notification",
          description: "We've alerted campus support services to reach out to you.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
      toast({
        title: "Connection Issue",
        description: "I'm having a bit of trouble connecting right now. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex bg-[#1A0A2E] min-h-screen text-foreground">
      <AppSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 glass px-8 flex items-center justify-between border-b border-border/20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-wellness-purple rounded-full flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">💚</div>
            <div>
              <h1 className="font-headline font-bold">WellnessBot</h1>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-safe-green animate-pulse" /> Online · AI Companion
              </p>
            </div>
          </div>
          <Button variant="destructive" className="bg-crisis-red hover:bg-crisis-red/90 h-9 rounded-full px-6 flex gap-2 shadow-lg shadow-red-500/20">
            <AlertTriangle size={16} /> I need help now
          </Button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Mood Tracking Sidebar (Left) */}
          <div className="hidden lg:flex w-80 border-r border-border/10 p-6 flex flex-col gap-6 overflow-y-auto">
            <section className="space-y-4">
              <h3 className="font-headline font-bold text-lg">Daily Check-in</h3>
              <div className="grid grid-cols-5 gap-2">
                {['😢', '😕', '😐', '🙂', '😊'].map((emoji, i) => (
                  <button key={i} className="glass p-3 rounded-xl hover:bg-primary/20 text-2xl transition-all hover:scale-105 active:scale-95">
                    {emoji}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Sparkles size={14} className="text-accent" /> Quick Exercises
              </h3>
              <Card className="glass border-border/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm">Box Breathing</p>
                    <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">4 min</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Calm your nervous system instantly with guided breathwork.</p>
                  <Button variant="outline" size="sm" className="w-full text-xs rounded-lg border-border/30">Start Now</Button>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Campus Support</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-sm rounded-xl hover:bg-white/5">
                  <Building2 size={16} className="text-access-blue" /> Student Health Center
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-sm rounded-xl hover:bg-white/5">
                  <Phone size={16} className="text-safe-green" /> 24/7 Crisis Line
                </Button>
              </div>
            </section>
          </div>

          {/* Chat Interface (Center) */}
          <div className="flex-1 flex flex-col bg-surface-dark/30">
            <div className="p-3 glass border-b border-border/20 flex items-center gap-3">
              <Info className="text-access-blue w-4 h-4 shrink-0" />
              <p className="text-[11px] text-muted-foreground">WellnessBot is an AI assistant, not a medical professional. For urgent clinical help, please contact campus services.</p>
            </div>
            
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm shadow-md ${m.role === 'assistant' ? 'bg-wellness-purple' : 'bg-primary'}`}>
                    {m.role === 'assistant' ? '💚' : <User size={18} />}
                  </div>
                  <div className={`max-w-[85%] lg:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === 'assistant' 
                      ? 'glass border-border/20 rounded-tl-none' 
                      : 'bg-primary text-white rounded-tr-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-wellness-purple flex items-center justify-center text-sm animate-pulse">💚</div>
                  <div className="p-4 rounded-2xl glass border-border/20 rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              {riskLevel >= 71 && (
                <div className="bg-crisis-red/10 border border-crisis-red/30 p-6 rounded-2xl space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3 text-crisis-red">
                    <AlertTriangle className="animate-pulse" />
                    <h4 className="font-bold">Immediate Safety Support</h4>
                  </div>
                  <p className="text-sm">It sounds like you're going through a very difficult time. We've notified support services, and help is available right now.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button variant="outline" className="text-xs h-11 border-crisis-red/30 rounded-xl hover:bg-crisis-red/20">Call Local Helpline</Button>
                    <Button variant="outline" className="text-xs h-11 border-crisis-red/30 rounded-xl hover:bg-crisis-red/20">Text Crisis Support</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border/20 glass">
              <div className="max-w-4xl mx-auto flex gap-4">
                <Textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="bg-surface-dark/50 border-border/30 rounded-2xl resize-none h-14 py-4 px-6 focus-visible:ring-accent/50"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon" 
                  className="w-14 h-14 shrink-0 rounded-2xl bg-wellness-purple hover:bg-wellness-purple/90 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                >
                  <Send size={24} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
