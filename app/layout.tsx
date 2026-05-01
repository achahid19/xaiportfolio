import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { ScrollReveal } from "@/components/scroll-reveal";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://aixautomation.tech"
  ),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/images/aix_logo_no_bg.png", type: "image/png" }
    ],
    apple: "/images/aix_logo_no_bg.png",
    shortcut: "/icon.svg"
  },
  title: {
    default: "Anas Chahid Ksabi | AI Agent & Workflow Automation Engineer",
    template: "%s | Anas Chahid Ksabi"
  },
  description:
    "Portfolio of Anas Chahid Ksabi, an AI Agent & Workflow Automation Engineer building practical AI systems, automation workflows, and n8n-powered products.",
  openGraph: {
    title: "Anas Chahid Ksabi | AI Agent & Workflow Automation Engineer",
    description:
      "A portfolio about shipping AI agents, workflow automation systems, and thoughtful product experiments.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Anas Chahid Ksabi | AI Agent & Workflow Automation Engineer",
    description:
      "A portfolio about shipping AI agents, workflow automation systems, and thoughtful product experiments."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrains.variable}`}
    >
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem("theme");
                  // Dark-first: default to dark unless explicitly set to light.
                  var theme = stored === "light" ? "light" : "dark";
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `
          }}
        />
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />
        <div className="site-shell" suppressHydrationWarning>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <ScrollToTop />
          <ScrollReveal />
        </div>
      </body>
    </html>
  );
}
