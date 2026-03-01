
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Eye, 
  Heart, 
  MapPin, 
  Palette, 
  Settings, 
  LogOut,
  Hexagon,
  ChevronLeft,
  ChevronRight,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/dashboard", color: "text-accent" },
  { icon: Eye, label: "AccessAssist", route: "/access-assist", color: "text-access-blue" },
  { icon: Heart, label: "Wellness", route: "/wellness", color: "text-wellness-purple" },
  { icon: MapPin, label: "CrisisRadar", route: "/crisis-radar", color: "text-crisis-red" },
  { icon: Palette, label: "InclusionKit", route: "/inclusion-kit", color: "text-teal-300" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen glass border-r border-border/30 transition-all duration-300 flex flex-col sticky top-0",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <Hexagon className="text-accent w-6 h-6" />
            <span className="font-headline font-bold text-lg">InclusiveAI</span>
          </Link>
        )}
        {collapsed && <Hexagon className="text-accent w-6 h-6 mx-auto" />}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-primary/10"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 mt-8 px-3 space-y-1">
        {navItems.map((item) => (
          <Link key={item.route} href={item.route}>
            <div className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
              pathname === item.route 
                ? "bg-primary/20 text-accent border border-primary/20" 
                : "text-muted-foreground hover:bg-surface-card hover:text-foreground"
            )}>
              <item.icon className={cn("w-5 h-5", pathname === item.route ? item.color : "group-hover:" + item.color)} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border/10 space-y-1">
        <Link href="/settings">
          <div className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-surface-card hover:text-foreground transition-all",
            pathname === "/settings" && "bg-primary/20 text-accent"
          )}>
            <Settings className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Settings</span>}
          </div>
        </Link>
        <div className="flex items-center gap-3 px-3 py-4 rounded-xl mt-4 bg-surface-dark/50 border border-border/20">
          <UserCircle className="w-8 h-8 text-muted-foreground" />
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">Alex Chen</p>
              <Badge variant="outline" className="text-[10px] py-0 px-1 border-accent/30 text-accent">Student</Badge>
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-crisis-red">
              <LogOut size={16} />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
