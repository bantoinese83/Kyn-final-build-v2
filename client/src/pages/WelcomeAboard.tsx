import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Users,
  Heart,
  Gift,
  Calendar,
  Camera,
  QrCode,
  Share2,
  CheckCircle,
  Sparkles,
  Mail,
  Phone,
  Crown,
  UserPlus,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function WelcomeAboard() {
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      icon: Home,
      title: "Make your first post",
      description: "Share a memory, update, or just say hello to your family",
      color: "text-blue-600",
    },
    {
      icon: Users,
      title: "Explore family profiles",
      description:
        "Get to know your family members better through their profiles",
      color: "text-green-600",
    },
    {
      icon: Calendar,
      title: "Check upcoming events",
      description: "See what family gatherings and celebrations are coming up",
      color: "text-purple-600",
    },
    {
      icon: Camera,
      title: "Share photos & memories",
      description: "Upload photos from recent family moments",
      color: "text-pink-600",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-warm-brown/5 to-olive-green/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fun Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1.5 + Math.random() * 3}s`,
              }}
            >
              {i % 6 === 0 ? (
                <Sparkles className="w-4 h-4 text-yellow-500" />
              ) : i % 6 === 1 ? (
                <Heart className="w-4 h-4 text-red-500" />
              ) : i % 6 === 2 ? (
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
              ) : i % 6 === 3 ? (
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              ) : i % 6 === 4 ? (
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
              ) : (
                <div className="w-3 h-3 bg-pink-500 rounded-full" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-xl w-full space-y-8 relative z-10">
        {/* Luxurious Welcome Header */}
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-warm-brown/20 to-olive-green/20 rounded-full blur-xl scale-150 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-br from-cream-white to-warm-brown/10 rounded-full shadow-2xl border-2 border-warm-brown/20">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F04caa7491bc2476fb971d605ad425587%2F168b5b3f9b8841d8b7c2cd0ba92279cb?format=webp&width=800"
                  alt="Kyn Logo"
                  className="w-24 h-24 object-contain drop-shadow-xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-olive-green/10 rounded-full">
                <CheckCircle className="w-8 h-8 text-olive-green" />
              </div>
              <h1 className="text-4xl font-tenor font-normal text-dark-blue">
                You're In! Welcome Home!
              </h1>
            </div>
            <p className="text-xl text-light-blue-gray leading-relaxed max-w-lg mx-auto">
              Your family's private social network is ready! Time to connect,
              share, and make memories with the people who matter most.
            </p>
            <div className="flex justify-center gap-3">
              <Badge
                variant="outline"
                className="border-olive-green/30 text-olive-green bg-olive-green/10 px-4 py-2"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Account Active
              </Badge>
              <Badge
                variant="outline"
                className="border-warm-brown/30 text-warm-brown bg-warm-brown/10 px-4 py-2"
              >
                <Users className="w-4 h-4 mr-2" />
                Ready to Connect
              </Badge>
            </div>
          </div>
        </div>

        {/* Fun Success Message */}
        <Card className="border-2 border-warm-brown/30 bg-gradient-to-br from-cream-white via-warm-brown/5 to-olive-green/5 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-warm-brown/20 to-olive-green/20 rounded-full blur-lg scale-150"></div>
                <div className="relative p-4 bg-warm-brown/10 rounded-full">
                  <Sparkles className="w-12 h-12 text-warm-brown" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-dark-blue">
                Your Family's Social Hub is Live!
              </h2>
              <p className="text-lg text-dark-blue/80 leading-relaxed max-w-md mx-auto">
                Start sharing, connecting, and creating memories! Your family is
                going to love having their own private space to stay close.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-olive-green/10 rounded-full border border-olive-green/20">
                <Camera className="w-4 h-4 text-olive-green" />
                <span className="text-sm font-medium text-olive-green">
                  Time to share your first moment!
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority: Invite Your Family */}
        <Card className="border-3 border-olive-green/40 bg-gradient-to-br from-olive-green/5 via-cream-white to-olive-green/10 shadow-2xl ring-2 ring-olive-green/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-olive-green/15 rounded-full">
                <Users className="w-8 h-8 text-olive-green" />
              </div>
            </div>
            <CardTitle className="text-2xl text-dark-blue">
              Get Your Squad on Kyn!
            </CardTitle>
            <p className="text-olive-green font-medium">
              Time to invite your family and make this place come alive!
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-dark-blue/80 leading-relaxed">
                Your family network is only as awesome as the people in it!
                Start inviting everyone and watch the fun begin.
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-white/80 rounded-xl border border-warm-brown/20 hover:bg-warm-brown/5 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-warm-brown" />
                    <h3 className="font-semibold text-dark-blue">
                      Invite from Contacts
                    </h3>
                  </div>
                  <p className="text-sm text-dark-blue/70">
                    Tap your contacts and send fun invites - super easy!
                  </p>
                </div>

                <div className="p-4 bg-white/80 rounded-xl border border-olive-green/20 hover:bg-olive-green/5 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-olive-green" />
                    <h3 className="font-semibold text-dark-blue">
                      Email Your Family
                    </h3>
                  </div>
                  <p className="text-sm text-dark-blue/70">
                    Send cool email invitations to family anywhere in the world
                  </p>
                </div>

                <div className="p-4 bg-white/80 rounded-xl border border-light-blue-gray/30 hover:bg-light-blue-gray/5 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <QrCode className="w-5 h-5 text-light-blue-gray" />
                    <h3 className="font-semibold text-dark-blue">
                      Share QR Code
                    </h3>
                  </div>
                  <p className="text-sm text-dark-blue/70">
                    Create a QR code they can scan - instant access!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-olive-green hover:bg-olive-green/90 text-cream-white py-6 text-lg shadow-lg">
                <Phone className="w-5 h-5 mr-3" />
                Invite from Contacts
              </Button>
              <Button
                variant="outline"
                className="w-full border-warm-brown/30 text-warm-brown hover:bg-warm-brown/5 py-4"
              >
                <Mail className="w-5 h-5 mr-2" />
                Send Email Invites
              </Button>
            </div>

            <div className="text-center p-4 bg-olive-green/10 rounded-lg border border-olive-green/20">
              <p className="text-sm text-olive-green font-medium">
                More family = more fun! Get everyone connected!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Invitation Options */}
        <Card className="border-2 border-warm-brown/20 bg-gradient-to-br from-cream-white to-warm-brown/5 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-dark-blue flex items-center justify-center gap-2">
              <Share2 className="w-6 h-6 text-warm-brown" />
              More Ways to Share the Fun!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-dark-blue/70 text-center">
              The more family you get connected, the more awesome your dashboard
              becomes!
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-olive-green/30 text-olive-green hover:bg-olive-green/5 py-4"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Create QR Code
              </Button>
              <Button
                variant="outline"
                className="border-warm-brown/30 text-warm-brown hover:bg-warm-brown/5 py-4"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fun Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/">
            <Button className="w-full bg-gradient-to-r from-warm-brown to-warm-brown/90 hover:from-warm-brown/90 hover:to-warm-brown/80 text-cream-white py-6 shadow-lg border border-warm-brown/20">
              <Home className="w-5 h-5 mr-2" />
              My Dash
            </Button>
          </Link>
          <Link to="/profile">
            <Button
              variant="outline"
              className="w-full border-olive-green/30 text-olive-green hover:bg-olive-green/5 py-6 shadow-lg"
            >
              <Users className="w-5 h-5 mr-2" />
              My Profile
            </Button>
          </Link>
        </div>

        {/* Fun Family Quote */}
        <Card className="border border-warm-brown/20 bg-gradient-to-br from-cream-white via-warm-brown/5 to-olive-green/5 shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-warm-brown" />
              <Heart className="w-8 h-8 text-olive-green" />
              <Home className="w-8 h-8 text-light-blue-gray" />
            </div>
            <div className="space-y-3">
              <p className="text-lg text-dark-blue font-medium leading-relaxed">
                "Family + Social Network = The Perfect Combo! Time to make some
                digital memories!"
              </p>
              <p className="text-sm text-warm-brown font-medium">
                - Welcome to your family's social hub!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fun Footer Message */}
        <div className="text-center space-y-4">
          <div className="max-w-md mx-auto space-y-3">
            <p className="text-lg font-medium text-dark-blue">
              Ready to connect and have some fun?
            </p>
            <p className="text-dark-blue/70">
              Your family's going to love having their own private social
              network. Let the good times roll!
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-warm-brown/60 rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-olive-green/60 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-light-blue-gray/60 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
