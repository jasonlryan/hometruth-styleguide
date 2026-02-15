"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  accentColor: string;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    title: "Getting Started",
    accentColor: "bg-primary",
    items: [
      {
        question: "How is this different from just Googling my questions?",
        answer:
          "Google gives you generic advice for generic properties. HomeTruth gives you answers specific to your property, based on your actual records, your maintenance history, and your situation. When you ask \u201Cshould I worry about my boiler?\u201D, we know which boiler you have and when it was last serviced.",
      },
      {
        question: "What do I need to get started?",
        answer:
          "Just your address. We\u2019ll pull in the basics about your property to get you going. From there, you can upload documents, receipts, photos\u2014anything that matters. The more you add, the better your answers get.",
      },
      {
        question: "Is it really free to start?",
        answer:
          "Yes. One property, no time limit, no credit card. You get document storage, basic questions answered, and maintenance reminders. Upgrade to Pro when you want unlimited questions and proactive guidance.",
      },
    ],
  },
  {
    title: "Your Data",
    accentColor: "bg-[#FF6B35]",
    items: [
      {
        question: "Where does my data go?",
        answer:
          "Your data is stored securely and encrypted. We don\u2019t sell it, share it, or use it for anything except giving you better answers about your property. You can export or delete it at any time.",
      },
      {
        question: "Can my records be changed or deleted by someone else?",
        answer:
          "No. Once a record is created, it can\u2019t be altered or removed. This protects you\u2014especially useful when selling, dealing with insurance, or resolving disputes. Your property history is permanent and tamper-proof.",
      },
      {
        question: "What happens to my data if I cancel?",
        answer:
          "Your data stays yours. You can export everything at any time. If you cancel Pro, you keep read access to your records on the free plan. We never hold your data hostage.",
      },
    ],
  },
  {
    title: "How It Works",
    accentColor: "bg-[#B19CD9]",
    items: [
      {
        question: "What kind of questions can I ask?",
        answer:
          "Anything about your property. \u201CWhen was my roof last inspected?\u201D \u201CWhat maintenance should I prioritise this year?\u201D \u201CAm I compliant with current landlord regulations?\u201D \u201CWhat should I budget for next quarter?\u201D The more records you\u2019ve uploaded, the more specific and useful the answers.",
      },
      {
        question: "Does it get smarter over time?",
        answer:
          "Yes. The more you use HomeTruth, the more it understands your property. Upload a receipt today, and six months from now we\u2019ll remind you when the warranty is about to expire. Your records build a complete picture that improves every answer.",
      },
    ],
  },
];

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group cursor-pointer"
      >
        <h3 className="type-h4 text-gray-900 pr-4 group-hover:text-primary transition-colors">
          {item.question}
        </h3>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        }`}
      >
        <p className="type-body text-gray-600 leading-relaxed">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header variant="landing" />

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-blue-600 to-purple-700 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="type-h1 text-white">
              Frequently Asked Questions
            </h1>
            <p className="type-body-lg text-white/80 font-gill-sans-light max-w-xl mx-auto">
              Real questions, direct answers. No jargon.
            </p>
          </div>
        </div>
      </section>

      {/* Gradient accent line */}
      <div className="h-[3px] bg-gradient-to-r from-[#FF6B35] via-primary to-[#B19CD9]" />

      {/* FAQ Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-14">
            {faqCategories.map((category) => (
              <div key={category.title}>
                <div className="mb-8">
                  <h2 className="type-h2 text-gray-900 inline-block pb-3 mb-0">
                    {category.title}
                  </h2>
                  <div className={`h-[3px] ${category.accentColor} w-full max-w-[180px]`} />
                </div>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    {category.items.map((item) => (
                      <FAQAccordionItem key={item.question} item={item} />
                    ))}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="type-h2 text-gray-900 mb-3">
              Still Have Questions?
            </h2>
            <p className="type-body-lg text-gray-600 font-gill-sans-light mb-8">
              We&apos;re here to help. Drop us a line and we&apos;ll get back to you.
            </p>
            <a
              href="mailto:hello@hometruth.io"
              className="inline-flex items-center gap-2 text-[#FF6B35] hover:underline font-semibold text-lg"
            >
              <Mail className="h-5 w-5" />
              hello@hometruth.io
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#FF6B35] to-[#B19CD9]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="type-h2 text-white mb-4">
              Start Making Better Property Decisions
            </h2>
            <p className="type-body-lg text-white/90 font-gill-sans-light mb-8">
              Free to start. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-gill-sans-light"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
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
