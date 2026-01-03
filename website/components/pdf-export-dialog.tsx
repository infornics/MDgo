"use client";

import React, { useState } from "react";
import { useEditor } from "@/contexts/editor-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generatePDF } from "@/lib/pdf-generator";
import { parseMarkdown } from "@/lib/markdown";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PDFExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PDFExportDialog({ open, onOpenChange }: PDFExportDialogProps) {
  const { currentFile } = useEditor();
  const [isExporting, setIsExporting] = useState(false);

  if (!currentFile) return null;

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const html = parseMarkdown(currentFile.content);
      const fileName = currentFile.name.replace(".md", "");

      await generatePDF(html, fileName, {
        pageSize: "a4",
        orientation: "portrait",
        margin: 15,
      });

      toast.success("PDF exported successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export as PDF</DialogTitle>
          <DialogDescription>
            Convert your markdown document to a PDF file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">File name:</span>
              <span className="font-medium">
                {currentFile.name.replace(".md", ".pdf")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Page size:</span>
              <span className="font-medium">A4</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Orientation:</span>
              <span className="font-medium">Portrait</span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
