"use client";

interface BudgetProgressIndicatorProps {
  currentQuestion: number;
  totalQuestions: number;
}

export default function BudgetProgressIndicator({
  currentQuestion,
  totalQuestions,
}: BudgetProgressIndicatorProps) {
  const questionsRemaining = Math.max(0, totalQuestions - currentQuestion);
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="mb-4 space-y-2">
      {/* Progress Text */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-gill-sans-light">
          {questionsRemaining > 0
            ? `${questionsRemaining}/${totalQuestions} more quick questions to go!`
            : "All questions answered!"}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}

