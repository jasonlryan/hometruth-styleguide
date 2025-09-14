"use client";

import React, { useEffect } from "react";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  ariaLabel?: string;
}

export function Dialog({ open, onOpenChange, children, ariaLabel = "Dialog" }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-3xl rounded-lg border bg-white p-4 shadow-lg">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children?: React.ReactNode }) {
  return <div className="mb-2 flex items-start justify-between gap-2">{children}</div>;
}

export function DialogTitle({ children }: { children?: React.ReactNode }) {
  return <h2 className="text-lg font-medium text-gray-900">{children}</h2>;
}

export function DialogDescription({ children }: { children?: React.ReactNode }) {
  return <p className="text-sm text-gray-600">{children}</p>;
}

export function DialogBody({ children }: { children?: React.ReactNode }) {
  return <div className="mt-4">{children}</div>;
}

export function DialogFooter({ children }: { children?: React.ReactNode }) {
  return <div className="mt-6 flex items-center justify-end gap-2">{children}</div>;
}

