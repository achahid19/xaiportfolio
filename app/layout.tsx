import type { Metadata } from "next";

import { AmbientNetwork } from "@/components/ambient-network";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-portfolio.vercel.app"
  ),
  title: {
    default: "AI Agent Builder Portfolio",
    template: "%s | AI Agent Builder Portfolio"
  },
  description:
    "Personal portfolio for a junior software engineer specializing in AI agents, workflow automation, and n8n systems.",
  openGraph: {
    title: "AI Agent Builder Portfolio",
    description:
      "A bold portfolio about shipping AI agents, automation systems, and thoughtful product experiments.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agent Builder Portfolio",
    description:
      "A bold portfolio about shipping AI agents, automation systems, and thoughtful product experiments."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
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
        <div className="site-shell">
          <AmbientNetwork />
          <SiteHeader />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
