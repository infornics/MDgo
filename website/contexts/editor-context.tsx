"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { EditorState, MarkdownFile, EditorMode } from "@/types/editor";
import { getFiles, saveFiles, createFile } from "@/lib/file-manager";

import { useAuth } from "./auth-context";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditorContextType extends EditorState {
  isFilesLoaded: boolean;
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
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const [isFilesLoaded, setIsFilesLoaded] = useState(false);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [state, setState] = useState<EditorState>({
    currentFile: null,
    files: [],
    mode: "split",
    theme: "dark",
    isSaving: false,
    isLoading: false,
    error: null,
  });

  // Keep a ref to the latest state to avoid stale closures in callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  const loadLocalFiles = useCallback(() => {
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
      currentFile: prev.currentFile || null,
    }));
    setIsFilesLoaded(true);
  }, []);

  const loadBackendFiles = useCallback(async () => {
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
        currentFile: prev.currentFile || null,
      }));
    } catch (error) {
      console.error("Failed to load backend files", error);
      toast.error("Failed to sync with cloud");
      loadLocalFiles(); // Fallback
    } finally {
      setIsFilesLoaded(true);
    }
  }, [loadLocalFiles]);

  const refreshFiles = useCallback(async () => {
    setIsFilesLoaded(false);
    if (isAuthenticated) {
      await loadBackendFiles();
    } else {
      loadLocalFiles();
    }
  }, [isAuthenticated, loadBackendFiles, loadLocalFiles]);

  const selectDocumentById = useCallback(
    async (id: string) => {
      setState((prev) => ({ ...prev, error: null }));

      // 1. Check if already loaded in the list
      const existingFile = state.files.find((f) => f._id === id || f.id === id);
      if (existingFile) {
        setState((prev) => ({
          ...prev,
          currentFile: existingFile,
          error: null,
        }));
        return;
      }

      // 2. Try to fetch from backend (works for both authenticated and public docs)
      // Only fetch if it looks like a MongoDB ObjectId to avoid 400 errors with UUIDs
      if (!isValidObjectId(id)) {
        // If we are here and not found in existingFile, it's truly not found
        // But only if files are actually loaded
        if (isFilesLoaded) {
          setState((prev) => ({
            ...prev,
            error: "Document not found.",
            currentFile: null,
          }));
        }
        return;
      }

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
    },
    [state.files, isFilesLoaded]
  );

  const setCurrentFile = useCallback((file: MarkdownFile | null) => {
    setState((prev) => ({ ...prev, currentFile: file }));
  }, []);

  const updateCurrentFileContent = useCallback((content: string) => {
    setState((prev) => {
      if (!prev.currentFile) return prev;

      const updatedFile = { ...prev.currentFile, content };

      // Optimization: Only update currentFile state, delay updating files list
      // The shared 'files' list will be updated when saving happens
      return {
        ...prev,
        currentFile: updatedFile,
      };
    });
  }, []);

  const setMode = useCallback(
    (mode: EditorMode) => {
      // If user is a reader, only allow view mode
      if (state.currentFile?.role === "read" && mode !== "view") {
        toast.error("You only have read-only access to this document");
        return;
      }
      setState((prev) => ({ ...prev, mode }));
    },
    [state.currentFile?.role]
  );

  const setTheme = useCallback((theme: "light" | "dark") => {
    setState((prev) => ({ ...prev, theme }));
    localStorage.setItem("mdgo-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  const addFile = useCallback(
    async (file: MarkdownFile) => {
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
    },
    [isAuthenticated]
  );

  const removeFile = useCallback(
    async (fileId: string) => {
      if (isAuthenticated) {
        try {
          const fileToDelete = state.files.find((f) => f.id === fileId);
          if (fileToDelete?._id) {
            await api.delete(`/documents/${fileToDelete._id}`);
            setState((prev) => {
              const updatedFiles = prev.files.filter((f) => f.id !== fileId);
              const newCurrentFile =
                prev.currentFile?.id === fileId ? null : prev.currentFile;

              // If the current file was deleted, redirect to the home page
              if (prev.currentFile?.id === fileId) {
                router.push("/doc");
              }

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
            prev.currentFile?.id === fileId ? null : prev.currentFile;

          return {
            ...prev,
            files: updatedFiles,
            currentFile: newCurrentFile,
          };
        });
      }
    },
    [isAuthenticated, router, state.files]
  );

  const saveCurrentFile = useCallback(async () => {
    const currentState = stateRef.current;
    if (!currentState.currentFile) return;

    setState((prev) => ({ ...prev, isSaving: true }));

    // Always mirror to LocalStorage (fail-safe for accidental closure)
    saveFiles(currentState.files);

    if (isAuthenticated && currentState.currentFile._id) {
      try {
        await api.put(`/documents/${currentState.currentFile._id}`, {
          title: currentState.currentFile.name,
          content: currentState.currentFile.content,
        });
        // Success: no toast anymore, handled by indicator
      } catch (error) {
        console.error("Failed to sync changes to cloud", error);
        // Error: we still keep the local copy safe
      } finally {
        setState((prev) => ({ ...prev, isSaving: false }));
      }
    } else {
      // Already saved to LocalStorage above
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  }, [isAuthenticated]);

  // Debounced Autosave Effect
  useEffect(() => {
    if (!state.currentFile) return;

    const timer = setTimeout(() => {
      saveCurrentFile();
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [state.currentFile?.content, saveCurrentFile]);

  const updateDocumentSharing = useCallback(
    async (
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
    },
    [isAuthenticated]
  );

  const contextValue = useMemo(
    () => ({
      ...state,
      isFilesLoaded,
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
      sidebarOpen,
      setSidebarOpen,
    }),
    [
      state,
      isFilesLoaded,
      setCurrentFile,
      updateCurrentFileContent,
      setMode,
      setTheme,
      addFile,
      removeFile,
      saveCurrentFile,
      refreshFiles,
      selectDocumentById,
      selectDocumentById,
      updateDocumentSharing,
      sidebarOpen,
    ]
  );

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

  // Load files (either from Local Storage or Backend)
  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthenticated) {
      loadBackendFiles();
    } else {
      loadLocalFiles();
    }
  }, [isAuthenticated, isAuthLoading, loadBackendFiles, loadLocalFiles]);

  return (
    <EditorContext.Provider value={contextValue}>
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
