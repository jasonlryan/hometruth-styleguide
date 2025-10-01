"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  layout?: "vertical" | "horizontal" | "grid";
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({
    className,
    options,
    value,
    onValueChange,
    disabled = false,
    layout = "vertical",
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "space-y-2",
          layout === "horizontal" && "flex flex-wrap gap-4",
          layout === "grid" && "grid grid-cols-1 md:grid-cols-2 gap-4",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "relative flex items-center space-x-3 rounded-lg border border-gray-200 p-4 cursor-pointer transition-all hover:bg-gray-50",
              value === option.value && "border-primary bg-primary/5",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <input
              type="radio"
              name="radio-group"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onValueChange?.(e.target.value)}
              disabled={disabled}
              className="sr-only"
            />
            
            {/* Custom radio button */}
            <div
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300",
                value === option.value && "border-primary bg-primary"
              )}
            >
              {value === option.value && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
            
            {/* Icon if provided */}
            {option.icon && (
              <div className="flex-shrink-0">
                {option.icon}
              </div>
            )}
            
            {/* Label */}
            <span className={cn(
              "font-gill-sans-light text-gray-700 flex-1",
              value === option.value && "text-primary font-gill-sans-regular"
            )}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export { RadioGroup };