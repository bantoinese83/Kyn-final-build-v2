// FamilyHistory Component - Main family history page using modular components
// Refactored from 1275 lines to modular, maintainable components

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NestIcon } from "@/components/icons/NestIcon";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabaseDataService } from "@/services";
import {
  FamilyStoryCard,
  CreateStoryDialog,
  FamilyTreeVisualization,
  FamilyHistoryTabs,
} from "@/components/family-history";

interface FamilyStory {
  id: string;
  title: string;
  category: "wisdom" | "childhood" | "love" | "adventure";
  content: string;
  era: string;
  type: "story" | "photo" | "video" | "voice";
  loves: number;
  comments: number;
  tags: string[];
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface TreeNode {
  id: string;
  name: string;
  generation: number;
  avatar?: string;
  type: "person" | "child" | "pet";
  dateOfBirth?: string;
  petType?: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export function FamilyHistory() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "stories" | "tree" | "genealogy" | "intricate-tree"
  >("stories");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [eraFilter, setEraFilter] = useState("all");
  const [showAddStoryDialog, setShowAddStoryDialog] = useState(false);
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);

  const [stories, setStories] = useState<FamilyStory[]>([]);
  const [familyTree, setFamilyTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadFamilyHistoryData();
    }
  }, [categoryFilter, eraFilter, user]);

  const loadFamilyHistoryData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId || !user) return;

      // Get user's families
      const familiesResult = await supabaseDataService.getUserFamilies(userId);
      if (
        !familiesResult.success ||
        !familiesResult.data ||
        familiesResult.data.length === 0
      )
        return;

      const primaryFamily = familiesResult.data[0];
      setCurrentFamily(primaryFamily);

      // TODO: Implement family history methods in supabaseData service
      // For now, we'll use placeholder data
      const storiesData: any[] = [];
      const treeData: any[] = [];

      setStories(storiesData);
      setFamilyTree(treeData);
    } catch (error) {
      console.error("Error loading family history:", error);
      toast({
        title: "Error",
        description: "Failed to load family history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (storyData: any) => {
    if (!currentFamily) {
      toast({
        title: "Error",
        description: "Please select a family first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const newStory = {
        familyId: currentFamily.id,
        authorId: userId,
        ...storyData,
        tags: storyData.tags
          ? storyData.tags.split(",").map((t: string) => t.trim())
          : [],
      };

      // TODO: Implement createStory in supabaseData service
      const createdStory = null;

      // Add to local state
      setStories([createdStory, ...stories]);

      // Reset form and close dialog
      setShowAddStoryDialog(false);

      toast({
        title: "Success",
        description: "Story created successfully!",
      });
    } catch (error) {
      console.error("Error creating story:", error);
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoveStory = (storyId: string) => {
    // TODO: Implement story love functionality
    console.log("Loving story:", storyId);
  };

  const handleCommentStory = (storyId: string) => {
    // TODO: Implement story comment functionality
    console.log("Commenting on story:", storyId);
  };

  const handleEditStory = (story: FamilyStory) => {
    // TODO: Implement story editing
    console.log("Editing story:", story);
  };

  const handleDeleteStory = (storyId: string) => {
    // TODO: Implement story deletion
    console.log("Deleting story:", storyId);
  };

  const handleAddNode = () => {
    setShowAddNodeDialog(true);
  };

  const handleEditNode = (node: TreeNode) => {
    // TODO: Implement node editing
    console.log("Editing node:", node);
  };

  const handleDeleteNode = (nodeId: string) => {
    // TODO: Implement node deletion
    console.log("Deleting node:", nodeId);
  };

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      categoryFilter === "all" || story.category === categoryFilter;
    const matchesEra = eraFilter === "all" || story.era === eraFilter;

    return matchesSearch && matchesCategory && matchesEra;
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthCallToAction
        icon="📜"
        title="Discover Your Family's Story"
        description="Join your family's private space to explore and preserve precious family memories, stories, and history."
        features={[
          "Share family stories and memories",
          "Build your family tree",
          "Preserve family traditions",
          "Connect with relatives near and far",
        ]}
        primaryAction={{
          text: "Join Your Family",
          href: "/signup",
        }}
        secondaryAction={{
          text: "Sign In",
          href: "/signin",
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <NestIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Family History
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:py-8">
        {/* Tabs */}
        <FamilyHistoryTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          storiesCount={stories.length}
          treeCount={familyTree.length}
          className="mb-8"
        />

        {/* Tab Content */}
        {activeTab === "stories" && (
          <div className="space-y-6">
            {/* Stories Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Family Stories
                </h2>
                <p className="text-gray-600">
                  Share and discover precious family memories
                </p>
              </div>
              <Button
                onClick={() => setShowAddStoryDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Share Story
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="wisdom">Wisdom</option>
                <option value="childhood">Childhood</option>
                <option value="love">Love</option>
                <option value="adventure">Adventure</option>
              </select>

              <select
                value={eraFilter}
                onChange={(e) => setEraFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Eras</option>
                <option value="Pre-1900s">Pre-1900s</option>
                <option value="1900s-1920s">1900s-1920s</option>
                <option value="1930s-1940s">1930s-1940s</option>
                <option value="1950s-1960s">1950s-1960s</option>
                <option value="1970s-1980s">1970s-1980s</option>
                <option value="1990s-2000s">1990s-2000s</option>
                <option value="2010s-2020s">2010s-2020s</option>
                <option value="Present Day">Present Day</option>
              </select>
            </div>

            {/* Stories List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No stories found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || categoryFilter !== "all" || eraFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Be the first to share a family story!"}
                </p>
                {!searchTerm &&
                  categoryFilter === "all" &&
                  eraFilter === "all" && (
                    <Button
                      onClick={() => setShowAddStoryDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Share First Story
                    </Button>
                  )}
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredStories.map((story) => (
                  <FamilyStoryCard
                    key={story.id}
                    story={story}
                    onLove={handleLoveStory}
                    onComment={handleCommentStory}
                    onEdit={handleEditStory}
                    onDelete={handleDeleteStory}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "tree" && (
          <FamilyTreeVisualization
            familyTree={familyTree}
            onAddNode={handleAddNode}
            onEditNode={handleEditNode}
            onDeleteNode={handleDeleteNode}
          />
        )}

        {activeTab === "genealogy" && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Genealogy Research
            </h3>
            <p className="text-gray-600">
              Advanced genealogy features coming soon...
            </p>
          </div>
        )}

        {activeTab === "intricate-tree" && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Advanced Family Tree
            </h3>
            <p className="text-gray-600">
              Detailed family mapping features coming soon...
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateStoryDialog
        open={showAddStoryDialog}
        onOpenChange={setShowAddStoryDialog}
        onSubmit={handleCreateStory}
        submitting={submitting}
      />
    </div>
  );
}
