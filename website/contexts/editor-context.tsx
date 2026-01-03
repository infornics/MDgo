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

import { useAuth } from "./auth-context";
import api from "@/lib/api";
import { toast } from "sonner";

interface EditorContextType extends EditorState {
  setCurrentFile: (file: MarkdownFile | null) => void;
  updateCurrentFileContent: (content: string) => void;
  setMode: (mode: EditorMode) => void;
  setTheme: (theme: "light" | "dark") => void;
  addFile: (file: MarkdownFile) => void;
  removeFile: (fileId: string) => void;
  saveCurrentFile: () => Promise<void>;
  refreshFiles: () => Promise<void>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<EditorState>({
    currentFile: null,
    files: [],
    mode: "split",
    theme: "dark",
    isSaving: false,
  });

  // Load files (either from Local Storage or Backend)
  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthenticated) {
      loadBackendFiles();
    } else {
      loadLocalFiles();
    }
  }, [isAuthenticated, isAuthLoading]);

  const loadLocalFiles = () => {
    const loadedFiles = getFiles();

    if (loadedFiles.length === 0) {
      const welcomeFile = createFile(
        "Welcome.md",
        `# Welcome to MDgo! 🚀\n\n(Local Storage Mode - Sign in to sync to cloud)\n\nMDgo is a powerful markdown editor...`
      );
      loadedFiles.push(welcomeFile);
      saveFiles(loadedFiles);
    }

    setState((prev) => ({
      ...prev,
      files: loadedFiles,
      currentFile: loadedFiles[0] || null,
    }));
  };

  const loadBackendFiles = async () => {
    try {
      const response = await api.get("/documents");
      // Map backend documents to frontend MarkdownFile interface
      const backendFiles: MarkdownFile[] = await Promise.all(
        response.data.map(async (doc: any) => {
          // Fetch content from ContentUrl if needed, or assume we might want to fetch on-demand
          // For now, let's assume we fetch the content (this might be slow for many files)
          let content = "";
          try {
            const contentRes = await fetch(doc.contentUrl);
            content = await contentRes.text();
          } catch (e) {
            content = "# Error loading content";
          }

          return {
            id: doc.fileId,
            _id: doc._id,
            name: doc.title,
            content: content,
            contentUrl: doc.contentUrl,
            createdAt: new Date(doc.createdAt),
            modifiedAt: new Date(doc.updatedAt),
          };
        })
      );

      setState((prev) => ({
        ...prev,
        files: backendFiles,
        currentFile: backendFiles[0] || null,
      }));
    } catch (error) {
      console.error("Failed to load backend files", error);
      toast.error("Failed to sync with cloud");
      loadLocalFiles(); // Fallback
    }
  };

  const refreshFiles = async () => {
    if (isAuthenticated) {
      await loadBackendFiles();
    } else {
      loadLocalFiles();
    }
  };

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

  const addFile = async (file: MarkdownFile) => {
    if (isAuthenticated) {
      try {
        const response = await api.post("/documents", {
          title: file.name,
          content: file.content,
        });
        const newFile: MarkdownFile = {
          ...file,
          _id: response.data._id,
          id: response.data.fileId,
          contentUrl: response.data.contentUrl,
        };
        setState((prev) => ({
          ...prev,
          files: [...prev.files, newFile],
          currentFile: newFile,
        }));
      } catch (error) {
        toast.error("Failed to save to cloud");
      }
    } else {
      setState((prev) => {
        const updatedFiles = [...prev.files, file];
        saveFiles(updatedFiles);
        return {
          ...prev,
          files: updatedFiles,
          currentFile: file,
        };
      });
    }
  };

  const removeFile = async (fileId: string) => {
    if (isAuthenticated) {
      try {
        const fileToDelete = state.files.find((f) => f.id === fileId);
        if (fileToDelete?._id) {
          await api.delete(`/documents/${fileToDelete._id}`);
          setState((prev) => {
            const updatedFiles = prev.files.filter((f) => f.id !== fileId);
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
        }
      } catch (error) {
        toast.error("Failed to delete from cloud");
      }
    } else {
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
    }
  };

  const saveCurrentFile = async () => {
    if (!state.currentFile) return;

    setState((prev) => ({ ...prev, isSaving: true }));

    if (isAuthenticated && state.currentFile._id) {
      try {
        await api.put(`/documents/${state.currentFile._id}`, {
          title: state.currentFile.name,
          content: state.currentFile.content,
        });
        toast.success("Saved dynamically to cloud");
      } catch (error) {
        toast.error("Failed to sync changes to cloud");
      } finally {
        setState((prev) => ({ ...prev, isSaving: false }));
      }
    } else {
      setTimeout(() => {
        saveFiles(state.files);
        setState((prev) => ({ ...prev, isSaving: false }));
      }, 500);
    }
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
        refreshFiles,
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
