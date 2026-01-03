"use client";

import React, { useState } from "react";
import { FileBrowser } from "@/components/file-browser";
import { Editor } from "@/components/editor";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Toolbar } from "@/components/toolbar";
import { useEditor } from "@/contexts/editor-context";
import { useKeyboardShortcuts } from "@/lib/keyboard-shortcuts";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {
  const { mode, saveCurrentFile, setMode } = useEditor();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "s",
      ctrlKey: true,
      description: "Save current file",
      action: () => {
        saveCurrentFile();
        toast.success("File saved");
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
          } md:block w-64 flex-shrink-0 absolute md:relative z-20 h-full md:z-0 shadow-lg md:shadow-none`}
        >
          <FileBrowser />
        </div>

        {/* Editor/Preview Area */}
        <div className="flex-1 overflow-hidden flex">
          {mode === "split" ? (
            <>
              <div className="flex-1 border-r overflow-hidden">
                <Editor />
              </div>
              <div className="flex-1 overflow-hidden">
                <MarkdownPreview />
              </div>
            </>
          ) : mode === "edit" ? (
            <Editor />
          ) : (
            <MarkdownPreview />
          )}
        </div>
      </div>
    </div>
  );
}
