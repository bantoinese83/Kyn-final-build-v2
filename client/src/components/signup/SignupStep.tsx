// SignupStep Component - Reusable step wrapper for signup process
// Extracted from Signup.tsx to eliminate duplicate code and improve maintainability

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SignupStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: ReactNode;
  onNext: () => void;
  onBack: () => void;
  isNextDisabled?: boolean;
  showBackButton?: boolean;
  showNextButton?: boolean;
  nextButtonText?: string;
  className?: string;
}

export function SignupStep({
  step,
  totalSteps,
  title,
  description,
  children,
  onNext,
  onBack,
  isNextDisabled = false,
  showBackButton = true,
  showNextButton = true,
  nextButtonText = "Next",
  className = "",
}: SignupStepProps) {
  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Card */}
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {title}
          </CardTitle>
          {description && <p className="text-gray-600 mt-2">{description}</p>}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Content */}
          {children}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            {showBackButton && step > 1 ? (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            {showNextButton && (
              <Button
                onClick={onNext}
                disabled={isNextDisabled}
                className="flex items-center space-x-2"
              >
                <span>{nextButtonText}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
