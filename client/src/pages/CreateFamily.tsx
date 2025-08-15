import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Shield,
  Settings,
  Lock,
  Home,
  Heart,
  Star,
  Plus,
  X,
  Upload,
  Camera,
  Baby,
  Dog,
  Cat,
  Bird,
  Fish,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { familyService } from "@/services";
import { FamilySetupWizard, FamilyMemberForm } from "@/components/family";

export function CreateFamily() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    familyName: "",
    familyPassword: "",
    familyGuidelines: "",
    petsAndChildren: [] as Array<{
      id: string;
      name: string;
      type: "child" | "pet";
      dateOfBirth: string;
      profilePicture: string | null;
      petType?: string; // for pets: dog, cat, bird, etc.
    }>,
    features: {
      events: true,
      recipes: true,
      polls: true,
      games: true,
      photos: true,
      music: true,
      fitness: true,
      milestones: true,
      history: true,
      tasks: false,
      media: true,
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature as keyof typeof prev.features],
      },
    }));
  };

  const addPetOrChild = (type: "child" | "pet") => {
    if (formData.petsAndChildren.length >= 16) return;

    const newEntry = {
      id: Date.now().toString(),
      name: "",
      type,
      dateOfBirth: "",
      profilePicture: null,
      ...(type === "pet" && { petType: "dog" }),
    };

    setFormData((prev) => ({
      ...prev,
      petsAndChildren: [...prev.petsAndChildren, newEntry],
    }));
  };

  const removePetOrChild = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      petsAndChildren: prev.petsAndChildren.filter((item) => item.id !== id),
    }));
  };

  const updatePetOrChild = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      petsAndChildren: prev.petsAndChildren.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleImageUpload = (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updatePetOrChild(id, "profilePicture", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateFamily = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a family.",
        variant: "destructive",
      });
      navigate("/signup");
      return;
    }

    try {
      setIsCreating(true);

      // Create the family
      const familyData = {
        familyName: formData.familyName,
        familyPassword: formData.familyPassword,
        familyGuidelines: formData.familyGuidelines || null,
        adminId: user.id,
        features: formData.features,
      };

      const familyResult = await familyService.createFamily(familyData);

      if (!familyResult.success || !familyResult.data) {
        throw new Error(familyResult.error || "Failed to create family");
      }

      const createdFamily = familyResult.data;

      // Create children and pets if any - add to family tree
      for (const member of formData.petsAndChildren) {
        if (member.name.trim()) {
          try {
            // Note: createFamilyTreeNode method was removed from family service
            // Family members are now managed through the family member system
            console.log(
              "Family member creation would happen here:",
              member.name,
            );
          } catch (err) {
            console.error("Error creating family member:", err);
            // Don't fail the whole process for this
          }
        }
      }

      toast({
        title: "Family Created Successfully!",
        description: `${formData.familyName} has been created. Welcome to Kyn!`,
      });

      // Navigate to the main dashboard
      navigate("/");
    } catch (err: any) {
      console.error("Error creating family:", err);
      toast({
        title: "Failed to Create Family",
        description: err.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreateFamily();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return Boolean(
          formData.familyName.trim() && formData.familyPassword.trim(),
        );
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  const features = [
    {
      key: "events",
      label: "Events & Calendar",
      description: "Plan gatherings and track important dates",
      icon: "����",
    },
    {
      key: "recipes",
      label: "Recipe Sharing",
      description: "Share family recipes and cooking tips",
      icon: "👩‍🍳",
    },
    {
      key: "polls",
      label: "Polls & Voting",
      description: "Make family decisions together",
      icon: "🗳️",
    },
    {
      key: "games",
      label: "Family Games",
      description: "Trivia and fun activities",
      icon: "🎮",
    },
    {
      key: "photos",
      label: "Photos & Videos",
      description: "Share memories and moments",
      icon: "📸",
    },
    {
      key: "music",
      label: "Music Playlists",
      description: "Collaborative family playlists",
      icon: "🎵",
    },
    {
      key: "fitness",
      label: "Fitness Challenges",
      description: "Stay healthy together",
      icon: "💪",
    },
    {
      key: "milestones",
      label: "Milestones",
      description: "Celebrate achievements",
      icon: "🏆",
    },
    {
      key: "history",
      label: "Family History",
      description: "Preserve family stories",
      icon: "📜",
    },
    {
      key: "tasks",
      label: "Task Management",
      description: "Organize family tasks",
      icon: "✅",
    },
    {
      key: "media",
      label: "Media Recommendations",
      description: "Share book and movie suggestions",
      icon: "🎬",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <Link
            to="/welcome"
            className="inline-flex items-center gap-2 text-light-blue-gray hover:text-dark-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to welcome
          </Link>

          <div className="flex justify-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F04caa7491bc2476fb971d605ad425587%2F168b5b3f9b8841d8b7c2cd0ba92279cb?format=webp&width=800"
              alt="Kyn Logo"
              className="w-16 h-16 object-contain"
            />
          </div>

          <div>
            <h1 className="text-3xl font-tenor font-normal text-dark-blue mb-2">
              Create Your Family Space
            </h1>
            <p className="text-light-blue-gray">
              Be the first to build your family's digital home
            </p>
          </div>
        </div>

        {/* Main Wizard */}
        <FamilySetupWizard
          currentStep={currentStep}
          totalSteps={4}
          onNext={handleNext}
          onBack={handleBack}
          onFinish={handleCreateFamily}
          isStepValid={isStepValid()}
          isProcessing={isCreating}
        >
          {/* Step 1: Family Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-dark-blue flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5" />
                  Family Details
                </h3>
                <p className="text-sm text-light-blue-gray">
                  Give your family space a name and secure it
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="familyName"
                    className="text-sm font-medium text-dark-blue"
                  >
                    Family Name *
                  </Label>
                  <Input
                    id="familyName"
                    type="text"
                    placeholder="The Smith Family"
                    value={formData.familyName}
                    onChange={(e) =>
                      handleInputChange("familyName", e.target.value)
                    }
                    className="border-light-blue-gray/30 focus:border-dark-blue"
                    required
                  />
                  <p className="text-xs text-light-blue-gray">
                    This will be displayed to all family members
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="familyPassword"
                    className="text-sm font-medium text-dark-blue flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Family Password *
                  </Label>
                  <Input
                    id="familyPassword"
                    type="password"
                    placeholder="Create a secure password"
                    value={formData.familyPassword}
                    onChange={(e) =>
                      handleInputChange("familyPassword", e.target.value)
                    }
                    className="border-light-blue-gray/30 focus:border-dark-blue"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-light-blue-gray">
                    Share this with family members who want to join (minimum 6
                    characters)
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Why do we need this?
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    The family password ensures only people you invite can join
                    your private family space. It's like having a secret
                    handshake for your digital home!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Family Guidelines */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-dark-blue flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5" />
                  Family Guidelines
                </h3>
                <p className="text-sm text-light-blue-gray">
                  Set the tone for your family's digital space
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="familyGuidelines"
                    className="text-sm font-medium text-dark-blue"
                  >
                    Family Guidelines (Optional)
                  </Label>
                  <Textarea
                    id="familyGuidelines"
                    placeholder="e.g., Be kind, respect privacy, share positive moments..."
                    value={formData.familyGuidelines}
                    onChange={(e) =>
                      handleInputChange("familyGuidelines", e.target.value)
                    }
                    rows={4}
                    className="border-light-blue-gray/30 focus:border-dark-blue"
                  />
                  <p className="text-xs text-light-blue-gray">
                    These guidelines will help set expectations for how family
                    members interact
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Family Members & Pets */}
          {currentStep === 3 && (
            <FamilyMemberForm
              members={formData.petsAndChildren}
              onAddMember={addPetOrChild}
              onRemoveMember={removePetOrChild}
              onUpdateMember={updatePetOrChild}
              onImageUpload={handleImageUpload}
            />
          )}

          {/* Step 4: Features */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-dark-blue flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5" />
                  Choose Your Features
                </h3>
                <p className="text-sm text-light-blue-gray">
                  Select which features to enable for your family
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <Switch
                      id={feature.key}
                      checked={
                        formData.features[
                          feature.key as keyof typeof formData.features
                        ]
                      }
                      onCheckedChange={() => handleFeatureToggle(feature.key)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={feature.key}
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        {feature.label}
                      </Label>
                      <p className="text-xs text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FamilySetupWizard>
      </div>
    </div>
  );
}
