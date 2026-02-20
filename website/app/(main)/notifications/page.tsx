"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Check,
  X,
  ArrowLeft,
  Mail,
  FileText,
  Clock,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  _id: string;
  type: "access_request" | "access_approved" | "access_rejected";
  message: string;
  read: boolean;
  document?: {
    _id: string;
    title: string;
  };
  accessRequest?: {
    _id: string;
    requester: {
      _id: string;
      name?: string;
      email: string;
      profilePicture?: string;
    };
    requestedRole: "read" | "edit";
    status: "pending" | "approved" | "rejected";
  };
  createdAt: string;
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (error: any) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error: any) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleAccessRequest = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    try {
      await api.patch(`/access-requests/${requestId}`, { action });
      toast.success(`Access request ${action}d successfully`);
      loadNotifications();
      loadUnreadCount();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to process request";
      toast.error(errorMessage);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Bell className="h-8 w-8" />
                Notifications
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage access requests and view updates
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark All as Read
              </Button>
            )}
          </div>
        </div>

        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Unread ({unreadNotifications.length})
            </h2>
            <div className="space-y-4">
              {unreadNotifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification._id)}
                  onAccessRequest={handleAccessRequest}
                />
              ))}
            </div>
          </div>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Read</h2>
            <div className="space-y-4">
              {readNotifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification._id)}
                  onAccessRequest={handleAccessRequest}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground text-center">
                You'll see notifications here when someone requests access to
                your documents.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onAccessRequest,
}: {
  notification: Notification;
  onMarkAsRead: () => void;
  onAccessRequest: (requestId: string, action: "approve" | "reject") => void;
}) {
  const isAccessRequest =
    notification.type === "access_request" &&
    notification.accessRequest &&
    typeof notification.accessRequest === "object" &&
    "requester" in notification.accessRequest;
  const requester =
    notification.accessRequest &&
    typeof notification.accessRequest === "object" &&
    "requester" in notification.accessRequest
      ? (notification.accessRequest.requester as any)
      : null;
  const requestId =
    notification.accessRequest &&
    typeof notification.accessRequest === "object" &&
    "_id" in notification.accessRequest
      ? (notification.accessRequest._id as string)
      : null;

  return (
    <Card className={notification.read ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-base">
                {notification.type === "access_request"
                  ? "Access Request"
                  : notification.type === "access_approved"
                  ? "Access Approved"
                  : "Access Rejected"}
              </CardTitle>
              {!notification.read && (
                <Badge variant="default" className="text-xs">
                  New
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              {notification.message}
            </CardDescription>
          </div>
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAsRead}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      {isAccessRequest && requester && (
        <CardContent>
          <Separator className="mb-4" />
          <div className="space-y-4">
            {requester && (
              <div className="flex items-center gap-3">
                {requester.profilePicture ? (
                  <img
                    src={requester.profilePicture}
                    alt={requester.name || requester.email}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {requester.name || requester.email}
                  </p>
                  {notification.accessRequest &&
                    typeof notification.accessRequest === "object" &&
                    "requestedRole" in notification.accessRequest && (
                      <p className="text-xs text-muted-foreground">
                        Requested {notification.accessRequest.requestedRole}{" "}
                        access
                      </p>
                    )}
                </div>
              </div>
            )}
            {notification.document && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{notification.document.title}</span>
              </div>
            )}
            {isAccessRequest &&
              requestId &&
              notification.accessRequest &&
              typeof notification.accessRequest === "object" &&
              "status" in notification.accessRequest &&
              notification.accessRequest.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onAccessRequest(requestId, "approve")}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onAccessRequest(requestId, "reject")}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      )}
      {!isAccessRequest && (
        <CardContent>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
