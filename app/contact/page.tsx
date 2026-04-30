import { ContactForm } from "@/components/contact-form";
import { profile } from "@/lib/site-data";

export const metadata = {
  title: "Contact"
};

export default function ContactPage() {
  const socialLinks = profile.socialLinks.filter(
    (link) =>
      !link.href.includes("your-handle") &&
      !link.href.includes("hello@example.com")
  );
  const emailLink = socialLinks.find((s) => s.label === "Email");
  const email = emailLink?.href.replace("mailto:", "") ?? "";

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow mono">Contact</div>
          <h1>
            Tell me about the workflow.
            <br />
            <span style={{ color: "var(--fg-mute)" }}>
              I&rsquo;ll reply within 24 hours.
            </span>
          </h1>
          <p>
            Bring me a real pain point — leakage in lead handling, slow triage,
            missed deadlines, manual reporting. I&rsquo;ll tell you honestly
            whether it&rsquo;s worth automating.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: "120px" }}>
        <div className="contact-grid">
          <div>
            <ContactForm />
          </div>

          <aside className="contact-aside">
            <h4 className="mono">Direct channels</h4>
            <div className="contact-meta">
              {email && (
                <div>
                  <span className="label mono">Email</span>
                  <a href={`mailto:${email}`}>{email}</a>
                </div>
              )}
              <div>
                <span className="label mono">Based in</span>
                <span className="mono" style={{ fontSize: "13px", color: "var(--fg)" }}>
                  {profile.location}
                </span>
              </div>
              <div>
                <span className="label mono">Open to</span>
                <span className="mono" style={{ fontSize: "13px", color: "var(--fg)" }}>
                  Freelance · CDI · Retainer
                </span>
              </div>
            </div>

            <h4 className="mono">Find me elsewhere</h4>
            <div className="contact-meta">
              {socialLinks
                .filter((s) => s.label !== "Email")
                .map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.label} ↗
                  </a>
                ))}
            </div>

            <h4 className="mono" style={{ marginTop: "32px" }}>
              What happens next
            </h4>
            <ol
              className="mono"
              style={{
                paddingLeft: "18px",
                fontSize: "12.5px",
                color: "var(--fg-mute)",
                lineHeight: 1.9
              }}
            >
              <li>I read every message personally.</li>
              <li>If there&rsquo;s a fit, I send back a short scoping doc.</li>
              <li>30-min call. No deck. No fluff.</li>
            </ol>
          </aside>
        </div>
      </section>
    </>
  );
}
