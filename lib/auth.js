import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "alnas_closet_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "change-this-password";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-only-change-this-secret";
}

function safeEqual(a, b) {
  const aBuffer = Buffer.from(String(a));
  const bBuffer = Buffer.from(String(b));

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function signPayload(payload) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function validateAdminCredentials(username, password) {
  return safeEqual(username, getAdminUsername()) && safeEqual(password, getAdminPassword());
}

export function createAdminToken() {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `admin:${expiresAt}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expectedSignature = signPayload(payload);

  if (!safeEqual(signature, expectedSignature)) return false;

  const [, expiresAtRaw] = payload.split(":");
  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt)) return false;

  return Date.now() < expiresAt;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return { ok: false, status: 401, message: "Admin login required." };
  }
  return { ok: true };
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000
  };
}
