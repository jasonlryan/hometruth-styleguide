import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Eye,
  BarChart3,
  Users,
  Crosshair,
  Bell,
  CheckCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header variant="landing" />

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="type-h1 text-white">
              Property Intelligence for Everyone
            </h1>
            <p className="type-body-lg font-gill-sans-light text-white/80 max-w-2xl mx-auto">
              Every property decision made with real intelligence, not guesswork.
            </p>
          </div>
        </div>
      </section>

      {/* Gradient line */}
      <div className="h-[3px] bg-gradient-to-r from-[#FF6B35] via-primary to-[#B19CD9]" />

      {/* Mission Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-semibold tracking-[2px] uppercase text-primary mb-4">
              Our Mission
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-gray-900 mb-6">
              We help people make better property decisions by giving them real answers.
            </h2>
            <div className="space-y-4">
              <p className="type-body-lg font-gill-sans-light text-gray-500 leading-relaxed">
                Specific to their property. Specific to their situation. Specific to their goals.
              </p>
              <p className="type-body-lg font-gill-sans-light text-gray-500 leading-relaxed">
                Not generic advice. Not forum posts from 2019. Actual guidance you can act on &mdash; for buying, owning, or renting out property.
              </p>
              <p className="type-body-lg font-gill-sans-light text-gray-500 leading-relaxed">
                We&apos;re the assistant who actually knows your property and tells you what you need to know before you need to know it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="type-h2 text-gray-900 mb-12">What We Believe</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Value 1 */}
              <Card className="border-0 shadow-sm border-l-4 border-l-primary rounded-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="type-h4 text-gray-900">Real Answers Over Easy Answers</h3>
                  </div>
                  <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                    We don&apos;t tell you what you want to hear. We tell you what you need to know.
                  </p>
                </CardContent>
              </Card>

              {/* Value 2 */}
              <Card className="border-0 shadow-sm border-l-4 border-l-[#FF6B35] rounded-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="h-5 w-5 text-[#FF6B35]" />
                    <h3 className="type-h4 text-gray-900">Clarity Over Complexity</h3>
                  </div>
                  <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                    Property is complicated. Our answers aren&apos;t.
                  </p>
                </CardContent>
              </Card>

              {/* Value 3 */}
              <Card className="border-0 shadow-sm border-l-4 border-l-[#B19CD9] rounded-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Bell className="h-5 w-5 text-[#B19CD9]" />
                    <h3 className="type-h4 text-gray-900">Proactive Over Reactive</h3>
                  </div>
                  <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                    We tell you what&apos;s coming before it becomes a crisis.
                  </p>
                </CardContent>
              </Card>

              {/* Value 4 */}
              <Card className="border-0 shadow-sm border-l-4 border-l-[#50C878] rounded-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="h-5 w-5 text-[#50C878]" />
                    <h3 className="type-h4 text-gray-900">Evidence Over Opinion</h3>
                  </div>
                  <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                    Our guidance is based on your property&apos;s actual data, not guesses.
                  </p>
                </CardContent>
              </Card>

              {/* Value 5 */}
              <Card className="border-0 shadow-sm border-l-4 border-l-primary rounded-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="type-h4 text-gray-900">Accessible Over Exclusive</h3>
                  </div>
                  <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                    Good property intelligence shouldn&apos;t be only for people who can afford advisors.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How We're Different Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="type-h2 text-gray-900 mb-12">How We&apos;re Different</h2>

            <div className="divide-y divide-gray-200">
              {/* Differentiator 1 */}
              <div className="grid md:grid-cols-[200px_1fr] gap-6 py-7">
                <div>
                  <Crosshair className="h-5 w-5 text-primary mb-2" />
                  <p className="type-h4 text-gray-900">Specific, not generic</p>
                </div>
                <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                  Every answer is about your property, your situation, your data. Not someone else&apos;s experience on a forum.
                </p>
              </div>

              {/* Differentiator 2 */}
              <div className="grid md:grid-cols-[200px_1fr] gap-6 py-7">
                <div>
                  <Bell className="h-5 w-5 text-[#FF6B35] mb-2" />
                  <p className="type-h4 text-gray-900">Proactive, not reactive</p>
                </div>
                <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                  We tell you what&apos;s coming up before you have to ask. The best guidance arrives before the problem does.
                </p>
              </div>

              {/* Differentiator 3 */}
              <div className="grid md:grid-cols-[200px_1fr] gap-6 py-7">
                <div>
                  <CheckCircle className="h-5 w-5 text-[#B19CD9] mb-2" />
                  <p className="type-h4 text-gray-900">Real answers, not opinions</p>
                </div>
                <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                  Our guidance is grounded in your property&apos;s actual history and data. Not what worked for someone else&apos;s house.
                </p>
              </div>

              {/* Differentiator 4 */}
              <div className="grid md:grid-cols-[200px_1fr] gap-6 py-7">
                <div>
                  <TrendingUp className="h-5 w-5 text-[#50C878] mb-2" />
                  <p className="type-h4 text-gray-900">Gets better over time</p>
                </div>
                <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                  The more you use HomeTruth, the more it understands your property. Your records grow, and so does the quality of your guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters (Stats) Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="type-h2 text-gray-900 mb-12">Why This Matters</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Stat 1 */}
              <div className="text-center px-4">
                <p className="text-5xl font-bold text-[#FF6B35] mb-2">63%</p>
                <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                  of first-time buyers regret their purchase
                </p>
              </div>

              {/* Stat 2 */}
              <div className="text-center px-4">
                <p className="text-5xl font-bold text-primary mb-2">42%</p>
                <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                  say costs were higher than expected
                </p>
              </div>

              {/* Stat 3 */}
              <div className="text-center px-4">
                <p className="text-5xl font-bold text-[#B19CD9] mb-2">&pound;40K</p>
                <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                  potential penalties landlords face for non-compliance
                </p>
              </div>

              {/* Stat 4 */}
              <div className="text-center px-4">
                <p className="text-5xl font-bold text-[#50C878] mb-2">37%</p>
                <p className="type-body font-gill-sans-light text-gray-500 leading-relaxed">
                  rise in maintenance costs since 2020
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
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
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-gill-sans-light"
              >
                Get Started Free
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
