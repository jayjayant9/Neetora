import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEETora — Medical Entrance Prep & CBT Engine",
  description: "High-yield, distraction-free NTA NEET test simulation and question bank.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
