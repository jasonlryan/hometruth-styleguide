import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CTASectionProps {
  title: string;
  subtitle: string;
  primaryButton: {
    text: string;
    href: string;
    variant?: "default" | "outline";
  };
  secondaryButton?: {
    text: string;
    href: string;
  };
  bgColor?: string;
  textColor?: string;
  showArrow?: boolean;
}

export default function CTASection({
  title,
  subtitle,
  primaryButton,
  secondaryButton,
  bgColor = "bg-gradient-to-r from-[#00BFFF] to-[#B19CD9]",
  textColor = "text-white",
  showArrow = true,
}: CTASectionProps) {
  return (
    <section className={`py-16 lg:py-24 ${bgColor}`}>
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2
            className={`text-3xl lg:text-4xl font-gill-sans-light mb-6 ${textColor}`}
          >
            {title}
          </h2>
          <p className={`text-xl mb-8 font-gill-sans-light ${textColor}/90`}>
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={primaryButton.href}>
              <Button
                size="lg"
                variant={primaryButton.variant || "default"}
                className={`px-8 py-3 text-lg ${
                  primaryButton.variant === "outline"
                    ? "border-white text-white hover:bg-white hover:text-[#00BFFF] bg-transparent"
                    : "bg-white text-[#00BFFF] hover:bg-gray-100"
                }`}
              >
                {primaryButton.text}
                {showArrow && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </Link>
            {secondaryButton && (
              <Link href={secondaryButton.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#00BFFF] px-8 py-3 text-lg bg-transparent"
                >
                  {secondaryButton.text}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
