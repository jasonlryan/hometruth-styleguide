import { LucideIcon } from "lucide-react";

interface TrustItem {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBgColor?: string;
}

interface TrustSectionProps {
  title: string;
  items: TrustItem[];
  variant?: "cards" | "simple";
}

export default function TrustSection({
  title,
  items,
  variant = "simple",
}: TrustSectionProps) {
  if (variant === "cards") {
    return (
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-gill-sans-light text-black mb-4">
              {title}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div
                    className={`w-16 h-16 ${
                      item.iconBgColor || "bg-[#00BFFF]"
                    } rounded-full mx-auto mb-4 flex items-center justify-center`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-gill-sans-light text-black mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 font-gill-sans-light">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-gill-sans-light text-black mb-4">
            {title}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center">
                <div
                  className={`w-16 h-16 ${
                    item.iconBgColor || "bg-[#00BFFF]"
                  } rounded-full mx-auto mb-4 flex items-center justify-center`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600 font-gill-sans-light">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
