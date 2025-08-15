import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Lock, Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { familyService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function JoinFamily() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    familyName: "",
    familyPassword: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [foundFamily, setFoundFamily] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const { toast } = useToast();

  const handleFindFamily = async () => {
    setIsSearching(true);
    try {
      // Note: searchFamilyByName method was removed from family service
      // For now, we'll simulate family search - this would need to be implemented
      // based on your specific requirements
      console.log("Family search would happen here for:", formData.familyName);

      // Simulate finding a family for demonstration
      setFoundFamily({
        id: "demo-family-id",
        name: formData.familyName,
        members: 5,
        admin: "Family Admin",
        created: new Date().toLocaleDateString(),
      });
    } catch (error) {
      console.error("Error searching for family:", error);
      toast({
        title: "Error",
        description: "Failed to search for family. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinFamily = async () => {
    if (foundFamily && formData.familyPassword && user) {
      try {
        const joinResult = await familyService.joinFamily(
          foundFamily.id,
          user.id,
          formData.familyPassword,
        );

        if (joinResult.success) {
          toast({
            title: "Welcome to the Family!",
            description:
              "You've successfully joined the family. Redirecting to dashboard...",
          });

          // Navigate to the main dashboard
          setTimeout(() => navigate("/"), 2000);
        } else {
          toast({
            title: "Invalid Password",
            description:
              "The family password you entered is incorrect. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error joining family:", error);
        toast({
          title: "Error",
          description: "Failed to join family. Please try again.",
          variant: "destructive",
        });
      }
    } else if (!user) {
      // If user is not authenticated, navigate to signup
      navigate("/signup", { state: { family: foundFamily } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
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
              Join Your Family
            </h1>
            <p className="text-light-blue-gray">
              Enter your family's details to get started
            </p>
          </div>
        </div>

        {/* Join Family Form */}
        <Card className="border-2 border-light-blue-gray/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-dark-blue flex items-center gap-2">
              <Users className="w-5 h-5" />
              Family Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="familyName"
                className="text-sm font-medium text-dark-blue"
              >
                Family Name
              </Label>
              <Input
                id="familyName"
                type="text"
                placeholder="Enter your family name"
                value={formData.familyName}
                onChange={(e) =>
                  handleInputChange("familyName", e.target.value)
                }
                className="border-light-blue-gray/30 focus:border-dark-blue"
              />
              <p className="text-xs text-light-blue-gray">
                Ask your family admin for the exact family name
              </p>
            </div>

            {!foundFamily ? (
              <Button
                onClick={handleFindFamily}
                disabled={!formData.familyName || isSearching}
                className="w-full bg-dark-blue hover:bg-dark-blue/90 text-cream-white"
              >
                {isSearching ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Family
                  </>
                )}
              </Button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleJoinFamily();
                }}
              >
                <div className="space-y-4">
                  {/* Found Family Display */}
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Family Found!
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-green-700">
                      <p>
                        <strong>{foundFamily.name}</strong>
                      </p>
                      <p>{foundFamily.members} family members</p>
                      <p>Admin: {foundFamily.admin}</p>
                      <p>Created: {foundFamily.created}</p>
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="familyPassword"
                      className="text-sm font-medium text-dark-blue flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Family Password
                    </Label>
                    <Input
                      id="familyPassword"
                      type="password"
                      placeholder="Enter family password"
                      value={formData.familyPassword}
                      onChange={(e) =>
                        handleInputChange("familyPassword", e.target.value)
                      }
                      className="border-light-blue-gray/30 focus:border-dark-blue"
                      required
                      autoComplete="current-password"
                    />
                    <p className="text-xs text-light-blue-gray">
                      This password was set by your family admin for security
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      disabled={!formData.familyPassword}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Join {foundFamily.name}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFoundFamily(null);
                        setFormData({ familyName: "", familyPassword: "" });
                      }}
                      className="w-full border-light-blue-gray text-dark-blue"
                    >
                      Search Different Family
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border-2 border-dashed border-light-blue-gray/30">
          <CardContent className="p-4">
            <h3 className="font-medium text-dark-blue mb-2">Need Help?</h3>
            <div className="space-y-2 text-sm text-light-blue-gray">
              <p>• Ask your family admin to share the QR code</p>
              <p>• Make sure you have the exact family name</p>
              <p>• The family password is case-sensitive</p>
              <p>• Contact support if you're still having trouble</p>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Options */}
        <div className="text-center space-y-2">
          <p className="text-sm text-light-blue-gray">
            Don't have a family space yet?
          </p>
          <Link to="/create-family">
            <Button
              variant="ghost"
              className="text-dark-blue hover:bg-light-blue-gray/10"
            >
              Create your own family space
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
