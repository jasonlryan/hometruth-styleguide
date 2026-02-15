"use client";

import { Bell } from "lucide-react";

import AppLayout from "@/components/layouts/app-layout";
import AuthGuard from "@/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";

export default function NotificationSettingsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="flex-1 bg-gray-50">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-gill-sans-regular text-xl text-gray-900">
                  Notifications
                </p>
                <p className="font-gill-sans-light text-gray-600 text-sm">
                  Stay on top of property updates, follow-ups, and feature
                  alerts.
                </p>
              </div>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg text-gray-900">
                  Checklist &amp; Task Updates
                </CardTitle>
                <p className="text-sm font-gill-sans-light text-gray-600">
                  Stay on top of your property process with personalised
                  checklists and reminders.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Toggle
                  label="Document analysis complete"
                  description="Be notified when your property documents have been reviewed."
                  badge="PRO"
                  defaultChecked
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg text-gray-900">
                  Chat Follow-ups
                </CardTitle>
                <p className="text-sm font-gill-sans-light text-gray-600">
                  Let HomeTruth follow up with helpful tips or summaries after a
                  chat.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Toggle
                  label="Chat summary follow-ups"
                  description="Get summaries and suggested actions after asking questions."
                  defaultChecked
                />
                <Toggle
                  label="New property guidance available"
                  description="Be alerted when new document-based insights are added to your dashboard."
                  badge="PRO"
                  defaultChecked
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg text-gray-900">
                  Listings &amp; Discovery Alerts
                </CardTitle>
                <p className="text-sm font-gill-sans-light text-gray-600">
                  Control alerts related to new listings and bookmarks.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Toggle
                  label="Property alerts"
                  description="Be notified when a listing matches your lifestyle and saved tags."
                  defaultChecked
                />
                <Toggle
                  label="Extension save confirmations"
                  description="Show a toast when saving a listing from a partner site."
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg text-gray-900">
                  Product Tips &amp; Feature Updates
                </CardTitle>
                <p className="text-sm font-gill-sans-light text-gray-600">
                  Stay informed on product improvements and tips.
                </p>
              </CardHeader>
              <CardContent>
                <Toggle
                  label="Tips & product updates"
                  description="Occasional guidance on how to use features and product updates."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
