import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, canCreateContent } from "@/lib/auth";
import { ok, err, unauthorized, forbidden } from "@/lib/api";
import { audit } from "@/lib/audit";
import { ContentStatus, ContentType } from "@prisma/client";

// GET /api/articles
// Query params: categoryId, status, type, search, take, skip
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const status = (searchParams.get("status") as ContentStatus) ?? "PUBLISHED";
  const type = (searchParams.get("type") as ContentType) ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const take = Math.min(parseInt(searchParams.get("take") ?? "20"), 100);
  const skip = parseInt(searchParams.get("skip") ?? "0");

  // Non-admins can only see published content
  const isAdmin = ["ADMIN", "MANAGER"].includes(session.role);
  const statusFilter: ContentStatus = isAdmin && status ? status : "PUBLISHED";

  const articles = await prisma.article.findMany({
    where: {
      ...(categoryId && { categoryId }),
      status: statusFilter,
      ...(type && { contentType: type }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
          { tags: { has: search } },
        ],
      }),
    },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    include: {
      category: { select: { id: true, name: true, slug: true, dept: true } },
      author: { select: { id: true, fullName: true } },
      _count: { select: { readRecords: true } },
    },
  });

  const total = await prisma.article.count({
    where: {
      ...(categoryId && { categoryId }),
      status: statusFilter,
      ...(type && { contentType: type }),
    },
  });

  return ok({ articles, total, take, skip });
}

// POST /api/articles
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();
  if (!canCreateContent(session.role)) return forbidden();

  let body: {
    title: string;
    content: string;
    categoryId: string;
    contentType?: ContentType;
    status?: ContentStatus;
    requiresAck?: boolean;
    tags?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body");
  }

  const { title, content, categoryId, contentType, status, requiresAck, tags } = body;

  if (!title?.trim()) return err("Title is required");
  if (!content?.trim()) return err("Content is required");
  if (!categoryId) return err("Category is required");

  // Validate category exists
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return err("Category not found", 404);

  // Generate slug from title
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Ensure slug is unique
  const existing = await prisma.article.count({ where: { slug: { startsWith: baseSlug } } });
  const slug = existing > 0 ? `${baseSlug}-${Date.now()}` : baseSlug;

  const publishedAt =
    status === "PUBLISHED" || status === undefined ? new Date() : null;

  const article = await prisma.article.create({
    data: {
      title: title.trim(),
      slug,
      content: content.trim(),
      categoryId,
      authorId: session.id,
      contentType: contentType ?? "ARTICLE",
      status: status ?? "PUBLISHED",
      requiresAck: requiresAck ?? false,
      tags: tags ?? [],
      publishedAt,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, fullName: true } },
    },
  });

  await audit({
    userId: session.id,
    action: "ARTICLE_CREATED",
    entityType: "article",
    entityId: article.id,
    newData: { title: article.title, categoryId, status: article.status },
  });

  return ok(article, 201);
}
