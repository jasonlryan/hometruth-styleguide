"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SidebarNav from "@/components/sidebar-nav";
import { useUser } from "@/contexts/user-context";

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const APP_ROUTES = ['/dashboard', '/quiz', '/chat', '/notes', '/bookmarked', '/documents', '/budget', '/settings'];
const LANDING_ROUTES = ['/', '/pro'];

export default function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useUser();
  
  // Determine if this is an app page or landing page
  const isAppPage = APP_ROUTES.some(route => pathname.startsWith(route));
  const isLandingPage = LANDING_ROUTES.includes(pathname);
  
  // Auto-determine header variant and props
  const getHeaderProps = () => {
    if (isAppPage && isAuthenticated) {
      return {
        variant: "app" as const,
        showUserInfo: true,
        userName: user?.name || "User",
        showProButton: true
      };
    }
    
    return {
      variant: "landing" as const,
      showProButton: true
    };
  };

  const headerProps = getHeaderProps();

  // App pages with sidebar
  if (isAppPage && showSidebar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header {...headerProps} />
        
        <div className="flex h-[calc(100vh-80px)]">
          <SidebarNav />
          <main className="flex-1">
            {children}
          </main>
        </div>
        
        <Footer variant="app" />
      </div>
    );
  }

  // App pages without sidebar
  if (isAppPage && !showSidebar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header {...headerProps} />
        <main className="flex-1">
          {children}
        </main>
        <Footer variant="app" />
      </div>
    );
  }

  // Landing pages
  return (
    <div className="min-h-screen bg-white">
      <Header {...headerProps} />
      <main>
        {children}
      </main>
      <Footer variant="landing" />
    </div>
  );
}