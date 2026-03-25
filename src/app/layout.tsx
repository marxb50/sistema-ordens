import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sistema de Ordens | Cadastramento.tech",
  description:
    "Sistema de Gerenciamento de Ordens de Roçagem e Capinação Urbana",
  keywords: ["ordens", "roçagem", "capinação", "gestão", "serviços"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
