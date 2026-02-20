"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Note: Account creation date would need to be added to the backend response
  // For now, we'll skip showing it since it's not available

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account details and profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {user.profilePicture ? (
                  <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-border">
                    <img
                      src={user.profilePicture}
                      alt={user.name || user.email}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-border">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">
                  {user.name || "User"}
                </h2>
                <p className="text-muted-foreground mt-1">{user.email}</p>
                {user.profilePicture && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Profile picture from {user.provider === "google" ? "Google" : user.provider === "github" ? "GitHub" : "account"}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Account Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.email}
                  </p>
                </div>
              </div>

              {user.name && (
                <div className="flex items-start gap-4">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Display Name</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {user.provider === "google"
                      ? "Google Account"
                      : user.provider === "github"
                      ? "GitHub Account"
                      : "Email/Password Account"}
                  </p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <p className="text-sm text-muted-foreground">
                Sign out of your account. You can sign back in anytime.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
