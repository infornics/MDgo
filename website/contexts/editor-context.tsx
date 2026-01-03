"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { EditorState, MarkdownFile, EditorMode } from "@/types/editor";
import { getFiles, saveFiles, createFile } from "@/lib/file-manager";

interface EditorContextType extends EditorState {
  setCurrentFile: (file: MarkdownFile | null) => void;
  updateCurrentFileContent: (content: string) => void;
  setMode: (mode: EditorMode) => void;
  setTheme: (theme: "light" | "dark") => void;
  addFile: (file: MarkdownFile) => void;
  removeFile: (fileId: string) => void;
  saveCurrentFile: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EditorState>({
    currentFile: null,
    files: [],
    mode: "split",
    theme: "dark",
    isSaving: false,
  });

  // Load files from local storage on mount
  useEffect(() => {
    const loadedFiles = getFiles();

    if (loadedFiles.length === 0) {
      // Create a welcome file if no files exist
      const welcomeFile = createFile(
        "Welcome.md",
        `# Welcome to MDgo! 🚀

MDgo is a powerful markdown editor with live preview, PDF export, and sharing capabilities.

## Features

- **Live Preview**: See your markdown rendered in real-time
- **Syntax Highlighting**: Beautiful code blocks with syntax highlighting
- **PDF Export**: Convert your markdown to PDF with one click
- **Dark Mode**: Easy on the eyes with built-in dark mode
- **Keyboard Shortcuts**: Work faster with keyboard shortcuts

## Getting Started

1. Click the **+** button to create a new file
2. Start writing in markdown
3. Switch between View, Edit, and Split modes
4. Export your work as PDF, HTML, or Markdown

## Keyboard Shortcuts

- \`Ctrl+S\` - Save current file
- \`Ctrl+E\` - Toggle edit/preview mode
- \`Ctrl+P\` - Export as PDF
- \`Ctrl+N\` - Create new file
- \`Ctrl+/\` - Show shortcuts

## Markdown Examples

### Code Block

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`

### Lists

- Item 1
- Item 2
  - Nested item
  - Another nested item

### Tables

| Feature | Supported |
|---------|-----------|
| Tables  | ✅        |
| Lists   | ✅        |
| Code    | ✅        |

Happy writing! ✨
`
      );
      loadedFiles.push(welcomeFile);
      saveFiles(loadedFiles);
    }

    setState((prev) => ({
      ...prev,
      files: loadedFiles,
      currentFile: loadedFiles[0] || null,
    }));
  }, []);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("mdgo-theme") as
      | "light"
      | "dark"
      | null;
    if (savedTheme) {
      setState((prev) => ({ ...prev, theme: savedTheme }));
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const theme = prefersDark ? "dark" : "light";
      setState((prev) => ({ ...prev, theme }));
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, []);

  const setCurrentFile = (file: MarkdownFile | null) => {
    setState((prev) => ({ ...prev, currentFile: file }));
  };

  const updateCurrentFileContent = (content: string) => {
    setState((prev) => {
      if (!prev.currentFile) return prev;

      const updatedFile = { ...prev.currentFile, content };
      const updatedFiles = prev.files.map((f) =>
        f.id === updatedFile.id ? updatedFile : f
      );

      return {
        ...prev,
        currentFile: updatedFile,
        files: updatedFiles,
      };
    });
  };

  const setMode = (mode: EditorMode) => {
    setState((prev) => ({ ...prev, mode }));
  };

  const setTheme = (theme: "light" | "dark") => {
    setState((prev) => ({ ...prev, theme }));
    localStorage.setItem("mdgo-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  };

  const addFile = (file: MarkdownFile) => {
    setState((prev) => {
      const updatedFiles = [...prev.files, file];
      saveFiles(updatedFiles);
      return {
        ...prev,
        files: updatedFiles,
        currentFile: file,
      };
    });
  };

  const removeFile = (fileId: string) => {
    setState((prev) => {
      const updatedFiles = prev.files.filter((f) => f.id !== fileId);
      saveFiles(updatedFiles);

      const newCurrentFile =
        prev.currentFile?.id === fileId
          ? updatedFiles[0] || null
          : prev.currentFile;

      return {
        ...prev,
        files: updatedFiles,
        currentFile: newCurrentFile,
      };
    });
  };

  const saveCurrentFile = () => {
    if (!state.currentFile) return;

    setState((prev) => ({ ...prev, isSaving: true }));

    setTimeout(() => {
      saveFiles(state.files);
      setState((prev) => ({ ...prev, isSaving: false }));
    }, 500);
  };

  return (
    <EditorContext.Provider
      value={{
        ...state,
        setCurrentFile,
        updateCurrentFileContent,
        setMode,
        setTheme,
        addFile,
        removeFile,
        saveCurrentFile,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return context;
}
