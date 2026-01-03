export type EditorMode = "view" | "edit" | "split";

export interface MarkdownFile {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface EditorState {
  currentFile: MarkdownFile | null;
  files: MarkdownFile[];
  mode: EditorMode;
  theme: "light" | "dark";
  isSaving: boolean;
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
