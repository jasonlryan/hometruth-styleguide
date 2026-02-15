import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import FaqAccordion from "./faq-accordion";

const faqItems = [
  {
    question: "Can I really start for free?",
    answer:
      "Yes. Add one property, upload your documents, ask questions. No credit card, no time limit. Upgrade when you want more.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data stays yours. You can export everything at any time. If you cancel Pro, you keep read access to your records on the free plan.",
  },
  {
    question: "Do I need Pro for each property?",
    answer:
      "The free plan covers one property. Pro is per property. Landlords with five or more properties get the volume rate automatically.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header variant="landing" />

      {/* Hero Section */}
      <section className="relative py-16 lg:py-20 bg-[#1A1A1A] overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="type-h1 text-white">
              Simple, Transparent Pricing
            </h1>
            <p className="type-body-lg text-white/80 font-gill-sans-light">
              Free to start. Upgrade when you need more.
            </p>
          </div>
        </div>
      </section>
      {/* Gradient accent line */}
      <div className="h-[3px] bg-gradient-to-r from-[#FF6B35] via-[hsl(var(--primary))] to-[#B19CD9]" />

      {/* Pricing Tiers */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-[1100px] mx-auto">

            {/* Free Tier */}
            <Card className="border border-gray-200 rounded shadow-sm flex flex-col">
              <CardContent className="p-8 flex flex-col flex-1">
                <h3 className="type-h4 text-black mb-2">Free</h3>
                <div className="text-5xl font-bold text-[hsl(var(--primary))] mb-1">
                  &pound;0
                </div>
                <p className="text-sm text-gray-500 mb-6">Forever</p>
                <p className="type-body text-gray-500 mb-7 leading-relaxed">
                  Get started with your first property. See what real answers feel like.
                </p>
                <ul className="space-y-0 mb-8 flex-1">
                  {[
                    "One property",
                    "Upload and store your documents",
                    "Basic property questions answered",
                    "Maintenance reminders",
                    "Your data stays yours",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 py-2.5 border-b border-gray-100 text-[15px] text-gray-700"
                    >
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/chat" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white font-semibold"
                  >
                    Start Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Tier - Featured */}
            <Card className="border-2 border-[#FF6B35] rounded shadow-sm flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#FF6B35] text-white text-xs font-semibold tracking-wide uppercase px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardContent className="p-8 flex flex-col flex-1">
                <h3 className="type-h4 text-black mb-2">Pro</h3>
                <div className="text-5xl font-bold text-[#FF6B35] mb-1">
                  &pound;8
                  <span className="text-xl font-normal text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">Per property</p>
                <p className="type-body text-gray-500 mb-7 leading-relaxed">
                  Everything you need to stay on top of your property. The full picture, always up to date.
                </p>
                <ul className="space-y-0 mb-8 flex-1">
                  {[
                    "Unlimited questions about your property",
                    "Proactive maintenance guidance",
                    "Complete document storage",
                    "Warranty and service tracking",
                    "Cost tracking and history",
                    "Property report when you sell",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 py-2.5 border-b border-gray-100 text-[15px] text-gray-700"
                    >
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/chat" className="w-full">
                  <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold">
                    Start Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Landlord Tier */}
            <Card className="border border-gray-200 rounded shadow-sm flex flex-col">
              <CardContent className="p-8 flex flex-col flex-1">
                <h3 className="type-h4 text-black mb-2">For Landlords</h3>
                <div className="text-5xl font-bold text-[#B19CD9] mb-1">
                  &pound;6
                  <span className="text-xl font-normal text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">Per property (5+ properties)</p>
                <p className="type-body text-gray-500 mb-7 leading-relaxed">
                  Manage your portfolio without the chaos. Stay compliant, stay informed.
                </p>
                <ul className="space-y-0 mb-8 flex-1">
                  {[
                    "Everything in Pro",
                    "Portfolio dashboard",
                    "Compliance tracking",
                    "Multi-property reporting",
                    "Tenant documentation",
                    "Dedicated support",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 py-2.5 border-b border-gray-100 text-[15px] text-gray-700"
                    >
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="mailto:hello@hometruth.io" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white font-semibold"
                  >
                    Get in Touch
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* HomeTruth Report Callout */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="type-h2 text-black mb-3">Buying a Property?</h2>
            <p className="type-body-lg text-gray-500 mb-7 leading-relaxed max-w-2xl mx-auto">
              Request a HomeTruth Report on any property you&apos;re viewing.
              See the verified maintenance history, past issues, and what to
              watch out for. Make your offer with confidence.
            </p>
            <Button className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold px-8 py-3 text-base">
              &pound;29 One-Time Report
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-[720px] mx-auto">
            <h2 className="type-h2 text-black mb-10">Common Questions</h2>
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-[#FF6B35] to-[#B19CD9]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="type-h2 text-white mb-4">
              Start Making Better Property Decisions
            </h2>
            <p className="type-body-lg text-white/90 mb-8">
              Free to start. No credit card required.
            </p>
            <Link href="/chat">
              <Button
                size="lg"
                className="bg-white text-[#1A1A1A] hover:bg-gray-100 px-8 py-3 text-lg font-gill-sans-light"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}
