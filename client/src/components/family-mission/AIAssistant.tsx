// AIAssistant Component - Handles AI mission generation functionality
// Extracted from FamilyMission.tsx for better modularity and maintainability

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
  className?: string;
}

export function AIAssistant({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
  className = "",
}: AIAssistantProps) {
  const [customPrompt, setCustomPrompt] = useState("");

  const handleGenerate = async () => {
    if (!customPrompt.trim()) return;

    await onGenerate(customPrompt);
    setCustomPrompt("");
  };

  const handleClose = () => {
    setCustomPrompt("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-2xl ${className}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>AI Mission Assistant</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="aiPrompt">Describe your family</Label>
            <Textarea
              id="aiPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Tell us about your family's culture, traditions, goals, and what makes you unique..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !customPrompt.trim()}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Mission
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
