"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical } from "lucide-react";

export type DocumentStatus = "Processing" | "Urgent" | "Expiring" | "Ready" | "Error";

export interface DocumentCardProps {
  id: string;
  title: string;
  category?: string;
  tags?: string[];
  status?: DocumentStatus;
  thumbnailUrl?: string;
  updatedAt?: string;
  variant?: "grid" | "list";
  onOpen?: (id: string) => void;
  onPreview?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function statusColors(status?: DocumentStatus) {
  switch (status) {
    case "Urgent":
      return "bg-red-100 text-red-700 border-red-200";
    case "Expiring":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Processing":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Ready":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Error":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export default function DocumentCard({
  id,
  title,
  category,
  tags = [],
  status,
  thumbnailUrl,
  updatedAt,
  variant = "grid",
  onOpen,
  onPreview,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const thumb = (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnailUrl} alt="Document thumbnail" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
      )}
    </div>
  );

  const tagList = (
    <div className="mt-2 flex flex-wrap gap-1">
      {tags.slice(0, 3).map((t) => (
        <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {t}
        </span>
      ))}
      {tags.length > 3 && (
        <span className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-500">+{tags.length - 3}</span>
      )}
    </div>
  );

  const statusBadge = status ? (
    <Badge className={`border ${statusColors(status)}`}>{status}</Badge>
  ) : null;

  const contextMenu = (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Document actions"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((s) => !s);
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {menuOpen && (
        <div
          role="menu"
          aria-label="Actions"
          className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-md border bg-white shadow-md"
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50" onClick={() => onOpen?.(id)}>
            Open
          </button>
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50" onClick={() => onPreview?.(id)}>
            Preview
          </button>
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50" onClick={() => onEdit?.(id)}>
            Edit
          </button>
          <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => onDelete?.(id)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );

  if (variant === "list") {
    return (
      <div
        role="row"
        tabIndex={0}
        className="group grid grid-cols-12 items-center gap-4 rounded-md border p-3 hover:bg-gray-50"
        onClick={() => onOpen?.(id)}
      >
        <div className="col-span-1 hidden sm:block">
          <div className="h-10 w-14 overflow-hidden rounded bg-gray-100">
            <div className="flex h-full w-full items-center justify-center">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="col-span-6 min-w-0">
          <div className="truncate text-gray-900">{title}</div>
          <div className="text-xs text-gray-500">{category}</div>
        </div>
        <div className="col-span-3 flex items-center gap-2">
          {statusBadge}
        </div>
        <div className="col-span-2 flex items-center justify-end gap-2">
          {updatedAt && <span className="text-xs text-gray-500">{updatedAt}</span>}
          {contextMenu}
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(id)}
      className="group rounded-lg border bg-white p-3 transition-shadow hover:shadow"
    >
      {thumb}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm text-gray-900">{title}</div>
          <div className="text-xs text-gray-500">{category}</div>
        </div>
        {contextMenu}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusBadge}
        </div>
        {updatedAt && <div className="text-xs text-gray-500">{updatedAt}</div>}
      </div>
      {tags.length > 0 && tagList}
    </div>
  );
}

