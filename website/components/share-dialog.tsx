"use client";

import React from "react";
import { useEditor } from "@/contexts/editor-context";
import { useAuth } from "@/contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { exportAsMarkdown, exportAsHTML } from "@/lib/pdf-generator";
import {
  FileText,
  Code,
  Copy,
  Globe,
  Lock,
  UserPlus,
  Users,
  Trash2,
  Shield,
  ShieldAlert,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const { currentFile, updateDocumentSharing } = useEditor();
  const { isAuthenticated } = useAuth();
  const [newEmail, setNewEmail] = React.useState("");
  const [newRole, setNewRole] = React.useState<"read" | "edit">("read");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!currentFile) return null;

  const handleExportMarkdown = () => {
    exportAsMarkdown(currentFile.content, currentFile.name.replace(".md", ""));
    toast.success("Exported as Markdown");
    onOpenChange(false);
  };

  const handleExportHTML = () => {
    const { parseMarkdown } = require("@/lib/markdown");
    const html = parseMarkdown(currentFile.content);
    exportAsHTML(html, currentFile.name.replace(".md", ""));
    toast.success("Exported as HTML");
    onOpenChange(false);
  };

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

  const removeCollaborator = async (email: string) => {
    if (!currentFile._id) return;
    setIsUpdating(true);
    try {
      await updateDocumentSharing(currentFile._id, {
        sharedWith: (currentFile.sharedWith || []).filter(
          (s) => s.email !== email
        ),
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-zinc-950 border-zinc-900 text-zinc-100 shadow-2xl">
        <div className="absolute inset-0 bg-[var(--metallic-gradient)] pointer-events-none opacity-20" />

        <DialogHeader className="p-6 pb-2 relative z-10">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-zinc-400" />
            Share Document
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Manage public access and collaborate with others
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2 relative z-10">
          <div className="space-y-6">
            {/* Public Access Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Globe className="h-3 w-3" />
                Public Access
              </h4>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      currentFile.isPublic
                        ? "bg-green-500/10 text-green-500"
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
                  className={`h-8 font-bold ${
                    currentFile.isPublic
                      ? "text-red-400 hover:text-red-300"
                      : "text-zinc-100 hover:text-white bg-zinc-800/50"
                  }`}
                  onClick={togglePublic}
                  disabled={isUpdating || !isAuthenticated}
                >
                  {currentFile.isPublic ? "Disable" : "Enable"}
                </Button>
              </div>

              {currentFile.isPublic && (
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/doc/${
                      currentFile._id || currentFile.id
                    }`}
                    className="h-9 text-xs bg-zinc-900 border-zinc-800 text-zinc-400 font-mono"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 px-3 shrink-0"
                    onClick={handleCopyLink}
                  >
                    {copiedLink ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <LinkIcon className="h-4 w-4" />
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

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter user email..."
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="h-10 pl-3 bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-zinc-700"
                    onKeyDown={(e) => e.key === "Enter" && addCollaborator()}
                  />
                </div>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 rounded-md px-2 text-xs font-medium focus:ring-0 outline-none"
                >
                  <option value="read">Viewer</option>
                  <option value="edit">Editor</option>
                </select>
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0 bg-zinc-100 text-black hover:bg-zinc-200"
                  onClick={addCollaborator}
                  disabled={isUpdating || !isAuthenticated}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {(currentFile.sharedWith || []).map((collaborator) => (
                  <div
                    key={collaborator.email}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800/50 bg-zinc-900/30 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                        <span className="text-xs font-bold text-zinc-400">
                          {collaborator.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="max-w-[180px]">
                        <p className="text-sm font-medium truncate">
                          {collaborator.email}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-tighter">
                          {collaborator.role === "edit" ? (
                            <Shield className="h-2.5 w-2.5" />
                          ) : (
                            <ShieldAlert className="h-2.5 w-2.5" />
                          )}
                          {collaborator.role} access
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
                      onClick={() => removeCollaborator(collaborator.email)}
                      disabled={isUpdating}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {(!currentFile.sharedWith ||
                  currentFile.sharedWith.length === 0) && (
                  <p className="text-center py-4 text-xs text-zinc-600 italic">
                    No collaborators invited yet
                  </p>
                )}
              </div>
            </div>

            <Separator className="bg-zinc-900" />

            {/* Export Options (Moved to bottom) */}
            <div className="space-y-3 pb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Local Export
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  className="h-auto py-3 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50 text-xs gap-2"
                  onClick={handleExportMarkdown}
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-400" />
                  Markdown
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto py-3 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50 text-xs gap-2"
                  onClick={handleExportHTML}
                >
                  <Code className="h-3.5 w-3.5 text-zinc-400" />
                  HTML
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
