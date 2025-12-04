/**
 * Budget Calculator Type Definitions
 * 
 * Defines the data structures for the AI-led mortgage calculator
 */

export interface AdditionalIncome {
  has: boolean;
  monthlyAmount?: number;
}

export interface BudgetCalculatorAnswers {
  // Question 1: Location
  city: string;
  
  // Question 2: Annual Income
  annualIncome: number;
  
  // Question 3: Additional Income
  additionalIncome: AdditionalIncome;
  
  // Question 4: Credit Score
  creditScore: string | number; // "Poor" | "Fair" | "Good" | "Very Good" | "Excellent" OR numeric score
  
  // Question 5: Down Payment
  downPayment: number;
  
  // Question 6: Monthly Debt Payments
  monthlyDebtPayments: number;
  
  // Question 7: Maximum Monthly Payment Preference
  maxMonthlyPayment?: number;
  
  // Question 8: Loan Term
  loanTerm: number; // in years
  
  // Question 9: Property Tax Rate
  propertyTaxRate?: number; // percentage, optional - defaults to local average
  
  // Question 10: Property Type Preference (TBD - inferred from conversation)
  propertyType?: string;
  
  // Question 11: First Time Buyer Status (TBD - inferred from conversation)
  isFirstTimeBuyer?: boolean;
  
  // Question 12: Additional Context (TBD - any other relevant info)
  additionalContext?: string;
}

export interface MortgageCalculationResult {
  estimatedMonthlyPaymentRange: {
    min: number;
    max: number;
  };
  propertyPriceEstimate?: number;
  loanAmount?: number;
  interestRate?: number;
  monthlyPrincipalAndInterest?: {
    min: number;
    max: number;
  };
  monthlyPropertyTax?: number;
  monthlyInsurance?: number;
  totalMonthlyPayment?: {
    min: number;
    max: number;
  };
  calculatedAt: Date;
  assumptions?: {
    creditScoreUsed?: string | number;
    interestRateUsed?: number;
    propertyTaxRateUsed?: number;
    insuranceEstimate?: number;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  questionNumber?: number; // 1-12
  extractedData?: Partial<BudgetCalculatorAnswers>; // Structured data parsed from message
}

export interface BudgetCalculatorSession {
  id: string;
  answers: Partial<BudgetCalculatorAnswers>;
  chatHistory: ChatMessage[];
  currentQuestion: number; // 1-12, 0 means not started
  isComplete: boolean;
  calculationResult: MortgageCalculationResult | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCalculatorApiRequest {
  message: string;
  sessionId: string;
  answers: Partial<BudgetCalculatorAnswers>;
  chatHistory?: ChatMessage[];
}

export interface BudgetCalculatorApiResponse {
  response: string;
  answers: Partial<BudgetCalculatorAnswers>;
  questionNumber: number;
  isComplete: boolean;
  calculationResult?: MortgageCalculationResult;
  extractedData?: Partial<BudgetCalculatorAnswers>;
  showForm?: boolean; // Show form artifact after 5 questions
}

// Question flow constants
export const TOTAL_QUESTIONS = 5; // Demo: reduced to 5 questions

export const QUESTION_FIELDS: (keyof BudgetCalculatorAnswers)[] = [
  'city',
  'annualIncome',
  'additionalIncome',
  'creditScore',
  'downPayment',
  'monthlyDebtPayments',
  'maxMonthlyPayment',
  'loanTerm',
  'propertyTaxRate',
  'propertyType',
  'isFirstTimeBuyer',
  'additionalContext',
];

export const CREDIT_SCORE_RANGES = {
  'Poor': { min: 300, max: 579 },
  'Fair': { min: 580, max: 669 },
  'Good': { min: 670, max: 739 },
  'Very Good': { min: 740, max: 799 },
  'Excellent': { min: 800, max: 850 },
} as const;

export type CreditScoreCategory = keyof typeof CREDIT_SCORE_RANGES;

