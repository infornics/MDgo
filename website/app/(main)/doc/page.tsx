"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileBrowser } from "@/components/file-browser";
import { Editor } from "@/components/editor";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Toolbar } from "@/components/toolbar";
import { useEditor } from "@/contexts/editor-context";
import { useKeyboardShortcuts } from "@/lib/keyboard-shortcuts";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function DocPage() {
  const { mode, saveCurrentFile, setMode, currentFile, isFilesLoaded } =
    useEditor();
  const { isLoading: isAuthLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "s",
      ctrlKey: true,
      description: "Save current file",
      action: () => {
        if (currentFile?.role !== "read") {
          saveCurrentFile();
          toast.success("File saved");
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

  if (isAuthLoading || !isFilesLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Syncing editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden relative border-t">
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
        <div className="flex-1 overflow-hidden flex bg-background">
          {!currentFile ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-2">
                <span className="text-4xl">📄</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  No document selected
                </h3>
                <p className="text-sm max-w-[250px]">
                  Select an existing document from the sidebar or create a new
                  one to get started.
                </p>
              </div>
            </div>
          ) : mode === "split" ? (
            <>
              <div className="flex-1 border-r overflow-hidden group relative">
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
