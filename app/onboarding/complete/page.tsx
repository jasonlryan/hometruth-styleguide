"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OnboardingLayout from "@/components/layouts/onboarding-layout";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CompletePage() {
  return (
    <OnboardingLayout showProgress={false}>
      <div className="max-w-lg mx-auto text-center">
        <Card className="shadow-lg border-0">
          <CardContent className="p-12">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B35] to-[#FFB74D] rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-2xl">🎉</span>
            </div>

            {/* Thank You Message */}
            <h1 className="type-h2 text-gray-900 mb-4">Thanks for sharing!</h1>
            <p className="font-gill-sans-light text-gray-600 mb-8 text-lg leading-relaxed">
              We've used your answers to customize your dashboard, insights, and tone.
              You can change your preferences anytime in Settings.
            </p>

            {/* Go to Dashboard Button */}
            <Link href="/dashboard">
              <Button
                size="lg"
                className="w-full bg-[#00BFFF] hover:bg-blue-600 text-white py-4 text-lg"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-gill-sans-regular text-green-700">
                  Profile Complete
                </span>
              </div>
              <p className="text-sm font-gill-sans-light text-green-600">
                Your personalized HomeTruth experience is ready!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}