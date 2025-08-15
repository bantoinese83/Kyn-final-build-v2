// FamilyMission Page - Main family mission management page
// Refactored to use modular components for better maintainability

import React, { useState, useCallback, useMemo, useRef } from "react";
import { withDataFetching } from "@/components/hoc/withDataFetching";
import { withFormManagement } from "@/components/hoc/withFormManagement";
import { withSidebar } from "@/components/composition/withSidebar";
import { useAuth } from "../contexts/AuthContext";
import { supabaseDataService } from "../services";
import { AuthCallToAction } from "../components/AuthCallToAction";
import { FamilyMission as FamilyMissionType } from "../types/shared";
import {
  Target,
  Heart,
  Users,
  Star,
  BookOpen,
  Lightbulb,
  Zap,
  Shield,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { usePerformanceMonitor } from "@/hooks/usePerformance";
import {
  MissionEditor,
  ValuesSelector,
  MascotPicker,
  MerchandisePreview,
  AIAssistant,
  FamilyMissionHeader,
  FamilyValue,
  MascotOption,
} from "@/components/family-mission";

interface FamilyMissionData {
  familyMission: FamilyMissionType;
  selectedValues: FamilyValue[];
  selectedMascot: MascotOption | null;
  availableValues: FamilyValue[];
  availableMascots: MascotOption[];
  isEditing: boolean;
  showAIAssistant: boolean;
  aiLoading: boolean;
  aiResponse: string;
}

interface FamilyMissionFilters {
  activeTab: "mission" | "values" | "mascot" | "merchandise";
  searchTerm: string;
  valueCategory: "all" | "core" | "growth" | "spiritual";
  mascotCategory: "all" | "nature" | "animals" | "symbols";
}

interface FamilyMissionProps {
  familyId?: string;
  userId?: string;
  onMissionUpdate?: (mission: Partial<FamilyMissionType>) => void;
  onValuesChange?: (values: FamilyValue[]) => void;
  onMascotChange?: (mascot: MascotOption | null) => void;
  onAIGenerate?: (prompt: string) => Promise<string>;
  onError?: (error: string) => void;
}

// Enhanced Family Mission component with modern patterns
const FamilyMissionComponent: React.FC<FamilyMissionProps> = ({
  familyId,
  userId,
  onMissionUpdate,
  onValuesChange,
  onMascotChange,
  onAIGenerate,
  onError,
}) => {
  const { user, loading } = useAuth();
  const { success, error } = useToast();
  const performanceMetrics = usePerformanceMonitor("FamilyMission");

  // Enhanced state management
  const [filters, setFilters] = useState<FamilyMissionFilters>({
    activeTab: "mission",
    searchTerm: "",
    valueCategory: "all",
    mascotCategory: "all",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [familyMission, setFamilyMission] = useState<FamilyMissionType>({
    familyId: "",
    statement: "",
    tagline: "",
    familyMotto: "",
    foundedYear: "",
    values: [],
    mascotId: null,
    mascotName: null,
  });
  const [selectedValues, setSelectedValues] = useState<FamilyValue[]>([]);
  const [selectedMascot, setSelectedMascot] = useState<MascotOption | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Memoized data fetching functions
  const fetchFamilyMissionData =
    useCallback(async (): Promise<FamilyMissionData> => {
      if (!familyId) {
        throw new Error("No family ID provided");
      }

      try {
        // Fetch family mission from Supabase
        const missionDataResult =
          await supabaseDataService.getFamilyMission(familyId);

        let missionData: FamilyMissionType;
        let selectedVals: FamilyValue[];
        let selectedMascotData: MascotOption | null;

        if (missionDataResult.success && missionDataResult.data) {
          missionData = missionDataResult.data;

          // Set selected values based on saved mission
          if (missionData.values && Array.isArray(missionData.values)) {
            selectedVals = getAvailableValues().filter((value: FamilyValue) =>
              missionData.values.includes(value.name),
            );
          } else {
            selectedVals = [];
          }

          // Set selected mascot based on saved mission
          if (missionData.mascotName) {
            selectedMascotData =
              getAvailableMascots().find(
                (m: MascotOption) => m.name === missionData.mascotName,
              ) || null;
          } else {
            selectedMascotData = null;
          }
        } else {
          // Set default values if no mission exists
          missionData = {
            familyId,
            statement:
              "Our family stands together through love, respect, and unwavering support. We celebrate each other's unique gifts, create lasting memories, and build a legacy of kindness that spans generations. Our home is a place of laughter, learning, and unconditional love where everyone belongs.",
            tagline: "Together We Grow, Together We Thrive",
            familyMotto: "Rooted in Love, Reaching for Dreams",
            foundedYear: new Date().getFullYear().toString(),
            values: [],
            mascotId: null,
            mascotName: null,
          };

          // Set default selected values
          selectedVals = getAvailableValues().filter((v: FamilyValue) =>
            ["Love", "Respect", "Honesty", "Joy", "Unity"].includes(v.name),
          );

          // Set default mascot
          selectedMascotData =
            getAvailableMascots().find(
              (m: MascotOption) => m.name === "Oak Tree",
            ) || null;
        }

        setFamilyMission(missionData);
        setSelectedValues(selectedVals);
        setSelectedMascot(selectedMascotData);

        const data: FamilyMissionData = {
          familyMission: missionData,
          selectedValues: selectedVals,
          selectedMascot: selectedMascotData,
          availableValues: getAvailableValues(),
          availableMascots: getAvailableMascots(),
          isEditing: false,
          showAIAssistant: false,
          aiLoading: false,
          aiResponse: "",
        };

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        onError?.(errorMessage);
        throw err;
      }
    }, [familyId, onError]);

  // Enhanced filter handlers
  const handleFilterChange = useCallback(
    (key: keyof FamilyMissionFilters, value: any) => {
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

  // Helper functions to get available options
  const getAvailableValues = useCallback((): FamilyValue[] => {
    // This would typically come from a service or configuration
    return [
      {
        id: "1",
        name: "Love",
        icon: "❤️",
        description: "Unconditional care and affection",
      },
      {
        id: "2",
        name: "Respect",
        icon: "👥",
        description: "Honoring each other's dignity",
      },
      {
        id: "3",
        name: "Honesty",
        icon: "⭐",
        description: "Truth and transparency",
      },
      {
        id: "4",
        name: "Growth",
        icon: "🌱",
        description: "Continuous learning and improvement",
      },
      {
        id: "5",
        name: "Adventure",
        icon: "🏔️",
        description: "Embracing new experiences",
      },
      {
        id: "6",
        name: "Creativity",
        icon: "🎨",
        description: "Expressing imagination",
      },
      { id: "7", name: "Service", icon: "🎁", description: "Helping others" },
      {
        id: "8",
        name: "Wisdom",
        icon: "📚",
        description: "Making thoughtful decisions",
      },
      {
        id: "9",
        name: "Joy",
        icon: "☀️",
        description: "Finding happiness together",
      },
      {
        id: "10",
        name: "Unity",
        icon: "🏠",
        description: "Standing together as one",
      },
      {
        id: "11",
        name: "Strength",
        icon: "🛡️",
        description: "Resilience in challenges",
      },
      {
        id: "12",
        name: "Faith",
        icon: "⭐",
        description: "Belief in something greater",
      },
    ];
  }, []);

  const getAvailableMascots = useCallback((): MascotOption[] => {
    // This would typically come from a service or configuration
    return [
      {
        id: "1",
        name: "Oak Tree",
        icon: "🌳",
        description: "Strength and longevity",
        category: "Nature",
      },
      {
        id: "2",
        name: "Eagle",
        icon: "🦅",
        description: "Vision and freedom",
        category: "Animals",
      },
      {
        id: "3",
        name: "Lion",
        icon: "🦁",
        description: "Courage and leadership",
        category: "Animals",
      },
      {
        id: "4",
        name: "Dolphin",
        icon: "🐬",
        description: "Intelligence and playfulness",
        category: "Animals",
      },
      {
        id: "5",
        name: "Mountain",
        icon: "⛰️",
        description: "Stability and grandeur",
        category: "Nature",
      },
      {
        id: "6",
        name: "Star",
        icon: "⭐",
        description: "Guidance and inspiration",
        category: "Symbols",
      },
      {
        id: "7",
        name: "Heart",
        icon: "❤️",
        description: "Love and compassion",
        category: "Symbols",
      },
      {
        id: "8",
        name: "Anchor",
        icon: "⚓",
        description: "Security and hope",
        category: "Symbols",
      },
    ];
  }, []);

  // Mission action handlers
  const toggleValue = useCallback(
    (value: FamilyValue) => {
      const isSelected = selectedValues.some((v) => v.id === value.id);
      if (isSelected) {
        const newValues = selectedValues.filter((v) => v.id !== value.id);
        setSelectedValues(newValues);
        onValuesChange?.(newValues);
      } else {
        const newValues = [...selectedValues, value];
        setSelectedValues(newValues);
        onValuesChange?.(newValues);
      }
    },
    [selectedValues, onValuesChange],
  );

  const handleSaveMission = useCallback(async () => {
    if (!familyId) {
      error("No family ID", "Please ensure you're part of a family");
      return;
    }

    try {
      const missionData = {
        familyId,
        statement: familyMission.statement,
        tagline: familyMission.tagline,
        familyMotto: familyMission.familyMotto,
        foundedYear: familyMission.foundedYear,
        values: selectedValues.map((v) => v.name),
        mascotId: selectedMascot?.id.toString() || null,
        mascotName: selectedMascot?.name || null,
      };

      // Save to Supabase
      const savedMissionResult =
        await supabaseDataService.createOrUpdateFamilyMission(
          familyId,
          missionData,
        );

      if (savedMissionResult.success && savedMissionResult.data) {
        const updatedMission = savedMissionResult.data;
        setFamilyMission(updatedMission);
        setIsEditing(false);
        onMissionUpdate?.(updatedMission);
        success(
          "Mission saved successfully",
          "Your family mission has been updated",
        );
      } else {
        error("Failed to save mission", "Please try again");
      }
    } catch (err) {
      console.error("Error saving mission:", err);
      error("Failed to save mission", "Please try again");
    }
  }, [
    familyId,
    familyMission,
    selectedValues,
    selectedMascot,
    supabaseDataService,
    onMissionUpdate,
    success,
    error,
  ]);

  const handleInputChange = useCallback(
    (field: keyof FamilyMissionType, value: string) => {
      setFamilyMission((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const generateAIMission = useCallback(
    async (customPrompt: string) => {
      setAiLoading(true);
      try {
        const response =
          (await onAIGenerate?.(customPrompt)) || "AI generation not available";
        setAiResponse(response);
        setShowAIAssistant(true);
      } catch (err) {
        console.error("Error generating AI mission:", err);
        error("Failed to generate AI mission", "Please try again");
      } finally {
        setAiLoading(false);
      }
    },
    [onAIGenerate, error],
  );

  const handleMascotSelect = useCallback(
    (mascot: MascotOption) => {
      setSelectedMascot(mascot);
      onMascotChange?.(mascot);
    },
    [onMascotChange],
  );

  // Memoized filtered data
  const filteredValues = useMemo(() => {
    return getAvailableValues();
  }, [getAvailableValues]);

  const filteredMascots = useMemo(() => {
    return getAvailableMascots();
  }, [getAvailableMascots]);

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<Target />}
        title="Define Your Family's Purpose"
        description="Create a meaningful mission statement that reflects your family's values, goals, and aspirations. Build a shared vision that guides your journey together."
        features={[
          "Craft a unique family mission statement",
          "Choose values that represent your family",
          "Select a meaningful family mascot",
          "Create custom family merchandise",
          "Get AI-powered mission suggestions",
          "Share your mission with family members",
        ]}
        accentColor="#8B5A3C"
        bgGradient="from-amber-50 to-orange-50"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!familyId) {
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
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Create Family
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FamilyMissionHeader
          familyMission={familyMission}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
          onSave={handleSaveMission}
        />

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Tabs
            value={filters.activeTab}
            onValueChange={(value) => handleFilterChange("activeTab", value)}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="mission"
                className="flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Mission</span>
              </TabsTrigger>
              <TabsTrigger
                value="values"
                className="flex items-center space-x-2"
              >
                <Heart className="w-4 h-4" />
                <span>Values</span>
              </TabsTrigger>
              <TabsTrigger
                value="mascot"
                className="flex items-center space-x-2"
              >
                <Star className="w-4 h-4" />
                <span>Mascot</span>
              </TabsTrigger>
              <TabsTrigger
                value="merchandise"
                className="flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Merchandise</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mission" className="p-6">
              <MissionEditor
                familyMission={familyMission}
                isEditing={isEditing}
                onInputChange={handleInputChange}
                onSave={handleSaveMission}
              />
            </TabsContent>

            <TabsContent value="values" className="p-6">
              <ValuesSelector
                availableValues={filteredValues}
                selectedValues={selectedValues}
                onToggleValue={toggleValue}
                searchTerm={filters.searchTerm}
                onSearchChange={handleSearch}
                category={filters.valueCategory}
                onCategoryChange={(category) =>
                  handleFilterChange("valueCategory", category)
                }
              />
            </TabsContent>

            <TabsContent value="mascot" className="p-6">
              <MascotPicker
                availableMascots={filteredMascots}
                selectedMascot={selectedMascot}
                onSelectMascot={handleMascotSelect}
                searchTerm={filters.searchTerm}
                onSearchChange={handleSearch}
                category={filters.mascotCategory}
                onCategoryChange={(category) =>
                  handleFilterChange("mascotCategory", category)
                }
              />
            </TabsContent>

            <TabsContent value="merchandise" className="p-6">
              <MerchandisePreview
                familyMission={familyMission}
                selectedMascot={selectedMascot}
                selectedValues={selectedValues}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Assistant */}
        {showAIAssistant && (
          <AIAssistant
            isOpen={showAIAssistant}
            onClose={() => setShowAIAssistant(false)}
            onGenerate={generateAIMission}
            isLoading={aiLoading}
            response={aiResponse}
          />
        )}

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowAIAssistant(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <Lightbulb className="w-5 h-5" />
            <span>Get AI Suggestions</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>{isEditing ? "Preview" : "Edit Mission"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Family Mission with HOCs
const FamilyMission = withSidebar(
  withFormManagement(
    withDataFetching(FamilyMissionComponent, {
      dataKey: "familyMissionData",
      fetchFunction: (props: FamilyMissionProps) => {
        return Promise.resolve({
          familyMission: {
            familyId: "",
            statement: "",
            tagline: "",
            familyMotto: "",
            foundedYear: "",
            values: [],
            mascotId: null,
            mascotName: null,
          },
          selectedValues: [],
          selectedMascot: null,
          availableValues: [],
          availableMascots: [],
          isEditing: false,
          showAIAssistant: false,
          aiLoading: false,
          aiResponse: "",
        });
      },
      dependencies: ["familyId"],
      cacheKey: (props: FamilyMissionProps) =>
        `family_mission_data_${props.familyId}`,
      cacheTTL: 5 * 60 * 1000,
      errorFallback: (error: string) => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load family mission
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
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-lg text-muted-foreground">
              Loading family mission...
            </p>
          </div>
        </div>
      ),
    }),
    {
      formConfig: {
        initialValues: {
          activeTab: "mission",
          searchTerm: "",
          valueCategory: "all",
          mascotCategory: "all",
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
      title: "Family Mission",
      description: "Define your family's purpose and values",
      navigation: [
        { label: "Mission", href: "#", icon: "book-open" },
        { label: "Values", href: "#", icon: "heart" },
        { label: "Mascot", href: "#", icon: "star" },
        { label: "Merchandise", href: "#", icon: "shield" },
      ],
    },
  },
);

export default FamilyMission;
