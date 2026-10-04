import type { Metadata } from "next";
import "./globals.css";
import { assetPath } from "@/lib/asset-path";

export const metadata: Metadata = {
  title: "JUNA · 锦屏深地核天体物理实验",
  description: "在锦屏山下 2400 米，直接测量恒星中的核反应。探索锦屏深地核天体物理实验 JUNA 的科学目标、实验装置与公开研究成果。",
  icons: {
    icon: assetPath("/favicon.svg"),
    shortcut: assetPath("/favicon.svg"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
