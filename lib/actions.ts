"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionState } from "@/lib/form-state";
import { saveContactSubmission, saveGuestbookEntry } from "@/lib/storage";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters.")
});

const guestbookSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  message: z.string().min(6, "Comment must be at least 6 characters.")
});

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContactAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: getFieldValue(formData, "name"),
    email: getFieldValue(formData, "email"),
    message: getFieldValue(formData, "message")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Unable to send your message."
    };
  }

  await saveContactSubmission({
    ...parsed.data,
    submittedAt: new Date().toISOString()
  });

  return {
    status: "success",
    message: "Message saved. Connect this action to email or a database for production."
  };
}

export async function submitGuestbookAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = guestbookSchema.safeParse({
    name: getFieldValue(formData, "name"),
    message: getFieldValue(formData, "message")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Unable to save your note."
    };
  }

  await saveGuestbookEntry({
    ...parsed.data,
    createdAt: new Date().toISOString(),
    approved: true
  });

  revalidatePath("/guestbook");

  return {
    status: "success",
    message: "Your note is now visible in the guestbook."
  };
}
