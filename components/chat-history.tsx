"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from "lucide-react";

export interface ChatHistorySession {
  id: string;
  title: string;
  preview?: string;
  updatedAt: number;
}

interface ChatHistoryProps {
  sessions: ChatHistorySession[];
  activeSessionId?: string;
  onSelect: (sessionId: string) => void;
  className?: string;
  isDrawer?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function ChatHistory({
  sessions,
  activeSessionId,
  onSelect,
  className = "",
  isDrawer = false,
  isOpen = true,
  onToggle,
}: ChatHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSessions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sessions;
    return sessions.filter((session) =>
      session.title.toLowerCase().includes(term) || session.preview?.toLowerCase().includes(term)
    );
  }, [sessions, searchTerm]);

  if (isDrawer) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
          onClick={onToggle}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onToggle}
          />
        )}

        <div
          className={`
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 p-4 z-50
            transition-transform duration-300 ease-in-out
            md:relative md:translate-x-0 md:z-auto
            ${className}
          `}
        >
          <ChatHistoryContent
            sessions={filteredSessions}
            activeSessionId={activeSessionId}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelect={onSelect}
          />
        </div>
      </>
    );
  }

  return (
    <div className={`w-80 bg-white border-r border-gray-200 p-4 ${className}`}>
      <ChatHistoryContent
        sessions={filteredSessions}
        activeSessionId={activeSessionId}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSelect={onSelect}
      />
    </div>
  );
}

interface ChatHistoryContentProps {
  sessions: ChatHistorySession[];
  activeSessionId?: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelect: (sessionId: string) => void;
}

function ChatHistoryContent({
  sessions,
  activeSessionId,
  searchTerm,
  setSearchTerm,
  onSelect,
}: ChatHistoryContentProps) {
  const displaySessions = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions]
  );

  return (
    <>
      <div className="mb-4">
        <p className="type-caption text-gray-500 mb-2">
          Chat history is stored locally for 7 days.{" "}
          <Link href="/pro" className="text-primary hover:underline">
            Upgrade to pro
          </Link>
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats"
            className="pl-10 bg-gray-50 border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
        {displaySessions.length === 0 ? (
          <p className="type-caption text-gray-500">No conversations yet.</p>
        ) : (
          displaySessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelect(session.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                session.id === activeSessionId
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="type-body font-medium truncate">{session.title || "New conversation"}</div>
              {session.preview && (
                <div className="type-caption text-gray-500 truncate">
                  {session.preview}
                </div>
              )}
              <div className="type-caption text-gray-400 mt-1">
                {formatTimestamp(session.updatedAt)}
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
}

function formatTimestamp(timestamp: number) {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
}
