"use client";

import AppLayout from "@/components/layouts/app-layout";
import BudgetCalculatorChat from "@/components/budget-calculator-chat";

export default function BudgetPage() {
  return (
    <AppLayout>
      <div className="flex flex-col flex-1 min-h-0">
        <BudgetCalculatorChat />
      </div>
    </AppLayout>
  );
}

