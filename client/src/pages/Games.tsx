import React, { useState, useCallback, useMemo, useRef } from "react";
import { withDataFetching } from "@/components/hoc/withDataFetching";
import { withFormManagement } from "@/components/hoc/withFormManagement";
import { withSidebar } from "@/components/composition/withSidebar";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import { Link } from "react-router-dom";
import {
  Trophy,
  Plus,
  Search,
  ArrowLeft,
  Target,
  TrendingUp,
  Gamepad2,
  Users,
  Clock,
  Star,
  Edit,
  Trash2,
  Play,
  Heart,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabaseDataService } from "@/services";
import { GameCard, GameForm } from "@/components/games";
import { usePerformanceMonitor } from "@/hooks/usePerformance";
import { useDataFetching } from "@/hooks/useDataFetching";

interface FamilyGame {
  id: string;
  title: string;
  category: string;
  description: string;
  players: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isActive: boolean;
  currentChampion?: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  totalPlays: number;
  tags: string[];
  rules?: string;
  equipment?: string[];
  lastPlayed?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface LeaderboardEntry {
  player: {
    id: string;
    name: string;
    avatar?: string;
  };
  wins: number;
  totalScore: number;
  gamesPlayed: number;
  winRate: number;
}

interface GameStats {
  totalGames: number;
  totalPlays: number;
  gamesByCategory: Record<string, number>;
  activeGames: number;
  mostPlayedGame?: string;
  topPlayer?: string;
  averageRating: number;
}

interface CreateGameData {
  title: string;
  category: string;
  description: string;
  players: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  rules: string;
  equipment: string[];
}

interface GamesData {
  games: FamilyGame[];
  leaderboard: LeaderboardEntry[];
  stats: GameStats | null;
  currentFamily: any;
  categories: string[];
}

interface GamesFilters {
  searchTerm: string;
  categoryFilter: string;
  difficultyFilter: string;
  activeTab: "games" | "leaderboard" | "stats";
}

interface GamesProps {
  familyId?: string;
  userId?: string;
  onGameSelect?: (game: FamilyGame) => void;
  onGameCreate?: (game: Partial<FamilyGame>) => void;
  onGameUpdate?: (gameId: string, updates: Partial<FamilyGame>) => void;
  onGameDelete?: (gameId: string) => void;
  onGamePlay?: (gameId: string) => void;
  onError?: (error: string) => void;
}

// Enhanced Games component with modern patterns
const GamesComponent: React.FC<GamesProps> = ({
  familyId,
  userId,
  onGameSelect,
  onGameCreate,
  onGameUpdate,
  onGameDelete,
  onGamePlay,
  onError,
}) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { measureAsync } = usePerformanceMonitor("Games");

  // Enhanced state management
  const [filters, setFilters] = useState<GamesFilters>({
    searchTerm: "",
    categoryFilter: "all",
    difficultyFilter: "all",
    activeTab: "games",
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGame, setEditingGame] = useState<FamilyGame | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  const [newGame, setNewGame] = useState<CreateGameData>({
    title: "",
    category: "",
    description: "",
    players: "",
    duration: "",
    difficulty: "Easy",
    tags: [],
    rules: "",
    equipment: [],
  });

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Memoized data fetching functions
  const fetchGamesData = useCallback(async (): Promise<GamesData> => {
    return measureAsync(
      "fetchGamesData",
      async () => {
        if (!user) {
          throw new Error("User not authenticated");
        }

        const cacheKey = `games_data_${user.id}`;
        const cached = getCache(cacheKey);

        if (cached) return cached;

        try {
          // Get user's families
          const familiesResult = await supabaseDataService.getUserFamilies(
            user.id,
          );
          if (
            !familiesResult.success ||
            !familiesResult.data ||
            familiesResult.data.length === 0
          ) {
            throw new Error("No family found");
          }

          const primaryFamily = familiesResult.data[0];
          setCurrentFamily(primaryFamily);

          const [gamesResult, leaderboardResult, statsResult] =
            await Promise.all([
              supabaseDataService.getFamilyGames(primaryFamily.id),
              supabaseDataService.getGameLeaderboard(primaryFamily.id),
              supabaseDataService.getGameStats(primaryFamily.id),
            ]);

          const games = gamesResult.success ? gamesResult.data || [] : [];
          const leaderboard = leaderboardResult.success
            ? leaderboardResult.data || []
            : [];
          const stats = statsResult.success ? statsResult.data || null : null;
          const categories = Array.from(
            new Set(games.map((game) => game.category)),
          );

          const data: GamesData = {
            games,
            leaderboard,
            stats,
            currentFamily: primaryFamily,
            categories,
          };

          setCache(cacheKey, data, 5 * 60 * 1000);
          return data;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          onError?.(errorMessage);
          throw error;
        }
      },
      "custom",
    );
  }, [user, measureAsync, getCache, setCache, onError]);

  // Enhanced filter handlers
  const handleFilterChange = useCallback(
    (key: keyof GamesFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      invalidateCache(`games_data_${user?.id}`);
    },
    [user?.id, invalidateCache],
  );

  const handleSearch = useCallback(
    (query: string) => {
      handleFilterChange("searchTerm", query);
    },
    [handleFilterChange],
  );

  // Game action handlers
  const handleCreateGame = useCallback(async () => {
    if (
      !newGame.title.trim() ||
      !newGame.description.trim() ||
      !currentFamily
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const gameData = {
        familyId: currentFamily.id,
        authorId: user.id,
        ...newGame,
      };

      const createdGameResult = await supabaseData.createGame(gameData);

      if (createdGameResult.success && createdGameResult.data) {
        const createdGame = createdGameResult.data;
        // Add to local state
        const newFamilyGame: FamilyGame = {
          id: createdGame.id,
          title: createdGame.title,
          category: createdGame.category,
          description: createdGame.description,
          players: createdGame.players,
          duration: createdGame.duration,
          difficulty: createdGame.difficulty,
          isActive: createdGame.isActive ?? true,
          rating: 0,
          totalPlays: 0,
          tags: createdGame.tags || [],
          rules: createdGame.rules,
          equipment: createdGame.equipment || [],
          author: {
            id: user.id,
            name: user.user_metadata?.full_name || user.email || "Unknown",
            avatar: user.user_metadata?.avatar_url,
          },
          createdAt: new Date().toISOString(),
        };

        onGameCreate?.(newFamilyGame);
        resetForm();
        setShowCreateDialog(false);
        invalidateCache(`games_data_${user.id}`);

        toast({
          title: "Game Created!",
          description: "Your family game has been added successfully.",
        });
      }
    } catch (error) {
      console.error("Error creating game:", error);
      toast({
        title: "Error",
        description: "Failed to create game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }, [
    newGame,
    currentFamily,
    user,
    supabaseData,
    onGameCreate,
    invalidateCache,
    toast,
  ]);

  const handleEditGame = useCallback((game: FamilyGame) => {
    setEditingGame(game);
    setIsEditMode(true);
    setNewGame({
      title: game.title,
      category: game.category,
      description: game.description,
      players: game.players,
      duration: game.duration,
      difficulty: game.difficulty,
      tags: game.tags || [],
      rules: game.rules || "",
      equipment: game.equipment || [],
    });
    setShowCreateDialog(true);
  }, []);

  const handleUpdateGame = useCallback(async () => {
    if (!editingGame) return;

    try {
      setCreating(true);
      const gameData = {
        title: newGame.title,
        category: newGame.category,
        description: newGame.description,
        players: newGame.players,
        duration: newGame.duration,
        difficulty: newGame.difficulty,
        tags: newGame.tags,
        rules: newGame.rules,
        equipment: newGame.equipment,
      };

      const updatedGame = await supabaseData.updateGame(
        editingGame.id,
        gameData,
      );

      if (updatedGame) {
        onGameUpdate?.(editingGame.id, gameData);
        toast({
          title: "Game Updated!",
          description: "Your game has been updated successfully.",
        });
        resetForm();
        setShowCreateDialog(false);
        setIsEditMode(false);
        setEditingGame(null);
        invalidateCache(`games_data_${user?.id}`);
      }
    } catch (error) {
      console.error("Error updating game:", error);
      toast({
        title: "Error",
        description: "Failed to update game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }, [
    editingGame,
    newGame,
    supabaseData,
    onGameUpdate,
    user?.id,
    invalidateCache,
    toast,
  ]);

  const handleDeleteGame = useCallback(
    async (gameId: string) => {
      try {
        const success = await supabaseData.deleteGame(gameId);
        if (success) {
          onGameDelete?.(gameId);
          toast({
            title: "Game Deleted",
            description: "Game has been removed successfully.",
          });
          invalidateCache(`games_data_${user?.id}`);
        }
      } catch (error) {
        console.error("Error deleting game:", error);
        toast({
          title: "Error",
          description: "Failed to delete game. Please try again.",
          variant: "destructive",
        });
      }
    },
    [supabaseData, onGameDelete, user?.id, invalidateCache, toast],
  );

  const handlePlayGame = useCallback(
    async (gameId: string) => {
      try {
        if (!user) return;

        // Record a game play
        await supabaseData.recordGamePlay(gameId, {
          playerId: user.id,
          score: Math.floor(Math.random() * 100), // Random score for demo
          isWinner: Math.random() > 0.7, // 30% chance of winning
          notes: "Game played from web interface",
        });

        onGamePlay?.(gameId);
        toast({
          title: "Game Recorded!",
          description: "Your game play has been recorded.",
        });

        // Refresh data to update stats
        invalidateCache(`games_data_${user.id}`);
      } catch (error) {
        console.error("Error recording game play:", error);
        toast({
          title: "Error",
          description: "Failed to record game play. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user, supabaseData, onGamePlay, invalidateCache, toast],
  );

  // Utility functions
  const addTag = useCallback(
    (tag: string) => {
      if (tag.trim() && !newGame.tags.includes(tag.trim())) {
        setNewGame((prev) => ({
          ...prev,
          tags: [...prev.tags, tag.trim()],
        }));
      }
    },
    [newGame.tags],
  );

  const removeTag = useCallback((tagToRemove: string) => {
    setNewGame((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  const addEquipment = useCallback(
    (equipment: string) => {
      if (equipment.trim() && !newGame.equipment.includes(equipment.trim())) {
        setNewGame((prev) => ({
          ...prev,
          equipment: [...prev.equipment, equipment.trim()],
        }));
      }
    },
    [newGame.equipment],
  );

  const removeEquipment = useCallback((equipmentToRemove: string) => {
    setNewGame((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((eq) => eq !== equipmentToRemove),
    }));
  }, []);

  const resetForm = useCallback(() => {
    setNewGame({
      title: "",
      category: "",
      description: "",
      players: "",
      duration: "",
      difficulty: "Easy",
      tags: [],
      rules: "",
      equipment: [],
    });
  }, []);

  // Memoized filtered data
  const filteredGames = useMemo(() => {
    return [];
  }, [filters]);

  // Show call-to-action if not authenticated
  if (!authLoading && !user) {
    return (
      <AuthCallToAction
        icon={<Trophy />}
        title="Play Games Together, Stay Connected"
        description="Challenge your family members to fun games, track scores, and create friendly competitions that bring everyone closer."
        features={[
          "Play family-friendly games and challenges",
          "Track scores and see family leaderboards",
          "Create custom challenges for different ages",
          "Compete in tournaments and special events",
          "Share gaming achievements and funny moments",
          "Build lasting memories through play and laughter",
        ]}
        accentColor="#8B5A3C"
        bgGradient="from-amber-50 to-yellow-50"
      />
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentFamily) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-dark-blue mb-2">
              No Family Found
            </h1>
            <p className="text-muted-foreground mb-6">
              Please create or join a family first.
            </p>
            <Button asChild>
              <Link to="/create-family">Create Family</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-dark-blue">Family Games</h1>
            <p className="text-muted-foreground">
              Play together, compete, and have fun as a family
            </p>
          </div>

          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Game
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              ref={searchInputRef}
              placeholder="Search games..."
              value={filters.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.categoryFilter}
              onChange={(e) =>
                handleFilterChange("categoryFilter", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {/* Categories will be populated from data */}
            </select>
            <select
              value={filters.difficultyFilter}
              onChange={(e) =>
                handleFilterChange("difficultyFilter", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="space-y-6">
          {filters.activeTab === "games" && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Games will be loaded here
                </h3>
                <p className="text-gray-600 mb-4">
                  The games data will be fetched and displayed here using our
                  new HOC system.
                </p>
              </div>
            </div>
          )}

          {filters.activeTab === "leaderboard" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-dark-blue">
                Family Leaderboard
              </h2>
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Leaderboard will be loaded here
                </h3>
                <p className="text-gray-600">
                  The leaderboard data will be fetched and displayed here.
                </p>
              </div>
            </div>
          )}

          {filters.activeTab === "stats" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-dark-blue">
                Game Statistics
              </h2>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Game statistics will be loaded here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: "games", label: "Games", icon: Trophy },
              { id: "leaderboard", label: "Leaderboard", icon: Target },
              { id: "stats", label: "Stats", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange("activeTab", tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    filters.activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create/Edit Game Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <GameForm
                game={editingGame}
                isEditMode={isEditMode}
                onSubmit={handleUpdateGame}
                onCancel={() => {
                  setShowCreateDialog(false);
                  setEditingGame(null);
                  setIsEditMode(false);
                }}
                loading={creating}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Games with HOCs
const Games = withSidebar(
  withFormManagement(
    withDataFetching(GamesComponent, {
      dataKey: "gamesData",
      fetchFunction: (props: GamesProps) => {
        return Promise.resolve({
          games: [],
          leaderboard: [],
          stats: null,
          currentFamily: null,
          categories: [],
        });
      },
      dependencies: ["userId"],
      cacheKey: (props: GamesProps) => `games_data_${props.userId}`,
      cacheTTL: 5 * 60 * 1000,
      errorFallback: (error: string) => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load games
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      ),
      loadingFallback: (
        <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-lg text-muted-foreground">Loading games...</p>
          </div>
        </div>
      ),
    }),
    {
      formConfig: {
        initialValues: {
          searchTerm: "",
          categoryFilter: "all",
          difficultyFilter: "all",
          activeTab: "games",
        },
        validationSchema: null,
        onSubmit: async (values) => {
          console.log("Form submitted:", values);
        },
      },
    },
  ),
  {
    sidebarConfig: {
      title: "Family Games",
      description: "Play and compete with your family members",
      navigation: [
        { label: "All Games", href: "#", icon: "gamepad-2" },
        { label: "Recent", href: "#", icon: "clock" },
        { label: "Popular", href: "#", icon: "trending-up" },
        { label: "My Games", href: "#", icon: "user" },
        { label: "Create", href: "#", icon: "plus" },
      ],
    },
  },
);

export default Games;
