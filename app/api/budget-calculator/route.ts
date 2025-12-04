import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/openai';
import { calculateMortgageEstimate } from '@/lib/mortgage-calculator';
import type {
  BudgetCalculatorApiRequest,
  BudgetCalculatorApiResponse,
  BudgetCalculatorAnswers,
  ChatMessage,
} from '@/lib/types/budget-calculator';

const BUDGET_CALCULATOR_SYSTEM_PROMPT = `You are a friendly AI Financial Advisor helping users estimate their mortgage affordability through a natural conversation.

Your role:
- Guide users through 12 questions conversationally (don't make it feel like a form)
- Extract structured data from their natural language responses
- Be warm, reassuring, and less intimidating than traditional forms
- Ask follow-up questions if their answer is unclear
- Progress systematically through all questions

Questions to cover (in order):
1. City/Area: "What city or area are you considering buying in?"
2. Annual Income: "What's your total annual gross household income before taxes?"
3. Additional Income: "Do you have any additional sources of regular income (like freelance work, rental income, etc.)?"
4. Credit Score: "What's your credit score or range? (Options: Poor, Fair, Good, Very Good, Excellent)"
5. Down Payment: "How much have you saved for a down payment?"
6. Monthly Debt: "What are your monthly debt payments (credit cards, car loan, student loan, etc.)?"
7. Max Payment Preference: "Do you have a maximum monthly housing payment you'd like to stay under?"
8. Loan Term: "What loan term are you most comfortable with? (e.g., 30 years, 25 years)"
9. Property Tax: "Do you know the property tax rate for [city]? (If not, I'll use the local average.)"
10. Property Type: Ask about property type preference (house, flat, etc.)
11. First Time Buyer: Ask if they're a first-time buyer
12. Additional Context: Any other relevant information

After each user response:
- Extract the relevant structured data
- Acknowledge their answer warmly
- Move to the next question naturally
- If data is unclear, ask for clarification before moving on

When all questions are answered:
- Congratulate them on completing the questionnaire
- Let them know you're calculating their estimate
- Present the results warmly`;

function extractStructuredData(
  message: string,
  currentAnswers: Partial<BudgetCalculatorAnswers>,
  questionNumber: number
): Partial<BudgetCalculatorAnswers> {
  const extracted: Partial<BudgetCalculatorAnswers> = {};
  const lowerMessage = message.toLowerCase();

  // Question 1: City
  if (questionNumber === 1 || !currentAnswers.city) {
    // Extract city name (simple heuristic - in production use NLP)
    const cityMatch = message.match(/\b(?:in|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (cityMatch) {
      extracted.city = cityMatch[1];
    } else if (message.length > 3 && message.length < 50) {
      // Assume the whole message is the city if it's reasonable
      extracted.city = message.trim();
    }
  }

  // Question 2: Annual Income
  if (questionNumber === 2 || !currentAnswers.annualIncome) {
    const incomeMatch = message.match(/£?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|thousand|per\s+year|annually|annual)/i);
    if (incomeMatch) {
      let income = parseFloat(incomeMatch[1].replace(/,/g, ''));
      if (lowerMessage.includes('k') || lowerMessage.includes('thousand')) {
        income *= 1000;
      }
      extracted.annualIncome = income;
    } else {
      const numMatch = message.match(/\d{4,}/);
      if (numMatch) {
        const num = parseInt(numMatch[0]);
        if (num > 10000 && num < 1000000) {
          extracted.annualIncome = num;
        }
      }
    }
  }

  // Question 3: Additional Income
  if (questionNumber === 3 || !currentAnswers.additionalIncome) {
    if (lowerMessage.includes('yes') || lowerMessage.includes('yeah') || lowerMessage.includes('yep')) {
      extracted.additionalIncome = { has: true };
      const amountMatch = message.match(/£?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+month|monthly|pm)/i);
      if (amountMatch) {
        extracted.additionalIncome.monthlyAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
      }
    } else if (lowerMessage.includes('no') || lowerMessage.includes('none') || lowerMessage.includes('nope')) {
      extracted.additionalIncome = { has: false };
    }
  }

  // Question 4: Credit Score
  if (questionNumber === 4 || !currentAnswers.creditScore) {
    const scoreMatch = message.match(/\b(\d{3})\b/);
    if (scoreMatch) {
      extracted.creditScore = parseInt(scoreMatch[1]);
    } else if (lowerMessage.includes('excellent')) {
      extracted.creditScore = 'Excellent';
    } else if (lowerMessage.includes('very good')) {
      extracted.creditScore = 'Very Good';
    } else if (lowerMessage.includes('good')) {
      extracted.creditScore = 'Good';
    } else if (lowerMessage.includes('fair')) {
      extracted.creditScore = 'Fair';
    } else if (lowerMessage.includes('poor')) {
      extracted.creditScore = 'Poor';
    }
  }

  // Question 5: Down Payment
  if (questionNumber === 5 || !currentAnswers.downPayment) {
    const downPaymentMatch = message.match(/£?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|thousand)?/i);
    if (downPaymentMatch) {
      let amount = parseFloat(downPaymentMatch[1].replace(/,/g, ''));
      if (lowerMessage.includes('k') || lowerMessage.includes('thousand')) {
        amount *= 1000;
      }
      extracted.downPayment = amount;
    }
  }

  // Question 6: Monthly Debt Payments
  if (questionNumber === 6 || !currentAnswers.monthlyDebtPayments) {
    const debtMatch = message.match(/£?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+month|monthly|pm)/i);
    if (debtMatch) {
      extracted.monthlyDebtPayments = parseFloat(debtMatch[1].replace(/,/g, ''));
    } else {
      const numMatch = message.match(/£?\s*(\d{2,4})\b/);
      if (numMatch) {
        extracted.monthlyDebtPayments = parseFloat(numMatch[1]);
      }
    }
  }

  // Question 7: Max Monthly Payment
  if (questionNumber === 7 || !currentAnswers.maxMonthlyPayment) {
    const maxMatch = message.match(/£?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+month|monthly|pm|below|under)/i);
    if (maxMatch) {
      extracted.maxMonthlyPayment = parseFloat(maxMatch[1].replace(/,/g, ''));
    }
  }

  // Question 8: Loan Term
  if (questionNumber === 8 || !currentAnswers.loanTerm) {
    const termMatch = message.match(/(\d{2})\s*(?:years?|yrs?)/i);
    if (termMatch) {
      extracted.loanTerm = parseInt(termMatch[1]);
    }
  }

  // Question 9: Property Tax Rate
  if (questionNumber === 9 || !currentAnswers.propertyTaxRate) {
    const taxMatch = message.match(/(\d+\.?\d*)\s*%/);
    if (taxMatch) {
      extracted.propertyTaxRate = parseFloat(taxMatch[1]) / 100;
    }
  }

  return extracted;
}

function determineNextQuestion(
  answers: Partial<BudgetCalculatorAnswers>
): number {
  // Demo: Only 5 questions required
  if (!answers.city) return 1;
  if (!answers.annualIncome) return 2;
  if (!answers.additionalIncome) return 3;
  if (!answers.creditScore) return 4;
  if (!answers.downPayment) return 5;
  return 6; // All 5 questions answered - ready for form
}

function isComplete(answers: Partial<BudgetCalculatorAnswers>): boolean {
  // Demo: Only 5 questions required before showing form
  // After form is filled, we need loanTerm and monthlyDebtPayments for calculation
  return (
    !!answers.city &&
    !!answers.annualIncome &&
    answers.additionalIncome !== undefined &&
    answers.creditScore !== undefined &&
    !!answers.downPayment &&
    answers.monthlyDebtPayments !== undefined &&
    answers.loanTerm !== undefined
  );
}

function hasFiveQuestions(answers: Partial<BudgetCalculatorAnswers>): boolean {
  // Check if we have the 5 demo questions answered
  return (
    !!answers.city &&
    !!answers.annualIncome &&
    answers.additionalIncome !== undefined &&
    answers.creditScore !== undefined &&
    !!answers.downPayment
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: BudgetCalculatorApiRequest = await request.json();
    const { message, sessionId, answers: currentAnswers, chatHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Determine current question number
    const questionNumber = determineNextQuestion(currentAnswers);

    // Extract structured data from user message
    const extractedData = extractStructuredData(
      message,
      currentAnswers,
      questionNumber
    );

    // Merge extracted data with current answers
    const updatedAnswers: Partial<BudgetCalculatorAnswers> = {
      ...currentAnswers,
      ...extractedData,
    };

    // Build conversation context
    const conversationContext = chatHistory
      .slice(-10) // Last 10 messages for context
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Create prompt for AI
    const userPrompt = `Current conversation context:
${conversationContext}

User's latest message: ${message}

Current answers collected so far:
${JSON.stringify(updatedAnswers, null, 2)}

Question ${questionNumber} of 5.

${questionNumber === 1 ? 'Start by warmly greeting the user and asking about the city/area they\'re considering buying in.' : ''}
${questionNumber > 1 && questionNumber <= 5 ? `Continue the conversation naturally. Acknowledge their previous answer and ask question ${questionNumber}.` : ''}
${hasFiveQuestions(updatedAnswers) ? 'Great! You\'ve answered the 5 key questions. Let them know they can now review and edit their answers in the form, and then we\'ll calculate their mortgage estimate.' : ''}
${isComplete(updatedAnswers) ? 'All required information has been collected! Congratulate them and let them know you\'re calculating their estimate.' : ''}

Be conversational, warm, and reassuring. Don't make it feel like filling out a form.`;

    // Get AI response
    const systemPrompt = BUDGET_CALCULATOR_SYSTEM_PROMPT;
    const handle = await OpenAIService.streamChatResponse({
      question: userPrompt,
      context: [],
      systemPrompt,
      signal: request.signal,
      maxTokens: 500, // Shorter responses for conversational flow
    });

    // Collect streaming response
    let aiResponse = '';
    for await (const token of handle.stream) {
      aiResponse += token;
    }

    // Check if we have all required data
    const allComplete = isComplete(updatedAnswers);
    let calculationResult = null;

    if (allComplete) {
      // Calculate mortgage estimate
      try {
        calculationResult = calculateMortgageEstimate(
          updatedAnswers as BudgetCalculatorAnswers
        );
      } catch (error) {
        console.error('Calculation error:', error);
      }
    }

    const hasFive = hasFiveQuestions(updatedAnswers);
    
    const response: BudgetCalculatorApiResponse = {
      response: aiResponse,
      answers: updatedAnswers,
      questionNumber: hasFive ? 6 : determineNextQuestion(updatedAnswers), // 6 means ready for form
      isComplete: allComplete,
      calculationResult: calculationResult || undefined,
      extractedData,
      showForm: hasFive && !allComplete, // Show form after 5 questions, before calculation
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Budget calculator API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

