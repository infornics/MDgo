import { MarkdownFile } from "@/types/editor";

const STORAGE_KEY = "mdgo-files";

/**
 * Get all files from local storage
 */
export function getFiles(): MarkdownFile[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const files = JSON.parse(stored);
    return files.map((file: any) => ({
      ...file,
      createdAt: new Date(file.createdAt),
      modifiedAt: new Date(file.modifiedAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Save files to local storage
 */
export function saveFiles(files: MarkdownFile[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

/**
 * Create a new file
 */
export function createFile(name: string, content: string = ""): MarkdownFile {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: name.endsWith(".md") ? name : `${name}.md`,
    content,
    createdAt: now,
    modifiedAt: now,
  };
}

/**
 * Update a file
 */
export function updateFile(
  files: MarkdownFile[],
  fileId: string,
  updates: Partial<MarkdownFile>
): MarkdownFile[] {
  return files.map((file) =>
    file.id === fileId ? { ...file, ...updates, modifiedAt: new Date() } : file
  );
}

/**
 * Delete a file
 */
export function deleteFile(
  files: MarkdownFile[],
  fileId: string
): MarkdownFile[] {
  return files.filter((file) => file.id !== fileId);
}

/**
 * Import file from user's system
 */
export async function importFile(): Promise<MarkdownFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.markdown,.txt";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const content = await file.text();
      const newFile = createFile(file.name, content);
      resolve(newFile);
    };

    input.click();
  });
}

/**
 * Validate file name
 */
export function validateFileName(
  name: string,
  existingFiles: MarkdownFile[]
): string | null {
  if (!name.trim()) {
    return "File name cannot be empty";
  }

  const fileName = name.endsWith(".md") ? name : `${name}.md`;

  if (existingFiles.some((file) => file.name === fileName)) {
    return "A file with this name already exists";
  }

  return null;
}
