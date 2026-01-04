"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/contexts/editor-context";
import { createFile, importFile, validateFileName } from "@/lib/file-manager";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Upload,
  Search,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function FileBrowser() {
  const router = useRouter();
  const { files, currentFile, setCurrentFile, addFile, removeFile } =
    useEditor();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileClick = (file: any) => {
    setCurrentFile(file);
    const id = file._id || file.id;
    router.push(`/doc/${id}`);
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) {
      toast.error("File name cannot be empty");
      return;
    }

    const error = validateFileName(newFileName, files);
    if (error) {
      toast.error(error);
      return;
    }

    const fileData = createFile(newFileName);
    const newFile = await addFile(fileData);

    setIsCreating(false);
    setNewFileName("");
    toast.success(`Created ${fileData.name}`);

    if (newFile) {
      const id = (newFile as any)._id || (newFile as any).id;
      router.push(`/doc/${id}`);
    }
  };

  const handleImportFile = async () => {
    const fileData = await importFile();
    if (fileData) {
      const newFile = await addFile(fileData);
      toast.success(`Imported ${fileData.name}`);

      if (newFile) {
        const id = (newFile as any)._id || (newFile as any).id;
        router.push(`/doc/${id}`);
      }
    }
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    if (files.length === 1) {
      toast.error("Cannot delete the last file");
      return;
    }

    if (currentFile?.id === fileId || currentFile?._id === fileId) {
      router.push("/doc");
    }

    removeFile(fileId);
    toast.success(`Deleted ${fileName}`);
  };

  return (
    <div className="h-full flex flex-col bg-card border-r">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Files</h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsCreating(true)}
              title="New file"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleImportFile}
              title="Import file"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* New file input */}
        {isCreating && (
          <div className="flex gap-2">
            <Input
              autoFocus
              placeholder="filename.md"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFile();
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewFileName("");
                }
              }}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              onClick={handleCreateFile}
              className="h-8 px-3 text-xs"
            >
              Create
            </Button>
          </div>
        )}
      </div>

      {/* File list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {searchQuery ? "No files found" : "No files yet"}
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  currentFile?.id === file.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => handleFileClick(file)}
              >
                <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="flex-1 text-sm truncate">{file.name}</span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id, file.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
