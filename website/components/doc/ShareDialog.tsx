"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useEditor } from "@/contexts/editor-context";
import {
  Check,
  ChevronDown,
  Copy,
  Globe,
  Lock,
  Shield,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users
} from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const { currentFile, updateDocumentSharing } = useEditor();
  const { isAuthenticated } = useAuth();
  const [newEmail, setNewEmail] = React.useState("");
  const [newRole, setNewRole] = React.useState<"read" | "edit">("read");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!currentFile) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/doc/${
      currentFile._id || currentFile.id
    }`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const togglePublic = async () => {
    if (!currentFile._id) {
      toast.error("Save to cloud first to enable public sharing");
      return;
    }
    setIsUpdating(true);
    try {
      await updateDocumentSharing(currentFile._id, {
        isPublic: !currentFile.isPublic,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const addCollaborator = async () => {
    if (!newEmail.trim()) return;
    if (!currentFile._id) {
      toast.error("Save to cloud first to add collaborators");
      return;
    }

    setIsUpdating(true);
    try {
      const currentShared = currentFile.sharedWith || [];
      if (currentShared.some((s) => s.email === newEmail.toLowerCase())) {
        toast.error("User already has access");
        return;
      }

      await updateDocumentSharing(currentFile._id, {
        sharedWith: [
          ...currentShared,
          { email: newEmail.toLowerCase(), role: newRole },
        ],
      });
      setNewEmail("");
    } finally {
      setIsUpdating(false);
    }
  };

  const updateCollaboratorRole = async (
    email: string,
    role: "read" | "edit"
  ) => {
    if (!currentFile._id) return;
    setIsUpdating(true);
    try {
      await updateDocumentSharing(currentFile._id, {
        sharedWith: (currentFile.sharedWith || []).map((s) =>
          s.email === email ? { ...s, role } : s
        ),
      });
      toast.success(`Updated access for ${email}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const removeCollaborator = async (email: string) => {
    if (!currentFile._id) return;
    setIsUpdating(true);
    try {
      await updateDocumentSharing(currentFile._id, {
        sharedWith: (currentFile.sharedWith || []).filter(
          (s) => s.email !== email
        ),
      });
      toast.success(`Removed ${email}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 bg-zinc-950 border-zinc-900 text-zinc-100 shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-zinc-400" />
            Share Document
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Manage public access and collaborate with others
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-6">
            {/* Public Access Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Globe className="h-3 w-3" />
                Public Access
              </h4>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 shadow-inner gap-3 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full shrink-0${
                      currentFile.isPublic
                        ? "bg-green-500/10 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {currentFile.isPublic ? (
                      <Globe className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {currentFile.isPublic ? "Public Link" : "Restricted"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {currentFile.isPublic
                        ? "Anyone with the link can view"
                        : "Only people with access can view"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 font-bold border w-full sm:w-auto ${
                    currentFile.isPublic
                      ? "text-red-400 border-red-900/50 hover:bg-red-900/20"
                      : "text-zinc-100 border-zinc-700 hover:bg-zinc-800"
                  }`}
                  onClick={togglePublic}
                  disabled={isUpdating || !isAuthenticated}
                >
                  {currentFile.isPublic ? "Disable" : "Enable"}
                </Button>
              </div>

              {currentFile.isPublic && (
                <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                  <Input
                    readOnly
                    value={`${window.location.origin}/doc/${
                      currentFile._id || currentFile.id
                    }`}
                    className="h-8 text-[10px] bg-transparent border-none text-zinc-400 font-mono focus-visible:ring-0"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-3 shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    onClick={handleCopyLink}
                  >
                    {copiedLink ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            <Separator className="bg-zinc-900" />

            {/* Collaborators Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <UserPlus className="h-3 w-3" />
                Collaborators
              </h4>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter user email..."
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="h-10 pl-3 bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-zinc-700 shadow-inner"
                    onKeyDown={(e) => e.key === "Enter" && addCollaborator()}
                  />
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-3 bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 flex-1"
                      >
                        {newRole === "read" ? "Viewer" : "Editor"}
                        <ChevronDown className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32 bg-zinc-900 border-zinc-800">
                      <DropdownMenuItem
                        onClick={() => setNewRole("read")}
                        className="text-xs text-zinc-200"
                      >
                        Viewer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setNewRole("edit")}
                        className="text-xs text-zinc-200"
                      >
                        Editor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="icon"
                    className="h-10 w-10 shrink-0 bg-zinc-100 text-black hover:bg-zinc-200"
                    onClick={addCollaborator}
                    disabled={isUpdating || !isAuthenticated}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {(currentFile.sharedWith || []).map((collaborator) => (
                  <div
                    key={collaborator.email}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800/50 bg-zinc-900/30 group hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-sm">
                        <span className="text-xs font-bold text-zinc-400">
                          {collaborator.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-zinc-200">
                          {collaborator.email}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-tighter">
                          {collaborator.role === "edit" ? (
                            <Shield className="h-2.5 w-2.5 text-zinc-400" />
                          ) : (
                            <ShieldAlert className="h-2.5 w-2.5 text-zinc-500" />
                          )}
                          {collaborator.role} access
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-zinc-200"
                            disabled={isUpdating}
                          >
                            {collaborator.role === "read" ? "Viewer" : "Editor"}
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32 bg-zinc-900 border-zinc-800">
                          <DropdownMenuItem
                            onClick={() =>
                              updateCollaboratorRole(collaborator.email, "read")
                            }
                            className="text-xs text-zinc-200"
                          >
                            Viewer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateCollaboratorRole(collaborator.email, "edit")
                            }
                            className="text-xs text-zinc-200"
                          >
                            Editor
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-red-400 transition-all ml-1"
                        onClick={() => removeCollaborator(collaborator.email)}
                        disabled={isUpdating}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!currentFile.sharedWith ||
                  currentFile.sharedWith.length === 0) && (
                  <p className="text-center py-6 text-xs text-zinc-600 italic border border-dashed border-zinc-800 rounded-lg">
                    No collaborators invited yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
