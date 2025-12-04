"use client";

import { useState, useEffect } from "react";
import { FileText, Image as ImageIcon } from "lucide-react";
import { getDocumentTypeIcon } from "@/lib/document-types";
import { SURVEY_REPORT_CONTENT } from "@/lib/documents/survey-report-content";

interface DocumentPreviewProps {
  documentId: string;
  documentName: string;
  documentType?: string;
  category?: string;
  thumbnailUrl?: string;
  onOpen?: () => void;
}

export default function DocumentPreview({
  documentId,
  documentName,
  documentType,
  category,
  thumbnailUrl,
  onOpen,
}: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const typeConfig = getDocumentTypeIcon(category, documentType);
  const IconComponent = typeConfig.icon;
  
  // Check if this is the survey report
  const isSurveyReport = documentName.toLowerCase().includes("survey") || 
                         documentType?.toLowerCase().includes("survey");

  useEffect(() => {
    // Try to load preview from API
    const loadPreview = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/preview`);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      } catch (error) {
        console.error("Failed to load preview:", error);
      } finally {
        setLoading(false);
      }
    };

    if (documentId && !isSurveyReport) {
      loadPreview();
    } else {
      setLoading(false);
    }
  }, [documentId, isSurveyReport]);

  // Use thumbnail if available
  const displayUrl = thumbnailUrl || previewUrl;

  if (loading) {
    return (
      <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100 animate-pulse">
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-8 w-8 rounded bg-gray-300" />
        </div>
      </div>
    );
  }

  if (displayUrl) {
    return (
      <div className="aspect-[3/4] w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <img
          src={displayUrl}
          alt={`Preview of ${documentName}`}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  // For survey report, show first page content
  if (isSurveyReport && SURVEY_REPORT_CONTENT.pages.length > 0) {
    const firstPage = SURVEY_REPORT_CONTENT.pages[0];
    return (
      <div 
        className={`aspect-[3/4] w-full overflow-hidden rounded-md border border-gray-200 ${typeConfig.bgColor} shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
        onClick={onOpen}
      >
        <div className="flex h-full flex-col p-4">
          {/* Document header */}
          <div className="mb-3 border-b border-gray-300 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <IconComponent className={`h-5 w-5 ${typeConfig.color}`} />
              <div className="h-2 w-32 rounded bg-gray-300" />
            </div>
            <div className="h-1.5 w-24 rounded bg-gray-300 mt-1" />
          </div>
          
          {/* First page content preview */}
          <div className="flex-1 space-y-1.5 text-xs font-gill-sans-light text-gray-700">
            <div className="font-gill-sans-regular text-sm text-gray-900 mb-2">{firstPage.title}</div>
            {firstPage.content.split('\n').slice(0, 12).map((line, idx) => (
              <div key={idx} className="h-1 w-full rounded bg-gray-200" style={{ width: line.length > 0 ? `${Math.min(100, line.length * 2)}%` : '100%' }} />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-gray-300 pt-2">
            <div className="h-1 w-16 rounded bg-gray-300" />
            <div className="h-1 w-20 rounded bg-gray-300" />
          </div>
        </div>
      </div>
    );
  }

  // Fallback: Generate styled mockup based on document type
  return (
    <div className={`aspect-[3/4] w-full overflow-hidden rounded-md border border-gray-200 ${typeConfig.bgColor} shadow-sm`}>
      <div className="flex h-full flex-col p-4">
        {/* Mock document header */}
        <div className="mb-4 border-b border-gray-300 pb-2">
          <div className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${typeConfig.color}`} />
            <div className="h-2 w-24 rounded bg-gray-300" />
          </div>
        </div>
        
        {/* Mock document content */}
        <div className="flex-1 space-y-2">
          <div className="h-1 w-full rounded bg-gray-200" />
          <div className="h-1 w-3/4 rounded bg-gray-200" />
          <div className="h-1 w-full rounded bg-gray-200" />
          <div className="h-1 w-5/6 rounded bg-gray-200" />
          <div className="mt-4 h-16 w-full rounded bg-gray-200" />
          <div className="h-1 w-full rounded bg-gray-200" />
          <div className="h-1 w-2/3 rounded bg-gray-200" />
        </div>

        {/* Mock footer */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-300 pt-2">
          <div className="h-1 w-16 rounded bg-gray-300" />
          <div className="h-1 w-20 rounded bg-gray-300" />
        </div>
      </div>
    </div>
  );
}

