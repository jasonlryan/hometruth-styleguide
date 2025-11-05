"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Zap, Lock, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ChatIcon, ProfileIcon, InsightsIcon, SaveIcon } from "@/components/icons/geometric-icons";
import { useState } from "react";

export default function HomeTruthWaitlist() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 800));
      setJoined(true);
      setEmail("");
      setTimeout(() => setJoined(false), 3000);
    } catch (error) {
      console.error("Error joining waitlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="flex w-full items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/hometruth-icon.svg"
              alt="HomeTruth"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="hidden lg:inline text-xl font-gill-sans-light text-gray-900">
              HomeTruth
            </span>
          </Link>
          <div className="w-12" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(/images/hero-houses.png)`,
            backgroundPosition: "center",
            filter: "brightness(0.65)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-gill-sans-light text-white leading-tight">
              All of the Truth. None of the Noise.
            </h1>
            <p className="text-xl md:text-2xl text-white font-gill-sans-light">
              Your home, fully understood.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="pt-12 md:pt-16 pb-2 md:pb-3 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-3xl md:text-4xl font-gill-sans-light text-gray-900">
                The <span className="text-primary">Home</span> <span className="text-purple-600">Truth</span> Platform
              </h2>
            </div>

            <div className="prose prose-gray max-w-none space-y-3">
              <div className="space-y-3">
                <p className="text-lg text-gray-700 leading-relaxed font-gill-sans-light">
                  We are building The Truth Platform, your single source of property truth.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed font-gill-sans-light">
                  With complete clarity about your home – its history, its current state, its potential – you make better decisions.  You maximise value.  You stay ahead of problems.  You own your home with confidence.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed font-gill-sans-light">
                  HomeTruth puts you in control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Advisor Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left side - Text */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="text-5xl">✨</div>
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900">
                      Your Trusted Advisor
                    </h3>
                    <p className="text-lg text-gray-700 font-gill-sans-light leading-relaxed">
                      An AI-powered helper guiding you through every aspect of homeownership. You stay in control—always.
                    </p>
                    <div className="pt-4">
                      <div className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold">
                        Available to all members
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Benefits */}
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 hidden md:flex items-center justify-center p-8">
                  <div className="space-y-5 w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center flex-shrink-0 shadow-md border-2 border-teal-100">
                        <SaveIcon size={32} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-base">Organise</p>
                        <p className="text-sm text-gray-600">Everything in one place</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center flex-shrink-0 shadow-md border-2 border-purple-100">
                        <InsightsIcon size={32} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-base">Prioritise</p>
                        <p className="text-sm text-gray-600">What matters now, what can wait.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0 shadow-md border-2 border-blue-100">
                        <ChatIcon size={32} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-base">Guide</p>
                        <p className="text-sm text-gray-600">Confidence at every step</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA Section */}
      <section className="py-6 md:py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Waitlist CTA - Prominent */}
            <div className="bg-gray-800 rounded-3xl p-8 md:p-10 shadow-lg">
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="text-3xl md:text-4xl font-gill-sans-light text-white">
                    Join the Waitlist
                  </h2>
                  <p className="text-lg text-white/90 font-gill-sans-light">
                    Be first to access HomeTruth when we launch
                  </p>
                </div>

                <form onSubmit={handleJoinWaitlist} className="space-y-3 max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 h-12 border-gray-300 focus:border-primary text-base"
                      disabled={loading}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="bg-white text-black hover:bg-gray-100 px-8 h-12 text-base whitespace-nowrap font-semibold"
                    >
                      {loading ? "Joining..." : "Join"}
                      {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </div>
                  {joined && (
                    <div className="bg-green-100/20 border border-green-400 rounded-lg p-3 text-center">
                      <p className="text-green-100 font-semibold">
                        ✓ Welcome! Check your email to confirm.
                      </p>
                    </div>
                  )}
                </form>

                <p className="text-sm text-white/80 text-center">
                  No spam, ever. We'll be in touch with updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-8 md:pt-10 pb-12 md:pb-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-gill-sans-light text-gray-900">
              Designed for peace of mind
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Pillar 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl mx-auto flex items-center justify-center group-hover:shadow-lg transition-all transform group-hover:scale-110 shadow-md border-2 border-blue-100">
                  <ChatIcon size={56} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">One Source of Truth</h3>
              <p className="text-gray-600 text-sm leading-relaxed break-words">
                Everything about your home, together and trusted.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl mx-auto flex items-center justify-center group-hover:shadow-lg transition-all transform group-hover:scale-110 shadow-md border-2 border-purple-100">
                  <InsightsIcon size={56} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clarity When It Counts</h3>
              <p className="text-gray-600 text-sm leading-relaxed break-words">
                The signal, not the noise — so choices feel obvious.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl mx-auto flex items-center justify-center group-hover:shadow-lg transition-all transform group-hover:scale-110 shadow-md border-2 border-orange-100">
                  <ProfileIcon size={56} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Nasty Surprises</h3>
              <p className="text-gray-600 text-sm leading-relaxed break-words">
                Risks surfaced early, deadlines never missed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm font-gill-sans-regular">
              © 2025 HomeTruth. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

