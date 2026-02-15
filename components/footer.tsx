import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  variant?: "landing" | "app";
  showLogo?: boolean;
}

const productLinks = [
  { href: "/#how-it-works", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/pro", label: "Pro Features" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "mailto:hello@hometruth.io", label: "Contact" },
];

const legalLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "GDPR" },
];

function FooterLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="space-y-2 text-sm text-gray-400">
      {links.map((link) => (
        <li key={link.label}>
          <Link href={link.href} className="hover:text-white transition-colors">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Footer({
  variant = "landing",
  showLogo = true,
}: FooterProps) {
  if (variant === "app") {
    return (
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {showLogo && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Image
                      src="/images/hometruth-logo-dark.png"
                      alt="HomeTruth - Your Personal Property Assistant"
                      width={180}
                      height={48}
                      style={{ height: 48, width: "auto" }}
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
              <FooterLinks links={productLinks} />
            </div>

            <div>
              <h4 className="font-gill-sans-light mb-4">Company</h4>
              <FooterLinks links={companyLinks} />
            </div>

            <div>
              <h4 className="font-gill-sans-light mb-4">Legal</h4>
              <FooterLinks links={legalLinks} />
            </div>
          </div>

          <div className="border-t border-gray-800 mt-4 pt-4 text-center">
            <p className="text-gray-400 text-sm font-gill-sans-regular">
              © 2026 HomeTruth. All rights reserved.
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
                <Image
                  src="/images/hometruth-logo-dark.png"
                  alt="HomeTruth - Your Personal Property Assistant"
                  width={180}
                  height={48}
                  style={{ height: 48, width: "auto" }}
                />
              </div>
            </div>
            <p className="text-gray-400 text-sm font-gill-sans-regular">
              Real answers for every property decision.
            </p>
          </div>

          <div>
            <h4 className="font-gill-sans-light mb-4">Product</h4>
            <FooterLinks links={productLinks} />
          </div>

          <div>
            <h4 className="font-gill-sans-light mb-4">Company</h4>
            <FooterLinks links={companyLinks} />
          </div>

          <div>
            <h4 className="font-gill-sans-light mb-4">Legal</h4>
            <FooterLinks links={legalLinks} />
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm font-gill-sans-regular">
            © 2026 HomeTruth. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
