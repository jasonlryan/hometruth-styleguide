"use client";

import { Button } from "@/components/ui/button";
import type { MortgageCalculationResult } from "@/lib/types/budget-calculator";

interface BudgetResultsPanelProps {
  calculationResult: MortgageCalculationResult;
  onSave: () => void;
  onEditAnswers: () => void;
}

export default function BudgetResultsPanel({
  calculationResult,
  onSave,
  onEditAnswers,
}: BudgetResultsPanelProps) {
  const { min, max } = calculationResult.estimatedMonthlyPaymentRange;

  return (
    <div className="mt-6 space-y-4">
      {/* Results Panel */}
      <div className="bg-gradient-to-r from-pink-100 to-red-100 rounded-lg p-6 border border-pink-200">
        <div className="space-y-3">
          <p className="text-gray-700 font-gill-sans-regular">
            Estimated Monthly Payment Range:
          </p>
          <p className="text-4xl font-bold text-red-800 font-gill-sans-regular">
            £{min.toLocaleString()} – £{max.toLocaleString()}/month
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onSave}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 font-gill-sans-light transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
        >
          Save to Notes
        </Button>
        <Button
          onClick={onEditAnswers}
          variant="outline"
          className="border-gray-300 bg-white text-primary hover:bg-gray-50 px-6 py-2 font-gill-sans-light"
        >
          Edit My Answers
        </Button>
      </div>
    </div>
  );
}
