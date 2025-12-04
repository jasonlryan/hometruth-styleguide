"use client";

import { useEffect, useRef, useState, type Ref } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { useUser } from "@/contexts/user-context";

interface HeaderProps {
  variant?: "landing" | "app";
  showProButton?: boolean;
  showUserInfo?: boolean;
  userName?: string;
  showBurger?: boolean;
  onBurgerClick?: () => void;
  burgerButtonRef?: Ref<HTMLButtonElement>;
}

export default function Header({
  variant = "landing",
  showProButton = true,
  showUserInfo = false,
  userName = "Lujain",
  showBurger = false,
  onBurgerClick,
  burgerButtonRef,
}: HeaderProps) {
  const [landingMenuOpen, setLandingMenuOpen] = useState(false);
  const landingMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const wasLandingMenuOpen = useRef(false);
  const { user, logout } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    if (variant !== "landing") return;
    if (!landingMenuOpen && wasLandingMenuOpen.current) {
      landingMenuTriggerRef.current?.focus();
    }
    wasLandingMenuOpen.current = landingMenuOpen;
  }, [landingMenuOpen, variant]);

  if (variant === "app") {
    return (
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showBurger && (
              <button
                type="button"
                onClick={onBurgerClick}
                ref={burgerButtonRef}
                className="mr-3 rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
            )}
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Image
                src="/images/hometruth-icon.svg"
                alt="HomeTruth"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
              <span className="hidden lg:inline text-xl font-gill-sans-light text-gray-900">
                HomeTruth
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {showUserInfo && user && (
              <span className="font-gill-sans-regular text-gray-700">
                Hi, {user.name || userName}!
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
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  onClick={handleLogout}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4 text-gray-600" />
                </Button>
              )}
            </div>
            {showUserInfo && user && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                <span className="text-sm font-gill-sans-regular font-medium text-gray-700">
                  {(user.name || userName).charAt(0)}
                </span>
              </div>
            )}
            {showProButton && (
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </header>
    );
  }

  const landingNavItems = [
    {
      href: "/#how-it-works",
      label: "How It Works",
    },
    {
      href: "/resources",
      label: "Resources",
    },
    {
      href: "/#security",
      label: "Security",
    },
  ];

  const handleLandingMenuChange = (open: boolean) => {
    setLandingMenuOpen(open);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="flex w-full items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/hometruth-icon.svg"
            alt="HomeTruth"
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          <span className="hidden lg:inline text-xl font-gill-sans-light text-gray-900">
            HomeTruth
          </span>
        </Link>
        <nav className="hidden items-center space-x-6 lg:flex">
          {landingNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
            className="font-gill-sans-regular text-gray-600 transition-colors hover:text-primary"
          >
            {item.label}
          </Link>
          ))}
          {showProButton && (
            <Link href="/pro">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Explore Pro Features
              </Button>
            </Link>
          )}
          {!user && (
            <Link href="/signin">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
        <button
          type="button"
          className="rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
          onClick={() => handleLandingMenuChange(true)}
          ref={landingMenuTriggerRef}
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>
      <Dialog
        open={landingMenuOpen}
        onOpenChange={handleLandingMenuChange}
        ariaLabel="Navigation menu"
        containerClassName="fixed inset-0 z-50 flex justify-end lg:hidden"
        panelClassName="relative z-10 mx-0 my-0 flex h-full w-full justify-end"
        contentClassName="flex h-full justify-end rounded-none border-none bg-transparent shadow-none"
      >
        <div className="flex h-full w-64 max-w-[85vw] flex-col bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-4">
            <span className="text-base font-semibold text-gray-900">Menu</span>
            <button
              type="button"
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              onClick={() => handleLandingMenuChange(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-4 py-3">
            {landingNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-2 text-base font-gill-sans-regular text-gray-700 hover:bg-gray-100"
                onClick={() => handleLandingMenuChange(false)}
              >
                {item.label}
              </Link>
            ))}
            {showProButton && (
              <Link
                href="/pro"
                className="mt-2 rounded-md bg-primary px-3 py-2 text-center font-gill-sans-regular text-primary-foreground hover:bg-primary/90"
                onClick={() => handleLandingMenuChange(false)}
              >
                Explore Pro Features
              </Link>
            )}
            {!user && (
              <Link
                href="/signin"
                className="mt-2 rounded-md border border-primary px-3 py-2 text-center font-gill-sans-regular text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleLandingMenuChange(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </Dialog>
    </header>
  );
}
