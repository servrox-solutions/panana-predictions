import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClientProvider } from "@/components/providers/client-provider";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Panana Predictions",
  description:
    "Panana Predictions is the pioneering decentralized prediction market on the Aptos Network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProvider>{children}</ClientProvider>
        <ToastContainer theme='dark' stacked={true} />
      </body>
    </html>
  );
}
