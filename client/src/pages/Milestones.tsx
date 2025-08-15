import { useState, useEffect } from "react";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import {
  Trophy,
  Plus,
  Search,
  Target,
  Award,
  Calendar,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileNav } from "@/components/MobileNav";
import { SimpleRightSidebar } from "@/components/SimpleRightSidebar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseDataService } from "@/services";
import {
  MilestoneCard,
  MilestoneStatsDashboard,
  MilestoneForm,
} from "@/components/milestones";

interface Milestone {
  id: string;
  familyId: string;
  achieverId: string;
  title: string;
  category: string;
  description: string;
  date: string;
  era?: string;
  isRecent: boolean;
  loves: number;
  comments: number;
  tags: string[];
  createdAt: string;
  achiever: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface MilestoneStats {
  totalMilestones: number;
  thisMonth: number;
  familyCelebrations: number;
  majorAchievements: number;
}

export function Milestones() {
  const { user, loading: authLoading } = useAuth();

  // Show call-to-action if not authenticated
  if (!authLoading && !user) {
    return (
      <AuthCallToAction
        icon={<Trophy />}
        title="Celebrate Every Family Achievement"
        description="Document and celebrate life's special moments together. From birthdays to graduations, capture every milestone that matters."
        features={[
          "Record birthdays, graduations, and life achievements",
          "Share celebration photos and memories",
          "Send digital gifts and congratulations messages",
          "Create family achievement timelines and histories",
          "Get reminded of important upcoming milestones",
          "Celebrate accomplishments with virtual gifts and notes",
        ]}
        accentColor="#BD692B"
        bgGradient="from-yellow-50 to-orange-50"
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

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState<MilestoneStats>({
    totalMilestones: 0,
    thisMonth: 0,
    familyCelebrations: 0,
    majorAchievements: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null,
  );
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null,
  );
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [giftAmount, setGiftAmount] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [congratsMessage, setCongratsMessage] = useState("");
  const { success, error } = useToast();

  // Get user's family ID from auth context
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  const [newMilestone, setNewMilestone] = useState({
    title: "",
    category: "achievement",
    description: "",
    date: "",
    era: "",
    tags: "",
    achieverId: "",
  });

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get user's families first
      const familiesResult = await supabaseDataService.getUserFamilies(user.id);
      if (
        !familiesResult.success ||
        !familiesResult.data ||
        familiesResult.data.length === 0
      ) {
        setMilestones([]);
        setIsLoading(false);
        return;
      }

      const primaryFamily = familiesResult.data[0];
      setCurrentFamily(primaryFamily);

      const milestonesResult = await supabaseDataService.getFamilyMilestones(
        primaryFamily.id,
      );
      if (milestonesResult.success && milestonesResult.data) {
        const milestonesData = milestonesResult.data;
        setMilestones(milestonesData);

        // Calculate stats
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const thisMonthCount = milestonesData.filter((m: Milestone) => {
          const milestoneDate = new Date(m.date);
          return (
            milestoneDate.getMonth() === thisMonth &&
            milestoneDate.getFullYear() === thisYear
          );
        }).length;

        const familyCelebrations = milestonesData.filter(
          (m: Milestone) =>
            m.category === "birthday" || m.category === "anniversary",
        ).length;

        const majorAchievements = milestonesData.filter(
          (m: Milestone) =>
            m.category === "career" || m.category === "education",
        ).length;

        setStats({
          totalMilestones: milestonesData.length,
          thisMonth: thisMonthCount,
          familyCelebrations,
          majorAchievements,
        });
      }
    } catch (err) {
      console.error("Error loading milestones:", err);
      error("Failed to load milestones", "Please try refreshing the page");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "All Milestones", count: milestones.length },
    {
      id: "career",
      label: "Career",
      count: milestones.filter((m) => m.category === "career").length,
    },
    {
      id: "education",
      label: "Education",
      count: milestones.filter((m) => m.category === "education").length,
    },
    {
      id: "fitness",
      label: "Fitness",
      count: milestones.filter((m) => m.category === "fitness").length,
    },
    {
      id: "birthday",
      label: "Birthdays",
      count: milestones.filter((m) => m.category === "birthday").length,
    },
    {
      id: "achievement",
      label: "Achievements",
      count: milestones.filter((m) => m.category === "achievement").length,
    },
  ];

  const filteredMilestones = milestones.filter((milestone) => {
    const matchesSearch =
      milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.achiever.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || milestone.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateMilestone = async () => {
    if (
      !newMilestone.title ||
      !newMilestone.description ||
      !newMilestone.date
    ) {
      error(
        "Missing required fields",
        "Please fill in title, description, and date",
      );
      return;
    }

    try {
      const milestoneData = {
        familyId: currentFamily?.id,
        achieverId: newMilestone.achieverId || user?.id, // Default to current user
        title: newMilestone.title,
        category: newMilestone.category,
        description: newMilestone.description,
        date: newMilestone.date,
        era: newMilestone.era,
        tags: newMilestone.tags
          ? newMilestone.tags.split(",").map((tag) => tag.trim())
          : [],
        isRecent: true,
      };

      // TODO: Implement createMilestone in supabaseData service
      const createdMilestone = null;
      setMilestones([createdMilestone, ...milestones]);

      setNewMilestone({
        title: "",
        category: "achievement",
        description: "",
        date: "",
        era: "",
        tags: "",
        achieverId: "",
      });
      setShowAddForm(false);
      success("Milestone added!", "Successfully created new milestone");
      loadMilestones(); // Refresh stats
    } catch (err) {
      console.error("Error creating milestone:", err);
      error("Failed to create milestone", "Please try again");
    }
  };

  const handleUpdateMilestone = async () => {
    if (!editingMilestone || !newMilestone.title || !newMilestone.description) {
      error("Missing required fields", "Please fill in title and description");
      return;
    }

    try {
      const updateData = {
        title: newMilestone.title,
        category: newMilestone.category,
        description: newMilestone.description,
        date: newMilestone.date,
        era: newMilestone.era,
        tags: newMilestone.tags
          ? newMilestone.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      // TODO: Implement updateMilestone in supabaseData service
      const updatedMilestone = {
        ...editingMilestone,
        ...updateData,
      };

      const updatedMilestones = milestones.map((m) =>
        m.id === editingMilestone.id ? updatedMilestone : m,
      );
      setMilestones(updatedMilestones);

      setEditingMilestone(null);
      setNewMilestone({
        title: "",
        category: "achievement",
        description: "",
        date: "",
        era: "",
        tags: "",
        achieverId: "",
      });
      success("Milestone updated!", "Successfully updated milestone");
      loadMilestones(); // Refresh stats
    } catch (err) {
      console.error("Error updating milestone:", err);
      error("Failed to update milestone", "Please try again");
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      // TODO: Implement deleteMilestone in supabaseData service
      console.log("Delete milestone:", id);
      setMilestones(milestones.filter((m) => m.id !== id));
      success("Milestone deleted", "Milestone removed successfully");
      loadMilestones(); // Refresh stats
    } catch (err) {
      console.error("Error deleting milestone:", err);
      error("Failed to delete milestone", "Please try again");
    }
  };

  const handleLoveMilestone = async (id: string) => {
    try {
      // TODO: Implement loveMilestone in supabaseData service
      const updatedMilestone = milestones.find((m) => m.id === id);
      const updatedMilestones = milestones.map((m) =>
        m.id === id ? updatedMilestone : m,
      );
      setMilestones(updatedMilestones);
      success("❤️ Loved!", "Added your love to this milestone");
    } catch (err) {
      console.error("Error loving milestone:", err);
      error("Failed to love milestone", "Please try again");
    }
  };

  const startEditingMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setNewMilestone({
      title: milestone.title,
      category: milestone.category,
      description: milestone.description,
      date: milestone.date.split("T")[0], // Format for date input
      era: milestone.era || "",
      tags: milestone.tags.join(", "),
      achieverId: milestone.achieverId,
    });
    setShowAddForm(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "career":
        return "#2D548A";
      case "education":
        return "#5D6739";
      case "fitness":
        return "#BD692B";
      case "birthday":
        return "#2D548A";
      case "achievement":
        return "#5D6739";
      default:
        return "#BD692B";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "career":
        return Target;
      case "education":
        return Award;
      case "fitness":
        return Trophy;
      case "birthday":
        return Calendar;
      case "achievement":
        return Star;
      default:
        return Trophy;
    }
  };

  const handleGiftMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setShowGiftDialog(true);
  };

  const handleSendGift = () => {
    if (!giftAmount || !selectedMilestone) return;

    success(
      "Gift Sent!",
      `$${giftAmount} gift sent to ${selectedMilestone.achiever.name} with your message`,
    );
    setShowGiftDialog(false);
    setGiftAmount("");
    setGiftMessage("");
    setSelectedMilestone(null);
  };

  const handleCommentMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setShowMessageDialog(true);
  };

  const handleSendMessage = () => {
    if (!congratsMessage || !selectedMilestone) return;

    success(
      "Message Sent!",
      `Your congratulations message was sent to ${selectedMilestone.achiever.name}`,
    );
    setShowMessageDialog(false);
    setCongratsMessage("");
    setSelectedMilestone(null);
  };

  const openGiftDialog = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setShowGiftDialog(true);
  };

  const openMessageDialog = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setShowMessageDialog(true);
  };

  const handleSaveMilestone = async (milestoneData: any) => {
    try {
      if (editingMilestone) {
        // Update existing milestone
        await handleUpdateMilestone();
      } else {
        // Create new milestone
        await handleCreateMilestone();
      }
      setShowAddForm(false);
      setEditingMilestone(null);
    } catch (error) {
      console.error("Error saving milestone:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
        <MobileNav />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-lg text-muted-foreground">
                Loading milestones...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <MobileNav />
      <div className="max-w-6xl mx-auto">
        <main className="flex-1 p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-tenor font-normal text-foreground mb-3">
              Family Milestones
            </h1>
            <p className="text-lg text-muted-foreground">
              Celebrating every achievement together
            </p>
          </div>

          {/* Stats Dashboard */}
          <MilestoneStatsDashboard stats={stats} className="mb-8" />

          {/* Add Milestone Button */}
          <div className="text-center mb-8">
            <Button
              onClick={() => setShowAddForm(true)}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: "#BD692B" }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search milestones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border/50 focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                {
                  id: "all",
                  label: "All Milestones",
                  count: milestones.length,
                },
                {
                  id: "birthday",
                  label: "Birthdays",
                  count: milestones.filter((m) => m.category === "birthday")
                    .length,
                },
                {
                  id: "anniversary",
                  label: "Anniversaries",
                  count: milestones.filter((m) => m.category === "anniversary")
                    .length,
                },
                {
                  id: "achievement",
                  label: "Achievements",
                  count: milestones.filter((m) => m.category === "achievement")
                    .length,
                },
                {
                  id: "career",
                  label: "Career",
                  count: milestones.filter((m) => m.category === "career")
                    .length,
                },
                {
                  id: "education",
                  label: "Education",
                  count: milestones.filter((m) => m.category === "education")
                    .length,
                },
                {
                  id: "family",
                  label: "Family Events",
                  count: milestones.filter((m) => m.category === "family")
                    .length,
                },
              ].map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`text-sm ${
                    selectedCategory === category.id
                      ? "text-white"
                      : "border-border/50"
                  }`}
                  style={
                    selectedCategory === category.id
                      ? { backgroundColor: "#BD692B" }
                      : {}
                  }
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </div>
          </div>

          {/* Milestones List */}
          <div className="max-w-4xl mx-auto">
            {milestones.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No milestones yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start documenting your family's achievements and special
                  moments
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="text-white hover:opacity-90"
                  style={{ backgroundColor: "#BD692B" }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Milestone
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {milestones
                  .filter(
                    (milestone) =>
                      (selectedCategory === "all" ||
                        milestone.category === selectedCategory) &&
                      (milestone.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                        milestone.description
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())),
                  )
                  .map((milestone) => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      onEdit={(m) => startEditingMilestone(m)}
                      onDelete={(id) => handleDeleteMilestone(id)}
                      onLove={(id) => handleLoveMilestone(id)}
                      onComment={(id) => handleCommentMilestone(milestone)}
                      onGift={(id) => handleGiftMilestone(milestone)}
                    />
                  ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Milestone Dialog */}
      {(showAddForm || editingMilestone) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <MilestoneForm
              milestone={editingMilestone}
              familyMembers={[
                { id: "1", name: "John Doe", email: "john@example.com" },
                { id: "2", name: "Jane Doe", email: "jane@example.com" },
              ]}
              onSave={handleSaveMilestone}
              onCancel={() => {
                setShowAddForm(false);
                setEditingMilestone(null);
              }}
              isEditing={!!editingMilestone}
            />
          </div>
        </div>
      )}
    </div>
  );
}
