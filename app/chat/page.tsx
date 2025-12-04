"use client";

import AppLayout from "@/components/layouts/app-layout";
import AuthGuard from "@/components/auth-guard";
import ChatContainer from "@/components/chat-container";

export default function ChatPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="flex flex-col flex-1 min-h-0">
          <ChatContainer
            className="flex-1"
            showHistory={true}
            title="Ask HomeTruth"
          />
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
