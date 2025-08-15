// ErrorDisplay Component - Displays errors with retry functionality
// Extracted from SimpleRightSidebar.tsx for better modularity and maintainability

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  className = "",
}: ErrorDisplayProps) {
  if (!error) {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="mt-2 w-full"
        >
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
