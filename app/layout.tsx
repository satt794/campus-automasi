import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Campus Automasi - Academic & Student Productivity Platform",
  description:
    "Solusi otomatisasi perkuliahan mahasiswa: pelacak keuangan, jadwal kuliah dengan bot notifikasi Telegram, manajemen tugas urgent, quick notes auto-save, dan penyimpanan berkas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
