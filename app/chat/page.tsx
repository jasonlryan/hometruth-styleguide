"use client";

import AppLayout from "@/components/layouts/app-layout";
import ChatContainer from "@/components/chat-container";

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="flex flex-1 h-full overflow-hidden">
        <ChatContainer
          className="flex-1"
          showHistory={true}
          title="Ask HomeTruth"
        />
      </div>
    </AppLayout>
  );
}
