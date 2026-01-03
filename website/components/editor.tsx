"use client";

import React from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useEditor } from "@/contexts/editor-context";

export function Editor() {
  const { currentFile, updateCurrentFileContent, mode, theme } = useEditor();

  if (!currentFile || mode === "view") {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex-1 overflow-auto">
        <CodeEditor
          value={currentFile.content}
          language="markdown"
          placeholder="Start writing markdown..."
          onChange={(e) => updateCurrentFileContent(e.target.value)}
          padding={24}
          data-color-mode={theme}
          readOnly={currentFile.role === "read"}
          style={{
            fontSize: 14,
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            backgroundColor: "transparent",
            minHeight: "100%",
          }}
          className="markdown-editor"
        />
      </div>
    </div>
  );
}
