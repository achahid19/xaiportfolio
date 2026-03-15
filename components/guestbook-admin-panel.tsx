"use client";

import { useMemo, useState } from "react";

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
  const [visibleCount, setVisibleCount] = useState(6);
  const approvedCount = entries.filter((entry) => entry.approved).length;
  const hiddenCount = entries.length - approvedCount;
  const visibleEntries = useMemo(
    () => entries.slice(0, visibleCount),
    [entries, visibleCount]
  );
  const remainingCount = Math.max(entries.length - visibleEntries.length, 0);

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

      <div className="admin-entry-feed">
        <div className="admin-entry-feed__header">
          <h2 className="guestbook-feed__title">Latest moderation queue</h2>
          <span className="guestbook-feed__count">
            Showing {visibleEntries.length} of {entries.length}
          </span>
        </div>

        <div className="admin-entry-feed__scroll">
          <div className="admin-entry-list">
            {visibleEntries.map((entry) => (
              <article key={entry.id} className="admin-entry">
                <div className="admin-entry__top">
                  <div>
                    <div className="entry-card__meta">
                      <strong>{entry.name}</strong>
                      <span>
                        {adminDateFormatter.format(new Date(entry.createdAt))}
                      </span>
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
        </div>

        {remainingCount > 0 ? (
          <div className="admin-entry-feed__footer">
            <button
              type="button"
              className="button button--secondary guestbook-feed__button"
              onClick={() => setVisibleCount((count) => count + 6)}
            >
              Load 6 more entries
            </button>
            <p className="guestbook-feed__hint">
              {remainingCount} more {remainingCount === 1 ? "entry" : "entries"} in
              the queue.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
