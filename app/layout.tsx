import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bonava Apartment Scraper",
  description: "View and filter Bonava apartments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
