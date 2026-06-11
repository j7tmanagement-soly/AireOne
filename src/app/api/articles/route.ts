import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, canCreateContent } from "@/lib/auth";
import { ok, err, unauthorized, forbidden, notFound } from "@/lib/api";
import { audit } from "@/lib/audit";
import { ContentStatus } from "@prisma/client";

// GET /api/articles/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      category: { select: { id: true, name: true, slug: true, dept: true } },
      author: { select: { id: true, fullName: true } },
      attachments: true,
      _count: { select: { readRecords: true } },
    },
  });

  if (!article) return notFound("Article");

  const isAdmin = ["ADMIN", "MANAGER"].includes(session.role);
  if (!isAdmin && article.status !== "PUBLISHED") return notFound("Article");

  // Increment view count
  await prisma.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });

  // Upsert read record
  await prisma.readRecord.upsert({
    where: {
      userId_contentType_contentId: {
        userId: session.id,
        contentType: "ARTICLE",
        contentId: article.id,
      },
    },
    create: {
      userId: session.id,
      contentType: "ARTICLE",
      contentId: article.id,
      articleId: article.id,
    },
    update: {
      lastViewedAt: new Date(),
      viewCount: { increment: 1 },
    },
  });

  return ok(article);
}

// PATCH /api/articles/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();
  if (!canCreateContent(session.role)) return forbidden();

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return notFound("Article");

  let body: Partial<{
    title: string;
    content: string;
    categoryId: string;
    status: ContentStatus;
    requiresAck: boolean;
    tags: string[];
  }>;

  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body");
  }

  const wasPublished = article.status !== "PUBLISHED" && body.status === "PUBLISHED";

  const updated = await prisma.article.update({
    where: { id: params.id },
    data: {
      ...(body.title && { title: body.title.trim() }),
      ...(body.content && { content: body.content.trim() }),
      ...(body.categoryId && { categoryId: body.categoryId }),
      ...(body.status && { status: body.status }),
      ...(body.requiresAck !== undefined && { requiresAck: body.requiresAck }),
      ...(body.tags && { tags: body.tags }),
      ...(wasPublished && { publishedAt: new Date() }),
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, fullName: true } },
    },
  });

  await audit({
    userId: session.id,
    action: "ARTICLE_UPDATED",
    entityType: "article",
    entityId: article.id,
    oldData: { status: article.status, title: article.title },
    newData: { status: updated.status, title: updated.title },
  });

  return ok(updated);
}

// DELETE /api/articles/[id]  (archive, not hard delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();
  if (!canCreateContent(session.role)) return forbidden();

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return notFound("Article");

  await prisma.article.update({
    where: { id: params.id },
    data: { status: "ARCHIVED" },
  });

  await audit({
    userId: session.id,
    action: "ARTICLE_ARCHIVED",
    entityType: "article",
    entityId: article.id,
  });

  return ok({ archived: true });
}
