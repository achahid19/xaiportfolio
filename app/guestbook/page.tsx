import { GuestbookForm } from "@/components/guestbook-form";
import { listApprovedGuestbookEntries } from "@/lib/storage";

export const metadata = {
  title: "Guestbook"
};

const guestbookDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC"
});

export default async function GuestbookPage() {
  const entries = await listApprovedGuestbookEntries();

  return (
    <section className="section page-hero">
      <div className="container split-grid">
        <article className="form-card">
          <span className="eyebrow">Guestbook</span>
          <h1 className="section-title">Leave a public note</h1>
          <p className="section-copy">
            This is a simple public wall for feedback, encouragement, and
            thoughtful comments.
          </p>
          <GuestbookForm />
        </article>

        <div className="grid-1">
          {entries.map((entry) => (
            <article key={`${entry.name}-${entry.createdAt}`} className="entry-card">
              <div className="entry-card__meta">
                <strong>{entry.name}</strong>
                <span>{guestbookDateFormatter.format(new Date(entry.createdAt))}</span>
              </div>
              <p className="muted">{entry.message}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
