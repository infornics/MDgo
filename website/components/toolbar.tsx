"use client";

import { AuthDialog } from "@/components/auth-dialog";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { PDFExportDialog } from "@/components/pdf-export-dialog";
import { ShareDialog } from "@/components/share-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useEditor } from "@/contexts/editor-context";
import { exportAsHTML, exportAsMarkdown } from "@/lib/pdf-generator";
import {
  Code,
  Columns2,
  Edit,
  Eye,
  FileDown,
  LogOut,
  Moon,
  Share2,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
  const { user, isAuthenticated, logout } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const handleSave = () => {
    if (!currentFile) {
      toast.error("No file to save");
      return;
    }
    saveCurrentFile();
  };

  const handleExportMarkdown = () => {
    if (!currentFile) return;
    exportAsMarkdown(currentFile.content, currentFile.name.replace(".md", ""));
    toast.success("Exported as Markdown");
  };

  const handleExportHTML = () => {
    if (!currentFile) return;
    const { parseMarkdown } = require("@/lib/markdown");
    const html = parseMarkdown(currentFile.content);
    exportAsHTML(html, currentFile.name.replace(".md", ""));
    toast.success("Exported as HTML");
  };

  return (
    <>
      <div className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 gap-4">
        {/* Left side - Brand & File Name */}
        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm italic">
                M
              </span>
            </div>
            <span className="font-bold tracking-tight hidden sm:inline-block">
              MDgo
            </span>
          </Link>
          {currentFile && (
            <>
              <Separator
                orientation="vertical"
                className="h-6 mx-1 hidden md:block"
              />
              <div className="flex items-center gap-2 overflow-hidden max-w-[250px]">
                <span className="text-xs font-medium truncate">
                  {currentFile.name}
                </span>
                <div className="flex items-center gap-1.5 ml-1">
                  {isSaving ? (
                    <>
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                      <span className="text-[10px] text-muted-foreground font-medium animate-pulse uppercase tracking-wider">
                        Saving...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500/50 flex-shrink-0" />
                      <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">
                        Saved
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex-shrink-0">
          <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
            <Button
              variant={mode === "view" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setMode("view")}
              title="View mode"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">View</span>
            </Button>
            <Button
              variant={mode === "edit" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs disabled:pointer-events-auto disabled:cursor-not-allowed"
              onClick={() => setMode("edit")}
              disabled={currentFile?.role === "read"}
              title={
                currentFile?.role === "read"
                  ? "You only have view access"
                  : "Edit mode"
              }
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant={mode === "split" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs disabled:pointer-events-auto disabled:cursor-not-allowed"
              onClick={() => setMode("split")}
              disabled={currentFile?.role === "read"}
              title={
                currentFile?.role === "read"
                  ? "You only have view access"
                  : "Split mode"
              }
            >
              <Columns2 className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Split</span>
            </Button>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center justify-end gap-1 flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                disabled={!currentFile}
                title="Export options"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span className="hidden lg:inline ml-1.5">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => setPdfOpen(true)}
                className="text-xs"
              >
                <FileDown className="mr-2 h-3.5 w-3.5" />
                PDF (.pdf)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportMarkdown}
                className="text-xs"
              >
                <FileDown className="mr-2 h-3.5 w-3.5" />
                Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportHTML} className="text-xs">
                <Code className="mr-2 h-3.5 w-3.5" />
                HTML (.html)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {currentFile?.isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setShareOpen(true)}
              disabled={!currentFile}
              title="Share & Export"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden lg:inline ml-1.5">Share</span>
            </Button>
          )}

          <Separator orientation="vertical" className="h-6 mx-1" />

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

          <Separator orientation="vertical" className="h-6" />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-medium hidden lg:inline max-w-[100px] truncate">
                    {user?.name || user?.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive text-xs"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="h-8 text-xs px-4"
              onClick={() => setAuthOpen(true)}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
      <PDFExportDialog open={pdfOpen} onOpenChange={setPdfOpen} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </>
  );
}
