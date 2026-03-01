
"use client";

import { AppSidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Map as MapIcon, 
  Wind, 
  Thermometer, 
  CloudRain, 
  ShieldAlert,
  Navigation2,
  CheckCircle,
  XCircle,
  Edit
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

export default function CrisisRadar() {
  const [isAlertPending, setIsAlertPending] = useState(true);
  const mapImg = PlaceHolderImages.find(img => img.id === "module-crisis")!;

  return (
    <div className="flex bg-surface-dark min-h-screen">
      <AppSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 glass px-8 flex items-center justify-between border-b border-border/20 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-headline font-bold text-xl">CrisisRadar</h1>
            <Badge variant="outline" className="bg-safe-green/10 text-safe-green border-safe-green/20 font-bold">All Clear</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full h-9 border-border/30">History</Button>
            <Button size="sm" className="rounded-full bg-crisis-red h-9">Report Incident</Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Status Sidebar (Left) */}
          <aside className="w-80 border-r border-border/10 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
            <section className="space-y-4">
              <h3 className="font-headline font-bold text-lg">Live Campus Sensors</h3>
              <div className="grid grid-cols-1 gap-3">
                <Card className="glass border-border/10 bg-surface-dark/40">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CloudRain className="text-access-blue w-5 h-5" />
                      <span className="text-sm">Rainfall</span>
                    </div>
                    <span className="font-code text-accent">0 mm/hr</span>
                  </CardContent>
                </Card>
                <Card className="glass border-border/10 bg-surface-dark/40">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Thermometer className="text-crisis-orange w-5 h-5" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <span className="font-code text-accent">28 °C</span>
                  </CardContent>
                </Card>
                <Card className="glass border-border/10 bg-surface-dark/40">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wind className="text-muted-foreground w-5 h-5" />
                      <span className="text-sm">Wind Speed</span>
                    </div>
                    <span className="font-code text-accent">12 km/h</span>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="font-headline font-bold text-lg">Overall Risk Score</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Flood Risk</span>
                  <span className="text-safe-green font-bold">LOW</span>
                </div>
                <Progress value={12} className="h-2 bg-surface-dark/50" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Heat Index</span>
                  <span className="text-crisis-orange font-bold">MEDIUM</span>
                </div>
                <Progress value={45} className="h-2 bg-surface-dark/50" />
              </div>
            </section>

            {isAlertPending && (
              <section className="space-y-4 mt-4 p-4 border border-crisis-yellow/30 bg-crisis-yellow/5 rounded-2xl">
                <div className="flex items-center gap-2 text-crisis-yellow font-bold text-sm">
                  <ShieldAlert size={16} /> Pending Approval
                </div>
                <p className="text-xs leading-relaxed italic text-muted-foreground">
                  "Flood Risk Alert: South Block basement shows high water accumulation. Move to Level 1."
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-8 text-[10px] border-border/30">Edit</Button>
                  <Button className="h-8 text-[10px] bg-safe-green text-teal-900 font-bold hover:bg-safe-green/90">Approve</Button>
                </div>
              </section>
            )}
          </aside>

          {/* Interactive Map (Center) */}
          <div className="flex-1 relative bg-surface-dark/50">
            {/* Simulation of a map view */}
            <div className="absolute inset-0 overflow-hidden">
               <Image 
                src={mapImg.imageUrl} 
                alt={mapImg.description}
                fill
                className="object-cover opacity-50 grayscale contrast-125"
                data-ai-hint={mapImg.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
              
              {/* Map UI Overlays */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <Button variant="secondary" size="icon" className="glass h-10 w-10 rounded-xl"><Navigation2 size={18} /></Button>
                <Button variant="secondary" size="icon" className="glass h-10 w-10 rounded-xl"><MapIcon size={18} /></Button>
              </div>

              {/* Simulated Risk Polygons/Hotspots */}
              <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-safe-green/10 border-2 border-safe-green/30 flex items-center justify-center backdrop-blur-sm">
                <Badge className="bg-safe-green">Safe Zone</Badge>
              </div>
              <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-crisis-red/10 border-2 border-crisis-red/30 flex items-center justify-center backdrop-blur-sm">
                <Badge className="bg-crisis-red">Risk Zone: South Block</Badge>
              </div>
            </div>

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-8 left-8 right-8 grid md:grid-cols-4 gap-4 pointer-events-none">
              <Card className="glass pointer-events-auto border-border/30">
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">Active Incidents</h4>
                  <div className="text-lg font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-safe-green" /> 0 Active
                  </div>
                </CardContent>
              </Card>
              <Card className="glass pointer-events-auto border-border/30">
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">Evacuation Routes</h4>
                  <p className="text-sm font-bold text-accent">3 Routes Optimized</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
