"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  formatValue?: (value: number) => string;
  className?: string;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({
    className,
    min = 0,
    max = 100,
    step = 1,
    value = 0,
    onValueChange,
    formatValue,
    disabled = false,
    ...props
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      onValueChange?.(newValue);
    };

    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className={cn("relative w-full", className)}>
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              "relative h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:h-5",
              "[&::-webkit-slider-thumb]:w-5",
              "[&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-primary",
              "[&::-webkit-slider-thumb]:border-2",
              "[&::-webkit-slider-thumb]:border-white",
              "[&::-webkit-slider-thumb]:shadow-lg",
              "[&::-webkit-slider-thumb]:cursor-pointer",
              "[&::-moz-range-thumb]:appearance-none",
              "[&::-moz-range-thumb]:h-5",
              "[&::-moz-range-thumb]:w-5",
              "[&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:bg-primary",
              "[&::-moz-range-thumb]:border-2",
              "[&::-moz-range-thumb]:border-white",
              "[&::-moz-range-thumb]:shadow-lg",
              "[&::-moz-range-thumb]:cursor-pointer",
              "[&::-moz-range-thumb]:border-none",
              disabled && "cursor-not-allowed opacity-50"
            )}
            ref={ref}
            {...props}
          />
          
          {/* Progress bar */}
          <div
            className="absolute top-0 h-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Value display */}
        {formatValue && (
          <div className="mt-3 flex justify-between text-sm font-gill-sans-light text-gray-600">
            <span>{formatValue(min)}</span>
            <span className="font-gill-sans-regular text-primary">
              {formatValue(value)}
            </span>
            <span>{formatValue(max)}</span>
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };