"use client";

import { useActionState } from "react";

import { submitGuestbookAction } from "@/lib/actions";
import { initialActionState } from "@/lib/form-state";
import { SubmitButton } from "@/components/submit-button";

export function GuestbookForm() {
  const [state, formAction] = useActionState(
    submitGuestbookAction,
    initialActionState
  );

  return (
    <form action={formAction} className="form-grid">
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="guestbook-name" name="name" placeholder="Your name" required />
      </div>
      <div className="field">
        <label htmlFor="message">Comment</label>
        <textarea
          id="guestbook-message"
          name="message"
          placeholder="Leave a short note, idea, or collaboration hello."
          required
        />
      </div>
      <p className="form-hint">
        Entries are stored with an approval flag so moderation can be added
        without changing the data shape.
      </p>
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
        idleLabel="Leave a note"
        pendingLabel="Saving note..."
      />
    </form>
  );
}
