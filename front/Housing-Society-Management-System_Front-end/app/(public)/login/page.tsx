"use client";

import { LoginForm } from "@/components/login-form";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStatus } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const user =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const actuallyAuthenticated = !!token && !!user;

    if (actuallyAuthenticated) {
      const timer = setTimeout(() => router.push("/dashboard"), 100);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCheckingAuth(false), 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || checkingAuth) {
    return (
      <AuthPageLayout>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-7 w-40 mx-auto" />
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-px w-full" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
}
