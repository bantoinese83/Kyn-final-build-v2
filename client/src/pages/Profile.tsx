import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import {
  User,
  Settings,
  ArrowLeft,
  MapPin,
  Calendar,
  Camera,
  Heart,
  Star,
  Edit2,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseDataService } from "@/services";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio: string;
  location: string;
  birthday: string;
  phone: string;
  joinedDate: string;
  familyRole: string;
  interests: string[];
  stats: {
    postsCount: number;
    photosShared: number;
    eventsAttended: number;
    recipesShared: number;
  };
}

export function Profile() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch user profile data from Supabase
      const userProfileResult = await supabaseDataService.getUserById(user.id);

      if (userProfileResult.success && userProfileResult.data) {
        const userProfile = userProfileResult.data;

        // Fetch user's family information
        const userFamiliesResult = await supabaseDataService.getUserFamilies(
          user.id,
        );
        const primaryFamily =
          userFamiliesResult.success &&
          userFamiliesResult.data &&
          userFamiliesResult.data.length > 0
            ? userFamiliesResult.data[0]
            : null;

        // Determine family role - for now, assume regular member since we don't have detailed family data
        const familyRole = "Family Member"; // TODO: Implement proper role detection when family members table is available

        // Load user statistics
        const [postsResult, photosResult, eventsResult, recipesResult] =
          await Promise.all([
            supabaseDataService.getUserPostsCount(user.id),
            supabaseDataService.getUserPhotosCount(user.id),
            supabaseDataService.getUserEventsCount(user.id),
            supabaseDataService.getUserRecipesCount(user.id),
          ]);

        const profileData: UserProfile = {
          id: user.id,
          name: userProfile.name || "Family Member",
          email: userProfile.email || "",
          avatar: userProfile.avatar,
          bio: "Loving family member who enjoys creating memories and staying connected with everyone.",
          location: userProfile.location || "Location not set",
          birthday: "Birthday not set", // TODO: Add birthday field to users table
          phone: userProfile.phone || "Phone not set",
          joinedDate: userProfile.createdAt
            ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "Recently",
          familyRole: familyRole,
          interests: userProfile.interests || [
            "Photography",
            "Cooking",
            "Travel",
            "Reading",
            "Music",
          ],
          stats: {
            postsCount: postsResult.success ? postsResult.data || 0 : 0,
            photosShared: photosResult.success ? photosResult.data || 0 : 0,
            eventsAttended: eventsResult.success ? eventsResult.data || 0 : 0,
            recipesShared: recipesResult.success ? recipesResult.data || 0 : 0,
          },
        };
        setProfile(profileData);
      } else {
        // Create default profile if none exists
        const defaultProfile: UserProfile = {
          id: user.id,
          name: "Family Member",
          email: "",
          avatar: undefined,
          bio: "Loving family member who enjoys creating memories and staying connected with everyone.",
          location: "Location not set",
          birthday: "Birthday not set",
          phone: "Phone not set",
          joinedDate: "Recently",
          familyRole: "Family Member",
          interests: ["Photography", "Cooking", "Travel", "Reading", "Music"],
          stats: {
            postsCount: 0,
            photosShared: 0,
            eventsAttended: 0,
            recipesShared: 0,
          },
        };
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<User />}
        title="Create Your Family Profile"
        description="Build your personal profile, connect with family members, and showcase your personality in your family's private network."
        features={[
          "Create a personalized profile with photos and bio",
          "Share your interests and hobbies with family",
          "Track your family engagement and activities",
          "Connect with family members across generations",
          "Manage your privacy settings and preferences",
          "Showcase your family role and contributions",
        ]}
        primaryAction={{
          text: "Create Your Profile",
          href: "/signup",
        }}
        secondaryAction={{
          text: "Sign In to Your Profile",
          href: "/signin",
        }}
        accentColor="#2D548A"
        bgGradient="from-blue-50 to-indigo-50"
      />
    );
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-warm-brown/20 shadow-lg">
              <CardHeader className="text-center pb-6">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-24 h-24 border-4 border-warm-brown/20">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-xl bg-warm-brown/10 text-warm-brown">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-warm-brown hover:bg-warm-brown/90"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl text-dark-blue">
                  {profile.name}
                </CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="border-olive-green/30 text-olive-green"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    {profile.familyRole}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {profile.bio && (
                  <div>
                    <p className="text-sm text-dark-blue/80 text-center leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {profile.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-light-blue-gray" />
                      <span className="text-dark-blue/80">
                        {profile.location}
                      </span>
                    </div>
                  )}

                  {profile.birthday && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-light-blue-gray" />
                      <span className="text-dark-blue/80">
                        {profile.birthday}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-light-blue-gray" />
                    <span className="text-dark-blue/80">
                      Joined {profile.joinedDate}
                    </span>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-warm-brown hover:bg-warm-brown/90 text-cream-white">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-warm-brown mb-1">
                  {profile.stats.postsCount}
                </div>
                <div className="text-xs text-dark-blue/60">Posts</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-olive-green mb-1">
                  {profile.stats.photosShared}
                </div>
                <div className="text-xs text-dark-blue/60">Photos</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-light-blue-gray mb-1">
                  {profile.stats.eventsAttended}
                </div>
                <div className="text-xs text-dark-blue/60">Events</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-dark-blue mb-1">
                  {profile.stats.recipesShared}
                </div>
                <div className="text-xs text-dark-blue/60">Recipes</div>
              </Card>
            </div>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-dark-blue flex items-center gap-2">
                  <Heart className="w-5 h-5 text-warm-brown" />
                  Interests & Hobbies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-olive-green/30 text-olive-green hover:bg-olive-green/5"
                    >
                      {interest}
                    </Badge>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs border-dashed"
                  >
                    <span className="mr-1">+</span>
                    Add Interest
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-dark-blue flex items-center gap-2">
                  <Star className="w-5 h-5 text-warm-brown" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-warm-brown/5">
                    <Camera className="w-5 h-5 text-warm-brown" />
                    <div className="flex-1">
                      <p className="text-sm text-dark-blue">
                        Shared 5 photos from "Family BBQ"
                      </p>
                      <p className="text-xs text-dark-blue/60">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-olive-green/5">
                    <Heart className="w-5 h-5 text-olive-green" />
                    <div className="flex-1">
                      <p className="text-sm text-dark-blue">
                        Liked Mom's chocolate chip cookie recipe
                      </p>
                      <p className="text-xs text-dark-blue/60">1 day ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-light-blue-gray/5">
                    <Calendar className="w-5 h-5 text-light-blue-gray" />
                    <div className="flex-1">
                      <p className="text-sm text-dark-blue">
                        RSVP'd to "Sarah's Graduation Party"
                      </p>
                      <p className="text-xs text-dark-blue/60">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
