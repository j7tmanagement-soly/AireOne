import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie, SessionUser } from "@/lib/auth";
import { ok, err } from "@/lib/api";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return err("Username and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (!user || !user.isActive) {
      return err("Invalid username or password", 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return err("Invalid username or password", 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      employeeId: user.employeeId,
    };

    await setSessionCookie(sessionUser);

    await audit({
      userId: user.id,
      action: "LOGIN",
      entityType: "User",
      entityId: user.id,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return ok(sessionUser);
  } catch (e) {
    console.error("Login error:", e);
    return err("Internal server error", 500);
  }
}
