import React, { useState, useCallback, useMemo, useRef } from "react";
import { withDataFetching } from "@/components/hoc/withDataFetching";
import { withFormManagement } from "@/components/hoc/withFormManagement";
import { withSidebar } from "@/components/composition/withSidebar";
import { Link } from "react-router-dom";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import { ArrowLeft, Vote, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabaseDataService } from "@/services";
import { PollForm } from "@/components/polls";
import { usePerformanceMonitor } from "@/hooks/usePerformance";

interface Poll {
  id: string;
  title: string;
  description?: string;
  type: "multiple_choice" | "yes_no" | "rating" | "ranking";
  totalVotes: number;
  endDate: Date;
  isAnonymous: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  options: Array<{
    id: string;
    text: string;
    votes: number;
    percentage: number;
    order?: number;
  }>;
  userVote?: {
    optionId: string;
    votedAt: string;
  };
  isActive: boolean;
  tags: string[];
  allowMultipleVotes: boolean;
  maxVotes?: number;
}

interface PollsData {
  polls: Poll[];
  currentFamily: any;
  totalPolls: number;
  activePolls: number;
  completedPolls: number;
  totalVotes: number;
  averageParticipation: number;
}

interface PollsFilters {
  searchTerm: string;
  filter: "all" | "active" | "completed";
  sortBy: "recent" | "popular" | "ending_soon" | "alphabetical";
  sortOrder: "asc" | "desc";
}

interface PollsProps {
  familyId?: string;
  userId?: string;
  onPollSelect?: (poll: Poll) => void;
  onPollCreate?: (poll: Partial<Poll>) => void;
  onPollUpdate?: (pollId: string, updates: Partial<Poll>) => void;
  onPollDelete?: (pollId: string) => void;
  onPollVote?: (pollId: string, optionId: string) => void;
  onError?: (error: string) => void;
}

// Enhanced Polls component with modern patterns
const PollsComponent: React.FC<PollsProps> = ({
  familyId,
  userId,
  onPollSelect,
  onPollCreate,
  onPollUpdate,
  onPollDelete,
  onPollVote,
  onError,
}) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const performanceMetrics = usePerformanceMonitor("Polls");

  // Enhanced state management
  const [filters, setFilters] = useState<PollsFilters>({
    searchTerm: "",
    filter: "all",
    sortBy: "recent",
    sortOrder: "desc",
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  // New poll form state
  const [newPoll, setNewPoll] = useState({
    title: "",
    description: "",
    type: "multiple_choice" as Poll["type"],
    endDate: "",
    isAnonymous: false,
    allowMultipleVotes: false,
    maxVotes: 1,
    options: ["", ""],
    tags: [] as string[],
  });

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Memoized data fetching functions
  const fetchPollsData = useCallback(async (): Promise<PollsData> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Get user's families
      const familiesResult = await supabaseDataService.getUserFamilies(user.id);

      if (
        !familiesResult.success ||
        !familiesResult.data ||
        familiesResult.data.length === 0
      ) {
        throw new Error(
          "No family found. Please create or join a family first.",
        );
      }

      const primaryFamily = familiesResult.data[0];
      setCurrentFamily({
        id: primaryFamily.id,
        familyName: primaryFamily.familyName,
      });

      const familyPollsResult = await supabaseDataService.getFamilyPolls(
        primaryFamily.id,
      );
      const polls = familyPollsResult.success
        ? familyPollsResult.data || []
        : [];

      // Calculate statistics
      const totalPolls = polls.length;
      const activePolls = polls.filter((poll) => poll.isActive).length;
      const completedPolls = totalPolls - activePolls;
      const totalVotes = polls.reduce((sum, poll) => sum + poll.totalVotes, 0);
      const averageParticipation = totalPolls > 0 ? totalVotes / totalPolls : 0;

      const data: PollsData = {
        polls,
        currentFamily: {
          id: primaryFamily.id,
          familyName: primaryFamily.familyName,
        },
        totalPolls,
        activePolls,
        completedPolls,
        totalVotes,
        averageParticipation: Math.round(averageParticipation * 10) / 10,
      };

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      onError?.(errorMessage);
      throw error;
    }
  }, [user, onError]);

  // Enhanced filter handlers
  const handleFilterChange = useCallback(
    (key: keyof PollsFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSearch = useCallback(
    (query: string) => {
      handleFilterChange("searchTerm", query);
    },
    [handleFilterChange],
  );

  // Poll action handlers
  const handleCreatePoll = useCallback(async () => {
    if (!newPoll.title.trim() || newPoll.options.some((opt) => !opt.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const pollData = {
        familyId: currentFamily.id,
        title: newPoll.title,
        description: newPoll.description,
        type: newPoll.type,
        endDate: newPoll.endDate,
        isAnonymous: newPoll.isAnonymous,
        allowMultipleVotes: newPoll.allowMultipleVotes,
        maxVotes: newPoll.maxVotes,
        options: newPoll.options.filter((opt) => opt.trim()),
        tags: newPoll.tags,
        authorId: user.id,
      };

      const createdPollResult = await supabaseDataService.createPoll(pollData);

      if (createdPollResult.success && createdPollResult.data) {
        onPollCreate?.(createdPollResult.data);
        toast({
          title: "Poll Created!",
          description:
            "Your poll has been created and family members can now vote.",
        });
        resetForm();
        setShowCreateDialog(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to create poll. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive",
      });
    }
  }, [newPoll, currentFamily, user, supabaseDataService, onPollCreate, toast]);

  const handleEditPoll = useCallback((poll: Poll) => {
    setEditingPoll(poll);
    setIsEditMode(true);
    setNewPoll({
      title: poll.title,
      description: poll.description || "",
      type: poll.type,
      endDate: poll.endDate.toISOString().split("T")[0],
      isAnonymous: poll.isAnonymous,
      allowMultipleVotes: poll.allowMultipleVotes,
      maxVotes: poll.maxVotes || 1,
      options: poll.options.map((opt) => opt.text),
      tags: poll.tags,
    });
    setShowCreateDialog(true);
  }, []);

  const handleUpdatePoll = useCallback(async () => {
    if (!editingPoll) return;

    try {
      const pollData = {
        title: newPoll.title,
        description: newPoll.description,
        type: newPoll.type,
        endDate: newPoll.endDate,
        isAnonymous: newPoll.isAnonymous,
        allowMultipleVotes: newPoll.allowMultipleVotes,
        maxVotes: newPoll.maxVotes,
        options: newPoll.options.filter((opt) => opt.trim()),
        tags: newPoll.tags,
      };

      const updatedPollResult = await supabaseDataService.updatePoll(
        editingPoll.id,
        pollData,
      );

      if (updatedPollResult.success && updatedPollResult.data) {
        onPollUpdate?.(editingPoll.id, pollData);
        toast({
          title: "Poll Updated!",
          description: "Your poll has been updated successfully.",
        });
        resetForm();
        setShowCreateDialog(false);
        setIsEditMode(false);
        setEditingPoll(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to update poll. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating poll:", error);
      toast({
        title: "Error",
        description: "Failed to update poll. Please try again.",
        variant: "destructive",
      });
    }
  }, [editingPoll, newPoll, supabaseDataService, onPollUpdate, toast]);

  const handleDeletePoll = useCallback(
    async (pollId: string) => {
      if (!confirm("Are you sure you want to delete this poll?")) return;

      try {
        const success = await supabaseDataService.deletePoll(pollId);
        if (success) {
          onPollDelete?.(pollId);
          toast({
            title: "Poll Deleted",
            description: "Poll has been removed successfully.",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete poll. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting poll:", error);
        toast({
          title: "Error",
          description: "Failed to delete poll. Please try again.",
          variant: "destructive",
        });
      }
    },
    [supabaseDataService, onPollDelete, toast],
  );

  const handleVote = useCallback(
    async (pollId: string, optionId: string) => {
      try {
        const voteResult = await supabaseDataService.votePoll(
          pollId,
          optionId,
          user.id,
        );

        if (voteResult.success) {
          onPollVote?.(pollId, optionId);
          toast({
            title: "Vote Recorded!",
            description: "Your vote has been recorded successfully.",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to record vote. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error voting on poll:", error);
        toast({
          title: "Error",
          description: "Failed to record vote. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user.id, supabaseDataService, onPollVote, toast],
  );

  // Utility functions
  const resetForm = useCallback(() => {
    setNewPoll({
      title: "",
      description: "",
      type: "multiple_choice",
      endDate: "",
      isAnonymous: false,
      allowMultipleVotes: false,
      maxVotes: 1,
      options: ["", ""],
      tags: [],
    });
  }, []);

  const addOption = useCallback(() => {
    setNewPoll((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  }, []);

  const removeOption = useCallback(
    (index: number) => {
      if (newPoll.options.length > 2) {
        setNewPoll((prev) => ({
          ...prev,
          options: prev.options.filter((_, i) => i !== index),
        }));
      }
    },
    [newPoll.options.length],
  );

  const updateOption = useCallback((index: number, value: string) => {
    setNewPoll((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  }, []);

  const addTag = useCallback(
    (tag: string) => {
      if (tag.trim() && !newPoll.tags.includes(tag.trim())) {
        setNewPoll((prev) => ({
          ...prev,
          tags: [...prev.tags, tag.trim()],
        }));
      }
    },
    [newPoll.tags],
  );

  const removeTag = useCallback((tagToRemove: string) => {
    setNewPoll((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  // Memoized filtered data
  const filteredPolls = useMemo(() => {
    return [];
  }, [filters]);

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<Vote />}
        title="Make Family Decisions Together"
        description="Create polls and surveys to involve everyone in family decisions. From vacation spots to dinner choices, let everyone's voice be heard."
        features={[
          "Create polls for family decisions and planning",
          "Vote on vacation destinations, activities, and more",
          "See real-time results and family preferences",
          "Anonymous voting options for sensitive topics",
          "Schedule polls for future family meetings",
          "Keep a history of family decisions and outcomes",
        ]}
        accentColor="#8B5A3C"
        bgGradient="from-blue-50 to-indigo-50"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Vote className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
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
            <h1 className="text-3xl font-bold text-dark-blue">Family Polls</h1>
            <p className="text-muted-foreground">
              Make decisions together through polls and surveys
            </p>
          </div>

          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Poll
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              ref={searchInputRef}
              placeholder="Search polls..."
              value={filters.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.filter}
              onChange={(e) => handleFilterChange("filter", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Polls</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="ending_soon">Ending Soon</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center py-12">
            <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Polls will be loaded here
            </h3>
            <p className="text-gray-600 mb-4">
              The polls data will be fetched and displayed here using our new
              HOC system.
            </p>
          </div>
        </div>
      </div>

      {/* Create/Edit Poll Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <PollForm
                poll={editingPoll}
                isEditMode={isEditMode}
                onSubmit={handleUpdatePoll}
                onCancel={() => {
                  setShowCreateDialog(false);
                  setEditingPoll(null);
                  setIsEditMode(false);
                }}
                loading={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Polls with HOCs
const Polls = withSidebar(
  withFormManagement(
    withDataFetching(PollsComponent, {
      dataKey: "pollsData",
      fetchFunction: (props: PollsProps) => {
        return Promise.resolve({
          polls: [],
          currentFamily: null,
          totalPolls: 0,
          activePolls: 0,
          completedPolls: 0,
          totalVotes: 0,
          averageParticipation: 0,
        });
      },
      dependencies: ["userId"],
      cacheKey: (props: PollsProps) => `polls_data_${props.userId}`,
      cacheTTL: 5 * 60 * 1000,
      errorFallback: (error: string) => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load polls
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
            <Vote className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-lg text-muted-foreground">Loading polls...</p>
          </div>
        </div>
      ),
    }),
    {
      formConfig: {
        initialValues: {
          searchTerm: "",
          filter: "all",
          sortBy: "recent",
          sortOrder: "desc",
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
      title: "Family Polls",
      description: "Make decisions together through polls and surveys",
      navigation: [
        { label: "All Polls", href: "#", icon: "vote" },
        { label: "Active", href: "#", icon: "check-circle" },
        { label: "Completed", href: "#", icon: "x-circle" },
        { label: "Create", href: "#", icon: "plus" },
      ],
    },
  },
);

export default Polls;
