import { Inter } from 'next/font/google';
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "TWICE CRM Agent",
  description: "AI Growth Agent powered by Shopper Twins",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-brand-bg text-brand-primary min-h-screen antialiased`}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
