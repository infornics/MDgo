"use client";

import React from "react";
import { useEditor } from "@/contexts/editor-context";
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
import { FileText, Code, Copy } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const { currentFile } = useEditor();

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

  const handleCopyContent = () => {
    navigator.clipboard.writeText(currentFile.content);
    toast.success("Content copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share & Export</DialogTitle>
          <DialogDescription>
            Export your markdown file in different formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={handleExportMarkdown}
          >
            <FileText className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Download as Markdown</div>
              <div className="text-xs text-muted-foreground">
                Export as .md file
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={handleExportHTML}
          >
            <Code className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Download as HTML</div>
              <div className="text-xs text-muted-foreground">
                Export as standalone HTML file
              </div>
            </div>
          </Button>

          <Separator />

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={handleCopyContent}
          >
            <Copy className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Copy to Clipboard</div>
              <div className="text-xs text-muted-foreground">
                Copy markdown content
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
