import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Camera,
  Calendar,
  Users,
  Gift,
  MessageCircle,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNewPost = () => {
    navigate("/");
    // Trigger new post modal or focus on post creation area
    setTimeout(() => {
      const postButton = document.querySelector(
        '[data-action="new-post"]',
      ) as HTMLElement;
      if (postButton) {
        postButton.click();
      }
    }, 100);
  };

  const handleSharePhoto = () => {
    navigate("/photos");
    toast({
      title: "Photo Sharing",
      description: "Navigate to photos to share images with your family.",
    });
  };

  const handleCreateEvent = () => {
    navigate("/events");
    // Focus on create event functionality
    setTimeout(() => {
      const createButton = document.querySelector(
        '[data-action="create-event"]',
      ) as HTMLElement;
      if (createButton) {
        createButton.click();
      }
    }, 100);
  };

  const handleInviteFamily = () => {
    navigate("/family-management");
    toast({
      title: "Family Invitations",
      description: "Go to Family Management to invite new members.",
    });
  };

  const handleSendGift = () => {
    toast({
      title: "Gift Feature",
      description: "Gift sending feature coming soon! 🎁",
    });
  };

  const handleQuickMessage = () => {
    navigate("/chat");
    toast({
      title: "Quick Message",
      description: "Opening family chat for quick messaging.",
    });
  };

  const actions = [
    {
      icon: Edit,
      label: "New Post",
      color: "hover:opacity-90",
      onClick: handleNewPost,
      customStyle: { backgroundColor: "#2D548A" },
    },
    {
      icon: Camera,
      label: "Share Photo",
      color: "hover:opacity-90",
      onClick: handleSharePhoto,
      customStyle: { backgroundColor: "#5D6739" },
    },
    {
      icon: Video,
      label: "Start Video Call",
      color: "hover:opacity-90",
      onClick: () => navigate("/kynnect"),
      customStyle: { backgroundColor: "#BD692B" },
    },
    {
      icon: Calendar,
      label: "Create Event",
      color: "hover:opacity-90",
      onClick: handleCreateEvent,
      customStyle: { backgroundColor: "#2D548A" },
    },
    {
      icon: Users,
      label: "Invite Family",
      color: "hover:opacity-90",
      onClick: handleInviteFamily,
      customStyle: { backgroundColor: "#BD692B" },
    },
    {
      icon: Gift,
      label: "Send Gift",
      color: "hover:opacity-90",
      onClick: handleSendGift,
      customStyle: { backgroundColor: "#BD692B" },
    },
    {
      icon: MessageCircle,
      label: "Quick Message",
      color: "hover:opacity-90",
      onClick: handleQuickMessage,
      customStyle: { backgroundColor: "#5D6739" },
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {/* Action Buttons */}
      <div
        className={cn(
          "flex flex-col-reverse gap-3 mb-3 transition-all duration-300",
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.label}
              className="flex items-center gap-3 transition-all duration-300"
              style={{ transitionDelay: isOpen ? `${index * 50}ms` : "0ms" }}
            >
              <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-border text-base font-medium text-foreground whitespace-nowrap">
                {action.label}
              </div>
              <Button
                size="lg"
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg text-white transition-all duration-200 hover:scale-110",
                  action.color,
                )}
                style={action.customStyle || {}}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
              >
                <Icon className="w-5 h-5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <Button
        size="lg"
        className={cn(
          "w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 text-white",
          isOpen ? "rotate-45" : "",
        )}
        style={{
          backgroundColor: isOpen ? "#BD692B" : "#2D548A",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>
    </div>
  );
}
