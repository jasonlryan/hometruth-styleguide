"use client";

import { useState } from "react";
import { MessageCircle, Sparkles, Star, PenLine } from "lucide-react";

import AppLayout from "@/components/layouts/app-layout";
import AuthGuard from "@/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";

export default function PreferencesPage() {
  const [tone, setTone] = useState("friendly");
  const [responseStyle, setResponseStyle] = useState("narrative");

  const tagPills = ["parks", "public transport", "balcony"];

  return (
    <AuthGuard>
      <AppLayout>
        <div className="flex-1 bg-gray-50">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-gill-sans-regular text-xl text-gray-900">
                  Preferences
                </p>
                <p className="font-gill-sans-light text-gray-600 text-sm">
                  Tune how HomeTruth responds, what it prioritises, and how it
                  personalises checklists and guidance.
                </p>
              </div>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Communication Tone &amp; Style
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    Reset to default
                  </Button>
                </div>
                <p className="font-gill-sans-light text-sm text-gray-600">
                  HomeTruth remembers your preferred tone and format for answers.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="font-gill-sans-regular text-gray-900">
                    How would you like HomeTruth to speak with you?
                  </p>
                  <RadioGroup
                    options={[
                      { value: "formal", label: "Formal" },
                      { value: "friendly", label: "Friendly" },
                      { value: "encouraging", label: "Encouraging" },
                    ]}
                    value={tone}
                    onValueChange={setTone}
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-gill-sans-regular text-gray-900">
                    Response style
                  </p>
                  <RadioGroup
                    layout="horizontal"
                    options={[
                      { value: "bullet", label: "Bullet points" },
                      { value: "narrative", label: "Narrative summary" },
                      { value: "visual", label: "Visual aids (charts/icons)" },
                    ]}
                    value={responseStyle}
                    onValueChange={setResponseStyle}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Assistant Behaviour
                </CardTitle>
                <p className="font-gill-sans-light text-sm text-gray-600">
                  Control how much your assistant adapts to you.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Toggle
                  label="Suggest follow-up questions after answers"
                  defaultChecked
                />
                <Toggle
                  label="Link advice to my notes and profile"
                  defaultChecked
                />
                <Toggle
                  label="Convert short answers into full checklists"
                  description="Expands brief replies into actionable next steps."
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <Star className="h-5 w-5 text-primary" />
                  Lifestyle Priorities
                </CardTitle>
                <p className="font-gill-sans-light text-sm text-gray-600">
                  Tags are used for search and checklist personalisation.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-gill-sans-regular text-gray-900">
                  What lifestyle factors should we prioritise?
                </p>
                <div className="flex flex-wrap gap-3">
                  <Input
                    placeholder="Enter keywords like 'natural light', 'pet-friendly', 'quiet area'"
                    className="w-full md:w-auto flex-1"
                  />
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Add New
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tagPills.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-gill-sans-regular text-blue-900 ring-1 ring-blue-100"
                    >
                      {tag}
                      <button
                        type="button"
                        className="text-xs text-blue-700 hover:text-blue-900"
                        aria-label={`Remove ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <PenLine className="h-5 w-5 text-primary" />
                  Quiz Settings
                </CardTitle>
                <p className="font-gill-sans-light text-sm text-gray-600">
                  Update the information you provided during signup.
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-gill-sans-regular text-gray-900">
                    Edit my answers?
                  </p>
                  <p className="text-sm font-gill-sans-light text-gray-600">
                    Refresh your onboarding selections and lifestyle inputs.
                  </p>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Update Answers
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Personalisation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Toggle
                  label="Use my profile & behaviour to personalise"
                  description="Turning this off disables adaptive checklists and tone personalisation."
                  defaultChecked
                />
              </CardContent>
              <div className="flex justify-end px-6 pb-6">
                <Button variant="outline">Return to default</Button>
              </div>
            </Card>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
