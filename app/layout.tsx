import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TelegramProvider } from "@/components/providers/telegram-provider";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <TelegramProvider>{children}</TelegramProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
