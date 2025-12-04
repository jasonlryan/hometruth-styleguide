"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ExternalLink,
  Copy,
  Download,
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

type PreviewChunk = {
  id: string;
  chunkText: string;
  chunkIndex: number;
  chunkCount?: number;
  wordCount?: number;
  charCount?: number;
  metadata?: Record<string, any>;
};

type DocumentPreview = {
  documentId: string;
  namespace?: string;
  chunks: PreviewChunk[];
};

type PreviewSummary = {
  chunkCount: number;
  wordTotal: number;
  charTotal: number;
};

const EMPTY_PREVIEW_SUMMARY: PreviewSummary = {
  chunkCount: 0,
  wordTotal: 0,
  charTotal: 0,
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
  const [preview, setPreview] = useState<DocumentPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDocument | null>(null);
  const [previewSummary, setPreviewSummary] = useState<PreviewSummary>(
    EMPTY_PREVIEW_SUMMARY
  );
  const [previewText, setPreviewText] = useState("");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const copyStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const previewRequestRef = useRef(0);

  useEffect(() => {
    return () => {
      if (copyStatusTimeoutRef.current) {
        clearTimeout(copyStatusTimeoutRef.current);
        copyStatusTimeoutRef.current = null;
      }
    };
  }, []);

  const mergeDocuments = useCallback(
    (incoming: KnowledgeDocument[], append: boolean) => {
      setDocuments((prev) => {
        const base = append ? prev : [];
        const map = new Map<string, KnowledgeDocument>();
        for (const doc of base) {
          map.set(doc.documentId, doc);
        }
        for (const doc of incoming) {
          map.set(doc.documentId, doc);
        }

        const merged = Array.from(map.values()).sort((a, b) => {
          const aDate = a.uploadDate ? Date.parse(a.uploadDate) : 0;
          const bDate = b.uploadDate ? Date.parse(b.uploadDate) : 0;
          if (aDate && bDate) {
            return bDate - aDate;
          }
          if (aDate) return -1;
          if (bDate) return 1;
          return b.documentId.localeCompare(a.documentId);
        });

        return merged;
      });
    },
    []
  );

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
          normalizeCount(stats?.vectorCount) ??
          normalizeCount(stats?.recordCount),
      })
    );

    return entries;
  }, [kbStats]);

  const loadDocuments = useCallback(
    async ({
      cursor,
      append,
      namespace,
      fetchAll,
    }: {
      cursor?: string | null;
      append?: boolean;
      namespace?: string;
      fetchAll?: boolean;
    } = {}) => {
      const effectiveCursor =
        cursor ?? (append ? docsCursor ?? undefined : undefined);

      if (append && !effectiveCursor && !fetchAll) {
        return;
      }

      if (append) {
        setDocsLoadingMore(true);
      } else {
        setDocsLoading(true);
        setDocsError(null);
      }

      const collected: KnowledgeDocument[] = [];
      let nextCursorLocal: string | undefined = effectiveCursor;
      let encounteredError = false;

      try {
        do {
          const params = new URLSearchParams();
          params.set("limit", fetchAll ? "100" : "50");
          if (nextCursorLocal) {
            params.set("cursor", nextCursorLocal);
          }
          if (namespace) {
            params.set("namespace", namespace);
          }

          const response = await fetch(
            `/api/knowledge/documents?${params.toString()}`
          );
          const data = await response.json();

          if (!data.success) {
            encounteredError = true;
            setDocsError(data.error || "Failed to load documents.");
            break;
          }

          const incoming: KnowledgeDocument[] = data.documents || [];
          collected.push(...incoming);
          nextCursorLocal = data.nextPageToken ?? undefined;

          if (!fetchAll) {
            mergeDocuments(incoming, Boolean(append));
            setDocsCursor(nextCursorLocal ?? null);
            break;
          }
        } while (fetchAll && nextCursorLocal);

        if (fetchAll && !encounteredError) {
          mergeDocuments(collected, Boolean(append));
          setDocsCursor(nextCursorLocal ?? null);
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
    [docsCursor, mergeDocuments]
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

  const handleClosePreview = () => {
    if (copyStatusTimeoutRef.current) {
      clearTimeout(copyStatusTimeoutRef.current);
      copyStatusTimeoutRef.current = null;
    }
    setIsPreviewOpen(false);
    setPreview(null);
    setPreviewDoc(null);
    setPreviewError(null);
    setPreviewLoading(false);
    setPreviewSummary({ ...EMPTY_PREVIEW_SUMMARY });
    setPreviewText("");
    setCopyStatus(null);
  };

  const handlePreview = async (doc: KnowledgeDocument) => {
    const requestId = previewRequestRef.current + 1;
    previewRequestRef.current = requestId;

    if (copyStatusTimeoutRef.current) {
      clearTimeout(copyStatusTimeoutRef.current);
      copyStatusTimeoutRef.current = null;
    }
    setCopyStatus(null);
    setPreviewDoc(doc);
    setIsPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewSummary({ ...EMPTY_PREVIEW_SUMMARY });
    setPreviewText("");

    setPreview({
      documentId: doc.documentId,
      namespace: doc.namespace || "urls",
      chunks: [],
    });

    try {
      const params = new URLSearchParams();
      params.set("namespace", doc.namespace || "urls");
      params.set("previewId", doc.documentId);
      const res = await fetch(`/api/knowledge/documents?${params.toString()}`);
      const data = await res.json();

      if (previewRequestRef.current !== requestId) {
        return;
      }

      if (data.success && Array.isArray(data.chunks)) {
        const chunks: PreviewChunk[] = data.chunks
          .map((chunk: any) => {
            if (!chunk) return null;
            const metadata: Record<string, any> = chunk.metadata ?? {};
            const rawText =
              typeof chunk.chunkText === "string"
                ? chunk.chunkText
                : typeof metadata.chunk_text === "string"
                ? metadata.chunk_text
                : "";
            let wordCount =
              typeof chunk.wordCount === "number"
                ? chunk.wordCount
                : typeof metadata.wordCount === "number"
                ? metadata.wordCount
                : typeof metadata.word_count === "number"
                ? metadata.word_count
                : undefined;
            let charCount =
              typeof chunk.charCount === "number"
                ? chunk.charCount
                : typeof metadata.charCount === "number"
                ? metadata.charCount
                : typeof metadata.char_count === "number"
                ? metadata.char_count
                : undefined;

            if (wordCount == null) {
              const trimmed = rawText.trim();
              wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
            }

            if (charCount == null) {
              charCount = rawText.length;
            }

            return {
              id: String(chunk.id ?? ""),
              chunkText: rawText,
              chunkIndex:
                typeof chunk.chunkIndex === "number"
                  ? chunk.chunkIndex
                  : typeof metadata.chunkIndex === "number"
                  ? metadata.chunkIndex
                  : typeof metadata.chunk_index === "number"
                  ? metadata.chunk_index
                  : 0,
              chunkCount:
                typeof chunk.chunkCount === "number"
                  ? chunk.chunkCount
                  : typeof metadata.chunkCount === "number"
                  ? metadata.chunkCount
                  : typeof metadata.chunk_count === "number"
                  ? metadata.chunk_count
                  : undefined,
              wordCount,
              charCount,
              metadata,
            } as PreviewChunk;
          })
          .filter((chunk: PreviewChunk | null): chunk is PreviewChunk =>
            Boolean(chunk?.id)
          );

        const sortedChunks = chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
        const wordTotal = sortedChunks.reduce(
          (total, chunk) => total + (chunk.wordCount || 0),
          0
        );
        const charTotal = sortedChunks.reduce(
          (total, chunk) => total + (chunk.charCount || 0),
          0
        );
        const combinedText = sortedChunks
          .map((chunk) => chunk.chunkText?.trim())
          .filter((text): text is string => Boolean(text))
          .join("\n\n");

        setPreview({
          documentId: doc.documentId,
          namespace: doc.namespace || "urls",
          chunks: sortedChunks,
        });
        setPreviewSummary({
          chunkCount: sortedChunks.length,
          wordTotal,
          charTotal,
        });
        setPreviewText(combinedText);

        if (sortedChunks.length === 0) {
          setPreviewError("No chunk text was returned for this document.");
        }
      } else {
        setPreviewError(data?.error || "Preview request failed.");
        setPreview((prev) => (prev ? { ...prev, chunks: [] } : prev));
      }
    } catch (e) {
      if (previewRequestRef.current !== requestId) {
        return;
      }
      console.error("Failed to preview document", e);
      setPreviewError("Failed to load preview. See console for details.");
      setPreview((prev) => (prev ? { ...prev, chunks: [] } : prev));
    } finally {
      if (previewRequestRef.current === requestId) {
        setPreviewLoading(false);
      }
    }
  };

  const handleRetryPreview = () => {
    if (previewDoc) {
      void handlePreview(previewDoc);
    }
  };

  const handleCopyPreview = async () => {
    if (!previewText) return;
    try {
      await navigator.clipboard.writeText(previewText);
      setCopyStatus("Copied");
      if (copyStatusTimeoutRef.current) {
        clearTimeout(copyStatusTimeoutRef.current);
      }
      copyStatusTimeoutRef.current = setTimeout(() => {
        setCopyStatus(null);
        copyStatusTimeoutRef.current = null;
      }, 2000);
    } catch (error) {
      console.error("Failed to copy preview", error);
      setCopyStatus("Copy failed");
      if (copyStatusTimeoutRef.current) {
        clearTimeout(copyStatusTimeoutRef.current);
        copyStatusTimeoutRef.current = null;
      }
    }
  };

  const handleDownloadPreview = () => {
    if (!previewText) return;
    const blob = new Blob([previewText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${previewDoc?.documentId || "document-preview"}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

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

  const previewTitle =
    previewDoc?.name?.trim() ||
    preview?.documentId ||
    previewDoc?.documentId ||
    "Document preview";
  const previewNamespace = preview?.namespace;
  const previewSource = previewDoc?.source;
  const chunkCountDisplay =
    previewSummary.chunkCount > 0
      ? previewSummary.chunkCount
      : previewDoc?.chunkCount ?? 0;
  const formattedChunkCount = chunkCountDisplay.toLocaleString();
  const formattedWordTotal =
    previewSummary.wordTotal > 0
      ? previewSummary.wordTotal.toLocaleString()
      : previewLoading && isPreviewOpen
      ? "—"
      : "0";
  const formattedCharTotal =
    previewSummary.charTotal > 0
      ? previewSummary.charTotal.toLocaleString()
      : previewLoading && isPreviewOpen
      ? "—"
      : "0";

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
      // Load both namespaces: show scraped URL docs first
      (async () => {
        await loadDocuments({ namespace: "urls", fetchAll: true });
        // then append general so both appear
        await loadDocuments({
          namespace: "general",
          append: true,
          fetchAll: true,
        });
      })();
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
            typeof statsFromResponse?.totalRecordCount === "number"
              ? statsFromResponse?.totalRecordCount
              : typeof statsFromResponse?.totalVectorCount === "number"
              ? (statsFromResponse as any).totalVectorCount
              : undefined,
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
            <h1 className="type-h2 text-gray-900 font-gill-sans-regular flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              Knowledge Base Admin
            </h1>
            <p className="text-gray-600 mt-2 font-gill-sans-light">
              Manage the RAG knowledge base for HomeTruth AI assistant
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-primary/90 text-white font-gill-sans-light transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
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
                  {new Date(lastUpload.timestamp).toLocaleTimeString()} • KB
                  total: {lastUpload.totalRecords ?? totalRecords ?? "—"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Add Knowledge Form */}
        {showAddForm && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 font-gill-sans-regular text-gray-900">
                <Upload className="h-5 w-5 text-primary" />
                Add New Knowledge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-gray-50 p-6">
              {/* URL Input */}
              <div>
                <Label
                  htmlFor="url"
                  className="font-gill-sans-light text-gray-700"
                >
                  Or Enter URL to Scrape
                </Label>
                <Input
                  id="url"
                  type="url"
                  value={urlToScrape}
                  onChange={(e) => setUrlToScrape(e.target.value)}
                  placeholder="https://example.com/article"
                  className="mb-2 font-gill-sans-light border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                />
                {urlToScrape && (
                  <div className="text-sm text-gray-600 font-gill-sans-light">
                    Will scrape content from: {urlToScrape}
                  </div>
                )}
              </div>

              {/* Document Upload */}
              <div>
                <Label
                  htmlFor="file"
                  className="font-gill-sans-light text-gray-700"
                >
                  Or Upload Document
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.doc,.docx,.json,.csv"
                  className="cursor-pointer font-gill-sans-light border-gray-200"
                />
                {uploadedFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm text-gray-600 font-gill-sans-light">
                      {uploadedFile.name} (
                      {(uploadedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <Label
                  htmlFor="title"
                  className="font-gill-sans-light text-gray-700"
                >
                  Title
                </Label>
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
                  className="font-gill-sans-light border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label
                    htmlFor="content"
                    className="font-gill-sans-light text-gray-700"
                  >
                    Content
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={suggestMetadata}
                    disabled={
                      suggestingMetadata ||
                      (!uploadedFile && !newKnowledge.content && !urlToScrape)
                    }
                    className="font-gill-sans-light border-gray-200 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
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
                  className="font-gill-sans-light border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label
                    htmlFor="category"
                    className="font-gill-sans-light text-gray-700"
                  >
                    Category
                  </Label>
                  {aiSuggestionsApplied && (
                    <Badge
                      variant="secondary"
                      className="text-xs font-gill-sans-light bg-primary/10 text-primary"
                    >
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
                  className="font-gill-sans-light border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="documentId"
                    className="font-gill-sans-light text-gray-700"
                  >
                    Document ID
                  </Label>
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
                    className="font-gill-sans-light border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="priority"
                    className="font-gill-sans-light text-gray-700"
                  >
                    Priority
                  </Label>
                  <select
                    id="priority"
                    value={newKnowledge.priority}
                    onChange={(e) =>
                      setNewKnowledge((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-md font-gill-sans-light focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="source"
                  className="font-gill-sans-light text-gray-700"
                >
                  Source
                </Label>
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
                  className="font-gill-sans-light border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                />
              </div>

              <div>
                <Label className="font-gill-sans-light text-gray-700">
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newKnowledge.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100 transition-colors font-gill-sans-light"
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
                  <Label className="text-sm text-gray-600 font-gill-sans-light">
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
                        className="cursor-pointer hover:bg-primary/10 hover:border-primary/20 transition-colors font-gill-sans-light"
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
                    className="flex-1 font-gill-sans-light border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
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
                    className="font-gill-sans-light border-gray-200 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
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
                  <Label className="font-gill-sans-light text-gray-700">
                    Auto-update when URL content changes
                  </Label>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleAddKnowledge}
                  disabled={adding}
                  className="bg-primary hover:bg-primary/90 text-white font-gill-sans-light transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {adding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding to Knowledge Base...
                    </>
                  ) : (
                    "Add to Knowledge Base"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="font-gill-sans-light border-gray-200 hover:border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Section - Moved above Search */}
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
                          <td
                            className="px-4 py-4 text-muted-foreground"
                            colSpan={2}
                          >
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
                    {new Date(lastUpload.timestamp).toLocaleString()} • Index
                    total after upload:{" "}
                    {lastUpload.totalRecords ?? totalRecords ?? "—"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search Knowledge Base */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 font-gill-sans-regular text-gray-900">
              <Search className="h-5 w-5 text-primary" />
              Search Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gray-50 p-6">
            {lastUpload && (
              <div className="mb-3 text-sm text-gray-600 font-gill-sans-light">
                Last upload: {lastUpload.chunks} chunks • doc{" "}
                {lastUpload.documentId}
                {typeof lastUpload.totalRecords === "number" && (
                  <> • total {lastUpload.totalRecords}</>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search homebuying knowledge..."
                className="flex-1 font-gill-sans-light border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="bg-primary hover:bg-primary/90 text-white font-gill-sans-light"
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
                  onClick={async () => {
                    setDocsInitialized(false);
                    await loadDocuments({ namespace: "urls", fetchAll: true });
                    await loadDocuments({
                      namespace: "general",
                      append: true,
                      fetchAll: true,
                    });
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

                        <div className="mt-4 flex flex-col items-end gap-2 md:mt-0 md:min-w-[220px]">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            disabled={
                              previewLoading &&
                              previewDoc?.documentId === doc.documentId
                            }
                            onClick={() => {
                              void handlePreview(doc);
                            }}
                          >
                            <FileText className="h-3 w-3" /> Preview
                          </Button>
                          {doc.priority && (
                            <Badge
                              variant={priorityVariant}
                              className="uppercase"
                            >
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

        <Dialog
          open={isPreviewOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleClosePreview();
            }
          }}
          ariaLabel={`Preview for ${previewTitle}`}
        >
          <DialogHeader>
            <div className="flex flex-1 flex-col gap-3">
              <DialogTitle>
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  {previewTitle}
                </span>
              </DialogTitle>
              <DialogDescription>
                Preview combined document chunks fetched from the knowledge
                base.
              </DialogDescription>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {preview?.documentId && (
                  <span>Document ID: {preview.documentId}</span>
                )}
                {previewNamespace && <span>Namespace: {previewNamespace}</span>}
                <span>Chunks: {formattedChunkCount}</span>
                <span>Words: {formattedWordTotal}</span>
                <span>Characters: {formattedCharTotal}</span>
              </div>
              {previewSource && (
                <a
                  href={previewSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex max-w-xl items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="truncate" title={previewSource}>
                    {previewSource}
                  </span>
                </a>
              )}
            </div>
          </DialogHeader>
          <DialogBody>
            <div className="flex h-full flex-col gap-4">
              {previewLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading document preview…
                </div>
              )}
              {previewError && (
                <div className="space-y-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <span>{previewError}</span>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleRetryPreview}
                      disabled={previewLoading || !previewDoc}
                    >
                      <RefreshCw className="h-3 w-3" /> Retry
                    </Button>
                  </div>
                </div>
              )}
              {!previewLoading && !previewError && (
                <div className="rounded border border-blue-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-900">
                  {previewText ? (
                    <pre className="whitespace-pre-wrap">{previewText}</pre>
                  ) : (
                    <p className="text-muted-foreground">
                      No chunk text returned for this document.
                    </p>
                  )}
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            {copyStatus && (
              <span className="mr-auto text-xs text-muted-foreground">
                {copyStatus}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleCopyPreview}
              disabled={!previewText || previewLoading}
            >
              <Copy className="h-3 w-3" /> Copy All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownloadPreview}
              disabled={!previewText || previewLoading}
            >
              <Download className="h-3 w-3" /> Download .txt
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleClosePreview}
            >
              Close
            </Button>
          </DialogFooter>
        </Dialog>

        {activeView === "bulk" && (
          <Card id="panel-bulk" role="tabpanel" aria-labelledby="tab-bulk">
            <CardHeader>
              <CardTitle>Bulk Upload (coming soon)</CardTitle>
              <CardDescription>
                We&apos;re preparing a guided workflow for batching documents.
                In the meantime, use Add Knowledge to ingest files individually.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {activeView === "export" && (
          <Card id="panel-export" role="tabpanel" aria-labelledby="tab-export">
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
