"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  href: string;
}

interface ChatHistoryProps {
  className?: string;
  isDrawer?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const mockChatHistory: ChatHistoryItem[] = [
  { id: "1", title: "How much stamp duty will I pay as a f...", timestamp: "March", href: "/chat/1" },
  { id: "2", title: "What's considered a good mortgage...", timestamp: "March", href: "/chat/2" },
  { id: "3", title: "How do property chains work and wh...", timestamp: "March", href: "/chat/3" },
  { id: "4", title: "What fees do I need to budget for wh...", timestamp: "March", href: "/chat/4" },
  { id: "5", title: "How long does the homebuying proc...", timestamp: "March", href: "/chat/5" },
  { id: "6", title: "What is an Energy Performance Certif...", timestamp: "March", href: "/chat/6" },
  { id: "7", title: "Can I make an offer below asking pric...", timestamp: "March", href: "/chat/7" },
  { id: "8", title: "What are the different types of surve...", timestamp: "March", href: "/chat/8" },
  { id: "9", title: "How do I calculate my borrowing capa...", timestamp: "March", href: "/chat/9" },
  { id: "10", title: "What documents do I need for a mortga...", timestamp: "March", href: "/chat/10" },
];

export default function ChatHistory({
  className = "",
  isDrawer = false,
  isOpen = true,
  onToggle,
}: ChatHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = mockChatHistory.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isDrawer) {
    return (
      <>
        {/* Mobile drawer toggle button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
          onClick={onToggle}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onToggle}
          />
        )}

        {/* Drawer */}
        <div className={`
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 p-4 z-50
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-auto
          ${className}
        `}>
          <ChatHistoryContent 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            filteredHistory={filteredHistory}
          />
        </div>
      </>
    );
  }

  return (
    <div className={`w-80 bg-white border-r border-gray-200 p-4 ${className}`}>
      <ChatHistoryContent 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        filteredHistory={filteredHistory}
      />
    </div>
  );
}

interface ChatHistoryContentProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredHistory: ChatHistoryItem[];
}

function ChatHistoryContent({ searchTerm, setSearchTerm, filteredHistory }: ChatHistoryContentProps) {
  return (
    <>
      <div className="mb-4">
        <p className="type-caption text-gray-500 mb-2">
          Chat history will be deleted after 7 days.{" "}
          <Link href="/pro" className="text-[#00BFFF] hover:underline">
            Upgrade to pro
          </Link>
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Chats"
            className="pl-10 bg-gray-50 border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="type-caption font-medium text-gray-500 mb-2">
          March
        </div>
        {filteredHistory.map((chat) => (
          <Link
            key={chat.id}
            href={chat.href}
            className="block px-3 py-2 type-body text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
          >
            {chat.title}
          </Link>
        ))}
      </div>
    </>
  );
}