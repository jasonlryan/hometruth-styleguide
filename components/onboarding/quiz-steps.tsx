"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioOption } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { StepProps } from "./multi-step-form";
import { Clock, Zap, Calendar, Home, Building, TreePine } from "lucide-react";

// Step 1: Living Environment
export function LivingEnvironmentStep({ data, onDataChange }: StepProps) {
  const options = [
    { id: "quiet", label: "Quiet" },
    { id: "family-friendly", label: "Family Friendly" },
    { id: "close-to-transit", label: "Close to transit" },
    { id: "eco-conscious", label: "eco-conscious" },
    { id: "cosy", label: "cosy" },
    { id: "modern", label: "modern" },
    { id: "walkable", label: "walkable" },
  ];

  const handleChange = (optionId: string, checked: boolean) => {
    const newSelections = checked
      ? [...(data.selections || []), optionId]
      : (data.selections || []).filter((id: string) => id !== optionId);
    
    onDataChange({ selections: newSelections });
  };

  return (
    <div className="space-y-4">
      <p className="font-gill-sans-light text-gray-600 text-center mb-6">
        Describe your ideal living environment.
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <Checkbox
              checked={(data.selections || []).includes(option.id)}
              onCheckedChange={(checked) => handleChange(option.id, checked)}
            />
            <span className="font-gill-sans-light text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Step 2: Buying Timeline
export function BuyingTimelineStep({ data, onDataChange }: StepProps) {
  const options: RadioOption[] = [
    { value: "not-ready", label: "Not Ready", icon: <Clock className="w-8 h-8 text-gray-500" /> },
    { value: "3-months", label: "3 months", icon: <Calendar className="w-8 h-8 text-blue-500" /> },
    { value: "6-months", label: "6 months", icon: <Calendar className="w-8 h-8 text-green-500" /> },
    { value: "high-priority", label: "High Priority", icon: <Zap className="w-8 h-8 text-orange-500" /> },
    { value: "very-urgent", label: "Very Urgent", icon: <Zap className="w-8 h-8 text-red-500" /> },
  ];

  return (
    <div className="space-y-6">
      <p className="font-gill-sans-light text-gray-600 text-center mb-6">
        How quickly are you looking to buy?
      </p>
      
      <RadioGroup
        options={options}
        value={data.timeline}
        onValueChange={(value) => onDataChange({ timeline: value })}
        layout="grid"
      />
    </div>
  );
}

// Step 3: Budget Range
export function BudgetRangeStep({ data, onDataChange }: StepProps) {
  const formatBudget = (value: number) => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `£${(value / 1000).toFixed(0)}k`;
    }
    return `£${value}`;
  };

  return (
    <div className="space-y-6">
      <p className="font-gill-sans-light text-gray-600 text-center mb-8">
        What is your budget range?
      </p>
      
      <div className="px-4">
        <Slider
          min={100000}
          max={2000000}
          step={25000}
          value={data.budget || 500000}
          onValueChange={(value) => onDataChange({ budget: value })}
          formatValue={formatBudget}
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm font-gill-sans-light text-gray-500">
          Move the slider to adjust your budget
        </p>
      </div>
    </div>
  );
}

// Step 4: Motivations
export function MotivationsStep({ data, onDataChange }: StepProps) {
  const options = [
    { id: "independence-privacy", label: "Independence / privacy" },
    { id: "starting-family", label: "Starting a family" },
    { id: "relocating", label: "Relocating" },
    { id: "tired-renting", label: "Tired of renting" },
    { id: "downsizing", label: "Downsizing" },
    { id: "schoolcatchings", label: "Schoolcatchings" },
  ];

  const handleChange = (optionId: string, checked: boolean) => {
    const newSelections = checked
      ? [...(data.motivations || []), optionId]
      : (data.motivations || []).filter((id: string) => id !== optionId);
    
    onDataChange({ motivations: newSelections });
  };

  return (
    <div className="space-y-4">
      <p className="font-gill-sans-light text-gray-600 text-center mb-6">
        What's motivating you to find a new home?
      </p>
      
      <div className="grid grid-cols-1 gap-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <Checkbox
              checked={(data.motivations || []).includes(option.id)}
              onCheckedChange={(checked) => handleChange(option.id, checked)}
            />
            <span className="font-gill-sans-light text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Step 5: Home Process Concerns
export function HomeProcessConcernsStep({ data, onDataChange }: StepProps) {
  const options = [
    { id: "legal-documents", label: "Legal documents" },
    { id: "too-many-steps", label: "Too many listing steps" },
    { id: "choosing-location", label: "Choosing a location" },
    { id: "prioritizing-features", label: "Prioritizing home features" },
  ];

  const handleChange = (optionId: string, checked: boolean) => {
    const newSelections = checked
      ? [...(data.concerns || []), optionId]
      : (data.concerns || []).filter((id: string) => id !== optionId);
    
    onDataChange({ concerns: newSelections });
  };

  return (
    <div className="space-y-4">
      <p className="font-gill-sans-light text-gray-600 text-center mb-6">
        What parts of the homebuying process feel overwhelming?
      </p>
      
      <div className="grid grid-cols-1 gap-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <Checkbox
              checked={(data.concerns || []).includes(option.id)}
              onCheckedChange={(checked) => handleChange(option.id, checked)}
            />
            <span className="font-gill-sans-light text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Step 6: Housing Factors
export function HousingFactorsStep({ data, onDataChange }: StepProps) {
  const options = [
    { id: "parks", label: "Parks" },
    { id: "public-transit", label: "Public transit" },
    { id: "balcony", label: "Balcony" },
    { id: "gym", label: "Gym" },
    { id: "schools", label: "Schools" },
  ];

  const handleChange = (optionId: string, checked: boolean) => {
    const newSelections = checked
      ? [...(data.factors || []), optionId]
      : (data.factors || []).filter((id: string) => id !== optionId);
    
    onDataChange({ factors: newSelections });
  };

  return (
    <div className="space-y-4">
      <p className="font-gill-sans-light text-gray-600 text-center mb-6">
        What housing factors should we prioritize when recommending properties?
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <Checkbox
              checked={(data.factors || []).includes(option.id)}
              onCheckedChange={(checked) => handleChange(option.id, checked)}
            />
            <span className="font-gill-sans-light text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Step 7: Biggest Fear
export function BiggestFearStep({ data, onDataChange }: StepProps) {
  const options: RadioOption[] = [
    { value: "financial-overwhelming", label: "Financial cost overwhelming" },
  ];

  return (
    <div className="space-y-6">
      <p className="font-gill-sans-light text-gray-600 text-center mb-6">
        When your biggest fear about homebuying, in your own words?
      </p>
      
      <RadioGroup
        options={options}
        value={data.fear}
        onValueChange={(value) => onDataChange({ fear: value })}
        layout="vertical"
      />
    </div>
  );
}

// Step 8: Support Preferences
export function SupportPreferencesStep({ data, onDataChange }: StepProps) {
  return (
    <div className="space-y-6">
      <p className="font-gill-sans-light text-gray-600 text-center mb-6">
        What theories factors should we prioritize when recommending properties?
      </p>
      
      <div>
        <label className="block text-sm font-gill-sans-light text-gray-700 mb-2">
          Your answer
        </label>
        <Input
          type="text"
          placeholder="eg. Neighbourhood areas/amenities"
          value={data.support || ""}
          onChange={(e) => onDataChange({ support: e.target.value })}
          className="w-full"
        />
      </div>
    </div>
  );
}