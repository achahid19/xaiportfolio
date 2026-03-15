import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin-login-form";
import { GuestbookAdminPanel } from "@/components/guestbook-admin-panel";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { listAllGuestbookEntries } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Guestbook Admin",
  robots: {
    index: false,
    follow: false
  }
};

export default async function GuestbookAdminPage() {
  const [configured, authenticated] = await Promise.all([
    Promise.resolve(isAdminConfigured()),
    isAdminAuthenticated()
  ]);

  if (!configured) {
    return (
      <section className="section page-hero">
        <div className="container split-grid">
          <article className="form-card">
            <span className="eyebrow">Admin</span>
            <h1 className="section-title">Guestbook admin is not configured</h1>
            <p className="section-copy">
              Add <code>ADMIN_PASSWORD</code> in your environment variables to
              enable protected guestbook moderation.
            </p>
          </article>
        </div>
      </section>
    );
  }

  if (!authenticated) {
    return (
      <section className="section page-hero">
        <div className="container split-grid">
          <article className="panel">
            <span className="eyebrow">Protected access</span>
            <h1 className="section-title">Sign in to manage guestbook entries</h1>
            <p className="section-copy">
              This admin area lets you review, hide, approve, and delete public
              notes without editing storage manually.
            </p>
          </article>

          <article className="form-card">
            <h2>Admin login</h2>
            <AdminLoginForm />
          </article>
        </div>
      </section>
    );
  }

  const entries = await listAllGuestbookEntries();

  return (
    <section className="section page-hero">
      <div className="container">
        <GuestbookAdminPanel entries={entries} />
      </div>
    </section>
  );
}
