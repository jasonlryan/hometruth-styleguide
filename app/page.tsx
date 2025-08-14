import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Lock, Shield, Flag, ArrowRight, CheckCircle, Brain, Bookmark } from "lucide-react"

export default function HomeTruthLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo with TH building blocks */}
            <div className="flex items-center">
              <img
                src="/images/hometruth-logo.png"
                alt="HomeTruth - Your Personal Property Assistant"
                className="h-12 w-auto"
              />
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-[#00BFFF] transition-colors"
              style={{ fontFamily: "Gill Sans, sans-serif" }}
            >
              How It Works
            </a>
            <a
              href="#security"
              className="text-gray-600 hover:text-[#00BFFF] transition-colors"
              style={{ fontFamily: "Gill Sans, sans-serif" }}
            >
              Security
            </a>
            <Button
              variant="outline"
              className="border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white bg-transparent"
            >
              Explore Pro Features
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <p
                className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto"
                style={{ fontFamily: "Gill Sans, sans-serif" }}
              >
                We help you make smarter decisions, whether you're buying your first home, managing a portfolio, or
                planning for the future.
              </p>
              <p className="text-lg text-gray-600" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Ask questions. Save answers. Upload documents. Get insights.
              </p>
            </div>

            {/* Building block decorative elements */}
            <div className="flex justify-center space-x-2 opacity-60">
              <div className="w-8 h-8 bg-[#FF6B35] rounded transform rotate-12"></div>
              <div className="w-8 h-8 bg-[#00BFFF] rounded transform -rotate-6"></div>
              <div className="w-8 h-8 bg-[#B19CD9] rounded transform rotate-3"></div>
            </div>

            {/* Featured Chat Interface - Centered */}
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <MessageCircle className="h-5 w-5 text-[#00BFFF]" />
                    <span className="font-semibold text-gray-800" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                      HomeTruth AI Assistant
                    </span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Online</Badge>
                  </div>

                  {/* Sample conversation */}
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-gray-800">
                          Hi! I'm your property assistant. What would you like to know?
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[#00BFFF] text-white rounded-lg p-3 max-w-xs">
                        <p className="text-sm">What is leasehold?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-gray-800">
                          Leasehold means you own the property for a fixed period, but not the land it's built on. The
                          land belongs to the freeholder...
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sample questions */}
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Try asking:</p>
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
                    <Button size="sm" className="bg-[#00BFFF] hover:bg-blue-600">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Floating building blocks */}
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-6 h-6 bg-[#FF6B35] rounded transform rotate-12 opacity-80"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-[#B19CD9] rounded transform -rotate-12 opacity-80"></div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#00BFFF] hover:bg-blue-600 text-white px-8 py-3 text-lg">
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white px-8 py-3 text-lg bg-transparent"
              >
                Explore Pro Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className="text-3xl lg:text-4xl font-bold text-black mb-4"
              style={{ fontFamily: "Gill Sans, sans-serif" }}
            >
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "Gill Sans, sans-serif" }}>
              Four simple steps to transform your property journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-[#00BFFF] rounded-lg mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF6B35] rounded transform rotate-12"></div>
              </div>
              <h3 className="text-xl font-bold text-black mb-3" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Ask Questions
              </h3>
              <p className="text-gray-600" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Start by asking any property-related question to our AI assistant
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-[#FF6B35] rounded-lg mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#B19CD9] rounded transform rotate-12"></div>
              </div>
              <h3 className="text-xl font-bold text-black mb-3" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Personalize Profile
              </h3>
              <p className="text-gray-600" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Tell us about your preferences to get more tailored advice
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-[#B19CD9] rounded-lg mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#00BFFF] rounded transform rotate-12"></div>
              </div>
              <h3 className="text-xl font-bold text-black mb-3" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Get Smart Insights
              </h3>
              <p className="text-gray-600" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Receive personalized insights based on your specific situation
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00BFFF] to-[#B19CD9] rounded-lg mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bookmark className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF6B35] rounded transform rotate-12"></div>
              </div>
              <h3 className="text-xl font-bold text-black mb-3" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Save What Matters
              </h3>
              <p className="text-gray-600" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Bookmark important information and create notes for future reference
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section id="security" className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className="text-3xl lg:text-4xl font-bold text-black mb-4"
              style={{ fontFamily: "Gill Sans, sans-serif" }}
            >
              Trust & Security
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "Gill Sans, sans-serif" }}>
              Your data and privacy are our top priorities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Encryption */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#00BFFF] rounded-lg mx-auto mb-6 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                  Encryption
                </h3>
                <p className="text-gray-600" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                  Your data is encrypted with industry-standard security protocols
                </p>
              </CardContent>
            </Card>

            {/* GDPR Compliance */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#FF6B35] rounded-lg mx-auto mb-6 flex items-center justify-center">
                  <Flag className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                  GDPR Compliance
                </h3>
                <p className="text-gray-600" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                  We respect your privacy and comply with all data protection regulations
                </p>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#B19CD9] rounded-lg mx-auto mb-6 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                  Privacy
                </h3>
                <p className="text-gray-600" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                  We prioritize your information safety and never share your data
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-[#00BFFF] to-[#B19CD9]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-3xl lg:text-4xl font-bold text-white mb-6"
              style={{ fontFamily: "Gill Sans, sans-serif" }}
            >
              Ready to Transform Your Property Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8" style={{ fontFamily: "Gill Sans, sans-serif" }}>
              Join thousands of homeowners who trust HomeTruth for smarter property decisions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#00BFFF] hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#00BFFF] px-8 py-3 text-lg bg-transparent"
              >
                Explore Pro Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <img
                    src="/images/hometruth-logo-dark.png"
                    alt="HomeTruth - Your Personal Property Assistant"
                    className="h-10 w-auto"
                  />
                </div>
              </div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Making property investment and ownership simpler, smarter, and more profitable.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Product
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pro Features
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Company
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ fontFamily: "Gill Sans, sans-serif" }}>
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm" style={{ fontFamily: "Gill Sans, sans-serif" }}>
              © 2025 HomeTruth. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
