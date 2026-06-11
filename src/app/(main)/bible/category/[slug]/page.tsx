import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ArticleViewer from "@/components/content/ArticleViewer";
import AckForm from "@/components/content/AckForm";
import AdminArticleActions from "@/components/content/AdminArticleActions";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    select: { title: true },
  });
  return { title: article ? `${article.title} | HVAC Ops` : "Article | HVAC Ops" };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const admin = isAdmin(session.role);

  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      category: { select: { id: true, name: true, slug: true, dept: true } },
      author: { select: { id: true, fullName: true } },
      attachments: true,
      _count: { select: { readRecords: true } },
    },
  });

  if (!article) notFound();
  if (!admin && article.status !== "PUBLISHED") notFound();

  // Increment view count + upsert read record (server-side)
  await Promise.all([
    prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    }),
    prisma.readRecord.upsert({
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
    }),
  ]);

  // Check if user has already acknowledged this article
  const hasAcked = article.requiresAck
    ? !!(await prisma.acknowledgement.findUnique({
        where: {
          userId_contentType_contentId: {
            userId: session.id,
            contentType: "ARTICLE",
            contentId: article.id,
          },
        },
      }))
    : false;

  // Get neighbouring articles from same category for navigation
  const siblingArticles = await prisma.article.findMany({
    where: {
      categoryId: article.categoryId,
      status: "PUBLISHED",
      id: { not: article.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: { id: true, title: true, slug: true, contentType: true },
  });

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/bible" className="hover:text-brand-600 transition-colors">
          Company Bible
        </Link>
        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link
          href={`/bible/category/${article.category.slug}`}
          className="hover:text-brand-600 transition-colors"
        >
          {article.category.name}
        </Link>
        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-900 font-medium truncate max-w-48">{article.title}</span>
      </nav>

      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Draft warning */}
          {admin && article.status === "DRAFT" && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              <strong>Draft</strong> — this article is not visible to employees yet
            </div>
          )}

          <ArticleViewer
            article={article}
            isAdmin={admin}
          />

          {/* Acknowledgement section */}
          {article.requiresAck && !admin && (
            <div className="mt-8">
              <AcknowledgementBlock
                articleId={article.id}
                articleTitle={article.title}
                userId={session.id}
                fullName={session.fullName}
                employeeId={session.employeeId ?? undefined}
                hasAcked={hasAcked}
              />
            </div>
          )}
        </div>

        {/* Sidebar: related articles (desktop only) */}
        {siblingArticles.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              More in {article.category.name}
            </h3>
            <div className="space-y-2">
              {siblingArticles.map((a) => (
                <Link
                  key={a.id}
                  href={`/bible/${a.slug}`}
                  className="block p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-sm transition-all"
                >
                  <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-snug">
                    {a.title}
                  </p>
                </Link>
              ))}
            </div>

            {admin && (
              <div className="mt-4">
                <AdminArticleActions articleId={article.id} articleSlug={article.slug} />
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

// ── Acknowledgement block ──────────────────────────────────────────────────
// Client component imported inline via a separate file below;
// for now we inline a server-rendered version with a client island.

function AcknowledgementBlock({
  articleId,
  articleTitle,
  userId,
  fullName,
  employeeId,
  hasAcked,
}: {
  articleId: string;
  articleTitle: string;
  userId: string;
  fullName: string;
  employeeId?: string;
  hasAcked: boolean;
}) {
  if (hasAcked) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-green-900">You have acknowledged this article</p>
          <p className="text-xs text-green-700 mt-0.5">Your signature is on record</p>
        </div>
      </div>
    );
  }

  return (
    <AckForm
      articleId={articleId}
      articleTitle={articleTitle}
      userId={userId}
      fullName={fullName}
      employeeId={employeeId}
    />
  );
}


