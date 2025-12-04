/**
 * Mortgage Calculator Engine
 * 
 * Calculates UK mortgage estimates based on user inputs
 */

import type {
  BudgetCalculatorAnswers,
  MortgageCalculationResult,
  CreditScoreCategory,
} from './types/budget-calculator';

// UK average interest rates by credit score (as of 2024)
const INTEREST_RATE_MAP: Record<CreditScoreCategory, { min: number; max: number }> = {
  'Poor': { min: 6.5, max: 8.0 },
  'Fair': { min: 5.5, max: 6.5 },
  'Good': { min: 4.5, max: 5.5 },
  'Very Good': { min: 3.8, max: 4.5 },
  'Excellent': { min: 3.2, max: 3.8 },
};

// UK average property tax rates by region (council tax bands)
const UK_AVERAGE_PROPERTY_TAX_RATE = 0.004; // 0.4% annually (varies by location)

// Average home insurance cost (monthly)
const AVERAGE_MONTHLY_INSURANCE = 50; // £50/month estimate

// Maximum debt-to-income ratio for mortgage approval (UK standard)
const MAX_DEBT_TO_INCOME_RATIO = 0.45; // 45%

/**
 * Convert credit score string or number to category
 */
function getCreditScoreCategory(
  creditScore: string | number
): CreditScoreCategory {
  if (typeof creditScore === 'number') {
    if (creditScore >= 800) return 'Excellent';
    if (creditScore >= 740) return 'Very Good';
    if (creditScore >= 670) return 'Good';
    if (creditScore >= 580) return 'Fair';
    return 'Poor';
  }

  // String category
  const category = creditScore as CreditScoreCategory;
  if (category in INTEREST_RATE_MAP) {
    return category;
  }

  // Default to Good if unclear
  return 'Good';
}

/**
 * Get interest rate range based on credit score
 */
function getInterestRateRange(
  creditScore: string | number
): { min: number; max: number } {
  const category = getCreditScoreCategory(creditScore);
  return INTEREST_RATE_MAP[category];
}

/**
 * Estimate property price based on income and location
 * This is a simplified estimation - in production, you'd use actual market data
 */
function estimatePropertyPrice(
  annualIncome: number,
  additionalIncomeMonthly: number,
  city: string
): number {
  // Calculate total annual income
  const totalAnnualIncome = annualIncome + additionalIncomeMonthly * 12;

  // UK mortgage lenders typically offer 4-5x annual income
  // Use conservative 4.5x multiplier
  const maxLoanAmount = totalAnnualIncome * 4.5;

  // Estimate property price (loan + typical down payment)
  // Assume 10-20% down payment, so property = loan / (1 - downPayment%)
  // Using 15% average down payment
  const estimatedPropertyPrice = maxLoanAmount / 0.85;

  // Apply location multiplier (simplified - Manchester might be different from London)
  // In production, use actual market data API
  const locationMultiplier = city.toLowerCase().includes('london') ? 1.5 : 1.0;

  return Math.round(estimatedPropertyPrice * locationMultiplier);
}

/**
 * Calculate monthly mortgage payment using standard formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 * M = Monthly payment
 * P = Principal (loan amount)
 * r = Monthly interest rate
 * n = Number of payments (months)
 */
function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  loanTermYears: number
): number {
  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return monthlyPayment;
}

/**
 * Calculate property tax (council tax) monthly payment
 */
function calculateMonthlyPropertyTax(
  propertyPrice: number,
  propertyTaxRate?: number
): number {
  const rate = propertyTaxRate ?? UK_AVERAGE_PROPERTY_TAX_RATE;
  // Property tax is annual, convert to monthly
  return (propertyPrice * rate) / 12;
}

/**
 * Validate debt-to-income ratio
 */
function validateDebtToIncomeRatio(
  annualIncome: number,
  additionalIncomeMonthly: number,
  monthlyDebtPayments: number,
  estimatedMonthlyPayment: number
): boolean {
  const totalAnnualIncome = annualIncome + additionalIncomeMonthly * 12;
  const totalMonthlyDebt = monthlyDebtPayments + estimatedMonthlyPayment;
  const debtToIncomeRatio = (totalMonthlyDebt * 12) / totalAnnualIncome;

  return debtToIncomeRatio <= MAX_DEBT_TO_INCOME_RATIO;
}

/**
 * Main calculation function
 */
export function calculateMortgageEstimate(
  answers: BudgetCalculatorAnswers
): MortgageCalculationResult {
  const {
    city,
    annualIncome,
    additionalIncome,
    creditScore,
    downPayment,
    monthlyDebtPayments,
    loanTerm,
    propertyTaxRate,
  } = answers;

  // Get interest rate range based on credit score
  const interestRateRange = getInterestRateRange(creditScore);
  const additionalIncomeMonthly = additionalIncome?.has
    ? additionalIncome.monthlyAmount ?? 0
    : 0;

  // Estimate property price
  const propertyPriceEstimate = estimatePropertyPrice(
    annualIncome,
    additionalIncomeMonthly,
    city
  );

  // Calculate loan amount
  const loanAmount = Math.max(0, propertyPriceEstimate - downPayment);

  // Calculate monthly payments for min and max interest rates
  const monthlyPaymentMin = calculateMonthlyPayment(
    loanAmount,
    interestRateRange.min,
    loanTerm
  );
  const monthlyPaymentMax = calculateMonthlyPayment(
    loanAmount,
    interestRateRange.max,
    loanTerm
  );

  // Calculate property tax
  const monthlyPropertyTaxMin = calculateMonthlyPropertyTax(
    propertyPriceEstimate,
    propertyTaxRate
  );
  const monthlyPropertyTaxMax = monthlyPropertyTaxMin; // Same for both

  // Add insurance
  const monthlyInsurance = AVERAGE_MONTHLY_INSURANCE;

  // Calculate total monthly payment ranges
  const totalMonthlyMin =
    monthlyPaymentMin + monthlyPropertyTaxMin + monthlyInsurance;
  const totalMonthlyMax =
    monthlyPaymentMax + monthlyPropertyTaxMax + monthlyInsurance;

  // Validate affordability
  const isAffordableMin = validateDebtToIncomeRatio(
    annualIncome,
    additionalIncomeMonthly,
    monthlyDebtPayments,
    totalMonthlyMin
  );
  const isAffordableMax = validateDebtToIncomeRatio(
    annualIncome,
    additionalIncomeMonthly,
    monthlyDebtPayments,
    totalMonthlyMax
  );

  // If not affordable, adjust estimate upward (user may need to adjust expectations)
  const finalMin = isAffordableMin ? totalMonthlyMin : totalMonthlyMin * 1.1;
  const finalMax = isAffordableMax ? totalMonthlyMax : totalMonthlyMax * 1.1;

  return {
    estimatedMonthlyPaymentRange: {
      min: Math.round(finalMin),
      max: Math.round(finalMax),
    },
    propertyPriceEstimate: Math.round(propertyPriceEstimate),
    loanAmount: Math.round(loanAmount),
    interestRate: (interestRateRange.min + interestRateRange.max) / 2,
    monthlyPrincipalAndInterest: {
      min: Math.round(monthlyPaymentMin),
      max: Math.round(monthlyPaymentMax),
    },
    monthlyPropertyTax: Math.round(monthlyPropertyTaxMin),
    monthlyInsurance,
    totalMonthlyPayment: {
      min: Math.round(finalMin),
      max: Math.round(finalMax),
    },
    calculatedAt: new Date(),
    assumptions: {
      creditScoreUsed: creditScore,
      interestRateUsed: (interestRateRange.min + interestRateRange.max) / 2,
      propertyTaxRateUsed: propertyTaxRate ?? UK_AVERAGE_PROPERTY_TAX_RATE,
      insuranceEstimate: AVERAGE_MONTHLY_INSURANCE,
    },
  };
}

