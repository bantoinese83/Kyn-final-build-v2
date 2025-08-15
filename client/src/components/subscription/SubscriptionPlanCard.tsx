// SubscriptionPlanCard Component - Displays subscription plan details
// Extracted from Subscription.tsx to improve maintainability and reusability

import {
  Crown,
  Check,
  Star,
  Zap,
  Heart,
  Lock,
  Infinity,
  Sparkles,
  Gift,
  PartyPopper,
  Camera,
  Video,
  MessageSquare,
  Calendar,
  Music,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SubscriptionPlan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  billingCycle: "monthly" | "yearly";
  onSubscribe: () => void;
  isCurrentPlan?: boolean;
  className?: string;
}

export function SubscriptionPlanCard({
  plan,
  billingCycle,
  onSubscribe,
  isCurrentPlan = false,
  className = "",
}: SubscriptionPlanCardProps) {
  const getPrice = () => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = () => {
    const yearlyMonthly = plan.yearlyPrice / 12;
    const savings = (
      ((plan.monthlyPrice - yearlyMonthly) / plan.monthlyPrice) *
      100
    ).toFixed(0);
    return savings;
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes("unlimited") || feature.includes("Unlimited"))
      return Infinity;
    if (
      feature.includes("security") ||
      feature.includes("encryption") ||
      feature.includes("privacy")
    )
      return Lock;
    if (feature.includes("video") || feature.includes("calling")) return Video;
    if (feature.includes("photo") || feature.includes("camera")) return Camera;
    if (feature.includes("message") || feature.includes("chat"))
      return MessageSquare;
    if (feature.includes("calendar") || feature.includes("event"))
      return Calendar;
    if (feature.includes("music") || feature.includes("playlist")) return Music;
    if (feature.includes("location") || feature.includes("map")) return MapPin;
    if (feature.includes("game") || feature.includes("challenge")) return Zap;
    if (feature.includes("family") || feature.includes("love")) return Heart;
    if (feature.includes("premium") || feature.includes("special")) return Star;
    if (feature.includes("gift") || feature.includes("celebration"))
      return Gift;
    if (feature.includes("party") || feature.includes("fun"))
      return PartyPopper;
    if (feature.includes("magic") || feature.includes("amazing"))
      return Sparkles;
    return Check;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Card
      className={`relative overflow-hidden ${className} ${
        isCurrentPlan
          ? "ring-2 ring-warm-brown shadow-lg"
          : "hover:shadow-lg transition-shadow"
      }`}
    >
      {isCurrentPlan && (
        <div className="absolute top-0 right-0 bg-warm-brown text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
          Current Plan
        </div>
      )}

      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-warm-brown to-olive-green rounded-full">
            <Crown className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-dark-blue mb-2">
          {plan.name}
        </CardTitle>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {plan.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pricing */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-dark-blue">
              {formatPrice(getPrice())}
            </span>
            <span className="text-muted-foreground">
              /{billingCycle === "monthly" ? "month" : "year"}
            </span>
          </div>

          {billingCycle === "yearly" && (
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Save {getSavings()}%
              </Badge>
              <span className="text-sm text-muted-foreground">
                vs monthly billing
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h4 className="font-semibold text-dark-blue text-lg mb-3">
            What's Included:
          </h4>
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {plan.features.map((feature, index) => {
              const Icon = getFeatureIcon(feature);
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Icon className="h-4 w-4 text-warm-brown" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {feature}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Button
            onClick={onSubscribe}
            className={`w-full ${
              isCurrentPlan
                ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-warm-brown to-olive-green hover:from-warm-brown/90 hover:to-olive-green/90 text-white"
            }`}
            disabled={isCurrentPlan}
          >
            {isCurrentPlan ? "Current Plan" : "Subscribe Now"}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Cancel anytime • No hidden fees</p>
          <p>30-day money-back guarantee</p>
        </div>
      </CardContent>
    </Card>
  );
}
