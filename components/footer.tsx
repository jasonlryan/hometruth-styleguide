import Link from "next/link";

interface FooterProps {
  variant?: "landing" | "app";
  showLogo?: boolean;
}

export default function Footer({
  variant = "landing",
  showLogo = true,
}: FooterProps) {
  if (variant === "app") {
    return (
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {showLogo && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <img
                      src="/images/hometruth-logo-dark.png"
                      alt="HomeTruth - Your Personal Property Assistant"
                      className="h-12 w-auto"
                    />
                  </div>
                </div>
                <p className="text-gray-400 text-sm font-gill-sans-regular">
                  Built Around You.
                </p>
              </div>
            )}

            <div>
              <h4 className="font-gill-sans-light mb-4">Product</h4>
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
              <h4 className="font-gill-sans-light mb-4">Company</h4>
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
              <h4 className="font-gill-sans-light mb-4">Legal</h4>
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
            <p className="text-gray-400 text-sm font-gill-sans-regular">
              © 2025 HomeTruth. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Landing page footer
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <img
                  src="/images/hometruth-logo-dark.png"
                  alt="HomeTruth - Your Personal Property Assistant"
                  className="h-12 w-auto"
                />
              </div>
            </div>
            <p className="text-gray-400 text-sm font-gill-sans-regular">
              Making property investment and ownership simpler, smarter, and
              more profitable.
            </p>
          </div>

          <div>
            <h4 className="font-gill-sans-light mb-4">Product</h4>
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
            <h4 className="font-gill-sans-light mb-4">Company</h4>
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
            <h4 className="font-gill-sans-light mb-4">Legal</h4>
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
          <p className="text-gray-400 text-sm font-gill-sans-regular">
            © 2025 HomeTruth. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
