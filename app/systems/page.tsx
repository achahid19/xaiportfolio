import type { Metadata } from "next";

import { systems } from "@/lib/site-data";
import { SystemsGrid } from "@/components/systems-grid";

export const metadata: Metadata = {
  title: "Systems",
  description: "A catalog of automation systems and AI agents I've built — filterable by tool and business function."
};

export default function SystemsPage() {
  return (
    <section className="section page-hero">
      <div className="container">
        <div className="page-intro">
          <span className="eyebrow">Systems library</span>
          <h1 className="section-title">What I&apos;ve built</h1>
          <p className="muted" style={{ maxWidth: "52ch", marginTop: "0.5rem" }}>
            <strong>{systems.length} systems</strong> built and documented — each one solving a real business problem.
            Filter by tool or function to find what&apos;s relevant to you.
          </p>
        </div>

        <SystemsGrid systems={systems} />
      </div>
    </section>
  );
}
