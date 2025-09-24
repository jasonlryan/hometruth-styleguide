"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface DocumentUploaderProps {
  onUploadSuccess?: (documentId: string) => void;
  userId?: string;
}

interface UploadMetadata {
  name: string;
  type: string;
  category: string;
  tags: string[];
  starred: boolean;
  userId?: string;
}

export function DocumentUploader({
  onUploadSuccess,
  userId,
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<UploadMetadata>({
    name: "",
    type: "",
    category: "",
    tags: [],
    starred: false,
    userId,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setMetadata((prev) => ({
          ...prev,
          name: selectedFile.name.replace(/\.[^/.]+$/, ""), // Remove extension
          type: getFileType(selectedFile.type),
        }));
      }
    },
    []
  );

  const handleMetadataChange = (field: keyof UploadMetadata, value: any) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !metadata.tags.includes(tag)) {
      setMetadata((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata", JSON.stringify(metadata));

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus("success");
        setFile(null);
        setMetadata({
          name: "",
          type: "",
          category: "",
          tags: [],
          starred: false,
          userId,
        });
        onUploadSuccess?.(result.documentId);
      } else {
        setUploadStatus("error");
        setErrorMessage(result.error || "Upload failed");
      }
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage("Network error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file">Select Document</Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.txt,.doc,.docx,.json,.csv"
            className="cursor-pointer"
          />
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {/* Document Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Document Name</Label>
          <Input
            id="name"
            value={metadata.name}
            onChange={(e) => handleMetadataChange("name", e.target.value)}
            placeholder="Enter document name"
          />
        </div>

        {/* Document Type */}
        <div className="space-y-2">
          <Label>Document Type</Label>
          <RadioGroup
            options={[
              { value: "Lease Agreement", label: "Lease Agreement" },
              { value: "Title Deed", label: "Title Deed" },
              { value: "EPC Certificate", label: "EPC Certificate" },
              { value: "Insurance", label: "Insurance" },
              { value: "Other", label: "Other" },
            ]}
            value={metadata.type}
            onValueChange={(value) => handleMetadataChange("type", value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={metadata.category}
            onChange={(e) => handleMetadataChange("category", e.target.value)}
            placeholder="e.g., Legal, Compliance, Financial"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {metadata.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleTagRemove(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add tag and press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTagAdd(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </div>

        {/* Starred */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="starred"
            checked={metadata.starred}
            onCheckedChange={(checked) =>
              handleMetadataChange("starred", checked)
            }
          />
          <Label htmlFor="starred">Mark as important</Label>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || !metadata.name || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>

        {/* Status Messages */}
        {uploadStatus === "success" && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            Document uploaded successfully!
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getFileType(mimeType: string): string {
  const typeMap: Record<string, string> = {
    "application/pdf": "PDF Document",
    "text/plain": "Text Document",
    "application/msword": "Word Document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word Document",
    "application/json": "JSON File",
    "text/csv": "CSV File",
  };

  return typeMap[mimeType] || "Document";
}
