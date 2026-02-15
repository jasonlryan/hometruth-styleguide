"use client";

import React from "react";
import AppLayout from "@/components/layouts/app-layout";
import AuthGuard from "@/components/auth-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircle, FileText, Calculator, BookOpen, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppLayout>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 p-6 space-y-6">
        {/* Welcome Header */}
        <div className="text-center py-8">
          <h1 className="type-h1 text-gray-900 mb-4">Welcome to HomeTruth</h1>
          <p className="font-gill-sans-light text-gray-600 max-w-2xl mx-auto">
            Your property assistant. Ask questions, get real answers, and stay on top of your property.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Ask HomeTruth */}
          <Link href="/chat">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="type-h4 text-gray-900 mb-2">Ask HomeTruth</h3>
                <p className="type-body text-gray-600">
                  Get instant answers to your property questions
                </p>
                <Button variant="ghost" size="sm" className="mt-3 text-primary">
                  Start Chat <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Documents */}
          <Link href="/documents">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#FF6B35] rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="type-h4 text-gray-900 mb-2">Documents</h3>
                <p className="type-body text-gray-600">
                  Upload and manage your property documents
                </p>
                <Button variant="ghost" size="sm" className="mt-3 text-[#FF6B35]">
                  Manage Docs <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Budget Calculator */}
          <Link href="/budget">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#10B981] rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <h3 className="type-h4 text-gray-900 mb-2">Budget Calculator</h3>
                <p className="type-body text-gray-600">
                  Calculate affordability and costs
                </p>
                <Button variant="ghost" size="sm" className="mt-3 text-[#10B981]">
                  Calculate <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Saved Notes */}
          <Link href="/notes">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#B19CD9] rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="type-h4 text-gray-900 mb-2">Saved Notes</h3>
                <p className="type-body text-gray-600">
                  Review your saved notes and property details
                </p>
                <Button variant="ghost" size="sm" className="mt-3 text-[#B19CD9]">
                  View Notes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="type-h3 text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-sm">1</span>
                </div>
                  <div className="flex-1">
                    <h4 className="font-gill-sans-regular text-gray-900">Ask your first question</h4>
                    <p className="type-body text-gray-600">Try asking about property prices, mortgage rates, or local market trends.</p>
                  </div>
                  <Link href="/chat">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Try Now
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-gill-sans-regular text-gray-900">Upload your documents</h4>
                    <p className="type-body text-gray-600">Keep all your property documents organized in one place.</p>
                  </div>
                  <Link href="/documents">
                    <Button size="sm" variant="outline" className="border-[#FF6B35] text-[#FF6B35]">
                      Upload
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </AppLayout>
    </AuthGuard>
  );
}
