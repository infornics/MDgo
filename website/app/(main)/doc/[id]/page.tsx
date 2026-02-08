"use client";

import { Editor, FileBrowser, MarkdownPreview, Toolbar } from "@/components/doc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useEditor } from "@/contexts/editor-context";
import { useKeyboardShortcuts } from "@/lib/keyboard-shortcuts";
import { Loader2, Minimize2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
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
    sidebarOpen,
    setSidebarOpen,
    focusMode,
    setFocusMode,
  } = useEditor();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading || !isFilesLoaded) return;

    if (id && typeof id === "string") {
      selectDocumentById(id).catch(() => {
        // Error state is now handled in the context
      });
    }
  }, [id, isAuthenticated, isAuthLoading, isFilesLoaded]);

  // Update browser tab title based on the currently open file (without .md)
  useEffect(() => {
    if (currentFile?.name) {
      const baseName = currentFile.name.endsWith(".md")
        ? currentFile.name.slice(0, -3)
        : currentFile.name;
      document.title = `${baseName} | MDgo`;
    } else {
      document.title = "MDgo";
    }
  }, [currentFile]);

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
    {
      key: "Escape",
      description: "Exit focus mode",
      action: () => {
        setFocusMode(false);
      },
    },
    {
      key: "f",
      ctrlKey: true,
      description: "Focus mode (reading)",
      action: () => {
        if (currentFile && (mode === "view" || mode === "split")) {
          setFocusMode(true);
        }
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
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Focus mode: full-screen reading overlay */}
      {focusMode && currentFile && !error && (
        <div
          className="fixed inset-0 z-50 bg-background animate-in fade-in duration-200 flex flex-col"
          role="dialog"
          aria-label="Focus mode - reading view"
        >
          <div className="absolute top-0 right-0 z-10 p-4 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full shadow-lg border bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-foreground transition-all opacity-90 hover:opacity-100"
              onClick={() => setFocusMode(false)}
              title="Exit focus mode (Esc)"
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Exit focus
            </Button>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Esc
            </span>
          </div>
          <div className="flex-1 overflow-hidden pt-16">
            <MarkdownPreview forceShow readingMode />
          </div>
        </div>
      )}

      <div
        className={`h-screen flex flex-col overflow-hidden transition-opacity duration-200 ${
          focusMode ? "opacity-0 pointer-events-none fixed inset-0" : ""
        }`}
        aria-hidden={focusMode}
      >
        <Toolbar />

        <div className="flex-1 flex overflow-hidden relative">
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
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center">
              Select a file from the sidebar to start editing
            </div>
          ) : mode === "split" ? (
            <>
              <div className="flex-1 border-r overflow-hidden h-full">
                <Editor />
              </div>
              <div className="hidden md:block flex-1 overflow-hidden h-full">
                <MarkdownPreview />
              </div>
            </>
          ) : mode === "edit" ? (
            <div className="flex-1 overflow-hidden h-full">
              <Editor />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden h-full">
              <MarkdownPreview />
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
