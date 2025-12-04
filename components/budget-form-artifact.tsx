"use client";

import { useState } from "react";
import { Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BudgetCalculatorAnswers } from "@/lib/types/budget-calculator";
import BudgetFormModal from "./budget-form-modal";

interface BudgetFormArtifactProps {
  answers: Partial<BudgetCalculatorAnswers>;
  onUpdate: (updatedAnswers: Partial<BudgetCalculatorAnswers>) => void;
}

export default function BudgetFormArtifact({
  answers,
  onUpdate,
}: BudgetFormArtifactProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  const handleFormUpdate = (updatedAnswers: Partial<BudgetCalculatorAnswers>) => {
    setHasBeenEdited(true);
    onUpdate(updatedAnswers);
    setIsFormOpen(false);
  };

  const summaryFields = [
    { label: "City", value: answers.city },
    { label: "Annual Income", value: answers.annualIncome ? `£${answers.annualIncome.toLocaleString()}` : undefined },
    { label: "Additional Income", value: answers.additionalIncome?.has ? `£${answers.additionalIncome.monthlyAmount?.toLocaleString()}/month` : "No" },
    { label: "Credit Score", value: answers.creditScore?.toString() },
    { label: "Down Payment", value: answers.downPayment ? `£${answers.downPayment.toLocaleString()}` : undefined },
  ];

  return (
    <>
      <div className="mt-4 border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-gray-600" />
            <h3 className="font-gill-sans-regular text-gray-900">Review Your Answers</h3>
            {hasBeenEdited && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Updated
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFormOpen(true)}
            className="font-gill-sans-light"
          >
            Edit
          </Button>
        </div>
        <div className="p-4 space-y-2">
          {summaryFields.map((field, index) => (
            field.value && (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600 font-gill-sans-light">{field.label}:</span>
                <span className="text-gray-900 font-gill-sans-regular">{field.value}</span>
              </div>
            )
          ))}
        </div>
      </div>
      <BudgetFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        answers={answers}
        onUpdate={handleFormUpdate}
      />
    </>
  );
}

