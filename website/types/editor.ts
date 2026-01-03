export type EditorMode = "view" | "edit" | "split";

export interface MarkdownFile {
  id: string;
  _id?: string; // MongoDB ID if stored in cloud
  name: string;
  content: string;
  contentUrl?: string; // ImageKit URL if stored in cloud
  createdAt: Date;
  modifiedAt: Date;
}

export interface EditorState {
  currentFile: MarkdownFile | null;
  files: MarkdownFile[];
  mode: EditorMode;
  theme: "light" | "dark";
  isSaving: boolean;
  isLoading: boolean;
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
