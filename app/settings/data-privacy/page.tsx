"use client";

import { Shield } from "lucide-react";

import AppLayout from "@/components/layouts/app-layout";
import AuthGuard from "@/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";

export default function DataPrivacySettingsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="flex-1 bg-gray-50">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-gill-sans-regular text-xl text-gray-900">
                  Data Privacy
                </p>
                <p className="font-gill-sans-light text-gray-600 text-sm">
                  Manage how your data is stored, personalized, and used to power
                  your HomeTruth experience.
                </p>
              </div>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg text-gray-900">
                  AI Personalization Preferences
                </CardTitle>
                <p className="text-sm font-gill-sans-light text-gray-600">
                  Control how behavior and quiz responses are used to tailor
                  suggestions and tone.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Toggle
                  label="Enable behavior-based personalization"
                  description="Use recent actions to refine recommendations."
                  defaultChecked
                />
                <Toggle
                  label="Use chat history to refine insights"
                  description="Allow past chat context to influence suggestions."
                  defaultChecked
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg text-gray-900">
                  Consent &amp; Analytics
                </CardTitle>
                <p className="text-sm font-gill-sans-light text-gray-600">
                  Manage your consent and how anonymous data helps improve the
                  platform.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Toggle
                  label="GDPR data collection consent"
                  description="Allow processing of your data to provide the service."
                  defaultChecked
                />
                <Toggle
                  label="Allow anonymous usage analytics"
                  description="Help improve HomeTruth with anonymous engagement data."
                  defaultChecked
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg text-gray-900">
                  Data Control Options
                </CardTitle>
                <p className="text-sm font-gill-sans-light text-gray-600">
                  Export or delete your profile, preferences, and documents at
                  any time.
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button variant="outline">Export My Data</Button>
                <Button variant="destructive">Delete My Data</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  Uploaded Document Settings
                  <span className="rounded-full bg-purple-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-purple-800 ring-1 ring-purple-100">
                    Pro
                  </span>
                </CardTitle>
                <p className="text-sm font-gill-sans-light text-gray-600">
                  Control how long your files are stored and used after insights
                  are generated.
                </p>
              </CardHeader>
              <CardContent>
                <Toggle
                  label="Disable document retention"
                  description="Remove source files once insights are created."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
