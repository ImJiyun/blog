import type { Metadata } from "next";
import "pretendard/dist/web/static/pretendard.css";
import "./globals.css";
import { plexMono } from "./fonts";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "jiyun.dev",
  description:
    "A personal blog whose own usage data feeds a BI/analytics practice.",
};

const themeInitScript = `
  (function () {
    try {
      var theme = localStorage.getItem("theme");
      if (theme === "dark" || theme === "light") {
        document.documentElement.setAttribute("data-theme", theme);
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={plexMono.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Nav />
        {children}
      </body>
    </html>
  );
}
