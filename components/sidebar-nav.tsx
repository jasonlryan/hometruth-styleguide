"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Search,
  FileText,
  Bookmark,
  FolderOpen,
  DollarSign,
  Settings,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
    color: "text-[#00BFFF]",
    bgColor: "bg-blue-50",
  },
  {
    href: "/quiz",
    label: "Quiz",
    icon: ClipboardList,
    color: "text-[#FF6B35]",
    bgColor: "bg-orange-50",
  },
  {
    href: "/chat",
    label: "Ask HomeTruth",
    icon: Search,
    color: "text-[#00BFFF]",
    bgColor: "bg-blue-50",
  },
  {
    href: "/notes",
    label: "Saved Notes",
    icon: FileText,
    color: "text-[#B19CD9]",
    bgColor: "bg-purple-50",
  },
  {
    href: "/bookmarked",
    label: "Bookmarked",
    icon: Bookmark,
    color: "text-[#10B981]",
    bgColor: "bg-green-50",
  },
  {
    href: "/documents",
    label: "Documents",
    icon: FolderOpen,
    color: "text-[#FF6B35]",
    bgColor: "bg-orange-50",
  },
  {
    href: "/budget",
    label: "Budget Calculator",
    icon: DollarSign,
    color: "text-[#10B981]",
    bgColor: "bg-green-50",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    color: "text-[#6B7280]",
    bgColor: "bg-gray-50",
  },
];

interface SidebarNavProps {
  className?: string;
}

export default function SidebarNav({ className = "" }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className={`w-48 bg-white border-r border-gray-200 p-3 ${className}`}>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                isActive
                  ? `${item.bgColor} ${item.color} shadow-sm`
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-colors ${
                  isActive
                    ? item.color
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span
                className={`font-gill-sans-regular transition-colors ${
                  isActive ? item.color : "text-gray-700 group-hover:text-gray-900"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
