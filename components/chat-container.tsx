"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Globe, Send, History, Plus } from "lucide-react";

import ChatHistory, { type ChatHistorySession } from "@/components/chat-history";
import ChatMessage, { type ChatSource } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = "user" | "assistant";

type ChatMessageRecord = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  isStreaming?: boolean;
  sources?: ChatSource[];
};

type StoredSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessageRecord[];
};

const STORAGE_KEY = "ht.chat.sessions";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function deriveTitle(messages: ChatMessageRecord[]): string {
  const firstQuestion = messages.find((message) => message.role === "user");
  if (!firstQuestion) {
    return "New conversation";
  }
  const text = firstQuestion.content.trim();
  if (!text) {
    return "New conversation";
  }
  return text.length > 60 ? `${text.slice(0, 57)}…` : text;
}

function derivePreview(messages: ChatMessageRecord[]): string {
  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant" && message.content);
  if (!latestAssistant) {
    const latestUser = [...messages].reverse().find((message) => message.role === "user" && message.content);
    if (!latestUser) return "";
    const preview = latestUser.content.trim();
    return preview.length > 70 ? `${preview.slice(0, 67)}…` : preview;
  }
  const preview = latestAssistant.content.trim();
  return preview.length > 70 ? `${preview.slice(0, 67)}…` : preview;
}

function loadSessionsFromStorage(): StoredSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: StoredSession[] = JSON.parse(raw);
    const now = Date.now();
    return parsed
      .filter((session) => now - session.updatedAt < SESSION_TTL_MS)
      .map((session) => ({
        ...session,
        messages: Array.isArray(session.messages) ? session.messages : [],
      }));
  } catch (error) {
    console.warn("Failed to load chat sessions", error);
    return [];
  }
}

function formatTimestamp(timestamp: number) {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
}

function parseEventChunk(rawEvent: string, onEvent: (event: string, payload: unknown) => void) {
  const trimmed = rawEvent.trim();
  if (!trimmed) return;

  const lines = trimmed.split("\n");
  let eventName = "message";
  let dataPayload = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataPayload += line.slice(5).trim();
    }
  }

  let parsed: unknown = null;
  if (dataPayload) {
    try {
      parsed = JSON.parse(dataPayload);
    } catch {
      parsed = dataPayload;
    }
  }

  onEvent(eventName, parsed);
}

async function consumeSSE(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: string, payload: unknown) => void,
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (buffer.trim()) {
        parseEventChunk(buffer, onEvent);
      }
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      parseEventChunk(rawEvent, onEvent);
      boundary = buffer.indexOf("\n\n");
    }
  }
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
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [sessionId, setSessionId] = useState(() => generateId());
  const [storedSessions, setStoredSessions] = useState<StoredSession[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeControllerRef = useRef<AbortController | null>(null);
  const currentReplyIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sessions = loadSessionsFromStorage();
    setStoredSessions(sessions);

    if (sessions.length > 0) {
      const latest = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      setSessionId(latest.id);
      setMessages(latest.messages ?? []);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (messages.length === 0) return;

    setStoredSessions((prev) => {
      const now = Date.now();
      const preserved = prev.filter((session) => now - session.updatedAt < SESSION_TTL_MS);
      const existingIndex = preserved.findIndex((session) => session.id === sessionId);
      const existing = existingIndex >= 0 ? preserved[existingIndex] : undefined;
      const title = existing?.title || deriveTitle(messages);
      const updatedSession: StoredSession = {
        id: sessionId,
        title,
        updatedAt: now,
        messages,
      };
      const next = [...preserved];
      if (existingIndex >= 0) {
        next[existingIndex] = updatedSession;
      } else {
        next.push(updatedSession);
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, [messages, sessionId, isHydrated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sessionSummaries: ChatHistorySession[] = useMemo(
    () =>
      storedSessions.map((session) => ({
        id: session.id,
        title: session.title || deriveTitle(session.messages),
        preview: derivePreview(session.messages),
        updatedAt: session.updatedAt,
      })),
    [storedSessions],
  );

  const handleSelectSession = (id: string) => {
    if (id === sessionId) return;
    const session = storedSessions.find((entry) => entry.id === id);
    if (!session) return;

    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }
    currentReplyIdRef.current = null;
    setSessionId(session.id);
    setMessages(session.messages ?? []);
    setIsHistoryOpen(false);
    setError(null);
  };

  const handleNewConversation = () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }
    currentReplyIdRef.current = null;
    setMessages([]);
    setSessionId(generateId());
    setError(null);
    setInputValue("");
  };

  const updateCurrentReply = (updater: (message: ChatMessageRecord) => ChatMessageRecord) => {
    const replyId = currentReplyIdRef.current;
    if (!replyId) return;
    setMessages((prev) =>
      prev.map((message) => (message.id === replyId ? updater({ ...message }) : message)),
    );
  };

  const handleStreamEvent = (event: string, payload: unknown) => {
    switch (event) {
      case "sources":
        if (Array.isArray(payload)) {
          updateCurrentReply((message) => ({
            ...message,
            sources: payload as ChatSource[],
          }));
        }
        break;
      case "token":
        if (typeof payload === "string") {
          updateCurrentReply((message) => ({
            ...message,
            content: `${message.content || ""}${payload}`,
          }));
        }
        break;
      case "done":
        updateCurrentReply((message) => ({
          ...message,
          isStreaming: false,
        }));
        currentReplyIdRef.current = null;
        break;
      case "error": {
        const fallbackMessage =
          typeof (payload as { message?: string } | null)?.message === "string"
            ? (payload as { message: string }).message
            : "Sorry, I ran into an issue with that request.";
        updateCurrentReply((message) => ({
          ...message,
          content: fallbackMessage,
          isStreaming: false,
        }));
        setError(fallbackMessage);
        currentReplyIdRef.current = null;
        break;
      }
      default:
        break;
    }
  };

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    setError(null);

    const userMessage: ChatMessageRecord = {
      id: generateId(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    const assistantMessage: ChatMessageRecord = {
      id: generateId(),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      isStreaming: true,
      sources: [],
    };

    currentReplyIdRef.current = assistantMessage.id;

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputValue("");
    setIsLoading(true);

    const controller = new AbortController();
    activeControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          mode: "knowledge",
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to connect to the chat service.");
      }

      await consumeSSE(response.body, handleStreamEvent);
    } catch (streamError) {
      if ((streamError as Error)?.name === "AbortError") {
        return;
      }
      console.error("Chat request error:", streamError);
      const fallback = "Sorry, I could not complete that request. Please try again.";
      updateCurrentReply((message) => ({
        ...message,
        content: fallback,
        isStreaming: false,
      }));
      setError(fallback);
    } finally {
      setIsLoading(false);
      activeControllerRef.current = null;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const toggleHistory = () => {
    setIsHistoryOpen((prev) => !prev);
  };

  const suggestions = [
    "What should I check before making an offer?",
    "How much deposit do I need in the UK?",
    "What does the conveyancing process involve?",
  ];

  const handleCopy = async (text: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (copyError) {
      console.warn("Copy to clipboard failed", copyError);
    }
  };

  return (
    <div className={`flex h-full ${className}`}>
      {showHistory && isHistoryOpen && (
        <ChatHistory
          sessions={sessionSummaries}
          activeSessionId={sessionId}
          onSelect={handleSelectSession}
          onToggle={toggleHistory}
          isOpen={isHistoryOpen}
        />
      )}

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
            <Button
              size="sm"
              variant="outline"
              className="border-gray-200 text-gray-600 hover:text-[#00BFFF] hover:border-[#00BFFF]"
              onClick={handleNewConversation}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isLoading ? "bg-yellow-400 animate-pulse" : "bg-green-500"}`} />
            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-gill-sans-light">
              {isLoading ? "Responding" : "Online"}
            </div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 p-4">
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask HomeTruth anything about property..."
                className="flex-1 border-gray-200 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF]/20 bg-gray-50/50 font-gill-sans-light"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <Button
                size="sm"
                className="bg-[#00BFFF] hover:bg-blue-600"
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
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

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 font-gill-sans-light">Try asking:</span>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
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

        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50">
          <div aria-live="polite" role="status" className="sr-only">
            {isLoading ? "HomeTruth is responding" : ""}
          </div>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 font-gill-sans-light">
              Start a conversation to see answers here.
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                type={message.role === "user" ? "user" : "ai"}
                content={message.content}
                timestamp={formatTimestamp(message.createdAt)}
                showCopyButton={message.role === "assistant" && Boolean(message.content)}
                isStreaming={message.isStreaming}
                sources={message.sources}
                onCopy={() => handleCopy(message.content)}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
