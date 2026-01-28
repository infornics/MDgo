"use client";

import { AuthDialog } from "@/components/auth/auth-dialog";
import {
  KeyboardShortcutsDialog,
  PdfExportDialog,
  ShareDialog,
  SmartPasteDialog,
} from "@/components/doc";
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
import { icons } from "@/public/icons";
import {
  ClipboardPaste,
  Code,
  Columns2,
  Edit,
  Eye,
  FileDown,
  LogOut,
  Menu,
  Moon,
  MoreVertical,
  Share2,
  Sun,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Toolbar() {
  const {
    mode,
    setMode,
    theme,
    setTheme,
    currentFile,
    isSaving,
    sidebarOpen,
    setSidebarOpen,
    currentProject,
    loadProjects,
    loadProjectItems,
  } = useEditor();
  const { user, isAuthenticated, logout } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [smartPasteOpen, setSmartPasteOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated, loadProjects]);

  useEffect(() => {
    if (isAuthenticated && currentProject) {
      loadProjectItems(currentProject.id);
    }
  }, [isAuthenticated, currentProject, loadProjectItems]);

  const handleExportMarkdown = () => {
    if (!currentFile) return;
    exportAsMarkdown(currentFile.content, currentFile.name.replace(".md", ""));
    toast.success("Exported as Markdown");
  };

  const handleExportHTML = () => {
    if (!currentFile) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { parseMarkdown } = require("@/lib/markdown");
    const html = parseMarkdown(currentFile.content);
    exportAsHTML(html, currentFile.name.replace(".md", ""));
    toast.success("Exported as HTML");
  };

  return (
    <>
      <div className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 gap-4">
        {/* Left side - Brand & File Name */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-2 h-9 w-9"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src={icons.logo}
              alt="MDgo"
              width={500}
              height={500}
              className="w-auto h-7"
            />
          </Link>

          {currentFile && (
            <>
              <Separator
                orientation="vertical"
                className="h-6 mx-0.5 sm:mx-1 hidden xs:block"
              />
              <div className="flex items-center gap-2 overflow-hidden max-w-[120px] sm:max-w-[250px]">
                <span className="text-xs font-medium truncate">
                  {currentFile.name}
                </span>
                <div className="flex items-center gap-1.5 ml-1">
                  {isSaving ? (
                    <>
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                      <span className="text-[10px] text-muted-foreground font-medium animate-pulse uppercase tracking-wider hidden xs:inline">
                        Saving...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500/50 shrink-0" />
                      <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider hidden xs:inline">
                        Saved
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="shrink-0">
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5 sm:p-1 border overflow-hidden">
            <Button
              variant={mode === "view" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2 xs:px-3 text-xs"
              onClick={() => setMode("view")}
              title="View mode"
            >
              <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">View</span>
            </Button>
            <Button
              variant={mode === "edit" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2 xs:px-3 text-xs disabled:pointer-events-auto disabled:cursor-not-allowed"
              onClick={() => setMode("edit")}
              disabled={currentFile?.role === "read"}
              title={
                currentFile?.role === "read"
                  ? "You only have view access"
                  : "Edit mode"
              }
            >
              <Edit className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant={mode === "split" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2 xs:px-3 text-xs disabled:pointer-events-auto disabled:cursor-not-allowed hidden md:flex"
              onClick={() => setMode("split")}
              disabled={currentFile?.role === "read"}
              title={
                currentFile?.role === "read"
                  ? "You only have view access"
                  : "Split mode"
              }
            >
              <Columns2 className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Split</span>
            </Button>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center justify-end gap-1 flex-1">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setSmartPasteOpen(true)}
              disabled={!currentFile || currentFile.role === "read"}
              title="Smart Paste (Auto-convert HTML to Markdown)"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              <span className="hidden lg:inline ml-1.5">Smart Paste</span>
            </Button>

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
                <DropdownMenuItem
                  onClick={handleExportHTML}
                  className="text-xs"
                >
                  <Code className="mr-2 h-3.5 w-3.5" />
                  HTML (.html)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {currentFile?.isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 sm:px-3 text-xs"
                onClick={() => setShareOpen(true)}
                disabled={!currentFile}
                title="Share & Export"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden xl:inline ml-1.5">Share</span>
              </Button>
            )}

            <Separator orientation="vertical" className="h-6 mx-0.5 sm:mx-1" />

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
          </div>

          {/* Mobile "More" Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setSmartPasteOpen(true)}
                  disabled={!currentFile || currentFile.role === "read"}
                >
                  <ClipboardPaste className="mr-2 h-4 w-4" />
                  Smart Paste
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPdfOpen(true)}
                  disabled={!currentFile}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExportMarkdown}
                  disabled={!currentFile}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export Markdown
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExportHTML}
                  disabled={!currentFile}
                >
                  <Code className="mr-2 h-4 w-4" />
                  Export HTML
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShareOpen(true)}
                  disabled={!currentFile}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark Mode
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 sm:gap-2 px-1 sm:px-2 shrink-0"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium hidden xs:inline max-w-[60px] sm:max-w-[100px] truncate">
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
              className="h-8 text-[10px] sm:text-xs px-3 sm:px-4 shrink-0"
              onClick={() => setAuthOpen(true)}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
      <PdfExportDialog open={pdfOpen} onOpenChange={setPdfOpen} />
      <SmartPasteDialog
        open={smartPasteOpen}
        onOpenChange={setSmartPasteOpen}
      />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </>
  );
}
