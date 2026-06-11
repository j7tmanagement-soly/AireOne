import { prisma } from "./prisma";

interface AuditParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: unknown;
  newData?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export async function audit(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldData: params.oldData ? JSON.parse(JSON.stringify(params.oldData)) : undefined,
        newData: params.newData ? JSON.parse(JSON.stringify(params.newData)) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (e) {
    // Audit failures should never crash the main request
    console.error("Audit log error:", e);
  }
}
