import {
  approveGuestbookEntryAction,
  deleteGuestbookEntryAction,
  hideGuestbookEntryAction,
  logoutAdminAction
} from "@/lib/actions";
import type { GuestbookEntry } from "@/lib/types";

const adminDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC"
});

type GuestbookAdminPanelProps = {
  entries: GuestbookEntry[];
};

export function GuestbookAdminPanel({ entries }: GuestbookAdminPanelProps) {
  const approvedCount = entries.filter((entry) => entry.approved).length;
  const hiddenCount = entries.length - approvedCount;

  return (
    <section className="admin-panel panel">
      <div className="admin-panel__header">
        <div>
          <span className="eyebrow">Guestbook admin</span>
          <h1 className="section-title">Moderate public notes</h1>
          <p className="section-copy">
            Review the latest guestbook entries, hide anything you do not want
            public, or delete notes entirely.
          </p>
        </div>
        <form action={logoutAdminAction}>
          <button type="submit" className="button button--secondary">
            Log out
          </button>
        </form>
      </div>

      <div className="admin-panel__summary">
        <div className="admin-stat">
          <span className="muted-label">Total</span>
          <strong>{entries.length}</strong>
        </div>
        <div className="admin-stat">
          <span className="muted-label">Visible</span>
          <strong>{approvedCount}</strong>
        </div>
        <div className="admin-stat">
          <span className="muted-label">Hidden</span>
          <strong>{hiddenCount}</strong>
        </div>
      </div>

      <div className="admin-entry-list">
        {entries.map((entry) => (
          <article key={entry.id} className="admin-entry">
            <div className="admin-entry__top">
              <div>
                <div className="entry-card__meta">
                  <strong>{entry.name}</strong>
                  <span>{adminDateFormatter.format(new Date(entry.createdAt))}</span>
                </div>
                <span
                  className={`admin-entry__status ${
                    entry.approved
                      ? "admin-entry__status--visible"
                      : "admin-entry__status--hidden"
                  }`}
                >
                  {entry.approved ? "Visible" : "Hidden"}
                </span>
              </div>
            </div>

            <p className="muted">{entry.message}</p>

            <div className="admin-entry__actions">
              <form
                action={
                  entry.approved
                    ? hideGuestbookEntryAction
                    : approveGuestbookEntryAction
                }
              >
                <input type="hidden" name="id" value={entry.id} />
                <button type="submit" className="button button--secondary">
                  {entry.approved ? "Hide entry" : "Approve entry"}
                </button>
              </form>

              <form action={deleteGuestbookEntryAction}>
                <input type="hidden" name="id" value={entry.id} />
                <button
                  type="submit"
                  className="button button--secondary admin-entry__delete"
                >
                  Delete entry
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
