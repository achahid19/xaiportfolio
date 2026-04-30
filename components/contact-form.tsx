"use client";

import { useActionState } from "react";

import { submitContactAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/form-state";

export function ContactForm() {
  const [state, formAction] = useActionState(
    submitContactAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="contact-form">
      <div className="field">
        <label className="mono" htmlFor="name">Name</label>
        <input id="name" name="name" placeholder="Your name" required />
      </div>
      <div className="field">
        <label className="mono" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="you@company.com"
          required
        />
      </div>
      <div className="field">
        <label className="mono" htmlFor="message">Describe the workflow / problem</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="What's slow today? What would 'fixed' look like?"
          required
        />
      </div>
      {state.message ? (
        <p
          className={`status-message ${
            state.status === "error"
              ? "status-message--error"
              : "status-message--success"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "8px" }}>
        <SubmitButton
          idleLabel="Send message →"
          pendingLabel="Sending..."
        />
        <span className="mono" style={{ fontSize: "11.5px", color: "var(--fg-dim)" }}>
          Avg. reply time · &lt; 24h
        </span>
      </div>
    </form>
  );
}
