"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BudgetIntroScreen from "@/components/budget-intro-screen";
import BudgetProgressIndicator from "@/components/budget-progress-indicator";
import BudgetResultsPanel from "@/components/budget-results-panel";
import BudgetFormModal from "@/components/budget-form-modal";
import BudgetFormArtifact from "@/components/budget-form-artifact";
import VoiceInputButton from "@/components/voice-input-button";
import ChatMessage from "@/components/chat-message";
import type {
  BudgetCalculatorAnswers,
  MortgageCalculationResult,
  ChatMessage as BudgetChatMessage,
  BudgetCalculatorApiResponse,
} from "@/lib/types/budget-calculator";
import { TOTAL_QUESTIONS } from "@/lib/types/budget-calculator";

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `budget-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTimestamp(timestamp: Date) {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const SESSION_STORAGE_KEY = "ht.budget.session";

export default function BudgetCalculatorChat() {
  const [showIntro, setShowIntro] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Partial<BudgetCalculatorAnswers>>({});
  const [chatHistory, setChatHistory] = useState<BudgetChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [calculationResult, setCalculationResult] =
    useState<MortgageCalculationResult | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showFormArtifact, setShowFormArtifact] = useState(false);
  const [sessionId] = useState(() => {
    // Try to load existing session
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        try {
          const session = JSON.parse(stored);
          return session.id || generateId();
        } catch {
          return generateId();
        }
      }
    }
    return generateId();
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const isAutoScrollLockedRef = useRef(false);
  const pointerInteractingRef = useRef(false);

  const AUTO_SCROLL_THRESHOLD_PX = 96;

  // Load session from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.id === sessionId) {
          setAnswers(session.answers || {});
          setChatHistory(session.chatHistory || []);
          setCurrentQuestion(session.currentQuestion || 0);
          setIsComplete(session.isComplete || false);
          setCalculationResult(session.calculationResult || null);
          setShowIntro(session.chatHistory?.length === 0);
          // Show form artifact if we have 5 questions but not complete
          const hasFive =
            !!session.answers?.city &&
            !!session.answers?.annualIncome &&
            session.answers?.additionalIncome !== undefined &&
            session.answers?.creditScore !== undefined &&
            !!session.answers?.downPayment;
          setShowFormArtifact(hasFive && !session.isComplete);
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      }
    }
  }, [sessionId]);

  // Save session to localStorage whenever state changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const session = {
      id: sessionId,
      answers,
      chatHistory,
      currentQuestion,
      isComplete,
      calculationResult,
      showFormArtifact,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  }, [
    sessionId,
    answers,
    chatHistory,
    currentQuestion,
    isComplete,
    calculationResult,
    showFormArtifact,
  ]);

  // Smart scroll handler - only scroll if user is near bottom
  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport || isAutoScrollLockedRef.current) return;

    const isNearBottom = () => {
      const distanceFromBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      return distanceFromBottom <= AUTO_SCROLL_THRESHOLD_PX;
    };

    if (isNearBottom()) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "auto",
      });
    }
  }, [chatHistory, isLoading]);

  // Setup scroll lock detection
  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport) return;

    const isNearBottom = () => {
      const distanceFromBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      return distanceFromBottom <= AUTO_SCROLL_THRESHOLD_PX;
    };

    const updateLockFromPosition = () => {
      if (pointerInteractingRef.current) return;
      isAutoScrollLockedRef.current = !isNearBottom();
    };

    const handleScroll = () => {
      if (pointerInteractingRef.current) return;
      updateLockFromPosition();
    };

    const handlePointerDown = () => {
      pointerInteractingRef.current = true;
      isAutoScrollLockedRef.current = true;
    };

    const handlePointerUp = () => {
      pointerInteractingRef.current = false;
      updateLockFromPosition();
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    viewport.addEventListener("pointerdown", handlePointerDown);
    viewport.addEventListener("pointerup", handlePointerUp);
    viewport.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    updateLockFromPosition();

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      viewport.removeEventListener("pointerdown", handlePointerDown);
      viewport.removeEventListener("pointerup", handlePointerUp);
      viewport.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  const handleGetStarted = () => {
    setShowIntro(false);
    // Send initial greeting message
    handleSendMessage("Hello, I'd like to get started!");
  };

  const handleSendMessage = async (messageOverride?: string) => {
    const message = messageOverride || inputValue.trim();
    if (!message && !messageOverride) return;

    if (!messageOverride) {
      setInputValue("");
    }

    setIsLoading(true);
    setError(null);

    // Add user message to chat history
    const userMessage: BudgetChatMessage = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: new Date(),
      questionNumber: currentQuestion,
    };

    setChatHistory((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/budget-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId,
          answers,
          chatHistory: chatHistory.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            questionNumber: msg.questionNumber,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data: BudgetCalculatorApiResponse = await response.json();

      // Update answers - merge with existing to preserve all data
      const mergedAnswers = { ...answers, ...data.answers };
      setAnswers(mergedAnswers);
      setCurrentQuestion(data.questionNumber);
      setIsComplete(data.isComplete);

      // Show form artifact after 5 questions
      if (data.showForm) {
        setShowFormArtifact(true);
      }

      // Add AI response to chat history
      const aiMessage: BudgetChatMessage = {
        id: generateId(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        questionNumber: data.questionNumber,
        extractedData: data.extractedData,
      };

      setChatHistory((prev) => [...prev, aiMessage]);

      // If complete, set calculation result
      if (data.isComplete && data.calculationResult) {
        setCalculationResult(data.calculationResult);
        setShowFormArtifact(false); // Hide form once calculation is done
        console.log("Budget calculation complete!", {
          answers: mergedAnswers,
          result: data.calculationResult,
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSave = async () => {
    if (!calculationResult) return;

    try {
      // Format chat history for saving
      const formattedChatHistory = chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      const noteData = {
        title: `Mortgage Calculations - ${answers.city || "Unknown Location"}`,
        excerpt: `Estimated monthly payment: £${calculationResult.estimatedMonthlyPaymentRange.min.toLocaleString()} – £${calculationResult.estimatedMonthlyPaymentRange.max.toLocaleString()}/month`,
        content: {
          type: "budget-calculator",
          answers,
          calculationResult,
          chatHistory: formattedChatHistory,
          sessionId,
        },
        type: "budget-calculator",
      };

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      const result = await response.json();

      // Save to localStorage
      if (typeof window !== "undefined") {
        const notesKey = "ht.notes";
        const existingNotes = localStorage.getItem(notesKey);
        const notes = existingNotes ? JSON.parse(existingNotes) : [];
        notes.unshift(result.note); // Add to beginning
        localStorage.setItem(notesKey, JSON.stringify(notes));
      }

      // Show success and navigate to notes
      alert("Budget scenario and chat saved to Notes!");
      // Optionally navigate to notes page
      window.location.href = "/notes";
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save. Please try again.");
    }
  };

  const handleEditAnswers = () => {
    setShowFormModal(true);
  };

  const handleSaveConversationToNotes = async (
    allMessages: Array<{ role: string; content: string; timestamp?: string }>
  ) => {
    if (!allMessages || allMessages.length === 0) return;

    try {
      // Create conversation text
      const conversationText = allMessages
        .map((msg) => {
          const roleLabel = msg.role === "user" ? "You" : "HomeTruth";
          const timestamp = msg.timestamp ? ` [${msg.timestamp}]` : "";
          return `${roleLabel}${timestamp}: ${msg.content}`;
        })
        .join("\n\n");

      // Get first user message for title
      const firstUserMessage = allMessages.find((msg) => msg.role === "user");
      const title = firstUserMessage
        ? `Budget Calculator - ${firstUserMessage.content.slice(0, 40)}${
            firstUserMessage.content.length > 40 ? "..." : ""
          }`
        : "Budget Calculator Conversation";

      // Get last assistant message for excerpt
      const lastAssistantMessage = [...allMessages]
        .reverse()
        .find((msg) => msg.role === "assistant");
      const excerpt = lastAssistantMessage
        ? lastAssistantMessage.content.slice(0, 150) +
          (lastAssistantMessage.content.length > 150 ? "..." : "")
        : conversationText.slice(0, 150);

      const noteData = {
        title,
        excerpt,
        content: {
          type: "budget-calculator-chat",
          conversation: allMessages,
          conversationText,
          answers,
          calculationResult: calculationResult || undefined,
          timestamp: Date.now(),
        },
        type: "budget-calculator-chat",
      };

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      const result = await response.json();

      // Save to localStorage
      if (typeof window !== "undefined") {
        const notesKey = "ht.notes";
        const existingNotes = localStorage.getItem(notesKey);
        const notes = existingNotes ? JSON.parse(existingNotes) : [];
        notes.unshift(result.note); // Add to beginning
        localStorage.setItem(notesKey, JSON.stringify(notes));
      }

      alert("Conversation saved to Notes!");
    } catch (err) {
      console.error("Error saving conversation to notes:", err);
      alert("Failed to save. Please try again.");
    }
  };

  const handleFormUpdate = (
    updatedAnswers: Partial<BudgetCalculatorAnswers>
  ) => {
    setAnswers(updatedAnswers);

    // Check if we have all required fields for calculation
    if (
      updatedAnswers.city &&
      updatedAnswers.annualIncome &&
      updatedAnswers.additionalIncome !== undefined &&
      updatedAnswers.creditScore !== undefined &&
      updatedAnswers.downPayment &&
      updatedAnswers.monthlyDebtPayments !== undefined &&
      updatedAnswers.loanTerm
    ) {
      setIsComplete(true);
      // Import and call calculation function
      import("@/lib/mortgage-calculator").then(
        ({ calculateMortgageEstimate }) => {
          try {
            const result = calculateMortgageEstimate(
              updatedAnswers as BudgetCalculatorAnswers
            );
            setCalculationResult(result);
            setShowFormArtifact(false);
          } catch (err) {
            console.error("Calculation error:", err);
          }
        }
      );
    }
  };

  if (showIntro) {
    return <BudgetIntroScreen onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <h1 className="type-h2 text-gray-900">Mortgage Calculations</h1>
        </div>

        {/* Chat Messages Area */}
        <div
          ref={messagesViewportRef}
          className="flex-1 p-6 pb-32 space-y-4 bg-gray-50 relative"
        >
          {/* Progress Indicator */}
          {!isComplete && currentQuestion > 0 && (
            <BudgetProgressIndicator
              currentQuestion={currentQuestion}
              totalQuestions={TOTAL_QUESTIONS}
            />
          )}

          {/* Chat Messages */}
          {chatHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 font-gill-sans-light">
              Start a conversation to see answers here.
            </div>
          ) : (
            <>
              {chatHistory.map((message, index) => (
                <div key={message.id}>
                  <ChatMessage
                    type={message.role === "user" ? "user" : "ai"}
                    content={message.content}
                    timestamp={formatTimestamp(message.timestamp)}
                    showCopyButton={
                      message.role === "assistant" && Boolean(message.content)
                    }
                    conversationMessages={chatHistory.map((msg) => ({
                      role: msg.role,
                      content: msg.content,
                      timestamp: formatTimestamp(msg.timestamp),
                    }))}
                    onSaveConversationToNotes={handleSaveConversationToNotes}
                    onSaveToNotes={(content, sources) => {
                      // Note saved, could show notification
                      console.log("Note saved from budget calculator:", {
                        content,
                        sources,
                      });
                    }}
                  />
                  {/* Show form artifact after the last assistant message when showFormArtifact is true */}
                  {message.role === "assistant" &&
                    showFormArtifact &&
                    index === chatHistory.length - 1 && (
                      <div className="mt-2">
                        <BudgetFormArtifact
                          answers={answers}
                          onUpdate={handleFormUpdate}
                        />
                      </div>
                    )}
                </div>
              ))}
            </>
          )}

          {error && (
            <div className="text-red-500 text-sm font-gill-sans-light">
              {error}
            </div>
          )}

          {/* Results Panel */}
          {isComplete && calculationResult && (
            <BudgetResultsPanel
              calculationResult={calculationResult}
              onSave={handleSave}
              onEditAnswers={handleEditAnswers}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isComplete && (
          <div className="sticky bottom-0 z-10 bg-gray-50 p-3 sm:p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-lg">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message"
                  className="flex-1 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-gray-50/50 font-gill-sans-light"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <VoiceInputButton
                  onTranscribe={(text) => {
                    setInputValue(text);
                    setTimeout(() => {
                      handleSendMessage(text);
                    }, 100);
                  }}
                  disabled={isLoading}
                />
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 rounded-full w-10 h-10 p-0"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <BudgetFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        answers={answers}
        onUpdate={handleFormUpdate}
      />
    </div>
  );
}
