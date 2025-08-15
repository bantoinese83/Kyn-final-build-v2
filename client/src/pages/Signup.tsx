// Signup Component - Main signup page using modular components
// Refactored from 1339 lines to modular, maintainable components

import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignupStep, SignupStep1 } from "@/components/signup";

export function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { family, isAdmin, familyData } = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [children, setChildren] = useState<
    Array<{ id: string; name: string; birthYear: string; relationship: string }>
  >([]);
  const [pets, setPets] = useState<
    Array<{ id: string; name: string; type: string; breed?: string }>
  >([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    // Required information
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    birthday: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    interests: "",
    occupation: "",
    relationshipToAdmin: "",

    // Additional onboarding
    cashapp: "",
    venmo: "",
    paypal: "",
    socialMedia: "",
    website: "",
    amazonWishList: "",
    favoriteFood: "",
    favoriteColors: "",
    favoriteBeverages: "",
    rainyDayActivity: "",
    loveLanguage: "",
    mbti: "",
    zodiacSign: "",
    favoriteMovie: "",
    favoriteSongs: "",
    favoriteStores: "",
    favoritePlace: "",
    dreamVacation: "",
    favoriteHoliday: "",
    funFact: "",
    currentGoals: "",
    dreamBusiness: "",
    familyNickname: "",
    favoriteSport: "",
    sportsTeams: "",
    allergies: "",
  });

  const totalSteps = 7;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete signup
      navigate("/welcome-aboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePhotoChange = (photo: string | null) => {
    setProfilePhoto(photo);
  };

  const handleTermsChange = (agreed: boolean) => {
    setAgreedToTerms(agreed);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SignupStep1
            formData={{
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
            }}
            agreedToTerms={agreedToTerms}
            onInputChange={handleInputChange}
            onTermsChange={handleTermsChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Personal Information
              </h2>
              <p className="text-gray-600">Tell us a bit more about yourself</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Birthday
                </label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) =>
                    handleInputChange("birthday", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your street address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="State"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="ZIP Code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Step {currentStep}
            </h2>
            <p className="text-gray-600">This step is coming soon...</p>
          </div>
        );
    }
  };

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
            </div>

            {family && (
              <div className="text-sm text-gray-600">
                Joining:{" "}
                <span className="font-medium">{family.familyName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <SignupStep
          step={currentStep}
          totalSteps={totalSteps}
          title={getStepTitle(currentStep)}
          description={getStepDescription(currentStep)}
          onNext={handleNext}
          onBack={handleBack}
          isNextDisabled={!isStepValid(currentStep)}
          showBackButton={currentStep > 1}
          showNextButton={currentStep < totalSteps}
          nextButtonText={
            currentStep === totalSteps ? "Complete Signup" : "Next"
          }
        >
          {renderCurrentStep()}
        </SignupStep>
      </div>
    </div>
  );
}

// Helper functions to keep the component focused
function getStepTitle(step: number): string {
  const titles = {
    1: "Basic Information",
    2: "Personal Details",
    3: "Family Information",
    4: "Interests & Preferences",
    5: "Profile Photo",
    6: "Additional Details",
    7: "Review & Complete",
  };
  return titles[step as keyof typeof titles] || `Step ${step}`;
}

function getStepDescription(step: number): string {
  const descriptions = {
    1: "Let's start with the basics to get you set up",
    2: "Tell us a bit more about yourself",
    3: "Share information about your family",
    4: "Help us personalize your experience",
    5: "Add a profile photo to help family members recognize you",
    6: "Any additional information you'd like to share",
    7: "Review your information and complete your signup",
  };
  return descriptions[step as keyof typeof descriptions] || "";
}

function isStepValid(step: number): boolean {
  // This would be implemented with proper validation logic
  // For now, returning true to allow navigation
  return true;
}
