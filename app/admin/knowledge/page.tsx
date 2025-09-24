"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  Tag,
  Loader2,
  Upload,
  Database,
  CheckCircle2,
  Info,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  FolderOpen,
  Trash2,
  Layers,
  Calendar,
} from "lucide-react";
import { Chatbot } from "@/components/chatbot";

type UploadFeedback = {
  type: "info" | "success" | "error";
  message: string;
};

type LastUploadInfo = {
  documentId: string;
  chunks: number;
  totalRecords?: number;
  timestamp: string;
};

type KnowledgeBaseStats = {
  totalRecordCount?: number | string;
  totalVectorCount?: number | string;
  dimension?: number | string;
  namespaces?: Record<
    string,
    { vectorCount?: number | string; recordCount?: number | string }
  >;
};

type KnowledgeDocument = {
  documentId: string;
  name?: string;
  category?: string;
  tags?: string[];
  chunkCount: number;
  uploadDate?: string;
  fileSize?: number;
  mimeType?: string;
  priority?: string;
  source?: string;
  status?: string;
  namespace?: string;
};

type AdminView = "search" | "stats" | "bulk" | "export" | "docs";

export default function KnowledgeAdminPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Add knowledge form state
  const [newKnowledge, setNewKnowledge] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
    documentId: "", // You control this
    priority: "normal", // You control this
    source: "", // You control this
    autoUpdate: false, // You control this
  });
  const [adding, setAdding] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [suggestingMetadata, setSuggestingMetadata] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [aiSuggestionsApplied, setAiSuggestionsApplied] = useState(false);
  const [urlToScrape, setUrlToScrape] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [kbStats, setKbStats] = useState<KnowledgeBaseStats | null>(null);
  const [lastUpload, setLastUpload] = useState<LastUploadInfo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<UploadFeedback | null>(
    null
  );
  const [statsFetchedAt, setStatsFetchedAt] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AdminView>("search");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [docsCursor, setDocsCursor] = useState<string | null>(null);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsLoadingMore, setDocsLoadingMore] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [docsInitialized, setDocsInitialized] = useState(false);

  const feedbackStyle = useMemo(() => {
    if (!uploadFeedback) return "";
    switch (uploadFeedback.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-700";
      case "error":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-blue-50 border-blue-200 text-blue-700";
    }
  }, [uploadFeedback]);

  const feedbackIcon = useMemo(() => {
    if (!uploadFeedback) return null;
    switch (uploadFeedback.type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 flex-shrink-0" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 flex-shrink-0" />;
      default:
        return <Info className="h-5 w-5 flex-shrink-0" />;
    }
  }, [uploadFeedback]);

  const totalRecords = useMemo(() => {
    const normalizeCount = (value?: number | string) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      }
      return undefined;
    };

    if (!kbStats) return null;

    const preferred =
      normalizeCount(kbStats.totalRecordCount) ??
      normalizeCount(kbStats.totalVectorCount);
    if (preferred != null) return preferred;

    const namespaces = Object.values(kbStats.namespaces ?? {});
    if (namespaces.length) {
      const sum = namespaces.reduce((acc, ns) => {
        const count =
          normalizeCount(ns.vectorCount) ?? normalizeCount(ns.recordCount);
        return count != null ? acc + count : acc;
      }, 0);
      return sum || null;
    }

    return null;
  }, [kbStats]);

  const namespaceStats = useMemo(() => {
    const normalizeCount = (value?: number | string) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      }
      return undefined;
    };

    const entries = Object.entries(kbStats?.namespaces ?? {}).map(
      ([name, stats]) => ({
        name,
        count:
          normalizeCount(stats?.vectorCount) ?? normalizeCount(stats?.recordCount),
      })
    );

    return entries;
  }, [kbStats]);

  const loadDocuments = useCallback(
    async ({ cursor, append }: { cursor?: string | null; append?: boolean } = {}) => {
      const effectiveCursor = cursor ?? (append ? docsCursor ?? undefined : undefined);

      if (append && !effectiveCursor) {
        return;
      }

      if (append) {
        setDocsLoadingMore(true);
      } else {
        setDocsLoading(true);
        setDocsError(null);
      }

      try {
        const params = new URLSearchParams();
        params.set("limit", "20");
        if (effectiveCursor) {
          params.set("cursor", effectiveCursor);
        }

        const response = await fetch(
          `/api/knowledge/documents?${params.toString()}`
        );
        const data = await response.json();

        if (data.success) {
          const incoming: KnowledgeDocument[] = data.documents || [];
          setDocuments((prev) => {
            if (append) {
              const existingIds = new Set(prev.map((doc) => doc.documentId));
              const merged = [...prev];
              for (const doc of incoming) {
                if (!existingIds.has(doc.documentId)) {
                  merged.push(doc);
                }
              }
              return merged;
            }
            return incoming;
          });
          setDocsCursor(data.nextPageToken ?? null);
        } else {
          setDocsError(data.error || "Failed to load documents.");
        }
      } catch (error) {
        console.error("Failed to load knowledge documents:", error);
        setDocsError("Failed to load documents. Please try again.");
      } finally {
        setDocsInitialized(true);
        if (append) {
          setDocsLoadingMore(false);
        } else {
          setDocsLoading(false);
        }
      }
    },
    [docsCursor]
  );

  const formatFileSize = useCallback((bytes?: number) => {
    if (!bytes || Number.isNaN(bytes)) return "—";
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} B`;
  }, []);

  const formatDateTime = useCallback((iso?: string) => {
    if (!iso) return "—";
    const timestamp = Date.parse(iso);
    if (Number.isNaN(timestamp)) return iso;
    return new Date(timestamp).toLocaleString();
  }, []);

  const generalNamespace = useMemo(() => {
    return namespaceStats.find((ns) => ns.name === "general");
  }, [namespaceStats]);

  const dimensionValue = useMemo(() => {
    const raw = kbStats?.dimension;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : raw;
    }
    return null;
  }, [kbStats?.dimension]);

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch("/api/knowledge/stats");
      const data = await res.json();
      if (data.success) {
        setKbStats(data.kb ?? null);
        setStatsFetchedAt(new Date().toISOString());
      }
    } catch (error) {
      console.error("Failed to fetch knowledge base stats:", error);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    if (activeView === "stats") {
      refreshStats();
    }
  }, [activeView, refreshStats]);

  useEffect(() => {
    if (activeView === "docs" && !docsInitialized && !docsLoading) {
      loadDocuments();
    }
  }, [activeView, docsInitialized, docsLoading, loadDocuments]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    console.log(
      "Attempting to add tag:",
      trimmedTag,
      "Current tags:",
      newKnowledge.tags
    );
    if (trimmedTag && !newKnowledge.tags.includes(trimmedTag)) {
      setNewKnowledge((prev) => {
        const newTags = [...prev.tags, trimmedTag];
        console.log("Adding tag, new tags array:", newTags);
        return {
          ...prev,
          tags: newTags,
        };
      });
      return true;
    }
    console.log("Tag not added - either empty or duplicate");
    return false;
  };

  const removeTag = (tagToRemove: string) => {
    setNewKnowledge((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery.trim(),
          topK: 10,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        console.error("Knowledge search failed:", data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Knowledge search error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!documentId) return;

    setDeletingId(documentId);
    try {
      const response = await fetch("/api/knowledge/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      const data = await response.json();

      if (data.success) {
        setUploadFeedback({
          type: "success",
          message: `Removed knowledge document ${documentId}.`,
        });

        setDocuments((prev) =>
          prev.filter((doc) => doc.documentId !== documentId)
        );

        if (lastUpload?.documentId === documentId) {
          setLastUpload(null);
        }

        await refreshStats();

        if (hasSearched) {
          await handleSearch();
        }

        if (activeView === "docs") {
          setDocsInitialized(false);
          await loadDocuments();
        }
      } else {
        setUploadFeedback({
          type: "error",
          message: data.error || "Failed to delete document.",
        });
      }
    } catch (error) {
      console.error("Failed to delete knowledge document:", error);
      setUploadFeedback({
        type: "error",
        message: "Failed to delete document. Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddKnowledge = async () => {
    if (
      !newKnowledge.title ||
      (!newKnowledge.content && !uploadedFile && !urlToScrape)
    )
      return;

    setAdding(true);
    setUploadFeedback({
      type: "info",
      message: "Uploading knowledge – large files may take a minute.",
    });

    try {
      const formData = new FormData();

      if (uploadedFile) {
        formData.append("file", uploadedFile);
      } else if (urlToScrape) {
        // For URL, we'll use the scraped content already in newKnowledge.content
        // No file to upload, just the metadata with content
      }

      formData.append(
        "metadata",
        JSON.stringify({
          ...newKnowledge,
          url: urlToScrape || undefined,
        })
      );

      const response = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const uploadedDocId =
          data.documentId ||
          newKnowledge.documentId ||
          (uploadedFile
            ? uploadedFile.name.replace(/\.[^/.]+$/, "")
            : newKnowledge.title || "knowledge_item");
        setNewKnowledge({
          title: "",
          content: "",
          category: "",
          tags: [],
          documentId: "",
          priority: "normal",
          source: "",
          autoUpdate: false,
        });
        setUploadedFile(null);
        setUrlToScrape("");
        setTagInput("");
        setAiSuggestionsApplied(false);
        setShowAddForm(false);
        setUploadFeedback({
          type: "success",
          message: `Uploaded ${data.chunksUploaded} chunks to the knowledge base for ${uploadedDocId}.`,
        });

        const statsFromResponse: KnowledgeBaseStats | null =
          data?.stats ?? null;
        if (statsFromResponse) {
          setKbStats(statsFromResponse);
          setStatsFetchedAt(new Date().toISOString());
        } else {
          refreshStats();
        }
        setLastUpload({
          documentId: uploadedDocId,
          chunks: data.chunksUploaded,
          totalRecords:
            statsFromResponse?.totalRecordCount ??
            statsFromResponse?.totalVectorCount,
          timestamp: new Date().toISOString(),
        });
        setDocsInitialized(false);
        if (activeView === "docs") {
          await loadDocuments();
        }
        // Optionally refresh search results
        if (hasSearched) {
          handleSearch();
        }
      } else {
        console.error("Failed to add knowledge:", data.error);
        setUploadFeedback({
          type: "error",
          message: data.error || "Failed to add knowledge.",
        });
      }
    } catch (error) {
      console.error("Error adding knowledge:", error);
      setUploadFeedback({
        type: "error",
        message: "Something went wrong while uploading. Please try again.",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Auto-fill title from filename
      setNewKnowledge((prev) => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ""),
        documentId: file.name
          .replace(/\.[^/.]+$/, "")
          .toLowerCase()
          .replace(/\s+/g, "_"),
      }));
    }
  };

  const suggestMetadata = async () => {
    setSuggestingMetadata(true);
    try {
      let text = "";
      let filename = "";

      if (urlToScrape) {
        // URL scraping route
        const response = await fetch("/api/scrape/url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToScrape }),
        });

        const scraped = await response.json();
        if (!scraped.success) {
          alert("Failed to scrape URL: " + scraped.error);
          return;
        }

        text = scraped.content;
        filename = scraped.title || urlToScrape;

        // Auto-fill content and title from scraped data
        setNewKnowledge((prev) => ({
          ...prev,
          title: scraped.title || prev.title,
          content: scraped.content,
        }));
      } else if (uploadedFile) {
        // File upload route
        text = await extractTextFromFile(uploadedFile);
        filename = uploadedFile.name;
      } else if (newKnowledge.content) {
        // Text input route
        text = newKnowledge.content;
        filename = newKnowledge.title || "text_input";
      } else {
        alert("Please enter a URL, upload a file, or enter content first");
        return;
      }

      // Send to OpenAI for metadata suggestion
      const response = await fetch("/api/ai/suggest-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.substring(0, 4000), // Limit text length
          filename: filename,
        }),
      });

      const suggestions = await response.json();
      console.log("AI suggestions received:", suggestions);

      if (suggestions.success) {
        console.log("✅ AI suggestions received successfully:", suggestions);
        console.log("Tags from AI:", suggestions.tags);
        console.log("Tags type:", typeof suggestions.tags);
        console.log("Tags is array:", Array.isArray(suggestions.tags));

        setNewKnowledge((prev) => {
          const newState = {
            ...prev,
            title: suggestions.title || prev.title,
            category: suggestions.category || prev.category,
            tags: Array.isArray(suggestions.tags)
              ? suggestions.tags
              : prev.tags,
            priority: suggestions.priority || prev.priority,
            source: suggestions.source || prev.source,
          };
          console.log("✅ Updated knowledge state with tags:", newState.tags);
          return newState;
        });
        setAiSuggestionsApplied(true);
      } else {
        console.log("❌ AI suggestions failed:", suggestions);
      }
    } catch (error) {
      console.error("Error suggesting metadata:", error);
    } finally {
      setSuggestingMetadata(false);
    }
  };

  const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              Knowledge Base Admin
            </h1>
            <p className="text-gray-600 mt-2">
              Manage the RAG knowledge base for HomeTruth AI assistant
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Knowledge
          </Button>
        </div>

        {uploadFeedback && (
          <div
            className={`border rounded-md px-4 py-3 flex items-start gap-3 ${feedbackStyle}`}
          >
            {feedbackIcon}
            <div className="text-sm">
              <p className="font-medium">{uploadFeedback.message}</p>
              {lastUpload && uploadFeedback.type === "success" && (
                <p className="mt-1 text-xs opacity-80">
                  {new Date(lastUpload.timestamp).toLocaleTimeString()} • KB total:{" "}
                  {lastUpload.totalRecords ?? totalRecords ?? "—"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Add Knowledge Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Add New Knowledge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL Input */}
              <div>
                <Label htmlFor="url">Or Enter URL to Scrape</Label>
                <Input
                  id="url"
                  type="url"
                  value={urlToScrape}
                  onChange={(e) => setUrlToScrape(e.target.value)}
                  placeholder="https://example.com/article"
                  className="mb-2"
                />
                {urlToScrape && (
                  <div className="text-sm text-gray-600">
                    Will scrape content from: {urlToScrape}
                  </div>
                )}
              </div>

              {/* Document Upload */}
              <div>
                <Label htmlFor="file">Or Upload Document</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.doc,.docx,.json,.csv"
                  className="cursor-pointer"
                />
                {uploadedFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      {uploadedFile.name} (
                      {(uploadedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newKnowledge.title}
                  onChange={(e) =>
                    setNewKnowledge((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g., First-time Buyer Checklist"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="content">Content</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={suggestMetadata}
                    disabled={
                      suggestingMetadata ||
                      (!uploadedFile && !newKnowledge.content && !urlToScrape)
                    }
                  >
                    {suggestingMetadata ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        AI Analyzing...
                      </>
                    ) : (
                      "AI Suggest Metadata"
                    )}
                  </Button>
                </div>
                <Textarea
                  id="content"
                  value={newKnowledge.content}
                  onChange={(e) =>
                    setNewKnowledge((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Enter the knowledge content here..."
                  rows={8}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="category">Category</Label>
                  {aiSuggestionsApplied && (
                    <Badge variant="secondary" className="text-xs">
                      AI Suggested
                    </Badge>
                  )}
                </div>
                <Input
                  id="category"
                  value={newKnowledge.category}
                  onChange={(e) => {
                    setNewKnowledge((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }));
                    setAiSuggestionsApplied(false); // Clear AI indicator when manually edited
                  }}
                  placeholder="e.g., Buying Process, Legal, Financial, Property Types"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentId">Document ID</Label>
                  <Input
                    id="documentId"
                    value={newKnowledge.documentId}
                    onChange={(e) =>
                      setNewKnowledge((prev) => ({
                        ...prev,
                        documentId: e.target.value,
                      }))
                    }
                    placeholder="e.g., lease_agreement_001"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={newKnowledge.priority}
                    onChange={(e) =>
                      setNewKnowledge((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={newKnowledge.source}
                  onChange={(e) =>
                    setNewKnowledge((prev) => ({
                      ...prev,
                      source: e.target.value,
                    }))
                  }
                  placeholder="e.g., Government Website, Legal Firm, Internal"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newKnowledge.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      <span className="mr-1">{tag}</span>
                      <span
                        className="cursor-pointer hover:bg-red-200 rounded-full px-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(tag);
                        }}
                      >
                        ×
                      </span>
                    </Badge>
                  ))}
                </div>

                {/* Suggested tags for manual selection */}
                <div className="mb-2">
                  <Label className="text-sm text-gray-600">
                    Suggested tags (click to add):
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[
                      "homebuying",
                      "mortgage",
                      "legal",
                      "first-time-buyer",
                      "uk",
                      "property",
                      "survey",
                      "costs",
                      "process",
                    ].map((suggestedTag) => (
                      <Badge
                        key={suggestedTag}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => addTag(suggestedTag)}
                      >
                        + {suggestedTag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (addTag(tagInput)) {
                          setTagInput("");
                        }
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (addTag(tagInput)) {
                        setTagInput("");
                      }
                    }}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Auto-update option for URLs */}
              {urlToScrape && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={newKnowledge.autoUpdate}
                    onCheckedChange={(checked: boolean) =>
                      setNewKnowledge((prev) => ({
                        ...prev,
                        autoUpdate: checked,
                      }))
                    }
                  />
                  <Label>Auto-update when URL content changes</Label>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleAddKnowledge} disabled={adding}>
                  {adding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding to Knowledge Base...
                    </>
                  ) : (
                    "Add to Knowledge Base"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Knowledge Base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
              <div>
                KB records: {totalRecords != null ? totalRecords : "—"}
              </div>
              {lastUpload && (
                <div>
                  Last upload: {lastUpload.chunks} chunks • doc {" "}
                  {lastUpload.documentId}
                  {typeof lastUpload.totalRecords === "number" && (
                    <>
                      {" "}• total {lastUpload.totalRecords}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search homebuying knowledge..."
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
              >
                {searching ? "Searching..." : "Search"}
              </Button>
              {lastUpload?.documentId && (
                <Button
                  variant="outline"
                  onClick={() => handleDeleteDocument(lastUpload.documentId)}
                  disabled={!!deletingId}
                >
                  {deletingId ? "Deleting…" : "Delete last upload"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {searching
                ? "Searching..."
                : `Found ${searchResults.length} results`}
            </h3>

            {searchResults.length === 0 && !searching ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No knowledge found matching your search.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {searchResults.map((result) => (
                  <Card
                    key={result.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">
                              {result.metadata?.name || "Knowledge Item"}
                            </h4>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {result.metadata?.type || "Knowledge"}
                            </span>
                            {result.metadata?.category && (
                              <Badge variant="outline">
                                {result.metadata.category}
                              </Badge>
                            )}
                            {result.metadata?.priority && (
                              <Badge
                                variant={
                                  result.metadata.priority === "critical"
                                    ? "destructive"
                                    : result.metadata.priority === "high"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {result.metadata.priority}
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground mb-2">
                            {result.metadata?.documentId && (
                              <span className="mr-4">
                                ID: {result.metadata.documentId}
                              </span>
                            )}
                            {result.metadata?.source && (
                              <span>Source: {result.metadata.source}</span>
                            )}
                          </div>

                          {result.metadata?.tags &&
                            result.metadata.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {result.metadata.tags.map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                          <div className="text-xs text-muted-foreground">
                            Relevance: {(result.score * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Switch between workspace tools without leaving the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
              role="tablist"
              aria-label="Knowledge base quick actions"
            >
              {[
                {
                  id: "bulk" as const,
                  label: "Bulk Upload",
                  description:
                    "Queue multiple documents for ingestion (coming soon)",
                  icon: BookOpen,
                },
                {
                  id: "docs" as const,
                  label: "Document Library",
                  description:
                    "Review uploaded files, chunk counts, and manage deletions",
                  icon: FolderOpen,
                },
                {
                  id: "stats" as const,
                  label: "View Stats",
                  description:
                    "Monitor Pinecone capacity and recent ingestion activity",
                  icon: Database,
                },
                {
                  id: "export" as const,
                  label: "Export Data",
                  description:
                    "Download knowledge records for offline review (coming soon)",
                  icon: FileText,
                },
              ].map((action) => {
                const Icon = action.icon;
                const isActive = activeView === action.id;
                return (
                  <button
                    key={action.id}
                    type="button"
                    role="tab"
                    id={`tab-${action.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${action.id}`}
                    onClick={() =>
                      setActiveView((prev) =>
                        prev === action.id ? "search" : action.id
                      )
                    }
                    className={`rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:text-blue-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-md border p-2 ${
                          isActive
                            ? "border-blue-500 bg-white"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold">{action.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {activeView === "docs" && (
          <Card
            id="panel-docs"
            role="tabpanel"
            aria-labelledby="tab-docs"
            className="border-blue-100 bg-white shadow-sm"
          >
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  Document Library
                </CardTitle>
                <CardDescription>
                  Browse uploaded knowledge files, inspect metadata, and delete
                  specific documents when they go out of date.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setDocsInitialized(false);
                    loadDocuments();
                  }}
                  disabled={docsLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${docsLoading ? "animate-spin" : ""}`}
                  />
                  {docsLoading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {docsError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {docsError}
                </div>
              )}

              {docsLoading && documents.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading documents...
                </div>
              ) : documents.length === 0 ? (
                <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-muted-foreground">
                  No documents uploaded yet. Add knowledge to see it listed
                  here.
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => {
                    const priorityVariant =
                      doc.priority === "critical"
                        ? "destructive"
                        : doc.priority === "high"
                        ? "default"
                        : "secondary";

                    return (
                      <div
                        key={doc.documentId}
                        className="rounded-lg border bg-white p-4 shadow-sm md:flex md:items-start md:justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="font-semibold">
                                {doc.name || doc.documentId}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {doc.documentId}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Layers className="h-3 w-3" />
                              {doc.chunkCount} chunks
                            </span>
                            <span className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {doc.namespace || "general"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(doc.uploadDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {doc.mimeType || "—"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              {formatFileSize(doc.fileSize)}
                            </span>
                            {doc.source && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {doc.source}
                              </span>
                            )}
                            {doc.status && (
                              <span className="flex items-center gap-1">
                                <Database className="h-3 w-3" />
                                {doc.status}
                              </span>
                            )}
                          </div>

                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {doc.tags.map((tag) => (
                                <Badge
                                  key={`${doc.documentId}-${tag}`}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex flex-col items-end gap-2 md:mt-0 md:min-w-[140px]">
                          {doc.priority && (
                            <Badge variant={priorityVariant} className="uppercase">
                              {doc.priority}
                            </Badge>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleDeleteDocument(doc.documentId)}
                            disabled={deletingId === doc.documentId}
                          >
                            {deletingId === doc.documentId ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {docsCursor && documents.length > 0 && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      loadDocuments({ cursor: docsCursor, append: true })
                    }
                    disabled={docsLoadingMore}
                  >
                    {docsLoadingMore ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading…
                      </>
                    ) : (
                      <>
                        <Layers className="h-3 w-3" />
                        Load more
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeView === "stats" && (
          <Card
            id="panel-stats"
            role="tabpanel"
            aria-labelledby="tab-stats"
            className="border-blue-100 bg-white shadow-sm"
          >
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Knowledge Base Stats
                </CardTitle>
                <CardDescription>
                  Snapshot of your Pinecone index health and recent uploads.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {statsFetchedAt && (
                  <span className="text-sm text-muted-foreground">
                    Updated {new Date(statsFetchedAt).toLocaleTimeString()}
                  </span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={refreshStats}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-900">
                  <p className="text-sm font-medium">Total Records</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {totalRecords != null ? totalRecords.toLocaleString() : "—"}
                  </p>
                  <p className="mt-1 text-xs text-blue-700">
                    Combined across all namespaces
                  </p>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">
                    General Namespace
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {generalNamespace?.count != null
                      ? generalNamespace.count.toLocaleString()
                      : "—"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Vectors stored for application defaults
                  </p>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">
                    Embedding Dimension
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {dimensionValue ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Model vector size for this index
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-white">
                <div className="border-b px-4 py-3">
                  <h4 className="font-semibold">Namespace breakdown</h4>
                  <p className="text-sm text-muted-foreground">
                    Track how content is distributed across namespaces.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Namespace</th>
                        <th className="px-4 py-3">Vector Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {namespaceStats.length > 0 ? (
                        namespaceStats.map(({ name, count }) => (
                          <tr key={name} className="border-t">
                            <td className="px-4 py-3 font-medium">{name}</td>
                            <td className="px-4 py-3">
                              {count != null ? count.toLocaleString() : "—"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-4 text-muted-foreground" colSpan={2}>
                            No namespace metrics available yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {lastUpload && (
                <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-green-900">
                  <p className="text-sm font-medium">Most recent upload</p>
                  <p className="mt-1 text-lg font-semibold">
                    {lastUpload.documentId} · {lastUpload.chunks} chunks
                  </p>
                  <p className="mt-1 text-xs text-green-800">
                    {new Date(lastUpload.timestamp).toLocaleString()} • Index total after upload: {" "}
                    {lastUpload.totalRecords ?? totalRecords ?? "—"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeView === "bulk" && (
          <Card
            id="panel-bulk"
            role="tabpanel"
            aria-labelledby="tab-bulk"
          >
            <CardHeader>
              <CardTitle>Bulk Upload (coming soon)</CardTitle>
              <CardDescription>
                We&apos;re preparing a guided workflow for batching documents. In
                the meantime, use Add Knowledge to ingest files individually.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {activeView === "export" && (
          <Card
            id="panel-export"
            role="tabpanel"
            aria-labelledby="tab-export"
          >
            <CardHeader>
              <CardTitle>Export Data (coming soon)</CardTitle>
              <CardDescription>
                You&apos;ll soon be able to download chunks as CSV or JSON for
                offline analysis. Let us know which format you need first.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
