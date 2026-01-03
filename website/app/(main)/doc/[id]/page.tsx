"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor } from "@/contexts/editor-context";
import { useAuth } from "@/contexts/auth-context";
import { FileBrowser } from "@/components/file-browser";
import { Editor } from "@/components/editor";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Toolbar } from "@/components/toolbar";
import { useKeyboardShortcuts } from "@/lib/keyboard-shortcuts";
import { Menu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DocumentPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    mode,
    saveCurrentFile,
    setMode,
    selectDocumentById,
    isLoading,
    currentFile,
  } = useEditor();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      toast.error("Please sign in to access cloud documents");
      router.push("/");
      return;
    }

    if (id && typeof id === "string") {
      selectDocumentById(id).catch(() => {
        router.push("/");
      });
    }
  }, [id, isAuthenticated, isAuthLoading]);

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "s",
      ctrlKey: true,
      description: "Save current file",
      action: () => {
        saveCurrentFile();
      },
    },
    {
      key: "e",
      ctrlKey: true,
      description: "Toggle edit/preview mode",
      action: () => {
        setMode(mode === "split" ? "edit" : "split");
      },
    },
    {
      key: "b",
      ctrlKey: true,
      description: "Toggle sidebar",
      action: () => {
        setSidebarOpen(!sidebarOpen);
      },
    },
  ]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden absolute top-2 left-2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-64 flex-shrink-0 absolute md:relative z-20 h-full md:z-0 shadow-lg md:shadow-none bg-background border-r`}
        >
          <FileBrowser />
        </div>

        {/* Editor/Preview Area */}
        <div className="flex-1 overflow-hidden flex">
          {!currentFile ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a file to start editing
            </div>
          ) : mode === "split" ? (
            <>
              <div className="flex-1 border-r overflow-hidden">
                <Editor />
              </div>
              <div className="flex-1 overflow-hidden">
                <MarkdownPreview />
              </div>
            </>
          ) : mode === "edit" ? (
            <div className="flex-1 overflow-hidden">
              <Editor />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <MarkdownPreview />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
