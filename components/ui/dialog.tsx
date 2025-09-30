"use client";

import React, { useEffect } from "react";

import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  ariaLabel?: string;
  /**
   * Allows overriding the default centered dialog layout (e.g. for drawers).
   */
  containerClassName?: string;
  /**
   * Optional class overrides for the wrapper div around the dialog content.
   */
  panelClassName?: string;
  /**
   * Optional class overrides for the innermost content container.
   */
  contentClassName?: string;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  ariaLabel = "Dialog",
  containerClassName,
  panelClassName,
  contentClassName,
}: DialogProps) {
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
      className={cn(
        "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto",
        containerClassName,
      )}
    >
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className={cn("relative z-10 mx-4 my-10 w-full max-w-3xl", panelClassName)}>
        <div
          className={cn(
            "flex max-h-[90vh] flex-col overflow-hidden rounded-lg border bg-white shadow-lg",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-slate-200 px-6 py-4">
      {children}
    </div>
  );
}

export function DialogTitle({ children }: { children?: React.ReactNode }) {
  return <h2 className="text-lg font-medium text-gray-900">{children}</h2>;
}

export function DialogDescription({ children }: { children?: React.ReactNode }) {
  return <p className="text-sm text-gray-600">{children}</p>;
}

export function DialogBody({ children }: { children?: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>;
}

export function DialogFooter({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
      {children}
    </div>
  );
}
