import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suara Fajar Deliksari — Ibadah dan Doa Pagi",
  description:
    "Siaran ibadah dan doa pagi Gereja Isa Almasih Deliksari Semarang. Multimedia GIA Deliksari.",
};

export const viewport: Viewport = {
  themeColor: "#210707",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
