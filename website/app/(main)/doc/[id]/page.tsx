"use client";

import { Editor } from "@/components/editor";
import { FileBrowser } from "@/components/file-browser";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Toolbar } from "@/components/toolbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useEditor } from "@/contexts/editor-context";
import { useKeyboardShortcuts } from "@/lib/keyboard-shortcuts";
import { Loader2, Menu } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { MdBlockFlipped } from "react-icons/md";

export default function DocumentPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    mode,
    saveCurrentFile,
    setMode,
    selectDocumentById,
    isLoading,
    isFilesLoaded,
    currentFile,
    error,
  } = useEditor();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  useEffect(() => {
    if (isAuthLoading || !isFilesLoaded) return;

    if (id && typeof id === "string") {
      selectDocumentById(id).catch(() => {
        // Error state is now handled in the context
      });
    }
  }, [id, isAuthenticated, isAuthLoading, isFilesLoaded]);

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "s",
      ctrlKey: true,
      description: "Save current file",
      action: () => {
        if (currentFile?.role !== "read") {
          saveCurrentFile();
        }
      },
    },
    {
      key: "e",
      ctrlKey: true,
      description: "Toggle edit/preview mode",
      action: () => {
        if (currentFile?.role !== "read") {
          setMode(mode === "split" ? "edit" : "split");
        }
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

  if (isLoading || isAuthLoading || !isFilesLoaded) {
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
          {error ? (
            <div className="flex-1 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
              <div className="max-w-md w-full p-8 rounded-xl border border-destructive/20 bg-destructive/5 text-center space-y-4 mx-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <MdBlockFlipped className="text-red-500 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-destructive">
                  Unable to access document
                </h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                >
                  Go to Home
                </Button>
              </div>
            </div>
          ) : !currentFile ? (
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
