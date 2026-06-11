import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "hvac-ops-dev-secret-change-in-production";
const COOKIE_NAME = "hvac_session";
const EXPIRES_IN = "24h";

export interface SessionUser {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  employeeId?: string | null;
}

export interface JWTPayload extends SessionUser {
  iat: number;
  exp: number;
}

// ── Hashing ──────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Token ────────────────────────────────────

export function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// ── Cookie ───────────────────────────────────

export async function setSessionCookie(user: SessionUser) {
  const token = signToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24h
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return {
    id: payload.id,
    username: payload.username,
    fullName: payload.fullName,
    role: payload.role,
    employeeId: payload.employeeId,
  };
}

// ── From Request (API routes) ─────────────────

export function getSessionFromRequest(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return {
    id: payload.id,
    username: payload.username,
    fullName: payload.fullName,
    role: payload.role,
    employeeId: payload.employeeId,
  };
}

// ── Permissions ───────────────────────────────

export const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.MANAGER];

export function isAdmin(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}

export function canCreateContent(role: Role): boolean {
  return isAdmin(role);
}

export function canManageUsers(role: Role): boolean {
  return role === Role.ADMIN;
}
