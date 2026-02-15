import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  BookOpen,
  Settings,
  Bookmark,
  DollarSign,
  Lock,
  Shield,
  Flag,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProFeatureCard from "@/components/pro-feature-card";

export default function ProFeatures() {
  return (
    <div className="min-h-screen bg-white">
      <Header variant="landing" showProButton={false} />

      {/* Compact Hero Section */}
      <section className="relative py-8 bg-gradient-to-br from-blue-600 to-purple-700 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="type-h1 text-white">
              Explore Pro Features
            </h1>
            <p className="type-body-lg text-white">
              Your Home. Your Terms. Your Advantage.
            </p>
            <p className="type-body max-w-2xl mx-auto text-white/90">
              Get answers that draw on your actual documents, alerts before things go wrong, and guidance specific to your property.
            </p>
          </div>
        </div>
      </section>

      {/* What You Get with Pro Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="type-h2 text-black mb-2">What You Get with Pro</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProFeatureCard
              icon={Brain}
              title="Chat With Your Documents"
              description="Upload legal documents and ask questions — get answers based on what's actually in them."
              iconBgColor="bg-primary"
              examples={[
                "What's my earliest break clause?",
                "Does my contract mention damp issues?"
              ]}
            />
            
            <ProFeatureCard
              icon={FileText}
              title="Document Vault"
              description="Store, organize, and manage key property documents securely."
              iconBgColor="bg-[#FF6B35]"
              additionalInfo="PDF, DOCX, JPG, PNG"
            />
            
            <ProFeatureCard
              icon={BookOpen}
              title="Notes & Organisation"
              description="Save unlimited notes and organise your conversations by topic, timeline, or property."
              iconBgColor="bg-[#B19CD9]"
            />
            
            <ProFeatureCard
              icon={Settings}
              title="Answers Shaped by You"
              description="Your assistant adapts to your preferences, communication style, and needs."
              iconBgColor="bg-gradient-to-br from-[hsl(var(--primary))] to-[var(--ht-secondary)]"
            />
            
            <ProFeatureCard
              icon={Bookmark}
              title="Save Listings as You Browse"
              description="Bookmark homes from any property site and view them all on your dashboard."
              iconBgColor="bg-[#FF6B35]"
            />
            
            <ProFeatureCard
              icon={DollarSign}
              title="Budget Planner"
              description="Easy-to-use calculator for estimating affordability and planning your budget."
              iconBgColor="bg-[#B19CD9]"
            />
          </div>
        </div>
      </section>

      {/* Upgrade Section */}
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="type-h2 text-primary mb-3">
              Upgrade for £8/month per property
            </h2>
            <p className="text-base font-gill-sans-light text-gray-600 mb-6">
              Everything you need to feel confident, organised, and informed
              about your property.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/chat">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-2 font-gill-sans-light bg-transparent"
                >
                  Start Free
                </Button>
              </Link>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 font-gill-sans-light"
              >
                Upgrade to Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="type-h2 text-black mb-2">Trust & Security</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {/* Encryption */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-3 flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-gill-sans-light text-gray-600">Records that can&apos;t be changed or lost.</p>
            </div>

            {/* GDPR Compliance */}
            <div className="text-center">
              <div className="w-12 h-12 bg-[#FF6B35] rounded-full mx-auto mb-3 flex items-center justify-center">
                <Flag className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-gill-sans-light text-gray-600">
                GDPR compliant from the ground up.
              </p>
            </div>

            {/* Privacy */}
            <div className="text-center">
              <div className="w-12 h-12 bg-[#B19CD9] rounded-full mx-auto mb-3 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-gill-sans-light text-gray-600">
                We never sell your data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="app" />
    </div>
  );
}
