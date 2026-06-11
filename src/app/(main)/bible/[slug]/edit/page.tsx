import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ArticleEditor from "@/components/forms/ArticleEditor";

export default async function EditArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isAdmin(session.role)) redirect(`/bible/${params.slug}`);

  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      content: true,
      categoryId: true,
      contentType: true,
      status: true,
      requiresAck: true,
      tags: true,
      slug: true,
    },
  });

  if (!article) notFound();

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, dept: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/bible" className="hover:text-brand-600 transition-colors">
            Company Bible
          </Link>
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link
            href={`/bible/${article.slug}`}
            className="hover:text-brand-600 transition-colors truncate max-w-48"
          >
            {article.title}
          </Link>
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900 font-medium">Edit</span>
        </nav>

        <h1 className="text-2xl font-bold text-slate-900">Edit Article</h1>
        <p className="text-slate-500 mt-1">Changes are published immediately</p>
      </div>

      <ArticleEditor
        categories={categories}
        article={{
          id: article.id,
          title: article.title,
          content: article.content,
          categoryId: article.categoryId,
          contentType: article.contentType,
          status: article.status,
          requiresAck: article.requiresAck,
          tags: article.tags,
        }}
      />
    </div>
  );
}
