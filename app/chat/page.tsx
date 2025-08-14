"use client";

import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SidebarNav from "@/components/sidebar-nav";
import ChatContainer from "@/components/chat-container";
import ChatHistory from "@/components/chat-history";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ChatPage() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="landing" />

      <div className="flex h-[calc(100vh-80px)]">
        <SidebarNav />
        
        {/* Main Chat Area */}
        <main className="flex-1 bg-blue-50/70">
          {/* Ask HomeTruth Page Title */}
          <div className="bg-white px-6 py-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center space-x-3">
                <h1 className="type-h2 text-gray-900">Ask HomeTruth</h1>
                <Badge className="bg-green-100 text-green-700 text-xs font-gill-sans-light">
                  Online
                </Badge>
              </div>
            </div>
          </div>

          {/* Chat Container in Card */}
          <div className="flex-1 w-[90%] mx-auto px-6 py-4">
            <Card className="shadow-xl border-0 bg-white ring-1 ring-gray-200 h-[calc(100vh-220px)]">
              <CardContent className="p-0 h-full">
                <ChatContainer showHistory={true} title="" />
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
      
      <Footer variant="app" />
    </div>
  );
}