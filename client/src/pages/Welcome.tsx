import { useState } from "react";
import { Link } from "react-router-dom";
import {
  QrCode,
  Heart,
  Users,
  Shield,
  Home,
  ArrowRight,
  Sparkles,
  Calendar,
  Camera,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Welcome() {
  const [scanMode, setScanMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-light-blue-gray/10 to-warm-brown/5 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        {/* Logo and Welcome */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-warm-brown/20 to-olive-green/20 rounded-full blur-xl scale-150 animate-pulse"></div>
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F04caa7491bc2476fb971d605ad425587%2F168b5b3f9b8841d8b7c2cd0ba92279cb?format=webp&width=800"
                alt="Kyn Logo"
                className="w-24 h-24 object-contain relative drop-shadow-lg"
              />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-tenor font-normal text-dark-blue mb-2">
              Welcome Home to Kyn
            </h1>
            <p className="text-light-blue-gray text-xl leading-relaxed">
              Where your family's heart finds its digital home
            </p>
            <Badge className="bg-warm-brown/10 text-warm-brown border-warm-brown/30 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />A sanctuary built just for
              families like yours
            </Badge>
          </div>
        </div>

        {/* Warm Welcome Message */}
        <Card className="border-2 border-warm-brown/20 bg-gradient-to-br from-cream-white to-warm-brown/5 shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-dark-blue mb-4">
              Your Family Deserves Something Beautiful
            </h2>
            <p className="text-dark-blue/80 text-lg leading-relaxed">
              We know how precious your family connections are. That's why we've
              created a space where every moment matters, every memory is
              treasured, and every family member feels truly at home.
            </p>
          </CardContent>
        </Card>

        {/* Key Features - Emphasized */}
        <Card className="border-2 border-olive-green/30 bg-gradient-to-br from-cream-white to-olive-green/5 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-dark-blue text-center flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-olive-green" />
              What Makes Kyn Special for Your Family
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start gap-4 p-3 rounded-lg bg-white/50">
              <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-blue mb-1">
                  Genuine Family Connections
                </h3>
                <p className="text-sm text-dark-blue/80">
                  No social media pressure, no strangers - just your family
                  being authentically themselves
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg bg-white/50">
              <div className="flex-shrink-0 p-2 bg-green-100 rounded-full">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-blue mb-1">
                  100% Private & Secure
                </h3>
                <p className="text-sm text-dark-blue/80">
                  Your family moments stay in your family - we'll never sell
                  your data or show ads
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg bg-white/50">
              <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-blue mb-1">
                  Never Miss Important Moments
                </h3>
                <p className="text-sm text-dark-blue/80">
                  Birthdays, anniversaries, family gatherings - stay connected
                  to what matters most
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg bg-white/50">
              <div className="flex-shrink-0 p-2 bg-purple-100 rounded-full">
                <Camera className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-blue mb-1">
                  Preserve Precious Memories
                </h3>
                <p className="text-sm text-dark-blue/80">
                  Unlimited photo storage, shared recipes, family stories - your
                  legacy lives here
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg bg-white/50">
              <div className="flex-shrink-0 p-2 bg-orange-100 rounded-full">
                <MessageCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-blue mb-1">
                  Distraction-Free Communication
                </h3>
                <p className="text-sm text-dark-blue/80">
                  No likes, no ads, no algorithm - just meaningful conversations
                  with the people you love
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Options */}
        <div className="space-y-6">
          {!scanMode ? (
            <>
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-semibold text-dark-blue">
                  Ready to Come Home?
                </h2>
                <p className="text-light-blue-gray text-lg">
                  Choose how you'd like to start your family's journey
                </p>
              </div>

              {/* Join Existing Family */}
              <Card className="border-2 border-warm-brown/30 hover:border-warm-brown/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-cream-white to-warm-brown/5">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-dark-blue flex items-center gap-3">
                    <div className="p-2 bg-warm-brown/10 rounded-full">
                      <Users className="w-6 h-6 text-warm-brown" />
                    </div>
                    Your Family is Waiting for You
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-dark-blue/80 leading-relaxed">
                    A family member has already created your family's beautiful
                    digital home. Join them with a simple scan or by entering
                    your family details.
                  </p>
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-warm-brown hover:bg-warm-brown/90 text-cream-white py-6 text-lg"
                      onClick={() => setScanMode(true)}
                    >
                      <QrCode className="w-5 h-5 mr-3" />
                      Scan Family QR Code
                    </Button>
                    <Link to="/join-family" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-warm-brown/30 text-dark-blue hover:bg-warm-brown/5 py-4"
                      >
                        Enter Family Details Manually
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Create New Family */}
              <Card className="border-2 border-olive-green/30 hover:border-olive-green/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-cream-white to-olive-green/5">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-dark-blue flex items-center gap-3">
                    <div className="p-2 bg-olive-green/10 rounded-full">
                      <Home className="w-6 h-6 text-olive-green" />
                    </div>
                    Start Your Family's Digital Legacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-dark-blue/80 leading-relaxed">
                    Be the one who brings your family together in this
                    beautiful, private space. Create your family's digital home
                    and invite everyone to join the magic.
                  </p>
                  <Link to="/create-family">
                    <Button className="w-full bg-olive-green hover:bg-olive-green/90 text-cream-white py-6 text-lg">
                      <Sparkles className="w-5 h-5 mr-3" />
                      Create Your Family's Home
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Button>
                  </Link>
                  <p className="text-sm text-dark-blue/60 text-center">
                    ✨ You'll be able to invite family members right after setup
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            /* QR Scanner Interface */
            <Card className="border-2 border-warm-brown/30 bg-gradient-to-br from-cream-white to-warm-brown/5">
              <CardHeader>
                <CardTitle className="text-xl text-dark-blue text-center flex items-center justify-center gap-2">
                  <QrCode className="w-6 h-6" />
                  Welcome Home! Scan Your Family's Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-center text-dark-blue/80">
                  Point your camera at the QR code your family member shared
                  with you
                </p>

                {/* QR Scanner Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-warm-brown/5 to-warm-brown/10 rounded-xl border-2 border-dashed border-warm-brown/30 flex flex-col items-center justify-center">
                  <QrCode className="w-20 h-20 text-warm-brown/60 mb-6" />
                  <p className="text-sm text-dark-blue/70 text-center mb-6">
                    Position the QR code within the scanning frame below
                  </p>
                  <div className="relative">
                    <div className="w-40 h-40 border-3 border-warm-brown rounded-xl relative bg-white/30">
                      {/* Corner indicators */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-warm-brown rounded-tl-lg"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-warm-brown rounded-tr-lg"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-warm-brown rounded-bl-lg"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-warm-brown rounded-br-lg"></div>
                      {/* Scanning line animation */}
                      <div className="absolute inset-0 overflow-hidden rounded-lg">
                        <div className="w-full h-1 bg-warm-brown/60 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-warm-brown/30 py-4"
                    onClick={() => setScanMode(false)}
                  >
                    ← Back to Welcome Options
                  </Button>
                  <Link to="/join-family">
                    <Button
                      variant="ghost"
                      className="w-full text-dark-blue/70 hover:text-dark-blue"
                    >
                      Enter family details manually instead
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Warm Footer */}
        <Card className="border border-light-blue-gray/20 bg-gradient-to-br from-cream-white/80 to-light-blue-gray/5">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-dark-blue">
                Your family's happiness is just one click away
              </p>
              <p className="text-sm text-light-blue-gray italic">
                "Family is not an important thing. It's everything." - Michael
                J. Fox
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
