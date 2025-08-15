import { useEffect, useState } from "react";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
}

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: Shortcut[] = [
    {
      key: "h",
      description: "Go to Home/Dashboard",
      action: () => (window.location.href = "/"),
    },
    {
      key: "c",
      description: "Create new post",
      action: () => {
        const postButton = document.querySelector(
          '[data-action="new-post"]',
        ) as HTMLElement;
        if (postButton) postButton.click();
      },
    },
    {
      key: "p",
      description: "Upload photo",
      action: () => (window.location.href = "/photos"),
    },
    {
      key: "e",
      description: "Create event",
      action: () => {
        const eventButton = document.querySelector(
          '[data-action="create-event"]',
        ) as HTMLElement;
        if (eventButton) eventButton.click();
        else window.location.href = "/events";
      },
    },
    {
      key: "m",
      description: "View messages",
      action: () => (window.location.href = "/chat"),
    },
    {
      key: "f",
      description: "View family members",
      action: () => (window.location.href = "/family-management"),
    },
    {
      key: "s",
      description: "Search family",
      action: () => {
        const searchInput = document.querySelector(
          'input[placeholder*="search" i]',
        ) as HTMLInputElement;
        if (searchInput) searchInput.focus();
      },
    },
    {
      key: "?",
      description: "Show keyboard shortcuts",
      action: () => setShowHelp(true),
    },
    {
      key: "Escape",
      description: "Close dialogs",
      action: () => setShowHelp(false),
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Handle Escape key
      if (event.key === "Escape") {
        setShowHelp(false);
        return;
      }

      // Handle other shortcuts
      const shortcut = shortcuts.find(
        (s) => s.key.toLowerCase() === event.key.toLowerCase(),
      );
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!showHelp) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="fixed bottom-6 left-6 z-40 bg-white/80 backdrop-blur-sm border border-border shadow-lg hover:bg-white"
        onClick={() => setShowHelp(true)}
      >
        <Keyboard className="w-4 h-4 mr-2" />
        Press ? for shortcuts
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowHelp(false)}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-foreground">
                {shortcut.description}
              </span>
              <Badge variant="outline" className="font-mono text-xs">
                {shortcut.key === " " ? "Space" : shortcut.key}
              </Badge>
            </div>
          ))}

          <div className="pt-3 mt-3 border-t text-xs text-muted-foreground">
            <p>
              Tip: Press{" "}
              <Badge variant="outline" className="mx-1 font-mono">
                ?
              </Badge>{" "}
              anytime to see these shortcuts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
