import fs from "node:fs/promises";
import path from "node:path";

import type { ContactSubmission, GuestbookEntry } from "@/lib/types";

const dataDirectory = path.join(process.cwd(), "content", "data");
const contactFile = path.join(dataDirectory, "contact-submissions.json");
const guestbookFile = path.join(dataDirectory, "guestbook-entries.json");

const defaultGuestbookEntries: GuestbookEntry[] = [
  {
    name: "Future collaborator",
    message: "This space is ready for thoughtful notes, project ideas, and collaboration hellos.",
    createdAt: "2026-03-14T14:00:00.000Z",
    approved: true
  }
];

async function ensureDirectory() {
  await fs.mkdir(dataDirectory, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

async function writeJsonFile<T>(filePath: string, data: T) {
  await ensureDirectory();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function saveContactSubmission(entry: ContactSubmission) {
  const submissions = await readJsonFile<ContactSubmission[]>(contactFile, []);
  submissions.unshift(entry);
  await writeJsonFile(contactFile, submissions);
}

export async function listApprovedGuestbookEntries() {
  const entries = await readJsonFile<GuestbookEntry[]>(
    guestbookFile,
    defaultGuestbookEntries
  );

  return entries.filter((entry) => entry.approved);
}

export async function saveGuestbookEntry(entry: GuestbookEntry) {
  const entries = await readJsonFile<GuestbookEntry[]>(
    guestbookFile,
    defaultGuestbookEntries
  );

  entries.unshift(entry);
  await writeJsonFile(guestbookFile, entries);
}
