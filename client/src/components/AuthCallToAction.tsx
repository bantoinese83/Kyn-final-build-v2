import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Heart,
  ArrowRight,
  Sparkles,
  Shield,
  UserPlus,
  LogIn,
} from "lucide-react";

interface AuthCallToActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  primaryAction?: {
    text: string;
    href: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
  bgGradient?: string;
  accentColor?: string;
}

export function AuthCallToAction({
  icon,
  title,
  description,
  features,
  primaryAction = { text: "Create Your Family", href: "/signup" },
  secondaryAction = { text: "Sign In", href: "/signin" },
  bgGradient = "from-blue-50 to-purple-50",
  accentColor = "#2D548A",
}: AuthCallToActionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
              style={{ backgroundColor: accentColor }}
            >
              <div className="text-white text-3xl">{icon}</div>
            </div>
          </div>

          <h1 className="text-4xl font-tenor font-normal text-dark-blue mb-4">
            {title}
          </h1>
          <p className="text-xl text-light-blue-gray max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Main CTA Card */}
        <Card
          className={`border-2 shadow-2xl bg-gradient-to-br ${bgGradient} relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

          <CardContent className="p-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left side - Features */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  <h2 className="text-2xl font-semibold text-dark-blue">
                    Join Your Family's Private Space
                  </h2>
                </div>

                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: accentColor }}
                      >
                        <ArrowRight className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-dark-blue/80 font-medium">{feature}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-white/60 rounded-lg border border-white/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-dark-blue">
                      Private & Secure
                    </span>
                  </div>
                  <p className="text-sm text-dark-blue/70">
                    Your family's space is completely private. Only invited
                    family members can access your shared content and memories.
                  </p>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-semibold"
                          style={{
                            backgroundColor:
                              i === 1
                                ? "#BD692B"
                                : i === 2
                                  ? "#5D6739"
                                  : i === 3
                                    ? "#2D548A"
                                    : "#8B5A3C",
                          }}
                        >
                          {i === 1 ? "M" : i === 2 ? "D" : i === 3 ? "S" : "G"}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-dark-blue/70 mb-6">
                    Join thousands of families already connected on Kyn
                  </p>
                </div>

                <div className="space-y-4">
                  <Link to={primaryAction.href}>
                    <Button
                      className="w-full py-3 text-lg font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                      style={{ backgroundColor: accentColor }}
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      {primaryAction.text}
                    </Button>
                  </Link>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-dark-blue/20"></div>
                    <span className="text-sm text-dark-blue/60">or</span>
                    <div className="flex-1 h-px bg-dark-blue/20"></div>
                  </div>

                  <Link to={secondaryAction.href}>
                    <Button
                      variant="outline"
                      className="w-full py-3 text-lg font-semibold border-2 hover:bg-white/80 transition-all duration-300"
                      style={{ borderColor: accentColor, color: accentColor }}
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      {secondaryAction.text}
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-dark-blue/50 mt-4">
                  Free to start • No credit card required
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family Quote */}
        <div className="text-center mt-8">
          <div className="p-6 bg-white/60 rounded-2xl border-2 border-dashed border-light-blue-gray/30 shadow-inner max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-500" />
              <Users className="w-5 h-5 text-blue-500" />
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-lg text-dark-blue italic font-medium mb-2">
              "Family is not an important thing. It's everything."
            </p>
            <p className="text-sm text-light-blue-gray">- Michael J. Fox</p>
          </div>
        </div>
      </div>
    </div>
  );
}
