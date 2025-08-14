import { ReactNode } from "react";
import Image, { StaticImageData } from "next/image";

interface BannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  children?: ReactNode;
  gradient?: "blue-purple" | "blue-50-purple-50" | "custom";
  customGradient?: string;
  textColor?: string;
  className?: string;
  showBackgroundImage?: boolean;
  backgroundImage?: StaticImageData;
  imageOpacity?: number;
  useTextPanel?: boolean;
  panelOpacity?: number; // 0 - 100
  panelClassName?: string;
  imageBrightness?: number; // 0 - 100
}

export default function Banner({
  title,
  subtitle,
  description,
  children,
  gradient = "blue-purple",
  customGradient,
  textColor = "text-white",
  className = "",
  showBackgroundImage = false,
  backgroundImage,
  imageOpacity = 30,
  useTextPanel = false,
  panelOpacity = 60,
  panelClassName,
  imageBrightness = 100,
}: BannerProps) {
  const getGradientClass = () => {
    switch (gradient) {
      case "blue-purple":
        return "bg-gradient-to-br from-blue-600 to-purple-700";
      case "blue-50-purple-50":
        return "bg-gradient-to-br from-blue-50 to-purple-50";
      case "custom":
        return (
          customGradient || "bg-gradient-to-br from-blue-600 to-purple-700"
        );
      default:
        return "bg-gradient-to-br from-blue-600 to-purple-700";
    }
  };

  return (
    <section
      className={`relative py-16 lg:py-24 ${getGradientClass()} overflow-hidden ${className}`}
    >
      {showBackgroundImage && backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          className="object-cover scale-90"
          style={{
            opacity: Math.max(0, Math.min(100, imageOpacity)) / 100,
            filter: `brightness(${Math.max(
              0,
              Math.min(100, imageBrightness)
            )}%)`,
          }}
        />
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div
            className={`${
              useTextPanel
                ? "inline-block rounded-2xl px-6 py-8 md:px-10 md:py-12 backdrop-blur-sm"
                : ""
            } ${panelClassName || ""}`}
            style={
              useTextPanel
                ? {
                    backgroundColor: `rgba(0, 0, 0, ${
                      Math.max(0, Math.min(100, panelOpacity)) / 100
                    })`,
                  }
                : undefined
            }
          >
            <div className="space-y-6">
              <h1
                className={`type-hero ${textColor}`}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className={`type-body-lg ${textColor}`}
                >
                  {subtitle}
                </p>
              )}
              {description && (
                <p
                  className={`type-body-lg max-w-3xl mx-auto ${textColor}`}
                >
                  {description}
                </p>
              )}
            </div>
            {children && <div className="mt-8">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
