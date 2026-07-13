import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sunny Day Photo｜自然な表情を残す出張撮影サービス",
  description:
    "プロフィール、家族写真、イベント撮影に対応する出張撮影サービス。ご希望の場所へ伺い、自然な表情とその日の空気を写真に残します。",
  keywords: ["出張撮影", "家族写真", "プロフィール撮影", "イベント撮影"],
  openGraph: {
    title: "Sunny Day Photo｜出張撮影サービス",
    description: "たいせつな一日を、いつもの笑顔のままで。",
    type: "website",
    locale: "ja_JP",
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
