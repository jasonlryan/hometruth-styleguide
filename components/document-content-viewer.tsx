"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SURVEY_REPORT_CONTENT } from "@/lib/documents/survey-report-content";
import { PROPERTY_DEED_CONTENT } from "@/lib/documents/property-deed-content";

interface DocumentContentViewerProps {
  documentId: string;
  documentName: string;
  documentType?: string;
  fullSize?: boolean;
}

export default function DocumentContentViewer({
  documentId,
  documentName,
  documentType,
  fullSize = false,
}: DocumentContentViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Determine which content to show based on document
  let documentContent = null;

  if (documentName.toLowerCase().includes("survey") || documentType?.toLowerCase().includes("survey")) {
    documentContent = SURVEY_REPORT_CONTENT;
  } else if (documentName.toLowerCase().includes("deed") || documentType?.toLowerCase().includes("deed")) {
    documentContent = PROPERTY_DEED_CONTENT;
  }

  if (!documentContent) {
    // Fallback for other documents
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Document preview not available</p>
          <p className="text-sm text-gray-500 mt-1">Click download to view the full document</p>
        </div>
      </div>
    );
  }

  const totalPages = documentContent.pages.length;
  const currentPageContent = documentContent.pages[currentPage];

  return (
    <div className={`flex flex-col ${fullSize ? 'h-full' : 'h-[600px]'} bg-white rounded-lg`}>
      {/* Document Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-gray-600" />
          <span className="font-gill-sans-regular text-gray-900">{documentContent.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg" style={{ minHeight: fullSize ? '842px' : '600px' }}>
            <div className="p-8 sm:p-12">
              {/* Page Title */}
              {currentPageContent.title && (
                <h2 className="text-xl font-gill-sans-regular text-gray-900 mb-6 text-center">
                  {currentPageContent.title}
                </h2>
              )}

              {/* Page Content */}
              <div className="prose prose-sm max-w-none">
                {currentPageContent.content.split('\n').map((paragraph, idx) => {
                  // Handle different formatting
                  if (paragraph.trim() === '') {
                    return <br key={idx} />;
                  }

                  // Check for headers (all caps or specific patterns)
                  if (paragraph === paragraph.toUpperCase() && paragraph.length > 0) {
                    return (
                      <h3 key={idx} className="text-sm font-gill-sans-regular text-gray-900 mt-6 mb-3 uppercase">
                        {paragraph}
                      </h3>
                    );
                  }

                  // Check for numbered items
                  if (/^\d+\./.test(paragraph.trim())) {
                    return (
                      <p key={idx} className="text-sm text-gray-700 mb-2 ml-4">
                        {paragraph}
                      </p>
                    );
                  }

                  // Check for lettered sub-items
                  if (/^\s+[a-z]\)/.test(paragraph)) {
                    return (
                      <p key={idx} className="text-sm text-gray-700 mb-1 ml-8">
                        {paragraph}
                      </p>
                    );
                  }

                  // Regular paragraph
                  return (
                    <p key={idx} className="text-sm text-gray-700 mb-3">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}