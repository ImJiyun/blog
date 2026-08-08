import type { Metadata } from "next";
import { cookies } from "next/headers";
import { GoogleAnalytics } from "@next/third-parties/google";
import "pretendard/dist/web/static/pretendard.css";
import "./globals.css";
import { plexMono } from "./fonts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageViewTracker from "@/components/PageViewTracker";
import AdminLoginShortcut from "@/components/AdminLoginShortcut";
import AdminFab from "@/components/AdminFab";
import { verifyToken } from "@/lib/auth";
import { shouldEnableGA } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "hanul.dev",
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("token")?.value;
  const isAdminSession = !!token && verifyToken(token);
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gaEnabled = shouldEnableGA({
    nodeEnv: process.env.NODE_ENV,
    gaMeasurementId: gaId,
    isAdminSession,
  });

  return (
    <html lang="ko" className={plexMono.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Nav isAdmin={isAdminSession} />
        <AdminLoginShortcut isAdmin={isAdminSession} />
        <AdminFab isAdmin={isAdminSession} />
        {children}
        <Footer />
        {gaEnabled && (
          <>
            <GoogleAnalytics gaId={gaId!} />
            <PageViewTracker />
          </>
        )}
      </body>
    </html>
  );
}
