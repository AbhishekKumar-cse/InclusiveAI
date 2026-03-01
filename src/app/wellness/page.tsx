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
import { doc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function WellnessPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: "Hi! I'm WellnessBot, your 24/7 wellbeing companion. I'm here to listen, support, and connect you with resources. Remember: I'm not a doctor, but I care about how you're doing. What's on your mind today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize a chat session in Firestore if user is logged in
  useEffect(() => {
    if (user && !sessionId && db) {
      const newSessionId = `wellness-${user.uid}-${Date.now()}`;
      setSessionId(newSessionId);
      
      const sessionRef = doc(db, "chatSessions", newSessionId);
      setDocumentNonBlocking(sessionRef, {
        id: newSessionId,
        userId: user.uid,
        module: "wellness",
        messages: [{
          role: "assistant",
          content: messages[0].content,
          timestamp: new Date().toISOString()
        }],
        riskLevel: "low",
        humanHandoffTriggered: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  }, [user, db, sessionId, messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    const userMsgObj = { role: 'user', content: userMessage, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsgObj];
    setMessages(newMessages);

    // Sync user message to Firestore
    if (sessionId && db) {
      const sessionRef = doc(db, "chatSessions", sessionId);
      updateDocumentNonBlocking(sessionRef, {
        messages: arrayUnion(userMsgObj),
        updatedAt: serverTimestamp()
      });
    }

    try {
      const response = await chatWithWellnessBot({
        message: userMessage,
        chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
        userLanguage: "en"
      });

      const assistantMsgObj = { 
        role: 'assistant', 
        content: response.aiResponse, 
        timestamp: new Date().toISOString(),
        riskScore: response.newRiskScore,
        flaggedForReview: response.flaggedForReview
      };
      
      setMessages([...newMessages, assistantMsgObj]);
      setRiskLevel(response.newRiskScore);

      // Log interaction and mood log to Firestore
      if (user && db) {
        // Sync assistant response to Firestore
        if (sessionId) {
          const sessionRef = doc(db, "chatSessions", sessionId);
          updateDocumentNonBlocking(sessionRef, {
            messages: arrayUnion(assistantMsgObj),
            riskLevel: response.newRiskScore > 70 ? "high" : response.newRiskScore > 30 ? "medium" : "low",
            humanHandoffTriggered: response.humanHandoffTriggered,
            updatedAt: serverTimestamp()
          });
        }

        // Create a MoodLog entry
        const moodLogId = `log-${Date.now()}`;
        const moodLogRef = doc(db, "users", user.uid, "moodLogs", moodLogId);
        setDocumentNonBlocking(moodLogRef, {
          id: moodLogId,
          userId: user.uid,
          date: new Date().toISOString().split('T')[0],
          moodScore: response.newRiskScore > 70 ? 1 : response.newRiskScore > 30 ? 3 : 5,
          moodEmoji: response.newRiskScore > 70 ? '😢' : response.newRiskScore > 30 ? '😐' : '😊',
          note: userMessage,
          aiNudgeSent: true,
          nudgeContent: response.aiResponse,
          timestamp: new Date().toISOString()
        }, { merge: true });
      }

      if (response.humanHandoffTriggered) {
        toast({
          title: "Crisis Support Triggered",
          description: "A counselor has been notified and will join shortly.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to WellnessBot. Please try again.",
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
            <div className="w-10 h-10 bg-wellness-purple rounded-full flex items-center justify-center text-xl">💚</div>
            <div>
              <h1 className="font-headline font-bold">WellnessBot</h1>
              <p className="text-[10px] text-muted-foreground">Online · Human Oversight Enabled</p>
            </div>
          </div>
          <Button variant="destructive" className="bg-crisis-red hover:bg-crisis-red/90 h-9 rounded-full px-6 flex gap-2">
            <AlertTriangle size={16} /> 🚨 I need help now
          </Button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Mood Tracking Sidebar (Left) */}
          <div className="hidden lg:flex w-80 border-r border-border/10 p-6 flex-col gap-6 overflow-y-auto">
            <section className="space-y-4">
              <h3 className="font-headline font-bold text-lg">Daily Check-in</h3>
              <div className="grid grid-cols-5 gap-2">
                {['😢', '😕', '😐', '🙂', '😊'].map((emoji, i) => (
                  <button key={i} className="glass p-3 rounded-xl hover:bg-primary/20 text-2xl transition-all">
                    {emoji}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Exercises</h3>
              <Card className="glass border-border/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm">Box Breathing</p>
                    <Badge variant="outline" className="text-[10px]">4 min</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Calm your nervous system instantly with guided breathwork.</p>
                  <Button variant="outline" size="sm" className="w-full text-xs">Start Now</Button>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Campus Help</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-sm">
                  <Building2 size={16} className="text-access-blue" /> Student Health Center
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-sm">
                  <Phone size={16} className="text-safe-green" /> 24hr Campus Helpline
                </Button>
              </div>
            </section>
          </div>

          {/* Chat Interface (Center) */}
          <div className="flex-1 flex flex-col bg-surface-dark/30">
            <div className="p-4 glass border-b border-border/20 flex items-center gap-3">
              <Info className="text-access-blue w-4 h-4 shrink-0" />
              <p className="text-xs text-muted-foreground">WellnessBot is an AI assistant. For emergencies, please use the button above or contact professional services.</p>
            </div>
            
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm ${m.role === 'assistant' ? 'bg-wellness-purple' : 'bg-primary'}`}>
                    {m.role === 'assistant' ? '💚' : <User size={16} />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'assistant' ? 'glass border-border/20' : 'bg-primary text-white'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-wellness-purple flex items-center justify-center text-sm animate-pulse">💚</div>
                  <div className="p-4 rounded-2xl glass border-border/20">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              {riskLevel >= 71 && (
                <div className="bg-crisis-red/20 border border-crisis-red/30 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3 text-crisis-red">
                    <AlertTriangle />
                    <h4 className="font-bold">We care about your safety</h4>
                  </div>
                  <p className="text-sm">It sounds like you might be going through something really difficult. A trained counselor has been notified and will join this conversation shortly.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="text-xs h-10 border-crisis-red/30">Call Helpline</Button>
                    <Button variant="outline" className="text-xs h-10 border-crisis-red/30">Crisis Text Line</Button>
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
                  placeholder="Tell WellnessBot what's on your mind..."
                  className="bg-surface-dark/50 border-border/30 rounded-2xl resize-none h-14 py-4"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon" 
                  className="w-14 h-14 shrink-0 rounded-2xl bg-wellness-purple hover:bg-wellness-purple/90"
                >
                  <Send size={24} />
                </Button>
              </div>
            </div>
          </div>

          {/* Resources Sidebar (Right) */}
          <div className="hidden xl:flex w-80 border-l border-border/10 p-6 flex-col gap-6 overflow-y-auto">
             <section className="space-y-4">
              <h3 className="font-headline font-bold text-lg flex items-center gap-2">
                <Sparkles size={20} className="text-accent" /> Daily Nudge
              </h3>
              <Card className="glass border-accent/20 bg-accent/5">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm leading-relaxed italic">"Take a deep breath and acknowledge one small win you achieved today. Even the smallest step is progress."</p>
                  <Badge variant="outline" className="text-[10px] text-accent border-accent/30">Mindfulness</Badge>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <h3 className="font-headline font-bold text-lg">Peer Circles</h3>
              <div className="space-y-3">
                {[
                  { name: "Exam Season Support", members: 12, time: "Tomorrow 5PM" },
                  { name: "First-Gen Connect", members: 8, time: "Wed 3PM" }
                ].map((c, i) => (
                  <div key={i} className="glass p-4 rounded-xl space-y-2">
                    <p className="text-sm font-bold">{c.name}</p>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{c.members} Members</span>
                      <span>{c.time}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] hover:bg-primary/20">Join Circle</Button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
