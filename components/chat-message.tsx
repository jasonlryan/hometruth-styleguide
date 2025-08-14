import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface ChatMessageProps {
  type: "user" | "ai";
  content: string | React.ReactNode;
  timestamp?: string;
  showCopyButton?: boolean;
  onCopy?: () => void;
}

export default function ChatMessage({
  type,
  content,
  timestamp,
  showCopyButton = false,
  onCopy,
}: ChatMessageProps) {
  if (type === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-md">
          <div className="bg-[#00BFFF] text-white rounded-lg p-4">
            <p className="text-sm font-gill-sans-regular">{content}</p>
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
            {typeof content === "string" ? (
              <p className="text-gray-800 font-gill-sans-regular">{content}</p>
            ) : (
              content
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
