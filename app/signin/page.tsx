"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import OnboardingLayout from "@/components/layouts/onboarding-layout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";

export default function SignInPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        // Extract name from email for demo
        const userName = formData.email.split('@')[0];

        // For demo purposes:
        // - Emails containing 'new' will trigger onboarding flow
        // - All other emails are treated as existing users
        const isNewUser = formData.email.includes('new');

        // Set user in context
        setUser({
          name: userName.charAt(0).toUpperCase() + userName.slice(1),
          email: formData.email,
          hasCompletedOnboarding: !isNewUser,
        });

        // Redirect based on whether they need onboarding
        if (isNewUser) {
          router.push("/onboarding/welcome");
        } else {
          router.push("/dashboard");
        }
      }, 500);
    }
  };

  // Demo credentials helper
  const fillDemoCredentials = () => {
    setFormData({
      email: "demo@hometruth.com",
      password: "demo123",
    });
  };

  return (
    <OnboardingLayout showProgress={false}>
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B35] to-[#FF8A65] rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-gill-sans-regular text-xl">🏠</span>
              </div>
              <h1 className="type-h2 text-gray-900 mb-2">Welcome back</h1>
              <p className="font-gill-sans-light text-gray-600">
                Sign in to your HomeTruth account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-gill-sans-light text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  placeholder="Enter your email address"
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-gill-sans-light text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  placeholder="Enter your password"
                  className={errors.password ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Credentials Button */}
            <div className="mt-4 space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={fillDemoCredentials}
                disabled={isLoading}
              >
                Use Demo Credentials (Existing User)
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setFormData({ email: "newuser@example.com", password: "demo123" })}
                disabled={isLoading}
              >
                Try New User Onboarding
              </Button>
            </div>

            {/* Demo Instructions */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-gill-sans-light text-gray-600">
                <strong>Demo Mode:</strong> Use any email with "new" in it (e.g., newuser@example.com) to see the onboarding flow, or any other email to sign in as an existing user.
              </p>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-sm font-gill-sans-light text-gray-600">
                New to HomeTruth?{" "}
                <Link href="/onboarding" className="text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}