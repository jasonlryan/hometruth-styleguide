"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BudgetIntroScreenProps {
  onGetStarted: () => void;
}

export default function BudgetIntroScreen({
  onGetStarted,
}: BudgetIntroScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-2xl w-full space-y-6">
        {/* Title */}
        <h1 className="type-h1 text-gray-900 text-center mb-4">
          Mortgage Calculations
        </h1>

        {/* AI Introduction */}
        <div className="text-center space-y-4 mb-8">
          <p className="type-h3 text-gray-800 font-gill-sans-regular">
            Hi, I&apos;m your AI Financial Advisor!
          </p>
          <p className="type-body-lg text-gray-600 font-gill-sans-light leading-relaxed">
            Let&apos;s work together to estimate what kind of real estate best
            fits your lifestyle and budget. I&apos;m here to help you understand
            what&apos;s affordable and guide you toward smart, confident financial
            decisions.
          </p>
        </div>

        {/* Prompt Box */}
        <Card className="border border-gray-200 shadow-sm bg-gray-50/50">
          <CardContent className="p-6">
            <p className="text-gray-700 font-gill-sans-light text-center">
              To help estimate your home affordability, please share a few details
              like your location, income, credit score, down payment, and debts...
            </p>
          </CardContent>
        </Card>

        {/* Get Started Button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={onGetStarted}
            className="bg-primary hover:bg-primary/90 text-white rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            aria-label="Get Started"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}





