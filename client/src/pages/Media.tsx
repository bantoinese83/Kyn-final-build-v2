import { useState, useEffect } from "react";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import { Link } from "react-router-dom";
import {
  Film,
  Plus,
  Search,
  ArrowLeft,
  Eye,
  BookOpen,
  Monitor,
  Headphones,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { familyService, photoService } from "@/services";
import { MediaCard, MediaForm } from "@/components/media";

type MediaType = "all" | "books" | "movies" | "tv" | "podcasts" | "music";

interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  genre: string[];
  rating: number;
  year?: number;
  author?: string;
  artist?: string;
  director?: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: string;
}

export function Media() {
  const { user, loading: authLoading } = useAuth();

  // Show call-to-action if not authenticated
  if (!authLoading && !user) {
    return (
      <AuthCallToAction
        icon={<Film />}
        title="Discover Great Movies, Books & More Together"
        description="Share recommendations, create family watch lists, and discover new favorites together. Build your family's shared media library."
        features={[
          "Share movie, book, and TV show recommendations",
          "Create family watch lists and reading lists",
          "Rate and review content with family members",
          "Get personalized suggestions based on family tastes",
          "Track what everyone is watching and reading",
          "Discover new favorites through family recommendations",
        ]}
        accentColor="#8B5A3C"
        bgGradient="from-purple-50 to-pink-50"
      />
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const [activeFilter, setActiveFilter] = useState<MediaType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  const [newMedia, setNewMedia] = useState({
    title: "",
    type: "books" as MediaType,
    genre: "",
    year: "",
    author: "",
    artist: "",
    director: "",
    description: "",
    imageUrl: "",
    tags: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    loadMediaData();
  }, [activeFilter]);

  const loadMediaData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      // Get user's families
      const familiesResult = await familyService.getUserFamilies(userId);
      if (
        !familiesResult.success ||
        !familiesResult.data ||
        familiesResult.data.length === 0
      )
        return;

      const primaryFamily = familiesResult.data[0];
      setCurrentFamily(primaryFamily);

      // Create mock media data since this component is for media recommendations, not photos
      // TODO: Replace with actual media service when available
      const mockMediaItems: MediaItem[] = [
        {
          id: "1",
          title: "The Great Gatsby",
          type: "books",
          genre: ["Fiction", "Classic"],
          rating: 4.5,
          year: 1925,
          author: "F. Scott Fitzgerald",
          description: "A classic American novel about the Jazz Age.",
          imageUrl: "/default-book-cover.jpg",
          tags: ["classic", "fiction", "american"],
          user: {
            id: user.id,
            name: user.email?.split("@")[0] || "User", // Use email prefix as fallback name
            avatar: undefined, // Supabase User doesn't have avatar
          },
          _count: {
            likes: 12,
            comments: 5,
          },
          createdAt: new Date().toISOString(),
        },
      ];

      setMediaItems(mockMediaItems);
    } catch (error) {
      console.error("Error loading media:", error);
      toast({
        title: "Error",
        description: "Failed to load media recommendations. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedia = (mediaData: any) => {
    // This function matches the MediaForm's expected onSave signature
    handleSubmitMedia(mediaData);
  };

  const handleSubmitMedia = async (mediaData: any) => {
    if (!currentFamily?.id) {
      toast({
        title: "Error",
        description: "No family ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const mediaDataWithFamily = {
        familyId: currentFamily.id,
        userId: user?.id || "",
        ...mediaData,
      };

      const savedMedia = await photoService.createMedia(mediaDataWithFamily);

      if (savedMedia.success && savedMedia.data) {
        toast({
          title: "Media recommendation created successfully",
          description: "Your media recommendation has been saved",
        });
        setNewMedia({
          title: "",
          type: "books",
          genre: "",
          year: "",
          author: "",
          artist: "",
          director: "",
          description: "",
          imageUrl: "",
          tags: "",
        });
        loadMediaData();
        setShowAddDialog(false);
      } else {
        toast({
          title: "Failed to create media recommendation",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error creating media recommendation:", err);
      toast({
        title: "Failed to create media recommendation",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (mediaId: string, comment: string) => {
    try {
      const commentData = {
        mediaId,
        userId: user?.id || "",
        comment,
      };

      // TODO: Implement comment functionality in photo service
      console.log("Adding comment:", commentData);

      toast({
        title: "Comment added successfully",
        description: "Your comment has been saved",
      });
      loadMediaData();
    } catch (err) {
      console.error("Error adding comment:", err);
      toast({
        title: "Failed to add comment",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleToggleLike = async (mediaId: string) => {
    try {
      const likeResult = await photoService.likeMedia(mediaId, user?.id || "");

      if (likeResult.success) {
        loadMediaData();
      } else {
        toast({
          title: "Failed to update like",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      toast({
        title: "Failed to update like",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCommentMedia = async (mediaId: string) => {
    // TODO: Implement comment functionality
    toast({
      title: "Commenting Feature",
      description: "Commenting functionality is not yet implemented.",
    });
  };

  const handleShareMedia = async (mediaId: string) => {
    // TODO: Implement share functionality
    toast({
      title: "Sharing Feature",
      description: "Sharing functionality is not yet implemented.",
    });
  };

  const handleViewMedia = async (mediaId: string) => {
    // TODO: Implement view functionality
    toast({
      title: "Viewing Feature",
      description: "Viewing functionality is not yet implemented.",
    });
  };

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return matchesSearch;
  });

  const mediaTypeConfig = {
    all: { icon: Eye, label: "All" },
    books: { icon: BookOpen, label: "Books" },
    movies: { icon: Film, label: "Movies" },
    tv: { icon: Monitor, label: "TV Shows" },
    podcasts: { icon: Headphones, label: "Podcasts" },
    music: { icon: Music, label: "Music" },
  };

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
            <h1 className="text-3xl font-bold text-dark-blue">Family Media</h1>
            <p className="text-muted-foreground">
              Discover and share books, movies, music, and more
            </p>
          </div>

          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Recommendation
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(
              [
                "all",
                "books",
                "movies",
                "tv",
                "podcasts",
                "music",
              ] as MediaType[]
            ).map((type) => (
              <Button
                key={type}
                variant={activeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-lg text-muted-foreground">Loading media...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {mediaItems.length === 0 ? (
              <div className="text-center py-12">
                <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No media recommendations yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first media recommendation
                </p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-accent hover:bg-accent/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Recommendation
                </Button>
              </div>
            ) : (
              mediaItems
                .filter((item) => {
                  const matchesSearch =
                    item.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    item.description
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());
                  const matchesFilter =
                    activeFilter === "all" || item.type === activeFilter;
                  return matchesSearch && matchesFilter;
                })
                .map((item) => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    onLike={() => handleToggleLike(item.id)}
                    onComment={() => handleCommentMedia(item.id)}
                    onShare={() => handleShareMedia(item.id)}
                    onView={() => handleViewMedia(item.id)}
                  />
                ))
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Media Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <MediaForm
              onSave={handleSaveMedia}
              onCancel={() => setShowAddDialog(false)}
              isEditing={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
