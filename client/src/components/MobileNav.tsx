import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Users,
  Trophy,
  BookOpen,
  Shield,
  Target,
  Calendar,
  Vote,
  ChefHat,
  Camera,
  Stethoscope,
  Dumbbell,
  Monitor,
  Music,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { label: "Dashboard", icon: Home, href: "/" },
  { label: "Family Contacts", icon: Users, href: "/contacts" },
  { label: "Kynnect Video Chat", icon: Video, href: "/kynnect" },
  { label: "Events and Calendar", icon: Calendar, href: "/events" },
  { label: "Media Recommendations", icon: Monitor, href: "/media" },
  { label: "Polls and Voting", icon: Vote, href: "/polls" },
  { label: "Recipes", icon: ChefHat, href: "/recipes" },
  { label: "Playlists", icon: Music, href: "/playlists" },
  { label: "Games", icon: Trophy, href: "/games" },
  { label: "Milestones and Achievements", icon: Trophy, href: "/milestones" },
  { label: "Family History", icon: BookOpen, href: "/history" },
  { label: "Photos and Videos", icon: Camera, href: "/photos" },
  { label: "Health History", icon: Stethoscope, href: "/health" },
  { label: "Fitness Challenge", icon: Dumbbell, href: "/fitness" },
  { label: "Resources & Trusted Vendors", icon: Shield, href: "/resources" },
  { label: "Family Mission", icon: Target, href: "/mission" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-card border-border shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Mobile Menu */}
          <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-card border-r border-border z-50 lg:hidden transform transition-transform duration-300">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Link
                to="/about"
                className="flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F04caa7491bc2476fb971d605ad425587%2F168b5b3f9b8841d8b7c2cd0ba92279cb?format=webp&width=800"
                  alt="Kyn Logo"
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-xl font-tenor font-normal text-foreground">
                  Kyn
                </h1>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation Items */}
            <div className="p-4 overflow-y-auto h-full pb-20">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 text-sm transition-all rounded-lg",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-accent/10 hover:text-accent",
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
