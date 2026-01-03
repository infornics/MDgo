"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEFAULT_SHORTCUTS } from "@/lib/keyboard-shortcuts";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {DEFAULT_SHORTCUTS.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.ctrlKey && (
                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                    Ctrl
                  </kbd>
                )}
                {shortcut.shiftKey && (
                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                    Shift
                  </kbd>
                )}
                {shortcut.altKey && (
                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                    Alt
                  </kbd>
                )}
                <span className="text-muted-foreground mx-1">+</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border uppercase">
                  {shortcut.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
