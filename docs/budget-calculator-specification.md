# Budget Calculator / Mortgage Calculations - Detailed Specification

## Overview
The Budget Calculator is an AI-powered mortgage affordability tool that guides users through a conversational questionnaire to estimate their monthly mortgage payment range. The feature combines a chat-based interface with a structured form modal for editing answers.

## User Flow

### 1. Entry Point
- **Location**: Accessible via sidebar navigation ("Budget Calculator" menu item)
- **Initial State**: Introduction screen with AI Financial Advisor greeting
- **Purpose**: Explain the tool's value proposition and invite user to begin

### 2. Introduction Screen
**Components:**
- Title: "Mortgage Calculations"
- AI Introduction: "Hi, I'm your AI Financial Advisor!"
- Description: "Let's work together to estimate what kind of real estate best fits your lifestyle and budget. I'm here to help you understand what's affordable and guide you toward smart, confident financial decisions."
- Prompt Box: Light gray box with instructional text: "To help estimate your home affordability, please share a few details like your location, income, credit score, down payment, and debts..."
- Action Button: Circular blue arrow button (proceeds to chat interface)

### 3. Chat-Based Questionnaire
**Interface Type**: Conversational chat interface similar to main chat feature

**Progress Tracking:**
- Progress bar (red/yellow indicator)
- Text indicator: "X/12 more quick questions to go!" (where X decreases as questions are answered)

**Question Flow (12 Questions Total):**

1. **City/Area**
   - Question: "What city or area are you considering buying in?"
   - Input: Free text
   - Example: "I'm looking to buy in Manchester."

2. **Annual Income**
   - Question: "What's your total annual gross household income before taxes?"
   - Input: Numeric value
   - Example: "Around £60,000"

3. **Additional Income**
   - Question: "Do you have any additional sources of regular income (like freelance work, rental income, etc.)?"
   - Input: Yes/No + amount if yes
   - Example: "Yes, I earn about £400 per month from freelance design work."

4. **Credit Score**
   - Question: "What's your credit score or range? (Options: Poor, Fair, Good, Very Good, Excellent)"
   - Input: Selection or numeric value
   - Example: "I'd say Good — around 700."

5. **Down Payment**
   - Question: "How much have you saved for a down payment?"
   - Input: Numeric value
   - Example: "£25,000"

6. **Monthly Debt Payments**
   - Question: "What are your monthly debt payments (credit cards, car loan, student loan, etc.)?"
   - Input: Numeric value
   - Example: "About £300 a month — mostly my car loan."

7. **Maximum Monthly Payment**
   - Question: "Do you have a maximum monthly housing payment you'd like to stay under?"
   - Input: Numeric value
   - Example: "I'd prefer to keep it below £1,000 if possible"

8. **Loan Term**
   - Question: "What loan term are you most comfortable with? (e.g., 30 years, 25 years)"
   - Input: Numeric value (years)
   - Example: "30 years is fine."

9. **Property Tax Rate**
   - Question: "Do you know the property tax rate for [City]? (If not, I'll use the local average.)"
   - Input: Optional numeric value or skip
   - Default: Uses local average if not provided

10-12. **Additional Questions** (not fully visible in screenshots, but implied by 12-question total)

**Chat Interface Features:**
- AI messages: Left-aligned, blue bubbles
- User messages: Right-aligned, white bubbles
- Timestamps: Displayed for each message (e.g., "11:45 PM")
- Input field: Sticky at bottom with "Type your message" placeholder
- Send button: Paper airplane icon
- "Get my estimate" button: Blue button, appears during/after questionnaire

### 4. Results Display
**After All Questions Answered:**
- **Estimated Monthly Payment Range**: Displayed prominently
  - Format: "£880 – £940/month"
  - Styling: Light pink/red background panel
  - Text: "Estimated Monthly Payment Range:" (standard font)
  - Range: Large, bold, dark red font

**Action Buttons:**
- **"Save"**: Blue button with white text (left-aligned)
- **"Edit My Answers"**: White button with blue text (right-aligned)

### 5. Edit Mode - Project Estimation Questionnaire Modal
**Trigger**: "Edit My Answers" button

**Modal Features:**
- Title: "Project Estimation Questionnaire"
- Close button: "X" icon (top right)
- Form layout: All 12 questions displayed as form fields
- Pre-population: All answers from chat conversation are pre-filled
- Editable: User can modify any answer directly in form fields

**Form Fields:**
- Each question has a corresponding input field
- Fields show the user's previous answers
- Format matches chat conversation answers

**Modal Actions:**
- **"Update Estimate"**: Blue button (updates calculation with new values)
- **"Close"**: White button (closes modal without saving)

## Functional Requirements

### FR1: Question Flow Management
- System must track which question number user is on (1-12)
- Progress indicator must update in real-time
- Questions must be asked sequentially
- User can answer questions in natural language
- System must parse and extract structured data from user responses

### FR2: Data Collection
**Required Fields:**
- City/Area (string)
- Annual gross household income (numeric, currency)
- Additional income sources (boolean + amount if yes)
- Credit score/range (enum: Poor, Fair, Good, Very Good, Excellent OR numeric)
- Down payment amount (numeric, currency)
- Monthly debt payments (numeric, currency)
- Maximum monthly payment preference (numeric, currency, optional)
- Loan term (numeric, years)
- Property tax rate (numeric, percentage, optional - defaults to local average)

**Optional Fields:**
- Additional questions (3 more questions implied by 12 total)

### FR3: Calculation Engine
- Must calculate monthly mortgage payment range based on:
  - Property price (derived from location + affordability)
  - Down payment amount
  - Loan term
  - Interest rate (derived from credit score)
  - Property tax rate (user-provided or local average)
  - Monthly debt obligations
- Must provide a range (e.g., £880 – £940/month) rather than single value
- Must account for:
  - Debt-to-income ratio
  - Credit score impact on interest rates
  - Local property tax rates
  - Insurance estimates

### FR4: Chat Interface
- Must support natural language input
- Must display conversation history
- Must show AI responses with appropriate formatting
- Must show user responses with appropriate formatting
- Input box must be sticky to bottom of chat area
- Must handle multi-turn conversations
- Must validate inputs and ask for clarification if needed

### FR5: Progress Tracking
- Must display current question number (X/12)
- Must show visual progress bar
- Must update progress as questions are answered
- Must persist progress if user navigates away and returns

### FR6: Results Display
- Must display estimated monthly payment range prominently
- Must format currency values correctly (£ symbol, comma separators)
- Must provide clear call-to-action buttons
- Must allow user to save results
- Must allow user to edit answers and recalculate

### FR7: Edit Functionality
- Must open modal with all questions and answers pre-filled
- Must allow editing of any field
- Must recalculate estimate when "Update Estimate" is clicked
- Must close modal without saving if "Close" is clicked
- Must maintain chat history when returning from edit mode

### FR8: Data Persistence
- Must save user's answers (session or user account)
- Must save calculation results
- Must allow retrieval of previous calculations
- Must maintain chat history

## UI/UX Requirements

### UI1: Layout
- **Sidebar Navigation**: Budget Calculator item highlighted when active
- **Main Content Area**: White panel, full width (minus sidebar)
- **Chat Area**: Scrollable message history
- **Input Area**: Sticky to bottom with proper padding

### UI2: Visual Design
- **AI Messages**: Blue bubbles, left-aligned
- **User Messages**: White bubbles, right-aligned
- **Timestamps**: Small gray text below each message
- **Progress Bar**: Red/yellow indicator, horizontal
- **Results Panel**: Light pink/red background (#FFE5E5 or similar)
- **Buttons**: 
  - Primary: Blue background, white text
  - Secondary: White background, blue text

### UI3: Typography
- **Title**: Large, bold (type-h1 or type-h2)
- **AI Introduction**: Standard body text
- **Chat Messages**: Standard body text
- **Results Range**: Large, bold, dark red
- **Labels**: Standard font weight

### UI4: Spacing & Padding
- Input box must have white space padding from bottom of screen
- Results section must have proper spacing from chat input
- Modal must be centered with appropriate padding
- All elements must have consistent spacing

### UI5: Responsive Design
- Must work on desktop (primary)
- Must adapt to tablet sizes
- Must maintain usability on mobile (if applicable)

## Technical Requirements

### TR1: API Integration
- Chat API endpoint for conversational flow
- Calculation API endpoint for mortgage estimates
- Local property data API for tax rates and averages
- Credit score to interest rate mapping service

### TR2: State Management
- Track current question index
- Store user answers in structured format
- Maintain chat history
- Store calculation results
- Handle modal open/close state

### TR3: Data Validation
- Validate numeric inputs (income, down payment, etc.)
- Validate location inputs (city/area)
- Validate credit score ranges
- Handle invalid or unclear responses
- Request clarification when needed

### TR4: Calculation Logic
- Interest rate determination based on credit score
- Loan amount calculation (property price - down payment)
- Monthly payment calculation using standard mortgage formula
- Property tax estimation (local average or user-provided)
- Insurance estimation
- Total monthly payment range calculation

### TR5: Error Handling
- Handle API failures gracefully
- Show error messages for invalid inputs
- Allow retry for failed calculations
- Maintain user progress on errors

### TR6: Performance
- Fast response times for chat messages (< 2 seconds)
- Efficient calculation rendering (< 1 second)
- Smooth scrolling in chat area
- No lag when opening/closing modal

## Data Model

### User Response Object
```typescript
interface BudgetCalculatorResponse {
  id: string;
  sessionId: string;
  userId?: string;
  answers: {
    city: string;
    annualIncome: number;
    additionalIncome?: {
      hasAdditional: boolean;
      monthlyAmount?: number;
    };
    creditScore: string | number; // "Good" or 700
    downPayment: number;
    monthlyDebtPayments: number;
    maxMonthlyPayment?: number;
    loanTerm: number; // years
    propertyTaxRate?: number; // percentage
    // ... additional questions
  };
  calculation: {
    estimatedMonthlyPaymentRange: {
      min: number;
      max: number;
    };
    propertyPriceEstimate?: number;
    loanAmount?: number;
    interestRate?: number;
    calculatedAt: Date;
  };
  chatHistory: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Chat Message Object
```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  questionNumber?: number; // 1-12
  extractedData?: any; // Structured data parsed from message
}
```

## Integration Points

### IP1: Chat System
- Reuse existing chat container component
- Integrate with chat API route
- Use same message formatting and styling

### IP2: Navigation
- Sidebar navigation integration
- Active state highlighting
- Route: `/budget` or `/budget-calculator`

### IP3: User Context
- Access user profile data if logged in
- Pre-fill known information (if available)
- Save calculations to user account

### IP4: Property Data Service
- Integration with property data APIs
- Local tax rate lookup
- Average property price by area
- Interest rate data by credit score

## Edge Cases & Considerations

### EC1: Incomplete Responses
- User provides partial information
- User provides unclear answers
- User wants to skip questions
- Solution: AI asks clarifying questions or uses defaults

### EC2: Invalid Data
- Negative income values
- Down payment exceeds property value
- Unrealistic loan terms
- Solution: Validation and error messages

### EC3: Location Not Found
- User enters non-existent city
- Ambiguous location names
- Solution: Ask for clarification or use closest match

### EC4: User Navigation Away
- User leaves mid-questionnaire
- User closes browser
- Solution: Persist progress, allow resume

### EC5: Calculation Errors
- API failures
- Invalid calculation inputs
- Solution: Show error message, allow retry

## Future Enhancements

### FE1: Comparison Mode
- Compare multiple scenarios
- Side-by-side calculations
- "What if" scenarios

### FE2: Property Search Integration
- Link to property listings within budget
- Filter properties by calculated affordability

### FE3: Detailed Breakdown
- Show principal vs interest breakdown
- Show total cost over loan term
- Show amortization schedule

### FE4: Export & Sharing
- Export calculation as PDF
- Share calculation link
- Email results

### FE5: Historical Tracking
- Save multiple calculations
- Compare over time
- Track changes in affordability

## Acceptance Criteria

### AC1: User can start questionnaire from Budget Calculator page
### AC2: User can answer all 12 questions via chat interface
### AC3: Progress indicator updates correctly throughout questionnaire
### AC4: System calculates and displays monthly payment range accurately
### AC5: User can edit answers via modal and recalculate
### AC6: User can save calculation results
### AC7: Chat history is maintained throughout session
### AC8: Input box is properly positioned with white space padding
### AC9: Results are displayed prominently with clear actions
### AC10: Modal opens/closes smoothly with pre-filled data

