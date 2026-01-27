"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditor } from "@/contexts/editor-context";
import { createFile, importFile, validateFileName } from "@/lib/file-manager";
import { MarkdownFile, ProjectItem } from "@/types/editor";
import {
  ChevronDown,
  ChevronRight,
  FilePlus,
  FileText,
  Folder,
  FolderPlus,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function FileBrowser() {
  const router = useRouter();
  const {
    files,
    currentFile,
    setCurrentFile,
    addFile,
    removeFile,
    projectItems,
    currentProject,
    createFolder,
    createFileInProject,
    deleteItem,
    renameItem,
    renameFile,
  } = useEditor();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const [creatingItem, setCreatingItem] = useState<{
    parentId: string | null;
    type: "file" | "folder";
  } | null>(null);
  const [creatingName, setCreatingName] = useState("");
  const [renaming, setRenaming] = useState<{
    id: string;
    scope: "project" | "flat";
  } | null>(null);
  const [renamingName, setRenamingName] = useState("");

  const buildTree = (items: ProjectItem[]) => {
    const byParent: Record<string, ProjectItem[]> = {};
    for (const item of items) {
      const key = item.parentId || "root";
      if (!byParent[key]) byParent[key] = [];
      byParent[key].push(item);
    }
    Object.values(byParent).forEach((list) =>
      list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    );
    return byParent;
  };

  // When searching in a project: show items that match by name or are ancestors of a match
  const getVisibleIdsForSearch = (
    items: ProjectItem[],
    q: string
  ): Set<string> => {
    const matchIds = new Set<string>();
    for (const item of items) {
      if (item.name.toLowerCase().includes(q)) matchIds.add(item.id);
    }
    const visible = new Set<string>(matchIds);
    for (const id of matchIds) {
      let item = items.find((i) => i.id === id);
      while (item?.parentId) {
        visible.add(item.parentId);
        item = items.find((i) => i.id === item!.parentId);
      }
    }
    return visible;
  };

  const searchQ = searchQuery.trim().toLowerCase();
  const visibleProjectIds =
    currentProject && searchQ
      ? getVisibleIdsForSearch(projectItems, searchQ)
      : null;
  const filteredProjectItems = currentProject
    ? visibleProjectIds
      ? projectItems.filter((i) => visibleProjectIds.has(i.id))
      : projectItems
    : [];
  const projectTree = currentProject ? buildTree(filteredProjectItems) : null;

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileClick = (file: MarkdownFile) => {
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

    if (currentProject) {
      const newFile = await createFileInProject(newFileName);
      if (newFile) {
        const id = newFile._id || newFile.id;
        router.push(`/doc/${id}`);
      }
      setIsCreating(false);
      setNewFileName("");
      toast.success(`Created ${newFileName}`);
      return;
    }

    const fileData = createFile(newFileName);
    const newFile = await addFile(fileData);

    setIsCreating(false);
    setNewFileName("");
    toast.success(`Created ${fileData.name}`);

    if (newFile) {
      const id = newFile._id || newFile.id;
      router.push(`/doc/${id}`);
    }
  };

  const handleCreateFolderRoot = () => {
    if (!currentProject) {
      toast.error("Select a project to create folders");
      return;
    }
    setCreatingItem({ parentId: null, type: "folder" });
    setCreatingName("");
  };

  const handleImportFile = async () => {
    const fileData = await importFile();
    if (!fileData) return;

    if (currentProject) {
      const newFile = await createFileInProject(
        fileData.name,
        null,
        fileData.content
      );
      toast.success(`Imported ${fileData.name}`);
      if (newFile) {
        const id = newFile._id || newFile.id;
        router.push(`/doc/${id}`);
      }
      return;
    }

    const newFile = await addFile(fileData);
    toast.success(`Imported ${fileData.name}`);

    if (newFile) {
      const id = newFile._id || newFile.id;
      router.push(`/doc/${id}`);
    }
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    if (!currentProject) {
      if (files.length === 1) {
        toast.error("Cannot delete the last file");
        return;
      }

      if (currentFile?.id === fileId || currentFile?._id === fileId) {
        router.push("/doc");
      }

      removeFile(fileId);
      toast.success(`Deleted ${fileName}`);
      return;
    }

    const item = projectItems.find(
      (i) => i.documentId === currentFile?._id || i.documentId === fileId
    );
    if (item) {
      deleteItem(item.id);
      toast.success(`Deleted ${fileName}`);
    }
  };

  const handleStartCreateChild = (parentId: string, type: "file" | "folder") => {
    setCreatingItem({ parentId, type });
    setCreatingName("");
    if (type === "folder") {
      setExpandedFolders((prev) => ({ ...prev, [parentId]: true }));
    }
  };

  const handleSubmitCreate = async () => {
    if (!creatingItem) return;
    const name = creatingName.trim();
    if (!name) {
      toast.error(
        creatingItem.type === "folder"
          ? "Folder name cannot be empty"
          : "File name cannot be empty"
      );
      return;
    }

    try {
      if (creatingItem.type === "folder") {
        await createFolder(name, creatingItem.parentId);
      } else {
        const newFile = await createFileInProject(name, creatingItem.parentId);
        if (newFile) {
          const id = newFile._id || newFile.id;
          router.push(`/doc/${id}`);
        }
      }
    } finally {
      setCreatingItem(null);
      setCreatingName("");
    }
  };

  const handleCancelCreate = () => {
    setCreatingItem(null);
    setCreatingName("");
  };

  const handleDeleteItemNode = async (item: ProjectItem) => {
    await deleteItem(item.id);
  };

  const handleStartRenameProjectItem = (item: ProjectItem) => {
    setRenaming({ id: item.id, scope: "project" });
    setRenamingName(item.name);
  };

  const handleStartRenameFlatFile = (file: MarkdownFile) => {
    setRenaming({ id: file.id, scope: "flat" });
    setRenamingName(file.name);
  };

  const handleSubmitRename = async () => {
    if (!renaming) return;
    const name = renamingName.trim();
    if (!name) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      if (renaming.scope === "project") {
        await renameItem(renaming.id, { name });
      } else {
        await renameFile(renaming.id, name);
      }
    } finally {
      setRenaming(null);
      setRenamingName("");
    }
  };

  const handleCancelRename = () => {
    setRenaming(null);
    setRenamingName("");
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Ensure folders containing the current file are expanded
  useEffect(() => {
    if (!currentProject || !currentFile || !projectItems.length) return;

    const fileItem = projectItems.find(
      (item) => item.documentId === currentFile._id
    );
    if (!fileItem) return;

    const toExpand: string[] = [];
    let parentId = fileItem.parentId;

    while (parentId) {
      toExpand.push(parentId);
      const parentItem = projectItems.find((i) => i.id === parentId);
      parentId = parentItem?.parentId ?? null;
    }

    if (!toExpand.length) return;

    setExpandedFolders((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const id of toExpand) {
        if (!next[id]) {
          next[id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [currentProject, currentFile, projectItems]);

  // When searching in a project, expand all folders that contain matches
  useEffect(() => {
    if (!currentProject || !searchQuery.trim() || !projectItems.length) return;

    const q = searchQuery.trim().toLowerCase();
    const matchIds = new Set<string>();
    for (const item of projectItems) {
      if (item.name.toLowerCase().includes(q)) matchIds.add(item.id);
    }
    const visible = new Set<string>(matchIds);
    for (const id of matchIds) {
      let item = projectItems.find((i) => i.id === id);
      while (item?.parentId) {
        visible.add(item.parentId);
        item = projectItems.find((i) => i.id === item!.parentId);
      }
    }
    const folderIds = projectItems
      .filter((i) => i.type === "folder" && visible.has(i.id))
      .map((i) => i.id);

    if (!folderIds.length) return;

    setExpandedFolders((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const id of folderIds) {
        if (!next[id]) {
          next[id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [currentProject, searchQuery, projectItems]);

  const renderTree = (parentId: string | null, depth = 0) => {
    if (!projectTree) return null;
    const nodes = projectTree[parentId || "root"] || [];
    if (!nodes.length) return null;

    return nodes.map((item) => {
      const isFile = item.type === "file";
      const file =
        isFile && item.documentId
          ? files.find((f) => f._id === item.documentId)
          : null;

      const isActive =
        !!file &&
        (currentFile?._id === file._id || currentFile?.id === file.id);

      const hasChildren = !!projectTree[item.id]?.length;
      const isExpanded = !!expandedFolders[item.id];

      return (
        <div key={item.id}>
          <div
            className={`group flex items-center gap-1 px-2 py-1.5 sm:py-1.5 rounded-md cursor-pointer transition-colors ${
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
            style={{ paddingLeft: 6 + depth * 12 }}
            onClick={() => {
              if (!isFile) {
                toggleFolder(item.id);
              } else if (isFile && file) {
                handleFileClick(file);
              }
            }}
          >
            <div className="flex items-center gap-1 shrink-0">
              {isFile ? (
                <span className="w-4" />
              ) : hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                )
              ) : (
                <span className="w-3" />
              )}
              {isFile ? (
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </div>
            {renaming &&
            renaming.scope === "project" &&
            renaming.id === item.id ? (
              <Input
                autoFocus
                value={renamingName}
                onChange={(e) => setRenamingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmitRename();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancelRename();
                  }
                }}
                className="h-7 text-xs flex-1"
              />
            ) : (
              <span className="flex-1 text-sm truncate">{item.name}</span>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isFile && (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartCreateChild(item.id, "file");
                      }}
                    >
                      <FilePlus className="h-4 w-4 mr-2" />
                      New file
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartCreateChild(item.id, "folder");
                      }}
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      New folder
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async (e) => {
                        e.stopPropagation();
                        const fileData = await importFile();
                        if (!fileData) return;
                        const newFile = await createFileInProject(
                          fileData.name,
                          item.id,
                          fileData.content
                        );
                        toast.success(`Imported ${fileData.name}`);
                        if (newFile) {
                          const id = newFile._id || newFile.id;
                          router.push(`/doc/${id}`);
                        }
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload file
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartRenameProjectItem(item);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItemNode(item);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {creatingItem &&
            creatingItem.parentId === item.id &&
            !isFile && (
              <div
                className="flex items-center gap-1 px-2 py-1.5"
                style={{ paddingLeft: 6 + (depth + 1) * 12 }}
              >
                <div className="flex items-center gap-1 shrink-0">
                  <span className="w-3" />
                  {creatingItem.type === "file" ? (
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
                <Input
                  autoFocus
                  value={creatingName}
                  onChange={(e) => setCreatingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitCreate();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      handleCancelCreate();
                    }
                  }}
                  className="h-7 text-xs"
                  placeholder={
                    creatingItem.type === "file"
                      ? "new-file.md"
                      : "New folder"
                  }
                />
              </div>
            )}
          {hasChildren && isExpanded && renderTree(item.id, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-card border-r">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Files</h2>
          <div className="flex gap-1">
            {currentProject && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-7 sm:w-7"
                onClick={handleCreateFolderRoot}
                title="New folder"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-7 sm:w-7"
              onClick={() => setIsCreating(true)}
              title="New file"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-7 sm:w-7"
              onClick={handleImportFile}
              title="Import file"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 sm:h-8 text-sm bg-muted/30"
          />
        </div>

        {/* New file input */}
        {isCreating && (
          <div className="flex flex-col sm:flex-row gap-2">
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
              className="h-9 sm:h-8 text-sm"
            />
            <Button
              size="sm"
              onClick={handleCreateFile}
              className="h-9 sm:h-8 px-3 text-xs w-full sm:w-auto"
            >
              Create
            </Button>
          </div>
        )}
      </div>

      {/* File list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1">
          {!currentProject ? (
            filteredFiles.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {searchQuery ? "No files found" : "No files yet"}
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`group flex items-center gap-2 px-3 py-2.5 sm:py-2 rounded-md cursor-pointer transition-colors ${
                    currentFile?.id === file.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => handleFileClick(file)}
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {renaming &&
                  renaming.scope === "flat" &&
                  renaming.id === file.id ? (
                    <Input
                      autoFocus
                      value={renamingName}
                      onChange={(e) => setRenamingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSubmitRename();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          handleCancelRename();
                        }
                      }}
                      className="h-7 text-xs flex-1"
                    />
                  ) : (
                    <span className="flex-1 text-sm truncate">
                      {file.name}
                    </span>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-6 sm:w-6 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRenameFlatFile(file);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
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
            )
          ) : projectItems.length === 0 && !creatingItem ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No items in this project
            </div>
          ) : searchQ && filteredProjectItems.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No files found
            </div>
          ) : (
            <>
              {creatingItem && creatingItem.parentId === null && (
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="w-3" />
                    {creatingItem.type === "file" ? (
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    autoFocus
                    value={creatingName}
                    onChange={(e) => setCreatingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmitCreate();
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        handleCancelCreate();
                      }
                    }}
                    className="h-7 text-xs"
                    placeholder={
                      creatingItem.type === "file"
                        ? "new-file.md"
                        : "New folder"
                    }
                  />
                </div>
              )}
              {renderTree(null)}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
