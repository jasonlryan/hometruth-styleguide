"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  showProgress?: boolean;
  className?: string;
}

export default function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  showProgress = true,
  className,
}: OnboardingLayoutProps) {
  const progressPercentage = currentStep && totalSteps 
    ? (currentStep / totalSteps) * 100 
    : 0;

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Header with Logo */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                  <span className="text-white font-gill-sans-regular text-lg">H</span>
                </div>
                <div>
                  <span className="font-gill-sans-regular text-xl text-gray-900">
                    Home
                  </span>
                  <span className="font-gill-sans-regular text-xl text-primary">
                    Truth
                  </span>
                </div>
              </div>
            </Link>
            
            {showProgress && currentStep && totalSteps && (
              <div className="text-sm font-gill-sans-light text-gray-600">
                Step {currentStep} of {totalSteps}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {showProgress && currentStep && totalSteps && (
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="h-1 bg-gray-200 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}