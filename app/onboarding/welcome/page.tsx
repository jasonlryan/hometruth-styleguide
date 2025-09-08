"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OnboardingLayout from "@/components/layouts/onboarding-layout";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function WelcomePage() {
  return (
    <OnboardingLayout showProgress={false}>
      <div className="max-w-lg mx-auto text-center">
        <Card className="shadow-lg border-0">
          <CardContent className="p-12">
            {/* Welcome Icon */}
            <div className="w-16 h-16 bg-gradient-to-r from-[#00BFFF] to-[#B19CD9] rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-2xl">👋</span>
            </div>

            {/* Welcome Message */}
            <h1 className="type-h2 text-gray-900 mb-4">Welcome, rayan!</h1>
            <p className="font-gill-sans-light text-gray-600 mb-8 text-lg leading-relaxed">
              What's your vibe? A few fun questions and we'll craft your unique match.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link href="/onboarding/quiz">
                <Button
                  size="lg"
                  className="w-full bg-[#00BFFF] hover:bg-blue-600 text-white py-4 text-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full text-gray-600 hover:text-gray-900 py-3"
                >
                  Skip For Now
                </Button>
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-gill-sans-light text-gray-600">
                This will only take 2-3 minutes and will help us provide with better recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}