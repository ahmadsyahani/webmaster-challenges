import type { Metadata } from "next";
import "./globals.css";
import "./assessment-design.css";

export const metadata: Metadata = {
  title: "PensMate Logic Assessment",
  description: "Tes seleksi RnD Webmaster — Politeknik Elektronika Negeri Surabaya",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
