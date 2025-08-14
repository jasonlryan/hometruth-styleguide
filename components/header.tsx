import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

interface HeaderProps {
  variant?: "landing" | "app";
  showProButton?: boolean;
  showUserInfo?: boolean;
  userName?: string;
}

export default function Header({
  variant = "landing",
  showProButton = true,
  showUserInfo = false,
  userName = "Lujain",
}: HeaderProps) {
  if (variant === "app") {
    return (
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 mr-6">
              <div className="w-8 h-8 bg-[#00BFFF] rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-gill-sans-light text-gray-900">
                Home truth
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {showUserInfo && (
              <span className="text-gray-700 font-gill-sans-regular">
                Hi, {userName}!
              </span>
            )}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2">
                <svg
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <svg
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM4.5 19.5a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5h15a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-15z"
                  />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <svg
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </Button>
            </div>
            {showUserInfo && (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 font-gill-sans-regular">
                  {userName.charAt(0)}
                </span>
              </div>
            )}
            {showProButton && (
              <Button className="bg-[#00BFFF] hover:bg-blue-600 text-white">
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Landing page header
  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="w-full px-4 py-4 flex items-center justify-between">
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center">
            <img
              src="/images/hometruth-logo.png"
              alt="HomeTruth - Your Personal Property Assistant"
              className="h-14 w-auto"
            />
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/#how-it-works"
            className="text-gray-600 hover:text-[#00BFFF] transition-colors font-gill-sans-regular"
          >
            How It Works
          </Link>
          <Link
            href="/#security"
            className="text-gray-600 hover:text-[#00BFFF] transition-colors font-gill-sans-regular"
          >
            Security
          </Link>
          {showProButton && (
            <Link href="/pro">
              <Button
                variant="outline"
                className="border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white bg-transparent"
              >
                Explore Pro Features
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
