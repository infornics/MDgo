"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditor } from "@/contexts/editor-context";
import { parseMarkdown } from "@/lib/markdown";
import { useDeferredValue, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

interface MarkdownPreviewProps {
  /** When true, show preview even in edit mode (e.g. in focus mode overlay) */
  forceShow?: boolean;
  /** Apply reading-optimized layout (used in focus mode) */
  readingMode?: boolean;
}

export default function MarkdownPreview({
  forceShow = false,
  readingMode = false,
}: MarkdownPreviewProps = {}) {
  const { currentFile, mode } = useEditor();
  const previewRef = useRef<HTMLDivElement>(null);
  const deferredContent = useDeferredValue(currentFile?.content || "");

  const html = useMemo(() => {
    if (!deferredContent) return "";
    return parseMarkdown(deferredContent);
  }, [deferredContent]);

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
  }, []);

  if (!currentFile || (mode === "edit" && !forceShow)) {
    return null;
  }

  return (
    <ScrollArea className="h-full markdown-preview-scroll">
      <div className="markdown-preview-page">
        <div
          ref={previewRef}
          id="markdown-preview"
          className={
            readingMode
              ? "prose-reading p-6 md:p-12 lg:p-16 max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto text-base md:text-lg leading-relaxed w-full"
              : "p-4 md:p-12 max-w-4xl mx-auto"
          }
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </ScrollArea>
  );
}
