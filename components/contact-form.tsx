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
    <form action={formAction} className="form-grid">
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" placeholder="Your name" required />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="name@example.com"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          placeholder="Tell me what you want to build, automate, or improve."
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
      <SubmitButton
        idleLabel="Send message"
        pendingLabel="Sending message..."
      />
    </form>
  );
}
