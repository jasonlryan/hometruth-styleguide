"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Globe, Send, History, Plus } from "lucide-react";

import ChatHistory, {
  type ChatHistorySession,
} from "@/components/chat-history";
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
const AUTO_SCROLL_THRESHOLD_PX = 96;

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
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
  const latestAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant" && message.content);
  if (!latestAssistant) {
    const latestUser = [...messages]
      .reverse()
      .find((message) => message.role === "user" && message.content);
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

function parseEventChunk(
  rawEvent: string,
  onEvent: (event: string, payload: unknown) => void
) {
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
  onEvent: (event: string, payload: unknown) => void
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
  const [isAutoScrollLocked, setIsAutoScrollLocked] = useState(false);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const [pendingSources, setPendingSources] = useState<
    Record<string, ChatSource[]>
  >({});

  const activeControllerRef = useRef<AbortController | null>(null);
  const currentReplyIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const pointerInteractingRef = useRef(false);

  useEffect(() => {
    const sessions = loadSessionsFromStorage();
    setStoredSessions(sessions);

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (messages.length === 0) return;

    setStoredSessions((prev) => {
      const now = Date.now();
      const preserved = prev.filter(
        (session) => now - session.updatedAt < SESSION_TTL_MS
      );
      const existingIndex = preserved.findIndex(
        (session) => session.id === sessionId
      );
      const existing =
        existingIndex >= 0 ? preserved[existingIndex] : undefined;
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
    const viewport = messagesViewportRef.current;
    if (!viewport || isAutoScrollLocked) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: messages[messages.length - 1]?.isStreaming ? "auto" : "smooth",
    });
  }, [messages, isAutoScrollLocked]);

  useEffect(() => {
    if (!isAutoScrollLocked) {
      setHasNewActivity(false);
    }
  }, [isAutoScrollLocked]);

  useEffect(() => {
    if (!isAutoScrollLocked || messages.length === 0) return;
    setHasNewActivity(true);
  }, [messages, isAutoScrollLocked]);

  useEffect(() => {
    const getViewport = () => messagesViewportRef.current;
    const initialViewport = getViewport();
    if (!initialViewport) return;

    const isNearBottom = (element: HTMLDivElement) => {
      const distanceFromBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight;
      return distanceFromBottom <= AUTO_SCROLL_THRESHOLD_PX;
    };

    const updateLockFromPosition = () => {
      const element = getViewport();
      if (!element) return;
      const shouldLock = !isNearBottom(element);
      setIsAutoScrollLocked((prev) =>
        prev === shouldLock ? prev : shouldLock
      );
    };

    const handleScroll = () => {
      if (pointerInteractingRef.current) return;
      updateLockFromPosition();
    };

    const handlePointerDown = () => {
      pointerInteractingRef.current = true;
      setIsAutoScrollLocked(true);
    };

    const handlePointerUp = () => {
      pointerInteractingRef.current = false;
      updateLockFromPosition();
    };

    initialViewport.addEventListener("scroll", handleScroll, { passive: true });
    initialViewport.addEventListener("pointerdown", handlePointerDown);
    initialViewport.addEventListener("pointerup", handlePointerUp);
    initialViewport.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    updateLockFromPosition();

    return () => {
      initialViewport.removeEventListener("scroll", handleScroll);
      initialViewport.removeEventListener("pointerdown", handlePointerDown);
      initialViewport.removeEventListener("pointerup", handlePointerUp);
      initialViewport.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  const sessionSummaries: ChatHistorySession[] = useMemo(
    () =>
      storedSessions.map((session) => ({
        id: session.id,
        title: session.title || deriveTitle(session.messages),
        preview: derivePreview(session.messages),
        updatedAt: session.updatedAt,
      })),
    [storedSessions]
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
    setPendingSources({});
    setSessionId(session.id);
    setMessages(session.messages ?? []);
    setIsHistoryOpen(false);
    setError(null);
    setIsAutoScrollLocked(false);
  };

  const handleNewConversation = () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }
    currentReplyIdRef.current = null;
    setPendingSources({});
    setMessages([]);
    setSessionId(generateId());
    setError(null);
    setInputValue("");
    setIsAutoScrollLocked(false);
  };

  const updateCurrentReply = (
    updater: (message: ChatMessageRecord) => ChatMessageRecord
  ) => {
    const replyId = currentReplyIdRef.current;
    if (!replyId) return;
    setMessages((prev) =>
      prev.map((message) =>
        message.id === replyId ? updater({ ...message }) : message
      )
    );
  };

  const handleScrollToBottom = () => {
    const viewport = messagesViewportRef.current;
    if (!viewport) return;

    setIsAutoScrollLocked(false);
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleStreamEvent = (event: string, payload: unknown) => {
    switch (event) {
      case "sources":
        if (Array.isArray(payload)) {
          const replyId = currentReplyIdRef.current;
          if (replyId) {
            setPendingSources((prev) => ({
              ...prev,
              [replyId]: payload as ChatSource[],
            }));
          }
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
      case "done": {
        const replyId = currentReplyIdRef.current;
        if (replyId) {
          updateCurrentReply((message) => ({
            ...message,
            sources: pendingSources[replyId] ?? message.sources,
            isStreaming: false,
          }));
          setPendingSources((prev) => {
            const next = { ...prev };
            delete next[replyId];
            return next;
          });
        } else {
          updateCurrentReply((message) => ({
            ...message,
            isStreaming: false,
          }));
        }
        currentReplyIdRef.current = null;
        break;
      }
      case "error": {
        const fallbackMessage =
          typeof (payload as { message?: string } | null)?.message === "string"
            ? (payload as { message: string }).message
            : "Sorry, I couldn't complete that. Let's try again?";
        const replyId = currentReplyIdRef.current;
        updateCurrentReply((message) => ({
          ...message,
          content: fallbackMessage,
          sources: replyId
            ? pendingSources[replyId] ?? message.sources
            : message.sources,
          isStreaming: false,
        }));
        if (replyId) {
          setPendingSources((prev) => {
            const next = { ...prev };
            delete next[replyId];
            return next;
          });
        }
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
      sources: undefined,
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
        const replyId = currentReplyIdRef.current;
        if (replyId) {
          updateCurrentReply((message) => ({
            ...message,
            sources: pendingSources[replyId] ?? message.sources,
            isStreaming: false,
          }));
          setPendingSources((prev) => {
            const next = { ...prev };
            delete next[replyId];
            return next;
          });
        }
        currentReplyIdRef.current = null;
        return;
      }
      console.error("Chat request error:", streamError);
      const fallback = "Sorry, I couldn't complete that. Let's try again?";
      const replyId = currentReplyIdRef.current;
      updateCurrentReply((message) => ({
        ...message,
        content: fallback,
        sources: replyId
          ? pendingSources[replyId] ?? message.sources
          : message.sources,
        isStreaming: false,
      }));
      if (replyId) {
        setPendingSources((prev) => {
          const next = { ...prev };
          delete next[replyId];
          return next;
        });
      }
      setError(fallback);
      currentReplyIdRef.current = null;
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

      <div className="flex-1 flex flex-col h-full">
        <div className="bg-white border-b border-gray-200 px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {title && (
              <h1 className="type-h2 text-gray-900 sm:hidden">{title}</h1>
            )}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {showHistory && (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-gill-sans-light"
                  onClick={toggleHistory}
                  title={
                    isHistoryOpen ? "Hide chat history" : "Show chat history"
                  }
                >
                  <History className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {isHistoryOpen ? "Hide History" : "Show History"}
                  </span>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="border-gray-200 text-gray-600 hover:text-primary hover:border-primary"
                onClick={handleNewConversation}
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              {title && (
                <h1 className="type-h2 text-gray-900 hidden md:block">{title}</h1>
              )}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isLoading ? "bg-yellow-400 animate-pulse" : "bg-green-500"
                  }`}
                />
                <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-gill-sans-light">
                  {isLoading ? "Responding" : "Online"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={messagesViewportRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 relative"
        >
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
                showCopyButton={
                  message.role === "assistant" && Boolean(message.content)
                }
                isStreaming={message.isStreaming}
                sources={message.sources}
              />
            ))
          )}
          {hasNewActivity && isAutoScrollLocked && (
            <div className="sticky bottom-4 flex justify-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleScrollToBottom}
                className="shadow-md"
              >
                Jump to latest
              </Button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-200 p-3 sm:p-4 pb-[env(safe-area-inset-bottom)]">
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask HomeTruth anything about property..."
                className="flex-1 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-gray-50/50 font-gill-sans-light"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
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
                  className="border-gray-200 text-gray-600 transition-colors font-gill-sans-light hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Search the web
                </Button>
              </div>

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 font-gill-sans-light">
                    Try asking:
                  </span>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInputValue(suggestion)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full transition-colors font-gill-sans-light hover:bg-primary/10 hover:text-primary"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
