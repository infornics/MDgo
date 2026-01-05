"use client";

import React from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useEditor } from "@/contexts/editor-context";

export function Editor() {
  const { currentFile, updateCurrentFileContent, mode, theme } = useEditor();
  const [content, setContent] = React.useState("");
  const debouncedUpdateRef = React.useRef<(value: string) => void>(null);

  // Sync local state when file changes
  React.useEffect(() => {
    if (currentFile) {
      setContent(currentFile.content || "");
    }
  }, [currentFile?.id, currentFile?.content]);
  // Note: We include currentFile.content in deps to support external updates (like initial load),
  // but in practice, while typing, the local state will be ahead.

  // Create debounced updater
  React.useEffect(() => {
    // Basic debounce implementation
    const handler = setTimeout(() => {
      // This effect runs on content change?? No, standard debounce usually wraps the callback.
    }, 0);
    // Wait, let's use a simpler approach for the ref to avoid stale closures

    let timeoutId: NodeJS.Timeout;
    debouncedUpdateRef.current = (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateCurrentFileContent(value);
      }, 300); // 300ms debounce
    };

    return () => clearTimeout(timeoutId);
  }, [updateCurrentFileContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue); // Instant local update
    if (debouncedUpdateRef.current) {
      debouncedUpdateRef.current(newValue); // Delayed context update
    }
  };

  if (!currentFile || mode === "view") {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex-1 overflow-auto">
        <CodeEditor
          value={content}
          language="markdown"
          placeholder="Start writing markdown..."
          onChange={handleChange}
          padding={16}
          data-color-mode={theme}
          readOnly={currentFile.role === "read"}
          style={{
            fontSize: 14,
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            backgroundColor: "transparent",
            color: "var(--foreground)",
            minHeight: "100%",
          }}
          className="markdown-editor"
        />
      </div>
    </div>
  );
}
