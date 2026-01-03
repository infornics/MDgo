"use client";

import React, { useEffect, useRef } from "react";
import { useEditor } from "@/contexts/editor-context";
import { parseMarkdown } from "@/lib/markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export function MarkdownPreview() {
  const { currentFile, mode } = useEditor();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCopy = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest(".code-copy-button") as HTMLButtonElement;
      if (!button) return;

      const code = button.getAttribute("data-code");
      if (code) {
        navigator.clipboard.writeText(decodeURIComponent(code)).then(() => {
          toast.success("Code copied to clipboard", {
            duration: 2000,
          });

          // Optional: Change button text temporarily
          const originalText = button.innerHTML;
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M20 6 9 17l-5-5"/></svg>
            Copied!
          `;
          setTimeout(() => {
            button.innerHTML = originalText;
          }, 2000);
        });
      }
    };

    const container = previewRef.current;
    if (container) {
      container.addEventListener("click", handleCopy);
    }

    return () => {
      if (container) {
        container.removeEventListener("click", handleCopy);
      }
    };
  }, [currentFile?.content]);

  useEffect(() => {
    // Add syntax highlighting to code blocks (keeping this for any other blocks if needed,
    // although marked renderer now handles highlighting for fenced code)
    if (previewRef.current) {
      const codeBlocks = previewRef.current.querySelectorAll("pre code");
      codeBlocks.forEach((block) => {
        block.classList.add("block");
      });
    }
  }, [currentFile?.content]);

  if (!currentFile || mode === "edit") {
    return null;
  }

  const html = parseMarkdown(currentFile.content);

  return (
    <ScrollArea className="h-full bg-card">
      <div
        ref={previewRef}
        id="markdown-preview"
        className="p-6 md:p-12 max-w-4xl mx-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </ScrollArea>
  );
}
