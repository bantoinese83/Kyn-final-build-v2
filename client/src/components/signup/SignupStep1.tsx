// SignupStep1 Component - Basic Information Step
// Extracted from Signup.tsx to improve maintainability and reusability

import { FormField } from "./FormField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface SignupStep1Props {
  formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  agreedToTerms: boolean;
  onInputChange: (field: string, value: string) => void;
  onTermsChange: (agreed: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SignupStep1({
  formData,
  agreedToTerms,
  onInputChange,
  onTermsChange,
  onNext,
  onBack,
}: SignupStep1Props) {
  const isStepValid = () => {
    return (
      formData.email &&
      formData.password &&
      formData.firstName &&
      formData.lastName &&
      agreedToTerms
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Create Your Account
        </h2>
        <p className="text-gray-600">
          Let's start with the basics to get you set up
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={onInputChange}
          placeholder="Enter your first name"
          required
        />

        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={onInputChange}
          placeholder="Enter your last name"
          required
        />
      </div>

      <FormField
        label="Email Address"
        name="email"
        value={formData.email}
        onChange={onInputChange}
        type="email"
        placeholder="Enter your email address"
        required
      />

      <FormField
        label="Password"
        name="password"
        value={formData.password}
        onChange={onInputChange}
        type="password"
        placeholder="Create a strong password"
        required
      />

      <div className="flex items-start space-x-2 pt-4">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => onTermsChange(checked as boolean)}
          className="mt-1"
        />
        <label
          htmlFor="terms"
          className="text-sm text-gray-700 leading-relaxed"
        >
          I agree to the{" "}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </label>
      </div>

      <div className="flex justify-between pt-6">
        <div />
        <Button onClick={onNext} disabled={!isStepValid()} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  );
}
