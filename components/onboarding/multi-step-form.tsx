"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FormStep {
  id: string;
  title: string;
  subtitle?: string;
  component: React.ComponentType<StepProps>;
  validation?: (data: any) => boolean;
}

export interface StepProps {
  data: any;
  onDataChange: (data: any) => void;
  errors?: Record<string, string>;
}

interface MultiStepFormProps {
  steps: FormStep[];
  onComplete: (data: any) => void;
  onSkip?: () => void;
  initialData?: any;
  className?: string;
  showSkipButton?: boolean;
  onStepChange?: (step: number) => void;
}

export default function MultiStepForm({
  steps,
  onComplete,
  onSkip,
  initialData = {},
  className,
  showSkipButton = false,
  onStepChange,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleDataChange = (stepData: any) => {
    setFormData(prev => ({
      ...prev,
      [currentStepData.id]: stepData,
    }));
    // Clear errors when data changes
    if (errors[currentStepData.id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[currentStepData.id];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = () => {
    if (currentStepData.validation) {
      const isValid = currentStepData.validation(formData[currentStepData.id]);
      if (!isValid) {
        setErrors(prev => ({
          ...prev,
          [currentStepData.id]: "Please complete this step before continuing.",
        }));
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (isLastStep) {
      onComplete(formData);
    } else {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep + 1); // +1 because we want 1-based indexing for display
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep + 1); // +1 because we want 1-based indexing for display
    }
  };

  const CurrentStepComponent = currentStepData.component;

  return (
    <div className={cn("w-full", className)}>
      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Step Header */}
        <div className="text-center mb-8">
          <h2 className="type-h2 text-gray-900 mb-2">
            {currentStepData.title}
          </h2>
          {currentStepData.subtitle && (
            <p className="font-gill-sans-light text-gray-600">
              {currentStepData.subtitle}
            </p>
          )}
        </div>

        {/* Step Component */}
        <div className="mb-8">
          <CurrentStepComponent
            data={formData[currentStepData.id] || {}}
            onDataChange={handleDataChange}
            errors={errors}
          />
        </div>

        {/* Error Message */}
        {errors[currentStepData.id] && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-gill-sans-light text-red-600">
              {errors[currentStepData.id]}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {!isFirstStep ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900"
              >
                Back
              </Button>
            ) : (
              showSkipButton && onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Skip for now
                </Button>
              )
            )}
          </div>

          <div className="flex space-x-3">
            {!isLastStep && showSkipButton && onSkip && (
              <Button
                variant="outline"
                onClick={onSkip}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Skip for now
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-[#00BFFF] hover:bg-blue-600 text-white px-8"
            >
              {isLastStep ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}