import type { Metadata } from "next";
import { DotGothic16, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dotGothic = DotGothic16({
  variable: "--font-dot-gothic",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Minecraft シミュレーター",
    template: "%s | Minecraft シミュレーター",
  },
  description: "Minecraft の各種計算ツール集",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${dotGothic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
