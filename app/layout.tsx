import type { Metadata } from "next";
import "./globals.css";
import { assetPath } from "@/lib/asset-path";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcxya09.github.io/juna/"),
  title: "JUNA · 锦屏深地核天体物理实验",
  description: "在锦屏山下 2400 米，直接测量恒星中的核反应。探索锦屏深地核天体物理实验 JUNA 的科学目标、实验装置与公开研究成果。",
  alternates: { canonical: "https://arcxya09.github.io/juna/" },
  keywords: ["JUNA", "锦屏", "核天体物理", "CJPL", "nuclear astrophysics", "underground laboratory"],
  openGraph: {
    title: "JUNA · 锦屏深地核天体物理实验",
    description: "在锦屏山约 2400 米岩层之下，探索恒星中的核反应与元素起源。",
    url: "https://arcxya09.github.io/juna/",
    siteName: "JUNA",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "https://arcxya09.github.io/juna/images/accelerator.webp", width: 1400, height: 1050, alt: "JUNA underground accelerator facility" }],
  },
  twitter: { card: "summary_large_image", title: "JUNA · 锦屏深地核天体物理实验", images: ["https://arcxya09.github.io/juna/images/accelerator.webp"] },
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
