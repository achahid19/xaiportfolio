import { GuestbookForm } from "@/components/guestbook-form";
import { GuestbookFeed } from "@/components/guestbook-feed";
import { listApprovedGuestbookEntries } from "@/lib/storage";

export const metadata = {
  title: "Guestbook"
};

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

        <GuestbookFeed entries={entries} />
      </div>
    </section>
  );
}
