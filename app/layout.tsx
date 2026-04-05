import type { Metadata } from "next";

import { AmbientNetwork } from "@/components/ambient-network";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://aixautomation.tech"
  ),
  icons: {
    icon: "/images/aix_logo_no_bg.png",
    apple: "/images/aix_logo_no_bg.png",
    shortcut: "/images/aix_logo_no_bg.png"
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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem("theme");
                  var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var theme = stored === "light" || stored === "dark"
                    ? stored
                    : (systemDark ? "dark" : "light");
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `
          }}
        />
        <div className="site-shell" suppressHydrationWarning>
          <AmbientNetwork />
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
