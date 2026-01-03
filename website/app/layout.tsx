import type { Metadata } from "next";
import { ReactNode } from "react";

import { Outfit } from "next/font/google";
import "./globals.css";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

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
    <html lang="en">
      <body className={`${outfit.className}`}>{children}</body>
    </html>
  );
}
