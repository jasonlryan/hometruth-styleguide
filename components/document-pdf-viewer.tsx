"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SURVEY_REPORT_CONTENT } from "@/lib/documents/survey-report-content";

interface DocumentPdfViewerProps {
  documentId: string;
  documentName: string;
  onClose: () => void;
}

export default function DocumentPdfViewer({
  documentId,
  documentName,
  onClose,
}: DocumentPdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = SURVEY_REPORT_CONTENT.pages.length;
  const currentPageData = SURVEY_REPORT_CONTENT.pages[currentPage - 1];

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-gill-sans-regular text-gray-900">{documentName}</h2>
            <p className="text-sm text-gray-500 font-gill-sans-light">
              Page {currentPage} of {totalPages}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* PDF Content Area */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto min-h-full">
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h3 className="text-xl font-gill-sans-regular text-gray-900 mb-2">
                {currentPageData.title}
              </h3>
            </div>
            <div className="prose prose-sm max-w-none font-gill-sans-light text-gray-700 whitespace-pre-wrap leading-relaxed">
              {currentPageData.content}
            </div>
          </div>
        </div>

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="font-gill-sans-light"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {SURVEY_REPORT_CONTENT.pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentPage === index + 1
                    ? "bg-primary w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="font-gill-sans-light"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

