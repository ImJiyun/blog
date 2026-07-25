import type { Metadata } from "next";
import "pretendard/dist/web/static/pretendard.css";
import "./globals.css";
import { plexMono } from "./fonts";

export const metadata: Metadata = {
  title: "Data Learning Platform",
  description:
    "A personal blog whose own usage data feeds a BI/analytics practice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={plexMono.variable}>
      <body>{children}</body>
    </html>
  );
}
