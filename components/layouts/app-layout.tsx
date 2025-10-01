"use client";

import { useEffect, useRef, useState } from "react";

import Header from "@/components/header";
import Footer from "@/components/footer";
import SidebarNav from "@/components/sidebar-nav";
import { Dialog } from "@/components/ui/dialog";
import { useUser } from "@/contexts/user-context";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const APP_ROUTES = [
  "/dashboard",
  "/quiz",
  "/chat",
  "/notes",
  "/documents",
  "/budget",
  "/settings",
];

export default function AppLayout({
  children,
  showSidebar = true,
}: AppLayoutProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const burgerButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasMobileMenuOpen = useRef(false);

  // Determine if this is an app page or landing page
  const isAppPage = APP_ROUTES.some((route) => pathname.startsWith(route));
  const isAppPageWithSidebar = isAppPage && showSidebar;

  // Auto-determine header variant and props
  // Always use the app header on app routes. Only user info depends on auth state.
  const baseHeaderProps = isAppPage
    ? {
        variant: "app" as const,
        showUserInfo: isAuthenticated,
        userName: user?.name || "User",
        showProButton: true,
      }
    : {
        variant: "landing" as const,
        showProButton: true,
      };

  const headerProps = isAppPageWithSidebar
    ? {
        ...baseHeaderProps,
        showBurger: true,
        onBurgerClick: () => setMobileMenuOpen(true),
        burgerButtonRef,
      }
    : baseHeaderProps;

  useEffect(() => {
    if (!mobileMenuOpen && wasMobileMenuOpen.current) {
      burgerButtonRef.current?.focus();
    }
    wasMobileMenuOpen.current = mobileMenuOpen;
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // App pages with sidebar
  if (isAppPageWithSidebar) {
    return (
      <div className="flex min-h-screen flex-col overflow-hidden bg-gray-50">
        <Header {...headerProps} />
        <div className="flex flex-1 min-h-0">
          <SidebarNav className="hidden lg:block" />
          <main className="flex flex-1 min-h-0 flex-col overflow-y-auto bg-gray-50">
            <div className="flex flex-1 min-h-0 flex-col">
              {children}
            </div>
            <Footer variant="app" />
          </main>
        </div>
        <Dialog
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          ariaLabel="Mobile navigation"
          containerClassName="fixed inset-0 z-50 flex lg:hidden"
          panelClassName="relative z-10 mx-0 my-0 flex h-full w-full"
          contentClassName="flex h-full rounded-none border-none bg-transparent shadow-none"
        >
          <div className="flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <span className="text-base font-semibold text-gray-900">
                Navigation
              </span>
              <button
                type="button"
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav
                className="h-full w-full border-0 p-4"
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  // App pages without sidebar
  if (isAppPage && !showSidebar) {
    return (
      <div className="flex min-h-screen flex-col overflow-hidden bg-gray-50">
        <Header {...headerProps} />
        <main className="flex flex-1 min-h-0 flex-col overflow-y-auto bg-gray-50">
          <div className="flex flex-1 min-h-0 flex-col">
            {children}
          </div>
          <Footer variant="app" />
        </main>
      </div>
    );
  }

  // Landing pages
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-white">
      <Header {...headerProps} />
      <main className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer variant="landing" />
    </div>
  );
}
