"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export default function AuthGuard({ children, fallbackPath = "/signin" }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackPath);
    }
  }, [isAuthenticated, isLoading, router, fallbackPath]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B35] to-[#FF8A65] rounded-lg mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-white font-gill-sans-regular text-xl">🏠</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children until we confirm authentication
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}