import { useEffect } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in form fields or editable content
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const eventKey = typeof e.key === "string" ? e.key.toLowerCase() : null;
      if (!eventKey) return;

      for (const shortcut of shortcuts) {
        const ctrlMatch =
          shortcut.ctrlKey === undefined || shortcut.ctrlKey === e.ctrlKey;
        const shiftMatch =
          shortcut.shiftKey === undefined || shortcut.shiftKey === e.shiftKey;
        const altMatch =
          shortcut.altKey === undefined || shortcut.altKey === e.altKey;
        const keyMatch = eventKey === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

/**
 * Default keyboard shortcuts
 */
export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, "action">[] = [
  {
    key: "s",
    ctrlKey: true,
    description: "Save current file",
  },
  {
    key: "e",
    ctrlKey: true,
    description: "Toggle edit/preview mode",
  },
  {
    key: "p",
    ctrlKey: true,
    description: "Export as PDF",
  },
  {
    key: "n",
    ctrlKey: true,
    description: "Create new file",
  },
  {
    key: "/",
    ctrlKey: true,
    description: "Show keyboard shortcuts",
  },
  {
    key: "k",
    ctrlKey: true,
    description: "Quick file search",
  },
  {
    key: "f",
    ctrlKey: true,
    description: "Focus mode (reading)",
  },
  {
    key: "Escape",
    description: "Exit focus mode",
  },
];
