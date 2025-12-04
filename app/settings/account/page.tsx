"use client";

import { UserRound } from "lucide-react";

import AppLayout from "@/components/layouts/app-layout";
import AuthGuard from "@/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

export default function AccountSettingsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="flex-1 bg-gray-50">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="font-gill-sans-regular text-xl text-gray-900">
                  Account
                </p>
                <p className="font-gill-sans-light text-gray-600 text-sm">
                  Manage your login details, password, and account preferences.
                </p>
              </div>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg text-gray-900">
                  Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="font-gill-sans-regular text-sm text-gray-800">
                    Email Address
                  </label>
                  <Input defaultValue="lujain@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="font-gill-sans-regular text-sm text-gray-800">
                    Password
                  </label>
                  <div className="space-y-3">
                    <Input placeholder="Enter your old password" type="password" />
                    <Input placeholder="Enter your new password" type="password" />
                    <Input placeholder="Confirm your new password" type="password" />
                  </div>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg text-gray-900">
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Button variant="destructive">Deactivate Account</Button>
                </div>
                <Toggle
                  label="Weekly Summary"
                  description="Receive a weekly summary of your activity."
                  defaultChecked
                />
                <div>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
