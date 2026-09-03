"use client";

import { useEditor } from "@/contexts/editor-context";
import React, { useRef } from "react";

export default function Editor() {
  const { currentFile, updateCurrentFileContent, mode } = useEditor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!currentFile || mode === "view") {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateCurrentFileContent(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (currentFile.role === "read") return;
    const textarea = e.currentTarget;

    // Handle Tab and Shift+Tab
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      if (e.shiftKey) {
        // Shift+Tab: Unindent
        const beforeCursor = value.substring(0, start);
        const lastNewline = beforeCursor.lastIndexOf("\n");
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

        if (value.substring(lineStart, lineStart + 2) === "  ") {
          const newValue =
            value.substring(0, lineStart) + value.substring(lineStart + 2);
          updateCurrentFileContent(newValue);
          requestAnimationFrame(() => {
            textarea.selectionStart = Math.max(lineStart, start - 2);
            textarea.selectionEnd = Math.max(lineStart, end - 2);
          });
        }
      } else {
        // Tab: Insert 2 spaces
        if (start === end) {
          const newValue =
            value.substring(0, start) + "  " + value.substring(end);
          updateCurrentFileContent(newValue);
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
          });
        } else {
          // Indent selected lines
          const beforeSelection = value.substring(0, start);
          const lastNewline = beforeSelection.lastIndexOf("\n");
          const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
          const selectedText = value.substring(lineStart, end);
          const indentedText = selectedText
            .split("\n")
            .map((line) => "  " + line)
            .join("\n");
          const newValue =
            value.substring(0, lineStart) +
            indentedText +
            value.substring(end);
          updateCurrentFileContent(newValue);
          requestAnimationFrame(() => {
            textarea.selectionStart = start + 2;
            textarea.selectionEnd =
              end + (indentedText.length - selectedText.length);
          });
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-card relative">
      <textarea
        ref={textareaRef}
        value={currentFile.content || ""}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Start writing markdown..."
        readOnly={currentFile.role === "read"}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="w-full h-full p-4 md:p-6 bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none outline-none focus:outline-none border-none focus:ring-0 select-text overflow-auto selection:bg-accent/40 selection:text-foreground placeholder:text-muted-foreground/50"
        style={{
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          tabSize: 2,
        }}
      />
    </div>
  );
}
