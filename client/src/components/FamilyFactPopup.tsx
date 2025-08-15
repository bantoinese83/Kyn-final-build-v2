import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Lightbulb, VolumeX, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FamilyFactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSilence: () => void;
}

const familyFacts = [
  {
    fact: "Families who eat dinner together 3+ times per week have children who are 12% less likely to be overweight and 24% more likely to eat healthier foods.",
    source: "Harvard School of Public Health",
  },
  {
    fact: "Children who help with family cooking are 10% more likely to eat vegetables and have better nutritional knowledge as adults.",
    source: "Journal of Nutrition Education",
  },
  {
    fact: "Family storytelling increases children's emotional intelligence by 23% and helps preserve family history for up to 3 generations.",
    source: "Emory University Research",
  },
  {
    fact: "Families that take photos together create 67% stronger emotional bonds and improve long-term memory retention of shared experiences.",
    source: "Psychology Today Research",
  },
  {
    fact: "Playing board games as a family increases children's math skills by 15% and improves problem-solving abilities.",
    source: "University of Rochester Study",
  },
];

export function FamilyFactPopup({
  isOpen,
  onClose,
  onSilence,
}: FamilyFactPopupProps) {
  const [currentFact, setCurrentFact] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);
  const [isPaused, setIsPaused] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [canShowNext, setCanShowNext] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check if 8 hours have passed since last fact
      const lastFactTime = localStorage.getItem("lastFamilyFactTime");
      const now = Date.now();
      const eightHours = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

      if (lastFactTime && now - parseInt(lastFactTime) < eightHours) {
        setCanShowNext(true);
      } else {
        localStorage.setItem("lastFamilyFactTime", now.toString());
      }

      setCurrentFact(Math.floor(Math.random() * familyFacts.length));
      setTimeLeft(12);
      setIsPaused(false);
    }
  }, [isOpen]);

  // Timer countdown effect
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          // Use setTimeout to avoid setState during render
          setTimeout(() => onClose(), 0);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, onClose]);

  const handleMouseDown = () => {
    setIsMouseDown(true);
    setIsPaused(true);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setIsPaused(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsPaused(false);
  };

  if (!isOpen) return null;

  const fact = familyFacts[currentFact];

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-96">
      {/* Top-right corner notification */}
      <div
        className={cn(
          "bg-cream-white border-2 border-light-blue-gray/40 rounded-3xl shadow-xl p-4 transform transition-all duration-500 animate-in slide-in-from-right-full",
          "backdrop-blur-sm",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-bounce">💡</div>
            <h3 className="text-base font-bold text-dark-blue">
              Fun Fam Fact! ✨
            </h3>
            {canShowNext && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-accent hover:bg-accent/10"
                onClick={() => {
                  localStorage.setItem(
                    "lastFamilyFactTime",
                    Date.now().toString(),
                  );
                  setCanShowNext(false);
                  setCurrentFact(
                    Math.floor(Math.random() * familyFacts.length),
                  );
                  setTimeLeft(12);
                }}
                title="Show another fact"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Next
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-light-blue-gray/20 rounded-full"
              onClick={onSilence}
              title="Silence family facts"
            >
              <span className="text-base">🔇</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-light-blue-gray/20 rounded-full"
              onClick={onClose}
            >
              <span className="text-base">✕</span>
            </Button>
          </div>
        </div>

        {/* Fact Content */}
        <div className="space-y-4">
          <div
            className={cn(
              "p-3 bg-cream-white/80 rounded-2xl border-2 border-dashed border-light-blue-gray/30 cursor-pointer transition-all user-select-none shadow-inner",
              isMouseDown &&
                "bg-light-blue-gray/20 border-light-blue-gray/50 scale-[0.98] shadow-lg",
            )}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            title="Click and hold to pause timer ⏸️"
          >
            <p className="text-sm text-dark-blue leading-relaxed font-medium">
              {fact.fact}
            </p>
            {isPaused && (
              <div className="mt-2 text-sm text-dark-blue font-bold flex items-center gap-2 animate-pulse">
                <span className="text-base">⏸️</span>
                <span>Reading time! Release when done 📖</span>
              </div>
            )}
          </div>

          <div className="text-xs text-dark-blue/70 italic text-center bg-cream-white/60 rounded-full px-3 py-1">
            📚 Source: {fact.source}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentFact((prev) => (prev + 1) % familyFacts.length);
              setTimeLeft(12); // Reset timer for new fact
            }}
            className="text-sm h-8 px-3 bg-cream-white border-2 border-light-blue-gray hover:bg-light-blue-gray/10 rounded-full font-medium"
          >
            🎲 Another Fact!
          </Button>
          <Button
            className="bg-dark-blue hover:bg-dark-blue/90 text-cream-white text-sm h-8 px-3 rounded-full font-medium shadow-lg"
            size="sm"
            onClick={onClose}
          >
            ✨ Thanks!
          </Button>
        </div>

        {/* Auto-dismiss timer visualization */}
        <div className="mt-3">
          <div className="w-full h-2 bg-cream-white/60 rounded-full overflow-hidden shadow-inner">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-100",
                isPaused ? "bg-light-blue-gray" : "bg-dark-blue",
              )}
              style={{
                width: `${(timeLeft / 12) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
