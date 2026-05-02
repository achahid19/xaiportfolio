"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  clearAdminSession,
  createAdminSession,
  isAdminConfigured,
  isAdminAuthenticated,
  verifyAdminPassword
} from "@/lib/admin-auth";
import { sendContactEmail } from "@/lib/email";
import type { ActionState } from "@/lib/form-state";
import {
  createGuestbookEntry,
  deleteGuestbookEntry,
  saveContactSubmission,
  updateGuestbookEntryApproval
} from "@/lib/storage";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters.")
});

const guestbookSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  message: z.string().min(6, "Comment must be at least 6 characters.")
});

const adminLoginSchema = z.object({
  password: z.string().min(1, "Enter the admin password.")
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

  const submission = {
    ...parsed.data,
    submittedAt: new Date().toISOString()
  };

  try {
    await saveContactSubmission(submission);
  } catch (error) {
    console.error("Failed to save contact submission backup", error);
  }

  try {
    await sendContactEmail(submission);
  } catch (error) {
    console.error("Failed to send contact email", error);

    return {
      status: "success",
      message:
        "Your message was saved."
    };
  }

  return {
    status: "success",
    message: "Message sent successfully"
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

  try {
    await createGuestbookEntry({
      ...parsed.data,
      createdAt: new Date().toISOString(),
      approved: false
    });
  } catch (error) {
    console.error("Failed to save guestbook entry", error);

    return {
      status: "error",
      message:
        "The guestbook is not configured for production persistence yet. Connect Vercel Blob and try again."
    };
  }

  revalidatePath("/guestbook");
  revalidatePath("/admin/guestbook");

  return {
    status: "success",
    message: "Thanks! Your note is pending review and will appear once approved."
  };
}

export async function loginAdminAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = adminLoginSchema.safeParse({
    password: getFieldValue(formData, "password")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Unable to sign in."
    };
  }

  if (!isAdminConfigured()) {
    return {
      status: "error",
      message:
        "Admin access is not configured yet. Add ADMIN_PASSWORD in the environment variables."
    };
  }

  if (!verifyAdminPassword(parsed.data.password)) {
    return {
      status: "error",
      message: "Incorrect admin password."
    };
  }

  await createAdminSession();

  return {
    status: "success",
    message: "Signed in successfully. Refreshing admin access..."
  };
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/guestbook");
}

async function ensureAdminAccess() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    throw new Error("Unauthorized admin action.");
  }
}

export async function approveGuestbookEntryAction(formData: FormData) {
  await ensureAdminAccess();
  const id = getFieldValue(formData, "id");

  if (!id) {
    throw new Error("Missing guestbook entry id.");
  }

  await updateGuestbookEntryApproval(id, true);
  revalidatePath("/guestbook");
  revalidatePath("/admin/guestbook");
}

export async function hideGuestbookEntryAction(formData: FormData) {
  await ensureAdminAccess();
  const id = getFieldValue(formData, "id");

  if (!id) {
    throw new Error("Missing guestbook entry id.");
  }

  await updateGuestbookEntryApproval(id, false);
  revalidatePath("/guestbook");
  revalidatePath("/admin/guestbook");
}

export async function deleteGuestbookEntryAction(formData: FormData) {
  await ensureAdminAccess();
  const id = getFieldValue(formData, "id");

  if (!id) {
    throw new Error("Missing guestbook entry id.");
  }

  await deleteGuestbookEntry(id);
  revalidatePath("/guestbook");
  revalidatePath("/admin/guestbook");
}
