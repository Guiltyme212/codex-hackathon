import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Factory — one website, a full content system",
  description:
    "Turn your app website into a brand-aware content engine for carousels, videos, and campaigns.",
};

export const viewport: Viewport = {
  themeColor: "#f4f0e8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
