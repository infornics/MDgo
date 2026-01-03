"use client";

import React, { useEffect, useRef } from "react";
import { useEditor } from "@/contexts/editor-context";
import { parseMarkdown } from "@/lib/markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MarkdownPreview() {
  const { currentFile, mode } = useEditor();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add syntax highlighting to code blocks
    if (previewRef.current) {
      const codeBlocks = previewRef.current.querySelectorAll("pre code");
      codeBlocks.forEach((block) => {
        // Highlight.js classes are already applied by marked-highlight
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
