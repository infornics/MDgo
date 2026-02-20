"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Authentication failed";

  useEffect(() => {
    toast.error(message);
  }, [message]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Authentication Error</h1>
        <p className="text-muted-foreground">{message}</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    </div>
  );
}
