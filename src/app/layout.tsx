import "../styles/globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ReactNode } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "QA Agent",
  description: "Frontend for QA Testing Agent",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="min-h-screen grid grid-cols-[260px_1fr]">
            <Sidebar />
            <main className="bg-gray-50 dark:bg-gray-900">
              <Topbar />
              <div className="container-app py-6">{children}</div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
