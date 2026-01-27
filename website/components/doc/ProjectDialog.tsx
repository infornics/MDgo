"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useEditor } from "@/contexts/editor-context";
import { useState } from "react";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectDialog({
  open,
  onOpenChange,
}: ProjectDialogProps) {
  const {
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    loadProjectItems,
  } = useEditor();

  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectProject = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    setCurrentProject(project);
    await loadProjectItems(project.id);
    onOpenChange(false);
  };

  const handleContinueWithoutProject = () => {
    setCurrentProject(null);
    onOpenChange(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsCreating(true);
    try {
      const project = await createProject(newProjectName.trim());
      if (project) {
        await loadProjectItems(project.id);
        onOpenChange(false);
      }
      setNewProjectName("");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select a project</DialogTitle>
          <DialogDescription>
            Organize your markdown files into projects, or continue without one
            to use the classic flat file list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Your projects
            </p>
            <div className="max-h-56 overflow-y-auto rounded-md border bg-muted/40 p-2 space-y-1">
              {projects.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1 py-2">
                  You don&apos;t have any projects yet. Create one below.
                </p>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => handleSelectProject(project.id)}
                    className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm text-left hover:bg-accent transition-colors ${
                      currentProject?.id === project.id
                        ? "bg-accent"
                        : "bg-background/40"
                    }`}
                  >
                    <span className="truncate">{project.name}</span>
                    <span className="text-[11px] text-muted-foreground ml-2">
                      {project.role === "owner" ? "Owner" : "Collaborator"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              New project
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateProject();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
              >
                Create
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium">No project</p>
              <p className="text-[11px] text-muted-foreground">
                Keep using a single global list of files.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleContinueWithoutProject}
            >
              Continue without project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

