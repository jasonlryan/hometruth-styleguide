"use client";

import AppLayout from "@/components/layouts/app-layout";
import ChatContainer from "@/components/chat-container";

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="flex flex-1 min-h-0">
        <ChatContainer
          className="flex-1 min-h-0"
          showHistory={true}
          title="Ask HomeTruth"
        />
      </div>
    </AppLayout>
  );
}
