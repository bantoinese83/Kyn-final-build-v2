import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Plus,
  Camera,
  Star,
  Clock,
  Users,
  Award,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileNav } from "@/components/MobileNav";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function SubmitVendor() {
  const { user, loading } = useAuth();

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<Plus />}
        title="Share Your Trusted Vendor Recommendations"
        description="Help your family by recommending trusted service providers and businesses you've had great experiences with."
        features={[
          "Submit trusted vendors for family review",
          "Share detailed experiences and recommendations",
          "Help family members find reliable services",
          "Rate and review service providers",
          "Create a trusted family vendor directory",
          "Save family members time and money with vetted recommendations",
        ]}
        accentColor="#8B5A3C"
        bgGradient="from-yellow-50 to-amber-50"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const [submissionForm, setSubmissionForm] = useState({
    vendorName: "",
    category: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    description: "",
    services: "",
    recommendation: "",
    specialOffers: "",
  });

  const { success } = useToast();

  const handleSubmissionChange = (field: string, value: string) => {
    setSubmissionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitVendor = () => {
    // Validate required fields
    if (
      !submissionForm.vendorName ||
      !submissionForm.category ||
      !submissionForm.description
    ) {
      success(
        "Missing Information",
        "Please fill in vendor name, category, and description",
      );
      return;
    }

    // In a real app, this would send to an API for admin review
    success(
      "Submission Received!",
      `Thank you for recommending ${submissionForm.vendorName}. Our team will review and add it to our trusted vendors list if approved.`,
    );

    // Reset form
    setSubmissionForm({
      vendorName: "",
      category: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      description: "",
      services: "",
      recommendation: "",
      specialOffers: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <MobileNav />
      <div className="max-w-4xl mx-auto">
        <main className="flex-1 flex flex-col w-full p-4 sm:p-6 overflow-y-auto">
          <div className="mb-6">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Resources
            </Link>
          </div>

          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-royal-purple/10 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-royal-purple" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-tenor font-normal text-foreground mb-2">
                  Submit a Trusted Vendor
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Help grow our community of trusted professionals by
                  recommending vendors and service providers that you personally
                  vouch for.
                </p>
              </div>
            </div>

            {/* Process Explanation */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-royal-purple/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-royal-purple" />
                    Our Vetting Standards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">
                        Background Verification
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        We confirm business licenses, credentials, and
                        professional standing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">
                        Quality Assessment
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        We review service quality, customer satisfaction, and
                        reputation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">
                        Family-Friendly Evaluation
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        We ensure they align with family values and provide
                        excellent service
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">
                        Community Feedback
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        We consider recommendations and experiences from other
                        families
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-olive-green/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-olive-green" />
                    Review Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                        1
                      </div>
                      <span className="text-sm">
                        Submission received and initial review
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-medium text-yellow-700">
                        2
                      </div>
                      <span className="text-sm">
                        Business verification and credential check
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                        3
                      </div>
                      <span className="text-sm">
                        Quality assessment and reference checks
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                        4
                      </div>
                      <span className="text-sm">
                        Approval and addition to trusted directory
                      </span>
                    </div>
                  </div>
                  <div className="bg-olive-green/10 rounded-lg p-3">
                    <p className="text-sm text-olive-green font-medium">
                      Review typically completed within 5-7 business days
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submission Form */}
            <Card className="border-2 border-royal-purple/20">
              <CardHeader>
                <CardTitle className="text-xl font-tenor">
                  Vendor Submission Form
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Please provide detailed information about the vendor you're
                  recommending. The more information you provide, the faster we
                  can complete our review.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName" className="text-sm font-medium">
                      Vendor/Business Name *
                    </Label>
                    <Input
                      id="vendorName"
                      placeholder="e.g., Johnson's Family Law"
                      value={submissionForm.vendorName}
                      onChange={(e) =>
                        handleSubmissionChange("vendorName", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category *
                    </Label>
                    <Select
                      value={submissionForm.category}
                      onValueChange={(value) =>
                        handleSubmissionChange("category", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Estate Planning">
                          Estate Planning
                        </SelectItem>
                        <SelectItem value="Legal Services">
                          Legal Services
                        </SelectItem>
                        <SelectItem value="Healthcare & Senior Care">
                          Healthcare & Senior Care
                        </SelectItem>
                        <SelectItem value="Financial Planning">
                          Financial Planning
                        </SelectItem>
                        <SelectItem value="Travel & Vacation">
                          Travel & Vacation
                        </SelectItem>
                        <SelectItem value="Home Services">
                          Home Services
                        </SelectItem>
                        <SelectItem value="Educational Resources">
                          Educational Resources
                        </SelectItem>
                        <SelectItem value="Community Services">
                          Community Services
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      placeholder="(555) 123-4567"
                      value={submissionForm.phone}
                      onChange={(e) =>
                        handleSubmissionChange("phone", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@business.com"
                      value={submissionForm.email}
                      onChange={(e) =>
                        handleSubmissionChange("email", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">
                      Website
                    </Label>
                    <Input
                      id="website"
                      placeholder="www.business.com"
                      value={submissionForm.website}
                      onChange={(e) =>
                        handleSubmissionChange("website", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Main St, City, State"
                      value={submissionForm.address}
                      onChange={(e) =>
                        handleSubmissionChange("address", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Business Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about this vendor, what they do, and why you recommend them..."
                    value={submissionForm.description}
                    onChange={(e) =>
                      handleSubmissionChange("description", e.target.value)
                    }
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="services" className="text-sm font-medium">
                    Services Offered
                  </Label>
                  <Input
                    id="services"
                    placeholder="e.g., Wills & Trusts, Estate Planning, Tax Advice (separate with commas)"
                    value={submissionForm.services}
                    onChange={(e) =>
                      handleSubmissionChange("services", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="recommendation"
                    className="text-sm font-medium"
                  >
                    Your Experience/Recommendation
                  </Label>
                  <Textarea
                    id="recommendation"
                    placeholder="How did you hear about them? What was your experience? Who in your family used their services?"
                    value={submissionForm.recommendation}
                    onChange={(e) =>
                      handleSubmissionChange("recommendation", e.target.value)
                    }
                    className="min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="specialOffers"
                    className="text-sm font-medium"
                  >
                    Special Offers for Families (Optional)
                  </Label>
                  <Input
                    id="specialOffers"
                    placeholder="e.g., Free consultation, family discounts, etc."
                    value={submissionForm.specialOffers}
                    onChange={(e) =>
                      handleSubmissionChange("specialOffers", e.target.value)
                    }
                  />
                </div>

                <div className="bg-royal-purple/5 border border-royal-purple/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-royal-purple mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-royal-purple">
                        What Happens Next?
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Our team will thoroughly review your submission, verify
                        the business credentials, and assess their fit for our
                        community. We may contact you for additional
                        information. Once approved, the vendor will be added to
                        our trusted directory and you'll receive a confirmation
                        email.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" asChild className="flex-1">
                    <Link to="/resources">Cancel</Link>
                  </Button>
                  <Button
                    onClick={handleSubmitVendor}
                    className="flex-1 bg-royal-purple hover:bg-royal-purple/90"
                    size="lg"
                  >
                    Submit for Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
