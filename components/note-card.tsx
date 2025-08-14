import { Card, CardContent } from "@/components/ui/card";
import { Edit3 } from "lucide-react";
import Link from "next/link";

interface NoteCardProps {
  title: string;
  excerpt: string;
  date: string;
  href?: string;
}

export default function NoteCard({ title, excerpt, date, href = "#" }: NoteCardProps) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-gill-sans-regular text-base leading-tight text-gray-900 line-clamp-2">
            {title}
          </h3>
          <Edit3 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <p className="font-gill-sans-light text-sm leading-relaxed text-gray-600 mb-3 line-clamp-3">
          {excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="font-gill-sans-light text-xs text-gray-500">
            {date}
          </span>
          <Link
            href={href}
            className="font-gill-sans-light text-xs text-[#B19CD9] hover:text-purple-600 transition-colors"
          >
            View
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}