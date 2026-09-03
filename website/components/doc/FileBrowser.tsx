"use client";

import { ProjectDialog } from "@/components/doc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useEditor } from "@/contexts/editor-context";
import { importFile, validateFileName } from "@/lib/file-manager";
import { MarkdownFile, ProjectItem } from "@/types/editor";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  FilePlus,
  FileText,
  Folder,
  FolderPlus,
  MoreVertical,
  PanelTopClose,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type TreeSortBy =
  | "default"
  | "latest"
  | "oldest"
  | "lastEdited"
  | "nameAsc"
  | "nameDesc";

const SORT_LABELS: Record<TreeSortBy, string> = {
  default: "Default",
  latest: "Latest",
  oldest: "Oldest",
  lastEdited: "Last edited",
  nameAsc: "A→Z",
  nameDesc: "Z→A",
};

function buildTree(
  items: ProjectItem[],
  sortMode: TreeSortBy = "default",
  fileList: MarkdownFile[] = []
) {
  const byParent: Record<string, ProjectItem[]> = {};
  for (const item of items) {
    const key = item.parentId || "root";
    if (!byParent[key]) byParent[key] = [];
    byParent[key].push(item);
  }
  const getModifiedTime = (item: ProjectItem) => {
    if (item.type === "file" && item.documentId) {
      const f = fileList.find(
        (x) => x._id === item.documentId || x.id === item.documentId
      );
      return f
        ? new Date(f.modifiedAt).getTime()
        : new Date(item.updatedAt).getTime();
    }
    return new Date(item.updatedAt).getTime();
  };
  const getCreatedTime = (item: ProjectItem) =>
    new Date(item.createdAt).getTime();
  const cmp =
    sortMode === "default"
      ? (a: ProjectItem, b: ProjectItem) => {
          const folderFirst =
            (a.type === "folder" ? 0 : 1) - (b.type === "folder" ? 0 : 1);
          if (folderFirst !== 0) return folderFirst;
          return a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
        }
      : sortMode === "latest"
      ? (a: ProjectItem, b: ProjectItem) =>
          getCreatedTime(b) - getCreatedTime(a)
      : sortMode === "oldest"
      ? (a: ProjectItem, b: ProjectItem) =>
          getCreatedTime(a) - getCreatedTime(b)
      : sortMode === "lastEdited"
      ? (a: ProjectItem, b: ProjectItem) =>
          getModifiedTime(b) - getModifiedTime(a)
      : sortMode === "nameAsc"
      ? (a: ProjectItem, b: ProjectItem) =>
          a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          })
      : (a: ProjectItem, b: ProjectItem) =>
          b.name.localeCompare(a.name, undefined, {
            sensitivity: "base",
          });
  Object.values(byParent).forEach((list) => list.sort(cmp));
  return byParent;
}

// When searching in a project: show items that match by name or are ancestors of a match
function getVisibleIdsForSearch(
  items: ProjectItem[],
  q: string
): Set<string> {
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
}

export default function FileBrowser() {
  const router = useRouter();
  const {
    files,
    currentFile,
    setCurrentFile,
    projectItems,
    localProjectItems,
    currentProject,
    createFolder,
    createFileInProject,
    deleteItem,
    renameItem,
    renameFile,
  } = useEditor();

  const effectiveItems = currentProject ? projectItems : localProjectItems;
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
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
  const [sortBy, setSortBy] = useState<TreeSortBy>("default");

  const searchQ = searchQuery.trim().toLowerCase();
  const visibleProjectIds = useMemo(() => {
    if (effectiveItems.length === 0 || !searchQ) return null;
    return getVisibleIdsForSearch(effectiveItems, searchQ);
  }, [effectiveItems, searchQ]);

  const filteredEffectiveItems = useMemo(() => {
    if (visibleProjectIds != null) {
      return effectiveItems.filter((i) => visibleProjectIds.has(i.id));
    }
    return effectiveItems;
  }, [effectiveItems, visibleProjectIds]);

  const projectTree = useMemo(() => {
    if (effectiveItems.length === 0) return null;
    return buildTree(filteredEffectiveItems, sortBy, files);
  }, [effectiveItems.length, filteredEffectiveItems, sortBy, files]);

  const handleCollapseAll = () => setExpandedFolders({});

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

    const newFile = await createFileInProject(newFileName, null);
    if (newFile) {
      const id = newFile._id || newFile.id;
      router.push(`/doc/${id}`);
    }
    setIsCreating(false);
    setNewFileName("");
    toast.success(`Created ${newFileName}`);
  };

  const handleCreateFolderRoot = () => {
    setCreatingItem({ parentId: null, type: "folder" });
    setCreatingName("");
  };

  const handleImportFile = async () => {
    const fileData = await importFile();
    if (!fileData) return;

    const newFile = await createFileInProject(
      fileData.name,
      null,
      fileData.content,
    );
    toast.success(`Imported ${fileData.name}`);
    if (newFile) {
      const id = newFile._id || newFile.id;
      router.push(`/doc/${id}`);
    }
  };

  const handleStartCreateChild = (
    parentId: string,
    type: "file" | "folder",
  ) => {
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
          : "File name cannot be empty",
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
    if (!currentFile || !effectiveItems.length) return;

    const fileItem = effectiveItems.find(
      (item) =>
        item.documentId === currentFile._id ||
        item.documentId === currentFile.id,
    );
    if (!fileItem) return;

    const toExpand: string[] = [];
    let parentId = fileItem.parentId;

    while (parentId) {
      toExpand.push(parentId);
      const parentItem = effectiveItems.find((i) => i.id === parentId);
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
  }, [currentFile, effectiveItems]);

  // When searching, expand all folders that contain matches
  useEffect(() => {
    if (!searchQuery.trim() || !effectiveItems.length) return;

    const q = searchQuery.trim().toLowerCase();
    const matchIds = new Set<string>();
    for (const item of effectiveItems) {
      if (item.name.toLowerCase().includes(q)) matchIds.add(item.id);
    }
    const visible = new Set<string>(matchIds);
    for (const id of matchIds) {
      let item = effectiveItems.find((i) => i.id === id);
      while (item?.parentId) {
        visible.add(item.parentId);
        item = effectiveItems.find((i) => i.id === item!.parentId);
      }
    }
    const folderIds = effectiveItems
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
  }, [searchQuery, effectiveItems]);

  const renderTree = (parentId: string | null, depth = 0) => {
    if (!projectTree) return null;
    const nodes = projectTree[parentId || "root"] || [];
    if (!nodes.length) return null;

    return nodes.map((item) => {
      const isFile = item.type === "file";
      const file =
        isFile && item.documentId
          ? files.find(
              (f) => f._id === item.documentId || f.id === item.documentId,
            )
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
            title={item.name}
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
                          fileData.content,
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
          {creatingItem && creatingItem.parentId === item.id && !isFile && (
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
                  creatingItem.type === "file" ? "new-file.md" : "New folder"
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
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs max-w-[200px] justify-between rounded-full border bg-muted/50 hover:bg-muted"
            onClick={() => setProjectDialogOpen(true)}
            title="Select or create a project"
          >
            <span className="truncate">
              {currentProject ? currentProject.name : "Select project"}
            </span>
            <ChevronDown className="h-3 w-3 ml-1 shrink-0 text-muted-foreground" />
          </Button>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-7 sm:w-7"
              onClick={handleCreateFolderRoot}
              title="New folder"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
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

        {/* Search + Collapse (project) + Sort */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 sm:h-8 text-sm bg-muted/30"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8 shrink-0"
            onClick={handleCollapseAll}
            title="Collapse all folders"
          >
            <PanelTopClose className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-8 sm:w-8 shrink-0"
                title={`Sort: ${SORT_LABELS[sortBy]}`}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem onClick={() => setSortBy("default")}>
                {sortBy === "default" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <span className="w-6 inline-block" />
                )}
                Default (folders first, A–Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("latest")}>
                {sortBy === "latest" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <span className="w-6 inline-block" />
                )}
                Latest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                {sortBy === "oldest" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <span className="w-6 inline-block" />
                )}
                Oldest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("lastEdited")}>
                {sortBy === "lastEdited" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <span className="w-6 inline-block" />
                )}
                Last edited
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("nameAsc")}>
                {sortBy === "nameAsc" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <span className="w-6 inline-block" />
                )}
                Name (A→Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("nameDesc")}>
                {sortBy === "nameDesc" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <span className="w-6 inline-block" />
                )}
                Name (Z→A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-2 space-y-1">
          {effectiveItems.length === 0 && !creatingItem ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {currentProject
                ? "No items in this project"
                : searchQuery
                  ? "No files found"
                  : "No files yet"}
            </div>
          ) : searchQ && filteredEffectiveItems.length === 0 ? (
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
      </div>
      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
      />
    </div>
  );
}
