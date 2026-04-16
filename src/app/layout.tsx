import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deepwork Mind",
  description: "Intelligence hub for coding agents — Memories, Skills, Workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
