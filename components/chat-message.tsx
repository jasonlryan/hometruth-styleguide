import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export interface ChatSource {
  id: string;
  documentId: string;
  title?: string;
  category?: string;
  namespace: string;
  citation: number;
  url?: string;
  snippet?: string;
}

interface ChatMessageProps {
  type: "user" | "ai";
  content: string;
  timestamp?: string;
  showCopyButton?: boolean;
  isStreaming?: boolean;
  sources?: ChatSource[];
  onCopy?: () => void;
}

export default function ChatMessage({
  type,
  content,
  timestamp,
  showCopyButton = false,
  isStreaming = false,
  sources,
  onCopy,
}: ChatMessageProps) {
  if (type === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-md">
          <div className="bg-[#00BFFF] text-white rounded-lg p-4">
            <p className="text-sm font-gill-sans-regular whitespace-pre-wrap">
              {content}
            </p>
          </div>
          {timestamp && (
            <p className="text-xs text-gray-500 mt-1 text-right">{timestamp}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="space-y-3">
            <p className="text-gray-800 font-gill-sans-regular whitespace-pre-wrap leading-relaxed">
              {content || (isStreaming ? "HomeTruth is thinking…" : "")}
            </p>

            {sources && sources.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {sources.map((source) => (
                  <div
                    key={`${source.id}-${source.citation}`}
                    className="inline-flex items-center space-x-2 rounded-full border border-[#00BFFF]/30 bg-[#00BFFF]/5 px-3 py-1"
                    title={source.title || "Source"}
                  >
                    <span className="text-xs font-semibold text-[#00BFFF]">
                      [{source.citation}]
                    </span>
                    <span className="text-xs text-gray-600 truncate max-w-[160px]">
                      {source.title || "Source"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {isStreaming && (
              <p className="text-xs text-gray-400 animate-pulse">Streaming response…</p>
            )}
          </div>
          {(timestamp || showCopyButton) && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              {timestamp && (
                <p className="text-xs text-gray-500">{timestamp}</p>
              )}
              {showCopyButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1"
                  onClick={onCopy}
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
