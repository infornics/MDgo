"use client";

import React, { useState } from "react";
import { useEditor } from "@/contexts/editor-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Edit,
  Columns2,
  Save,
  FileDown,
  Share2,
  Sun,
  Moon,
  Keyboard,
} from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";
import { PDFExportDialog } from "@/components/pdf-export-dialog";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { toast } from "sonner";

export function Toolbar() {
  const {
    mode,
    setMode,
    theme,
    setTheme,
    currentFile,
    saveCurrentFile,
    isSaving,
  } = useEditor();
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handleSave = () => {
    if (!currentFile) {
      toast.error("No file to save");
      return;
    }
    saveCurrentFile();
    toast.success("File saved");
  };

  return (
    <>
      <div className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 gap-4">
        {/* Left side - Mode toggles */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={mode === "view" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setMode("view")}
              title="View mode"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
            <Button
              variant={mode === "edit" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setMode("edit")}
              title="Edit mode"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            <Button
              variant={mode === "split" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setMode("split")}
              title="Split mode"
            >
              <Columns2 className="h-3.5 w-3.5 mr-1.5" />
              Split
            </Button>
          </div>

          {currentFile && (
            <div className="hidden md:flex items-center gap-2 ml-4">
              <span className="text-sm text-muted-foreground">Editing:</span>
              <span className="text-sm font-medium">{currentFile.name}</span>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={handleSave}
            disabled={!currentFile || isSaving}
            title="Save (Ctrl+S)"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => setPdfOpen(true)}
            disabled={!currentFile}
            title="Export as PDF (Ctrl+P)"
          >
            <FileDown className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">PDF</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => setShareOpen(true)}
            disabled={!currentFile}
            title="Share & Export"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard shortcuts (Ctrl+/)"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
      <PDFExportDialog open={pdfOpen} onOpenChange={setPdfOpen} />
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </>
  );
}
