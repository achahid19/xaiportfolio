"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { SocialPost } from "@/lib/types";

const PLATFORM_ICONS: Record<string, string> = {
  LinkedIn: "in",
  "n8n": "n8n",
  X: "x"
};

type Props = { posts: SocialPost[] };

export function SocialFeed({ posts }: Props) {
  const [platform, setPlatform] = useState("All");
  const [challenge, setChallenge] = useState("All");

  const platforms = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.platform)))],
    [posts]
  );

  const challenges = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => { if (p.challenge) set.add(p.challenge); });
    return ["All", ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(
    () =>
      posts.filter(
        (p) =>
          (platform === "All" || p.platform === platform) &&
          (challenge === "All" || p.challenge === challenge)
      ),
    [posts, platform, challenge]
  );

  return (
    <div>
      <div className="filter-bar">
        <span className="filter-label mono">platform:</span>
        {platforms.map((p) => (
          <button
            key={p}
            type="button"
            className={`filter-pill mono${platform === p ? " active" : ""}`}
            onClick={() => setPlatform(p)}
          >
            {p}
          </button>
        ))}
        <span className="filter-count mono">
          {filtered.length} / {posts.length} posts
        </span>
      </div>

      {challenges.length > 2 && (
        <div className="filter-bar" style={{ marginTop: "-16px", paddingTop: 0, borderBottom: "none" }}>
          <span className="filter-label mono">challenge:</span>
          {challenges.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-pill mono${challenge === c ? " active" : ""}`}
              onClick={() => setChallenge(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="social-feed">
        {filtered.map((post) => (
          <Link
            key={post.id}
            href={post.href}
            target={post.href !== "#" ? "_blank" : undefined}
            rel="noreferrer"
            className="social-card"
          >
            <div className="social-card__meta">
              <span className={`social-platform mono social-platform--${post.platform.toLowerCase()}`}>
                {PLATFORM_ICONS[post.platform] ?? post.platform}
              </span>
              {post.challenge && (
                <span className="social-challenge mono">{post.challenge}</span>
              )}
              <span className="social-date mono">{post.date}</span>
            </div>

            <h3 className="social-card__title">{post.title}</h3>
            <p className="social-card__excerpt">{post.excerpt}</p>

            {post.tags && post.tags.length > 0 && (
              <div className="tools" style={{ marginTop: "auto", paddingTop: "14px" }}>
                {post.tags.map((t) => (
                  <span key={t} className="tool mono">{t}</span>
                ))}
              </div>
            )}

            <div className="social-card__cta mono">
              View post ↗
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
