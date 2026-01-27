import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { EditorProvider } from "@/contexts/editor-context";
import { ReactNode } from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AuthProvider>
      <EditorProvider>
       
        {children}
       
        <Toaster position="bottom-right" />
      </EditorProvider>
    </AuthProvider>
  );
}
