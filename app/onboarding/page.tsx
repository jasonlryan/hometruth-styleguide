"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import OnboardingLayout from "@/components/layouts/onboarding-layout";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    homeAddress: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.homeAddress.trim()) newErrors.homeAddress = "Home address is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically save to database/API
      router.push("/onboarding/welcome");
    }
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
              <h1 className="type-h2 text-gray-900 mb-2">Create your account</h1>
              <p className="font-gill-sans-light text-gray-600">
                Join us to find your perfect home.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-gill-sans-light text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange("firstName")}
                  placeholder="Enter your first name"
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-gill-sans-light text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange("lastName")}
                  placeholder="Enter your last name"
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
                )}
              </div>

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
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Home Address */}
              <div>
                <label className="block text-sm font-gill-sans-light text-gray-700 mb-1">
                  Home Address
                </label>
                <Input
                  type="text"
                  value={formData.homeAddress}
                  onChange={handleInputChange("homeAddress")}
                  placeholder="Enter your home address"
                  className={errors.homeAddress ? "border-red-500" : ""}
                />
                {errors.homeAddress && (
                  <p className="text-xs text-red-600 mt-1">{errors.homeAddress}</p>
                )}
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-sm font-gill-sans-light text-gray-700 mb-1">
                  Phone <span className="text-gray-400">(Optional)</span>
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                  placeholder="Enter your phone number"
                />
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
                  placeholder="Create a password"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-gill-sans-light text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#00BFFF] hover:bg-blue-600 text-white py-3 mt-6"
              >
                Join Now
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <p className="text-sm font-gill-sans-light text-gray-600">
                Already have an account?{" "}
                <Link href="/signin" className="text-[#00BFFF] hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}