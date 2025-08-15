import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import { ArrowLeft, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  SubscriptionPlanCard,
  BillingCycleToggle,
} from "@/components/subscription";

export function Subscription() {
  const { user, loading } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const plan = {
    name: "Kyn Premium Family Connection",
    description:
      "Transform your family into an unstoppable connection powerhouse! Your own private family social network that actually makes you closer.",
    monthlyPrice: 4.99,
    yearlyPrice: 49.99, // About 2 months free
    features: [
      // Core Connection & Long-Distance Magic
      "Unlimited family members - everyone's invited to the family revolution!",
      "Real-time presence status - see who's awake across time zones for spontaneous calls",
      "Private secure messaging with end-to-end encryption that actually works",
      "HD video calling with up to 20 family members - perfect for long-distance family dinners",
      "Share your status and location when you want to - let grandma know you're safe!",
      "Virtual family hugs with reaction features - send love across any distance",
      "Family timezone tracker - never wake up grandpa in Australia again!",

      // Events & Organization That Brings Everyone Together
      "Never miss another birthday, anniversary, or special moment (even from 3000 miles away!)",
      "Smart event planning with automatic RSVP tracking for all family gatherings",
      "Shared family calendar that syncs with everyone's personal calendars globally",
      "Gift coordination so no one buys the same thing twice - worldwide shipping included!",
      "Family task lists and chore management that actually works (yes, really!)",
      "Virtual family meeting rooms - Sunday dinners that include everyone",
      "Holiday countdown timers with family traditions and memories",

      // Fun Family Activities & Games
      "Family recipe swap with ratings, reviews, and cooking challenges",
      "Interactive family trivia games with personalized questions about your clan",
      "Family fitness challenges - compete in steps, workouts, and healthy habits",
      "Virtual game nights with classic board games and card games built-in",
      "Family photo contests and challenges with voting and prizes",
      "Cooking competitions with recipe sharing and taste-test voting",
      "Family book club with shared reading lists and discussion threads",
      "Weekly family challenges - from kindness acts to learning new skills together",

      // Memories & Media That Connect Generations
      "Unlimited photo and video storage - preserve EVERYTHING for future generations",
      "AI-powered memory highlights and anniversary reminders that make you smile",
      "Shared family playlists across all music platforms - from grandpa's jazz to teen's TikTok hits",
      "Family recipe vault with ingredients, cooking tips, and secret family techniques",
      "Private family blog to document your amazing journey and inside jokes",
      "Voice message time capsules - record bedtime stories for future grandkids",
      "Family story sharing with photos, videos, and voice recordings",

      // Health & Wellness That Keeps Everyone Connected
      "Secure family health record storage accessible to trusted family members",
      "Group fitness challenges - grandparents vs. grandkids step competitions!",
      "Medical appointment coordination and reminders for aging family members",
      "Emergency contact information always accessible across all time zones",
      "Prescription and allergy tracking for everyone's safety during family visits",
      "Mental health check-ins and family support networks",
      "Family wellness goals and celebration of healthy milestone achievements",

      // Security & Privacy That Protects Your Family Legacy
      "Military-grade encryption for all your family data - safer than Fort Knox",
      "No ads, no tracking, no data selling - EVER (we pinky promise!)",
      "Complete data ownership with export anytime - your memories belong to you",
      "Two-factor authentication for bulletproof security that even teens can use",
      "Privacy controls - you decide who sees what, when, and where",
      "Secure sharing with non-family friends while keeping family stuff private",

      // Premium Features That Make Life Easier
      "Priority customer support with real humans who actually care about your family",
      "Advanced family analytics and insights - see who's the family's biggest cheerleader!",
      "Custom themes and personalization options for each family's unique vibe",
      "Integration with 1000+ apps and services your family already uses",
      "Offline access to essential family information - no internet, no problem",
      "Smart notifications that respect time zones and family schedules",
      "Family admin tools for organizing the chaos with love",

      // Legacy & Future Features That Last Forever
      "Digital family legacy preservation for generations - your great-great-grandkids will thank you",
      "Time capsule features for future family members with messages from today",
      "Family tree integration with genealogy tools and DNA connections",
      "Automatic backup to multiple secure locations worldwide",
      "Beta access to new features before anyone else - be the coolest family on the block",
      "Family memory books automatically generated from your shared moments",
      "Anniversary and milestone celebration tools that grow with your family",
    ],
  };

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

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<Crown />}
        title="Join the Family Revolution!"
        description="The Family Revolution has begun! Transform scattered group chats into epic family adventures. Bridge any distance with games, challenges, and memories that bring everyone closer - whether they're next door or across the globe!"
        features={[
          "Bring long-distance family closer with virtual family dinners and game nights",
          "Family recipe swap with cooking challenges and secret ingredient sharing",
          "Epic family fitness challenges - grandparents vs. grandkids step competitions!",
          "Interactive family trivia games with questions about YOUR family's inside jokes",
          "Family photo contests and monthly challenges that get everyone participating",
          "Shared family playlists - from grandpa's jazz to teen's TikTok hits",
          "Family timezone tracker - never wake up relatives in Australia again!",
          "Virtual family hugs with reactions - send love across any distance instantly",
          "Weekly family challenges - cooking competitions, kindness acts, learning together",
          "Family achievement badges and milestone celebrations that make everyone feel special",
          "Family book club with shared reading lists and discussion threads",
          "Never miss birthdays or anniversaries with smart reminders across time zones",
          "Military-grade security - your family memories stay private forever",
          "Unlimited storage for every photo, video, and voice message your family shares",
        ]}
        primaryAction={{
          text: "Start Your Family Revolution - $4.99/month",
          href: "/signup",
        }}
        secondaryAction={{
          text: "Already Part of the Revolution? Sign In",
          href: "/signin",
        }}
        accentColor="#BD692B"
        bgGradient="from-warm-brown/5 to-olive-green/5"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-olive-green/10 flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-warm-brown animate-pulse" />
          <p className="text-lg text-dark-blue">
            Loading your family's premium experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-olive-green/10 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <main className="flex-1 flex flex-col max-w-6xl mx-auto p-6 overflow-y-auto">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-warm-brown hover:text-warm-brown/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-warm-brown/5 via-olive-green/5 to-warm-brown/5 rounded-3xl -m-8"></div>
              <div className="relative z-10 space-y-6 py-8">
                <div className="flex justify-center items-center gap-3">
                  <Crown className="w-16 h-16 text-warm-brown relative">
                    <div className="absolute inset-0 bg-warm-brown/20 rounded-full blur-xl scale-150 animate-pulse"></div>
                  </Crown>
                </div>
                <div>
                  <h1 className="text-5xl font-tenor font-normal text-dark-blue mb-4 leading-tight">
                    Your Family Deserves the
                    <span className="text-warm-brown"> Premium </span>
                    Treatment!
                  </h1>
                  <p className="text-dark-blue/80 text-2xl max-w-4xl mx-auto leading-relaxed">
                    Turn scattered group chats into family game nights!
                    Transform missed moments into recipe swaps and fitness
                    challenges! Bridge any distance with the Family Revolution
                    platform -
                    <span className="font-bold text-warm-brown">
                      {" "}
                      for less than a fancy coffee!{" "}
                    </span>
                  </p>
                </div>

                {/* Testimonial */}
                <div className="bg-cream-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-warm-brown/10">
                  <p className="text-dark-blue italic text-lg">
                    "Finally, a place where our whole family actually talks to
                    each other! My teenage kids even responded to the family
                    group chat - it's a miracle!"
                  </p>
                  <p className="text-warm-brown font-semibold mt-2">
                    - Sarah M., Mother of 4
                  </p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="text-center space-y-4">
              <div className="bg-warm-brown text-cream-white px-6 py-3 text-lg font-semibold animate-pulse rounded-full inline-block">
                Join 50,000+ Happy Families Already Connected!
              </div>
              <p className="text-dark-blue/70 text-lg">
                Don't be the last family on the block to discover what
                everyone's talking about
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-tenor text-dark-blue">
                Choose Your Family's Adventure Plan
              </h2>
              <BillingCycleToggle
                billingCycle={billingCycle}
                onBillingCycleChange={setBillingCycle}
              />
            </div>

            {/* Main Pricing Card */}
            <div className="max-w-4xl mx-auto">
              <SubscriptionPlanCard
                plan={plan}
                billingCycle={billingCycle}
                onSubscribe={() => {
                  // Handle subscription logic
                  console.log("Subscribe clicked");
                }}
                isCurrentPlan={false}
              />
            </div>

            {/* Additional Info */}
            <div className="text-center space-y-4">
              <p className="text-dark-blue/70 text-lg">
                Start your family's premium journey today and transform how you
                stay connected!
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
