import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOVOLT",
  description: "Electrical business management platform for Norca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-surface font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
