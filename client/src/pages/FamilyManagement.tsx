import React, { useState, useCallback, useMemo, useRef } from "react";
import { withDataFetching } from "@/components/hoc/withDataFetching";
import { withFormManagement } from "@/components/hoc/withFormManagement";
import { withSidebar } from "@/components/composition/withSidebar";
import { Link } from "react-router-dom";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import {
  ArrowLeft,
  Users,
  Crown,
  Settings,
  UserPlus,
  QrCode,
  Share2,
  Shield,
  Edit,
  Trash2,
  MoreHorizontal,
  Mail,
  MessageCircle,
  Loader2,
  Plus,
  Search,
  Filter,
  Calendar,
  BookOpen,
  Gamepad2,
  Camera,
  Music,
  Activity,
  Award,
  History,
  CheckSquare,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SimpleRightSidebar } from "@/components/SimpleRightSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabaseDataService } from "@/services";
import { usePerformanceMonitor } from "@/hooks/usePerformance";

interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: "admin" | "member";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Family {
  id: string;
  name: string;
  password?: string;
  guidelines?: string;
  createdAt: string;
  _count?: {
    posts: number;
    events: number;
    albums: number;
  };
}

interface FamilyManagementData {
  family: Family | null;
  familyMembers: FamilyMember[];
  currentUserId: string | null;
  familySettings: {
    name: string;
    password: string;
    guidelines: string;
  };
  familyFeatures: Array<{
    key: string;
    label: string;
    enabled: boolean;
  }>;
}

interface FamilyManagementFilters {
  searchTerm: string;
  roleFilter: "all" | "admin" | "member";
  statusFilter: "all" | "active" | "inactive";
  sortBy: "name" | "role" | "joinedAt" | "lastActive";
  sortOrder: "asc" | "desc";
}

interface FamilyManagementProps {
  familyId?: string;
  userId?: string;
  onMemberSelect?: (member: FamilyMember) => void;
  onMemberInvite?: (email: string, role: "admin" | "member") => void;
  onMemberUpdate?: (memberId: string, updates: Partial<FamilyMember>) => void;
  onMemberRemove?: (memberId: string) => void;
  onFamilyUpdate?: (familyId: string, updates: Partial<Family>) => void;
  onFeatureToggle?: (featureKey: string, enabled: boolean) => void;
  onError?: (error: string) => void;
}

// Enhanced Family Management component with modern patterns
const FamilyManagementComponent: React.FC<FamilyManagementProps> = ({
  familyId,
  userId,
  onMemberSelect,
  onMemberInvite,
  onMemberUpdate,
  onMemberRemove,
  onFamilyUpdate,
  onFeatureToggle,
  onError,
}) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const performanceMetrics = usePerformanceMonitor("FamilyManagement");

  // Enhanced state management
  const [filters, setFilters] = useState<FamilyManagementFilters>({
    searchTerm: "",
    roleFilter: "all",
    statusFilter: "all",
    sortBy: "name",
    sortOrder: "asc",
  });

  const [activeTab, setActiveTab] = useState("members");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Family settings state
  const [familySettings, setFamilySettings] = useState({
    name: "",
    password: "",
    guidelines: "",
  });

  const [familyFeatures, setFamilyFeatures] = useState([
    { key: "events", label: "Events & Calendar", enabled: true },
    { key: "recipes", label: "Recipe Sharing", enabled: true },
    { key: "polls", label: "Polls & Voting", enabled: true },
    { key: "games", label: "Family Games", enabled: false },
    { key: "photos", label: "Photos & Videos", enabled: true },
    { key: "music", label: "Music Playlists", enabled: true },
    { key: "fitness", label: "Fitness Challenges", enabled: false },
    { key: "milestones", label: "Milestones", enabled: true },
    { key: "history", label: "Family History", enabled: true },
    { key: "tasks", label: "Task Management", enabled: false },
    { key: "media", label: "Media Recommendations", enabled: true },
  ]);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Memoized data fetching functions
  const fetchFamilyManagementData =
    useCallback(async (): Promise<FamilyManagementData> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        // Get user's families using Supabase
        const familiesResult = await supabaseDataService.getUserFamilies(
          user.id,
        );

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
        const familyData: Family = {
          id: primaryFamily.id,
          name: primaryFamily.familyName,
          password: primaryFamily.familyPassword,
          guidelines: primaryFamily.familyGuidelines,
          createdAt: primaryFamily.createdAt,
          _count: {
            posts: 0, // TODO: Implement when API is available
            events: 0, // TODO: Implement when API is available
            albums: 0, // TODO: Implement when API is available
          },
        };

        setFamily(familyData);

        // For now, we don't have detailed family member data, so create empty list
        // TODO: Implement proper family member loading when the API is available
        const membersData: FamilyMember[] = [];

        // Set family settings
        const settingsData = {
          name: primaryFamily.familyName,
          password: primaryFamily.familyPassword || "",
          guidelines: primaryFamily.familyGuidelines || "",
        };

        setFamilySettings(settingsData);

        const data: FamilyManagementData = {
          family: familyData,
          familyMembers: membersData,
          currentUserId: user.id,
          familySettings: settingsData,
          familyFeatures,
        };

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        onError?.(errorMessage);
        throw error;
      }
    }, [user, familyFeatures, onError]);

  // Enhanced filter handlers
  const handleFilterChange = useCallback(
    (key: keyof FamilyManagementFilters, value: any) => {
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

  // Family management action handlers
  const handleSaveFamilySettings = useCallback(async () => {
    if (!family) return;

    try {
      // TODO: Implement updateFamily in supabaseData service
      console.log("Update family:", family.id, familySettings);

      const updatedFamily = {
        ...family,
        name: familySettings.name,
        guidelines: familySettings.guidelines,
      };

      setFamily(updatedFamily);
      onFamilyUpdate?.(family.id, updatedFamily);

      toast({
        title: "Settings Saved",
        description: "Family settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving family settings:", error);
      toast({
        title: "Error",
        description: "Failed to save family settings. Please try again.",
        variant: "destructive",
      });
    }
  }, [family, familySettings, onFamilyUpdate, toast]);

  const handleInviteMember = useCallback(
    async (email: string, role: "admin" | "member") => {
      try {
        // TODO: Implement invite functionality
        console.log("Invite member:", email, role);

        onMemberInvite?.(email, role);

        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${email}`,
        });

        setShowInviteModal(false);
      } catch (error) {
        console.error("Error sending invitation:", error);
        toast({
          title: "Error",
          description: "Failed to send invitation. Please try again.",
          variant: "destructive",
        });
      }
    },
    [onMemberInvite, toast],
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      if (!confirm("Are you sure you want to remove this member?")) return;

      try {
        // TODO: Implement remove member functionality
        console.log("Remove member:", memberId);

        onMemberRemove?.(memberId);

        toast({
          title: "Member Removed",
          description: "Family member has been removed successfully.",
        });
      } catch (error) {
        console.error("Error removing member:", error);
        toast({
          title: "Error",
          description: "Failed to remove member. Please try again.",
          variant: "destructive",
        });
      }
    },
    [onMemberRemove, toast],
  );

  const handleFeatureToggle = useCallback(
    (featureKey: string, enabled: boolean) => {
      setFamilyFeatures((prev) =>
        prev.map((feature) =>
          feature.key === featureKey ? { ...feature, enabled } : feature,
        ),
      );

      onFeatureToggle?.(featureKey, enabled);
    },
    [onFeatureToggle],
  );

  // Memoized filtered data
  const filteredMembers = useMemo(() => {
    return [];
  }, [filters]);

  // Show call-to-action if not authenticated
  if (!authLoading && !user) {
    return (
      <AuthCallToAction
        icon={<Settings />}
        title="Manage Your Family Space"
        description="Create and customize your family's private digital home. Invite members, set permissions, and organize your shared experience."
        features={[
          "Create your family's private digital space",
          "Invite family members with secure join codes",
          "Set admin permissions and manage privacy settings",
          "Customize family features and preferences",
          "Organize family branches and relationships",
          "Control who can access different family content",
        ]}
        accentColor="#5D6739"
        bgGradient="from-green-50 to-emerald-50"
      />
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!family) {
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
      <div className="max-w-7xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-dark-blue">
              Family Management
            </h1>
            <p className="text-muted-foreground">
              Manage your family settings and members
            </p>
          </div>

          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-accent hover:bg-accent/90"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Family Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {family.name}
              </h2>
              <p className="text-gray-600">
                Created {new Date(family.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{familyMembers.length} members</Badge>
              <Badge variant="outline">
                Family ID: {family.id.slice(0, 8)}...
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {family._count?.events || 0}
              </p>
              <p className="text-sm text-gray-600">Events</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {family._count?.posts || 0}
              </p>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Camera className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                {family._count?.albums || 0}
              </p>
              <p className="text-sm text-gray-600">Albums</p>
            </div>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "members", label: "Members", icon: Users },
                { id: "settings", label: "Settings", icon: Settings },
                { id: "features", label: "Features", icon: Shield },
                { id: "invitations", label: "Invitations", icon: Mail },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "members" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Family Members
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      ref={searchInputRef}
                      placeholder="Search members..."
                      value={filters.searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-64"
                    />
                    <select
                      value={filters.roleFilter}
                      onChange={(e) =>
                        handleFilterChange("roleFilter", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admins</option>
                      <option value="member">Members</option>
                    </select>
                  </div>
                </div>

                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Members will be loaded here
                  </h3>
                  <p className="text-gray-600">
                    Family member data will be fetched and displayed here.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Family Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="familyName">Family Name</Label>
                    <Input
                      id="familyName"
                      value={familySettings.name}
                      onChange={(e) =>
                        setFamilySettings((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="guidelines">Family Guidelines</Label>
                    <Textarea
                      id="guidelines"
                      value={familySettings.guidelines}
                      onChange={(e) =>
                        setFamilySettings((prev) => ({
                          ...prev,
                          guidelines: e.target.value,
                        }))
                      }
                      placeholder="Enter family guidelines and rules..."
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleSaveFamilySettings}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Family Features
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {familyFeatures.map((feature) => (
                    <div
                      key={feature.key}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {feature.key === "events" && (
                            <Calendar className="w-5 h-5 text-blue-600" />
                          )}
                          {feature.key === "recipes" && (
                            <BookOpen className="w-5 h-5 text-green-600" />
                          )}
                          {feature.key === "polls" && (
                            <Activity className="w-5 h-5 text-purple-600" />
                          )}
                          {feature.key === "games" && (
                            <Gamepad2 className="w-5 h-5 text-orange-600" />
                          )}
                          {feature.key === "photos" && (
                            <Camera className="w-5 h-5 text-pink-600" />
                          )}
                          {feature.key === "music" && (
                            <Music className="w-5 h-5 text-indigo-600" />
                          )}
                          {feature.key === "fitness" && (
                            <Activity className="w-5 h-5 text-red-600" />
                          )}
                          {feature.key === "milestones" && (
                            <Award className="w-5 h-5 text-yellow-600" />
                          )}
                          {feature.key === "history" && (
                            <History className="w-5 h-5 text-gray-600" />
                          )}
                          {feature.key === "tasks" && (
                            <CheckSquare className="w-5 h-5 text-teal-600" />
                          )}
                          {feature.key === "media" && (
                            <Monitor className="w-5 h-5 text-cyan-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {feature.label}
                          </p>
                          <p className="text-sm text-gray-500">
                            {feature.enabled ? "Enabled" : "Disabled"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={(enabled) =>
                          handleFeatureToggle(feature.key, enabled)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "invitations" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Invitations
                </h3>

                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No pending invitations
                  </h3>
                  <p className="text-gray-600">
                    Invitations will be displayed here when sent.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Invite Family Member
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="inviteEmail">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="Enter email address"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="inviteRole">Role</Label>
                <select
                  id="inviteRole"
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowInviteModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleInviteMember("test@example.com", "member")
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Send Invitation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Family Management with HOCs
const FamilyManagement = withSidebar(
  withFormManagement(
    withDataFetching(FamilyManagementComponent, {
      dataKey: "familyManagementData",
      fetchFunction: (props: FamilyManagementProps) => {
        return Promise.resolve({
          family: null,
          familyMembers: [],
          currentUserId: null,
          familySettings: {
            name: "",
            password: "",
            guidelines: "",
          },
          familyFeatures: [],
        });
      },
      dependencies: ["userId"],
      cacheKey: (props: FamilyManagementProps) =>
        `family_management_data_${props.userId}`,
      cacheTTL: 5 * 60 * 1000,
      errorFallback: (error: string) => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load family data
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
            <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-lg text-muted-foreground">
              Loading family data...
            </p>
          </div>
        </div>
      ),
    }),
    {
      formConfig: {
        initialValues: {
          searchTerm: "",
          roleFilter: "all",
          statusFilter: "all",
          sortBy: "name",
          sortOrder: "asc",
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
      title: "Family Management",
      description: "Manage your family settings and members",
      navigation: [
        { label: "Overview", href: "#", icon: "users" },
        { label: "Members", href: "#", icon: "user-plus" },
        { label: "Settings", href: "#", icon: "settings" },
        { label: "Features", href: "#", icon: "shield" },
        { label: "Invitations", href: "#", icon: "mail" },
      ],
    },
  },
);

export default FamilyManagement;
