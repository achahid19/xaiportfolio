"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function SubmitButton({
  idleLabel,
  pendingLabel
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className="btn btn-primary" type="submit" disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
