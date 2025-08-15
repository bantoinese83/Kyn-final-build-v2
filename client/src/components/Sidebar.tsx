import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Calendar,
  Activity,
  ChefHat,
  GamepadIcon,
  MapPin,
  Heart,
  Menu,
  TreePine,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const quickLinks = [
  { label: "Photos", icon: Camera, href: "/photos" },
  { label: "Events", icon: Calendar, href: "/events" },
  { label: "Fitness", icon: Activity, href: "/fitness" },
  { label: "Recipes", icon: ChefHat, href: "/recipes" },
  { label: "360 Games", icon: GamepadIcon, href: "/games" },
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen w-80 bg-card border-r border-border flex flex-col shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-sage-green to-muted-slate rounded-lg flex items-center justify-center shadow-sm">
            <TreePine className="w-5 h-5 text-warm-cream" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Kyn</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Hamburger Menu */}
          <div className="flex justify-start">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-accent/10 transition-colors group"
              onClick={() => {
                // Pop-out navigation menu functionality would go here
                console.log("Opening navigation menu...");
              }}
            >
              <Menu className="w-5 h-5 text-foreground group-hover:text-accent transition-colors" />
            </Button>
          </div>

          {/* Who's Around */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Who's Around
            </h3>
            <div className="space-y-1">
              {[
                {
                  name: "Cousin Vic",
                  time: "3 min ago",
                  initials: "CV",
                  online: true,
                },
                { name: "Mom", time: "5 min ago", initials: "M", online: true },
                {
                  name: "Aunt Mary",
                  time: "3 min ago",
                  initials: "AM",
                  online: false,
                },
              ].map((person, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                        {person.initials}
                      </AvatarFallback>
                    </Avatar>
                    {person.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{person.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {person.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group Chat */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-colors cursor-pointer">
              <div className="relative flex -space-x-2">
                <Avatar className="w-6 h-6 border-2 border-card">
                  <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                    D
                  </AvatarFallback>
                </Avatar>
                <Avatar className="w-6 h-6 border-2 border-card">
                  <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                    M
                  </AvatarFallback>
                </Avatar>
                <Avatar className="w-6 h-6 border-2 border-card">
                  <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                    L
                  </AvatarFallback>
                </Avatar>
                <div className="w-6 h-6 border-2 border-card rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+2</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium">Beach Trip</div>
                <div className="text-xs text-muted-foreground">
                  5 participants
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Quick Links
            </h3>
            <div className="space-y-1">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
