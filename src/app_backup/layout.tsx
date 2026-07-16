import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SettingsProvider } from "@/providers/SettingsProvider";
import ClientI18nProvider from "@/providers/ClientI18nProvider";

const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "TSMS",
  description: "TecVeq Salon Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} antialiased flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]`}>
        <SettingsProvider>
          <ClientI18nProvider>
            {children}
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                style: {
                  background: 'var(--color-panel)',
                  color: '#fff',
                  border: '1px solid var(--color-border)',
                }
              }} 
            />
          </ClientI18nProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
