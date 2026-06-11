import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserManagementClient from "@/components/admin/UserManagementClient";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isAdmin(session.role)) redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { fullName: "asc" },
    select: {
      id: true, username: true, fullName: true, employeeId: true,
      role: true, department: true, isActive: true,
      createdAt: true, lastLoginAt: true,
    },
  });

  return <UserManagementClient users={users} />;
}
