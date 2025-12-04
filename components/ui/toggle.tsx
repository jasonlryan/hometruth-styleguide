"use client";

import React from "react";

import { cn } from "@/lib/utils";

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  badge?: string;
}

export function Toggle({
  label,
  description,
  badge,
  className,
  disabled,
  defaultChecked,
  ...props
}: ToggleProps) {
  return (
    <label
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          {label && (
            <span className="font-gill-sans-regular text-gray-900">
              {label}
            </span>
          )}
          {badge && (
            <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-800 ring-1 ring-blue-100">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm font-gill-sans-light text-gray-600">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          disabled={disabled}
          defaultChecked={defaultChecked}
          {...props}
        />
        <div className="relative inline-flex h-6 w-11 items-center rounded-full border border-gray-300 bg-gray-200 transition peer-checked:border-[hsl(var(--primary))] peer-checked:bg-[hsl(var(--primary))] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[hsl(var(--primary))]">
          <div className="absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </div>
      </div>
    </label>
  );
}
