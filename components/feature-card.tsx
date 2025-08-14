import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBgColor?: string;
  examples?: string[];
  fileTypes?: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  iconBgColor = "bg-[#00BFFF]",
  examples,
  fileTypes,
}: FeatureCardProps) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      <CardContent className="p-4 text-center">
        <div
          className={`w-12 h-12 ${iconBgColor} rounded-lg mx-auto mb-4 flex items-center justify-center`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="type-h4 text-black mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="type-body text-gray-600 mb-3 line-clamp-3">{description}</p>

        {examples && (
          <div className="space-y-1 type-caption text-gray-500">
            {examples.map((example, index) => (
              <p key={index} className="line-clamp-1">"{example}"</p>
            ))}
          </div>
        )}

        {fileTypes && (
          <div className="type-caption text-gray-500 mt-2">
            <p>{fileTypes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
