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
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2 sm:py-3 px-3 rounded-md hover:bg-muted/50 transition-colors gap-2 sm:gap-0"
            >
              <span className="text-sm font-medium">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.ctrlKey && (
                  <kbd className="px-1.5 py-1 text-[10px] sm:text-xs font-semibold bg-muted rounded border min-w-[32px] text-center">
                    Ctrl
                  </kbd>
                )}
                {shortcut.shiftKey && (
                  <kbd className="px-1.5 py-1 text-[10px] sm:text-xs font-semibold bg-muted rounded border min-w-[32px] text-center">
                    Shift
                  </kbd>
                )}
                {shortcut.altKey && (
                  <kbd className="px-1.5 py-1 text-[10px] sm:text-xs font-semibold bg-muted rounded border min-w-[32px] text-center">
                    Alt
                  </kbd>
                )}
                <span className="text-muted-foreground mx-0.5 text-xs">+</span>
                <kbd className="px-1.5 py-1 text-[10px] sm:text-xs font-semibold bg-muted rounded border uppercase min-w-[24px] text-center">
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
