"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layouts/app-layout";
import ChatContainer from "@/components/chat-container";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocumentChatPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  const [documentName, setDocumentName] = useState<string>("Document");

  useEffect(() => {
    // Fetch document metadata
    // For now, use mock data
    setDocumentName("Survey Report");
  }, [documentId]);

  return (
    <AppLayout>
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header with back button */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/documents")}
            className="font-gill-sans-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
          <div className="flex-1">
            <h1 className="type-h3 text-gray-900 font-gill-sans-regular">
              Chat to {documentName}
            </h1>
          </div>
        </div>

        {/* Chat Container with document context */}
        <ChatContainer
          className="flex-1"
          showHistory={false}
          title={`Chat to ${documentName}`}
          documentId={documentId}
        />
      </div>
    </AppLayout>
  );
}


