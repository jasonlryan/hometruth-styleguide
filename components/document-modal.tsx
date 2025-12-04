"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, MessageCircle, FileText, Download, Share2 } from "lucide-react";
import DocumentContentViewer from "@/components/document-content-viewer";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/telemetry";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

interface DocumentModalProps {
  doc: {
    id: string;
    name: string;
    type: string;
    dateAdded: string;
    category?: string;
    tags?: string[];
    status?: string;
  };
  onClose: () => void;
}

export default function DocumentModal({ doc, onClose }: DocumentModalProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "chat">("preview");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: "assistant",
      content: `Hi! I can help you understand this ${doc.type}. What would you like to know?`
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const currentReplyIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const endMarker = messagesEndRef.current;
    if (endMarker) {
      endMarker.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  const handleSendMessage = async () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || isChatLoading) return;

    setChatError(null);

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
    };

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    currentReplyIdRef.current = assistantMessage.id;

    setChatMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputMessage("");
    setIsChatLoading(true);
    track({ name: "document_chat_message", props: { docId: doc.id } });

    const controller = new AbortController();
    controllerRef.current = controller;

    const updateAssistantMessage = (
      updater: (message: ChatMessage) => ChatMessage
    ) => {
      const replyId = currentReplyIdRef.current;
      if (!replyId) return;
      setChatMessages((prev) =>
        prev.map((message) =>
          message.id === replyId ? updater({ ...message }) : message
        )
      );
    };

    try {
      const response = await fetch(`/api/documents/${doc.id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          sessionId: doc.id,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(
          errorText || "Failed to connect to the document chat service."
        );
      }

      await consumeSSE(response.body, (event, payload) => {
        switch (event) {
          case "token":
            if (typeof payload === "string") {
              updateAssistantMessage((message) => ({
                ...message,
                content: `${message.content}${payload}`,
              }));
            }
            break;
          case "done":
            updateAssistantMessage((message) => ({
              ...message,
              isStreaming: false,
            }));
            currentReplyIdRef.current = null;
            break;
          case "error": {
            const payloadMessage = (payload as { message?: string } | null)
              ?.message;
            const fallback =
              typeof payloadMessage === "string" &&
              payloadMessage.length > 0
                ? payloadMessage
                : "Sorry, I couldn't complete that. Please try again.";
            updateAssistantMessage((message) => ({
              ...message,
              content: message.content || fallback,
              isStreaming: false,
            }));
            setChatError(fallback);
            currentReplyIdRef.current = null;
            break;
          }
          default:
            break;
        }
      });

      // Ensure the assistant message is marked complete if no "done" event arrived
      updateAssistantMessage((message) => ({
        ...message,
        isStreaming: false,
      }));
      currentReplyIdRef.current = null;
    } catch (error) {
      if ((error as Error)?.name === "AbortError") {
        return;
      }

      console.error("Document chat error:", error);
      const fallback = "Sorry, I couldn't complete that. Please try again.";
      updateAssistantMessage((message) => ({
        ...message,
        content: message.content || fallback,
        isStreaming: false,
      }));
      setChatError(fallback);
      currentReplyIdRef.current = null;
    } finally {
      setIsChatLoading(false);
      controllerRef.current = null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-4 lg:inset-8 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-gill-sans-regular text-gray-900">{doc.name}</h2>
                <p className="text-sm text-gray-500">{doc.type} • {doc.dateAdded}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b px-6">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-3 text-sm font-gill-sans-regular border-b-2 transition-colors ${
                activeTab === "preview"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-3 text-sm font-gill-sans-regular border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "chat"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Chat with Document
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "preview" ? (
                <div className="h-full">
                  <DocumentContentViewer
                    documentId={doc.id}
                    documentName={doc.name}
                    documentType={doc.type}
                    fullSize={true}
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-2xl rounded-lg px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">
                            {msg.content || (msg.isStreaming ? "..." : "")}
                          </p>
                          {msg.isStreaming && msg.role === "assistant" && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                              <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
                              <span>Reading this document...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    {chatError && (
                      <p className="text-sm text-red-600">{chatError}</p>
                    )}
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder={`Ask about this ${doc.type}...`}
                        className="flex-1"
                        disabled={isChatLoading}
                        aria-busy={isChatLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-primary hover:bg-primary/90"
                        disabled={isChatLoading}
                      >
                        {isChatLoading ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Side Panel with Document Info */}
            <div className="w-80 border-l p-6 bg-gray-50 overflow-y-auto">
              <h3 className="font-gill-sans-regular text-gray-900 mb-4">Document Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-500">Type</span>
                  <span className="text-sm text-gray-900">{doc.type}</span>
                </div>
                {doc.category && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500">Category</span>
                    <span className="text-sm text-gray-900">{doc.category}</span>
                  </div>
                )}
                {doc.status && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`text-sm font-medium ${
                      doc.status === "Ready" ? "text-green-600" :
                      doc.status === "Processing" ? "text-blue-600" :
                      doc.status === "Urgent" ? "text-red-600" :
                      doc.status === "Expiring" ? "text-orange-600" :
                      "text-gray-600"
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-500">Added</span>
                  <span className="text-sm text-gray-900">{doc.dateAdded}</span>
                </div>
                {doc.tags && doc.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Tags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs bg-white border border-gray-200 rounded-md text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {activeTab === "preview" && (
                <div className="mt-6">
                  <Button
                    onClick={() => setActiveTab("chat")}
                    className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with Document
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
