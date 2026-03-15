import { createHash, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "aix_admin_session";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function buildSessionValue(password: string) {
  return createHash("sha256")
    .update(`aix-admin:${password}`)
    .digest("hex");
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword());
}

export async function isAdminAuthenticated() {
  const password = getAdminPassword();

  if (!password) {
    return false;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!session) {
    return false;
  }

  const expected = buildSessionValue(password);
  const sessionBuffer = Buffer.from(session);
  const expectedBuffer = Buffer.from(expected);

  if (sessionBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(sessionBuffer, expectedBuffer);
}

export async function createAdminSession() {
  const password = getAdminPassword();

  if (!password) {
    throw new Error("Missing ADMIN_PASSWORD environment variable.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, buildSessionValue(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export function verifyAdminPassword(input: string) {
  const password = getAdminPassword();

  if (!password) {
    return false;
  }

  const inputBuffer = Buffer.from(input);
  const passwordBuffer = Buffer.from(password);

  if (inputBuffer.length !== passwordBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, passwordBuffer);
}
