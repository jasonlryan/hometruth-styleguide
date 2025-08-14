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
        title="Make smarter decisions with HomeTruth"
        subtitle="Ask questions. Save answers. Upload documents."
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
                Your AI copilot for buying, selling, and managing property.
              </p>
            </div>

            {/* Featured Chat Interface - Centered */}
            <div className="max-w-3xl mx-auto relative">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00BFFF]/5 to-[#B19CD9]/5 rounded-2xl blur-xl transform scale-105 -z-10"></div>
              <Link href="/chat">
                <Card className="shadow-xl hover:shadow-2xl border-0 bg-white cursor-pointer transition-all duration-300 ring-1 ring-gray-200 hover:ring-2 hover:ring-[#00BFFF]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <MessageCircle className="h-5 w-5 text-[#00BFFF]" />
                      <span className="font-gill-sans-light text-gray-800">
                        HomeTruth AI Assistant
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
                            Hi! I'm your property assistant. What would you like
                            to know?
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-[#00BFFF] text-white rounded-lg p-3 max-w-md">
                          <p className="text-sm">What is leasehold?</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                          <p className="text-sm text-gray-800">
                            Leasehold means you own the property for a fixed
                            period, but not the land it's built on. The land
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
                          className="cursor-pointer hover:bg-[#00BFFF] hover:text-white transition-colors"
                        >
                          How much stamp duty will I pay?
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-[#00BFFF] hover:text-white transition-colors"
                        >
                          What's my property worth?
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-[#00BFFF] hover:text-white transition-colors"
                        >
                          Should I remortgage?
                        </Badge>
                      </div>
                    </div>

                    {/* Input area */}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Ask any property question..."
                        className="flex-1 border-gray-200 focus:border-[#00BFFF]"
                      />
                      <Button
                        size="sm"
                        className="bg-[#00BFFF] hover:bg-blue-600"
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
              <Button
                size="lg"
                className="bg-[#00BFFF] hover:bg-blue-600 text-white px-8 py-3 text-lg"
              >
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/pro">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white px-8 py-3 text-lg bg-transparent"
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
              Four simple steps to transform your property journey
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
              <h3 className="type-h4 text-black mb-2">Ask Questions</h3>
              <p className="type-body text-gray-600">
                Start by asking any property-related question to our AI
                assistant
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-gray-100">
                  <ProfileIcon size={48} />
                </div>
              </div>
              <h3 className="type-h4 text-black mb-2">Personalize Profile</h3>
              <p className="type-body text-gray-600">
                Tell us about your preferences to get more tailored advice
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-gray-100">
                  <InsightsIcon size={48} />
                </div>
              </div>
              <h3 className="type-h4 text-black mb-2">Get Smart Insights</h3>
              <p className="type-body text-gray-600">
                Receive personalized insights based on your specific situation
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-gray-100">
                  <SaveIcon size={48} />
                </div>
              </div>
              <h3 className="type-h4 text-black mb-2">Save What Matters</h3>
              <p className="type-body text-gray-600">
                Bookmark important information and create notes for future
                reference
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
              Your data and privacy are our top priorities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Encryption */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-[#00BFFF] rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="type-h4 text-black mb-2">Encryption</h3>
                <p className="type-body text-gray-600">
                  Your data is encrypted with industry-standard security
                  protocols
                </p>
              </CardContent>
            </Card>

            {/* GDPR Compliance */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-[#FF6B35] rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Flag className="h-6 w-6 text-white" />
                </div>
                <h3 className="type-h4 text-black mb-2">GDPR Compliance</h3>
                <p className="type-body text-gray-600">
                  We respect your privacy and comply with all data protection
                  regulations
                </p>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-[#B19CD9] rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="type-h4 text-black mb-2">Privacy</h3>
                <p className="type-body text-gray-600">
                  We prioritize your information safety and never share your
                  data
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 bg-gradient-to-r from-[#00BFFF] to-[#B19CD9]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="type-h2 text-white mb-6">
              Ready to Transform Your Property Journey?
            </h2>
            <p className="type-body-lg text-white/90 mb-8">
              Join thousands of homeowners who trust HomeTruth for smarter
              property decisions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-[#00BFFF] hover:bg-gray-100 px-8 py-3 text-lg font-gill-sans-light"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/pro">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#00BFFF] px-8 py-3 text-lg bg-transparent"
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
