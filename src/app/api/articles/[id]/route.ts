import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { ok, err, unauthorized } from "@/lib/api";
import { audit } from "@/lib/audit";
import { AckContentType } from "@prisma/client";

// GET /api/acknowledgements?contentType=ARTICLE&contentId=xxx
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const contentType = searchParams.get("contentType") as AckContentType | null;
  const contentId = searchParams.get("contentId");

  if (contentType && contentId) {
    // Check specific ack
    const ack = await prisma.acknowledgement.findUnique({
      where: {
        userId_contentType_contentId: {
          userId: session.id,
          contentType,
          contentId,
        },
      },
    });
    return ok({ acknowledged: !!ack, ack: ack ?? null });
  }

  // List all acks for this user
  const acks = await prisma.acknowledgement.findMany({
    where: { userId: session.id },
    orderBy: { acknowledgedAt: "desc" },
  });

  return ok({ acks, total: acks.length });
}

// POST /api/acknowledgements
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  let body: {
    contentType: AckContentType;
    contentId: string;
    fullName: string;
    employeeId?: string;
    signatureData: string;
    policyVersionId?: string;
    announcementId?: string;
    articleId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body");
  }

  const {
    contentType,
    contentId,
    fullName,
    employeeId,
    signatureData,
    policyVersionId,
    announcementId,
    articleId,
  } = body;

  if (!contentType) return err("contentType is required");
  if (!contentId) return err("contentId is required");
  if (!fullName?.trim()) return err("fullName is required");
  if (!signatureData) return err("signatureData is required");

  // Verify name matches user
  if (fullName.trim().toLowerCase() !== session.fullName.trim().toLowerCase()) {
    return err("Provided name does not match your account name", 422);
  }

  // Check not already acked
  const existing = await prisma.acknowledgement.findUnique({
    where: {
      userId_contentType_contentId: {
        userId: session.id,
        contentType,
        contentId,
      },
    },
  });

  if (existing) {
    return ok({ acknowledged: true, ack: existing, alreadySigned: true });
  }

  // Get request metadata for audit trail
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  const ack = await prisma.acknowledgement.create({
    data: {
      userId: session.id,
      contentType,
      contentId,
      fullName: fullName.trim(),
      employeeId: employeeId ?? session.employeeId ?? undefined,
      signatureData,
      ipAddress,
      userAgent,
      deviceInfo: userAgent,
      ...(policyVersionId && { policyVersionId }),
      ...(announcementId && { announcementId }),
    },
  });

  await audit({
    userId: session.id,
    action: "CONTENT_ACKNOWLEDGED",
    entityType: contentType.toLowerCase(),
    entityId: contentId,
    newData: {
      contentType,
      fullName,
      ipAddress,
      acknowledgedAt: ack.acknowledgedAt,
    },
  });

  return ok({ acknowledged: true, ack }, 201);
}
