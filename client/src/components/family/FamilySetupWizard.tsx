// FamilySetupWizard Component - Handles multi-step family creation process
// Extracted from CreateFamily.tsx to improve maintainability and reusability

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FamilySetupWizardProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  isStepValid: boolean;
  isProcessing: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FamilySetupWizard({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onFinish,
  isStepValid,
  isProcessing,
  children,
  className = "",
}: FamilySetupWizardProps) {
  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "pending";
  };

  const getStepIcon = (step: number) => {
    const status = getStepStatus(step);
    if (status === "completed") return <Check className="h-4 w-4" />;
    if (status === "current")
      return <span className="text-sm font-medium">{step}</span>;
    return <span className="text-sm text-gray-400">{step}</span>;
  };

  const getStepClass = (step: number) => {
    const status = getStepStatus(step);
    if (status === "completed") return "bg-green-500 text-white";
    if (status === "current") return "bg-blue-500 text-white";
    return "bg-gray-200 text-gray-400";
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Step {currentStep} of {totalSteps}
          </h2>
          <div className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div key={index + 1} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepClass(index + 1)}`}
              >
                {getStepIcon(index + 1)}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    getStepStatus(index + 1) === "completed"
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="p-6">{children}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 1}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        <div className="flex items-center space-x-2">
          {currentStep < totalSteps ? (
            <Button
              onClick={onNext}
              disabled={!isStepValid || isProcessing}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onFinish}
              disabled={!isStepValid || isProcessing}
              className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Family...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Create Family</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
