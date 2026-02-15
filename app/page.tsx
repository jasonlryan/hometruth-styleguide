"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  Lock,
  Shield,
  Flag,
  ArrowRight,
} from "lucide-react";
import { ChatIcon, ProfileIcon, InsightsIcon, SaveIcon } from "@/components/icons/geometric-icons";
import Link from "next/link";
import Header from "@/components/header";
import Banner from "@/components/banner";
import heroImg from "@/images/website-mockups/image_023_page_21.png";
import Footer from "@/components/footer";
import { useEffect } from "react";

export default function HomeTruthLanding() {
  useEffect(() => {
    // Suppress hydration warnings for browser extension attributes
    const suppressHydrationWarning = (e: Event) => {
      if (e.type === 'error' && e instanceof ErrorEvent) {
        if (e.message?.includes('Hydration failed') || e.message?.includes('data-dashlane')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    window.addEventListener('error', suppressHydrationWarning, true);
    return () => window.removeEventListener('error', suppressHydrationWarning, true);
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <Header variant="landing" />

      {/* Hero Section */}
      <Banner
        title="Your Property Intelligence Platform"
        subtitle="Get real answers for your property decisions — from someone who actually knows."
        gradient="blue-50-purple-50"
        textColor="text-white"
        showBackgroundImage
        backgroundImage={heroImg}
        imageOpacity={100}
        useTextPanel={false}
        imageBrightness={65}
        className="!py-24 lg:!py-32"
      />
      <section className="py-8 bg-blue-50/70">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Ask HomeTruth Section Title */}
            <div className="text-center mb-4">
              <h2 className="type-h2 text-gray-900 mb-2">
                Ask HomeTruth
              </h2>
              <p className="text-lg font-gill-sans-light text-gray-600">
                Your property assistant for buying, owning, and managing your home.
              </p>
            </div>

            {/* Featured Chat Interface - Centered */}
            <div className="max-w-3xl mx-auto relative">
              {/* Subtle background glow */}
              <div className="absolute inset-0 -z-10 transform scale-105 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-[var(--ht-secondary)] opacity-10 blur-xl"></div>
              <Link href="/chat">
                <Card className="shadow-xl hover:shadow-2xl border-0 bg-white cursor-pointer transition-all duration-300 ring-1 ring-gray-200 hover:ring-2 hover:ring-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <span className="font-gill-sans-light text-gray-800">
                        HomeTruth Assistant
                      </span>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Online
                      </Badge>
                    </div>

                    {/* Sample conversation */}
                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                          <p className="text-sm text-gray-800">
                            Hi! I&apos;m your property assistant. What would you like
                            to know?
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="rounded-lg bg-primary p-3 text-primary-foreground max-w-md">
                          <p className="text-sm">What is leasehold?</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                          <p className="text-sm text-gray-800">
                            Leasehold means you own the property for a fixed
                            period, but not the land it&apos;s built on. The land
                            belongs to the freeholder...
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sample questions */}
                    <div className="space-y-2 mb-4">
                      <p className="type-caption mb-2">Try asking:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge
                          variant="secondary"
                          className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          How much stamp duty will I pay?
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          What&apos;s my property worth?
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          Should I remortgage?
                        </Badge>
                      </div>
                    </div>

                    {/* Input area */}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Ask any property question..."
                        className="flex-1 border-gray-200 focus:border-primary"
                      />
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
                >
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pro">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg bg-transparent"
                >
                  Explore Pro Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="type-h2 text-black mb-4">How It Works</h2>
            <p className="type-body-lg text-gray-600 max-w-2xl mx-auto">
              Four steps to real answers about your property
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-gray-100">
                  <ChatIcon size={48} />
                </div>
              </div>
              <h3 className="type-h4 text-black mb-2">Add Your Property</h3>
              <p className="type-body text-gray-600">
                Start with your address. We&apos;ll pull in the basics.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-gray-100">
                  <ProfileIcon size={48} />
                </div>
              </div>
              <h3 className="type-h4 text-black mb-2">Upload Your Records</h3>
              <p className="type-body text-gray-600">
                Add documents, receipts, photos. Everything that matters about your property.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-gray-100">
                  <InsightsIcon size={48} />
                </div>
              </div>
              <h3 className="type-h4 text-black mb-2">Ask Questions</h3>
              <p className="type-body text-gray-600">
                Get answers specific to your property — not generic advice.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-gray-100">
                  <SaveIcon size={48} />
                </div>
              </div>
              <h3 className="type-h4 text-black mb-2">Stay Proactive</h3>
              <p className="type-body text-gray-600">
                We&apos;ll tell you what&apos;s coming up, what to watch, what matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section id="security" className="py-6 bg-blue-50/70">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="type-h2 text-black mb-4">Trust & Security</h2>
            <p className="type-body-lg text-gray-600 max-w-2xl mx-auto">
              Your information stays yours. Always.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Encryption */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary mx-auto mb-4 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="type-h4 text-black mb-2">Complete Records</h3>
                <p className="type-body text-gray-600">
                  Your property history is permanent and tamper-proof.
                </p>
              </CardContent>
            </Card>

            {/* GDPR Compliance */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-[#FF6B35] rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Flag className="h-6 w-6 text-white" />
                </div>
                <h3 className="type-h4 text-black mb-2">GDPR Compliant</h3>
                <p className="type-body text-gray-600">
                  Your privacy is built into how we work.
                </p>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-[#B19CD9] rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="type-h4 text-black mb-2">Your Privacy</h3>
                <p className="type-body text-gray-600">
                  Your information stays yours, period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 bg-gradient-to-r from-[hsl(var(--primary))] to-[var(--ht-secondary)]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="type-h2 text-white mb-6">
              Start Making Better Property Decisions
            </h2>
            <p className="type-body-lg text-white/90 mb-8">
              Free to start. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-gill-sans-light"
                >
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pro">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg bg-transparent"
                >
                  Explore Pro Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}
