"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { loginAdminAction } from "@/lib/actions";
import { initialActionState } from "@/lib/form-state";
import { SubmitButton } from "@/components/submit-button";

export function AdminLoginForm() {
  const [state, formAction] = useActionState(
    loginAdminAction,
    initialActionState
  );
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  if (!isMounted) {
    return (
      <div className="admin-login-placeholder" aria-hidden="true">
        <div className="admin-login-placeholder__field" />
        <div className="admin-login-placeholder__button" />
      </div>
    );
  }

  return (
    <form action={formAction} className="form-grid">
      <div className="field">
        <label htmlFor="admin-password">Admin password</label>
        <input
          id="admin-password"
          type="password"
          name="password"
          placeholder="Enter the guestbook admin password"
          autoComplete="current-password"
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
      <SubmitButton idleLabel="Open admin" pendingLabel="Checking access..." />
    </form>
  );
}
