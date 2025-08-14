"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, Globe } from "lucide-react";
import { useState } from "react";
import ChatMessage from "@/components/chat-message";

interface ChatInterfaceProps {
  showHeader?: boolean;
  showSuggestedQuestions?: boolean;
  className?: string;
  onSendMessage?: (message: string) => void;
}

interface Message {
  id: string;
  type: "user" | "ai";
  content: string | React.ReactNode;
  timestamp: string;
}

const suggestedQuestions = [
  "How much stamp duty will I pay?",
  "What's my property worth?",
  "Should I remortgage?",
];

export default function ChatInterface({
  showHeader = true,
  showSuggestedQuestions = true,
  className = "",
  onSendMessage,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hi! I'm your property assistant. What would you like to know?",
      timestamp: "11:45 PM",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

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
      onSendMessage?.(inputValue);
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

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={`shadow-2xl border-0 bg-white/95 backdrop-blur-sm ${className}`}>
      <CardContent className="p-8">
        {showHeader && (
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="h-5 w-5 text-[#00BFFF]" />
            <span className="font-gill-sans-light text-gray-800">
              HomeTruth AI Assistant
            </span>
            <Badge className="bg-green-100 text-green-800 text-xs">
              Online
            </Badge>
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
              showCopyButton={message.type === "ai"}
            />
          ))}
        </div>

        {/* Suggested Questions */}
        {showSuggestedQuestions && (
          <div className="space-y-2 mb-4">
            <p className="type-caption mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((question, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-[#00BFFF] hover:text-white transition-colors"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask any property question..."
              className="flex-1 border-gray-200 focus:border-[#00BFFF]"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              size="sm"
              className="bg-[#00BFFF] hover:bg-blue-600"
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Globe className="h-4 w-4 mr-2" />
              Search the web
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}