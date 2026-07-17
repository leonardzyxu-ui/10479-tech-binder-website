import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team 10479 | NEXUS 2026 技术手册",
  description: "Team 10479 Powerhouse 的 NEXUS 2026 中文交互式技术手册",
  icons: {
    icon: "/binder/favicon.png",
    shortcut: "/binder/favicon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
