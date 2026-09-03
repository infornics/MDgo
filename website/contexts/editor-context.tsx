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
import {
  EditorState,
  MarkdownFile,
  EditorMode,
  Project,
  ProjectItem,
} from "@/types/editor";
import { getFiles, saveFiles, createFile } from "@/lib/file-manager";

import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SharingData = {
  isPublic?: boolean;
  sharedWith?: {
    email: string;
    role: "read" | "edit";
  }[];
};

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
    sharingData: SharingData
  ) => Promise<void>;
  // Projects
  loadProjects: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  loadProjectItems: (projectId: string) => Promise<void>;
  createProject: (name: string, isPublic?: boolean) => Promise<Project | void>;
  createFolder: (
    name: string,
    parentId?: string | null
  ) => Promise<ProjectItem | void>;
  createFileInProject: (
    name: string,
    parentId?: string | null,
    content?: string
  ) => Promise<MarkdownFile | void>;
  renameItem: (
    itemId: string,
    updates: { name?: string; parentId?: string | null; order?: number }
  ) => Promise<ProjectItem | void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  localProjectItems: ProjectItem[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isFilesLoaded, setIsFilesLoaded] = useState(false);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [localProjectItems, setLocalProjectItems] = useState<ProjectItem[]>(
    () => {
      try {
        const s = localStorage.getItem("mdgo-local-project-items");
        if (!s) return [];
        const parsed = JSON.parse(s) as ProjectItem[];
        return parsed.map((i) => ({
          ...i,
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt),
        }));
      } catch {
        return [];
      }
    }
  );
  const [state, setState] = useState<EditorState>({
    currentFile: null,
    files: [],
    projects: [],
    currentProject: null,
    projectItems: [],
    mode: "split",
    theme: "dark",
    isSaving: false,
    isLoading: false,
    error: null,
    errorDocumentId: undefined,
    errorRequiresAuth: false,
  });

  const isCreatingRef = useRef(false);

  // Keep a ref to the latest state to avoid stale closures in callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Persist local project items when no project selected
  useEffect(() => {
    if (!state.currentProject && localProjectItems.length > 0) {
      localStorage.setItem(
        "mdgo-local-project-items",
        JSON.stringify(localProjectItems)
      );
    }
  }, [state.currentProject, localProjectItems]);

  // Sync local project items with files when no project: add items for new files, remove items for deleted files
  useEffect(() => {
    if (state.currentProject || !state.files.length) return;
    setLocalProjectItems((prev) => {
      const valid = prev.filter(
        (i) =>
          i.type !== "file" ||
          state.files.some((f) => f.id === i.documentId)
      );
      const fileIdsWithItems = new Set(
        valid.filter((i) => i.type === "file").map((i) => i.documentId)
      );
      const toAdd = state.files.filter((f) => !fileIdsWithItems.has(f.id));
      const newItems: ProjectItem[] = toAdd.map((f, i) => ({
        id: `local-file-${f.id}`,
        name: f.name,
        type: "file",
        projectId: "local",
        parentId: null,
        documentId: f.id,
        order: valid.length + i,
        createdAt: f.createdAt,
        updatedAt: f.modifiedAt,
      }));
      return [...valid, ...newItems];
    });
  }, [state.currentProject, state.files]);

  const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  interface BackendDocument {
    fileId: string;
    _id: string;
    title: string;
    contentUrl: string;
    isPublic: boolean;
    sharedWith?: {
      email: string;
      role: "read" | "edit";
    }[];
    role?: "owner" | "read" | "edit" | null;
    isOwner?: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface BackendProject {
    _id: string;
    name: string;
    owner: string;
    isPublic: boolean;
    members: {
      user: string;
      role: "owner" | "edit" | "read";
    }[];
    createdAt: string;
    updatedAt: string;
  }

  interface BackendProjectItem {
    _id: string;
    name: string;
    type: "folder" | "file";
    project: string;
    parent: string | null;
    document: string | null;
    order: number;
    createdAt: string;
    updatedAt: string;
  }

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
        response.data.map(async (doc: BackendDocument) => {
          // Fetch content from ContentUrl if needed, or assume we might want to fetch on-demand
          // For now, let's assume we fetch the content (this might be slow for many files)
          let content = "";
          try {
            const contentRes = await fetch(doc.contentUrl);
            content = await contentRes.text();
          } catch {
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

  const loadProjects = useCallback(async () => {
    try {
      const response = await api.get("/projects");
      const backendProjects = response.data as BackendProject[];

      const projects: Project[] = backendProjects.map((p) => {
        const role =
          p.members.find(
            (m) => m.user === (p.owner as unknown as string) && m.role === "owner"
          )?.role || "owner";

        return {
          id: p._id,
          _id: p._id,
          name: p.name,
          ownerId: p.owner,
          isPublic: p.isPublic,
          role,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        };
      });

      const savedId = localStorage.getItem("mdgo-current-project-id");
      setState((prev) => ({
        ...prev,
        projects,
        currentProject:
          savedId === "none"
            ? null
            : savedId
              ? projects.find((p) => p.id === savedId) ?? projects[0] ?? null
              : prev.currentProject || projects[0] || null,
      }));
    } catch (error) {
      console.error("Failed to load projects", error);
      toast.error("Failed to load projects");
    }
  }, []);

  const setCurrentProjectValue = useCallback((project: Project | null) => {
    localStorage.setItem("mdgo-current-project-id", project?.id ?? "none");
    setState((prev) => ({
      ...prev,
      currentProject: project,
      projectItems: [],
    }));
  }, []);

  const loadProjectItems = useCallback(
    async (projectId: string) => {
      try {
        const response = await api.get(`/projects/${projectId}/items`);
        const backendItems = response.data as BackendProjectItem[];

        const items: ProjectItem[] = backendItems.map((i) => ({
          id: i._id,
          _id: i._id,
          name: i.name,
          type: i.type,
          projectId: i.project,
          parentId: i.parent,
          documentId: i.document,
          order: i.order,
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt),
        }));

        setState((prev) => ({
          ...prev,
          projectItems: items,
        }));
      } catch (error) {
        console.error("Failed to load project items", error);
        toast.error("Failed to load project items");
      }
    },
    []
  );

  const selectDocumentById = useCallback(
    async (id: string) => {
      const current = stateRef.current.currentFile;
      if (current && (current._id === id || current.id === id)) {
        return;
      }

      setState((prev) => ({ ...prev, error: null }));

      // 1. Check if already loaded in the list
      const existingFile = stateRef.current.files.find(
        (f) => f._id === id || f.id === id
      );
      if (existingFile) {
        setState((prev) => ({
          ...prev,
          currentFile: existingFile,
          error: null,
          mode: existingFile.role === "read" ? "view" : prev.mode,
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
        } catch {
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
          errorDocumentId: undefined,
          errorRequiresAuth: false,
          // If role is read, force view mode
          mode: newFile.role === "read" ? "view" : prev.mode,
          // Add to files list if not there
          files: prev.files.some((f) => f._id === newFile._id)
            ? prev.files
            : [newFile, ...prev.files],
        }));
      } catch (error: unknown) {
        console.error("Error selecting document", error);
        const maybeError = error as {
          response?: { status?: number; data?: any };
        };
        const status = maybeError.response?.status;
        const errorData = maybeError.response?.data || {};
        const errorMessage =
          status === 403
            ? "Access Denied: This document is private or you don't have permission to view it."
            : status === 404
            ? "Document not found."
            : "Failed to load document.";

        if (status !== 403) {
          toast.error(errorMessage);
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          errorDocumentId: status === 403 ? id : undefined,
          errorRequiresAuth: errorData.requiresAuth || false,
          currentFile: null,
        }));
      }
    },
    [isFilesLoaded]
  );
  const needsSaveRef = useRef(false);

  const saveCurrentFile = useCallback(async () => {
    const currentState = stateRef.current;
    if (!currentState.currentFile) return;

    // If currently saving, mark as needing another save and skip
    if (currentState.isSaving) {
      needsSaveRef.current = true;
      return;
    }

    const fileToSave = currentState.currentFile;
    const updatedFiles = currentState.files.map((f) =>
      f.id === fileToSave.id ? fileToSave : f
    );

    // Sync state immediately to avoid stale data in UI or next calls
    setState((prev) => ({
      ...prev,
      isSaving: true,
      files: updatedFiles,
    }));

    // Always mirror to LocalStorage (fail-safe for accidental closure)
    saveFiles(updatedFiles);

    if (isAuthenticated) {
      if (fileToSave._id) {
        try {
          await api.put(`/documents/${fileToSave._id}`, {
            title: fileToSave.name,
            content: fileToSave.content,
          });
          // Success: no toast anymore, handled by indicator
        } catch (error: any) {
          console.error("Failed to sync changes to cloud", error);
          const msg = error.response?.data?.message || "Failed to sync to cloud";
          toast.error(msg);
        } finally {
          setState((prev) => ({ ...prev, isSaving: false }));
          // Check if we need another save
          if (needsSaveRef.current) {
            needsSaveRef.current = false;
            // Short delay to avoid immediate recursion in same tick
            setTimeout(() => saveCurrentFile(), 100);
          }
        }
      } else if (!isCreatingRef.current) {
        // Promote local file to cloud
        isCreatingRef.current = true;
        try {
          const response = await api.post("/documents", {
            title: fileToSave.name,
            content: fileToSave.content,
          });

          const newId = response.data.fileId;
          const new_Id = response.data._id;

          setState((prev) => {
            const updated: MarkdownFile[] = prev.files.map((f) =>
              f.id === fileToSave.id
                ? {
                    ...f,
                    id: newId,
                    _id: new_Id,
                    role: "owner" as const,
                    isOwner: true,
                  }
                : f
            );

            const updatedCurrentFile: MarkdownFile | null =
              prev.currentFile?.id === fileToSave.id
                ? {
                    ...prev.currentFile,
                    id: newId,
                    _id: new_Id,
                    role: "owner" as const,
                    isOwner: true,
                  }
                : prev.currentFile;

            return {
              ...prev,
              files: updated,
              currentFile: updatedCurrentFile,
              isSaving: false,
            };
          });
          
          // Also check if we need to sync the content we just uploaded again 
          // (if user typed during the POST)
          if (needsSaveRef.current) {
            needsSaveRef.current = false;
            setTimeout(() => saveCurrentFile(), 100);
          }
        } catch (error: any) {
          console.error("Failed to create document on cloud", error);
          const msg = error.response?.data?.message || "Cloud creation failed";
          toast.error(msg);
          setState((prev) => ({ ...prev, isSaving: false }));
        } finally {
          isCreatingRef.current = false;
        }
      } else {
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
    }, 1000); // 1 second debounce for better realtime feeling

    return () => clearTimeout(timer);
  }, [state.currentFile, saveCurrentFile]);


  const setCurrentFile = useCallback(async (file: MarkdownFile | null) => {
    // If there's a current file, save it before switching to prevent data loss
    if (stateRef.current.currentFile) {
      await saveCurrentFile();
    }
    setState((prev) => ({ ...prev, currentFile: file }));
  }, [saveCurrentFile]);

  // Handle beforeunload to ensure changes are synced to LocalStorage
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentState = stateRef.current;
      if (currentState.currentFile) {
        const fileToSave = currentState.currentFile;
        const updatedFiles = currentState.files.map((f) =>
          f.id === fileToSave.id ? fileToSave : f
        );
        // Synchronously save to LocalStorage (backend call won't finish anyway)
        saveFiles(updatedFiles);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const updateCurrentFileContent = useCallback((content: string) => {
    setState((prev) => {
      if (!prev.currentFile) return prev;

      const updatedFile = { 
        ...prev.currentFile, 
        content,
        modifiedAt: new Date()
      };

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
        } catch {
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

  const createProject = useCallback(
    async (name: string, isPublic?: boolean) => {
      const trimmed = name.trim();
      if (!trimmed) {
        toast.error("Project name cannot be empty");
        return;
      }

      // Authenticated: create project on backend
      if (isAuthenticated) {
        try {
          const response = await api.post("/projects", {
            name: trimmed,
            isPublic,
          });
          const p = response.data as BackendProject;

          const project: Project = {
            id: p._id,
            _id: p._id,
            name: p.name,
            ownerId: p.owner,
            isPublic: p.isPublic,
            role: "owner",
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          };

          setState((prev) => ({
            ...prev,
            projects: [...prev.projects, project],
            currentProject: prev.currentProject || project,
          }));

          return project;
        } catch {
          toast.error("Failed to create project");
        }
        return;
      }

      // Local (not authenticated): create an in-memory project
      const now = new Date();
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const project: Project = {
        id,
        name: trimmed,
        ownerId: "local",
        isPublic: !!isPublic,
        role: "owner",
        createdAt: now,
        updatedAt: now,
      };

      setState((prev) => ({
        ...prev,
        projects: [...prev.projects, project],
        currentProject: prev.currentProject || project,
      }));

      return project;
    },
    [isAuthenticated]
  );

  const createFolder = useCallback(
    async (name: string, parentId?: string | null) => {
      if (!state.currentProject) {
        const now = new Date();
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const item: ProjectItem = {
          id,
          name,
          type: "folder",
          projectId: "local",
          parentId: parentId ?? null,
          documentId: null,
          order: 0,
          createdAt: now,
          updatedAt: now,
        };
        setLocalProjectItems((prev) => [...prev, { ...item, order: prev.length }]);
        return item;
      }

      try {
        const response = await api.post(
          `/projects/${state.currentProject.id}/items`,
          {
            name,
            type: "folder",
            parentId: parentId ?? null,
          }
        );
        const i = response.data as BackendProjectItem;

        const item: ProjectItem = {
          id: i._id,
          _id: i._id,
          name: i.name,
          type: i.type,
          projectId: i.project,
          parentId: i.parent,
          documentId: i.document,
          order: i.order,
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt),
        };

        setState((prev) => ({
          ...prev,
          projectItems: [...prev.projectItems, item],
        }));

        return item;
      } catch {
        toast.error("Failed to create folder");
      }
    },
    [state.currentProject]
  );

  const createFileInProject = useCallback(
    async (name: string, parentId?: string | null, content?: string) => {
      if (!state.currentProject) {
        if (isAuthenticated) {
          return addFile(createFile(name, content ?? ""));
        }
        const localFile = createFile(name, content ?? "");
        setState((prev) => {
          const files = [...prev.files, localFile];
          saveFiles(files);
          return { ...prev, files, currentFile: localFile };
        });
        setLocalProjectItems((prev) => [
          ...prev,
          {
            id: `local-file-${localFile.id}`,
            name,
            type: "file",
            projectId: "local",
            parentId: parentId ?? null,
            documentId: localFile.id,
            order: prev.length,
            createdAt: localFile.createdAt,
            updatedAt: localFile.modifiedAt,
          },
        ]);
        return localFile;
      }

      // Authenticated: use backend-backed documents
      if (isAuthenticated) {
        try {
          const response = await api.post(
            `/projects/${state.currentProject.id}/items`,
            {
              name,
              type: "file",
              parentId: parentId ?? null,
              content: content ?? "",
            }
          );
          const i = response.data as BackendProjectItem;

          const documentResponse = await api.get(`/documents/${i.document}`);
          const doc = documentResponse.data as BackendDocument;

          let fileContent = "";
          try {
            const contentRes = await fetch(doc.contentUrl);
            fileContent = await contentRes.text();
          } catch {
            fileContent = "# Error loading content";
          }

          const file: MarkdownFile = {
            id: doc.fileId,
            _id: doc._id,
            name: doc.title,
            content: fileContent,
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
            files: [...prev.files, file],
            currentFile: file,
            projectItems: [
              ...prev.projectItems,
              {
                id: i._id,
                _id: i._id,
                name: i.name,
                type: i.type,
                projectId: i.project,
                parentId: i.parent,
                documentId: i.document,
                order: i.order,
                createdAt: new Date(i.createdAt),
                updatedAt: new Date(i.updatedAt),
              },
            ],
          }));

          return file;
        } catch {
          toast.error("Failed to create file");
        }
        return;
      }

      // Local (not authenticated): create file in local storage
      const localFile = createFile(name, content ?? "");
      setState((prev) => {
        const files = [...prev.files, localFile];
        saveFiles(files);

        const now = new Date();
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const item: ProjectItem = {
          id,
          _id: id,
          name,
          type: "file",
          projectId: prev.currentProject?.id ?? "local",
          parentId: parentId ?? null,
          documentId: localFile.id,
          order: prev.projectItems.length,
          createdAt: now,
          updatedAt: now,
        };

        return {
          ...prev,
          files,
          currentFile: localFile,
          projectItems: [...prev.projectItems, item],
        };
      });

      return localFile;
    },
    [isAuthenticated, state.currentProject]
  );

  const renameItem = useCallback(
    async (
      itemId: string,
      updates: { name?: string; parentId?: string | null; order?: number }
    ) => {
      if (!state.currentProject) {
        const item = localProjectItems.find((i) => i.id === itemId);
        if (!item) return;
        if (item.type === "file" && item.documentId && updates.name != null) {
          const target = state.files.find(
            (f) => f.id === item.documentId || f._id === item.documentId
          );
          if (target) {
            setState((prev) => {
              const updatedFiles = prev.files.map((f) =>
                f.id === target.id
                  ? { ...f, name: updates.name!, modifiedAt: new Date() }
                  : f
              );
              saveFiles(updatedFiles);
              const updatedFile = updatedFiles.find((f) => f.id === target.id);
              return {
                ...prev,
                files: updatedFiles,
                currentFile:
                  prev.currentFile?.id === target.id
                    ? (updatedFile ?? prev.currentFile)
                    : prev.currentFile,
              };
            });
          }
        }
        setLocalProjectItems((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  name: updates.name ?? i.name,
                  parentId: updates.parentId ?? i.parentId,
                  order: updates.order ?? i.order,
                  updatedAt: new Date(),
                }
              : i
          )
        );
        return;
      }

      try {
        const response = await api.patch(
          `/projects/${state.currentProject.id}/items/${itemId}`,
          updates
        );
        const i = response.data as BackendProjectItem;

        const updated: ProjectItem = {
          id: i._id,
          _id: i._id,
          name: i.name,
          type: i.type,
          projectId: i.project,
          parentId: i.parent,
          documentId: i.document,
          order: i.order,
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt),
        };

        setState((prev) => ({
          ...prev,
          projectItems: prev.projectItems.map((item) =>
            item.id === updated.id ? updated : item
          ),
          files: prev.files.map((f) => 
            (f._id === updated.documentId || f.id === updated.documentId)
              ? { ...f, name: updated.name }
              : f
          ),
        }));

        return updated;
      } catch {
        toast.error("Failed to update item");
      }
    },
    [state.currentProject, state.files, localProjectItems]
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      if (!state.currentProject) {
        const item = localProjectItems.find((i) => i.id === itemId);
        if (!item) return;
        if (item.type === "file" && item.documentId) {
          setState((prev) => {
            const nextFiles = prev.files.filter(
              (f) => f.id !== item.documentId && f._id !== item.documentId
            );
            saveFiles(nextFiles);
            return {
              ...prev,
              files: nextFiles,
              currentFile:
                prev.currentFile?.id === item.documentId ||
                prev.currentFile?._id === item.documentId
                  ? null
                  : prev.currentFile,
            };
          });
          setLocalProjectItems((prev) => prev.filter((i) => i.id !== itemId));
          return;
        }
        const collectIds = (parentId: string): string[] => {
          const children = localProjectItems.filter(
            (i) => i.parentId === parentId
          );
          return [
            parentId,
            ...children.flatMap((c) => collectIds(c.id)),
          ];
        };
        const ids = collectIds(itemId);
        const fileDocIds = localProjectItems
          .filter(
            (i) =>
              i.type === "file" &&
              i.documentId &&
              ids.includes(i.id)
          )
          .map((i) => i.documentId!);
        setState((prev) => {
          const nextFiles = prev.files.filter(
            (f) =>
              !fileDocIds.includes(f.id) &&
              !(f._id && fileDocIds.includes(f._id))
          );
          saveFiles(nextFiles);
          return {
            ...prev,
            files: nextFiles,
            currentFile:
              prev.currentFile &&
              (fileDocIds.includes(prev.currentFile.id) ||
                (!!prev.currentFile._id &&
                  fileDocIds.includes(prev.currentFile._id)))
                ? null
                : prev.currentFile,
          };
        });
        setLocalProjectItems((prev) =>
          prev.filter((i) => !ids.includes(i.id))
        );
        return;
      }

      try {
        await api.delete(
          `/projects/${state.currentProject.id}/items/${itemId}`
        );

        setState((prev) => ({
          ...prev,
          projectItems: prev.projectItems.filter((item) => item.id !== itemId),
          files: prev.files.filter(
            (file) =>
              !prev.projectItems.some(
                (item) =>
                  item.id === itemId &&
                  item.documentId &&
                  file._id === item.documentId
              )
          ),
          currentFile:
            prev.currentFile &&
            prev.projectItems.some(
              (item) =>
                item.id === itemId &&
                item.documentId &&
                prev.currentFile?._id === item.documentId
            )
              ? null
              : prev.currentFile,
        }));
      } catch {
        toast.error("Failed to delete item");
      }
    },
    [state.currentProject, localProjectItems]
  );

  const renameFile = useCallback(
    async (fileId: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) {
        toast.error("File name cannot be empty");
        return;
      }

      const target = stateRef.current.files.find((f) => f.id === fileId);
      if (!target) return;

      if (isAuthenticated && target._id) {
        try {
          await api.put(`/documents/${target._id}`, {
            title: trimmed,
          });
        } catch {
          toast.error("Failed to rename file");
          return;
        }
      }

      setState((prev) => {
        const updatedFiles = prev.files.map((f) =>
          f.id === fileId ? { ...f, name: trimmed } : f
        );
        const updatedCurrentFile =
          prev.currentFile && prev.currentFile.id === fileId
            ? { ...prev.currentFile, name: trimmed }
            : prev.currentFile;

        if (!isAuthenticated) {
          saveFiles(updatedFiles);
        }

        return {
          ...prev,
          files: updatedFiles,
          currentFile: updatedCurrentFile,
        };
      });
    },
    [isAuthenticated]
  );

  const removeFile = useCallback(
    async (fileId: string) => {
      if (isAuthenticated) {
        try {
          const fileToDelete = stateRef.current.files.find((f) => f.id === fileId);
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
        } catch {
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
    [isAuthenticated, router]
  );


  const updateDocumentSharing = useCallback(
    async (
      id: string,
      sharingData: SharingData
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
      loadProjects,
      setCurrentProject: setCurrentProjectValue,
      loadProjectItems,
      createProject,
      createFolder,
      createFileInProject,
      renameItem,
      renameFile,
      deleteItem,
      localProjectItems,
      sidebarOpen,
      setSidebarOpen,
      focusMode,
      setFocusMode,
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
      updateDocumentSharing,
      loadProjects,
      setCurrentProjectValue,
      loadProjectItems,
      createProject,
      createFolder,
      createFileInProject,
      renameItem,
      renameFile,
      deleteItem,
      localProjectItems,
      sidebarOpen,
      focusMode,
      setFocusMode,
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
