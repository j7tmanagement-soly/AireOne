import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, canManageUsers } from "@/lib/auth";
import { ok, err, unauthorized, forbidden, notFound } from "@/lib/api";
import { audit } from "@/lib/audit";
import { Role } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  employeeId: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!canManageUsers(session.role) && session.id !== params.id) return forbidden();

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, username: true, fullName: true, employeeId: true,
      role: true, department: true, isActive: true,
      createdAt: true, lastLoginAt: true, avatar: true,
    },
  });

  if (!user) return notFound("User");
  return ok(user);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!canManageUsers(session.role)) return forbidden();

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing) return notFound("User");

  const { password, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (password) updateData.passwordHash = await hashPassword(password);

  const user = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: {
      id: true, username: true, fullName: true, role: true,
      department: true, isActive: true,
    },
  });

  await audit({
    userId: session.id,
    action: "UPDATE_USER",
    entityType: "User",
    entityId: params.id,
    oldData: existing,
    newData: rest,
  });

  return ok(user);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!canManageUsers(session.role)) return forbidden();

  // Soft delete — just deactivate
  await prisma.user.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  await audit({
    userId: session.id,
    action: "DEACTIVATE_USER",
    entityType: "User",
    entityId: params.id,
  });

  return ok({ message: "User deactivated" });
}
