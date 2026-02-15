"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Search,
  FileText,
  Wallet,
  Settings,
  BookOpen,
  Sliders,
  UserRound,
  Bell,
  Shield,
  ChevronDown,
  Table,
  Database,
} from "lucide-react";

import { cn } from "@/lib/utils";

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
    color: "text-primary",
    bgColor: "bg-blue-50",
  },
  {
    href: "/chat",
    label: "Ask HomeTruth",
    icon: Search,
    color: "text-primary",
    bgColor: "bg-blue-50",
  },
  {
    href: "/notes",
    label: "Notes",
    icon: ClipboardList,
    color: "text-secondary",
    bgColor: "bg-purple-50",
  },
  {
    href: "/documents",
    label: "Documents",
    icon: FileText,
    color: "text-[#FF6B35]",
    bgColor: "bg-orange-50",
  },
  {
    href: "/budget",
    label: "Budget Calculator",
    icon: Wallet,
    color: "text-[#10B981]",
    bgColor: "bg-green-50",
  },
  {
    href: "/settings",
    label: "Settings & Preferences",
    icon: Settings,
    color: "text-[#6B7280]",
    bgColor: "bg-gray-50",
  },
];

const adminNavItems: NavItem[] = [
  {
    href: "/admin/knowledge",
    label: "Knowledge Base",
    icon: Database,
    color: "text-primary",
    bgColor: "bg-blue-50",
  },
  {
    href: "/documents/database",
    label: "Data Room (demo)",
    icon: Table,
    color: "text-primary",
    bgColor: "bg-blue-50",
  },
  {
    href: "/resources",
    label: "Resources",
    icon: BookOpen,
    color: "text-primary",
    bgColor: "bg-blue-50",
  },
];

const settingsSubNav: NavItem[] = [
  {
    href: "/settings/preferences",
    label: "Preferences",
    icon: Sliders,
    color: "text-primary",
    bgColor: "bg-blue-50",
  },
  {
    href: "/settings/account",
    label: "Account",
    icon: UserRound,
    color: "text-primary",
    bgColor: "bg-blue-50",
  },
  {
    href: "/settings/notifications",
    label: "Notifications",
    icon: Bell,
    color: "text-primary",
    bgColor: "bg-blue-50",
  },
  {
    href: "/settings/data-privacy",
    label: "Data Privacy",
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-blue-50",
  },
];

interface SidebarNavProps {
  className?: string;
  onNavigate?: () => void;
}

export default function SidebarNav({
  className = "",
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userToggled, setUserToggled] = useState(false);

  const isSettingsRoute = pathname.startsWith("/settings");
  const isDataRoomRoute = pathname.startsWith("/documents/database");

  useEffect(() => {
    // Auto-open when entering settings unless user explicitly toggled.
    if (isSettingsRoute && !userToggled) {
      setSettingsOpen(true);
    }
    // Close and reset toggle when leaving settings.
    if (!isSettingsRoute) {
      setSettingsOpen(false);
      setUserToggled(false);
    }
  }, [isSettingsRoute, userToggled]);

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    let isActive = pathname.startsWith(item.href);

    if (item.href === "/documents") {
      isActive =
        pathname === "/documents" ||
        (pathname.startsWith("/documents/") && !isDataRoomRoute);
    }

    if (item.href === "/documents/database") {
      isActive = isDataRoomRoute;
    }

    if (item.href === "/admin/knowledge") {
      isActive = pathname.startsWith("/admin/knowledge");
    }

    const isSettingsParent = item.href === "/settings";

    return (
      <div key={item.href} className="space-y-1">
        <Link
          href={item.href === "/settings" ? "/settings/preferences" : item.href}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 transition-all duration-200 group",
            isActive
              ? `${item.bgColor} ${item.color} shadow-sm`
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
          onClick={() => {
            if (isSettingsParent) {
              setSettingsOpen((prev) => !prev);
              setUserToggled(true);
            }
            onNavigate?.();
          }}
        >
          <span className="flex items-center space-x-3">
            <Icon
              className={cn(
                "h-5 w-5 transition-colors",
                isActive
                  ? item.color
                  : "text-gray-400 group-hover:text-gray-600"
              )}
            />
            <span
              className={cn(
                "font-gill-sans-regular transition-colors",
                isActive
                  ? item.color
                  : "text-gray-700 group-hover:text-gray-900"
              )}
            >
              {item.label}
            </span>
          </span>
          {isSettingsParent && (
            <ChevronDown
              className={cn(
                "h-4 w-4 text-gray-400 transition-transform",
                settingsOpen && "rotate-180",
                isActive && "text-gray-700"
              )}
            />
          )}
        </Link>

        {isSettingsParent && settingsOpen && (
          <div className="mt-1 space-y-2">
            {settingsSubNav.map((sub) => {
              const SubIcon = sub.icon;
              const subActive = pathname.startsWith(sub.href);
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={cn(
                    "ml-4 flex items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-200 group",
                    subActive
                      ? `${sub.bgColor} ${sub.color} shadow-sm`
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => onNavigate?.()}
                >
                  <SubIcon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      subActive
                        ? sub.color
                        : "text-gray-400 group-hover:text-gray-600"
                    )}
                  />
                  <span
                    className={cn(
                      "font-gill-sans-regular transition-colors",
                      subActive
                        ? sub.color
                        : "text-gray-700 group-hover:text-gray-900"
                    )}
                  >
                    {sub.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "w-48 bg-white border-r border-gray-200 p-3 h-full overflow-y-auto",
        className
      )}
    >
      <nav className="space-y-4">
        <div className="space-y-2">{navItems.map(renderNavItem)}</div>

        <div className="space-y-2 border-t border-gray-200 pt-3">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Admin
          </div>
          <div className="space-y-2">{adminNavItems.map(renderNavItem)}</div>
        </div>
      </nav>
    </aside>
  );
}
