"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/layouts/onboarding-layout";
import MultiStepForm, { FormStep } from "@/components/onboarding/multi-step-form";
import {
  LivingEnvironmentStep,
  BuyingTimelineStep,
  BudgetRangeStep,
  MotivationsStep,
  HomeProcessConcernsStep,
  HousingFactorsStep,
  BiggestFearStep,
  SupportPreferencesStep,
} from "@/components/onboarding/quiz-steps";

export default function QuizPage() {
  const router = useRouter();
  const [currentDisplayStep, setCurrentDisplayStep] = useState(1);

  const steps: FormStep[] = [
    {
      id: "livingEnvironment",
      title: "Let's understand your lifestyle",
      subtitle: "Help us personalize your experience by understanding your needs.",
      component: LivingEnvironmentStep,
      validation: (data) => data.selections && data.selections.length > 0,
    },
    {
      id: "buyingTimeline",
      title: "Let's understand your lifestyle", 
      subtitle: "Help us personalize your experience by understanding your needs.",
      component: BuyingTimelineStep,
      validation: (data) => data.timeline,
    },
    {
      id: "budgetRange",
      title: "Let's understand your lifestyle",
      subtitle: "Help us personalize your experience by understanding your needs.",
      component: BudgetRangeStep,
      validation: (data) => data.budget && data.budget > 0,
    },
    {
      id: "motivations",
      title: "Let's understand your lifestyle",
      subtitle: "Help us personalize your experience by understanding your needs.",
      component: MotivationsStep,
      validation: (data) => data.motivations && data.motivations.length > 0,
    },
    {
      id: "homeProcessConcerns",
      title: "Let's understand your lifestyle",
      subtitle: "Help us personalize your experience by understanding your needs.",
      component: HomeProcessConcernsStep,
      validation: (data) => data.concerns && data.concerns.length > 0,
    },
    {
      id: "housingFactors",
      title: "Let's understand your lifestyle",
      subtitle: "Help us personalize your experience by understanding your needs.",
      component: HousingFactorsStep,
      validation: (data) => data.factors && data.factors.length > 0,
    },
    {
      id: "biggestFear",
      title: "Let's understand your lifestyle",
      subtitle: "Help us personalize your experience by understanding your needs.",
      component: BiggestFearStep,
      validation: (data) => data.fear,
    },
    {
      id: "supportPreferences",
      title: "Let's understand your lifestyle",
      subtitle: "Help us personalize your experience by understanding your needs.",
      component: SupportPreferencesStep,
      validation: (data) => data.support && data.support.trim().length > 0,
    },
  ];

  const handleComplete = (formData: any) => {
    // Here you would typically save the data to your backend
    console.log("Onboarding data:", formData);
    router.push("/onboarding/complete");
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <OnboardingLayout 
      currentStep={currentDisplayStep} 
      totalSteps={steps.length}
      showProgress={true}
    >
      <MultiStepForm
        steps={steps}
        onComplete={handleComplete}
        onSkip={handleSkip}
        showSkipButton={true}
        onStepChange={setCurrentDisplayStep}
      />
    </OnboardingLayout>
  );
}