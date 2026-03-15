import fs from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";

import type { ContactSubmission, GuestbookEntry } from "@/lib/types";

const dataDirectory = path.join(process.cwd(), "content", "data");
const contactFile = path.join(dataDirectory, "contact-submissions.json");
const guestbookFile = path.join(dataDirectory, "guestbook-entries.json");
const contactBlobPath = "portfolio-data/contact-submissions.json";
const guestbookBlobPath = "portfolio-data/guestbook-entries.json";

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

function hasBlobStore() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readBlobJsonFile<T>(pathname: string, fallback: T) {
  const result = await get(pathname, {
    access: "private",
    useCache: false
  });

  if (!result || result.statusCode !== 200) {
    return {
      data: fallback,
      etag: undefined as string | undefined
    };
  }

  const text = await new Response(result.stream).text();

  if (!text.trim()) {
    return {
      data: fallback,
      etag: result.blob.etag
    };
  }

  return {
    data: JSON.parse(text) as T,
    etag: result.blob.etag
  };
}

async function writeBlobJsonFile<T>(
  pathname: string,
  data: T,
  etag?: string
) {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 60,
    ...(etag ? { ifMatch: etag } : {})
  });
}

async function readContactSubmissions() {
  if (!hasBlobStore()) {
    return {
      data: await readJsonFile<ContactSubmission[]>(contactFile, []),
      etag: undefined as string | undefined
    };
  }

  return readBlobJsonFile<ContactSubmission[]>(contactBlobPath, []);
}

async function writeContactSubmissions(
  submissions: ContactSubmission[],
  etag?: string
) {
  if (!hasBlobStore()) {
    await writeJsonFile(contactFile, submissions);
    return;
  }

  await writeBlobJsonFile(contactBlobPath, submissions, etag);
}

async function readGuestbookEntries() {
  if (!hasBlobStore()) {
    return {
      data: await readJsonFile<GuestbookEntry[]>(
        guestbookFile,
        defaultGuestbookEntries
      ),
      etag: undefined as string | undefined
    };
  }

  return readBlobJsonFile<GuestbookEntry[]>(
    guestbookBlobPath,
    defaultGuestbookEntries
  );
}

async function writeGuestbookEntries(entries: GuestbookEntry[], etag?: string) {
  if (!hasBlobStore()) {
    await writeJsonFile(guestbookFile, entries);
    return;
  }

  await writeBlobJsonFile(guestbookBlobPath, entries, etag);
}

export async function saveContactSubmission(entry: ContactSubmission) {
  const { data, etag } = await readContactSubmissions();
  const submissions = [...data];
  submissions.unshift(entry);
  await writeContactSubmissions(submissions, etag);
}

export async function listApprovedGuestbookEntries() {
  const { data } = await readGuestbookEntries();

  const uniqueEntries = new Map<string, GuestbookEntry>();

  for (const entry of data) {
    if (!entry.approved) {
      continue;
    }

    const dedupeKey = `${entry.name}::${entry.createdAt}::${entry.message}`;

    if (!uniqueEntries.has(dedupeKey)) {
      uniqueEntries.set(dedupeKey, entry);
    }
  }

  return Array.from(uniqueEntries.values())
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
}

export async function saveGuestbookEntry(entry: GuestbookEntry) {
  const { data, etag } = await readGuestbookEntries();
  const entries = [...data];
  entries.unshift(entry);
  await writeGuestbookEntries(entries, etag);
}
