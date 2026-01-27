export type EditorMode = "view" | "edit" | "split";

export type ProjectRole = "owner" | "edit" | "read";

export interface MarkdownFile {
  id: string;
  _id?: string; // MongoDB ID if stored in cloud
  name: string;
  content: string;
  contentUrl?: string; // ImageKit URL if stored in cloud
  isPublic?: boolean;
  sharedWith?: {
    email: string;
    role: "read" | "edit";
  }[];
  role?: "owner" | "read" | "edit" | null;
  isOwner?: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface Project {
  id: string;
  _id?: string;
  name: string;
  ownerId: string;
  isPublic: boolean;
  role: ProjectRole;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectItemType = "folder" | "file";

export interface ProjectItem {
  id: string;
  _id?: string;
  name: string;
  type: ProjectItemType;
  projectId: string;
  parentId: string | null;
  documentId?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditorState {
  currentFile: MarkdownFile | null;
  files: MarkdownFile[];
  projects: Project[];
  currentProject: Project | null;
  projectItems: ProjectItem[];
  mode: EditorMode;
  theme: "light" | "dark";
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ExportOptions {
  format: "pdf" | "markdown" | "html";
  fileName: string;
  includeStyles?: boolean;
}

export interface PDFOptions {
  pageSize: "a4" | "letter";
  orientation: "portrait" | "landscape";
  margin: number;
}
