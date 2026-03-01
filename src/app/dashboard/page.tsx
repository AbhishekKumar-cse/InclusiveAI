"use client";

import { AppSidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  ShieldCheck, 
  Heart, 
  Search, 
  Bell, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  FileText,
  Map,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { cn } from "@/lib/utils";

const moodData = [
  { day: 'Mon', score: 3 },
  { day: 'Tue', score: 4 },
  { day: 'Wed', score: 2 },
  { day: 'Thu', score: 4 },
  { day: 'Fri', score: 5 },
  { day: 'Sat', score: 4 },
  { day: 'Sun', score: 4 },
];

export default function Dashboard() {
  return (
    <div className="flex bg-surface-dark min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <header className="h-16 glass sticky top-0 z-40 px-8 flex items-center justify-between border-b border-border/20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <h1 className="font-headline font-bold text-xl hidden md:block mr-8 whitespace-nowrap">Dashboard</h1>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input className="bg-surface-dark/50 border-border/30 pl-10 h-10 rounded-full" placeholder="Search modules, help, settings..." />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-crisis-red rounded-full" />
            </Button>
            <Badge variant="outline" className="border-accent/30 text-accent">EN</Badge>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-headline font-bold">Good morning, Alex! 👋</h2>
            <p className="text-muted-foreground">It's Monday, Oct 24th · Current Campus: Main Campus North</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Wellness Quick Check */}
            <Card className="glass border-wellness-purple/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">How are you feeling today?</CardTitle>
                <Heart className="text-wellness-purple h-4 w-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  {['😢', '😕', '😐', '🙂', '😊'].map((emoji, i) => (
                    <button key={i} className="text-2xl hover:scale-125 transition-transform">
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Last logged: Yesterday · 🙂 Good
                </div>
              </CardContent>
            </Card>

            {/* Safety Status */}
            <Card className="glass border-crisis-red/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Campus Safety Status</CardTitle>
                <ShieldCheck className="text-safe-green h-4 w-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-safe-green animate-pulse" />
                  <span className="font-bold text-safe-green">ALL CLEAR</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-surface-dark/40 border border-border/10">
                    <p className="text-[10px] text-muted-foreground uppercase">Rain</p>
                    <p className="text-sm font-bold">0mm</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-surface-dark/40 border border-border/10">
                    <p className="text-[10px] text-muted-foreground uppercase">Temp</p>
                    <p className="text-sm font-bold">28°C</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-surface-dark/40 border border-border/10">
                    <p className="text-[10px] text-muted-foreground uppercase">Wind</p>
                    <p className="text-sm font-bold">12km</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Score */}
            <Card className="glass border-access-blue/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Content Accessibility</CardTitle>
                <TrendingUp className="text-accent h-4 w-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold">67/100</div>
                  <div className="text-xs text-safe-green flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +22 pts
                  </div>
                </div>
                <Progress value={67} className="h-2 bg-surface-dark/50" />
                <p className="text-xs text-muted-foreground">Target: 95+ (WCAG AAA Compliance)</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Mood Chart */}
            <Card className="lg:col-span-2 glass overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Mood Trends — Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moodData}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7B5EA7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7B5EA7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={[1, 5]} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(2,128,144,0.3)', borderRadius: '8px' }}
                      itemStyle={{ color: '#7B5EA7' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#7B5EA7" fillOpacity={1} fill="url(#moodGradient)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 bg-surface-dark/30 hover:bg-primary/10 border-border/30 h-12">
                  <MessageCircle className="text-wellness-purple w-5 h-5" />
                  Chat with WellnessBot
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 bg-surface-dark/30 hover:bg-primary/10 border-border/30 h-12">
                  <FileText className="text-access-blue w-5 h-5" />
                  Get Accessible Notes
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 bg-surface-dark/30 hover:bg-primary/10 border-border/30 h-12">
                  <Map className="text-crisis-red w-5 h-5" />
                  View Campus Map
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { icon: Eye, title: "Transformed Lecture Notes", time: "2 hours ago", module: "AccessAssist", color: "text-access-blue" },
                  { icon: Heart, title: "Completed Morning Check-in", time: "5 hours ago", module: "Wellness", color: "text-wellness-purple" },
                  { icon: ShieldCheck, title: "Safety Alert: Heavy Rain Advisory", time: "Yesterday", module: "CrisisRadar", color: "text-crisis-red" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className={cn("mt-1 p-2 rounded-lg bg-surface-dark", item.color)}>
                      <item.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                        <Badge variant="outline" className="text-[10px] h-4 border-border/50">{item.module}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}