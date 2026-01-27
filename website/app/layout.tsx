import type { Metadata } from "next";
import { ReactNode } from "react";

// components and containers
import { ThemeProvider } from "@/containers";

// styles
import { Outfit } from "next/font/google";
import "./globals.css";

// fonts
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// metadata
export const metadata: Metadata = {
  title: {
    default: "MDgo",
    template: "%s | MDgo",
  },
  description:
    "MDgo - View, edit, preview, convert to pdf and share your markdown files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
         
        </ThemeProvider>
      </body>
    </html>
  );
}
