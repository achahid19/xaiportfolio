import { GuestbookForm } from "@/components/guestbook-form";
import { GuestbookFeed } from "@/components/guestbook-feed";
import { listApprovedGuestbookEntries } from "@/lib/storage";

export const metadata = {
  title: "Guestbook"
};

export default async function GuestbookPage() {
  const entries = await listApprovedGuestbookEntries();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow mono">Guestbook</div>
          <h1>Leave a public note</h1>
          <p>
            A simple public wall for feedback, encouragement, and collaboration
            hellos. All notes are reviewed before appearing.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "96px" }}>
        <div className="gb-grid">
          <article className="gb-form-card">
            <GuestbookForm />
          </article>
          <GuestbookFeed entries={entries} />
        </div>
      </section>
    </>
  );
}
