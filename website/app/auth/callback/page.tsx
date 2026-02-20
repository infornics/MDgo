"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const handleCallback = async () => {
      if (!token) {
        toast.error("Authentication failed. No token received.");
        router.push("/");
        return;
      }

      try {
        // Store token
        localStorage.setItem("mdgo-token", token);

        // Fetch user profile
        const response = await api.get("/auth/profile");
        const userData = response.data;

        // Store user data
        localStorage.setItem("mdgo-user", JSON.stringify(userData));

        toast.success("Signed in successfully!");
        router.push("/");
      } catch (error: any) {
        console.error("Auth callback error:", error);
        toast.error("Failed to complete authentication");
        router.push("/");
      }
    };

    handleCallback();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
