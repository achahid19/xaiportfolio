import type { Metadata } from "next";

import { SystemsGrid } from "@/components/systems-grid";
import { systems } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Systems",
  description:
    "A catalog of automation systems and AI agents I've built — filterable by tool and business function."
};

export default function SystemsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow mono">
            Library · {systems.length} systems in production
          </div>
          <h1>
            Every workflow I&rsquo;ve shipped.
            <br />
            <span style={{ color: "var(--fg-mute)" }}>
              Filter, scan, pick the closest fit.
            </span>
          </h1>
          <p>
            Each card carries the same shape:{" "}
            <strong style={{ color: "var(--fg)" }}>problem → result → impact</strong>.
            Click to expand the impact rationale.
          </p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: "96px" }}>
        <SystemsGrid systems={systems} showFilters />
      </section>
    </>
  );
}
