"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEditor } from "@/contexts/editor-context";
import { useKeyboardShortcuts } from "@/lib/keyboard-shortcuts";
import { FolderTree, LayoutPanelLeft, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { MdBlockFlipped } from "react-icons/md";

// components
import {
  Editor,
  FileBrowser,
  MarkdownPreview,
  Toolbar,
  ProjectDialog,
} from "@/components/doc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocPage() {
  const {
    mode,
    saveCurrentFile,
    setMode,
    currentFile,
    currentProject,
    setCurrentProject,
    projects,
    isFilesLoaded,
    setCurrentFile,
  } = useEditor();
  const { isLoading: isAuthLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  // Ensure no document is open on this base route
  useEffect(() => {
    if (isFilesLoaded && currentFile !== null) {
      setCurrentFile(null);
    }
  }, [isFilesLoaded, currentFile, setCurrentFile]);

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

  if (isAuthLoading || !isFilesLoaded) {
    return (
      <div className="h-screen w-full flex flex-col bg-background">
        {/* Top toolbar skeleton */}
        <div className="border-b">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>

        {/* Main layout skeleton: sidebar + editor area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar skeleton */}
          <div className="hidden md:flex flex-col w-[280px] border-r bg-card/40 p-3 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            <Skeleton className="h-8 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>

          {/* Editor / preview skeleton */}
          <div className="flex-1 flex flex-col gap-0 p-4 sm:p-8">
            <div className="max-w-4xl w-full mx-auto space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
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

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed md:relative top-0 left-0 bottom-0 z-30 md:z-0 w-[280px] md:w-64 transition-transform duration-300 ease-in-out md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } bg-background border-r shadow-2xl md:shadow-none h-full`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Sidebar Close Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b">
              <span className="font-bold text-sm tracking-tight">
                Navigation
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarOpen(false)}
              >
                <MdBlockFlipped className="rotate-45" />
              </Button>
            </div>
            <FileBrowser />
          </div>
        </div>

        {/* Editor/Preview Area */}
        <div className="flex-1 overflow-hidden flex bg-background">
          {!currentFile ? (
            <div className="flex-1 flex items-center justify-center bg-background">
              <div className="max-w-2xl w-full mx-4 sm:mx-0 p-6 sm:p-10 rounded-3xl border border-border/30 bg-background/80 backdrop-blur-sm shadow-[0_22px_55px_rgba(0,0,0,0.45)] space-y-8">
                {/* Title + subtle description */}
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FolderTree className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
                      Projects
                    </p>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                      Choose how you want to work today
                    </h3>
                  </div>
                </div>

                {/* Big visual tiles */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setProjectDialogOpen(true)}
                    className="group flex flex-col items-start gap-3 rounded-2xl border border-border/40 bg-muted/40 px-4 py-4 hover:bg-muted/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FolderTree className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {currentProject ? "Switch project" : "Create or select project"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Open a project workspace with its own folder tree.
                        </p>
                      </div>
                    </div>
                  </button>

                  {currentProject && (
                    <button
                      type="button"
                      onClick={() => setCurrentProject(null)}
                      className="group flex flex-col items-start gap-3 rounded-2xl border border-border/40 bg-background/70 px-4 py-4 hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                          <LayoutPanelLeft className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Continue without project
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Use a single global list of markdown files.
                          </p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Tiny status line */}
                {projects.length > 0 && (
                  <p className="text-[11px] text-muted-foreground/80">
                    You currently have{" "}
                    <span className="font-semibold text-foreground">
                      {projects.length}
                    </span>{" "}
                    project{projects.length > 1 ? "s" : ""} available.
                  </p>
                )}
              </div>
            </div>
          ) : mode === "split" ? (
            <>
              <div className="flex-1 border-r overflow-hidden group relative h-full">
                <Editor />
              </div>
              <div className="hidden md:block flex-1 overflow-hidden h-full">
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
      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
      />
    </div>
  );
}
