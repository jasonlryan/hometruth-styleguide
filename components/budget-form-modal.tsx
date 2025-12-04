"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BudgetCalculatorAnswers } from "@/lib/types/budget-calculator";

interface BudgetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answers: Partial<BudgetCalculatorAnswers>;
  onUpdate: (answers: Partial<BudgetCalculatorAnswers>) => void;
}

export default function BudgetFormModal({
  open,
  onOpenChange,
  answers,
  onUpdate,
}: BudgetFormModalProps) {
  const [formData, setFormData] = useState<Partial<BudgetCalculatorAnswers>>(answers);

  // Update form data when answers prop changes
  useEffect(() => {
    setFormData(answers);
  }, [answers]);

  const handleFieldChange = (field: keyof BudgetCalculatorAnswers, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdditionalIncomeChange = (has: boolean, amount?: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalIncome: {
        has,
        monthlyAmount: has ? amount : undefined,
      },
    }));
  };

  const handleUpdate = () => {
    onUpdate(formData);
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData(answers); // Reset to original answers
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} ariaLabel="Project Estimation Questionnaire">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>Project Estimation Questionnaire</DialogTitle>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </DialogHeader>

      <DialogBody>
        <div className="space-y-6">
          {/* Question 1: City */}
          <div>
            <Label htmlFor="city">What city or area are you considering buying in?</Label>
            <Input
              id="city"
              value={formData.city || ""}
              onChange={(e) => handleFieldChange("city", e.target.value)}
              placeholder="e.g., Manchester"
              className="mt-1"
            />
          </div>

          {/* Question 2: Annual Income */}
          <div>
            <Label htmlFor="annualIncome">What&apos;s your total annual gross household income before taxes?</Label>
            <Input
              id="annualIncome"
              type="number"
              value={formData.annualIncome || ""}
              onChange={(e) => handleFieldChange("annualIncome", parseFloat(e.target.value) || 0)}
              placeholder="e.g., 60000"
              className="mt-1"
            />
          </div>

          {/* Question 3: Additional Income */}
          <div>
            <Label>Do you have any additional sources of regular income?</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="additionalIncomeYes"
                  name="additionalIncome"
                  checked={formData.additionalIncome?.has === true}
                  onChange={() => handleAdditionalIncomeChange(true, formData.additionalIncome?.monthlyAmount)}
                />
                <Label htmlFor="additionalIncomeYes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="additionalIncomeNo"
                  name="additionalIncome"
                  checked={formData.additionalIncome?.has === false}
                  onChange={() => handleAdditionalIncomeChange(false)}
                />
                <Label htmlFor="additionalIncomeNo" className="font-normal cursor-pointer">No</Label>
              </div>
              {formData.additionalIncome?.has && (
                <div className="ml-6">
                  <Label htmlFor="additionalIncomeAmount">Monthly amount (£)</Label>
                  <Input
                    id="additionalIncomeAmount"
                    type="number"
                    value={formData.additionalIncome.monthlyAmount || ""}
                    onChange={(e) =>
                      handleAdditionalIncomeChange(true, parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g., 400"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Question 4: Credit Score */}
          <div>
            <Label htmlFor="creditScore">What&apos;s your credit score or range?</Label>
            <Input
              id="creditScore"
              value={formData.creditScore?.toString() || ""}
              onChange={(e) => {
                const value = e.target.value;
                // Try to parse as number, otherwise keep as string
                const numValue = parseInt(value);
                handleFieldChange("creditScore", isNaN(numValue) ? value : numValue);
              }}
              placeholder="e.g., Good or 700"
              className="mt-1"
            />
          </div>

          {/* Question 5: Down Payment */}
          <div>
            <Label htmlFor="downPayment">How much have you saved for a down payment?</Label>
            <Input
              id="downPayment"
              type="number"
              value={formData.downPayment || ""}
              onChange={(e) => handleFieldChange("downPayment", parseFloat(e.target.value) || 0)}
              placeholder="e.g., 25000"
              className="mt-1"
            />
          </div>

          {/* Question 6: Monthly Debt Payments */}
          <div>
            <Label htmlFor="monthlyDebtPayments">What are your monthly debt payments?</Label>
            <Input
              id="monthlyDebtPayments"
              type="number"
              value={formData.monthlyDebtPayments || ""}
              onChange={(e) => handleFieldChange("monthlyDebtPayments", parseFloat(e.target.value) || 0)}
              placeholder="e.g., 300"
              className="mt-1"
            />
          </div>

          {/* Question 7: Max Monthly Payment */}
          <div>
            <Label htmlFor="maxMonthlyPayment">Do you have a maximum monthly housing payment you&apos;d like to stay under?</Label>
            <Input
              id="maxMonthlyPayment"
              type="number"
              value={formData.maxMonthlyPayment || ""}
              onChange={(e) => handleFieldChange("maxMonthlyPayment", parseFloat(e.target.value) || undefined)}
              placeholder="e.g., 1000 (optional)"
              className="mt-1"
            />
          </div>

          {/* Question 8: Loan Term */}
          <div>
            <Label htmlFor="loanTerm">What loan term are you most comfortable with? (years)</Label>
            <Input
              id="loanTerm"
              type="number"
              value={formData.loanTerm || ""}
              onChange={(e) => handleFieldChange("loanTerm", parseInt(e.target.value) || 0)}
              placeholder="e.g., 30"
              className="mt-1"
            />
          </div>

          {/* Question 9: Property Tax Rate */}
          <div>
            <Label htmlFor="propertyTaxRate">Property tax rate (percentage, optional)</Label>
            <Input
              id="propertyTaxRate"
              type="number"
              step="0.01"
              value={formData.propertyTaxRate ? formData.propertyTaxRate * 100 : ""}
              onChange={(e) =>
                handleFieldChange("propertyTaxRate", parseFloat(e.target.value) ? parseFloat(e.target.value) / 100 : undefined)
              }
              placeholder="e.g., 0.4 (optional)"
              className="mt-1"
            />
          </div>

          {/* Question 10: Property Type */}
          <div>
            <Label htmlFor="propertyType">Property type preference (optional)</Label>
            <Input
              id="propertyType"
              value={formData.propertyType || ""}
              onChange={(e) => handleFieldChange("propertyType", e.target.value)}
              placeholder="e.g., House, Flat, etc."
              className="mt-1"
            />
          </div>

          {/* Question 11: First Time Buyer */}
          <div>
            <Label>Are you a first-time buyer?</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="firstTimeBuyerYes"
                  name="firstTimeBuyer"
                  checked={formData.isFirstTimeBuyer === true}
                  onChange={() => handleFieldChange("isFirstTimeBuyer", true)}
                />
                <Label htmlFor="firstTimeBuyerYes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="firstTimeBuyerNo"
                  name="firstTimeBuyer"
                  checked={formData.isFirstTimeBuyer === false}
                  onChange={() => handleFieldChange("isFirstTimeBuyer", false)}
                />
                <Label htmlFor="firstTimeBuyerNo" className="font-normal cursor-pointer">No</Label>
              </div>
            </div>
          </div>

          {/* Question 12: Additional Context */}
          <div>
            <Label htmlFor="additionalContext">Any additional context or information? (optional)</Label>
            <Input
              id="additionalContext"
              value={formData.additionalContext || ""}
              onChange={(e) => handleFieldChange("additionalContext", e.target.value)}
              placeholder="Any other relevant information..."
              className="mt-1"
            />
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={handleClose}
          className="font-gill-sans-light"
        >
          Close
        </Button>
        <Button
          onClick={handleUpdate}
          className="bg-primary hover:bg-primary/90 text-white font-gill-sans-light"
        >
          Update Estimate
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

