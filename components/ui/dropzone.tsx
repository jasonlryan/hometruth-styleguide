"use client";

import React, { useCallback, useRef, useState } from "react";

type Plan = "free" | "pro";

type UploadItem = {
  file: File;
  id: string;
  progress: number; // 0-100
  error?: string;
};

export interface DropzoneProps {
  onFilesAccepted?: (files: File[]) => void;
  plan?: Plan;
  accept?: string[]; // e.g., ["application/pdf", "image/png"] or extensions like .pdf
  maxFileSizeBytes?: number; // optional override
  className?: string;
}

const DEFAULT_ACCEPT = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const BYTES_MB = 1024 * 1024;

function fileMatchesAccept(file: File, acceptList: string[]): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return acceptList.some((a) => {
    const aLower = a.toLowerCase();
    if (aLower.startsWith(".")) {
      return name.endsWith(aLower);
    }
    return type === aLower || type.startsWith(aLower + "/");
  });
}

export default function Dropzone({
  onFilesAccepted,
  plan = "free",
  accept = DEFAULT_ACCEPT,
  maxFileSizeBytes,
  className = "",
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const limit = maxFileSizeBytes ?? (plan === "pro" ? 25 * BYTES_MB : 5 * BYTES_MB);

  const validate = useCallback(
    (files: File[]) => {
      const accepted: File[] = [];
      const newItems: UploadItem[] = [];
      for (const file of files) {
        let error: string | undefined;
        if (!fileMatchesAccept(file, accept)) {
          error = "Unsupported file type";
        } else if (file.size > limit) {
          error = `File too large (max ${(limit / BYTES_MB).toFixed(0)}MB)`;
        }
        const item: UploadItem = {
          file,
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
          progress: error ? 0 : 1,
          error,
        };
        if (!error) accepted.push(file);
        newItems.push(item);
      }
      setUploads((prev) => [...newItems, ...prev]);
      if (accepted.length && onFilesAccepted) onFilesAccepted(accepted);
      simulateUploadProgress(newItems.filter((i) => !i.error).map((i) => i.id));
    },
    [accept, limit, onFilesAccepted]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (!files.length) return;
      validate(files);
    },
    [validate]
  );

  const onSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    validate(files);
    // reset input value so the same file can be selected again
    e.currentTarget.value = "";
  }, [validate]);

  const simulateUploadProgress = (ids: string[]) => {
    if (!ids.length) return;
    const tick = () => {
      setUploads((prev) =>
        prev.map((u) =>
          ids.includes(u.id) && !u.error
            ? { ...u, progress: Math.min(100, u.progress + Math.random() * 12 + 6) }
            : u
        )
      );
    };
    const interval = setInterval(() => {
      tick();
      setUploads((prev) => {
        const allDone = ids.every((id) => prev.find((u) => u.id === id)?.progress! >= 100);
        if (allDone) {
          clearInterval(interval);
        }
        return prev;
      });
    }, 300);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div className={className}>
      <div
        role="region"
        aria-label="Upload documents"
        tabIndex={0}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={onDrop}
        onClick={openPicker}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-ht-primary ${
          isDragging ? "border-ht-primary bg-ht-primary/5" : "border-muted"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={[...accept, ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"].join(",")}
          onChange={onSelect}
          className="hidden"
          aria-hidden
        />
        <div className="space-y-1">
          <p className="type-h4 text-gray-900">Drag and drop files here</p>
          <p className="type-caption text-gray-600">
            or click to choose files. Allowed: PDF, DOC/DOCX, JPG, PNG. Max {plan === "pro" ? 25 : 5}MB.
          </p>
        </div>
      </div>

      {uploads.length > 0 && (
        <div className="mt-4 space-y-3" aria-live="polite">
          {uploads.map((u) => (
            <div key={u.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm text-gray-700">{u.file.name}</span>
                  {u.error ? (
                    <span className="text-xs text-red-600">{u.error}</span>
                  ) : (
                    <span className="text-xs text-gray-500">{Math.floor(u.progress)}%</span>
                  )}
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded bg-gray-100">
                  <div
                    className={`h-full ${u.error ? "bg-red-400" : "bg-ht-primary"}`}
                    style={{ width: `${Math.floor(Math.min(100, u.progress))}%` }}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.floor(u.progress)}
                    role="progressbar"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

