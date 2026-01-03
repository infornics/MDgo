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
  addFile: (file: MarkdownFile) => Promise<MarkdownFile | void>;
  removeFile: (fileId: string) => void;
  saveCurrentFile: () => Promise<void>;
  refreshFiles: () => Promise<void>;
  selectDocumentById: (id: string) => Promise<void>;
  updateDocumentSharing: (
    id: string,
    sharingData: { isPublic?: boolean; sharedWith?: any[] }
  ) => Promise<void>;
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
    isLoading: false,
    error: null,
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
      currentFile: prev.currentFile || loadedFiles[0] || null,
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
            isPublic: doc.isPublic,
            sharedWith: doc.sharedWith,
            role: doc.role,
            isOwner: doc.isOwner,
            createdAt: new Date(doc.createdAt),
            modifiedAt: new Date(doc.updatedAt),
          };
        })
      );

      setState((prev) => ({
        ...prev,
        files: backendFiles,
        currentFile: prev.currentFile || backendFiles[0] || null,
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

  const selectDocumentById = async (id: string) => {
    setState((prev) => ({ ...prev, error: null }));

    // 1. Check if already loaded in the list
    const existingFile = state.files.find((f) => f._id === id || f.id === id);
    if (existingFile) {
      setState((prev) => ({ ...prev, currentFile: existingFile, error: null }));
      return;
    }

    // 2. Try to fetch from backend (works for both authenticated and public docs)
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await api.get(`/documents/${id}`);
      const doc = response.data;

      // Fetch actual content
      let content = "";
      try {
        const contentRes = await fetch(doc.contentUrl);
        content = await contentRes.text();
      } catch (e) {
        content = "# Error loading content";
      }

      const newFile: MarkdownFile = {
        id: doc.fileId,
        _id: doc._id,
        name: doc.title,
        content: content,
        contentUrl: doc.contentUrl,
        isPublic: doc.isPublic,
        sharedWith: doc.sharedWith,
        role: doc.role,
        isOwner: doc.isOwner,
        createdAt: new Date(doc.createdAt),
        modifiedAt: new Date(doc.updatedAt),
      };

      setState((prev) => ({
        ...prev,
        currentFile: newFile,
        isLoading: false,
        error: null,
        // If role is read, force view mode
        mode: newFile.role === "read" ? "view" : prev.mode,
        // Add to files list if not there
        files: prev.files.some((f) => f._id === newFile._id)
          ? prev.files
          : [newFile, ...prev.files],
      }));
    } catch (error: any) {
      console.error("Error selecting document", error);
      const errorMessage =
        error.response?.status === 403
          ? "Access Denied: This document is private or you don't have permission to view it."
          : error.response?.status === 404
          ? "Document not found."
          : "Failed to load document.";

      toast.error(errorMessage);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        currentFile: null,
      }));
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
    // If user is a reader, only allow view mode
    if (state.currentFile?.role === "read" && mode !== "view") {
      toast.error("You only have read-only access to this document");
      return;
    }
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
          isPublic: response.data.isPublic,
          sharedWith: response.data.sharedWith,
          role: "owner",
          isOwner: true,
        };
        setState((prev) => ({
          ...prev,
          files: [...prev.files, newFile],
          currentFile: newFile,
        }));
        return newFile;
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
      return file;
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

  const updateDocumentSharing = async (
    id: string,
    sharingData: { isPublic?: boolean; sharedWith?: any[] }
  ) => {
    if (!isAuthenticated) return;

    try {
      const response = await api.put(`/documents/${id}/sharing`, sharingData);
      const updatedDoc = response.data;

      setState((prev) => {
        const updatedFiles = prev.files.map((f: MarkdownFile) => {
          if (f._id === id) {
            return {
              ...f,
              isPublic: updatedDoc.isPublic,
              sharedWith: updatedDoc.sharedWith,
            };
          }
          return f;
        });

        const updatedCurrentFile =
          prev.currentFile?._id === id
            ? {
                ...prev.currentFile,
                isPublic: updatedDoc.isPublic,
                sharedWith: updatedDoc.sharedWith,
              }
            : prev.currentFile;

        return {
          ...prev,
          files: updatedFiles,
          currentFile: updatedCurrentFile,
        };
      });

      toast.success("Sharing permissions updated");
    } catch (error) {
      console.error("Failed to update sharing", error);
      toast.error("Failed to update sharing permissions");
      throw error;
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
        selectDocumentById,
        updateDocumentSharing,
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
