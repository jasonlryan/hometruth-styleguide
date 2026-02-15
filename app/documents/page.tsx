"use client";

import { useState } from "react";
import AppLayout from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
import Dropzone from "@/components/ui/dropzone";
import DocumentCard from "@/components/ui/document-card";
import Link from "next/link";
import { Search, Filter, File, ChevronDown, X } from "lucide-react";
import { track } from "@/lib/telemetry";
import { useDebounce } from "@/lib/use-debounce";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentUploader } from "@/components/document-uploader";
import { DocumentSearch } from "@/components/document-search";
import DocumentPreview from "@/components/document-preview";
import DocumentPdfViewer from "@/components/document-pdf-viewer";
import DocumentModal from "@/components/document-modal";
import { MessageCircle } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  dateAdded: string; // display label
  addedAt: number; // sortable timestamp
  category?: string;
  tags?: string[];
  status?: "Processing" | "Urgent" | "Expiring" | "Ready" | "Error";
}

const documents: Document[] = [
  {
    id: "1",
    name: "Tenancy_Agreement.pdf",
    type: "Lease Agreement",
    dateAdded: "Sep 16th 2024",
    addedAt: 1726444800000,
    category: "Legal",
    tags: ["Lease", "Tenant"],
    status: "Ready",
  },
  {
    id: "2",
    name: "Property_Deed.pdf",
    type: "Title Deed",
    dateAdded: "Sep 17th 2024",
    addedAt: 1726531200000,
    category: "Legal",
    tags: ["Ownership"],
    status: "Processing",
  },
  {
    id: "3",
    name: "Energy_Performance_Cert.pdf",
    type: "EPC Certificate",
    dateAdded: "Sep 16th 2024",
    addedAt: 1726444800000,
    category: "Compliance",
    tags: ["EPC", "Energy"],
    status: "Expiring",
  },
  {
    id: "survey-report-2022",
    name: "Brighton_Survey_Report.pdf",
    type: "Property Survey Report",
    dateAdded: "Sep 18th 2024",
    addedAt: 1726617600000,
    category: "Surveys & Reports",
    tags: ["Survey", "Brighton", "Victorian"],
    status: "Ready",
  },
  {
    id: "5",
    name: "Mortgage_Approval.pdf",
    type: "Mortgage in Principle Letter",
    dateAdded: "Sep 16th 2024",
    addedAt: 1726444800000,
    category: "Financial",
    tags: ["Mortgage"],
    status: "Urgent",
  },
  {
    id: "6",
    name: "ID_Document_Trent.jpg",
    type: "Proof of Identity",
    dateAdded: "Sep 19th 2024",
    addedAt: 1726704000000,
    category: "Property Details",
    tags: ["Identity"],
    status: "Ready",
  },
  {
    id: "7",
    name: "Utility_Bill_March.pdf",
    type: "Proof of Address",
    dateAdded: "Sep 19th 2024",
    addedAt: 1726704000000,
    category: "Compliance",
    tags: ["Utilities"],
    status: "Ready",
  },
  {
    id: "8",
    name: "Bank_Statement_Aug.pdf",
    type: "Financial Statement",
    dateAdded: "Sep 20th 2024",
    addedAt: 1726790400000,
    category: "Financial",
    tags: ["Bank"],
    status: "Ready",
  },
  {
    id: "9",
    name: "Solicitor_Letter.pdf",
    type: "Legal Correspondence",
    dateAdded: "Sep 16th 2024",
    addedAt: 1726444800000,
    category: "Legal",
    tags: ["Letter"],
    status: "Ready",
  },
];

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [documentsState, setDocumentsState] = useState(documents);
  const [view, setView] = useState<"grid" | "list">("list");
  const [plan] = useState<"free" | "pro">("free");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    "Newest" | "Name" | "Category" | "Most relevant"
  >("Newest");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfViewerDocId, setPdfViewerDocId] = useState<string | null>(null);
  const [pdfViewerDocName, setPdfViewerDocName] = useState<string>("");
  const [showUploader, setShowUploader] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const debouncedTerm = useDebounce(searchTerm, 250);

  const filteredDocuments = documentsState
    .filter((doc) => {
      const term = debouncedTerm.toLowerCase();
      const matchesTerm =
        !term ||
        doc.name.toLowerCase().includes(term) ||
        doc.type.toLowerCase().includes(term) ||
        (doc.category?.toLowerCase().includes(term) ?? false) ||
        (doc.tags?.some((t) => t.toLowerCase().includes(term)) ?? false);

      const matchCategory =
        selectedCategories.length === 0 ||
        (doc.category && selectedCategories.includes(doc.category));
      const matchStatus =
        selectedStatuses.length === 0 ||
        (doc.status && selectedStatuses.includes(doc.status));
      const matchType =
        selectedTypes.length === 0 || selectedTypes.includes(doc.type);
      const matchTags =
        selectedTags.length === 0 ||
        (doc.tags && doc.tags.some((t) => selectedTags.includes(t)));

      return (
        matchesTerm && matchCategory && matchStatus && matchType && matchTags
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Name":
          return a.name.localeCompare(b.name);
        case "Category":
          return (a.category || "").localeCompare(b.category || "");
        case "Most relevant":
          return 0; // placeholder
        case "Newest":
        default:
          return b.addedAt - a.addedAt;
      }
    });

  // Selection and starring can be added with bulk actions in Pro

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="type-h3 text-gray-900 font-gill-sans-regular">
            Documents
          </h1>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="font-gill-sans-light">
              <Link href="/documents/database">Data Room (demo)</Link>
            </Button>
            <Button
              onClick={() => setShowUploader(!showUploader)}
              className="bg-primary hover:bg-primary/90 text-white font-gill-sans-light transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            >
              Upload Document
            </Button>
            <Button
              onClick={() => setShowSearch(!showSearch)}
              className="bg-secondary hover:bg-secondary/90 text-white font-gill-sans-light transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            >
              Search My Docs
            </Button>
          </div>
        </div>

        {/* Toolbar: search, filters, view toggle */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search document..."
                className="pl-10 bg-gray-50/50 border-gray-200 focus:border-ht-primary focus:ring-1 focus:ring-ht-primary/20 font-gill-sans-light"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen((s) => !s)}
                className="border-gray-200 text-gray-600 hover:bg-ht-primary/5 hover:border-ht-primary/20 hover:text-ht-primary transition-colors font-gill-sans-light"
                aria-expanded={filtersOpen}
              >
                <Filter className="h-4 w-4" />
                <span className="ml-2">Filters</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
              {filtersOpen && (
                <div className="absolute left-0 z-10 mt-2 w-[560px] rounded-md border bg-white p-4 shadow-md">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Filters
                    </span>
                    <button
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setSelectedCategories([]);
                        setSelectedStatuses([]);
                        setSelectedTypes([]);
                        setSelectedTags([]);
                        track({ name: "documents_filters_clear" });
                      }}
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="mb-2 text-xs font-medium text-gray-500">
                        Category
                      </div>
                      {[
                        "Financial",
                        "Legal",
                        "Maintenance",
                        "Compliance",
                        "Surveys & Reports",
                        "Property Details",
                      ].map((c) => (
                        <label key={c} className="mb-1 flex items-center gap-2">
                          <Checkbox
                            checked={selectedCategories.includes(c)}
                            onCheckedChange={() =>
                              setSelectedCategories((prev) =>
                                prev.includes(c)
                                  ? prev.filter((x) => x !== c)
                                  : [...prev, c]
                              )
                            }
                          />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-medium text-gray-500">
                        Status
                      </div>
                      {[
                        "Processing",
                        "Urgent",
                        "Expiring",
                        "Ready",
                        "Error",
                      ].map((s) => (
                        <label key={s} className="mb-1 flex items-center gap-2">
                          <Checkbox
                            checked={selectedStatuses.includes(s)}
                            onCheckedChange={() =>
                              setSelectedStatuses((prev) =>
                                prev.includes(s)
                                  ? prev.filter((x) => x !== s)
                                  : [...prev, s]
                              )
                            }
                          />
                          <span>{s}</span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-medium text-gray-500">
                        Type
                      </div>
                      {[...new Set(documentsState.map((d) => d.type))]
                        .slice(0, 8)
                        .map((t) => (
                          <label
                            key={t}
                            className="mb-1 flex items-center gap-2"
                          >
                            <Checkbox
                              checked={selectedTypes.includes(t)}
                              onCheckedChange={() =>
                                setSelectedTypes((prev) =>
                                  prev.includes(t)
                                    ? prev.filter((x) => x !== t)
                                    : [...prev, t]
                                )
                              }
                            />
                            <span>{t}</span>
                          </label>
                        ))}
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-medium text-gray-500">
                        Tags
                      </div>
                      {[...new Set(documentsState.flatMap((d) => d.tags ?? []))]
                        .slice(0, 10)
                        .map((t) => (
                          <label
                            key={t}
                            className="mb-1 flex items-center gap-2"
                          >
                            <Checkbox
                              checked={selectedTags.includes(t)}
                              onCheckedChange={() =>
                                setSelectedTags((prev) =>
                                  prev.includes(t)
                                    ? prev.filter((x) => x !== t)
                                    : [...prev, t]
                                )
                              }
                            />
                            <span>{t}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => {
                        setFiltersOpen(false);
                        track({ name: "documents_filters_apply" });
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOpen((s) => !s)}
                aria-expanded={sortOpen}
              >
                Sort: {sortBy}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
              {sortOpen && (
                <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-md border bg-white shadow-md">
                  {["Newest", "Name", "Category", "Most relevant"].map((opt) => (
                    <button
                      key={opt}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        sortBy === opt ? "text-ht-primary" : ""
                      }`}
                      onClick={() => {
                        setSortBy(opt as any);
                        setSortOpen(false);
                        track({
                          name: "documents_sort",
                          props: { sortBy: opt },
                        });
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant={view === "list" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
              >
                List
              </Button>
              <Button
                variant={view === "grid" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
              >
                Grid
              </Button>
            </div>
          </div>
        </div>

        {/* Uploader and Search Components */}
        <div className="flex-1 p-6">
          {showUploader && (
            <div className="mb-6">
              <DocumentUploader
                onUploadSuccess={(documentId) => {
                  console.log("Document uploaded:", documentId);
                  setShowUploader(false);
                  // Refresh the page or update state
                  window.location.reload();
                }}
              />
            </div>
          )}

          {showSearch && (
            <div className="mb-6">
              <DocumentSearch />
            </div>
          )}

          <Dropzone
            className="mb-6"
            plan={plan}
            onFilesAccepted={(files) => {
              track({
                name: "documents_upload_drop",
                props: { count: files.length },
              });
              // Mock insert new docs to top of list
              const newDocs: Document[] = files.map((f, idx) => ({
                id: `${Date.now()}-${idx}`,
                name: f.name,
                type: f.type || "Document",
                dateAdded: new Date().toLocaleDateString(),
                addedAt: Date.now(),
                category: undefined,
                tags: [],
                status: "Processing" as Document["status"],
              }));
              setDocumentsState((prev) => [...newDocs, ...prev]);
            }}
          />

          <div className="relative">
            <div>
              {view === "list" ? (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      id={doc.id}
                      title={doc.name}
                      category={doc.type}
                      tags={doc.tags}
                      status={doc.status as any}
                      updatedAt={doc.dateAdded}
                      variant="list"
                      onOpen={() => {
                        setPreviewId(doc.id);
                        track({
                          name: "documents_open",
                          props: { id: doc.id },
                        });
                      }}
                      onPreview={() => {
                        setPreviewId(doc.id);
                        track({
                          name: "documents_preview",
                          props: { id: doc.id },
                        });
                      }}
                      onEdit={() =>
                        track({
                          name: "documents_edit",
                          props: { id: doc.id },
                        })
                      }
                      onDelete={() =>
                        track({
                          name: "documents_delete",
                          props: { id: doc.id },
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  {filteredDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      id={doc.id}
                      title={doc.name}
                      category={doc.category}
                      documentType={doc.type}
                      tags={doc.tags}
                      status={doc.status as any}
                      updatedAt={doc.dateAdded}
                      variant="grid"
                      onOpen={() => {
                        setPreviewId(doc.id);
                        track({
                          name: "documents_open",
                          props: { id: doc.id },
                        });
                      }}
                      onPreview={() => {
                        setPreviewId(doc.id);
                        track({
                          name: "documents_preview",
                          props: { id: doc.id },
                        });
                      }}
                      onEdit={() =>
                        track({
                          name: "documents_edit",
                          props: { id: doc.id },
                        })
                      }
                      onDelete={() =>
                        track({
                          name: "documents_delete",
                          props: { id: doc.id },
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="mt-10">
            <div className="rounded-2xl bg-gradient-to-b from-white to-gray-50 border border-gray-200 p-8 text-center">
              <p className="type-h4 text-gray-900 mb-3 font-gill-sans-regular">
                Need more document storage?
              </p>
              <Link href="/pro">
                <Button className="bg-ht-primary hover:bg-[#00A5E0] text-white px-6 py-2 font-gill-sans-light">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfViewer && pdfViewerDocId && (
        <DocumentPdfViewer
          documentId={pdfViewerDocId}
          documentName={pdfViewerDocName}
          onClose={() => {
            setShowPdfViewer(false);
            setPdfViewerDocId(null);
            setPdfViewerDocName("");
          }}
        />
      )}

      {/* Document Preview Modal */}
      {previewId &&
        (() => {
          const doc = documentsState.find((d) => d.id === previewId);
          if (!doc) return null;
          return <DocumentModal doc={doc} onClose={() => setPreviewId(null)} />;
        })()}
    </AppLayout>
  );
}
