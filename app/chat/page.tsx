"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import SidebarNav from "@/components/sidebar-nav";
import ChatContainer from "@/components/chat-container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ChatPage() {
  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
        <Header variant="landing" />

        <div className="flex-1 flex overflow-hidden">
          <SidebarNav />

          {/* Main Chat Area */}
          <main className="flex-1 bg-blue-50/70 flex flex-col overflow-hidden min-h-0">
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
            <div className="flex-1 w-[90%] mx-auto px-6 py-4 flex flex-col overflow-hidden min-h-0">
              <Card className="shadow-xl border-0 bg-white ring-1 ring-gray-200 h-full overflow-hidden">
                <CardContent className="p-0 h-full flex flex-col min-h-0 overflow-hidden">
                  <ChatContainer showHistory={true} title="" />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <Footer variant="app" />
    </>
  );
}
