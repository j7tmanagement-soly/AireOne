import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const category = await prisma.category.findUnique({
    where: { slug: params.slug, isActive: true },
  });

  if (!category) notFound();

  const admin = isAdmin(session.role);

  const articles = await prisma.article.findMany({
    where: {
      categoryId: category.id,
      status: admin ? { in: ["PUBLISHED", "DRAFT"] } : "PUBLISHED",
    },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { fullName: true } },
      _count: { select: { readRecords: true } },
    },
  });

  const published = articles.filter((a) => a.status === "PUBLISHED");
  const drafts = articles.filter((a) => a.status === "DRAFT");

  // Group published articles by contentType
  const byType: Record<string, typeof articles> = {};
  for (const a of published) {
    if (!byType[a.contentType]) byType[a.contentType] = [];
    byType[a.contentType].push(a);
  }

  const typeOrder = ["ARTICLE", "SOP", "POLICY", "INCIDENT_GUIDE"];
  const typeLabels: Record<string, string> = {
    ARTICLE: "Articles",
    SOP: "Procedures",
    POLICY: "Policies",
    INCIDENT_GUIDE: "Incident Guides",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/bible" className="hover:text-brand-600 transition-colors">
              Company Bible
            </Link>
            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-900 font-medium">{category.name}</span>
          </nav>

          <h1 className="text-2xl font-bold text-slate-900">{category.name}</h1>
          {category.description && (
            <p className="text-slate-500 mt-1">{category.description}</p>
          )}
          <p className="text-sm text-slate-400 mt-1">
            {published.length} {published.length === 1 ? "article" : "articles"}
          </p>
        </div>

        {admin && (
          <Link
            href={`/bible/new?category=${category.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Article
          </Link>
        )}
      </div>

      {/* Draft banner (admin only) */}
      {admin && drafts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{drafts.length} draft{drafts.length !== 1 ? "s" : ""}</span> in this category — only visible to admins
          </p>
        </div>
      )}

      {/* Empty state */}
      {published.length === 0 && drafts.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="font-medium">No articles yet</p>
          {admin && (
            <p className="text-sm mt-1">
              <Link href={`/bible/new?category=${category.id}`} className="text-brand-600 hover:text-brand-700 underline">
                Create the first article
              </Link>
            </p>
          )}
        </div>
      )}

      {/* Articles grouped by type */}
      {typeOrder.map((type) => {
        const items = byType[type];
        if (!items || items.length === 0) return null;
        return (
          <section key={type}>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {typeLabels[type]}
            </h2>
            <div className="space-y-2">
              {items.map((article) => (
                <ArticleRow key={article.id} article={article} isAdmin={admin} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Drafts (admin only) */}
      {admin && drafts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Drafts
          </h2>
          <div className="space-y-2 opacity-70">
            {drafts.map((article) => (
              <ArticleRow key={article.id} article={article} isAdmin={admin} isDraft />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ArticleRow({
  article,
  isAdmin,
  isDraft,
}: {
  article: {
    id: string;
    title: string;
    slug: string;
    contentType: string;
    requiresAck: boolean;
    isSample: boolean;
    viewCount: number;
    publishedAt: Date | null;
    updatedAt: Date;
    tags: string[];
    author: { fullName: string };
    _count: { readRecords: number };
  };
  isAdmin: boolean;
  isDraft?: boolean;
}) {
  const typeColor: Record<string, string> = {
    ARTICLE: "text-slate-500 bg-slate-100",
    SOP: "text-purple-600 bg-purple-50",
    POLICY: "text-blue-600 bg-blue-50",
    INCIDENT_GUIDE: "text-red-600 bg-red-50",
  };
  const typeLabel: Record<string, string> = {
    ARTICLE: "Article",
    SOP: "Procedure",
    POLICY: "Policy",
    INCIDENT_GUIDE: "Incident Guide",
  };

  return (
    <Link
      href={`/bible/${article.slug}`}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-sm transition-all group"
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-brand-50 group-hover:border-brand-200 transition-colors">
        <ContentTypeIcon type={article.contentType} />
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor[article.contentType] ?? typeColor.ARTICLE}`}>
            {typeLabel[article.contentType] ?? "Article"}
          </span>
          {article.requiresAck && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Sign required</span>
          )}
          {isDraft && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Draft</span>
          )}
          {article.isSample && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Sample</span>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-900 truncate">{article.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {article.author.fullName}
          {article.publishedAt && ` · ${formatDate(article.publishedAt)}`}
        </p>
      </div>

      {/* Stats (admin) */}
      {isAdmin && !isDraft && (
        <div className="text-right shrink-0 hidden sm:block">
          <div className="text-sm font-semibold text-slate-700">{article.viewCount}</div>
          <div className="text-xs text-slate-400">views</div>
        </div>
      )}

      {/* Arrow */}
      <svg className="w-4 h-4 text-slate-300 group-hover:text-brand-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function ContentTypeIcon({ type }: { type: string }) {
  const paths: Record<string, string> = {
    ARTICLE: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    SOP: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
    POLICY: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
    INCIDENT_GUIDE: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  };
  return (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[type] ?? paths.ARTICLE} />
    </svg>
  );
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}
