import type { Metadata } from "next";
import { ReactNode } from "react";
import { Outfit } from "next/font/google";
import { EditorProvider } from "@/contexts/editor-context";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MDgo - Markdown Editor",
  description:
    "MDgo - View, edit, preview, convert to pdf and share your markdown files.",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <EditorProvider>
      {children}
      <Toaster position="bottom-right" />
    </EditorProvider>
  );
}
