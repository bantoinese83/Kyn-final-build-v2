// BillingCycleToggle Component - Handles billing cycle selection
// Extracted from Subscription.tsx to improve maintainability and reusability

import { Calendar, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BillingCycleToggleProps {
  billingCycle: "monthly" | "yearly";
  onBillingCycleChange: (cycle: "monthly" | "yearly") => void;
  className?: string;
}

export function BillingCycleToggle({
  billingCycle,
  onBillingCycleChange,
  className = "",
}: BillingCycleToggleProps) {
  const getSavings = () => {
    const monthlyPrice = 4.99;
    const yearlyPrice = 49.99;
    const yearlyMonthly = yearlyPrice / 12;
    const savings = (
      ((monthlyPrice - yearlyMonthly) / monthlyPrice) *
      100
    ).toFixed(0);
    return savings;
  };

  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      <div className="text-center">
        <Button
          variant={billingCycle === "monthly" ? "default" : "outline"}
          onClick={() => onBillingCycleChange("monthly")}
          className="flex items-center space-x-2 px-6 py-3"
        >
          <Calendar className="h-5 w-5" />
          <span>Monthly</span>
        </Button>
        <p className="text-sm text-muted-foreground mt-1">$4.99/month</p>
      </div>

      <div className="text-center">
        <Button
          variant={billingCycle === "yearly" ? "default" : "outline"}
          onClick={() => onBillingCycleChange("yearly")}
          className="flex items-center space-x-2 px-6 py-3"
        >
          <Gift className="h-5 w-5" />
          <span>Yearly</span>
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
            Save {getSavings()}%
          </Badge>
        </Button>
        <p className="text-sm text-muted-foreground mt-1">$49.99/year</p>
        <p className="text-xs text-green-600 font-medium">~2 months free!</p>
      </div>
    </div>
  );
}
