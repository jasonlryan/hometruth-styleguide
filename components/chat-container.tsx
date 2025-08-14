"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Copy, Send, History } from "lucide-react";
import ChatHistory from "@/components/chat-history";
import ChatMessage from "@/components/chat-message";
import Link from "next/link";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string | React.ReactNode;
  timestamp: string;
}

interface ChatContainerProps {
  className?: string;
  showHistory?: boolean;
  title?: string;
}

export default function ChatContainer({
  className = "",
  showHistory = true,
  title = "Ask HomeTruth",
}: ChatContainerProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "user",
      content: "What fees do I need to budget for when buying a home?",
      timestamp: "11:45 PM",
    },
    {
      id: "2",
      type: "ai",
      content: (
        <div className="space-y-3">
          <p className="type-body text-gray-800">
            Here are the key costs you'll need to budget for when buying a home in the UK:
          </p>
          <ul className="space-y-2 type-body text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="text-[#00BFFF] mt-1">•</span>
              <span className="font-gill-sans-regular">
                <strong>Stamp Duty Land Tax (SDLT):</strong> A government tax on property purchases (varies by price and whether you're a first-time buyer).
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#00BFFF] mt-1">•</span>
              <span className="font-gill-sans-regular">
                <strong>Legal Fees (Conveyancing):</strong> Usually £800-£1,500 for handling contracts, property searches, and legal transfer.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#00BFFF] mt-1">•</span>
              <span className="font-gill-sans-regular">
                <strong>Survey Costs:</strong> Ranging from £250 for a basic survey to £600+ for a full structural survey.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#00BFFF] mt-1">•</span>
              <span className="font-gill-sans-regular">
                <strong>Mortgage Fees:</strong> Can include arrangement fees (£0-£1,000+), booking fees, and valuation fees.
              </span>
            </li>
          </ul>
        </div>
      ),
      timestamp: "11:45 PM",
    },
  ]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: inputValue,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      
      setMessages([...messages, newMessage]);
      setInputValue("");
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: "I'm processing your question. This would normally connect to the AI service.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Chat History Panel */}
      {showHistory && isHistoryOpen && (
        <div className="w-80 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out">
          <ChatHistory
            isDrawer={false}
            isOpen={isHistoryOpen}
            onToggle={toggleHistory}
          />
        </div>
      )}

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showHistory && (
              <Button
                size="sm"
                className="bg-[#00BFFF] hover:bg-blue-600 text-white font-gill-sans-light"
                onClick={toggleHistory}
                title={isHistoryOpen ? "Hide chat history" : "Show chat history"}
              >
                <History className="h-4 w-4 mr-2" />
                {isHistoryOpen ? "Hide History" : "Show History"}
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-gill-sans-light">
              Online
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask HomeTruth anything about property..."
                className="flex-1 border-gray-200 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF]/20 bg-gray-50/50 font-gill-sans-light"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                size="sm"
                className="bg-[#00BFFF] hover:bg-blue-600"
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200 text-gray-600 hover:bg-[#00BFFF]/5 hover:border-[#00BFFF]/20 hover:text-[#00BFFF] transition-colors font-gill-sans-light"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Search the web
                </Button>
              </div>
              
              {messages.length === 2 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 font-gill-sans-light">Try asking:</span>
                  {["How much stamp duty will I pay?", "What's my property worth?", "Should I remortgage?"].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(suggestion)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-[#00BFFF]/10 hover:text-[#00BFFF] transition-colors font-gill-sans-light"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
              showCopyButton={message.type === "ai"}
              onCopy={() => {
                // Handle copy functionality
                console.log("Copy message:", message.content);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}