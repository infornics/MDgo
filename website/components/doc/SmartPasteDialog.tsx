"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditor } from "@/contexts/editor-context";
import { ClipboardPaste, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TurndownService from "turndown";

interface SmartPasteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SmartPasteDialog({
  open,
  onOpenChange,
}: SmartPasteDialogProps) {
  const { currentFile, updateCurrentFileContent } = useEditor();
  const [isProcessing, setIsProcessing] = useState(false);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  // Clear content when dialog opens
  useEffect(() => {
    if (open && pasteAreaRef.current) {
      pasteAreaRef.current.innerHTML = "";
      setTimeout(() => {
        pasteAreaRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSmartPaste = () => {
    if (!pasteAreaRef.current || !currentFile) return;

    setIsProcessing(true);
    try {
      // 1. Get content
      const htmlContent = pasteAreaRef.current.innerHTML;
      const plainText = pasteAreaRef.current.innerText;

      // 2. Try Turndown first (for HTML content)
      const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        bulletListMarker: "-",
      });

      let markdown = turndownService.turndown(htmlContent);

      // 3. Heuristic / Magic Formatting (if Turndown produced mostly plain text)
      // Check if the result is similar to plain text (meaning HTML structure was weak/absent)
      // or if we detect specific "plain text formatting" patterns like Emoji headers

      const hasMagicPatterns = /[🔹🔁⚡🧠🚀🟢🔰🔥🎯🔀💡]/.test(plainText);
      const isMostlyPlainText = markdown
        .split("\n")
        .every(
          (line) =>
            !line.startsWith("#") &&
            !line.startsWith("-") &&
            !line.startsWith("```")
        );

      if (hasMagicPatterns || isMostlyPlainText) {
        markdown = magicFormat(plainText);
      }

      // 4. Append to current document
      const newContent = currentFile.content
        ? `${currentFile.content}\n\n${markdown}`
        : markdown;

      updateCurrentFileContent(newContent);
      onOpenChange(false);
    } catch (error) {
      console.error("Smart paste failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const magicFormat = (text: string): string => {
    const lines = text.split("\n");
    const formattedLines: string[] = [];
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trimEnd(); // Keep leading spaces for indentation detection

      // Skip empty lines if multiple
      if (line.trim().length === 0) {
        if (formattedLines[formattedLines.length - 1] !== "") {
          formattedLines.push("");
        }
        continue;
      }

      // 1. Detect Headers via Emojis and Structure
      if (/^[#]+ /.test(line.trim())) {
        // Already markdown header, keep it
      } else if (/^[🔹🔁⚡🧠🚀🟢🔰🔥🎯🔀]/.test(line.trim())) {
        // Convert Emoji bullet headers to H3 or H2
        line = `### ${line.trim()}`;
      } else if (
        /^[A-Z0-9\s]+$/.test(line.trim()) &&
        line.trim().length > 3 &&
        !inCodeBlock
      ) {
        // Heuristic: ALL CAPS LINE usually a header (like "DAY03" or "Loops")
        // But exclude simple words if needed.
        // Let's rely on context or make it H2
        line = `## ${line.trim()}`;
      }

      // 2. Detect Lists via Emojis/Symbols
      if (/^[✔👉📌⚠️❌]/.test(line.trim())) {
        line = `- ${line.trim()}`;
      }

      // 3. Detect Code Blocks (Python style for this user)
      // Heuristic: Indentation or classic usage keywords
      const trims = line.trim();
      const isCodeLine =
        /^(if|else|elif|for|while|def|class|print|return|import|from)\b/.test(
          trims
        ) ||
        trims.includes(" = ") ||
        (trims.startsWith("# ") && inCodeBlock); // Comment inside code

      // Handling code block transitions
      if (isCodeLine && !inCodeBlock) {
        // Check if previous line was also code or empty?
        // Start code block
        formattedLines.push("```python");
        inCodeBlock = true;
      } else if (
        !isCodeLine &&
        inCodeBlock &&
        trims.length > 0 &&
        !trims.startsWith("    ") &&
        !line.startsWith("\t")
      ) {
        // End code block
        formattedLines.push("```");
        inCodeBlock = false;
      }

      // preserve indentation for code
      if (inCodeBlock) {
        formattedLines.push(line);
      } else {
        formattedLines.push(line.trim());
      }
    }

    // Close pending code block
    if (inCodeBlock) {
      formattedLines.push("```");
    }

    return formattedLines.join("\n");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPaste className="h-5 w-5 text-primary" />
            Smart Paste
          </DialogTitle>
          <DialogDescription>
            Paste content from Word, Google Docs, or websites below. It will be
            automatically converted to Markdown and added to the end of your
            document.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div
            ref={pasteAreaRef}
            contentEditable
            className="w-full min-h-[150px] max-h-[300px] overflow-y-auto p-4 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 empty:before:content-['Paste_your_content_here...'] empty:before:text-muted-foreground"
            onPaste={(e) => {
              // Allow default paste to populate the div with HTML
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSmartPaste} disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Convert & Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
