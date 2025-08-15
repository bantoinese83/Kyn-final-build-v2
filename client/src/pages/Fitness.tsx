import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import {
  ArrowLeft,
  Activity,
  Trophy,
  Target,
  Users,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Heart,
  Zap,
  Award,
  TrendingUp,
  Play,
  Star,
  CheckCircle,
  Flame,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SimpleRightSidebar } from "@/components/SimpleRightSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabaseDataService } from "@/services";

interface FitnessChallenge {
  id: string;
  title: string;
  description: string;
  type: "steps" | "workout" | "nutrition" | "wellness";
  goal: string;
  duration: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    initials: string;
    progress: number;
    currentStreak: number;
  }>;
  status: "active" | "completed" | "upcoming";
  daysLeft: number;
  creator: string;
  prize?: string;
  isTeamChallenge: boolean;
  createdAt: string;
}

interface FitnessGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: "strength" | "cardio" | "flexibility" | "nutrition";
  deadline: string;
  isCompleted: boolean;
}

export default function Fitness() {
  const { user, loading } = useAuth();

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<Activity />}
        title="Get Fit Together as a Family"
        description="Start fitness challenges, track progress, and motivate each other to live healthier lives. Make wellness a family adventure."
        features={[
          "Create family fitness challenges and competitions",
          "Track everyone's progress and celebrate milestones",
          "Share workout routines and healthy recipes",
          "Set family wellness goals and achieve them together",
          "Motivate each other with encouragement and support",
          "Create healthy habits that last generations",
        ]}
        accentColor="#BD692B"
        bgGradient="from-orange-50 to-red-50"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  // Data states
  const [challenges, setChallenges] = useState<FitnessChallenge[]>([]);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [fitnessStats, setFitnessStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    completedGoals: 0,
    currentStreak: 0,
  });

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<
    "challenges" | "goals" | "library"
  >("challenges");

  useEffect(() => {
    if (user) {
      loadInitialData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load user's families
      const familiesResult = await supabaseDataService.getUserFamilies(
        user?.id || "",
      );

      if (
        familiesResult.success &&
        familiesResult.data &&
        familiesResult.data.length > 0
      ) {
        const primaryFamily = familiesResult.data[0];
        setCurrentFamily(primaryFamily);

        // Load real fitness data from Supabase
        const challengesResult =
          await supabaseDataService.getFamilyFitnessChallenges(
            primaryFamily.id,
          );
        const goalsResult = await supabaseDataService.getFamilyFitnessGoals(
          primaryFamily.id,
        );
        const statsResult = await supabaseDataService.getFamilyFitnessStats(
          primaryFamily.id,
        );

        if (challengesResult.success && challengesResult.data) {
          setChallenges(challengesResult.data);
        }
        if (goalsResult.success && goalsResult.data) {
          setGoals(goalsResult.data);
        }
        if (statsResult.success && statsResult.data) {
          setFitnessStats(statsResult.data);
        }
      }
    } catch (err) {
      console.error("Error loading fitness data:", err);
      setError("Failed to load fitness data");
    } finally {
      setIsLoading(false);
    }
  };

  const createFitnessChallenge = async () => {
    try {
      const challengeData = {
        familyId: currentFamily?.id || "",
        title: "New Fitness Challenge",
        description: "Join this challenge to stay active together!",
        challengeType: "steps",
        targetValue: 10000,
        targetUnit: "steps",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        createdBy: user?.id || "",
      };

      const newChallengeResult =
        await supabaseDataService.createFitnessChallenge(challengeData);

      if (newChallengeResult.success && newChallengeResult.data) {
        toast({
          title: "Challenge Created!",
          description:
            "Your fitness challenge has been created and family members can now join.",
        });
        // Refresh the challenges list
        loadInitialData();
      } else {
        toast({
          title: "Error",
          description: "Failed to create challenge. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
      });
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      // TODO: Implement joinFitnessChallenge in supabaseData service
      toast({
        title: "Challenge Joined!",
        description:
          "You've successfully joined the fitness challenge. Good luck!",
      });
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center py-12">
          <Dumbbell className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome to Fitness Challenges
          </h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Please log in to participate in family fitness challenges and track
            your goals.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={loadInitialData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Fitness Challenges
              </h1>
              <p className="text-muted-foreground">
                Stay motivated together as a family through fitness goals and
                challenges
              </p>
            </div>
          </div>

          <Button
            onClick={createFitnessChallenge}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Challenge
          </Button>
        </div>

        {/* Fitness Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Challenges
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {fitnessStats.activeChallenges}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed Goals
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {fitnessStats.completedGoals}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Current Streak
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {fitnessStats.currentStreak}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Challenges
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {fitnessStats.totalChallenges}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg mb-6 w-fit">
          <Button
            variant={activeTab === "challenges" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("challenges")}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Challenges
          </Button>
          <Button
            variant={activeTab === "goals" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("goals")}
          >
            <Target className="w-4 h-4 mr-2" />
            Personal Goals
          </Button>
          <Button
            variant={activeTab === "library" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("library")}
          >
            <Play className="w-4 h-4 mr-2" />
            Workout Library
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search challenges, goals, or workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("all")}
            >
              All
            </Button>
            <Button
              variant={selectedFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={selectedFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("completed")}
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Challenges Tab */}
            {activeTab === "challenges" && (
              <>
                {challenges.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      No Fitness Challenges Yet
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start your family's fitness journey by creating the first
                      challenge. Encourage each other to stay active and healthy
                      together!
                    </p>
                    <Button onClick={createFitnessChallenge}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Challenge
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {challenges.map((challenge) => (
                      <Card
                        key={challenge.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl mb-2">
                                {challenge.title}
                              </CardTitle>
                              <Badge
                                className={cn(
                                  "mb-3",
                                  challenge.status === "active" &&
                                    "bg-green-100 text-green-800",
                                  challenge.status === "completed" &&
                                    "bg-blue-100 text-blue-800",
                                  challenge.status === "upcoming" &&
                                    "bg-orange-100 text-orange-800",
                                )}
                              >
                                {challenge.status}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {challenge.daysLeft} days left
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">
                            {challenge.description}
                          </p>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>Goal: {challenge.goal}</span>
                              <span>{challenge.duration}</span>
                            </div>
                            {challenge.prize && (
                              <div className="text-sm text-orange-600 font-medium">
                                🏆 Prize: {challenge.prize}
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {challenge.participants.length} participants
                              </span>
                            </div>

                            <Button
                              size="sm"
                              onClick={() => joinChallenge(challenge.id)}
                              disabled={challenge.status !== "active"}
                            >
                              Join Challenge
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Personal Goals Tab */}
            {activeTab === "goals" && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  No Personal Goals Set
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Set personal fitness goals to track your progress and stay
                  motivated.
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Set Your First Goal
                </Button>
              </div>
            )}

            {/* Workout Library Tab */}
            {activeTab === "library" && (
              <div className="text-center py-12">
                <Play className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Workout Library Coming Soon
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We're building a library of family-friendly workouts and
                  exercises.
                </p>
                <Button variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Get Notified
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
