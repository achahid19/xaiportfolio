"use client";

import { useMemo, useState } from "react";

import type { GuestbookEntry } from "@/lib/types";

const INITIAL_VISIBLE_COUNT = 3;
const LOAD_MORE_COUNT = 3;

const guestbookDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

type GuestbookFeedProps = {
  entries: GuestbookEntry[];
};

export function GuestbookFeed({ entries }: GuestbookFeedProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const visibleEntries = useMemo(
    () => entries.slice(0, visibleCount),
    [entries, visibleCount],
  );
  const hasMore = visibleCount < entries.length;

  return (
    <section className="guestbook-feed panel">
      <div className="guestbook-feed__header">
        <div>
          <span className="muted-label">Latest first</span>
          <h2 className="guestbook-feed__title">Recent notes</h2>
        </div>
        <span className="guestbook-feed__count">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="guestbook-feed__scroll">
        <div className="guestbook-feed__list">
          {visibleEntries.map((entry) => (
            <article
              key={entry.id}
              className="entry-card guestbook-feed__entry"
            >
              <div className="entry-card__meta">
                <strong>{entry.name}</strong>
                <span>
                  {guestbookDateFormatter.format(new Date(entry.createdAt))}
                </span>
              </div>
              <p className="muted">{entry.message}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="guestbook-feed__footer">
        {hasMore ? (
          <button
            type="button"
            className="button button--secondary guestbook-feed__button"
            onClick={() =>
              setVisibleCount((current) =>
                Math.min(current + LOAD_MORE_COUNT, entries.length),
              )
            }
          >
            Load more notes
          </button>
        ) : (
          <p className="form-hint guestbook-feed__hint">
            You are viewing the latest notes.
          </p>
        )}
      </div>
    </section>
  );
}
