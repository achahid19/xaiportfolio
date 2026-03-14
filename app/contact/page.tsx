import { ContactForm } from "@/components/contact-form";
import { profile } from "@/lib/site-data";

export const metadata = {
  title: "Contact"
};

export default function ContactPage() {
  return (
    <section className="section page-hero">
      <div className="container split-grid">
        <article className="panel">
          <span className="eyebrow">Contact</span>
          <h1 className="section-title">Start with the problem you want to solve</h1>
          <p className="section-copy">
            This form is meant for collaboration, freelance ideas, and AI or
            automation questions.
          </p>
          <div className="divider" />
          <p className="muted">Current base: {profile.location}</p>
          <div className="social-links">
            {profile.socialLinks.map((link) => (
              <a key={link.label} className="button button--secondary" href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </article>

        <article className="form-card">
          <h2>Send a direct message</h2>
          <ContactForm />
        </article>
      </div>
    </section>
  );
}
